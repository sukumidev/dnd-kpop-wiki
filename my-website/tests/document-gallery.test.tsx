import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {buildRoutes} from "../scripts/generate-document-pages";
import {validateControlledMdx} from "../scripts/document-content";

const originalLoad = (Module as any)._load;
const classes = new Proxy({}, {get: (_target, key) => String(key)});
(Module as any)._load = function(request: string, parent: unknown, isMain: boolean) {
  if (request === "@docusaurus/useBaseUrl") return {useBaseUrlUtils: () => ({withBaseUrl: (value: string) => `/wiki${value}`})};
  if (request.endsWith(".module.css")) return {__esModule: true, default: classes};
  return originalLoad.call(this, request, parent, isMain);
};
const {DocumentImage, DocumentGallery} = require("../src/components/documents/mdx/DocumentMdxComponents") as typeof import("../src/components/documents/mdx/DocumentMdxComponents");
(Module as any)._load = originalLoad;

test("DocumentImage keeps legacy markup and resolves a public baseUrl", () => {
  const html = renderToStaticMarkup(<DocumentImage src="/img/documents/letter.webp" alt="Carta sellada" />);
  assert.match(html, /<figure class="image">/);
  assert.match(html, /src="\/wiki\/img\/documents\/letter.webp"/);
  assert.match(html, /alt="Carta sellada"/);
  assert.match(html, /loading="lazy"/);
  assert.doesNotMatch(html, /data-size|data-align|figcaption/);
});

test("all four sizes and three alignments are optional and independent", () => {
  for (const size of ["small", "medium", "large", "full"] as const) {
    const html = renderToStaticMarkup(<DocumentImage src="/img/documents/vertical.webp" alt="Retrato vertical" size={size} />);
    assert.match(html, new RegExp(`data-size="${size}"`));
    assert.match(html, /src="\/wiki\/img\/documents\/vertical.webp"/);
  }
  for (const align of ["left", "center", "right"] as const) {
    const html = renderToStaticMarkup(<DocumentImage src="https://example.org/horizontal.webp" alt="Paisaje horizontal" align={align} />);
    assert.match(html, new RegExp(`data-align="${align}"`));
    assert.match(html, /src="https:\/\/example.org\/horizontal.webp"/);
  }
});

test("galleries keep image order, individual captions and Markdown titles", () => {
  for (const columns of ["1", "2", "3"] as const) {
    const html = renderToStaticMarkup(<DocumentGallery columns={columns}>
      <DocumentImage src="/img/documents/a.webp" alt="A" caption="Primer pie" title="Título original" />
      <DocumentImage src="/img/documents/b.webp" alt="B" caption="Segundo pie" size="small" align="right" />
    </DocumentGallery>);
    assert.match(html, new RegExp(`data-columns="${columns}"`));
    assert.match(html, /role="group" aria-label="Galería de imágenes"/);
    assert.ok(html.indexOf("a.webp") < html.indexOf("b.webp"));
    assert.match(html, /title="Título original"/);
    assert.match(html, /<figcaption>Primer pie<\/figcaption>/);
    assert.match(html, /<figcaption>Segundo pie<\/figcaption>/);
  }
});

test("unsafe or empty image references render nothing", () => {
  for (const src of ["", "  ", "javascript:alert(1)", "jaVa\tscript:alert(1)", "data:image/svg+xml,a", "blob:abc", "file:///secret", "https://", "//example.org/image.webp"]) {
    assert.equal(renderToStaticMarkup(<DocumentImage src={src} alt="" />), "");
  }
});

test("CMS gallery markup and optional image attributes pass the controlled MDX validator", () => {
  const source = [
    "## Escenas",
    '<DocumentGallery columns="2">',
    '<DocumentImage src="/img/documents/cuento/uno.webp" alt="Primera escena" caption="El puerto" title="Vista antigua" />',
    '<DocumentImage src="/img/documents/cuento/dos.webp" alt="Segunda escena" size="small" align="right" />',
    "</DocumentGallery>",
    "",
    '<DocumentImage src="/img/documents/cuento/tres.webp" alt="Tercera escena" size="full" align="center" />',
  ].join("\n");
  assert.deepEqual(validateControlledMdx(source), []);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wiki-gallery-mdx-"));
  try {
    const folder = path.join(root, "src/content/documents");
    fs.mkdirSync(folder, {recursive: true});
    fs.writeFileSync(path.join(folder, "gallery.mdx"), source);
    const routes = buildRoutes([{id: "gallery", title: "Galería", type: "letter", status: "published", visibility: "public", contentFormat: "mdx", contentPath: "gallery.mdx"}], false, root);
    assert.equal(routes[0].contentImportPath, "@site/src/content/documents/gallery.mdx");
  } finally {
    const temporaryRoot = fs.realpathSync(os.tmpdir());
    if (!path.resolve(root).startsWith(temporaryRoot + path.sep)) throw new Error("Temporary MDX path escaped the test directory");
    fs.rmSync(root, {recursive: true, force: true});
  }
});

test("controlled MDX rejects invalid composition without accepting executable JSX", () => {
  const invalid = [
    '<DocumentImage src="javascript:alert(1)" alt="x" />',
    '<DocumentImage src="" alt="x" />',
    '<DocumentImage src="/img/a.webp" alt="x" size="huge" />',
    '<DocumentImage src="/img/a.webp" alt="x" align="justify" />',
    '<DocumentImage src="/img/a.webp" alt="x" onLoad="run" />',
    '<DocumentGallery columns="4"><DocumentImage src="/img/a.webp" alt="x" /></DocumentGallery>',
    '<DocumentGallery columns={2}><DocumentImage src="/img/a.webp" alt="x" /></DocumentGallery>',
    '<DocumentGallery columns="2"><img src="/img/a.webp" /></DocumentGallery>',
    '<DocumentGallery columns="2" />',
    'Texto <DocumentImage src="/img/a.webp" alt="x" /> en línea.',
    '<iframe src="/img/a.webp" />',
    'import Image from "./image"',
    '{window.localStorage.clear()}',
  ];
  for (const source of invalid) assert.ok(validateControlledMdx(source).length > 0, source);
  assert.deepEqual(validateControlledMdx("```mdx\n<Unknown />\n```"), []);
});

test("CSS keeps aspect ratio, widths and responsive gallery columns", () => {
  const css = fs.readFileSync(path.resolve("src/components/documents/mdx/DocumentMdxComponents.module.css"), "utf8");
  assert.match(css, /data-size="small"[^}]*18rem/);
  assert.match(css, /data-size="medium"[^}]*30rem/);
  assert.match(css, /data-size="large"[^}]*46rem/);
  assert.match(css, /data-size="full"[^}]*100%/);
  assert.match(css, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /max-width: 800px/);
  assert.match(css, /max-width: 600px/);
  assert.match(css, /height: auto/);
  assert.doesNotMatch(css, /object-fit:\s*cover/);
  const mdxComponents = fs.readFileSync(path.resolve("src/theme/MDXComponents.tsx"), "utf8");
  assert.match(mdxComponents, /DocumentGallery/);
});
