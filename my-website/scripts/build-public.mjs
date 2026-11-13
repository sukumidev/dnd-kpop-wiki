import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  publicCharacters, publishEveryCharacter, sanitiseRelations, sanitisePublicCosmology, restrictedTerms, restrictedIdentifiers,
  approvedTeasers, findLeaks,
} from "./public-build-policy.mjs";
import {publishDocumentAssets} from "./document-public-assets.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_OUT = path.join(ROOT, "build-public");
const outputsToAudit = new Set([".html", ".js", ".json", ".css", ".xml", ".txt", ".svg", ".map", ".mjs", ".webmanifest", ".md", ".mdx", ".ts", ".tsx", ".jsx"]);

const readJSON = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
async function writeJSON(file, value) {
  await fs.mkdir(path.dirname(file), {recursive: true});
  await fs.writeFile(file, JSON.stringify(value, null, 2) + "\n");
}
async function walk(dir) {
  let entries;
  try { entries = await fs.readdir(dir, {withFileTypes:true}); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
  let result = [];
  for (const item of entries) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...await walk(file));
    else if (item.isFile()) result.push(file);
  }
  return result;
}

export function copyAllowed(relative, hiddenIds) {
  const v = relative.split(path.sep).join("/");
  const segments = v.split("/");
  if (segments.some((p) => [
    "node_modules", ".git", "build", "build-public", ".docusaurus",
    ".cache-loader", "private", "examples",
  ].includes(p))) return false;
  // Fail closed: no static assets or uploads are copied by default.
  if (v === "static" || v.startsWith("static/")) return false;
  if (v === "src/content/documents" || v.startsWith("src/content/documents/")) return false;
  if (/^src\/data\/.+\.backup\.json$/i.test(v)) return false;
  if (v === "src/data/mysteryTeasers.private.json") return false;
  if (v.startsWith("docs/characters/misc/")) return false;
  // Do not stage character pages which belong to hidden registry entries,
  // including pets and deities (not only npc/party pages).
  const characterDoc = v.match(/^docs\/(?:characters\/[^/]+|cosmology\/deities)\/([^/]+)\.mdx?$/);
  if (characterDoc && hiddenIds.has(characterDoc[1])) return false;
  return true;
}

