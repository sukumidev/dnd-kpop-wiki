import charactersJson from "./characters.json";

export type CharacterGroup = "party" | "npc";

export type CharacterStatus =
  | "active"
  | "inactive"
  | "dead"
  | "missing"
  | "unknown";

export type CharacterDynamic = "alpha" | "beta" | "omega" | "unknown" | null;

export type PolyamoryStatus = "yes" | "no" | "discovering" | "unknown" | null;

export type DocPath = string;

export type CharacterLocationLink = {
  label: string | null;
  locationId: string | null;
  docPath: DocPath | null;
};

export type CharacterSessionLink = {
  label: string | null;
  sessionId: string | null;
  docPath: DocPath | null;
};

export type CharacterBond = {
  label: string | null;
  characterId: string | null;
  docPath: DocPath | null;
};

export type CharacterImage = {
  src: string;
  caption?: string;
};

export type Character = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageSrc?: string | null;


  /** "misc" was migrated to "npc". */
  group: CharacterGroup;
  role?: string | null;
  occupation?: string[];
  status: CharacterStatus;

  /** Source of truth for age. Age is calculated using the campaign current date. */
  dateOfBirth?: string | null;
  zodiac?: string | null;
  mbti?: string | null;

  /** Biographical race/species. Combat race lives in statblocks.json when needed. */
  race?: string | null;
  dynamic?: CharacterDynamic;

  orientation?: string | null;
  romanticSituation?: string | null;
  polyamoryStatus?: PolyamoryStatus;

  factionId?: string | null;

  /** Region is intentionally broader than kingdom. Examples: sylmorien, hotou, yggdrasil. */
  regionId?: string | null;

  hometown?: CharacterLocationLink | null;
  currentLocation?: CharacterLocationLink | null;

  firstAppearance?: CharacterSessionLink | null;
  lastSeen?: CharacterSessionLink | null;

  /**
   * Bonds remain linkable.
   * - characterId is preferred when the linked character exists or can be inferred.
   * - docPath is kept as fallback for pages that may exist before the entity exists in JSON.
   * - Missing pages are not tracked here; Docusaurus will surface broken/missing pages.
   */
  bonds?: CharacterBond[];

  destinyCard?: string | null;
  images?: CharacterImage[];

  tags?: string[];
  summary?: string | null;
  sortOrder?: number;
};

export type CharactersById = Record<string, Character>;

export const characters = charactersJson as CharactersById;

export const characterList = Object.values(characters);

export function getCharacterById(id: string): Character | undefined {
  return characters[id];
}

export function calculateCharacterAge(
  dateOfBirth: string | null | undefined,
  campaignCurrentDate: string,
): number | null {
  if (!dateOfBirth) return null;

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const currentDate = new Date(`${campaignCurrentDate}T00:00:00`);

  if (Number.isNaN(birthDate.getTime()) || Number.isNaN(currentDate.getTime())) {
    return null;
  }

  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    currentDate.getMonth() > birthDate.getMonth() ||
    (currentDate.getMonth() === birthDate.getMonth() &&
      currentDate.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) age -= 1;

  return age;
}
