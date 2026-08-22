import path from "node:path";
import fs from "node:fs/promises";
import { characters as characterRegistry } from "../src/data/characters";
import { runDataValidation } from "./preflight-validation";
import type { GenerateOptions, GenerateResult } from "./generate-types";

type CharacterEntry = {
  id?: string;
  title?: string;
  sidebar_label?: string;
  group?: "party" | "npc";
  subtitle?: string | null;
  imageSrc?: string | null;
  status?: string;
  factionId?: string | null;
  regionId?: string | null;
};

type CharactersJson = Record<string, CharacterEntry>;

const ROOT = process.cwd();
const DOCS_ROOT = path.join(ROOT, "docs", "characters");

function parseOptions(argv = process.argv.slice(2)): GenerateOptions {
  const args = new Set(argv);

  return {
    dryRun: args.has("--dry-run") || args.has("-n"),
    force: args.has("--force") || args.has("-f"),
  };
}

function getGroupFolder(entry: CharacterEntry): "party" | "npc" {
  return entry.group ?? "npc";
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
characterId: "${escapeYaml(id)}"
---

import CharacterPageFromDoc, { CharacterIntroduction } from '@site/src/components/CharacterPageFromDoc';
import CharacterImageCarousel from '@site/src/components/CharacterImageCarousel';

<CharacterPageFromDoc>

<CharacterIntroduction>

<!-- Introducción sin encabezado -->
- ...

</CharacterIntroduction>

## Backstory
- ...

## Campaña
- ...

## Personalidad
- ...

## Datos curiosos
- ...

## Apariencia
- ...

### Otros looks

<CharacterImageCarousel />

</CharacterPageFromDoc>
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

export async function generateCharacterPages(options: GenerateOptions): Promise<GenerateResult> {
  const characters = characterRegistry as CharactersJson;

  const ids = Object.keys(characters);
  if (!ids.length) {
    console.log("No hay personajes en el registro de personajes");
    return { type: "characters", created: 0, overwritten: 0, skipped: 0 };
  }

  let created = 0;
  let skipped = 0;
  let overwritten = 0;

  for (const id of ids) {
    const entry = characters[id] ?? {};
    const group = getGroupFolder(entry);

    const folder = path.join(DOCS_ROOT, group);
    const outFile = path.join(folder, `${id}.mdx`);

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

    await ensureDir(folder, options);
    await fs.writeFile(outFile, content, "utf8");

    if (exists) overwritten++;
    else created++;
  }

  return { type: "characters", created, overwritten, skipped };
}

async function main() {
  const options = parseOptions();
  runDataValidation();
  const result = await generateCharacterPages(options);
  printResult(result, options);
}

if (path.basename(process.argv[1] ?? "") === "generate-character-pages.ts") {
  main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
}
