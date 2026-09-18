import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {buildRoutes, renderRoute, type RawDocument} from "../scripts/generate-document-pages";
import {validateControlledMdx, validateDocumentMdxFile} from "../scripts/document-content";
import {selectDocumentNarrativeContent} from "../src/components/documents/documentContent";
import type {Document} from "../src/data/documents";

function document(overrides: Partial<RawDocument> = {}): RawDocument {
  return {
    id: "example",
    title: "Example",
    type: "letter",
    status: "published",
    visibility: "public",
    content: "Legacy body",
    ...overrides,
  };
}

function temporaryProject(): {root: string; writeMdx: (name: string, source?: string) => void} {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "document-mdx-test-"));
  const directory = path.join(root, "src", "content", "documents");
  fs.mkdirSync(directory, {recursive: true});
  return {
    root,
    writeMdx(name, source = "# Valid MDX\n") {
      fs.writeFileSync(path.join(directory, name), source);
    },
  };
}

test("legacy document uses inline content and generates no MDX import", () => {
  const routes = buildRoutes([document()], false);
  assert.equal(routes.length, 1);
  assert.equal(routes[0].contentImportPath, undefined);
  assert.doesNotMatch(renderRoute(routes[0]), /DocumentContent/);
});

test("valid MDX document generates a static import", () => {
  const project = temporaryProject();
  project.writeMdx("example.mdx", "# Heading\n\n<Callout tone=\"note\">Safe.</Callout>\n");
  const routes = buildRoutes([document({contentFormat: "mdx", contentPath: "example.mdx"})], false, project.root);
  assert.equal(routes[0].contentImportPath, "@site/src/content/documents/example.mdx");
  assert.match(renderRoute(routes[0]), /import DocumentContent from "@site\/src\/content\/documents\/example\.mdx"/);
  assert.match(renderRoute(routes[0]), /content={<DocumentContent \/>}/);
});

test("MDX document without contentPath is rejected", () => {
  const project = temporaryProject();
  assert.match(validateDocumentMdxFile(document({contentFormat: "mdx", contentPath: undefined}), project.root)[0], /required/);
});

test("parent traversal is rejected", () => {
  const project = temporaryProject();
  assert.match(validateDocumentMdxFile(document({contentFormat: "mdx", contentPath: "../secret.mdx"}), project.root)[0], /must not contain/);
});

test("absolute path is rejected", () => {
  const project = temporaryProject();
  assert.match(validateDocumentMdxFile(document({contentFormat: "mdx", contentPath: "C:\\secret.mdx"}), project.root)[0], /absolute paths/);
});

test("missing MDX file is rejected", () => {
  const project = temporaryProject();
  assert.match(validateDocumentMdxFile(document({contentFormat: "mdx", contentPath: "missing.mdx"}), project.root)[0], /does not exist/);
});

test("duplicate generated slugs are rejected", () => {
  assert.throws(
    () => buildRoutes([document({id: "first", slug: "same"}), document({id: "second", slug: "same"})], false),
    /Duplicate document route slug/,
  );
});

test("private document does not generate a public route", () => {
  const routes = buildRoutes([document({visibility: "dm-only"})], false);
  assert.deepEqual(routes, []);
});

test("collection and MDX entry retain separate routes", () => {
  const project = temporaryProject();
  project.writeMdx("entry.mdx");
  const routes = buildRoutes([
    document({id: "collection", type: "book", documentKind: "collection", content: undefined}),
    document({id: "entry", documentKind: "entry", parentDocumentId: "collection", content: undefined, contentFormat: "mdx", contentPath: "entry.mdx"}),
  ], false, project.root);
  assert.deepEqual(routes.map((route) => route.id), ["collection", "entry"]);
  assert.equal(routes[1].contentImportPath, "@site/src/content/documents/entry.mdx");
});

test("MDX selection never duplicates retained legacy content", () => {
  const mdxDocument = document({contentFormat: "mdx", contentPath: "example.mdx"}) as Document;
  assert.deepEqual(selectDocumentNarrativeContent(mdxDocument, "Compiled MDX"), {kind: "mdx", content: "Compiled MDX"});
  const legacyDocument = document() as Document;
  assert.deepEqual(selectDocumentNarrativeContent(legacyDocument, "Ignored compiled value"), {kind: "legacy", content: "Legacy body"});
});

test("controlled MDX rejects code execution surfaces", () => {
  assert.match(validateControlledMdx("import Thing from './thing'")[0], /imports/);
  assert.match(validateControlledMdx("{window.localStorage.clear()}")[0], /expressions/);
  assert.match(validateControlledMdx("<Unknown />")[0], /not registered/);
  assert.match(validateControlledMdx("[run](javascript:alert(1))")[0], /javascript:/);
});
