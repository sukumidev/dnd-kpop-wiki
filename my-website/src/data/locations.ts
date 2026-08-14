import locationsJson from "./locations.json";
import type { Character } from "./characters";
import type { Quest } from "./quests";

export type LocationStatus = "active" | "inactive" | "destroyed" | "hidden" | "unknown";

export type LocationType =
  | "region"
  | "kingdom"
  | "city"
  | "district"
  | "village"
  | "port"
  | "academy"
  | "dungeon"
  | "landmark"
  | "wilderness"
  | "plane"
  | "other";

export type LocationVisibility = "public" | "hidden" | "secret" | "dm-only";

export type MapPin = {
  /** If false, this location should not render as a pin even if coordinates exist. */
  visible: boolean;

  /** Coordinates are percentages from 0 to 100 relative to the rendered map image. */
  x?: number | null;
  y?: number | null;

  icon?: string | null;
  layer?: string | null;
  label?: string | null;

  /** Optional future support for multiple maps. Defaults to mapConfig.defaultMap.id. */
  mapId?: string | null;
};

export type LocationProfile = {
  officialName?: string | null;
  nickname?: string | null;
  demonym?: string | null;

  capital?: string | null;
  founder?: string | null;
  ruler?: string | null;

  government?: string | null;
  foundation?: string | null;

  motto?: string | null;
  currency?: string[] | null;
  officialLanguages?: string[] | null;
  majorityReligion?: string | null;

  geography?: string | null;
  climate?: string | null;

  culturalIdentity?: string[] | null;
  characteristicPower?: string | null;
  currentSituation?: string | null;

  additionalFacts?: {
    label: string;
    value: string;
  }[];
};

export type Location = {
  id: string;
  title: string;

  subtitle?: string | null;
  type: LocationType | string;
  status: LocationStatus;
  visibility?: LocationVisibility;

  summary?: string | null;
  description?: string | null;
  profile?: LocationProfile | null;

  /** For places inside a broader region. Region entries themselves can leave this null. */
  regionId?: string | null;

  /** For nested locations: districts inside cities, villages inside regions, etc. */
  parentLocationId?: string | null;

  factionIds?: string[];
  characterIds?: string[];
  questIds?: string[];

  map?: MapPin | null;

  tags?: string[];
  imageSrc?: string | null;
  accent?: string | null;
  sortOrder?: number;
};

export type LocationsById = Record<string, Location>;

export const locations = locationsJson as LocationsById;

export const locationList = Object.values(locations).sort((a, b) => {
  const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.title.localeCompare(b.title);
});

export function getLocationById(id: string): Location | undefined {
  return locations[id];
}

export function getLocationsByType(type: LocationType, list: Location[] = locationList): Location[] {
  return list.filter((location) => location.type === type);
}

export function getLocationsByStatus(status: LocationStatus, list: Location[] = locationList): Location[] {
  return list.filter((location) => location.status === status);
}

export function getLocationsByRegionId(regionId: string, list: Location[] = locationList): Location[] {
  return list.filter((location) => location.regionId === regionId || location.id === regionId);
}

export function getLocationChildren(parentLocationId: string, list: Location[] = locationList): Location[] {
  return list.filter((location) => location.parentLocationId === parentLocationId);
}

export function getVisibleMapLocations(list: Location[] = locationList): Location[] {
  return list.filter((location) => location.map?.visible === true && hasValidMapCoordinates(location));
}

export function hasValidMapCoordinates(location: Location): boolean {
  const x = location.map?.x;
  const y = location.map?.y;

  return typeof x === "number" && typeof y === "number" && x >= 0 && x <= 100 && y >= 0 && y <= 100;
}

export function getCharactersByLocation(locationId: string, characters: Character[]): Character[] {
  return characters.filter((character) => {
    return (
      character.hometown?.locationId === locationId ||
      character.currentLocation?.locationId === locationId
    );
  });
}

export function getQuestsByLocation(locationId: string, quests: Quest[]): Quest[] {
  return quests.filter((quest) => quest.locationIds?.includes(locationId) || quest.regionIds?.includes(locationId));
}
