import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveCharacterImageFolder,
  fillNullCharacterImagePaths,
} from "../scripts/fill-null-character-image-paths.mjs";

const factions = ["txt", "riize", "nu-est", "omega-x", "os-guild", "monsta-x"];

test("explicit factionId overrides all fallback strategies", () => {
  const x = resolveCharacterImageFolder({ id: "txt-beomgyu", factionId: "custom-guild", group: "npc" }, factions);
  assert.equal(x.folder, "custom-guild");
  assert.equal(x.source, "factionId");
});

test("character ID faction prefix is used when factionId is absent", () => {
  assert.equal(resolveCharacterImageFolder({ id: "txt-beomgyu", group: "npc" }, factions).folder, "txt");
  assert.equal(resolveCharacterImageFolder({ id: "nu-est-baekho", group: "npc" }, factions).folder, "nu-est");
  assert.equal(resolveCharacterImageFolder({ id: "omega-x-jaehan", group: "npc" }, factions).folder, "omega-x");
});

test("special prefixes use the actual Wiki image directories", () => {
  const expected = {
    "solo-eunbi": "solo",
    "actor-byeon-wooseok": "actors",
    "pet-yeontan": "pets",
    "enemy-kris": "enemies",
    "npc-arturo": "npc",
    "pc-minjae": "party",
    "bg3-shadowheart": "bg3",
  };
  for (const [id, folder] of Object.entries(expected)) {
    assert.equal(resolveCharacterImageFolder({ id, group: "npc" }, factions).folder, folder, id);
  }
});

test("group fallback works for unrecognized original characters", () => {
  const x = resolveCharacterImageFolder({ id: "unknown-hero", group: "party" }, factions);
  assert.equal(x.folder, "party");
  assert.equal(x.source, "group");
});

test("fill only explicit nulls, preserving images, missing keys and gallery data", () => {
  const original = {
    "txt-beomgyu": {
      id: "txt-beomgyu", group: "npc", imageSrc: null, images: [{ src: "/img/other/old.png" }],
    },
    "riize-anton": { id: "riize-anton", group: "npc", factionId: "riize", imageSrc: null },
    "npc-ario": { id: "npc-ario", group: "npc", imageSrc: null },
    "npc-filled": { id: "npc-filled", group: "npc", imageSrc: "/img/custom/picture.png" },
    "npc-missing-property": { id: "npc-missing-property", group: "npc" },
  };
  const result = fillNullCharacterImagePaths(original, factions);
  assert.equal(result.filled.length, 3);
  assert.equal(result.untouched, 2);
  assert.equal(result.data["txt-beomgyu"].imageSrc, "/img/characters/txt/txt-beomgyu.webp");
  assert.equal(result.data["riize-anton"].imageSrc, "/img/characters/riize/riize-anton.webp");
  assert.equal(result.data["npc-ario"].imageSrc, "/img/characters/npc/npc-ario.webp");
  assert.equal(result.data["npc-filled"].imageSrc, "/img/custom/picture.png");
  assert.equal(result.data["npc-missing-property"].imageSrc, undefined);
  assert.equal(result.data["txt-beomgyu"].images[0].src, "/img/other/old.png");
  assert.equal(original["txt-beomgyu"].imageSrc, null);
});

test("new routes do not require an existing physical WebP file", () => {
  const x = fillNullCharacterImagePaths({
    "txt-beomgyu": { id: "txt-beomgyu", group: "npc", imageSrc: null },
  }, factions);
  assert.equal(x.filled.length, 1);
  assert.equal(x.unresolved.length, 0);
});

test("rejects invalid IDs and mismatched registry keys without silently changing them", () => {
  const x = fillNullCharacterImagePaths({
    "wrong-key": { id: "txt-beomgyu", group: "npc", imageSrc: null },
    "invalid-ID": { id: "invalid-ID", group: "npc", imageSrc: null },
    "valid-entry": { id: "valid-entry", factionId: "../private", group: "npc", imageSrc: null },
  }, factions);
  assert.equal(x.filled.length, 0);
  assert.equal(x.unresolved.length, 3);
});

test("migration is idempotent", () => {
  const source = { "txt-beomgyu": { id: "txt-beomgyu", group: "npc", imageSrc: null } };
  const first = fillNullCharacterImagePaths(source, factions);
  const second = fillNullCharacterImagePaths(first.data, factions);
  assert.equal(second.filled.length, 0);
  assert.deepEqual(second.data, first.data);
});
