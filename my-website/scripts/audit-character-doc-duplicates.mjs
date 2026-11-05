import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(HERE, "..");
const DOCS_ROOT = path.join(PROJECT_ROOT, "docs", "characters");

const LEGACY_LINES = new Set([
  "<CharacterPageFromDoc>",
  "</CharacterPageFromDoc>",
  "<CharacterImageCarousel />",
  "<!-- Escribe aquí tu lore en markdown -->",
  "## Resumen",
  "## Apariencia",
  "### Otros Looks",
  "### Otros looks",
  "## Personalidad",
  "## Backstory",
  "## Vida actual",
  "## Relaciones",
  "## Apariciones",
  "## Datos curiosos",
  "- …",
  "- ...",
]);

export function isLegacyEmptyProfile(source) {
  if (!source.includes("<!-- Escribe aquí tu lore en markdown -->")) return false;
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.length > 0 && lines.every(
    (line) => LEGACY_LINES.has(line) ||
      /^import Character(?:PageFromDoc|ImageCarousel)\b.*;$/.test(line),
  );
}

export function hasMeaningfulIntroduction(source) {
  const raw = source.match(/<CharacterIntroduction>\s*([\s\S]*?)\s*<\/CharacterIntroduction>/)?.[1] ?? "";
  const plain = raw.replace(/<!--[\s\S]*?-->/g, "").trim();
  return plain.length >= 70 && !plain.includes("Esta página todavía necesita contenido") &&
    !/^[-*]\s*(?:\.{3}|…)$/m.test(plain);
}

async function walk(dir, predicate = () => true) {
  const files = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full, predicate));
    else if (entry.isFile() && predicate(full)) files.push(full);
  }
  return files;
}

async function readCharacterDocuments() {
  const paths = await walk(DOCS_ROOT, (f) => f.endsWith(".mdx"));
  const docs = [];
  for (const fullPath of paths) {
    const content = await fs.readFile(fullPath, "utf8");
    const relative = path.relative(DOCS_ROOT, fullPath).replaceAll(path.sep, "/");
    const id = content.match(/^characterId:\s*["']([^"']+)["']\s*$/m)?.[1] ??
      path.basename(fullPath, ".mdx");
    docs.push({ id, fullPath, relative, content });
  }
  return docs;
}

async function buildReferenceIndex() {
  const roots = [path.join(PROJECT_ROOT, "docs"), path.join(PROJECT_ROOT, "src"),
    path.join(PROJECT_ROOT, "sidebars.ts"), path.join(PROJECT_ROOT, "docusaurus.config.ts")];
  const files = [];
  for (const root of roots) {
    if (root.endsWith(".ts")) files.push(root);
    else files.push(...await walk(root, (f) => /\.(md|mdx|ts|tsx|js|mjs|json)$/.test(f)));
  }
  return Promise.all(files.map(async (fullPath) => ({
    fullPath,
    text: await fs.readFile(fullPath, "utf8"),
  })));
}

function findLegacyReferences(id, excludedPath, referenceIndex) {
  const needle = `characters/misc/${id}`;
  return referenceIndex
    .filter(({ fullPath, text }) => fullPath !== excludedPath && text.includes(needle))
    .map(({ fullPath }) => path.relative(PROJECT_ROOT, fullPath).replaceAll(path.sep, "/"));
}

export async function auditCharacterDocs(options = {}) {
  const write = options.write ?? false;
  const docs = await readCharacterDocuments();
  const registry = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, "src/data/characters.json"), "utf8"));
  const referenceIndex = await buildReferenceIndex();
  const byId = new Map();
  for (const doc of docs) byId.set(doc.id, [...(byId.get(doc.id) ?? []), doc]);

  const duplicated = [...byId.entries()].filter(([, entries]) => entries.length > 1);
  const inventory = [];
  let removed = 0;
  for (const [id, entries] of duplicated) {
    const legacy = entries.filter((d) => d.relative.startsWith("misc/"));
    const record = registry[id];
    const canonicalRel = record ? `${record.group}/${id}.mdx` : null;
    const canonical = entries.find((d) => d.relative === canonicalRel);
    for (const old of legacy) {
      const legacyEmpty = isLegacyEmptyProfile(old.content);
      const canonicalMeaningful = canonical ? hasMeaningfulIntroduction(canonical.content) : false;
      const references = findLegacyReferences(id, old.fullPath, referenceIndex);
      const safe = Boolean(legacyEmpty && canonicalMeaningful && references.length === 0);
      let outcome = safe ? "safe-to-remove" : "manual-review";
      if (safe && write) {
        await fs.unlink(old.fullPath);
        removed++;
        outcome = "removed";
      }
      inventory.push({ id, legacy: old.relative, canonical: canonicalRel, references, outcome });
    }
  }

  return { scanned: docs.length, duplicateCharacterIds: duplicated.length, removed, inventory };
}

async function main() {
  const write = process.argv.includes("--write");
  if (write && !process.argv.includes("--confirm-safe-only")) {
    throw new Error("Para eliminar duplicados seguros utiliza --write --confirm-safe-only.");
  }
  const result = await auditCharacterDocs({ write });
  console.log(JSON.stringify(result, null, 2));
  console.log(write
    ? `Se eliminaron ${result.removed} plantillas heredadas comprobadas.`
    : "Solo auditoría. No se modificó ningún archivo.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
