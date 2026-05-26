import path from "node:path";
import fs from "node:fs/promises";
import { runDataValidation } from "./preflight-validation";
import type { GenerateOptions, GenerateResult } from "./generate-types";

type FactionSubunit = {
  id?: string;
  title?: string;
  role?: string | null;
  leaderCharacterId?: string | null;
  memberIds?: string[];
  bullets?: string[];
};

type FactionEntry = {
  id?: string;
  title?: string;
  sidebar_label?: string;
  subtitle?: string | null;
  imageSrc?: string | null;
  caption?: string | null;
  type?: string | null;
  status?: string;
  reputation?: string | null;
  regionId?: string | null;
  baseLocationId?: string | null;
  leaderCharacterId?: string | null;
  allyFactionIds?: string[];
  rivalFactionIds?: string[];
  subunits?: FactionSubunit[];
  goal?: string | null;
  methods?: string | null;
};

type FactionsJson = Record<string, FactionEntry>;

const ROOT = process.cwd();
const FACTIONS_JSON = path.join(ROOT, "src", "data", "factions.json");
const DOCS_ROOT = path.join(ROOT, "docs", "factions");

function parseOptions(argv = process.argv.slice(2)): GenerateOptions {
  const args = new Set(argv);

  return {
    dryRun: args.has("--dry-run") || args.has("-n"),
    force: args.has("--force") || args.has("-f"),
  };
}

function escapeYaml(value: string) {
  return value.replace(/"/g, '\\"');
}

function mdxTemplate(params: { id: string; title: string; sidebarLabel: string }) {
  const { id, title, sidebarLabel } = params;

  return `---
title: "${escapeYaml(title)}"
sidebar_label: "${escapeYaml(sidebarLabel)}"
displayed_sidebar: wiki
factionId: "${escapeYaml(id)}"
---

import FactionPageFromDoc from '@site/src/components/FactionPageFromDoc';

<FactionPageFromDoc>

## Resumen
- ...

## Proposito
- ...

## Apariciones en campana
- ...

</FactionPageFromDoc>
`;
}

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(p: string, options: GenerateOptions) {
  if (options.dryRun) return;
  await fs.mkdir(p, { recursive: true });
}

function printResult(result: GenerateResult, options: GenerateOptions) {
  const mode = options.dryRun ? "DRY RUN" : "WRITE";
  console.log(`\n${mode} terminado`);
  console.log(`Creado: ${result.created}`);
  console.log(`Sobrescritos: ${result.overwritten}`);
  console.log(`Omitidos: ${result.skipped} ${options.force ? "(FORCE activo, no deberia haber omitidos)" : "(ya existian)"}`);
}

export async function generateFactionPages(options: GenerateOptions): Promise<GenerateResult> {
  const raw = await fs.readFile(FACTIONS_JSON, "utf8");
  const factions: FactionsJson = JSON.parse(raw);

  const ids = Object.keys(factions);
  if (!ids.length) {
    console.log("No hay facciones en factions.json");
    return { type: "factions", created: 0, overwritten: 0, skipped: 0 };
  }

  let created = 0;
  let skipped = 0;
  let overwritten = 0;

  for (const id of ids) {
    const entry = factions[id] ?? {};
    const outFile = path.join(DOCS_ROOT, `${id}.mdx`);

    const title = entry.title ?? id;
    const sidebarLabel = entry.sidebar_label ?? entry.title ?? id;

    const exists = await fileExists(outFile);
    if (exists && !options.force) {
      skipped++;
      continue;
    }

    const content = mdxTemplate({ id, title, sidebarLabel });

    if (options.dryRun) {
      console.log(`${exists ? "[WOULD OVERWRITE]" : "[WOULD CREATE]"} ${path.relative(ROOT, outFile)}`);
      continue;
    }

    await ensureDir(DOCS_ROOT, options);
    await fs.writeFile(outFile, content, "utf8");

    if (exists) overwritten++;
    else created++;
  }

  return { type: "factions", created, overwritten, skipped };
}

async function main() {
  const options = parseOptions();
  runDataValidation();
  const result = await generateFactionPages(options);
  printResult(result, options);
}

if (path.basename(process.argv[1] ?? "") === "generateFactionsMdx.ts") {
  main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
}
