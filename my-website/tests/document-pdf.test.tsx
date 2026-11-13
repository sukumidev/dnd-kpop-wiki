import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Module from "node:module";
import test, {type TestContext} from "node:test";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {unified} from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import {analyzeDocumentPdfMdx} from "../scripts/document-pdf-mdx";
import {validateControlledMdx, validateDocumentMdxFile} from "../scripts/document-content";
import {isDocumentPdfDisplay, isDocumentPdfSrc} from "../src/components/documents/mdx/documentPdfContract";
import {pdfFixture} from "./fixtures/documentPdfFixture";

const publicSrc = "/handouts/circular/circular-militar-aabbccddee.pdf";

function temporaryProject(t: TestContext, source: string, pdf?: Buffer) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hallyura-document-pdf-"));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  fs.mkdirSync(path.join(root, "src/content/documents"), {recursive: true});
  fs.writeFileSync(path.join(root, "src/content/documents/circular.mdx"), source);
  if (pdf) {
    fs.mkdirSync(path.join(root, "static/handouts/circular"), {recursive: true});
    fs.writeFileSync(path.join(root, `static${publicSrc}`), pdf);
  }
  return root;
}

test("contract matches CMS paths and display modes exactly", () => {
  assert.equal(isDocumentPdfSrc(publicSrc), true);
  assert.equal(isDocumentPdfSrc("/handouts/circular/plain.pdf"), true);
  for (const unsafe of ["javascript:alert(1)", "data:application/pdf,abc", "blob:abc", "https://example.com/a.pdf", "/handouts/circular/../secret.pdf", "/handouts/circular/x.pdf?download=1", "/other/circular/x.pdf", "/handouts/circular/x.PDF"]) {
    assert.equal(isDocumentPdfSrc(unsafe), false, unsafe);
  }
  assert.equal(isDocumentPdfDisplay("card"), true);
  assert.equal(isDocumentPdfDisplay("embedded"), true);
  assert.equal(isDocumentPdfDisplay("fullscreen"), false);
});

test("MDX accepts literal standalone DocumentPdf and rejects unsupported syntax", () => {
  const valid = `<DocumentPdf src="${publicSrc}" title="Circular operativa" caption="Guardia Real" display="card" />`;
  assert.deepEqual(validateControlledMdx(valid), []);
  assert.deepEqual(analyzeDocumentPdfMdx(valid).sources, [publicSrc]);
  for (const invalid of [
    `<DocumentPdf src="${publicSrc}" title=" " />`,
    `<DocumentPdf src="${publicSrc}" title="Circular" display="other" />`,
    `<DocumentPdf src="${publicSrc}" title="Circular" pages="8" />`,
    `<DocumentPdf src="${publicSrc}" title="Circular" title="Duplicado" />`,
    `<DocumentPdf src="${publicSrc}" title="Circular">Contenido</DocumentPdf>`,
    `<Callout><DocumentPdf src="${publicSrc}" title="Circular" /></Callout>`,
    `Texto <DocumentPdf src="${publicSrc}" title="Circular" />`,
    `<DocumentPdf src={window.location.href} title="Circular" />`,
    `<iframe src="${publicSrc}" />`,
  ]) assert.ok(validateControlledMdx(invalid).length, invalid);
  assert.deepEqual(analyzeDocumentPdfMdx(`\`\`\`mdx\n<DocumentPdf src="${publicSrc}" title="Ejemplo" />\n\`\`\``).sources, []);
});

test("public MDX requires a regular PDF asset, while private MDX does not publish one", (t) => {
  const source = `<DocumentPdf src="${publicSrc}" title="Circular operativa" />`;
  const root = temporaryProject(t, source);
  const doc = {id: "circular", contentFormat: "mdx", contentPath: "circular.mdx", status: "published", visibility: "public"};
  assert.match(validateDocumentMdxFile(doc, root)[0], /missing or unsafe/);
  assert.deepEqual(validateDocumentMdxFile({...doc, visibility: "secret"}, root), []);
  const pdf = pdfFixture(8);
  fs.mkdirSync(path.join(root, "static/handouts/circular"), {recursive: true});
  fs.writeFileSync(path.join(root, `static${publicSrc}`), pdf);
  assert.deepEqual(validateDocumentMdxFile(doc, root), []);
  assert.deepEqual(fs.readFileSync(path.join(root, `static${publicSrc}`)), pdf);
});

