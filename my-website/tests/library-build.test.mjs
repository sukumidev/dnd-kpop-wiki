import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const html = fs.readFileSync(path.join(root, "build/documents/index.html"), "utf8");
const stylesheet = fs.readFileSync(path.join(root, "src/components/documents/BookSpine.module.css"), "utf8");
const shelfStylesheet = fs.readFileSync(path.join(root, "src/components/documents/Bookshelf.module.css"), "utf8");

test("la compilación renderiza lomos SVG y colecciones sin estantes vacíos", () => {
  assert.equal((html.match(/data-texture=/g) ?? []).length, 6);
  assert.equal((html.match(/<svg viewBox="0 0 52 48"/g) ?? []).length, 6);
  assert.equal((html.match(/data-collection="true"/g) ?? []).length, 2);
  assert.match(html, /id="shelf-unknown"/);
  assert.doesNotMatch(html, /id="shelf-(guozhong|yggdrasil)"/);
});

test("cada lomo conserva un enlace público y un nombre accesible", () => {
  const books = [...html.matchAll(/<a [^>]*data-texture="[^"]+"[^>]*>/g)].map(([tag]) => tag);
  assert.equal(books.length, 6);
  for (const book of books) {
    assert.match(book, /aria-label="Abrir [^"]+"/);
    assert.match(book, /href="\/documents\/[^\"]+"/);
    const href = book.match(/href="(\/documents\/[^\"]+)"/)?.[1];
    assert.ok(fs.existsSync(path.join(root, "build", href.slice(1), "index.html")), `Reader missing: ${href}`);
  }
});

test("los estilos ofrecen foco visible, móvil sin scroll obligatorio y movimiento reducido", () => {
  assert.match(stylesheet, /\.link:focus-visible\s*\{[^}]*outline:/);
  assert.match(stylesheet, /prefers-reduced-motion: reduce/);
  assert.match(shelfStylesheet, /grid-template-columns: repeat\(auto-fill, minmax\(62px, 1fr\)\)/);
  assert.doesNotMatch(shelfStylesheet, /overflow-x:\s*(auto|scroll)/);
});
