import assert from "node:assert/strict";
import test from "node:test";
import {
  filterDocumentsByType,
  getDocumentPath,
  getPublicTopLevelDocuments,
  searchDocuments,
  type Document,
} from "../src/data/documents";
import {
  getDiscoveryPlacement,
  groupLibraryDocuments,
  resolveBookAppearance,
  validateLibraryMetadata,
} from "../src/data/library";

function volume(id: string, overrides: Partial<Document> = {}): Document {
  return { id, title: id, type: "letter", status: "published", visibility: "public", ...overrides };
}

test("el hallazgo, y no las relaciones ni el autor, determina el reino", () => {
  const relatedOnly = volume("related", { locationIds: ["hotou"], authorName: "Alguien de Hyberia" });
  assert.equal(getDiscoveryPlacement(relatedOnly).kind, "unknown");
  const nested = volume("nested", { metadata: { library: { discoveredAt: "biblioteca-de-la-mansion-radiante" } } });
  assert.equal(getDiscoveryPlacement(nested).id, "hyberia");
  const realmOnly = volume("realm", { metadata: { library: { discoveredRealmId: "hotou" } } });
  assert.equal(getDiscoveryPlacement(realmOnly).id, "hotou");
  const priority = volume("priority", { metadata: { library: { discoveredAt: "biblioteca-de-la-mansion-radiante", discoveredRealmId: "hotou" } } });
  assert.equal(getDiscoveryPlacement(priority).id, "hyberia");
});

test("distingue lugares externos de ubicación no registrada", () => {
  const external = volume("external", { metadata: { library: { discoveredAt: "lugar-fuera-del-catalogo" } } });
  const missing = volume("missing");
  assert.equal(getDiscoveryPlacement(external).id, "other");
  assert.equal(getDiscoveryPlacement(missing).id, "unknown");
});

test("oculta estantes vacíos y volúmenes excluidos, mantiene orden estable", () => {
  const books = [
    volume("zeta", { metadata: { library: { discoveredRealmId: "hotou" } } }),
    volume("entry", { documentKind: "entry", parentDocumentId: "collection" }),
    volume("collection", { documentKind: "collection", metadata: { library: { discoveredRealmId: "hyberia" } } }),
    volume("alpha", { metadata: { library: { discoveredRealmId: "hotou" } } }),
    volume("hidden", { metadata: { library: { hidden: true, discoveredRealmId: "guozhong" } } }),
    volume("draft", { status: "draft", metadata: { library: { discoveredRealmId: "yggdrasil" } } }),
  ];
  const groups = groupLibraryDocuments(books);
  assert.deepEqual(groups.map((shelf) => shelf.id), ["hyberia", "hotou"]);
  assert.deepEqual(groups[1].documents.map((document) => document.id), ["alpha", "zeta"]);
  assert.deepEqual(groupLibraryDocuments([...books].reverse()).map((shelf) => [shelf.id, shelf.documents.map((document) => document.id)]), groups.map((shelf) => [shelf.id, shelf.documents.map((document) => document.id)]));
  assert.deepEqual(groupLibraryDocuments([]), []);
});

test("los presets son completos y deterministas; las colecciones son volúmenes gruesos", () => {
  const document = volume("preset");
  const first = resolveBookAppearance(document);
  assert.deepEqual(first, resolveBookAppearance(document));
  assert.match(first.color, /^#[0-9a-f]{6}$/i);
  assert.equal(first.spineImage, null);
  assert.equal(resolveBookAppearance(volume("set", { documentKind: "collection" })).thickness, "thick");
});

test("las personalizaciones válidas prevalecen y las inválidas vuelven al preset", () => {
  const custom = volume("custom", { metadata: { library: { appearance: { spineTitle: "Crónica", color: "#123456", accentColor: "#abcdef", ornament: "stars", height: "short", thickness: "thin", texture: "cloth", spineImage: "/img/spine.webp" } } } });
  const appearance = resolveBookAppearance(custom);
  assert.equal(appearance.spineTitle, "Crónica");
  assert.equal(appearance.color, "#123456");
  assert.equal(appearance.spineImage, "/img/spine.webp");
  const invalid = volume("invalid", { metadata: { library: { appearance: { color: "red", spineImage: "javascript:alert(1)" } } } });
  assert.notEqual(resolveBookAppearance(invalid).color, "red");
  assert.equal(resolveBookAppearance(invalid).spineImage, null);
  assert.ok(validateLibraryMetadata(invalid.metadata?.library).length >= 2);
});

test("búsqueda, tipos, rutas y colecciones conservan el contrato público", () => {
  const collection = volume("mi-coleccion", { title: "Crónicas de viaje", type: "book", documentKind: "collection" });
  const entry = volume("capitulo", { documentKind: "entry", parentDocumentId: collection.id });
  const letter = volume("carta", { title: "Carta de prueba" });
  const top = getPublicTopLevelDocuments([collection, entry, letter]);
  assert.deepEqual(top.map((document) => document.id), ["mi-coleccion", "carta"]);
  assert.deepEqual(searchDocuments(top, "crónicas").map((document) => document.id), ["mi-coleccion"]);
  assert.deepEqual(filterDocumentsByType(top, "letter").map((document) => document.id), ["carta"]);
  assert.equal(getDocumentPath(collection), "/documents/mi-coleccion");
  assert.equal(getDocumentPath(letter), "/documents/carta");
});
