import type {Character} from "../data/characters";
import type {Faction} from "../data/factions";
import {compareTitles} from "./directoryOrdering";

function validBirthDate(value?: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1]
    ? value
    : null;
}

function compareByBirthDate(a: Character, b: Character): number {
  const aBirthDate = validBirthDate(a.dateOfBirth);
  const bBirthDate = validBirthDate(b.dateOfBirth);
  if (aBirthDate && bBirthDate && aBirthDate !== bBirthDate) {
    return aBirthDate < bBirthDate ? -1 : 1;
  }
  if (aBirthDate && !bBirthDate) return -1;
  if (!aBirthDate && bBirthDate) return 1;

  const aOrder = Number.isFinite(a.sortOrder) ? a.sortOrder! : Number.MAX_SAFE_INTEGER;
  const bOrder = Number.isFinite(b.sortOrder) ? b.sortOrder! : Number.MAX_SAFE_INTEGER;
  return aOrder - bOrder || compareTitles(a.title, b.title) || a.id.localeCompare(b.id);
}

/** Return this faction's current and former members once each, without changing the input. */
export function sortFactionCharacters(characters: readonly Character[], faction: Faction): Character[] {
  const exMemberIds = new Set(faction.exMemberIds ?? []);
  const uniqueMembers = new Map<string, Character>();
  for (const character of characters) {
    if (
      !uniqueMembers.has(character.id) &&
      (character.factionId === faction.id ||
        character.additionalFactionIds?.includes(faction.id) ||
        exMemberIds.has(character.id))
    ) {
      uniqueMembers.set(character.id, character);
    }
  }

  const members = [...uniqueMembers.values()];
  const leaderId = [faction.leaderCharacterId, faction.leaderId].find(
    (id) => id && uniqueMembers.has(id) && !exMemberIds.has(id),
  );
  return members.sort((a, b) => {
    if (a.id === leaderId) return -1;
    if (b.id === leaderId) return 1;
    const aFormer = exMemberIds.has(a.id);
    const bFormer = exMemberIds.has(b.id);
    if (aFormer !== bFormer) return aFormer ? 1 : -1;
    return compareByBirthDate(a, b);
  });
}
