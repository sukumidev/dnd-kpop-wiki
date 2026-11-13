import fs from "node:fs/promises";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {unified} from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";

export const MAX_PUBLIC_PDF_BYTES = 25 * 1024 * 1024;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:webp|png|jpg)$/;
const PDF = /^[a-z0-9]+(?:-[a-z0-9]+)*\.pdf$/;
const parser = unified().use(remarkParse).use(remarkMdx);

export function isPublicDocument(document) {
  return document?.status === "published" && document?.visibility === "public";
}

export function validateDocumentAssetPath(reference, documentId, kind, allowShared = false) {
  if (typeof reference !== "string" || !ID.test(documentId)) throw new Error("Invalid document asset owner.");
  const prefix = kind === "pdf" ? "/handouts/" : kind === "image" ? "/img/documents/" : null;
  if (!prefix || !reference.startsWith(prefix)) throw new Error("Unsupported document asset path: " + reference);
  const parts = reference.slice(prefix.length).split("/");
  const validName = kind === "pdf" ? PDF : IMAGE;
  if (parts.length !== 2 || !ID.test(parts[0]) || (!allowShared && parts[0] !== documentId) || !validName.test(parts[1])) {
    throw new Error("Unsafe or cross-document asset path: " + reference);
  }
  return reference.slice(1);
}

function literalAttribute(node, name) {
  const attribute = node.attributes?.find((item) => item.name === name);
  if (!attribute) return undefined;
  if (typeof attribute.value !== "string") throw new Error(`Document ${name} must be a literal string.`);
  return attribute.value;
}