test("eight-page circular and five-page illustrated landscape PDF fixtures retain first and last pages", () => {
  const circular = pdfFixture(8);
  const story = pdfFixture(5, true, true);
  assert.match(circular.toString(), /\/Count 8/);
  assert.match(circular.toString(), /\(Page 1\)/);
  assert.match(circular.toString(), /\(Page 8\)/);
  assert.match(story.toString(), /\/Count 5/);
  assert.match(story.toString(), /\(Page 1\)/);
  assert.match(story.toString(), /\(Page 5\)/);
  assert.match(story.toString(), /\/MediaBox \[0 0 842 595\]/);
  assert.match(story.toString(), / re f/);
});

test("mixed MDX fixture preserves editorial block order", () => {
  const source = [
    "## Archivo", "Párrafo inicial.", '<DocumentImage src="/img/documents/circular/portrait.webp" alt="Retrato" />',
    '<DocumentGallery columns="2">\n<DocumentImage src="/img/documents/circular/a.webp" alt="A" />\n</DocumentGallery>',
    `<DocumentPdf src="${publicSrc}" title="Circular" />`, "Párrafo final.", '<Callout title="Nota">\nConsulta el archivo.\n</Callout>',
  ].join("\n\n");
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source);
  assert.deepEqual(tree.children.map((node: any) => node.type === "mdxJsxFlowElement" ? node.name : node.type),
    ["heading", "paragraph", "DocumentImage", "DocumentGallery", "DocumentPdf", "paragraph", "Callout"]);
  assert.deepEqual(analyzeDocumentPdfMdx(source).sources, [publicSrc]);
});

const originalLoad = (Module as any)._load;
const classes = new Proxy({}, {get: (_target, key) => String(key)});
(Module as any)._load = function(request: string, parent: unknown, isMain: boolean) {
  if (request === "@docusaurus/useBaseUrl") return {useBaseUrlUtils: () => ({withBaseUrl: (value: string) => `/wiki${value}`})};
  if (request.endsWith(".module.css")) return {__esModule: true, default: classes};
  return originalLoad.call(this, request, parent, isMain);
};
const DocumentPdf = require("../src/components/documents/mdx/DocumentPdf").DocumentPdf as React.ComponentType<any>;
(Module as any)._load = originalLoad;

test("embedded view renders local lazy iframe, accessible actions and caption", () => {
  const html = renderToStaticMarkup(<DocumentPdf src={publicSrc} title="Circular operativa" caption="Guardia Real" />);
  assert.match(html, /data-display="embedded"/);
  assert.match(html, /src="\/wiki\/handouts\/circular\/circular-militar-aabbccddee.pdf"/);
  assert.match(html, /title="Vista previa del PDF: Circular operativa"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /Abrir PDF: Circular operativa/);
  assert.match(html, /Descargar PDF: Circular operativa/);
  assert.match(html, /Guardia Real/);
});

test("card view omits iframe and invented metadata while keeping open and download links", () => {
  const html = renderToStaticMarkup(<DocumentPdf src={publicSrc} title="Libro ilustrado" display="card" />);
  assert.match(html, /data-display="card"/);
  assert.doesNotMatch(html, /<iframe|páginas|MiB/);
  assert.match(html, /circular-militar-aabbccddee.pdf/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /download="circular-militar-aabbccddee.pdf"/);
});

test("invalid runtime path produces an accessible error without iframe or unsafe link", () => {
  const html = renderToStaticMarkup(<DocumentPdf src="javascript:alert(1)" title="Unsafe" />);
  assert.match(html, /role="alert"/);
  assert.doesNotMatch(html, /<iframe|href=/);
});

test("responsive PDF styles keep mobile actions and focus visible", () => {
  const css = fs.readFileSync(path.resolve("src/components/documents/mdx/DocumentPdf.module.css"), "utf8");
  assert.match(css, /max-width:\s*100%/);
  assert.match(css, /@media \(max-width:\s*640px\)/);
  assert.match(css, /\.viewer \{ display: none; \}/);
  assert.match(css, /\.actions a:focus-visible/);
});
