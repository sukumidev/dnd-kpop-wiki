import fs from "node:fs";
import path from "node:path";

type LegacyLink = {
  label?: string | null;
  doc?: string | null;
};

type LegacyCharacterLink = LegacyLink & {
  id?: string | null;
};

type LegacyObjective = {
  id: string;
  label: string;
  done: boolean;
  failed?: boolean;
  weight?: number;
  optional?: boolean;
  notes?: string | null;
};

type LegacyQuest = {
  id: string;
  parentQuestId?: string | null;
  childQuestIds?: string[];

  sessionStarted?: number | string | null;
  lastUpdatedSession?: number | string | null;

  title: string;
  subtitle?: string | null;
  type?: string;
  types?: string[];
  status: string;
  visibility?: string;
  priority?: string | null;

  summary: string;
  description?: string | null;

  progress?: {
    mode: "manual" | "objectives" | "children";
    current?: number;
    goal?: number;
    percent?: number;
  };

  objectives?: LegacyObjective[];
  questGiver?: LegacyLink | null;
  factions?: LegacyLink[];
  characters?: LegacyCharacterLink[];
  locations?: LegacyLink[];
  sessions?: LegacyLink[];

  rewards?: string[];
  tags?: string[];

  imageSrc?: string | null;
  accent?: string | null;

  isRepeatable?: boolean;
  failedConditions?: string[];
  notes?: string | null;
  sortOrder?: number;
};

type LegacyQuestsById = Record<string, LegacyQuest>;

const CHARACTER_ID_ALIASES: Record<string, string> = {
  joshua: "svt-joshua",
  mark: "nct-mark",
};

const inputPath = path.resolve("src/data/quests.json");
const backupPath = path.resolve("src/data/quests.backup.json");
const outputPath = inputPath;

const raw = fs.readFileSync(inputPath, "utf8");
const quests = JSON.parse(raw) as LegacyQuestsById;

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(inputPath, backupPath);
}

const migrated = Object.fromEntries(
  Object.entries(quests).map(([key, quest]) => {
    if (key !== quest.id) {
      throw new Error(`Quest root key "${key}" does not match id "${quest.id}".`);
    }

    const { factionIds, regionIds, relatedLinks } = parseRelationLinks(quest.factions ?? []);
    const { locationIds, relatedLinks: locationRelatedLinks } = parseLocationLinks(quest.locations ?? []);
    const allRelatedLinks = [...relatedLinks, ...locationRelatedLinks];

    const migratedQuest = compactObject({
      id: quest.id,
      parentQuestId: normalizeNull(quest.parentQuestId),

      title: quest.title,
      subtitle: normalizeNull(quest.subtitle),
      types: quest.types ?? (quest.type ? [quest.type] : []),
      status: quest.status,
      visibility: quest.visibility ?? "public",
      priority: normalizeNull(quest.priority),

      summary: quest.summary,
      description: normalizeNull(quest.description),
      progress: quest.progress,
      objectives: quest.objectives?.map(normalizeObjective),

      sessionStartedId: toSessionId(quest.sessionStarted),
      lastUpdatedSessionId: toSessionId(quest.lastUpdatedSession),
      sessionIds: parseSessionIds(quest.sessions ?? []),

      questGiver: toDocPathLink(quest.questGiver),

      factionIds,
      regionIds,
      characterIds: parseCharacterIds(quest.characters ?? []),
      locationIds,
      relatedLinks: allRelatedLinks,

      rewards: quest.rewards,
      tags: quest.tags?.map(slugify).filter(Boolean),

      imageSrc: normalizeNull(quest.imageSrc),
      accent: normalizeNull(quest.accent),

      isRepeatable: quest.isRepeatable,
      failedConditions: quest.failedConditions,
      notes: normalizeNull(quest.notes),
      sortOrder: quest.sortOrder,
    });

    return [key, migratedQuest];
  }),
);

