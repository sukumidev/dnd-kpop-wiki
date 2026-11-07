import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {factionRouteFromMdx, factionRouteManifest} from "../scripts/generate-public-faction-routes.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("faction route parser respects explicit slug and factionId", () => {
  const route = factionRouteFromMdx("hijos-de-la-noche.mdx",
    '---\nfactionId: "enhypen"\nslug: /factions/enhypen\n---\nContent');
  assert.deepEqual(route, {id:"enhypen", route:"/factions/enhypen"});
});

test("faction route parser uses filename when slug absent", () => {
  const route = factionRouteFromMdx("guerreros-ascendentes.mdx",
    '---\nfactionId: "guerreros-ascendentes"\n---\nContent');
  assert.equal(route.route, "/factions/guerreros-ascendentes");
});

test("faction route manifest rejects duplicate IDs or paths", () => {
  const content = "---\nfactionId: x\nslug: /factions/x\n---\n";
  assert.throws(() => factionRouteManifest([
    {filename:"a.mdx", content},
    {filename:"b.mdx", content},
  ]), /Duplicate/);
});

test("published faction manifest matches actual MDX profiles", async () => {
  const dir = path.join(root,"docs/factions");
  const files = (await fs.readdir(dir)).filter(n => /\.mdx?$/.test(n));
  const entries = await Promise.all(files.map(async filename => ({
    filename, content: await fs.readFile(path.join(dir,filename),"utf8"),
  })));
  const expected = factionRouteManifest(entries);
  const actual = JSON.parse(await fs.readFile(path.join(root,"src/data/publicFactionRoutes.json"),"utf8"));
  assert.deepEqual(actual, expected);
});
