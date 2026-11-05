import assert from "node:assert/strict";
import test from "node:test";
import charactersJson from "../src/data/characters.json";
import factionsJson from "../src/data/factions.json";
import type {Character} from "../src/data/characters";
import type {Faction} from "../src/data/factions";
import {sortFactionCharacters} from "../src/utils/characterFactionOrdering";

const faction = (overrides: Partial<Faction> = {}): Faction => ({
  id: "pack",
  title: "Pack",
  status: "active",
  ...overrides,
});

const character = (id: string, overrides: Partial<Character> = {}): Character => ({
  id,
  title: id,
  group: "npc",
  visibility: "public",
  status: "active",
  factionId: "pack",
  ...overrides,
});

test("leader precedes older members and explicit former members stay last", () => {
  const input = [
    character("former", {dateOfBirth: "1890-01-01", sortOrder: 0, status: "dead"}),
    character("young", {dateOfBirth: "2001-01-01", sortOrder: 1}),
    character("leader", {dateOfBirth: "2005-01-01", sortOrder: 20}),
    character("older", {dateOfBirth: "1990-01-01", sortOrder: 10, status: "dead"}),
    character("inactive", {dateOfBirth: "1995-01-01", status: "inactive"}),
    character("former-two", {dateOfBirth: "1900-01-01"}),
    character("leader", {dateOfBirth: "2005-01-01"}),
  ];
  const originalIds = input.map(({id}) => id);
  const sorted = sortFactionCharacters(input, faction({
    leaderCharacterId: "leader",
    exMemberIds: ["former", "former-two"],
  }));
  assert.deepEqual(sorted.map(({id}) => id), [
    "leader", "older", "inactive", "young", "former", "former-two",
  ]);
  assert.deepEqual(input.map(({id}) => id), originalIds);
  assert.notStrictEqual(sorted, input);
});

test("missing and invalid dates follow valid dates, then sortOrder and name", () => {
  const input = [
    character("z", {title: "Zeta", dateOfBirth: "2000-02-30", sortOrder: 2}),
    character("b", {title: "Beta", sortOrder: 1}),
    character("a", {title: "Álfa", dateOfBirth: "not-a-date", sortOrder: 1}),
    character("newer", {dateOfBirth: "2000-02-29", sortOrder: 0}),
    character("older", {dateOfBirth: "1999-12-31", sortOrder: 99}),
    character("equal", {dateOfBirth: "2000-02-29", sortOrder: -1}),
    character("missing", {dateOfBirth: null, sortOrder: 3}),
  ];
  assert.deepEqual(sortFactionCharacters(input, faction()).map(({id}) => id), [
    "older", "equal", "newer", "a", "b", "z", "missing",
  ]);
});

test("former membership survives a changed primary affiliation and multiple memberships", () => {
  const moved = character("moved", {factionId: "new-pack", dateOfBirth: "1900-01-01"});
  const shared = character("shared", {
    factionId: "new-pack", additionalFactionIds: ["pack", "pack"], dateOfBirth: "1990-01-01",
  });
  const unrelated = character("unrelated", {factionId: "elsewhere"});
  const input = [moved, shared, unrelated, shared];
  assert.deepEqual(sortFactionCharacters(input, faction({exMemberIds: ["moved"]})).map(({id}) => id), [
    "shared", "moved",
  ]);
  assert.deepEqual(sortFactionCharacters(input, faction({id: "new-pack"})).map(({id}) => id), [
    "moved", "shared",
  ]);
});

test("legacy leader works; invalid or former leaders fall back to chronology", () => {
  const input = [
    character("old", {dateOfBirth: "1990-01-01"}),
    character("new", {dateOfBirth: "2000-01-01"}),
  ];
  assert.deepEqual(sortFactionCharacters(input, faction({leaderId: "new"})).map(({id}) => id), ["new", "old"]);
  assert.deepEqual(sortFactionCharacters(input, faction({leaderCharacterId: "absent"})).map(({id}) => id), ["old", "new"]);
  assert.deepEqual(sortFactionCharacters(input, faction({leaderCharacterId: "absent", leaderId: "new"})).map(({id}) => id), ["new", "old"]);
  assert.deepEqual(sortFactionCharacters(input, faction({leaderCharacterId: "new", exMemberIds: ["new"]})).map(({id}) => id), ["old", "new"]);
});

test("current Stray Kids data places Woojin after the living and deceased members", () => {
  const sorted = sortFactionCharacters(
    Object.values(charactersJson) as Character[],
    factionsJson.skz as Faction,
  );
  assert.equal(sorted[0].id, "skz-bangchan");
  assert.equal(sorted.at(-1)?.id, "skz-woojin");
  assert.equal(new Set(sorted.map(({id}) => id)).size, sorted.length);
});
