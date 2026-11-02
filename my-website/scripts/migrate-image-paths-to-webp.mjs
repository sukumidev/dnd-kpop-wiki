import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// From my-website/: node scripts/migrate-image-paths-to-webp.mjs [--write|--check]
// Run npm run images:webp before --write. This script never deletes images.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imageRoot = path.join(projectRoot, "static", "img");
const sourceRoots = ["src", "docs", "static/data"];
const extensions = new Set([".json", ".jsonc", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".md", ".mdx", ".css", ".html", ".yaml", ".yml"]);
const ignoredDirs = new Set(["node_modules", ".git", ".docusaurus", "build", "dist"]);

// Only local /img/ paths; allows spaces, accents, and encoded spaces.
const IMAGE_REFERENCE = /(?<![a-z0-9_:/.])\/img\/[^\r\n"'\x60<>]*?\.(?:png|jpe?g)(?=$|[?#"'\x60\s),\]>};])/gi;

function posix(value) {
  return value.split(path.sep).join("/");
}

async function walk(directory, filter = () => true) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory() && !ignoredDirs.has(entry.name) && filter(file, true)) {
      files.push(...await walk(file, filter));
    } else if (entry.isFile() && filter(file, false)) {
      files.push(file);
    }
  }
  return files;
}

export function resolveImageReference(reference, assetPaths) {
  let relative;
  try {
    relative = decodeURIComponent(reference.slice("/img/".length)).replace(/\\/g, "/");
  } catch {
    return { replacement: null, reason: "invalid URL encoding" };
  }
  if (relative.startsWith("/") || relative.split("/").includes("..")) {
    return { replacement: null, reason: "unsafe path" };
  }
  const extension = path.posix.extname(relative);
  if (!/^\.(png|jpe?g)$/i.test(extension)) {
    return { replacement: null, reason: "unsupported extension" };
  }
  const candidate = relative.slice(0, -extension.length) + ".webp";
  if (!assetPaths.has(candidate)) {
    return {
      replacement: null,
      reason: assetPaths.has(relative) ? "WebP not generated yet" : "original and WebP missing",
    };
  }
  return {
    replacement: reference.slice(0, -extension.length) + ".webp",
    reason: null,
  };
}

export function rewriteImageReferences(content, assetPaths) {
  const unresolved = [];
  let found = 0;
  let rewritten = 0;
  const result = content.replace(IMAGE_REFERENCE, (reference) => {
    found++;
    const { replacement, reason } = resolveImageReference(reference, assetPaths);
    if (!replacement) {
      unresolved.push({ reference, reason });
      return reference;
    }
    rewritten++;
    return replacement;
  });
  return { content: result, found, rewritten, unresolved };
}

async function getSourceFiles() {
  const files = (await Promise.all(sourceRoots.map((root) =>
    walk(path.join(projectRoot, root), (file, isDir) => {
      const relative = posix(path.relative(projectRoot, file));
      if (isDir) return relative !== "docs/characters/misc";
      return !/\.backup\.json$/i.test(relative) &&
        extensions.has(path.extname(file).toLowerCase());
    })
  ))).flat();
  for (const rootFile of ["docusaurus.config.ts", "sidebars.ts"]) {
    files.push(path.join(projectRoot, rootFile));
  }
  return files;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if ([...args].some((arg) => arg !== "--write" && arg !== "--check") ||
      (args.has("--write") && args.has("--check"))) {
    throw new Error("Usage: migrate-image-paths-to-webp.mjs [--write | --check]");
  }
  const write = args.has("--write");
  const check = args.has("--check");
  const assetFiles = await walk(imageRoot);
  if (!assetFiles.length) throw new Error("No static/img assets found. Aborting.");
  const assets = new Set(assetFiles.map((file) => posix(path.relative(imageRoot, file))));
  const sources = await getSourceFiles();

  let scanned = 0, found = 0, rewritten = 0;
  const planned = [], unresolved = [];
  for (const file of sources) {
    let original;
    try {
      original = await fs.readFile(file, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    scanned++;
    const updated = rewriteImageReferences(original, assets);
    const relative = posix(path.relative(projectRoot, file));
    found += updated.found;
    rewritten += updated.rewritten;
    for (const item of updated.unresolved) unresolved.push({ file: relative, ...item });
    if (updated.rewritten) planned.push({ file, content: updated.content, relative, count: updated.rewritten });
  }
  // Discover every possible change before modifying the source tree.
  if (write) {
    for (const item of planned) await fs.writeFile(item.file, item.content, "utf8");
  }
  console.log("Image routes: " + (check ? "CHECK" : write ? "WRITE" : "DRY RUN"));
  console.log("Files scanned: " + scanned + "; old references: " + found);
  console.log((write ? "Updated: " : "Would update: ") + rewritten + " references in " + planned.length + " files");
  for (const item of planned) console.log((write ? "UPDATED " : "PLAN    ") + item.relative + " (" + item.count + ")");
  if (unresolved.length) {
    console.warn("Unresolved references: " + unresolved.length);
    for (const item of unresolved.slice(0, 60)) {
      console.warn(item.file + ": " + item.reference + " (" + item.reason + ")");
    }
    if (unresolved.length > 60) console.warn("...and " + (unresolved.length - 60) + " more.");
    console.warn("Unresolved paths are preserved. Fix missing originals/targets manually.");
  }
  if (check && found) {
    console.error("CHECK FAILED: legacy PNG/JPG/JPEG paths remain.");
    process.exitCode = 1;
  } else if (check) {
    console.log("CHECK PASSED: no legacy PNG/JPG/JPEG paths remain.");
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