// Narrative mentions may stay, but hidden character pages must not be linked.
export function stripHiddenCharacterLinks(source, hiddenIds) {
  return source.replace(
    /\[([^\]\n]+)\]\((\/(?:characters\/(?:npc|party|pet)|cosmology\/deities)\/([a-z0-9-]+)(?:\/)?(?:#[^)]+)?)\)/g,
    (original, label, _href, id) => hiddenIds.has(id) ? label : original,
  );
}

async function sanitiseAuthoredDocs(stage, hiddenIds) {
  let modified = 0;
  for (const file of await walk(path.join(stage, "docs"))) {
    if (!/\.mdx?$/i.test(file)) continue;
    const original = await fs.readFile(file, "utf8");
    const clean = stripHiddenCharacterLinks(original, hiddenIds);
    if (original !== clean) {
      await fs.writeFile(file, clean);
      modified++;
    }
  }
  if (modified) console.log("Public MDX/Markdown files with hidden character links replaced: " + modified);
}

// fs.cp may pass Windows extended-length paths even when ROOT is unprefixed.
export function relativeStageSource(source) {
  const root = process.platform === "win32" && source.startsWith("\\\\?\\")
    ? path.toNamespacedPath(ROOT)
    : ROOT;
  return path.relative(root, source);
}

async function stageCopy(stage, hiddenIds) {
  await fs.cp(ROOT, stage, {
    recursive: true, dereference: false,
    filter: (src) => {
      const rel = relativeStageSource(src);
      return !rel || copyAllowed(rel, hiddenIds);
    },
  });
  await fs.mkdir(path.join(stage, "static"), {recursive: true});
  try { await fs.copyFile(path.join(ROOT, "static/.nojekyll"), path.join(stage, "static/.nojekyll")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  // Calendar imports this module directly; stage only its sanitized public data.
  const events = await readJSON(path.join(ROOT, "static/data/events.json"));
  await writeJSON(path.join(stage, "static/data/events.json"), sanitiseRelations(events, hiddenIds));
  await fs.symlink(path.join(ROOT, "node_modules"), path.join(stage, "node_modules"),
    process.platform === "win32" ? "junction" : "dir");
}

async function sanitizeStage(stage, hiddenIds, publicIds, publicRegistry) {
  const dataDir = path.join(stage, "src/data");
  // This is the public-facing snapshot, not a change to the CMS/source files.
  await writeJSON(path.join(dataDir, "characters.json"),
    sanitiseRelations(publicRegistry, hiddenIds));
  const rawStatblocks = await readJSON(path.join(ROOT, "src/data/statblocks.json"));
  await writeJSON(path.join(dataDir, "statblocks.json"),
    sanitiseRelations(Object.fromEntries(Object.entries(rawStatblocks)
      .filter(([id]) => publicIds.has(id))), hiddenIds));
  const rawCosmology = await readJSON(path.join(ROOT, "src/data/cosmology.json"));
  await writeJSON(path.join(dataDir, "cosmology.json"),
    sanitisePublicCosmology(rawCosmology, hiddenIds));

  const rawDocuments = await readJSON(path.join(ROOT, "src/data/documents.json"));
  const published = rawDocuments.filter((d) =>
    d && d.status === "published" && d.visibility === "public");
  await writeJSON(path.join(dataDir, "documents.json"),
    sanitiseRelations(published, hiddenIds));

  for (const file of await walk(dataDir)) {
    if (!file.endsWith(".json")) continue;
    const name = path.relative(dataDir, file).split(path.sep).join("/");
    if (["characters.json", "statblocks.json", "documents.json", "cosmology.json", "publicMysteries.json"].includes(name)) continue;
    await writeJSON(file, sanitiseRelations(await readJSON(file), hiddenIds));
  }
  const mappings = path.join(stage, "scripts/character-id-mapping.json");
  await writeJSON(mappings, Object.fromEntries(Object.entries(await readJSON(mappings))
    .filter(([, id]) => publicIds.has(id))));

  // Only import MDX bodies from documents explicitly published as public.
  for (const doc of published) {
    if (doc.contentFormat !== "mdx") continue;
    if (typeof doc.contentPath !== "string" ||
        !/^[a-z0-9/_-]+\.mdx$/i.test(doc.contentPath)) {
      throw new Error("Unsafe public MDX source path for document " + doc.id);
    }
    const source = path.resolve(ROOT, "src/content/documents", doc.contentPath);
    const target = path.resolve(stage, "src/content/documents", doc.contentPath);
    if (!source.startsWith(path.join(ROOT, "src/content/documents") + path.sep)) {
      throw new Error("Document path escapes allowed content directory.");
    }
    await fs.mkdir(path.dirname(target), {recursive:true});
    await fs.copyFile(source, target);
  }
  return published;
}

async function getPrivateTeasers() {
  if (process.env.HALLYURA_MYSTERIES_JSON) {
    return JSON.parse(process.env.HALLYURA_MYSTERIES_JSON);
  }
  if (process.env.HALLYURA_MYSTERIES_FILE) {
    return readJSON(path.resolve(process.env.HALLYURA_MYSTERIES_FILE));
  }
  return [];
}

async function generateMysteryPages(stage, teasers) {
  await writeJSON(path.join(stage, "src/data/publicMysteries.json"), teasers);
  for (const teaser of teasers) {
    const file = path.join(stage, "src/pages/mysteries", teaser.slug + ".tsx");
    await fs.mkdir(path.dirname(file), {recursive:true});
    await fs.writeFile(file,
      'import React from "react";\n' +
      'import MysteryDetail from "@site/src/components/MysteryDetail";\n' +
      'export default function MysteryPage() { return <MysteryDetail slug=' +
      JSON.stringify(teaser.slug) + ' />; }\n');
  }
}

function imageReferences(text) {
  const references = new Set();
  // Accept spaces in existing image filenames, but not URL query fragments.
  const rx = /\/img\/[^"'\u0060<>\r\n?#)]+?\.(?:webp|svg|png|jpe?g|gif)(?=$|["'\u0060\s),\]>};])/gi;
  for (const match of text.matchAll(rx)) references.add(match[0].trim());
  return references;
}
// Public cosmology portraits and homepage illustrations do not always belong
// to a Character record. Admit only assets explicitly used by those public
// surfaces; never whitelist an arbitrary /img/characters/ reference.
export function supplementalPublicCharacterImages(cosmology, hiddenRegistry, homeSource, cardSource) {
  const allowed = new Set();
  const required = new Set();
  for (const [id, entity] of Object.entries(cosmology)) {
    if (!entity || hiddenRegistry[id] ||
        (typeof entity.characterId === "string" && hiddenRegistry[entity.characterId])) continue;
    if (typeof entity.imageSrc === "string" && entity.imageSrc.startsWith("/img/characters/")) {
      allowed.add(entity.imageSrc);
    }
  }
  for (const ref of imageReferences(homeSource)) {
    if (ref.startsWith("/img/characters/")) allowed.add(ref);
  }
  // Card filenames are stored separately from the shared image registry.
  // Read actual card references instead of publishing the entire cards folder.
  for (const match of cardSource.matchAll(/\bimageFile:\s*"([A-Za-z0-9_-]+\.webp)"/g)) {
    const ref = "/img/characters/party/cards/" + match[1];
    allowed.add(ref);
    required.add(ref);
  }
  return {allowed, required};
}

// Hero realm illustrations are resolved via template strings at runtime;
// the static /img/ scanner cannot discover these dynamic asset references.
// Collect only explicit .webp filenames from the public realm gallery/index.
export function referencedRealmImageAssets(gallerySource, worldSource) {
  const gallery = [...gallerySource.matchAll(/\bimageFile:\s*"([A-Za-z0-9_-]+\.webp)"/g)]
    .map((match) => match[1]);
  const worldBlock = /const realmImageFiles[^=]*=\s*\{([\s\S]*?)\};/.exec(worldSource)?.[1];
  const world = worldBlock
    ? [...worldBlock.matchAll(/:\s*'([A-Za-z0-9_-]+\.webp)'/g)].map((match) => match[1])
    : [];
  if (!gallery.length || !world.length) {
    throw new Error("Cannot determine public realm illustration assets.");
  }
  return new Set([...gallery, ...world].map((file) => "/img/realms/" + file));
}

/** Only versioned, approved CMS catalog assets may enter the public stage. */
export function approvedArchiveSymbolAssets(entries) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error("Archive symbol manifest is missing.");
  const assets = new Set(), ids = new Set();
  for (const entry of entries) {
    if (!entry || typeof entry.id !== "string" || !/^[a-z]+(?:-[a-z]+)*$/.test(entry.id) ||
        entry.asset !== `/img/symbols/${entry.id}.svg` || ids.has(entry.id)) {
      throw new Error("Invalid or duplicate approved archive symbol asset.");
    }
    ids.add(entry.id);
    assets.add(entry.asset);
  }
  return assets;
}

export async function verifyApprovedArchiveSymbolAssets(root, entries) {
  const assets = approvedArchiveSymbolAssets(entries);
  for (const asset of assets) {
    try { await fs.access(path.join(root, "static", asset.slice(1))); }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      throw new Error("An approved archive symbol asset is missing: " + asset);
    }
  }
  return assets;
}

async function copyImages(stage, publicRegistry, hiddenRegistry, teasers) {
  const allowedCharacterImages = new Set(), hiddenImages = new Set();
  function addCharacterImages(out, character) {
    if (typeof character.imageSrc === "string") out.add(character.imageSrc);
    if (Array.isArray(character.images)) {
      for (const image of character.images) {
        if (typeof image.src === "string") out.add(image.src);
      }
    }
  }
  Object.values(publicRegistry).forEach((c) => addCharacterImages(allowedCharacterImages, c));
  Object.values(hiddenRegistry).forEach((c) => addCharacterImages(hiddenImages, c));
  const cosmology = await readJSON(path.join(stage, "src/data/cosmology.json"));
  const homeSource = await fs.readFile(path.join(stage, "src/data/home.ts"), "utf8");
  const cardSource = await fs.readFile(path.join(stage, "src/components/ProtagonistCards.tsx"), "utf8");
  const {allowed: supplementalImages, required: requiredImages} =
    supplementalPublicCharacterImages(cosmology, hiddenRegistry, homeSource, cardSource);
  for (const ref of supplementalImages) allowedCharacterImages.add(ref);
  const realmGallerySource = await fs.readFile(path.join(stage, "src/components/RealmGallery.tsx"), "utf8");
  const worldIndexSource = await fs.readFile(path.join(stage, "src/pages/world/index.tsx"), "utf8");
  const realmImages = referencedRealmImageAssets(realmGallerySource, worldIndexSource);
  for (const ref of realmImages) requiredImages.add(ref);
  const symbolManifest = await readJSON(path.join(stage, "src/data/archiveVectorAssets.json"));
  for (const ref of await verifyApprovedArchiveSymbolAssets(ROOT, symbolManifest)) requiredImages.add(ref);
  const references = new Set(requiredImages);
  for (const root of ["src", "docs"]) {
    for (const file of await walk(path.join(stage, root))) {
      if (!/\.(json|ts|tsx|mdx?|css)$/i.test(file)) continue;
      for (const ref of imageReferences(await fs.readFile(file, "utf8"))) references.add(ref);
    }
  }
  for (const teaser of teasers) if (teaser.imageSrc) references.add(teaser.imageSrc);
  let copied = 0, missing = 0;
  for (const ref of references) {
    // Document media has its own owner-aware MDX policy and must never enter
    // through the broad illustration scanner.
    if (ref.startsWith("/img/documents/")) continue;
    if (hiddenImages.has(ref)) throw new Error("Private character image referenced publicly; cannot ship it.");
    if (ref.startsWith("/img/characters/") && !allowedCharacterImages.has(ref)) {
      throw new Error("Unapproved character image reference in public source; details withheld.");
    }
    if (ref.startsWith("/img/mysteries/") && !teasers.some((m) => m.imageSrc === ref)) {
      throw new Error("Unapproved mystery image reference in public source; details withheld.");
    }
    const name = ref.slice("/img/".length);
    if (!name || name.split("/").some((part) => part === ".." || part === ".")) {
      throw new Error("Unsafe public image path.");
    }
    const source = path.join(ROOT, "static/img", name);
    const target = path.join(stage, "static/img", name);
    try { await fs.access(source); }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      if (requiredImages.has(ref)) {
        throw new Error("A required public illustration asset is missing: " + ref);
      }
      if (ref.startsWith("/img/mysteries/")) {
        throw new Error("An approved mystery image is not present; publication blocked.");
      }
      missing++;
      continue;
    }
    await fs.mkdir(path.dirname(target), {recursive:true});
    await fs.copyFile(source, target);
    copied++;
  }
  console.log("Public image assets copied: " + copied + ", missing references: " + missing);
}

async function auditOutput(dir, forbidden) {
  const reports = [];
  for (const file of await walk(dir)) {
    if (!outputsToAudit.has(path.extname(file).toLowerCase())) continue;
    const leaked = findLeaks(await fs.readFile(file, "utf8"), forbidden);
    if (leaked.length) reports.push({
      file: path.relative(dir, file),
      matches: leaked.slice(0, 10),
    });
    if (reports.length >= 30) break;
  }
  if (reports.length) {
    for (const item of reports) {
      console.error("LEAK detected in " + item.file + ": " + item.matches.length + " restricted term(s); values withheld.");
    }
    throw new Error("Sensitive references detected in generated public files; deploy blocked.");
  }
}

async function main() {
  // Never let a failed build leave old artifacts that could be deployed by mistake.
  await fs.rm(PUBLIC_OUT, {recursive:true, force:true});
  if (!process.env.SITE_URL || !/^https:\/\//.test(process.env.SITE_URL)) {
    throw new Error("Set SITE_URL to a real HTTPS origin (not localhost) for the public build.");
  }
  try { await fs.access(path.join(ROOT, "node_modules")); }
  catch { throw new Error("Install dependencies with npm ci first."); }
  const all = await readJSON(path.join(ROOT, "src/data/characters.json"));
  // Publication decision: all registered characters, including previously hidden
  // NPCs and their mythic counterparts, are approved for this public Wiki.
  // Private/unpublished *documents* remain excluded below.
  const publicRegistry = publishEveryCharacter(all);
  const hidden = {};
  const hiddenIds = new Set();
  const publicIds = new Set(Object.keys(publicRegistry));
  const privateDocuments = (await readJSON(path.join(ROOT, "src/data/documents.json")))
    .filter((d) => !(d.status === "published" && d.visibility === "public"));
  const strictForbidden = restrictedTerms(hidden, privateDocuments, publicRegistry);
  // Public narrative descriptions can legitimately mention unrevealed names.
  // This opt-in relaxes only title/name matching, never the hidden/private ID audit.
  const allowNarrativeSpoilers = process.env.HALLYURA_ALLOW_NARRATIVE_SPOILERS === "true";
  const forbidden = allowNarrativeSpoilers
    ? restrictedIdentifiers(hidden, privateDocuments)
    : strictForbidden;
  if (allowNarrativeSpoilers) {
    console.warn("Narrative spoiler name audit relaxed; hidden/private IDs remain blocked.");
  }
  // A mystery cannot tease an unpublished character when the complete
  // character registry is public. Do not ingest private mystery definitions.
  const teasers = [];
  const stage = await fs.mkdtemp(path.join(os.tmpdir(), "hallyura-public-"));
  let succeeded = false;
  try {
    await stageCopy(stage, hiddenIds);
    // Validate public owners and MDX sources before any document body is staged.
    await publishDocumentAssets(ROOT, stage, await readJSON(path.join(ROOT, "src/data/documents.json")));
    await sanitizeStage(stage, hiddenIds, publicIds, publicRegistry);
    await sanitiseAuthoredDocs(stage, hiddenIds);
    await generateMysteryPages(stage, teasers);
    // Cheap fail-closed check before the expensive Docusaurus compilation.
    // Client-side TS/TSX constants are bundled even when JSON registries are sanitized.
    // Audit the entire staged source before compilation to catch reserved identifiers early.
    await auditOutput(path.join(stage, "src"), forbidden);
    await auditOutput(path.join(stage, "docs"), forbidden);
    // An expandable DMVault is presentation, not access control; never ship it.
    for (const file of await walk(path.join(stage, "docs"))) {
      if (!/\.mdx?$/i.test(file)) continue;
      if (/<DMVault\b|from\s+["\u0027][^"\u0027]*DMVault/.test(await fs.readFile(file, "utf8"))) {
        throw new Error("DMVault found in public docs. Remove this spoiler block before publishing.");
      }
    }
    await copyImages(stage, publicRegistry, hidden, teasers);
    console.log("Building isolated public Docusaurus output...");
    // Node cannot spawn .cmd directly on current Windows releases (EINVAL).
    const npmCli = process.env.npm_execpath ||
      path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
    const command = process.platform === "win32" ? process.execPath : "npm";
    const args = process.platform === "win32" ? [npmCli, "run", "build"] : ["run", "build"];
    const result = spawnSync(command, args, {
      cwd: stage, stdio: "inherit",
      env: {...process.env, HALLYURA_PUBLIC_BUILD: "true", BASE_URL: process.env.BASE_URL || "/"},
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error("Docusaurus build failed; publication blocked.");
    await auditOutput(path.join(stage, "build"), forbidden);
    await fs.rm(PUBLIC_OUT, {recursive:true, force:true});
    await fs.cp(path.join(stage, "build"), PUBLIC_OUT, {recursive:true});
    succeeded = true;
    console.log("PUBLIC BUILD PASSED: " + publicIds.size + " public characters, " +
      teasers.length + " mystery cards. Output: " + PUBLIC_OUT);
  } finally {
    await fs.rm(stage, {recursive:true, force:true});
    if (!succeeded) await fs.rm(PUBLIC_OUT, {recursive:true, force:true});
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("PUBLIC BUILD BLOCKED: " + (error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  });
}
