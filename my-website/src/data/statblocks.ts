// src/data/statblocks.ts
import rawJson from "./statblocks.json";

export type ClassEntry = {
  name: string;
  level: number;
  subclass?: string;
};

export type SavingThrows = {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
};


export type PublicStatblock = {
  id: string;
  secret?: false;
  classes: ClassEntry[];

  race: string;
  alignment: string;

  proficiencyBonus: number;
  initiative: number;
  ac: number;
  hp: number;
  speed: string;
  passivePerception: number;

  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  savingThrows?: SavingThrows;

  resistances: string[];
  vulnerability: string[];
  immunity: string[];
};

/** EXO entries omit AC, HP, and ability scores from the public bundle. */
export type SecretStatblock = Pick<
  PublicStatblock,
  | "id"
  | "classes"
  | "race"
  | "alignment"
  | "proficiencyBonus"
  | "initiative"
  | "speed"
  | "passivePerception"
  | "resistances"
  | "vulnerability"
  | "immunity"
> & {
  secret: true;
};

export type Statblock = PublicStatblock | SecretStatblock;

export type StatblocksById = Record<string, Statblock>;

// ✅ Soporta bundlers que cargan JSON como { default: ... }
const normalized = (rawJson as any)?.default ?? rawJson;

export const statblocks = normalized as StatblocksById;

export function getStatblock(id: string): Statblock | null {
  return statblocks?.[id] ?? null;
}

export function totalLevel(sb: Pick<PublicStatblock, "classes">): number {
  return sb.classes.reduce((sum, c) => sum + c.level, 0);
}

export function classesLabel(sb: Pick<PublicStatblock, "classes">): string {
  return sb.classes
    .map((c) => `${c.name} ${c.level}${c.subclass ? ` (${c.subclass})` : ""}`)
    .join(" / ");
}

export function primaryClass(sb: PublicStatblock): ClassEntry {
  return [...sb.classes].sort((a, b) => b.level - a.level)[0];
}