fs.writeFileSync(outputPath, `${JSON.stringify(migrated, null, 2)}\n`, "utf8");

console.log(`Migrated ${Object.keys(migrated).length} quests.`);
console.log(`Backup: ${backupPath}`);
console.log(`Output: ${outputPath}`);

function normalizeObjective(objective: LegacyObjective) {
  return compactObject({
    id: objective.id,
    label: objective.label,
    done: Boolean(objective.done),
    failed: objective.failed,
    weight: objective.weight,
    optional: objective.optional,
    notes: normalizeNull(objective.notes),
  });
}

function parseRelationLinks(links: LegacyLink[]) {
  const factionIds: string[] = [];
  const regionIds: string[] = [];
  const relatedLinks: Array<{ label: string | null; docPath: string | null }> = [];

  for (const link of links) {
    const docPath = normalizeNull(link.doc);
    const label = normalizeNull(link.label);

    if (docPath?.startsWith("factions/")) {
      pushUnique(factionIds, docPath.replace(/^factions\//, ""));
      continue;
    }

    if (docPath?.startsWith("realms/")) {
      pushUnique(regionIds, docPath.replace(/^realms\//, ""));
      continue;
    }

    if (label || docPath) {
      relatedLinks.push({ label, docPath });
    }
  }

  return { factionIds, regionIds, relatedLinks };
}

function parseCharacterIds(characters: LegacyCharacterLink[]) {
  const ids: string[] = [];

  for (const character of characters) {
    const rawId = normalizeNull(character.id) ?? normalizeNull(character.doc)?.split("/").at(-1) ?? null;
    const id = rawId ? CHARACTER_ID_ALIASES[rawId] ?? rawId : null;
    if (id) pushUnique(ids, id);
  }

  return ids.length > 0 ? ids : undefined;
}

function parseLocationLinks(locations: LegacyLink[]) {
  const locationIds: string[] = [];
  const relatedLinks: Array<{ label: string | null; docPath: string | null }> = [];

  for (const location of locations) {
    const docPath = normalizeNull(location.doc);
    const label = normalizeNull(location.label);

    if (docPath?.startsWith("world/locations/")) {
      pushUnique(locationIds, docPath.split("/").at(-1)!);
      continue;
    }

    if (label || docPath) {
      relatedLinks.push({ label, docPath });
    }
  }

  return {
    locationIds: locationIds.length > 0 ? locationIds : undefined,
    relatedLinks,
  };
}

function parseSessionIds(sessions: LegacyLink[]) {
  const ids = sessions
    .map((session) => toSessionId(session.doc ?? session.label ?? null))
    .filter(Boolean) as string[];

  return ids.length > 0 ? Array.from(new Set(ids)) : undefined;
}

function toDocPathLink(link: LegacyLink | null | undefined) {
  if (!link) return undefined;

  const label = normalizeNull(link.label);
  const docPath = normalizeNull(link.doc);

  if (!label && !docPath) return undefined;

  return { label, docPath };
}

function toSessionId(value: number | string | null | undefined): string | null {
  const normalized = normalizeNull(value);
  if (normalized === null) return null;

  if (typeof normalized === "number") {
    if (Number.isInteger(normalized)) return String(normalized).padStart(2, "0");
    return String(normalized).replace(".", "-");
  }

  const trimmed = normalized.trim();
  const sessionPathMatch = trimmed.match(/campaign\/sessions\/(.+)$/);
  if (sessionPathMatch) return sessionPathMatch[1];

  if (/^\d+$/.test(trimmed)) return trimmed.padStart(2, "0");

  return slugify(trimmed);
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function normalizeNull<T>(value: T | "—" | "-" | "" | null | undefined): T | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && ["—", "-", ""].includes(value.trim())) return null;
  return value as T;
}

function pushUnique<T>(target: T[], value: T) {
  if (!target.includes(value)) target.push(value);
}

function compactObject<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === undefined) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );
}
