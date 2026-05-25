import path from "node:path";
import fs from "node:fs/promises";
import { runDataValidation } from "./preflight-validation";

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
const CHARACTERS_JSON = path.join(ROOT, "src", "data", "characters.json");
const DOCS_ROOT = path.join(ROOT, "docs", "characters");

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run") || args.has("-n");
const FORCE = args.has("--force") || args.has("-f");

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

import CharacterPageFromDoc from '@site/src/components/CharacterPageFromDoc';
import CharacterImageCarousel from '@site/src/components/CharacterImageCarousel';

<CharacterPageFromDoc>

<!-- Escribe aqui tu lore en markdown -->

## Resumen
- ...

## Apariencia

### Otros Looks
<CharacterImageCarousel />
- ...

## Personalidad
- ...

## Backstory
- ...

## Vida actual
- ...

## Relaciones
- ...

## Apariciones
- ...

## Datos curiosos
- ...

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

async function ensureDir(p: string) {
  if (DRY_RUN) return;
  await fs.mkdir(p, { recursive: true });
}

async function main() {
  runDataValidation();

  const raw = await fs.readFile(CHARACTERS_JSON, "utf8");
  const characters: CharactersJson = JSON.parse(raw);

  const ids = Object.keys(characters);
  if (!ids.length) {
    console.log("No hay personajes en characters.json");
    return;
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

    if (exists && !FORCE) {
      skipped++;
      continue;
    }

    const content = mdxTemplate({ id, title, sidebarLabel });

    if (DRY_RUN) {
      console.log(`${exists ? "[WOULD OVERWRITE]" : "[WOULD CREATE]"} ${path.relative(ROOT, outFile)}`);
      continue;
    }

    await ensureDir(folder);
    await fs.writeFile(outFile, content, "utf8");

    if (exists) overwritten++;
    else created++;
  }

  const mode = DRY_RUN ? "DRY RUN" : "WRITE";
  console.log(`\n${mode} terminado`);
  console.log(`Creado: ${created}`);
  console.log(`Sobrescritos: ${overwritten}`);
  console.log(`Omitidos: ${skipped} ${FORCE ? "(FORCE activo, no deberia haber omitidos)" : "(ya existian)"}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
