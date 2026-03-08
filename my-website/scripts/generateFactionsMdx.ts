import path from "node:path";
import fs from "node:fs/promises";

type Ref = { label?: string; doc?: string };

type Subunit = {
  name?: string;
  role?: string;
  leader?: Ref;
  bullets?: string[];
  members?: Ref[];
};

type FactionEntry = {
  title?: string;
  sidebar_label?: string;
  subtitle?: string;

  type?: string;
  reputation?: string;

  base?: Ref;
  realm?: string;
  realmRef?: Ref;

  goal?: string;
  methods?: string;

  leader?: Ref;
  keyMembers?: Ref[];
  allies?: Ref[];
  rivals?: Ref[];
  subunits?: Subunit[];

  imageSrc?: string;
  caption?: string;
};

type FactionsJson = Record<string, FactionEntry>;

const ROOT = process.cwd();
const FACTIONS_JSON = path.join(ROOT, "src", "data", "factions.json"); // 👈 ajusta si tu file se llama distinto
const DOCS_ROOT = path.join(ROOT, "docs", "factions");

// CLI flags
const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run") || args.has("-n");
const FORCE = args.has("--force") || args.has("-f");

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
import Link from '@docusaurus/Link';
import factions from '@site/src/data/factions.json';

<FactionPageFromDoc>

## Resumen
- …

## Propósito
- …

## Miembros
- **Liderazgo:** …

## Sub-unidades

{(factions["${escapeYaml(id)}"]?.subunits ?? []).map((u) => (
  <div key={u.name} style={{ marginBottom: "1.25rem" }}>
    <h3>{u.name}</h3>

    {u.role ? <p><b>Rol:</b> {u.role}</p> : null}

    {u.leader ? (
      <p>
        <b>Líder:</b>{" "}
        <Link to={\`/\${u.leader.doc}\`}>{u.leader.label}</Link>
      </p>
    ) : null}

    {u.bullets?.length ? (
      <ul>
        {u.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    ) : null}

    {u.members?.length ? (
      <p>
        <b>Miembros:</b>{" "}
        {u.members.map((m, i) => (
          <span key={m.doc}>
            <Link to={\`/\${m.doc}\`}>{m.label}</Link>
            {i < u.members.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>
    ) : null}
  </div>
))}

## Apariciones en campaña
- …

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

async function ensureDir(p: string) {
  if (DRY_RUN) return;
  await fs.mkdir(p, { recursive: true });
}

async function main() {
  const raw = await fs.readFile(FACTIONS_JSON, "utf8");
  const factions: FactionsJson = JSON.parse(raw);

  const ids = Object.keys(factions);
  if (!ids.length) {
    console.log("No hay facciones en factions.json");
    return;
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
    if (exists && !FORCE) {
      skipped++;
      continue;
    }

    const content = mdxTemplate({ id, title, sidebarLabel });

    if (DRY_RUN) {
      console.log(
        `${exists ? "[WOULD OVERWRITE]" : "[WOULD CREATE]"} ${path.relative(ROOT, outFile)}`
      );
      continue;
    }

    await ensureDir(DOCS_ROOT);
    await fs.writeFile(outFile, content, "utf8");

    if (exists) overwritten++;
    else created++;
  }

  const mode = DRY_RUN ? "DRY RUN" : "WRITE";
  console.log(`\n✅ ${mode} terminado`);
  console.log(`Creado: ${created}`);
  console.log(`Sobrescritos: ${overwritten}`);
  console.log(
    `Omitidos: ${skipped} ${FORCE ? "(FORCE activo, no debería haber omitidos)" : "(ya existían)"}`
  );
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});