/** Walk MDX syntax nodes, never raw source strings, including gallery children. */
export function referencedDocumentAssets(source, documentId) {
  const images = new Set(), pdfs = new Set();
  const tree = parser.parse(source);
  function accept(reference, role) {
    if (typeof reference !== "string") return;
    if (reference.startsWith("/img/documents")) {
      if (role !== "image") throw new Error("Document image must be used as an image.");
      images.add("/" + validateDocumentAssetPath(reference, documentId, "image", true));
    } else if (reference.startsWith("/handouts")) {
      if (role !== "link") throw new Error("PDF must be linked as a document resource.");
      pdfs.add("/" + validateDocumentAssetPath(reference, documentId, "pdf", true));
    }
  }
  function visit(node) {
    if (node.type === "image") accept(node.url, "image");
    if (node.type === "link") accept(node.url, "link");
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      if (node.name === "DocumentImage") accept(literalAttribute(node, "src"), "image");
      else if (node.name === "DocumentPdf") accept(literalAttribute(node, "src"), "link");
      else {
        for (const attribute of node.attributes ?? []) {
          if (attribute.name !== "src" && attribute.name !== "href") continue;
          if (typeof attribute.value === "string" &&
              (attribute.value.startsWith("/img/documents") || attribute.value.startsWith("/handouts"))) {
            throw new Error("Document assets must use approved MDX components or Markdown links.");
          }
        }
      }
      // DocumentGallery has no path of its own; its DocumentImage children are visited.
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(tree);
  return {images, pdfs};
}

async function checkedFile(root, relative) {
  let current = root;
  for (const part of relative.split("/")) {
    current = path.join(current, part);
    const stat = await fs.lstat(current).catch((error) => {
      if (error.code === "ENOENT") throw new Error("Required document asset is missing: " + relative);
      throw error;
    });
    if (stat.isSymbolicLink()) throw new Error("Symlink document asset is forbidden: " + relative);
  }
  const stat = await fs.lstat(current);
  if (!stat.isFile()) throw new Error("Document asset is not a regular file: " + relative);
  return {source: current, stat};
}

export async function verifyPublicPdf(file, sizeLimit = MAX_PUBLIC_PDF_BYTES) {
  const stat = await fs.stat(file);
  if (stat.size > sizeLimit) throw new Error("PDF exceeds the public file size limit: " + path.basename(file));
  if (stat.size < 32) throw new Error("Invalid PDF content: " + path.basename(file));
  const handle = await fs.open(file, "r");
  try {
    const first = Buffer.alloc(Math.min(stat.size, 1024));
    const last = Buffer.alloc(Math.min(stat.size, 4096));
    await handle.read(first, 0, first.length, 0);
    await handle.read(last, 0, last.length, stat.size - last.length);
    const tail = last.toString("latin1");
    const trailer = /startxref\s+(\d+)\s+%%EOF\s*$/.exec(tail);
    if (!/^%PDF-\d\.\d\r?\n/.test(first.toString("latin1")) || !trailer) {
      throw new Error("Invalid PDF content: " + path.basename(file));
    }
    const offset = Number(trailer[1]);
    if (!Number.isSafeInteger(offset) || offset < 9 || offset >= stat.size) {
      throw new Error("Invalid PDF cross-reference offset: " + path.basename(file));
    }
    const crossReference = Buffer.alloc(Math.min(48, stat.size - offset));
    await handle.read(crossReference, 0, crossReference.length, offset);
    if (!/^(?:xref\b|\d+\s+\d+\s+obj\b)/.test(crossReference.toString("latin1"))) {
      throw new Error("Invalid PDF cross-reference: " + path.basename(file));
    }
  } finally { await handle.close(); }
}

async function copyChecked(root, stage, relative, kind, sizeLimit) {
  const {source, stat} = await checkedFile(root, "static/" + relative);
  if (stat.size > MAX_PUBLIC_PDF_BYTES) throw new Error("Document asset exceeds the public file size limit: " + relative);
  if (kind === "pdf") await verifyPublicPdf(source, sizeLimit);
  const destination = path.join(stage, "static", ...relative.split("/"));
  await fs.mkdir(path.dirname(destination), {recursive: true});
  await fs.copyFile(source, destination);
}

export function trackedPrivatePdfPaths(trackedPaths, publicIds) {
  return trackedPaths.filter((name) => {
    const normalized = name.replaceAll("\\", "/");
    if (!normalized.startsWith("static/") || !/\.pdf$/i.test(normalized)) return false;
    const match = /^static\/handouts\/([^/]+)\/([^/]+\.pdf)$/i.exec(normalized);
    return !match || !ID.test(match[1]) || !PDF.test(match[2]) || !publicIds.has(match[1]);
  });
}

function trackedStaticFiles(root) {
  const result = spawnSync("git", ["ls-files", "-z", "--cached", "--", "static"], {
    cwd: root, encoding: "utf8", windowsHide: true,
  });
  if (result.error || result.status !== 0) throw new Error("Cannot audit versioned PDFs before public build.");
  return result.stdout.split("\0").filter(Boolean);
}

/** CMS PR #15 has no PDF manifest or MDX node yet: publish only strict PDF names under public owner IDs. */
export async function publishDocumentAssets(root, stage, documents, options = {}) {
  const publicDocuments = documents.filter(isPublicDocument);
  const publicIds = new Set(publicDocuments.map((document) => document.id));
  const tracked = options.trackedPaths ?? trackedStaticFiles(root);
  const exposed = trackedPrivatePdfPaths(tracked, publicIds);
  if (exposed.length) throw new Error("Versioned PDF has an unapproved path or owner; remove it from the public repository.");
  const references = new Map();
  for (const document of publicDocuments) {
    if (!ID.test(document.id)) throw new Error("Invalid public document ID.");
    const assets = {images: new Set(), pdfs: new Set()};
    if (document.contentFormat === "mdx") {
      if (typeof document.contentPath !== "string" || !/^[a-z0-9/_-]+\.mdx$/i.test(document.contentPath) ||
          document.contentPath.split("/").includes("..")) throw new Error("Unsafe public MDX source path.");
      const relative = "src/content/documents/" + document.contentPath;
      const {source} = await checkedFile(root, relative);
      const parsed = referencedDocumentAssets(await fs.readFile(source, "utf8"), document.id);
      parsed.images.forEach((item) => assets.images.add(item));
      parsed.pdfs.forEach((item) => assets.pdfs.add(item));
    } else if (typeof document.content === "string") {
      const parsed = referencedDocumentAssets(document.content, document.id);
      parsed.images.forEach((item) => assets.images.add(item));
      parsed.pdfs.forEach((item) => assets.pdfs.add(item));
    }
    if (typeof document.imageSrc === "string" && document.imageSrc.startsWith("/img/documents/")) {
      assets.images.add("/" + validateDocumentAssetPath(document.imageSrc, document.id, "image", true));
    }
    references.set(document.id, assets);
  }
  const copied = new Set();
  for (const [documentId, assets] of references) {
    const pdfDirectory = path.join(root, "static/handouts", documentId);
    const directory = await fs.lstat(pdfDirectory).catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (directory?.isSymbolicLink()) throw new Error("Symlink PDF directory is forbidden.");
    if (directory && !directory.isDirectory()) throw new Error("PDF owner path is not a directory.");
    if (directory) {
      for (const entry of await fs.readdir(pdfDirectory, {withFileTypes: true})) {
        const reference = `/handouts/${documentId}/${entry.name}`;
        validateDocumentAssetPath(reference, documentId, "pdf");
        if (!entry.isFile()) throw new Error("Nested or symlink PDF resource is forbidden: " + reference);
        assets.pdfs.add(reference);
      }
    }
    for (const reference of assets.images) {
      const relative = validateDocumentAssetPath(reference, documentId, "image", true);
      if (!publicIds.has(relative.split("/")[2])) throw new Error("Public document references a nonpublic image owner.");
      if (!copied.has(relative)) await copyChecked(root, stage, relative, "image", options.maxPdfBytes);
      copied.add(relative);
    }
    for (const reference of assets.pdfs) {
      const relative = validateDocumentAssetPath(reference, documentId, "pdf", true);
      if (!publicIds.has(relative.split("/")[1])) throw new Error("Public document references a nonpublic PDF owner.");
      if (!copied.has(relative)) await copyChecked(root, stage, relative, "pdf", options.maxPdfBytes);
      copied.add(relative);
    }
  }
  return copied;
}
