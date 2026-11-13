import fs from "node:fs";
import {analyzeDocumentPdfMdx, validatePublicDocumentPdfFiles} from "./document-pdf-mdx";
import path from "node:path";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import {unified} from "unified";
import {
  DOCUMENT_GALLERY_COLUMNS,
  DOCUMENT_IMAGE_ALIGNMENTS,
  DOCUMENT_IMAGE_SIZES,
  isSafeDocumentImageSource,
  isSafeDocumentUrl,
} from "../src/components/documents/mdx/documentMedia";

export const DOCUMENT_CONTENT_DIRECTORY = path.join("src", "content", "documents");
export const ALLOWED_DOCUMENT_MDX_COMPONENTS = [
  "Quote",
  "Callout",
  "Spoiler",
  "DocumentImage",
  "DocumentGallery",
  "DocumentPdf",
  "Divider",
] as const;

const ALLOWED_COMPONENT_SET = new Set<string>(ALLOWED_DOCUMENT_MDX_COMPONENTS);
const ALLOWED_ATTRIBUTES: Record<(typeof ALLOWED_DOCUMENT_MDX_COMPONENTS)[number], readonly string[]> = {
  Quote: ["cite"],
  Callout: ["title", "tone", "type"],
  Spoiler: ["summary", "label"],
  DocumentImage: ["src", "alt", "caption", "title", "size", "align"],
  DocumentGallery: ["columns"],
  DocumentPdf: ["src", "title", "caption", "display"],
  Divider: ["label"],
};

export type DocumentContentFormat = "markdown" | "mdx";

export type DocumentContentRecord = {
  id?: unknown;
  status?: unknown;
  visibility?: unknown;
  documentKind?: unknown;
  content?: unknown;
  contentFormat?: unknown;
  contentPath?: unknown;
};

export type ResolvedDocumentMdxPath = {
  absolutePath: string;
  contentPath: string;
  importPath: string;
};

export function getDocumentContentFormat(document: DocumentContentRecord): DocumentContentFormat | undefined {
  if (document.contentFormat === undefined) return "markdown";
  if (document.contentFormat === "markdown" || document.contentFormat === "mdx") {
    return document.contentFormat;
  }
  return undefined;
}

export function validateDocumentContentPath(contentPath: unknown): string[] {
  if (typeof contentPath !== "string" || contentPath.trim() === "") {
    return ["contentPath is required and must be a non-empty string when contentFormat is \"mdx\"."];
  }

  if (path.isAbsolute(contentPath) || path.win32.isAbsolute(contentPath) || path.posix.isAbsolute(contentPath)) {
    return [`contentPath must be relative to ${DOCUMENT_CONTENT_DIRECTORY}; absolute paths are not allowed.`];
  }

  const segments = contentPath.split(/[\\/]+/);
  if (segments.includes("..")) {
    return ["contentPath must not contain \"..\" or traverse outside the document content directory."];
  }

  if (!contentPath.toLowerCase().endsWith(".mdx")) {
    return ["contentPath must end in .mdx."];
  }

  return [];
}

export function resolveDocumentMdxPath(
  projectRoot: string,
  contentPath: unknown,
): ResolvedDocumentMdxPath {
  const errors = validateDocumentContentPath(contentPath);
  if (errors.length > 0) throw new Error(errors.join(" "));

  const safeContentPath = contentPath as string;
  const segments = safeContentPath.split(/[\\/]+/);
  const contentRoot = path.resolve(projectRoot, DOCUMENT_CONTENT_DIRECTORY);
  const absolutePath = path.resolve(contentRoot, ...segments);
  const relativeToRoot = path.relative(contentRoot, absolutePath);

  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    throw new Error(`contentPath must stay inside ${DOCUMENT_CONTENT_DIRECTORY}.`);
  }

  const normalizedContentPath = segments.join("/");
  return {
    absolutePath,
    contentPath: normalizedContentPath,
    importPath: `@site/src/content/documents/${normalizedContentPath}`,
  };
}

type MdxNode = {
  type: string;
  name?: string | null;
  attributes?: Array<{type: string; name?: string; value?: unknown}>;
  children?: MdxNode[];
  url?: string;
};

