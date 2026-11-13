import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  publishDocumentAssets, referencedDocumentAssets, trackedPrivatePdfPaths,
  validateDocumentAssetPath, verifyPublicPdf,
} from "../scripts/document-public-assets.mjs";

const validPdf = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nstartxref\n9\n%%EOF\n");
const doc = (id, overrides = {}) => ({id, status: "published", visibility: "public", ...overrides});
async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "hallyura-assets-"));
  const stage = await fs.mkdtemp(path.join(os.tmpdir(), "hallyura-assets-stage-"));
  t.after(async () => { await fs.rm(root, {recursive: true, force: true}); await fs.rm(stage, {recursive: true, force: true}); });
  return {root, stage, async write(relative, bytes) {
    const file = path.join(root, relative);
    await fs.mkdir(path.dirname(file), {recursive: true});
    await fs.writeFile(file, bytes);
    return file;
  }};
}

test("MDX syntax parser finds gallery images and literal PDF links only", () => {
  const source = [
    "```mdx\n<DocumentImage src=\"/img/documents/alpha/fake.webp\" />\n```",
    '<DocumentGallery columns="2"><DocumentImage src="/img/documents/alpha/portrait.webp" /></DocumentGallery>',
    "[PDF](/handouts/alpha/report-0123456789.pdf)",
    "A string /handouts/alpha/fake-0123456789.pdf is not a link.",
  ].join("\n\n");
  const assets = referencedDocumentAssets(source, "alpha");
  assert.deepEqual([...assets.images], ["/img/documents/alpha/portrait.webp"]);
  assert.deepEqual([...assets.pdfs], ["/handouts/alpha/report-0123456789.pdf"]);
});

test("CMS DocumentPdf blocks publish the referenced PDF without scanning arbitrary HTML", async (t) => {
  const f = await fixture(t);
  const src = "/handouts/alpha/report-0123456789.pdf";
  await f.write("src/content/documents/alpha.mdx", `<DocumentPdf src="${src}" title="Report" display="embedded" />`);
  await f.write("static/handouts/alpha/report-0123456789.pdf", validPdf);
  const copied = await publishDocumentAssets(f.root, f.stage, [doc("alpha", {contentFormat: "mdx", contentPath: "alpha.mdx"})], {trackedPaths: []});
  assert.deepEqual([...copied], ["handouts/alpha/report-0123456789.pdf"]);
  assert.throws(() => referencedDocumentAssets(`<iframe src="${src}" />`, "alpha"), /approved MDX/);
  assert.equal(validateDocumentAssetPath("/handouts/alpha/plain.pdf", "alpha", "pdf"), "handouts/alpha/plain.pdf");
});

test("invalid owners, traversal, extension and executable MDX attributes fail closed", () => {
  assert.throws(() => validateDocumentAssetPath("/handouts/alpha/../secret.pdf", "alpha", "pdf"), /Unsafe/);
  assert.throws(() => validateDocumentAssetPath("/handouts/beta/file-0123456789.pdf", "alpha", "pdf"), /cross-document/);
  assert.throws(() => validateDocumentAssetPath("/handouts/alpha/file.txt", "alpha", "pdf"), /Unsafe/);
  assert.throws(() => validateDocumentAssetPath("/img/documents/alpha/nested/a.webp", "alpha", "image"), /Unsafe/);
  assert.throws(() => referencedDocumentAssets('<DocumentImage src={window.secret} />', "alpha"), /literal string/);
  assert.throws(() => referencedDocumentAssets("[PDF](/handouts/alpha/../secret.pdf)", "alpha"), /Unsafe/);
  assert.throws(() => referencedDocumentAssets('<img src="/img/documents/alpha/a.webp" />', "alpha"), /approved MDX/);
});

test("legacy Markdown image references still publish without interpreting JSX", async (t) => {
  const f = await fixture(t);
  await f.write("static/img/documents/alpha/legacy.webp", "image");
  const copied = await publishDocumentAssets(f.root, f.stage, [doc("alpha", {
    content: "![Illustration](/img/documents/alpha/legacy.webp)",
  })], {trackedPaths: []});
  assert.deepEqual([...copied], ["img/documents/alpha/legacy.webp"]);
});

test("published public PDF and gallery image copy with identical bytes, private and orphan assets stay out", async (t) => {
  const f = await fixture(t);
  const image = Buffer.from("RIFF....WEBP");
  await f.write("src/content/documents/alpha.mdx", '<DocumentGallery><DocumentImage src="/img/documents/alpha/image.webp" /></DocumentGallery>');
  await f.write("static/img/documents/alpha/image.webp", image);
  await f.write("static/img/documents/alpha/unreferenced.webp", image);
  await f.write("static/handouts/alpha/report-0123456789.pdf", validPdf);
  await f.write("static/handouts/secret/private-0123456789.pdf", validPdf);
  await f.write("static/handouts/orphan/lost-0123456789.pdf", validPdf);
  const copied = await publishDocumentAssets(f.root, f.stage, [
    doc("alpha", {contentFormat: "mdx", contentPath: "alpha.mdx"}),
    doc("secret", {visibility: "secret"}),
  ], {trackedPaths: []});
  assert.deepEqual([...copied].sort(), ["handouts/alpha/report-0123456789.pdf", "img/documents/alpha/image.webp"]);
  const delivered = await fs.readFile(path.join(f.stage, "static/handouts/alpha/report-0123456789.pdf"));
  assert.equal(createHash("sha256").update(delivered).digest("hex"), createHash("sha256").update(validPdf).digest("hex"));
  await assert.rejects(fs.access(path.join(f.stage, "static/handouts/secret/private-0123456789.pdf")));
  await assert.rejects(fs.access(path.join(f.stage, "static/handouts/orphan/lost-0123456789.pdf")));
  await assert.rejects(fs.access(path.join(f.stage, "static/img/documents/alpha/unreferenced.webp")));
});

