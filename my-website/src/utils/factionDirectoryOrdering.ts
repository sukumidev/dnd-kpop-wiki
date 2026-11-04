import type {Faction} from "../data/factions";
import registrySnapshot from "../data/factionRegistryMetadata.json";
import realmCatalog from "../data/realmCatalog.json";
import {sortByExplicitOrderThenTitle} from "./directoryOrdering";

export type FactionRegistryEntry = {
  source: "Música" | "Facciones originales";
  registryId?: number;
  registryRow: number;
  realm: string;
  firstAppearance?: number | null;
};

export type FactionDirectoryGroup<T> = {
  id: string;
  title: string;
  factions: T[];
};

const registryById = registrySnapshot as Record<string, FactionRegistryEntry>;
const collator = new Intl.Collator("es", {sensitivity: "base"});
const noRealmId = "sin-reino-asignado";
export const PARTY_GROUP_ID = "__parties__";

function slug(value: string): string {
  return value.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const realmsByAlias = new Map(
  realmCatalog.flatMap((realm) =>
    [realm.id, realm.title, ...("aliases" in realm ? realm.aliases : [])]
      .map((name) => [slug(name), realm] as const),
  ),
);
const realmRank = new Map(realmCatalog.map((realm, index) => [realm.id, index]));
const firstAdministrativeRank = realmCatalog.findIndex((realm) => "administrative" in realm);

/** Resolve catalog names and aliases without dropping unknown or blank origins. */
export function normalizeFactionRealm(value?: string | null): {id: string; title: string} {
  const key = slug(value ?? "");
  if (!key) return {id: noRealmId, title: "Sin reino asignado"};
  const catalogRealm = realmsByAlias.get(key);
  return catalogRealm
    ? {id: catalogRealm.id, title: catalogRealm.title}
    : {id: key, title: value!.trim()};
}

function compareGroups<T>(a: FactionDirectoryGroup<T>, b: FactionDirectoryGroup<T>): number {
  if (a.id === PARTY_GROUP_ID) return -1;
  if (b.id === PARTY_GROUP_ID) return 1;
  const aRank = realmRank.get(a.id) ?? firstAdministrativeRank;
  const bRank = realmRank.get(b.id) ?? firstAdministrativeRank;
  const aAdministrative = aRank >= firstAdministrativeRank && realmRank.has(a.id);
  const bAdministrative = bRank >= firstAdministrativeRank && realmRank.has(b.id);
  if (aAdministrative !== bAdministrative) return aAdministrative ? 1 : -1;
  if (aRank !== bRank) return aRank - bRank;
  return collator.compare(a.title, b.title) || a.id.localeCompare(b.id);
}

type DirectoryFaction = Pick<
  Faction,
  "id" | "title" | "type" | "realm" | "regionId" | "sortOrder" | "firstAppearance"
>;

function appearance(value?: number | null): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * A stable, non-mutating sort. The Registry row resolves equal appearances;
 * local sortOrder and ID keep unmatched factions deterministic.
 */
export function groupAndSortFactions<T extends DirectoryFaction>(
  factions: readonly T[],
  metadata: Readonly<Record<string, FactionRegistryEntry>> = registryById,
): FactionDirectoryGroup<T>[] {
  const groups = new Map<string, FactionDirectoryGroup<T>>();
  const seenIds = new Set<string>();

  for (const faction of factions) {
    if (seenIds.has(faction.id)) continue;
    seenIds.add(faction.id);
    const realm = faction.type === "party"
      ? {id: PARTY_GROUP_ID, title: "Parties"}
      : normalizeFactionRealm(
        metadata[faction.id]?.realm || faction.realm || faction.regionId,
      );
    let group = groups.get(realm.id);
    if (!group) {
      group = {...realm, factions: []};
      groups.set(realm.id, group);
    }
    group.factions.push(faction);
  }

  for (const group of groups.values()) {
    if (group.id === PARTY_GROUP_ID) {
      group.factions = sortByExplicitOrderThenTitle(group.factions);
      continue;
    }
    group.factions.sort((a, b) => {
      const aCitizens = a.id.startsWith("ciudadanos-de-");
      const bCitizens = b.id.startsWith("ciudadanos-de-");
      if (aCitizens !== bCitizens) return aCitizens ? 1 : -1;
      const aEntry = metadata[a.id];
      const bEntry = metadata[b.id];
      const aAppearance = appearance(aEntry?.firstAppearance ?? a.firstAppearance);
      const bAppearance = appearance(bEntry?.firstAppearance ?? b.firstAppearance);
      if (aAppearance !== null || bAppearance !== null) {
        if (aAppearance === null) return 1;
        if (bAppearance === null) return -1;
        if (aAppearance !== bAppearance) return aAppearance - bAppearance;
      }

      if (aEntry || bEntry) {
        if (!aEntry) return 1;
        if (!bEntry) return -1;
        const sourceDifference =
          (aEntry.source === "Música" ? 0 : 1) -
          (bEntry.source === "Música" ? 0 : 1);
        if (sourceDifference) return sourceDifference;
        if (aEntry.registryRow !== bEntry.registryRow) {
          return aEntry.registryRow - bEntry.registryRow;
        }
      }

      const orderDifference =
        (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
      return orderDifference || collator.compare(a.title, b.title) ||
        a.id.localeCompare(b.id);
    });
  }

  return [...groups.values()].sort(compareGroups);
}
