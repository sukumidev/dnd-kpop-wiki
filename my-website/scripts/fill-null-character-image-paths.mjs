import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Fills character.imageSrc === null with a predictable (possibly future) WebP path.
 *
 * Priority:
 * 1. Explicit factionId
 * 2. Recognized faction prefix in the character ID (longest match wins)
 * 3. Special identity prefix (npc-, solo-, actor-, pet-, enemy-, etc.)
 * 4. Character group (npc / party)
 *
 * The destination WebP does NOT need to exist yet. Missing assets are reported,
 * not treated as a reason to leave imageSrc null.
 *
 * From my-website/:
 *   node scripts/fill-null-character-image-paths.mjs             # dry run
 *   node scripts/fill-null-character-image-paths.mjs --write     # persist
 *   node scripts/fill-null-character-image-paths.mjs --check     # fail if nulls remain
 *
 * Only active registries src/data/characters.json and src/data/characters/*.json
 * are touched; backups, non-null imageSrc, galleries and other data are preserved.
 */

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const characterRoot = path.join(projectRoot, "src", "data");
const characterChildrenRoot = path.join(characterRoot, "characters");
const factionsFile = path.join(characterRoot, "factions.json");
const imageRoot = path.join(projectRoot, "static", "img", "characters");
const idRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// These prefixes are categories or artist identifiers rather than faction IDs.
// The directory aliases match existing Wiki image folders where applicable.
export const specialFolders = Object.freeze({
  npc: "npc",
  pc: "party",
  os: "os-guild",
  solo: "solo",
  actor: "actors",
  pet: "pets",
  enemy: "enemies",
  bg3: "bg3",
  xnghan: "xnghan",
  zb1: "zb1",
  kep1er: "kep1er",
  mamamoo: "mamamoo",
});

/** Resolve one image directory, never guessing from a character's display name. */
export function resolveCharacterImageFolder(character, factionIds = []) {
  const factionId = character?.factionId;
  if (factionId != null && factionId !== "") {
    if (typeof factionId !== "string" || !idRegex.test(factionId)) {
      return { folder: null, source: null, error: "invalid factionId" };
    }
    return { folder: factionId, source: "factionId", error: null };
  }

  const id = character?.id;
  if (typeof id !== "string" || !idRegex.test(id)) {
    return { folder: null, source: null, error: "invalid character id" };
  }

  // Longest matching faction first: nu-est, omega-x and shorter IDs work.
  const matchingFaction = [...factionIds]
    .filter((faction) => typeof faction === "string" &&
      idRegex.test(faction) && id.startsWith(faction + "-"))
    .sort((a, b) => b.length - a.length)[0];

  if (matchingFaction) {
    return { folder: matchingFaction, source: "id-faction-prefix", error: null };
  }

  const matchingSpecial = Object.keys(specialFolders)
    .filter((prefix) => id.startsWith(prefix + "-"))
    .sort((a, b) => b.length - a.length)[0];

  if (matchingSpecial) {
    return {
      folder: specialFolders[matchingSpecial],
      source: "id-category-prefix",
      error: null,
    };
  }

  const group = character?.group;
  if (typeof group === "string" && idRegex.test(group)) {
    return { folder: group, source: "group", error: null };
  }

  return { folder: null, source: null, error: "missing usable factionId, ID prefix and group" };
}

/** Pure transformer: returns a new registry; original objects are not mutated. */
export function fillNullCharacterImagePaths(registry, factionIds = []) {
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    throw new TypeError("Character registry must be a JSON object indexed by character ID.");
  }

  const output = {};
  const filled = [];
  const unresolved = [];
  let untouched = 0;

  for (const [recordKey, character] of Object.entries(registry)) {
    if (!character || typeof character !== "object" || Array.isArray(character)) {
      output[recordKey] = character;
      unresolved.push({ id: recordKey, reason: "invalid character record" });
      continue;
    }
    if (character.imageSrc !== null) {
      output[recordKey] = character;
      untouched++;
      continue;
    }

    if (recordKey !== character.id) {
      output[recordKey] = character;
      unresolved.push({ id: recordKey, reason: "record key does not match character.id" });
      continue;
    }

    const resolved = resolveCharacterImageFolder(character, factionIds);
    if (!resolved.folder) {
      output[recordKey] = character;
      unresolved.push({ id: recordKey, reason: resolved.error });
      continue;
    }

    const imageSrc = "/img/characters/" + resolved.folder + "/" + character.id + ".webp";
    output[recordKey] = { ...character, imageSrc };
    filled.push({ id: recordKey, imageSrc, source: resolved.source });
  }

  return { data: output, filled, unresolved, untouched };
}

