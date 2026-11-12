import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "src/data/archiveVectorAssets.json"), "utf8"));

test("el build Docusaurus incluye exactamente los SVG aprobados del catálogo", () => {
  assert.equal(manifest.length, 12);
  assert.deepEqual(fs.readdirSync(path.join(root, "build/img/symbols")).sort(), manifest.map(({ id }) => `${id}.svg`).sort());
  for (const { asset } of manifest) {
    const source = fs.readFileSync(path.join(root, "static", asset.slice(1)));
    const output = fs.readFileSync(path.join(root, "build", asset.slice(1)));
    assert.deepEqual(output, source, `Build asset differs: ${asset}`);
  }
});

test("la ruta de comparación temporal no se publica", () => {
  assert.equal(fs.existsSync(path.join(root, "build/archive-appearance-fixture/index.html")), false);
});
