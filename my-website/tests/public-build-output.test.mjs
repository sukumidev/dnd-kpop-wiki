import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const output = path.resolve("build-public");

test("the public build contains only the approved archive SVG catalog", () => {
  assert.ok(fs.existsSync(path.join(output, "index.html")), "Run npm run build:public first");
  const manifest = JSON.parse(fs.readFileSync("src/data/archiveVectorAssets.json", "utf8"));
  const expected = manifest.map(({ asset }) => path.basename(asset)).sort();
  const actual = fs.readdirSync(path.join(output, "img/symbols")).sort();
  assert.deepEqual(actual, expected);
});

test("the public build omits unpublished document routes", () => {
  const documents = JSON.parse(fs.readFileSync("src/data/documents.json", "utf8"));
  const privateDocuments = documents.filter(({ status, visibility }) =>
    status !== "published" || visibility !== "public");
  assert.ok(privateDocuments.length > 0, "Expected nonpublic fixtures in the document registry");
  for (const { id } of privateDocuments) {
    assert.ok(!fs.existsSync(path.join(output, "documents", id, "index.html")), `Unpublished route: ${id}`);
  }
});