async function characterFiles() {
  const results = [path.join(characterRoot, "characters.json")];
  let entries;
  try {
    entries = await fs.readdir(characterChildrenRoot, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return results;
    throw error;
  }

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isFile() || !entry.name.endsWith(".json") ||
        entry.name.endsWith(".backup.json")) continue;
    results.push(path.join(characterChildrenRoot, entry.name));
  }
  return results;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if ([...args].some((a) => a !== "--write" && a !== "--check") ||
      (args.has("--write") && args.has("--check"))) {
    throw new Error("Usage: fill-null-character-image-paths.mjs [--write | --check]");
  }
  const write = args.has("--write");
  const check = args.has("--check");
  const factionIds = Object.keys(JSON.parse(await fs.readFile(factionsFile, "utf8")));
  const files = await characterFiles();

  const planned = [];
  const allFilled = [];
  const unresolved = [];
  let alreadySet = 0;

  // Read and validate all JSON before writing any file.
  for (const file of files) {
    const original = await fs.readFile(file, "utf8");
    const transformed = fillNullCharacterImagePaths(JSON.parse(original), factionIds);
    const relative = path.relative(projectRoot, file).split(path.sep).join("/");
    const next = JSON.stringify(transformed.data, null, 2) + "\n";

    planned.push({ file, relative, next, modified: transformed.filled.length > 0 });
    allFilled.push(...transformed.filled.map((item) => ({ file: relative, ...item })));
    unresolved.push(...transformed.unresolved.map((item) => ({ file: relative, ...item })));
    alreadySet += transformed.untouched;
  }

  const missingFiles = [];
  for (const item of allFilled) {
    const candidate = path.join(imageRoot, item.imageSrc.slice("/img/characters/".length));
    try {
      await fs.access(candidate);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      missingFiles.push(item);
    }
  }

  if (write) {
    for (const entry of planned.filter((item) => item.modified)) {
      // One file at a time; avoid partially written JSON.
      const tmp = entry.file + ".image-paths-" + process.pid + ".tmp";
      try {
        await fs.writeFile(tmp, entry.next, "utf8");
        await fs.rename(tmp, entry.file);
      } finally {
        await fs.rm(tmp, { force: true });
      }
    }
  }

  console.log("Character image defaults: " + (check ? "CHECK" : write ? "WRITE" : "DRY RUN"));
  console.log("Registries: " + files.length);
  console.log("New imageSrc values: " + allFilled.length);
  console.log("Existing imageSrc left unchanged: " + alreadySet);
  console.log("Records needing manual review: " + unresolved.length);
  console.log("Proposed WebP files not on disk yet: " + missingFiles.length);
  for (const entry of allFilled.slice(0, 25)) {
    console.log((write ? "SET  " : "PLAN ") + entry.id + " => " + entry.imageSrc +
      " [" + entry.source + "]");
  }
  if (allFilled.length > 25) console.log("...and " + (allFilled.length - 25) + " more generated paths.");

  for (const item of unresolved) {
    console.warn("UNRESOLVED " + item.file + ": " + item.id + " (" + item.reason + ")");
  }
  for (const item of missingFiles.slice(0, 15)) {
    console.warn("IMAGE NOT FOUND YET " + item.imageSrc);
  }
  if (missingFiles.length > 15) {
    console.warn("...and " + (missingFiles.length - 15) + " more images not yet present.");
  }

  if (check && (allFilled.length || unresolved.length)) {
    console.error("CHECK FAILED: some imageSrc values are still null.");
    process.exitCode = 1;
  } else if (check) {
    console.log("CHECK PASSED: no fillable imageSrc:null values remain.");
  } else if (unresolved.length) {
    // In --write mode no silent success if some nulls could not be filled.
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
