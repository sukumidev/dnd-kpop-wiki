import {characterClasses, getCharacterClass} from './characterClasses';
import {characters, type Character} from './characters';
import {statblocks} from './statblocks';

export type ClassCharacter = {
  character: Character;
  /** The level recorded for this class, never the character's total level. */
  level?: number;
  /** The subclass from the matching statblock class entry. */
  subclass?: string;
};

type StatblockReference = {
  id?: unknown;
  classes?: unknown;
};

const classIdsByLabel = new Map(
  characterClasses.flatMap(({id, name, originalName}) =>
    [id, name, originalName].map((label) => [normalizeClassLabel(label), id] as const),
  ),
);

function normalizeClassLabel(label: string): string {
  return label.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[\s_-]+/g, ' ');
}

/** Match only exact class IDs or names after case, accent and spacing normalization. */
export function resolveClassId(label: unknown): string | undefined {
  return typeof label === 'string' ? classIdsByLabel.get(normalizeClassLabel(label)) : undefined;
}

/** Derive membership from statblocks; join profiles only by their exact character ID. */
export function resolveCharactersForClass(
  classId: string,
  blocks: Readonly<Record<string, StatblockReference>>,
  profiles: Readonly<Record<string, Character>>,
): ClassCharacter[] {
  if (!getCharacterClass(classId)) return [];

  const found = new Map<string, ClassCharacter>();
  for (const block of Object.values(blocks)) {
    if (!block || typeof block.id !== 'string' || !Array.isArray(block.classes)) continue;
    const character = profiles[block.id];
    if (!character || character.id !== block.id || character.hasProfile === false) continue;

    for (const entry of block.classes) {
      if (!entry || typeof entry !== 'object') continue;
      const {name, level, subclass} = entry as {name?: unknown; level?: unknown; subclass?: unknown};
      if (resolveClassId(name) !== classId) continue;

      const recordedLevel = typeof level === 'number' && Number.isInteger(level) && level > 0
        ? level : undefined;
      const recordedSubclass = typeof subclass === 'string' && subclass.trim() ? subclass.trim() : undefined;
      const previous = found.get(character.id);
      if (!previous) {
        found.set(character.id, {character, level: recordedLevel, ...(recordedSubclass ? {subclass: recordedSubclass} : {})});
      } else if (recordedLevel !== undefined &&
        (previous.level === undefined || recordedLevel > previous.level)) {
        // Multiple statblocks may describe the same character. Keep one card and
        // the highest explicitly recorded level for this class.
        previous.level = recordedLevel;
        if (recordedSubclass) previous.subclass = recordedSubclass;
      } else if (!previous.subclass && recordedSubclass) {
        previous.subclass = recordedSubclass;
      }
    }
  }

  return [...found.values()];
}

export function getCharactersForClass(classId: string): ClassCharacter[] {
  return resolveCharactersForClass(classId, statblocks, characters);
}
