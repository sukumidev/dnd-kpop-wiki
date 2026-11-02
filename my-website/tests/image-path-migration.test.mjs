import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveImageReference, rewriteImageReferences,
} from "../scripts/migrate-image-paths-to-webp.mjs";

const assets = new Set([
  "characters/party/kiyori.png",
  "characters/party/kiyori.webp",
  "characters/npc/Lady Isuna.jpg",
  "characters/npc/Lady Isuna.webp",
  "lore/El Árbol de la Vida.jpeg",
  "lore/El Árbol de la Vida.webp",
  "sessions/01/1.png",
]);

test("updates only local images with an existing WebP counterpart", () => {
  const input = JSON.stringify({
    imageSrc: "/img/characters/party/kiyori.png",
    missing: "/img/sessions/01/1.png",
    external: "https://example.com/img/characters/party/kiyori.png",
    note: "kiyori.png",
  });
  const result = rewriteImageReferences(input, assets);
  const data = JSON.parse(result.content);
  assert.equal(data.imageSrc, "/img/characters/party/kiyori.webp");
  assert.equal(data.missing, "/img/sessions/01/1.png");
  assert.equal(data.external, "https://example.com/img/characters/party/kiyori.png");
  assert.equal(data.note, "kiyori.png");
  assert.equal(result.found, 2);
  assert.equal(result.rewritten, 1);
  assert.equal(result.unresolved[0].reason, "WebP not generated yet");
});

test("preserves MDX, filenames with spaces and query strings", () => {
  const input = [
    "![NPC](/img/characters/npc/Lady Isuna.jpg)",
    "![Lore](/img/lore/El Árbol de la Vida.jpeg?size=small#preview)",
    '<img src="/img/characters/party/kiyori.png" />',
  ].join("\n");
  const output = rewriteImageReferences(input, assets);
  assert.match(output.content, /Lady Isuna\.webp/);
  assert.match(output.content, /El Árbol de la Vida\.webp\?size=small#preview/);
  assert.match(output.content, /kiyori\.webp/);
  assert.equal(output.rewritten, 3);
});

test("supports URL-encoded filenames", () => {
  const output = rewriteImageReferences('"/img/characters/npc/Lady%20Isuna.jpg"', assets);
  assert.equal(output.content, '"/img/characters/npc/Lady%20Isuna.webp"');
});

test("does not modify WebP references and is idempotent", () => {
  const first = rewriteImageReferences('"/img/characters/party/kiyori.png"', assets);
  const second = rewriteImageReferences(first.content, assets);
  assert.equal(second.content, first.content);
  assert.equal(second.found, 0);
  assert.equal(second.rewritten, 0);
});

test("reports broken local image paths without inventing replacements", () => {
  const result = resolveImageReference("/img/missing/person.png", assets);
  assert.equal(result.replacement, null);
  assert.equal(result.reason, "original and WebP missing");
});
