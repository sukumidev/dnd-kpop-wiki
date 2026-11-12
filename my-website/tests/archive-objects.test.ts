import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { getDocumentPath, getPublicTopLevelDocuments, type Document } from "../src/data/documents";
import { ARCHIVE_DISPLAY_MODES, ARCHIVE_MATERIALS, ARCHIVE_WEARS, groupLibraryDocuments, resolveArchiveAppearance, resolveBookAppearance, validateLibraryMetadata } from "../src/data/library";
import { ARCHIVE_SYMBOLS, resolveArchiveSymbol } from "../src/data/archiveSymbols";

function volume(id: string, appearance?: Record<string, unknown>, extras: Partial<Document> = {}): Document {
  return { id, title: "Carta del archivo", type: "letter", status: "published", visibility: "public", metadata: { library: { discoveredRealmId: "hyberia", appearance } }, ...extras } as Document;
}

test("todos los modos se resuelven de manera determinista y sólo se activan explícitamente", () => {
  const legacy = volume("legacy");
  assert.equal(resolveArchiveAppearance(legacy).displayMode, "book");
  assert.deepEqual(resolveArchiveAppearance(legacy), { ...resolveBookAppearance(legacy), displayMode: "book", material: "leather", wear: "new" });
  for (const displayMode of ARCHIVE_DISPLAY_MODES) {
    const candidate = volume(displayMode, { displayMode });
    const result = resolveArchiveAppearance(candidate);
    assert.equal(result.displayMode, displayMode);
    assert.deepEqual(result, resolveArchiveAppearance(candidate));
  }
  assert.equal(resolveArchiveAppearance(volume("invalid", { displayMode: "unknown" })).displayMode, "book");
});

test("los materiales por modo siguen al CMS y las personalizaciones válidas prevalecen", () => {
  assert.deepEqual(ARCHIVE_MATERIALS, ["leather", "cloth", "parchment", "newsprint", "canvas", "aged-paper"]);
  assert.deepEqual(ARCHIVE_WEARS, ["new", "used", "ancient"]);
  assert.equal(resolveArchiveAppearance(volume("letter", { displayMode: "letter" })).material, "parchment");
  assert.equal(resolveArchiveAppearance(volume("letter", { displayMode: "letter", material: "leather" })).material, "parchment");
  assert.equal(resolveArchiveAppearance(volume("book", { displayMode: "book", material: "parchment" })).material, "leather");
  const custom = resolveArchiveAppearance(volume("custom", { displayMode: "dossier", material: "cloth", wear: "ancient", color: "#123456", accentColor: "#abcdef", height: "short", thickness: "thick", spineTitle: "Informe", symbol: "☾" }));
  assert.deepEqual([custom.material, custom.wear, custom.color, custom.accentColor, custom.height, custom.thickness, custom.spineTitle, custom.symbol], ["cloth", "ancient", "#123456", "#abcdef", "short", "thick", "Informe", "☾"]);
  const invalid = resolveArchiveAppearance(volume("bad", { displayMode: "scroll", material: "nope", wear: "nope", color: "red", symbol: "<script>" }));
  const bookFallback = resolveBookAppearance(volume("bad", { displayMode: "scroll", material: "nope", wear: "nope", color: "red", symbol: "<script>" }));
  assert.deepEqual([invalid.material, invalid.wear, invalid.color, invalid.symbol], ["aged-paper", "new", bookFallback.color, bookFallback.symbol]);
  assert.equal(validateLibraryMetadata(volume("bad", { displayMode: "invalid", material: "invalid", wear: "invalid" }).metadata?.library).length, 3);
});

test("el catálogo utiliza los glifos que exporta CMS y admite sus IDs internos", () => {
  assert.equal(Object.keys(ARCHIVE_SYMBOLS).length, 32);
  for (const [id, glyph] of Object.entries(ARCHIVE_SYMBOLS)) {
    assert.equal(resolveArchiveSymbol(glyph), glyph);
    assert.equal(resolveArchiveSymbol(id), glyph);
  }
  assert.equal(resolveArchiveSymbol("desconocido"), "✦");
  assert.equal(resolveArchiveSymbol(null), "✦");
});

test("colecciones y documentos conservan reino, filtro público y rutas", () => {
  const collection = volume("coleccion", { displayMode: "dossier" }, { documentKind: "collection" });
  const entry = volume("capitulo", { displayMode: "scroll" }, { documentKind: "entry", parentDocumentId: "coleccion" });
  const hidden = volume("privado", { displayMode: "notice" }, { visibility: "dm-only" });
  const shelves = groupLibraryDocuments([entry, collection, hidden]);
  assert.equal(shelves.length, 1);
  assert.deepEqual(shelves[0].documents.map(({ id }) => id), ["coleccion"]);
  assert.deepEqual(getPublicTopLevelDocuments([entry, collection, hidden]).map(({ id }) => id), ["coleccion"]);
  assert.equal(getDocumentPath(collection), "/documents/coleccion");
  assert.equal(resolveArchiveAppearance(collection).displayMode, "dossier");
});

test("las seis siluetas y acabados tienen estilos responsive, foco y movimiento reducido", () => {
  const css = fs.readFileSync("src/components/documents/ArchiveObject.module.css", "utf8");
  for (const displayMode of ARCHIVE_DISPLAY_MODES.filter((mode) => mode !== "book")) assert.match(css, new RegExp(`data-mode="${displayMode}"`));
  for (const material of ARCHIVE_MATERIALS.filter((material) => material !== "leather")) assert.match(css, new RegExp(`data-material="${material}"`));
  for (const wear of ["used", "ancient"]) assert.match(css, new RegExp(`data-wear="${wear}"`));
  assert.match(css, /focus-visible/);
  assert.match(css, /max-width: 600px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /overflow-x:\s*(auto|scroll)/);
});
