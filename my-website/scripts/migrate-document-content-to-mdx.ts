import fs from "node:fs/promises";
import path from "node:path";
import {DOCUMENT_CONTENT_DIRECTORY, resolveDocumentMdxPath} from "./document-content";

type JsonDocument = Record<string, unknown> & {
  id?: unknown;
  content?: unknown;
  contentFormat?: unknown;
  contentPath?: unknown;
};

type Options = {
  input: string;
  dryRun: boolean;
  force: boolean;
  removeInlineContent: boolean;
  ids: Set<string>;
};

export function parseMigrationArgs(argv: string[]): Options {
  const options: Options = {
    input: "src/data/documents.json",
    dryRun: false,
    force: false,
    removeInlineContent: false,
    ids: new Set(),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--input" && next) { options.input = next; index += 1; }
    else if (arg === "--id" && next) { options.ids.add(next); index += 1; }
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--remove-inline-content") options.removeInlineContent = true;
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  return options;
}

function safeFileStem(id: string): string {
  const stem = id.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!stem) throw new Error(`Document id ${JSON.stringify(id)} cannot produce a safe MDX filename.`);
  return stem;
}

async function exists(filePath: string): Promise<boolean> {
  try { await fs.access(filePath); return true; } catch { return false; }
}

export async function migrate(options: Options, projectRoot = process.cwd()) {
  const inputPath = path.resolve(projectRoot, options.input);
  const parsed: unknown = JSON.parse(await fs.readFile(inputPath, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("documents.json must remain an array.");

  const documents = parsed as JsonDocument[];
  const summary = {created: [] as string[], skipped: [] as string[], conflicts: [] as string[], errors: [] as string[]};
  let jsonChanged = false;

  for (const document of documents) {
    const id = typeof document.id === "string" ? document.id : "<missing-id>";
    if (options.ids.size > 0 && !options.ids.has(id)) continue;
    if (document.contentFormat === "mdx") { summary.skipped.push(`${id}: already uses MDX`); continue; }
    if (typeof document.content !== "string" || document.content.length === 0) {
      summary.skipped.push(`${id}: no inline content`);
      continue;
    }

    try {
      if (typeof document.id !== "string" || !document.id.trim()) throw new Error("missing a valid id");
      const contentPath = `${safeFileStem(document.id)}.mdx`;
      const resolved = resolveDocumentMdxPath(projectRoot, contentPath);
      if (await exists(resolved.absolutePath) && !options.force) {
        summary.conflicts.push(`${id}: ${contentPath} already exists (use --force to overwrite)`);
        continue;
      }

      if (!options.dryRun) {
        await fs.mkdir(path.resolve(projectRoot, DOCUMENT_CONTENT_DIRECTORY), {recursive: true});
        await fs.writeFile(resolved.absolutePath, `${document.content.replace(/\s+$/, "")}\n`, "utf8");
        document.contentFormat = "mdx";
        document.contentPath = contentPath;
        if (options.removeInlineContent) delete document.content;
      }
      summary.created.push(`${id}: ${contentPath}${options.dryRun ? " (dry-run)" : ""}`);
      jsonChanged = true;
    } catch (error) {
      summary.errors.push(`${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (!options.dryRun && jsonChanged) {
    await fs.writeFile(inputPath, `${JSON.stringify(documents, null, 2)}\n`, "utf8");
  }
  return summary;
}

export async function main() {
  const options = parseMigrationArgs(process.argv.slice(2));
  const summary = await migrate(options);
  console.log("Document content migration summary");
  for (const [label, entries] of Object.entries(summary)) {
    console.log(`${label}: ${entries.length}`);
    for (const entry of entries) console.log(`  - ${entry}`);
  }
  if (summary.errors.length > 0) process.exitCode = 1;
}

const isMain = process.argv[1]?.replace(/\\/g, "/").endsWith("/migrate-document-content-to-mdx.ts") ?? false;
if (isMain) main().catch((error) => { console.error(error); process.exitCode = 1; });