export function validateControlledMdx(source: string): string[] {
  let tree: MdxNode;
  try {
    tree = unified().use(remarkParse).use(remarkMdx).parse(source) as MdxNode;
  } catch (error) {
    return [`Invalid narrative MDX: ${error instanceof Error ? error.message : String(error)}`];
  }

  const errors: string[] = [];
  function visit(node: MdxNode) {
    if (node.type === "mdxjsEsm") errors.push("imports and exports are not allowed in narrative MDX documents");
    if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
      errors.push("JavaScript expressions are not allowed in narrative MDX documents");
    }
    if (node.type === "link" || node.type === "image") {
      if (!isSafeDocumentUrl(node.url)) errors.push("javascript: and other unsafe URLs are not allowed in narrative MDX documents");
    }
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      const name = node.name ?? "";
      if (!ALLOWED_COMPONENT_SET.has(name)) {
        errors.push(`component <${name}> is not registered; allowed components: ${ALLOWED_DOCUMENT_MDX_COMPONENTS.join(", ")}`);
      } else {
        const fields = new Map<string, string>();
        for (const attribute of node.attributes ?? []) {
          if (attribute.type !== "mdxJsxAttribute" || typeof attribute.value !== "string") {
            errors.push(`component <${name}> only accepts literal text attributes`);
            continue;
          }
          const attributeName = attribute.name ?? "";
          if (!ALLOWED_ATTRIBUTES[name as keyof typeof ALLOWED_ATTRIBUTES].includes(attributeName) || fields.has(attributeName)) {
            errors.push(`component <${name}> has an unknown or duplicate attribute: ${attributeName}`);
          }
          fields.set(attributeName, attribute.value);
        }
        if (node.type === "mdxJsxTextElement" && (name === "DocumentImage" || name === "DocumentGallery")) {
          errors.push(`component <${name}> must be a block element`);
        }
        if (name === "DocumentImage") {
          if (!isSafeDocumentImageSource(fields.get("src"))) errors.push("DocumentImage requires a safe nonempty src");
          if (fields.has("size") && !DOCUMENT_IMAGE_SIZES.includes(fields.get("size") as never)) errors.push("DocumentImage size is invalid");
          if (fields.has("align") && !DOCUMENT_IMAGE_ALIGNMENTS.includes(fields.get("align") as never)) errors.push("DocumentImage align is invalid");
          if (node.children?.length) errors.push("DocumentImage cannot contain children");
        }
        if (name === "DocumentGallery") {
          if (!DOCUMENT_GALLERY_COLUMNS.includes(fields.get("columns") as never)) errors.push("DocumentGallery columns must be 1, 2 or 3");
          if (!node.children?.length || node.children.some((child) => child.type !== "mdxJsxFlowElement" || child.name !== "DocumentImage")) {
            errors.push("DocumentGallery must contain only DocumentImage children");
          }
        }
      }
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(tree);
  errors.push(...analyzeDocumentPdfMdx(source).errors);
  return [...new Set(errors)];


export function validateDocumentMdxFile(
  document: DocumentContentRecord,
  projectRoot = process.cwd(),
): string[] {
  const format = getDocumentContentFormat(document);
  if (format === undefined) {
    return [`contentFormat must be either \"markdown\" or \"mdx\", received ${JSON.stringify(document.contentFormat)}.`];
  }
  if (format !== "mdx") return [];

  let resolved: ResolvedDocumentMdxPath;
  try {
    resolved = resolveDocumentMdxPath(projectRoot, document.contentPath);
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }

  if (!fs.existsSync(resolved.absolutePath) || !fs.statSync(resolved.absolutePath).isFile()) {
    return [`MDX file does not exist: ${resolved.contentPath} (expected under ${DOCUMENT_CONTENT_DIRECTORY}).`];
  }

  const realContentRoot = fs.realpathSync(path.resolve(projectRoot, DOCUMENT_CONTENT_DIRECTORY));
  const realFilePath = fs.realpathSync(resolved.absolutePath);
  const realRelativePath = path.relative(realContentRoot, realFilePath);
  if (realRelativePath.startsWith("..") || path.isAbsolute(realRelativePath)) {
    return [`MDX file resolves outside ${DOCUMENT_CONTENT_DIRECTORY}; symlink traversal is not allowed.`];
  }

  const source = fs.readFileSync(realFilePath, "utf8");
  const errors = validateControlledMdx(source);
  if (errors.length || document.status !== "published" || document.visibility !== "public") return errors;
  return validatePublicDocumentPdfFiles(projectRoot, analyzeDocumentPdfMdx(source).sources);
}
