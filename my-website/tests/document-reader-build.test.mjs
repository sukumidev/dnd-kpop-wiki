import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const route = (slug) => path.join(root, "build", "documents", slug, "index.html");
const article = (slug) => {
  const html = fs.readFileSync(route(slug), "utf8");
  return html.slice(html.indexOf("<article"), html.indexOf("</article>") + 10).replaceAll("<!-- -->", "");
};

test("el documento heredado tiene un solo título y no repite su sinopsis en el cuerpo", () => {
  const html = article("dorian-el-ultimo-soldado");
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((html.match(/Dorian es un tiefling de piel violeta oscura/g) ?? []).length, 1);
  assert.match(html, /data-document-reader-content/);
});

test("MDX compilado conserva el contenido y los componentes existentes", () => {
  const html = article("carta-de-s-coups-para-los-aventureros");
  assert.match(html, /data-document-reader-content/);
  assert.match(html, /Su mesa ya está apartada/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
});

test("la colección muestra el índice y cada capítulo conserva la navegación", () => {
  const collection = article("rumores-de-hyberia");
  const entry = article("rumor-1");
  assert.match(collection, /id="collection-contents-title"/);
  assert.match(collection, /href="\/documents\/rumor-1"/);
  assert.match(entry, /Volver al índice de Rumores de la Taberna PAB/);
  assert.match(entry, /href="\/documents\/rumor-2"/);
  assert.match(entry, /Volumen: Rumores de la Taberna PAB/);
});

test("las rutas no públicas siguen fuera de la compilación", () => {
  assert.equal(fs.existsSync(route("rumor-17")), false);
  assert.equal(fs.existsSync(route("diario-de-kiyori")), false);
});
