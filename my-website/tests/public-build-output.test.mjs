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

test("the public build has no PDF owned by a nonpublic document", () => {
  const documents = JSON.parse(fs.readFileSync("src/data/documents.json", "utf8"));
  const publicIds = new Set(documents.filter(({status, visibility}) =>
    status === "published" && visibility === "public").map(({id}) => id));
  const handouts = path.join(output, "handouts");
  if (!fs.existsSync(handouts)) return;
  for (const owner of fs.readdirSync(handouts)) {
    assert.ok(publicIds.has(owner), `Unexpected public PDF owner: ${owner}`);
    for (const name of fs.readdirSync(path.join(handouts, owner))) {
      assert.match(name, /^[a-z0-9]+(?:-[a-z0-9]+)*\.pdf$/);
      assert.deepEqual(
        fs.readFileSync(path.join(handouts, owner, name)),
        fs.readFileSync(path.join("static", "handouts", owner, name)),
      );
    }
  }
});

test("generated HTML contains no local file paths or private document resource URLs", () => {
  const documents = JSON.parse(fs.readFileSync("src/data/documents.json", "utf8"));
  const privateIds = documents.filter(({status, visibility}) =>
    status !== "published" || visibility !== "public").map(({id}) => id);
  const pages = [path.join(output, "index.html")];
  for (const {id, status, visibility} of documents) {
    if (status === "published" && visibility === "public") pages.push(path.join(output, "documents", id, "index.html"));
  }
  for (const file of pages.filter((item) => fs.existsSync(item))) {
    const html = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(html, /file:\/\/|[A-Za-z]:\\\\(?:Users|Documents)\\\\/i, file);
    for (const id of privateIds) {
      assert.ok(!html.includes(`/handouts/${id}/`), file);
      assert.ok(!html.includes(`/img/documents/${id}/`), file);
    }
  }
});
