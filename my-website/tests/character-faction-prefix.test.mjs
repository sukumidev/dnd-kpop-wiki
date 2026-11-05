import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const characters = JSON.parse(readFileSync(new URL("../src/data/characters.json", import.meta.url), "utf8"));
const factions = JSON.parse(readFileSync(new URL("../src/data/factions.json", import.meta.url), "utf8"));
const factionIds = Object.keys(factions).sort((a, b) => b.length - a.length);

const deferredIds = (id) => id.startsWith("npc-") || id.startsWith("enemy-");

function matchingFactionId(id) {
  return factionIds.find((factionId) => id.startsWith(factionId + "-"));
}

test("every character factionId resolves to an existing faction", () => {
  const invalid = Object.entries(characters)
    .filter(([, character]) => character.factionId && !factions[character.factionId])
    .map(([id, character]) => ({ id, factionId: character.factionId }));
  assert.deepEqual(invalid, []);
});

test("recognized faction prefixes are linked, except deferred npc-* and enemy-* IDs", () => {
  const missing = Object.entries(characters)
    .filter(([id, character]) => !deferredIds(id) && matchingFactionId(id) && !character.factionId)
    .map(([id]) => ({ id, expectedFactionId: matchingFactionId(id) }));
  assert.deepEqual(missing, []);
});

test("longest faction prefix wins for hyphenated IDs", () => {
  assert.equal(matchingFactionId("nu-est-baekho"), "nu-est");
  assert.equal(matchingFactionId("omega-x-jaehan"), "omega-x");
  assert.equal(matchingFactionId("txt-beomgyu"), "txt");
});

test("first-pass linking does not assign a default faction to npc or enemy IDs", () => {
  assert.equal(deferredIds("npc-dal"), true);
  assert.equal(deferredIds("enemy-haneul"), true);
  assert.equal(matchingFactionId("npc-dal"), undefined);
});
