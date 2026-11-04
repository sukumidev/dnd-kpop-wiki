import assert from "node:assert/strict";
import test from "node:test";
import factionsJson from "../src/data/factions.json";
import registryJson from "../src/data/factionRegistryMetadata.json";
import {
  groupAndSortFactions,
  normalizeFactionRealm,
  type FactionRegistryEntry,
} from "../src/utils/factionDirectoryOrdering";

const faction = (id: string, realm: string | null, sortOrder?: number) => ({
  id,
  title: id,
  realm,
  sortOrder,
});

test("catalog order, aliases, and administrative origins", () => {
  assert.deepEqual(normalizeFactionRealm("Ygdrassil"), {
    id: "yggdrasil",
    title: "Yggdrasil",
  });
  const groups = groupAndSortFactions([
    faction("unknown", "Territorio nuevo"),
    faction("undefined", "Por definir"),
    faction("j", "Jeyperia"),
    faction("h", "Hyberia"),
    faction("no-realm", null),
    faction("s", "Sylmorien"),
    faction("y", "Ygdrassil"),
    faction("landthai", "Landthai"),
    faction("lost", "Desconocido"),
  ], {});
  assert.deepEqual(groups.map(({id}) => id), [
    "hyberia", "sylmorien", "jeyperia", "yggdrasil", "landthai",
    "territorio-nuevo", "sin-reino-asignado", "desconocido", "por-definir",
  ]);
});

test("numeric and decimal appearances take priority, with Registry row ties", () => {
  const metadata: Record<string, FactionRegistryEntry> = {
    late: {source: "Música", registryId: 9, registryRow: 2, realm: "Hyberia", firstAppearance: 14.5},
    secondTie: {source: "Música", registryId: 3, registryRow: 9, realm: "Hyberia", firstAppearance: 4},
    firstTie: {source: "Música", registryId: 2, registryRow: 4, realm: "Hyberia", firstAppearance: 4},
    early: {source: "Música", registryId: 1, registryRow: 11, realm: "Hyberia", firstAppearance: 3},
    decimal: {source: "Música", registryId: 8, registryRow: 15, realm: "Hyberia", firstAppearance: 11.5},
    noSession: {source: "Música", registryId: 10, registryRow: 3, realm: "Hyberia"},
  };
  const input = ["late", "secondTie", "noSession", "firstTie", "decimal", "early", "unmatched"]
    .map((id, index) => faction(id, "Hyberia", index));
  const sorted = groupAndSortFactions(input, metadata)[0].factions;
  assert.deepEqual(sorted.map(({id}) => id), [
    "early", "firstTie", "secondTie", "decimal", "late", "noSession", "unmatched",
  ]);
  assert.deepEqual(input.map(({id}) => id), [
    "late", "secondTie", "noSession", "firstTie", "decimal", "early", "unmatched",
  ]);
});

test("duplicate source associations retain one card and missing records stay visible", () => {
  const groups = groupAndSortFactions([
    faction("same", "Sin reino"),
    faction("same", "Sin reino"),
    faction("missing", null, 2),
    faction("other", "Sin reino", 1),
  ], {});
  assert.deepEqual(groups[0].factions.map(({id}) => id), ["other", "missing", "same"]);
});

test("parties keep their separate section and manual order", () => {
  const groups = groupAndSortFactions([
    {...faction("os-guild", "Sin reino", 1), type: "party"},
    faction("realm-faction", "Hyberia"),
    {...faction("panes-del-destino", "Sin reino", 0), type: "party"},
  ], {
    "os-guild": {
      source: "Música", registryRow: 1, realm: "Hyberia", firstAppearance: 1,
    },
  });
  assert.equal(groups[0].id, "__parties__");
  assert.equal(groups[0].title, "Parties");
  assert.deepEqual(groups[0].factions.map(({id}) => id), [
    "panes-del-destino", "os-guild",
  ]);
});

test("citizens are last within every requested realm, even with an earlier session", () => {
  for (const realm of ["Hyberia", "Sylmorien", "Jeyperia", "Hotou", "Ygdrassil"]) {
    const id = `ciudadanos-de-${realm.toLowerCase()}`;
    const groups = groupAndSortFactions([
      faction(id, realm, 0),
      faction(`other-${id}`, realm, 10),
    ], {
      [id]: {source: "Música", registryRow: 1, realm, firstAppearance: 1},
    });
    assert.deepEqual(groups[0].factions.map(({id: factionId}) => factionId), [
      `other-${id}`, id,
    ]);
  }
});

test("the current public directory keeps every visible faction once", () => {
  const visible = Object.values(factionsJson).filter(
    (value) => value.status !== "hidden" && String(value.status) !== "archived",
  );
  const groups = groupAndSortFactions(visible);
  const ids = groups.flatMap(({factions}) => factions.map(({id}) => id));
  assert.equal(ids.length, visible.length);
  assert.equal(new Set(ids).size, visible.length);
  assert.deepEqual(groups.slice(0, 5).map(({id}) => id), [
    "__parties__",
    "hyberia", "sylmorien", "jeyperia", "yggdrasil",
  ]);
  assert.deepEqual(groups[0].factions.map(({id}) => id), [
    "panes-del-destino", "os-guild",
  ]);
  assert.deepEqual(groups.find(({id}) => id === "hyberia")!.factions.slice(0, 4).map(({id}) => id), [
    "svt", "txt", "enhypen", "lsf",
  ]);
  for (const realm of ["hyberia", "sylmorien", "jeyperia", "hotou"]) {
    assert.equal(
      groups.find(({id}) => id === realm)!.factions.at(-1)!.id,
      `ciudadanos-de-${realm}`,
    );
  }
  assert.deepEqual(groups.find(({id}) => id === "desconocido")!.factions.map(({id}) => id), [
    "clan-del-sol-ardiente", "omega-x",
  ]);
  assert.deepEqual(groups.find(({id}) => id === "por-definir")!.factions.map(({id}) => id), [
    "dragonborns-del-clan-del-caos", "dragonborns-del-clan-del-orden",
  ]);
  assert.equal(registryJson["astro"].firstAppearance, 11.5);
  assert.equal(registryJson["p1h"].firstAppearance, 14.5);
});
