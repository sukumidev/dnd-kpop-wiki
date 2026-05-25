import factionsJson from "./factions.json";
import type { Character } from "./characters";
import type { Quest } from "./quests";

export type FactionStatus = "active" | "inactive" | "destroyed" | "unknown";

export type FactionType =
  | "party"
  | "guild"
  | "academy"
  | "order"
  | "clan"
  | "pack"
  | "pirates"
  | "kingdom"
  | "enemy"
  | "alliance"
  | "other";

export type FactionVisibility = "public" | "hidden" | "secret" | "dm-only";

export type FactionSubunit = {
  id: string;
  title: string;
  role?: string | null;
  leaderCharacterId?: string | null;
  memberIds?: string[];
  bullets?: string[];
};

export type Faction = {
  id: string;
  title: string;

  subtitle?: string | null;
  type?: FactionType | string | null;
  status: FactionStatus;
  visibility?: FactionVisibility;

  summary?: string | null;
  description?: string | null;

  /** Flavor/display fields for faction pages. */
  reputation?: string | null;
  goal?: string | null;
  methods?: string | null;

  /** Broad territorial anchor. This can reference a region/location entity such as sylmorien, hotou, hyberia, etc. */
  regionId?: string | null;

  /** Primary base and extra locations tied to the faction. */
  baseLocationId?: string | null;
  baseLabel?: string | null;
  locationIds?: string[];

  /** Character IDs used for faction leadership. General membership comes from characters.json via character.factionId. */
  leaderCharacterId?: string | null;

  /** Faction-to-faction relationships. */
  allyFactionIds?: string[];
  rivalFactionIds?: string[];
  enemyFactionIds?: string[];

  /** Optional character-level faction relationships, useful for special rivals/allies. */
  allyCharacterIds?: string[];
  enemyCharacterIds?: string[];

  /** Internal teams/units. These can reference characters because subunit membership is not the same as general faction membership. */
  subunits?: FactionSubunit[];

  tags?: string[];
  imageSrc?: string | null;
  imageCaption?: string | null;
  accent?: string | null;
  sortOrder?: number;
};

export type FactionsById = Record<string, Faction>;

export const factions = factionsJson as FactionsById;

export const factionList = Object.values(factions).sort((a, b) => {
  const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.title.localeCompare(b.title);
});

export function getFactionById(id: string): Faction | undefined {
  return factions[id];
}

export function getFactionsByType(type: FactionType, list: Faction[] = factionList): Faction[] {
  return list.filter((faction) => faction.type === type);
}

export function getFactionsByStatus(status: FactionStatus, list: Faction[] = factionList): Faction[] {
  return list.filter((faction) => faction.status === status);
}

export function getFactionsByRegionId(regionId: string, list: Faction[] = factionList): Faction[] {
  return list.filter((faction) => faction.regionId === regionId);
}

/**
 * General membership source of truth lives in characters.json through character.factionId.
 * This keeps factions.json from duplicating keyMembers.
 */
export function getFactionMembers(factionId: string, characters: Character[]): Character[] {
  return characters.filter((character) => character.factionId === factionId);
}

export function getFactionLeader(faction: Faction, characters: Character[]): Character | undefined {
  if (!faction.leaderCharacterId) return undefined;
  return characters.find((character) => character.id === faction.leaderCharacterId);
}

export function getFactionSubunitMembers(subunit: FactionSubunit, characters: Character[]): Character[] {
  const ids = new Set(subunit.memberIds ?? []);
  return characters.filter((character) => ids.has(character.id));
}

export function getFactionAllies(faction: Faction): Faction[] {
  const ids = faction.allyFactionIds ?? [];
  return ids.map((id) => factions[id]).filter(Boolean);
}

export function getFactionEnemies(faction: Faction): Faction[] {
  const ids = faction.enemyFactionIds ?? [];
  return ids.map((id) => factions[id]).filter(Boolean);
}

export function getQuestsByFaction(factionId: string, quests: Quest[]): Quest[] {
  return quests.filter((quest) => quest.factionIds?.includes(factionId));
}
