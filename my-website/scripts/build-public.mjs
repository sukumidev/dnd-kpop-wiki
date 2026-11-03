import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  publicCharacters, sanitiseRelations, restrictedTerms,
  approvedTeasers, findLeaks,
} from "./public-build-policy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_OUT = path.join(ROOT, "build-public");
const outputsToAudit = new Set([".html", ".js", ".json", ".css", ".xml", ".txt", ".svg", ".map", ".mjs", ".webmanifest", ".md", ".mdx"]);

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

function copyAllowed(relative, hiddenIds) {
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
  const characterDoc = v.match(/^docs\/characters\/(?:party|npc)\/([^/]+)\.mdx$/);
  if (characterDoc && hiddenIds.has(characterDoc[1])) return false;
  return true;
}

async function stageCopy(stage, hiddenIds) {
  await fs.cp(ROOT, stage, {
    recursive: true, dereference: false,
    filter: (src) => !path.relative(ROOT, src) ||
      copyAllowed(path.relative(ROOT, src), hiddenIds),
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

async function sanitizeStage(stage, hiddenIds, publicIds) {
  const dataDir = path.join(stage, "src/data");
  for (const registry of ["characters.json", "characters/skz.json"]) {
    const source = await readJSON(path.join(ROOT, "src/data", registry));
    await writeJSON(path.join(dataDir, registry),
      sanitiseRelations(Object.fromEntries(Object.entries(source)
        .filter(([id]) => publicIds.has(id))), hiddenIds));
  }
  const rawStatblocks = await readJSON(path.join(ROOT, "src/data/statblocks.json"));
  await writeJSON(path.join(dataDir, "statblocks.json"),
    sanitiseRelations(Object.fromEntries(Object.entries(rawStatblocks)
      .filter(([id]) => publicIds.has(id))), hiddenIds));
  const rawDocuments = await readJSON(path.join(ROOT, "src/data/documents.json"));
  const published = rawDocuments.filter((d) =>
    d && d.status === "published" && d.visibility === "public");
  await writeJSON(path.join(dataDir, "documents.json"),
    sanitiseRelations(published, hiddenIds));

  for (const file of await walk(dataDir)) {
    if (!file.endsWith(".json")) continue;
    const name = path.relative(dataDir, file).split(path.sep).join("/");
    if (["characters.json", "characters/skz.json", "statblocks.json", "documents.json", "publicMysteries.json"].includes(name)) continue;
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
  const references = new Set();
  for (const root of ["src", "docs"]) {
    for (const file of await walk(path.join(stage, root))) {
      if (!/\.(json|ts|tsx|mdx?|css)$/i.test(file)) continue;
      for (const ref of imageReferences(await fs.readFile(file, "utf8"))) references.add(ref);
    }
  }
  for (const teaser of teasers) if (teaser.imageSrc) references.add(teaser.imageSrc);
  let copied = 0, missing = 0;
  for (const ref of references) {
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
  const all = {...await readJSON(path.join(ROOT, "src/data/characters.json")),
    ...await readJSON(path.join(ROOT, "src/data/characters/skz.json"))};
  const hidden = Object.fromEntries(Object.entries(all).filter(([, c]) => c.visibility !== "public"));
  const publicRegistry = publicCharacters(all);
  const hiddenIds = new Set(Object.keys(hidden));
  const publicIds = new Set(Object.keys(publicRegistry));
  const privateDocuments = (await readJSON(path.join(ROOT, "src/data/documents.json")))
    .filter((d) => !(d.status === "published" && d.visibility === "public"));
  const forbidden = restrictedTerms(hidden, privateDocuments, publicRegistry);
  const teasers = approvedTeasers(await getPrivateTeasers(), hidden, forbidden);
  const stage = await fs.mkdtemp(path.join(os.tmpdir(), "hallyura-public-"));
  let succeeded = false;
  try {
    await stageCopy(stage, hiddenIds);
    await sanitizeStage(stage, hiddenIds, publicIds);
    await generateMysteryPages(stage, teasers);
    // Cheap fail-closed check before the expensive Docusaurus compilation.
    await auditOutput(path.join(stage, "src/data"), forbidden);
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
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    const result = spawnSync(npm, ["run", "build"], {
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
