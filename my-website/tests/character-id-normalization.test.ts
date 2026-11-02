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
const characters = readJson(path.join(dataDir, "characters.json")) as Record<string, { id: string; group: "npc" | "party" }>;

test("normalization map has 120 non-colliding entries", () => {
  assert.equal(Object.keys(mapping).length, 120);
  assert.equal(new Set(Object.values(mapping)).size, 120);
  assert.equal(Object.keys(characters).length, 279);

  for (const [oldId, newId] of Object.entries(mapping)) {
    assert.equal(characters[oldId], undefined, "Old ID still exists: " + oldId);
    assert.equal(characters[newId]?.id, newId, "Missing or mismatched new ID: " + newId);
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
    "characters.json", "characters/skz.json", "factions.json", "quests.json",
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
