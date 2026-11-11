import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getDocumentCharacterRelations,
  getDocumentPath,
  getPreviousAndNextDocumentEntries,
  getPublicChildDocuments,
  getPublicDocumentById,
  getPublicParentDocument,
  type Document,
} from "../src/data/documents";
import {selectDocumentNarrativeContent} from "../src/components/documents/documentContent";
import {nextDocumentHeadingId, slugDocumentHeading} from "../src/components/documents/documentHeadings";

function volume(id: string, overrides: Partial<Document> = {}): Document {
  return {id, title: id, type: "book", status: "published", visibility: "public", ...overrides};
}

test("MDX compilado conserva prioridad exclusiva y el estado sin contenido", () => {
  const mdx = volume("mdx", {contentFormat: "mdx", content: "Texto antiguo"});
  assert.deepEqual(selectDocumentNarrativeContent(mdx, <p>Texto MDX</p>).kind, "mdx");
  assert.deepEqual(selectDocumentNarrativeContent(mdx), {kind: "none"});
  assert.deepEqual(selectDocumentNarrativeContent(volume("legacy", {content: "Markdown heredado"})), {kind: "legacy", content: "Markdown heredado"});
  assert.deepEqual(selectDocumentNarrativeContent(volume("empty")), {kind: "none"});
});

test("el parser estándar renderiza Markdown y GFM sin ejecutar HTML o JSX del JSON", () => {
  const source = [
    "## Sección",
    "Texto con **énfasis** y [ruta](/documents/legacy).",
    "![Mapa](/img/mapa.webp)",
    "- Uno\n- Dos",
    "> Cita",
    "| A | B |\n| --- | --- |\n| 1 | 2 |",
    "<script>alert('x')</script>",
    "<Callout>JSX no permitido</Callout>",
    "[malicioso](javascript:alert(1))",
  ].join("\n\n");
  const html = renderToStaticMarkup(<ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{source}</ReactMarkdown>);
  assert.match(html, /<h2>Sección<\/h2>/);
  assert.match(html, /<strong>énfasis<\/strong>/);
  assert.match(html, /href="\/documents\/legacy"/);
  assert.match(html, /<img src="\/img\/mapa.webp" alt="Mapa"/);
  assert.match(html, /<ul>/);
  assert.match(html, /<blockquote>/);
  assert.match(html, /<table>/);
  assert.doesNotMatch(html, /<script|<Callout|alert\('x'\)|javascript:/);
});

test("los encabezados tienen anclas estables incluso si se repiten", () => {
  const used = new Map<string, number>();
  assert.equal(slugDocumentHeading("Crónica de Hyberia ✦"), "cronica-de-hyberia");
  assert.equal(nextDocumentHeadingId("La carta", used), "la-carta");
  assert.equal(nextDocumentHeadingId("La carta", used), "la-carta-2");
  assert.equal(nextDocumentHeadingId("✦", used), "seccion");
});

test("colecciones y capítulos conservan orden, rutas y navegación pública", () => {
  const collection = volume("volumen", {documentKind: "collection"});
  const second = volume("segundo", {documentKind: "entry", parentDocumentId: collection.id, chapterNumber: 2, order: 2});
  const first = volume("primero", {documentKind: "entry", parentDocumentId: collection.id, chapterNumber: 1, order: 1});
  const privateEntry = volume("privado", {documentKind: "entry", parentDocumentId: collection.id, status: "draft"});
  const list = [second, privateEntry, collection, first];
  assert.deepEqual(getPublicChildDocuments(collection.id, list).map((entry) => entry.id), ["primero", "segundo"]);
  assert.equal(getPublicParentDocument(first, list)?.id, collection.id);
  assert.equal(getPreviousAndNextDocumentEntries(first, list).next?.id, second.id);
  assert.equal(getPreviousAndNextDocumentEntries(second, list).previous?.id, first.id);
  assert.equal(getDocumentPath(second), "/documents/segundo");
});

test("relaciones públicas y acceso al lector mantienen las reglas existentes", () => {
  const letter = getPublicDocumentById("carta-de-despedida-de-hyunjin");
  assert.ok(letter);
  const relations = getDocumentCharacterRelations(letter);
  assert.ok(relations.authors.length > 0);
  assert.equal(relations.recipients.length, 2);
  assert.equal(getPublicDocumentById("diario-de-kiyori"), undefined);
  assert.equal(getPublicDocumentById("rumor-17"), undefined);
});

test("el lector limita tablas e imágenes y ofrece foco visible y movimiento reducido", () => {
  const css = fs.readFileSync(path.resolve("src/pages/documents/styles.module.css"), "utf8");
  assert.match(css, /\.tableScroll\s*\{[^}]*overflow-x:\s*auto/);
  assert.match(css, /\.documentReaderContent p > img\s*\{[^}]*max-width:\s*100%/);
  assert.match(css, /\.reader a:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
