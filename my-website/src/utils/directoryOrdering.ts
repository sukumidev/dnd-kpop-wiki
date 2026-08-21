import type {Faction} from "@site/src/data/factions";

/**
 * Narrative order used by every directory that presents factions.
 * Add future priority factions here by ID; visible titles remain data-driven.
 */
export const FACTION_PRIORITY = ["svt", "enhypen", "skz", "nct"] as const;

/** The party is presented separately from realm sections in the character directory. */
export const FEATURED_CHARACTER_FACTION_ID = "panes-del-destino";

/** Known realms with an intentional narrative order; unlisted realms follow alphabetically. */
export const REALM_PRIORITY = ["hyberia", "jeyperia", "sylmorien"] as const;

export const NO_REALM_GROUP_ID = "__no-realm__";

const spanishCollator = new Intl.Collator("es", {sensitivity: "base"});
const factionPriorityById = new Map<string, number>(
  FACTION_PRIORITY.map((factionId, index) => [factionId, index]),
);

export function compareTitles(a: string, b: string) {
  return spanishCollator.compare(a, b);
}

export function compareRealmGroups(
  a: {id: string; title: string},
  b: {id: string; title: string},
) {
  if (a.id === NO_REALM_GROUP_ID) return 1;
  if (b.id === NO_REALM_GROUP_ID) return -1;

  const aIndex = REALM_PRIORITY.indexOf(a.id as (typeof REALM_PRIORITY)[number]);
  const bIndex = REALM_PRIORITY.indexOf(b.id as (typeof REALM_PRIORITY)[number]);
  const aOrder = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
  const bOrder = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;

  if (aOrder !== bOrder) return aOrder - bOrder;
  return compareTitles(a.title, b.title);
}

export function getFactionPriority(factionId: string) {
  return factionPriorityById.get(factionId) ?? Number.MAX_SAFE_INTEGER;
}

export function compareFactionsByPriority<
  T extends Pick<Faction, "id" | "title">,
>(a: T, b: T) {
  const priorityDifference = getFactionPriority(a.id) - getFactionPriority(b.id);

  if (priorityDifference !== 0) return priorityDifference;
  return compareTitles(a.title, b.title);
}

export function sortFactionsByPriority<T extends Pick<Faction, "id" | "title">>(
  factions: readonly T[],
): T[] {
  return [...factions].sort(compareFactionsByPriority);
}

export function sortByExplicitOrderThenTitle<
  T extends {title: string; sortOrder?: number | null},
>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

    if (aOrder !== bOrder) return aOrder - bOrder;
    return compareTitles(a.title, b.title);
  });
}
