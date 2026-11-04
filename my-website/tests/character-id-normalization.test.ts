import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const dataDir = path.join(root, "src", "data");
const docsDir = path.join(root, "docs");

function readJson(file: string): any {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const mapping = readJson(path.join(root, "scripts", "character-id-mapping.json")) as Record<string, string>;
const characters = readJson(path.join(dataDir, "characters.json")) as Record<string, { id: string; group: "npc" | "party"; imageSrc?: string | null }>;
const cosmology = readJson(path.join(dataDir, "cosmology.json")) as Record<string, { characterId?: string | null }>;
const sessions = readJson(path.join(dataDir, "sessions.json")) as Array<{
  id: string; subtitle?: string; characterIds: string[];
}>;
const mainAdditions: Record<string, string> = {
  laura: "npc-laura",
  yamal: "npc-yamal",
  sixsevenaldo: "npc-sixsevenaldo",
  "minji-gemela": "npc-minji",
  "minsoo-gemela": "npc-minsoo",
  abu: "npc-abu",
  apu: "npc-apu",
  agu: "npc-agu",
};

const imagesFromMain: Record<string, string> = {
  "npc-camerino": "/img/characters/npc/npc-kobold.webp",
  "npc-camerino-jr": "/img/characters/npc/npc-kobold.webp",
  "txt-soobin": "/img/characters/txt/txt-soobin.webp",
  "npc-demetrio": "/img/characters/npc/npc-kobold.webp",
  "npc-hanjun": "/img/characters/npc/npc-hanjun.webp",
  "npc-hilario": "/img/characters/npc/npc-kobold.webp",
  "txt-hueningkai": "/img/characters/txt/txt-hueningkai.webp",
  "npc-hwang": "/img/characters/npc/npc-kobold.webp",
  "npc-lady-isuna": "/img/characters/npc/npc-isuna.webp",
  "npc-sir-baekjin": "/img/characters/npc/npc-baekjin.webp",
  "txt-taehyun": "/img/characters/txt/txt-taehyun.webp",
  "npc-tencha": "/img/characters/npc/npc-kobold.webp",
  "txt-yeonjun": "/img/characters/txt/txt-yeonjun.webp",
};

test("normalization map has 120 non-colliding entries", () => {
  assert.equal(Object.keys(mapping).length, 120);
  assert.equal(new Set(Object.values(mapping)).size, 120);
  assert.ok(Object.keys(characters).length >= 287, "A character was deleted during the merge");
  assert.equal(new Set(Object.values(characters).map(character => character.id)).size, Object.keys(characters).length);
  for (const [key, character] of Object.entries(characters)) {
    assert.equal(character.id, key, "Character key and ID differ: " + key);
  }

  for (const [oldId, newId] of Object.entries(mapping)) {
    assert.equal(characters[oldId], undefined, "Old ID still exists: " + oldId);
    assert.equal(characters[newId]?.id, newId, "Missing or mismatched new ID: " + newId);
  }
});

test("characters added on main keep their normalized IDs and pages", () => {
  for (const [oldId, newId] of Object.entries(mainAdditions)) {
    assert.equal(characters[oldId], undefined, "Old ID still exists: " + oldId);
    assert.equal(characters[newId]?.id, newId, "Missing new character: " + newId);
    const oldPage = path.join(docsDir, "characters", "npc", oldId + ".mdx");
    const newPage = path.join(docsDir, "characters", "npc", newId + ".mdx");
    assert.equal(fs.existsSync(oldPage), false);
    assert.ok(fs.existsSync(newPage), "Missing page: " + newPage);
    assert.ok(fs.readFileSync(newPage, "utf8").includes('characterId: "' + newId + '"'));
  }
});

test("images incorporated on main remain assigned", () => {
  for (const [id, imageSrc] of Object.entries(imagesFromMain)) {
    assert.equal(characters[id]?.imageSrc, imageSrc, "Image lost for " + id);
    assert.ok(fs.existsSync(path.join(root, "static", imageSrc.slice(1))), "Image file missing: " + imageSrc);
  }
});

test("all 22 sessions keep subtitles and resolvable character references", () => {
  assert.equal(sessions.length, 22);
  assert.equal(new Set(sessions.map(session => session.id)).size, 22);
  for (const session of sessions) {
    assert.ok(session.subtitle?.trim(), "Missing subtitle: " + session.id);
    for (const id of session.characterIds) {
      assert.ok(characters[id], session.id + ": missing character " + id);
      assert.equal(mapping[id], undefined, session.id + ": old character ID " + id);
      assert.equal(mainAdditions[id], undefined, session.id + ": old new-character ID " + id);
    }
  }
  const refs = (id: string) => sessions.find(session => session.id === id)?.characterIds ?? [];
  for (const id of ["actor-byeon-wooseok", "npc-subaru", "npc-suzuki"]) {
    assert.ok(refs("session-18").includes(id), "Session 18 missing " + id);
  }
  for (const id of ["npc-matsuda", "npc-suzuki", "npc-dal", ...Object.values(mainAdditions)]) {
    assert.ok(refs("session-19").includes(id), "Session 19 missing " + id);
  }
});

test("old character routes redirect and strict link checks remain enabled", () => {
  const config = fs.readFileSync(path.join(root, "docusaurus.config.ts"), "utf8");
  assert.match(config, /\.\.\.characterIdRedirects/);
  assert.match(config, /\.\.\.newCharacterIdRedirects/);
  assert.match(config, /onBrokenLinks: 'throw'/);
  assert.match(config, /onBrokenAnchors: 'throw'/);
  assert.match(config, /onBrokenMarkdownLinks: 'throw'/);
  for (const oldRoute of ["los-diecisiete-heroes", "neo-culturales-tecnologicos", "lobos-perdidos", "hijos-de-la-noche", "marea-negra", "t1-gumayusi"]) {
    assert.ok(config.includes(oldRoute), "Legacy redirect missing: " + oldRoute);
  }
});

test("all cosmology character references resolve", () => {
  for (const [id, entity] of Object.entries(cosmology)) {
    if (!entity.characterId) continue;
    assert.ok(characters[entity.characterId], `${id}: missing character ${entity.characterId}`);
  }
});

test("every migrated character has a correctly named MDX page", () => {
  for (const [oldId, newId] of Object.entries(mapping)) {
    const group = characters[newId]?.group;
    assert.ok(group, "Missing group for " + newId);
    const folder = path.join(docsDir, "characters", group);
    const current = path.join(folder, newId + ".mdx");
    const previous = path.join(folder, oldId + ".mdx");
    assert.equal(fs.existsSync(previous), false, "Old MDX still exists: " + previous);
    assert.equal(fs.existsSync(current), true, "New MDX missing: " + current);
    const content = fs.readFileSync(current, "utf8");
    assert.ok(
      content.includes('characterId: "' + newId + '"') ||
      content.includes("characterId: '" + newId + "'"),
      "Frontmatter has the wrong characterId: " + current,
    );
  }
});

test("shared JSON and active docs contain no outdated character references", () => {
  const dataFiles = [
    "characters.json", "factions.json", "quests.json",
    "locations.json", "sessions.json", "documents.json", "statblocks.json",
  ];

  function checkRef(value: any, key: string, file: string): void {
    if (Array.isArray(value)) {
      for (const item of value) {
        checkRef(item, key === "characterIds" || key === "memberIds" ? "characterId" : key, file);
      }
      return;
    }
    if (value && typeof value === "object") {
      for (const [childKey, childValue] of Object.entries(value)) {
        checkRef(childValue, childKey, file);
      }
      return;
    }
    if (typeof value !== "string") return;
    if (["characterId", "leaderCharacterId", "sourceCharacterId", "targetCharacterId"].includes(key)) {
      assert.equal(mapping[value], undefined, file + ": obsolete characterId " + value);
    }
    if (["docPath", "href", "url"].includes(key)) {
      const match = value.match(/^\/?characters\/(?:npc|party)\/([a-z0-9-]+)$/);
      if (match) assert.equal(mapping[match[1]], undefined, file + ": obsolete character link " + value);
    }
  }

  for (const file of dataFiles) {
    checkRef(readJson(path.join(dataDir, file)), "", file);
  }

  function inspectDocs(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Historical misc pages are excluded from the built site.
        if (file === path.join(docsDir, "characters", "misc")) continue;
        inspectDocs(file);
        continue;
      }
      if (!/\.(md|mdx)$/.test(file)) continue;
      const content = fs.readFileSync(file, "utf8");
      for (const match of content.matchAll(/\/?characters\/(?:npc|party)\/([a-z0-9-]+)/g)) {
        assert.equal(mapping[match[1]], undefined, file + ": obsolete character link " + match[0]);
      }
    }
  }

  inspectDocs(docsDir);
});
