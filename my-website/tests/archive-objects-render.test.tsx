import assert from "node:assert/strict";
import Module from "node:module";
import path from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Document } from "../src/data/documents";

// Isolate the Docusaurus shell so the real component can be rendered as static HTML.
const originalLoad = (Module as any)._load;
const classes = new Proxy({}, { get: (_target, key) => String(key) });
(Module as any)._load = function(request: string, parent: unknown, isMain: boolean) {
  if (request === "@docusaurus/Link") return { __esModule: true, default: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a> };
  if (request === "@docusaurus/useBaseUrl") return { useBaseUrlUtils: () => ({ withBaseUrl: (value: string) => value }) };
  if (request.endsWith(".module.css")) return { __esModule: true, default: classes };
  if (request.startsWith("@site/src/")) return originalLoad.call(this, path.resolve("src", request.slice("@site/src/".length)), parent, isMain);
  return originalLoad.call(this, request, parent, isMain);
};
const ArchiveObject = require("../src/components/documents/ArchiveObject").default as (props: {document: Document}) => React.ReactElement;
(Module as any)._load = originalLoad;

function volume(mode: string, appearance: Record<string, unknown> = {}): Document {
  return { id: mode, title: `Documento ${mode}`, type: "letter", status: "published", visibility: "public", metadata: { library: { discoveredRealmId: "hyberia", appearance: { displayMode: mode as any, material: mode === "newspaper" ? "newsprint" : undefined, ...appearance } } } } as Document;
}

test("las seis variantes renderizan enlace, nombre completo, silueta y tooltip", () => {
  for (const mode of ["book", "letter", "newspaper", "dossier", "notice", "scroll"]) {
    const html = renderToStaticMarkup(<ArchiveObject document={volume(mode)} />);
    assert.match(html, new RegExp(`data-mode="${mode}"`));
    assert.match(html, new RegExp(`href="/documents/${mode}"`));
    assert.match(html, new RegExp(`aria-label="Abrir carta: Documento ${mode}`));
    assert.match(html, new RegExp(`<strong>Documento ${mode}</strong>`));
    assert.match(html, mode === "book" ? /<svg viewBox="0 0 52 48"/ : /class="surface"/);
  }
});

test("colección conserva su ruta y se identifica visualmente", () => {
  const document = { ...volume("dossier"), id: "coleccion", documentKind: "collection" as const };
  const html = renderToStaticMarkup(<ArchiveObject document={document} />);
  assert.match(html, /href="\/documents\/coleccion"/);
  assert.match(html, /data-collection="true"/);
  assert.match(html, /COLECCIÓN/);
});

test("los doce SVG se colorean con el acento y funcionan con marcos independientes", () => {
  const ids = ["four-point-star", "pirate-banner", "anchor", "bat", "wolf", "claw-marks", "paw-print", "card-spade", "card-heart", "card-diamond", "card-club", "theater-masks"];
  for (const id of ids) {
    const html = renderToStaticMarkup(<ArchiveObject document={volume("letter", { symbol: id, ornament: "circle", accentColor: "#D6BA87" })} />);
    assert.match(html, new RegExp(`data-symbol="${id}"`));
    assert.match(html, new RegExp(`/img/symbols/${id}\\.svg`));
    assert.match(html, /data-frame="circle"/);
    assert.match(html, /--archive-accent:#D6BA87/);
  }
});

test("los marcos se combinan con símbolos en libros y objetos sin cambiar dimensiones", () => {
  for (const ornament of ["circle", "diamond", "laurel-frame", "arcane", "filigree-frame"]) {
    const html = renderToStaticMarkup(<ArchiveObject document={volume("book", { ornament, symbol: "card-spade", height: "short", thickness: "thin" })} />);
    assert.match(html, new RegExp(`data-frame="${ornament}"`));
    assert.match(html, /data-symbol="card-spade"/);
    assert.match(html, /data-height="short"/);
    assert.match(html, /data-thickness="thin"/);
  }
  const noFrame = renderToStaticMarkup(<ArchiveObject document={volume("notice", { ornament: "none", symbol: "paw-print" })} />);
  assert.match(noFrame, /data-symbol="paw-print"/);
  assert.doesNotMatch(noFrame, /data-frame="/);
});