test("archived PDF is excluded and versioned private PDFs block publication", async (t) => {
  const f = await fixture(t);
  await f.write("static/handouts/archived/report-0123456789.pdf", validPdf);
  await publishDocumentAssets(f.root, f.stage, [doc("archived", {status: "archived"})], {trackedPaths: []});
  await assert.rejects(fs.access(path.join(f.stage, "static/handouts/archived/report-0123456789.pdf")));
  assert.deepEqual(trackedPrivatePdfPaths(["static/handouts/archived/report-0123456789.pdf"], new Set()), ["static/handouts/archived/report-0123456789.pdf"]);
  assert.deepEqual(trackedPrivatePdfPaths(["static/private/secret.pdf", "static/handouts/alpha/INVALID.pdf"], new Set(["alpha"])),
    ["static/private/secret.pdf", "static/handouts/alpha/INVALID.pdf"]);
  await assert.rejects(publishDocumentAssets(f.root, f.stage, [doc("archived", {status: "archived"})], {
    trackedPaths: ["static/handouts/archived/report-0123456789.pdf"],
  }), /Versioned PDF/);
});

test("missing image, missing linked PDF, invalid PDF and oversized PDF block publication", async (t) => {
  const f = await fixture(t);
  await f.write("src/content/documents/alpha.mdx", '<DocumentImage src="/img/documents/alpha/missing.webp" />');
  const published = [doc("alpha", {contentFormat: "mdx", contentPath: "alpha.mdx"})];
  await assert.rejects(publishDocumentAssets(f.root, f.stage, published, {trackedPaths: []}), /missing/);
  await f.write("src/content/documents/alpha.mdx", "[PDF](/handouts/alpha/missing-0123456789.pdf)");
  await assert.rejects(publishDocumentAssets(f.root, f.stage, published, {trackedPaths: []}), /missing/);
  const pdf = await f.write("static/handouts/alpha/report-0123456789.pdf", Buffer.from("%PDF-1.4\nnot really a PDF"));
  await f.write("src/content/documents/alpha.mdx", "# Empty");
  await assert.rejects(publishDocumentAssets(f.root, f.stage, published, {trackedPaths: []}), /Invalid PDF/);
  await fs.writeFile(pdf, validPdf);
  await assert.rejects(verifyPublicPdf(pdf, 8), /size limit/);
});

test("an image referenced twice by one public document is copied once", async (t) => {
  const f = await fixture(t);
  await f.write("src/content/documents/alpha.mdx", '<DocumentImage src="/img/documents/alpha/image.webp" />');
  await f.write("static/img/documents/alpha/image.webp", "image");
  const copied = await publishDocumentAssets(f.root, f.stage, [doc("alpha", {
    contentFormat: "mdx", contentPath: "alpha.mdx", imageSrc: "/img/documents/alpha/image.webp",
  })], {trackedPaths: []});
  assert.deepEqual([...copied], ["img/documents/alpha/image.webp"]);
});

test("two public documents may share one owner asset, while a private owner is rejected", async (t) => {
  const f = await fixture(t);
  await f.write("src/content/documents/alpha.mdx", '[PDF](/handouts/alpha/report-0123456789.pdf)');
  await f.write("src/content/documents/beta.mdx", '[Shared PDF](/handouts/alpha/report-0123456789.pdf)');
  await f.write("static/handouts/alpha/report-0123456789.pdf", validPdf);
  const alpha = doc("alpha", {contentFormat: "mdx", contentPath: "alpha.mdx"});
  const beta = doc("beta", {contentFormat: "mdx", contentPath: "beta.mdx"});
  const copied = await publishDocumentAssets(f.root, f.stage, [alpha, beta], {trackedPaths: []});
  assert.deepEqual([...copied], ["handouts/alpha/report-0123456789.pdf"]);
  await f.write("src/content/documents/beta.mdx", '[Secret](/handouts/secret/private-0123456789.pdf)');
  await assert.rejects(publishDocumentAssets(f.root, f.stage, [alpha, beta, doc("secret", {visibility: "secret"})], {
    trackedPaths: [],
  }), /nonpublic PDF owner/);
});

test("symlink assets are rejected when the platform permits creating them", async (t) => {
  const f = await fixture(t);
  const target = await f.write("outside.webp", "image");
  const imagePath = path.join(f.root, "static/img/documents/alpha/image.webp");
  await fs.mkdir(path.dirname(imagePath), {recursive: true});
  try { await fs.symlink(target, imagePath); }
  catch (error) { if (error.code === "EPERM") return t.skip("Windows sandbox cannot create symlinks"); throw error; }
  await f.write("src/content/documents/alpha.mdx", '<DocumentImage src="/img/documents/alpha/image.webp" />');
  await assert.rejects(publishDocumentAssets(f.root, f.stage, [doc("alpha", {contentFormat: "mdx", contentPath: "alpha.mdx"})], {
    trackedPaths: [],
  }), /Symlink/);
});
