import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FACTIONS_DIR = path.join(ROOT, "docs/factions");
const OUTPUT = path.join(ROOT, "src/data/publicFactionRoutes.json");

function yamlField(frontmatter, key) {
  const line = frontmatter.split(/\r?\n/).find(line => line.startsWith(key + ":"));
  return line?.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, "");
}

export function factionRouteFromMdx(filename, content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  if (!match) throw new Error("Faction MDX lacks frontmatter: " + filename);
  const id = yamlField(match[1], "factionId");
  if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error("Invalid factionId in " + filename);
  }
  const defaultSlug = "/factions/" + filename.replace(/\.mdx?$/, "");
  const route = yamlField(match[1], "slug") || defaultSlug;
  if (!/^\/factions\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(route)) {
    throw new Error("Unexpected faction route in " + filename + ": " + route);
  }
  return {id, route};
}

export function factionRouteManifest(entries) {
  const routes = {};
  const destinations = new Set();
  for (const {filename, content} of entries) {
    const {id, route} = factionRouteFromMdx(filename, content);
    if (Object.hasOwn(routes, id) || destinations.has(route)) {
      throw new Error("Duplicate faction ID or published route: " + id);
    }
    routes[id] = route;
    destinations.add(route);
  }
  return Object.fromEntries(Object.entries(routes).sort(([a], [b]) => a.localeCompare(b)));
}

export async function generateFactionRouteManifest() {
  const filenames = (await fs.readdir(FACTIONS_DIR))
    .filter(name => /\.mdx?$/.test(name)).sort();
  const entries = await Promise.all(filenames.map(async filename => ({
    filename, content: await fs.readFile(path.join(FACTIONS_DIR, filename), "utf8"),
  })));
  const routes = factionRouteManifest(entries);
  await fs.writeFile(OUTPUT, JSON.stringify(routes, null, 2) + "\n");
  console.log("Generated public faction routes: " + Object.keys(routes).length);
  return routes;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateFactionRouteManifest().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
