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

const longDateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "long",
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

export function formatSessionDateLong(date: string) {
  const parsedDate = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return longDateFormatter.format(parsedDate);
}

export function getSessionHref(session: Session) {
  const idSlug = session.id.startsWith("session-")
    ? session.id.slice("session-".length)
    : undefined;
  const numberSlug = String(session.number).padStart(2, "0").replace(".", "-");

  return `/campaign/sessions/${idSlug || numberSlug}`;
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

/** Resolves a docs ID such as campaign/sessions/01 without copying session data to MDX. */
export function getSessionByDocId(docId: string) {
  const docSlug = docId.split("/").at(-1);
  if (!docSlug) return undefined;

  return sessionList.find((session) =>
    session.id === `session-${docSlug}` || getSessionHref(session).endsWith(`/${docSlug}`),
  );
}

/** Campaign appearances are always derived from Session -> characterIds. */
export function getSessionsByCharacterId(characterId: string, list: Session[] = sessionList) {
  return list
    .filter((session) => session.characterIds?.includes(characterId))
    .sort((a, b) => a.number - b.number);
}

/** Location appearances are derived from Session -> locationIds. */
export function getSessionsByLocationId(locationId: string, list: Session[] = sessionList) {
  return list
    .filter((session) => session.locationIds?.includes(locationId))
    .sort((a, b) => a.number - b.number);
}
