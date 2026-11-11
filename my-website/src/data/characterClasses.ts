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

/** Compact original summaries and core traits; consult the cited books for full rules. */
export const characterClasses: CharacterClass[] = [
  {
    id: 'barbaro', name: 'Bárbaro', originalName: 'Barbarian',
    description: 'Combatiente que canaliza su furia y resistencia para abrirse paso en el frente de batalla.',
    source: 'Player’s Handbook (2024)',
    hitDie: 12,
    primaryAbilities: ["Fuerza"],
    savingThrows: ["Fuerza","Constitución"],
    subclassIds: [],
  },
  {
    id: 'bardo', name: 'Bardo', originalName: 'Bard',
    description: 'Artista versátil que usa magia, inspiración y habilidades para apoyar o desestabilizar.',
    source: 'Player’s Handbook (2024)',
    hitDie: 8,
    primaryAbilities: ["Carisma"],
    savingThrows: ["Destreza","Carisma"],
    subclassIds: [],
  },
  {
    id: 'clerigo', name: 'Clérigo', originalName: 'Cleric',
    description: 'Canalizador de magia divina que protege, sana y combate en nombre de poderes superiores.',
    source: 'Player’s Handbook (2024)',
    hitDie: 8,
    primaryAbilities: ["Sabiduría"],
    savingThrows: ["Sabiduría","Carisma"],
    subclassIds: [],
  },
  {
    id: 'druida', name: 'Druida', originalName: 'Druid',
    description: 'Guardián de la naturaleza que combina magia primordial con transformaciones salvajes.',
    source: 'Player’s Handbook (2024)',
    hitDie: 8,
    primaryAbilities: ["Sabiduría"],
    savingThrows: ["Inteligencia","Sabiduría"],
    subclassIds: [],
  },
  {
    id: 'guerrero', name: 'Guerrero', originalName: 'Fighter',
    description: 'Especialista marcial adaptable que domina armas, armaduras y tácticas de combate.',
    source: 'Player’s Handbook (2024)',
    hitDie: 10,
    primaryAbilities: ["Fuerza","Destreza"],
    savingThrows: ["Fuerza","Constitución"],
    subclassIds: [],
  },
  {
    id: 'hechicero', name: 'Hechicero', originalName: 'Sorcerer',
    description: 'Lanzador de conjuros cuya magia surge de un poder innato.',
    source: 'Player’s Handbook (2024)',
    hitDie: 6,
    primaryAbilities: ["Carisma"],
    savingThrows: ["Constitución","Carisma"],
    subclassIds: [],
  },
  {
    id: 'mago', name: 'Mago', originalName: 'Wizard',
    description: 'Estudioso de la magia arcana que desarrolla su poder mediante el conocimiento y los conjuros.',
    source: 'Player’s Handbook (2024)',
    hitDie: 6,
    primaryAbilities: ["Inteligencia"],
    savingThrows: ["Inteligencia","Sabiduría"],
    subclassIds: [],
  },
  {
    id: 'monje', name: 'Monje', originalName: 'Monk',
    description: 'Artista marcial que emplea disciplina y energía interior para combatir con movilidad.',
    source: 'Player’s Handbook (2024)',
    hitDie: 8,
    primaryAbilities: ["Destreza","Sabiduría"],
    savingThrows: ["Fuerza","Destreza"],
    subclassIds: [],
  },
  {
    id: 'paladin', name: 'Paladín', originalName: 'Paladin',
    description: 'Guerrero vinculado a un juramento que combina combate, protección y magia divina.',
    source: 'Player’s Handbook (2024)',
    hitDie: 10,
    primaryAbilities: ["Fuerza","Carisma"],
    savingThrows: ["Sabiduría","Carisma"],
    subclassIds: [],
  },
  {
    id: 'picaro', name: 'Pícaro', originalName: 'Rogue',
    description: 'Experto en habilidades, sigilo y ataques precisos que aprovecha cada oportunidad.',
    source: 'Player’s Handbook (2024)',
    hitDie: 8,
    primaryAbilities: ["Destreza"],
    savingThrows: ["Destreza","Inteligencia"],
    subclassIds: [],
  },
  {
    id: 'ranger', name: 'Ranger', originalName: 'Ranger',
    description: 'Explorador marcial que combina rastreo, supervivencia y magia de la naturaleza.',
    source: 'Player’s Handbook (2024)',
    hitDie: 10,
    primaryAbilities: ["Destreza","Sabiduría"],
    savingThrows: ["Fuerza","Destreza"],
    subclassIds: [],
  },
  {
    id: 'warlock', name: 'Warlock', originalName: 'Warlock',
    description: 'Ocultista que obtiene capacidades mágicas mediante un pacto y conocimientos sobrenaturales.',
    source: 'Player’s Handbook (2024)',
    hitDie: 8,
    primaryAbilities: ["Carisma"],
    savingThrows: ["Sabiduría","Carisma"],
    subclassIds: [],
  },
  {
    id: 'artifice', name: 'Artífice', originalName: 'Artificer',
    description: 'Inventor arcano que crea herramientas y objetos mágicos para apoyar sus aventuras.',
    source: 'Material complementario compatible con D&D 5.5e',
    hitDie: 8,
    primaryAbilities: ["Inteligencia"],
    savingThrows: ["Constitución","Inteligencia"],
    subclassIds: [],
  },
];

/**
 * Only register subclasses approved for Hallyura, with an MDX route for each.
 * Statblock subclass labels are evidence of usage, not approval or proof of
 * 2024 rules compatibility. 2014 books and homebrew require individual review.
 */
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
