import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vectorAssets from "../src/data/archiveVectorAssets.json";
import { ARCHIVE_SYMBOLS, ORNAMENTAL_SYMBOLS, getOrnamentSymbol, resolveArchiveSymbol } from "../src/data/archiveSymbols";
import { ORNAMENT_FRAME_STYLES, isDecorativeFrame, resolveArchiveAppearance, validateLibraryMetadata } from "../src/data/library";
import type { Document } from "../src/data/documents";

const specialIds = ["four-point-star", "pirate-banner", "anchor", "bat", "wolf", "claw-marks", "paw-print", "card-spade", "card-heart", "card-diamond", "card-club", "theater-masks"];

test("el registro coincide con los 32 glifos legacy y los doce IDs vectoriales del CMS", () => {
  assert.equal(ORNAMENTAL_SYMBOLS.length, 44);
  assert.equal(new Set(ORNAMENTAL_SYMBOLS.map(({ value }) => value)).size, 44);
  assert.deepEqual(vectorAssets.map(({ id }) => id), specialIds);
  for (const [id, glyph] of Object.entries(ARCHIVE_SYMBOLS)) {
    assert.equal(getOrnamentSymbol(glyph)?.id, id);
    assert.equal(resolveArchiveSymbol(id), glyph);
  }
  for (const id of specialIds) {
    assert.equal(getOrnamentSymbol(id)?.value, id);
    assert.equal(resolveArchiveSymbol(id), id);
  }
  assert.equal(resolveArchiveSymbol("unknown"), "✦");
});

test("cada SVG aprobado es autónomo, seguro y tiene la geometría escalable del CMS", () => {
  for (const { id, asset } of vectorAssets) {
    assert.equal(asset, `/img/symbols/${id}.svg`);
    const source = fs.readFileSync(path.resolve(`static${asset}`), "utf8");
    assert.match(source, /<svg\s[^>]*viewBox="0 0 64 64"/);
    assert.match(source, /stroke="currentColor"/);
    assert.match(source, /<path\b|<circle\b/);
    assert.doesNotMatch(source, /<script|<foreignObject|<image|href=|@import|url\(\s*["']?https?:/i);
  }
});

test("los seis marcos del CMS son opcionales e independientes del símbolo", () => {
  assert.deepEqual(ORNAMENT_FRAME_STYLES, ["none", "circle", "diamond", "laurel-frame", "arcane", "filigree-frame"]);
  const base: Document = { id: "framed", title: "Archivo", type: "book", status: "published", visibility: "public" };
  for (const ornament of ORNAMENT_FRAME_STYLES) {
    const document: Document = { ...base, metadata: { library: { appearance: { ornament, symbol: "paw-print", accentColor: "#D6BA87" } } } };
    assert.equal(resolveArchiveAppearance(document).ornament, ornament);
    assert.equal(resolveArchiveAppearance(document).symbol, "paw-print");
    assert.equal(validateLibraryMetadata(document.metadata?.library).length, 0);
    assert.equal(isDecorativeFrame(ornament), ornament !== "none");
  }
  const invalid: Document = { ...base, metadata: { library: { appearance: { ornament: "unknown" as never } } } };
  assert.notEqual(resolveArchiveAppearance(invalid).ornament, "unknown");
  assert.ok(validateLibraryMetadata(invalid.metadata?.library).length > 0);
  const unknownSymbol: Document = { ...base, metadata: { library: { appearance: { symbol: "?" } } } };
  assert.notEqual(resolveArchiveAppearance(unknownSymbol).symbol, "?");
  assert.ok(validateLibraryMetadata(unknownSymbol.metadata?.library).some((message) => message.includes("appearance.symbol")));
});
