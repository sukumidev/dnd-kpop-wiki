import sessionsJson from "./sessions.json";
import {getCharacterById} from "./characters";
import {getLocationById} from "./locations";

export type Session = {
  id: string;
  number: number;
  title: string;

  sessionDate?: string;
  campaignDate?: string;

  /** Narrative order: the first ID is the location where the session begins. */
  locationIds?: string[];
  /** Characters who participate or appear directly; mentions do not count. */
  characterIds?: string[];

  imageSrc?: string;
  /** CSS object-position/background-position compatible value. */
  imagePosition?: string;
};

/** Backwards-compatible name for components created before the data contract. */
export type CampaignSession = Session;

export const sessionList = sessionsJson as Session[];

const compactDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatSessionDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return compactDateFormatter
    .format(parsedDate)
    .replace(/\./g, "")
    .toLocaleUpperCase("es-MX");
}

export function getSessionHref(session: Session) {
  return `/campaign/sessions/${String(session.number).padStart(2, "0")}`;
}

export function getSessionLocations(session: Session) {
  return (session.locationIds ?? [])
    .map((locationId) => getLocationById(locationId))
    .filter((location) => location !== undefined);
}

export function getSessionCharacters(session: Session) {
  return (session.characterIds ?? [])
    .map((characterId) => getCharacterById(characterId))
    .filter((character) => character !== undefined);
}

export function getSessionStartingLocation(session: Session) {
  const startingLocationId = session.locationIds?.[0];
  if (!startingLocationId) return undefined;

  return getLocationById(startingLocationId)?.title ?? startingLocationId;
}

export function getSessionCover(session: Session) {
  return session.imageSrc;
}

/** Campaign appearances are always derived from Session -> characterIds. */
export function getSessionsByCharacterId(characterId: string, list: Session[] = sessionList) {
  return list
    .filter((session) => session.characterIds?.includes(characterId))
    .sort((a, b) => a.number - b.number);
}
