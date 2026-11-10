/** Classes approved for the Hallyura directory, in their editorial order. */
export interface CharacterClass {
  id: string;
  name: string;
  originalName: string;
  description?: string;
  imageSrc?: string | null;
  source?: string;
  hitDie?: number;
  primaryAbilities?: string[];
  savingThrows?: string[];
  subclassIds: string[];
}

export interface CharacterSubclass {
  id: string;
  classId: string;
  name: string;
  originalName: string;
  description?: string;
  imageSrc?: string | null;
  source?: string;
  isHomebrew?: boolean;
}

export const characterClasses: CharacterClass[] = [
  {id: 'barbaro', name: 'Bárbaro', originalName: 'Barbarian', subclassIds: []},
  {id: 'bardo', name: 'Bardo', originalName: 'Bard', subclassIds: []},
  {id: 'clerigo', name: 'Clérigo', originalName: 'Cleric', subclassIds: []},
  {id: 'druida', name: 'Druida', originalName: 'Druid', subclassIds: []},
  {id: 'guerrero', name: 'Guerrero', originalName: 'Fighter', subclassIds: []},
  {id: 'hechicero', name: 'Hechicero', originalName: 'Sorcerer', subclassIds: []},
  {id: 'mago', name: 'Mago', originalName: 'Wizard', subclassIds: []},
  {id: 'monje', name: 'Monje', originalName: 'Monk', subclassIds: []},
  {id: 'paladin', name: 'Paladín', originalName: 'Paladin', subclassIds: []},
  {id: 'picaro', name: 'Pícaro', originalName: 'Rogue', subclassIds: []},
  {id: 'ranger', name: 'Ranger', originalName: 'Ranger', subclassIds: []},
  {id: 'warlock', name: 'Warlock', originalName: 'Warlock', subclassIds: []},
  {id: 'artifice', name: 'Artífice', originalName: 'Artificer', source: 'Material complementario compatible con D&D 5.5e', subclassIds: []},
];

/** Add only subclasses approved for the campaign. Keep their details here, not in the class records. */
export const characterSubclasses: CharacterSubclass[] = [];

export function getCharacterClass(id: string): CharacterClass | undefined {
  return characterClasses.find((characterClass) => characterClass.id === id);
}

export function getCharacterSubclass(classId: string, subclassId: string): CharacterSubclass | undefined {
  const characterClass = getCharacterClass(classId);
  if (!characterClass?.subclassIds.includes(subclassId)) return undefined;
  return characterSubclasses.find((subclass) => subclass.id === subclassId && subclass.classId === classId);
}

export function getClassSubclasses(characterClass: CharacterClass): CharacterSubclass[] {
  return characterClass.subclassIds.flatMap((id) => {
    const subclass = getCharacterSubclass(characterClass.id, id);
    return subclass ? [subclass] : [];
  });
}

export function getCharacterClassHref(id: string): string {
  return `/mechanics/classes/${id}`;
}

export function getCharacterSubclassHref(classId: string, subclassId: string): string {
  return `${getCharacterClassHref(classId)}/${subclassId}`;
}
