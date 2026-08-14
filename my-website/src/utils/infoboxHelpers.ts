// src/utils/infoboxHelpers.ts
import type { Section } from '../components/Infobox';
import React from 'react';

type Maybe<T> = T | null | undefined;

function row(label: string, value: Maybe<React.ReactNode>) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '—') return null;
  }
  return { label, value };
}

function section(title: string, rows: Array<ReturnType<typeof row>>) {
  const filtered = rows.filter(Boolean) as { label: string; value: React.ReactNode }[];
  if (!filtered.length) return null;
  return { title, rows: filtered } satisfies Section;
}

function cleanSections(sections: Array<Maybe<Section>>) {
  return sections.filter(Boolean) as Section[];
}

/* -------------------------
   Character helper
-------------------------- */

export type CharacterInfoboxInput = {
  // identity
  role?: string; // PC / NPC / Aliado / Antagonista / Neutral
  status?: string; // Activo / Desaparecido / etc.
  age?: string; // "29", "??", "20s"
  birthday?: string; // "30 de Diciembre"
  race?: string; // Humano, Elfo, etc.
  dynamic?: string; // Omegaverse: Alfa/Omega/Beta/...
  zodiac?: string; // "Libra"
  mbti?: string; // "INTJ"
  occupation?: React.ReactNode; // multiline JSX

  // ✅ profile (new)
  orientation?: string; // "Pan", "Bi", etc.
  romantic_situation?: string; // "En una relación con..."
  poli?: string; // "Sí" | "No" | "SUPER SÍ" | etc.

  // place & appearances
  origin?: React.ReactNode; // can be link
  currentLocation?: React.ReactNode; // legacy (can be link)
  hometown?: React.ReactNode; // ✅ new (can be link)
  actual_location?: React.ReactNode; // ✅ new (can be link)
  realm?: React.ReactNode; // ✅ new (can be link)

  firstAppearance?: React.ReactNode; // "Sesión 01"
  lastSeen?: React.ReactNode; // "Sesión 12"

  // affiliation
  faction?: React.ReactNode; // can be link
  bonds?: React.ReactNode; // "Minjae • ..."
  destinyCard?: React.ReactNode; // can be link or string

  // combat (lite)
  lvl?: string; // ✅ new (Nivel / CR)
  // (dejamos estos por compatibilidad, pero ya no los mostramos por defecto)
  class?: string;
  subclass?: string;
  levelOrCR?: string; // legacy

  // extras
  alignment?: string;
  theme?: string; // "Luna", "Sombra", "Tecnomagia" etc.
};

export function makeCharacterSections(input: CharacterInfoboxInput): Section[] {
  const s1 = section('Identidad', [
    row('Rol', input.role),
    row('Estado', input.status),
    row('Edad', input.age),
    row('Cumpleaños', input.birthday),
    row('Signo', input.zodiac),
    row('MBTI', input.mbti),
    row('Raza', input.race),
    row('Subgénero', input.dynamic),
    row('Ocupación', input.occupation),
    row('Alineación', input.alignment),
    row('Tema', input.theme),
  ]);

  // ✅ new: Perfil (romance / orientación / poli / lvl)
  const sProfile = section('Perfil', [
    row('Orientación', input.orientation),
    row('Situación romántica', input.romantic_situation),
    row('Poli', input.poli),
    //row('Nivel / CR', input.lvl ?? input.levelOrCR),
  ]);

  // ✅ upgraded: Origen y paradero (incluye hometown/realm/actual_location)
  const s2 = section('Origen y paradero', [
    row('Hometown', input.hometown),
    row('Reino', input.realm),
    // preferimos actual_location si existe; si no, currentLocation (legacy)
    row('Ubicación actual', input.actual_location ?? input.currentLocation),
    row('Origen', input.origin),
    row('Primera aparición', input.firstAppearance),
    row('Última vez visto', input.lastSeen),
  ]);

  const s3 = section('Afiliación', [
    row('Facción', input.faction),
    row('Vínculos', input.bonds),
    row('Carta del Destino', input.destinyCard),
  ]);

  // ❌ Combate full ya no (statblock manda)
  // Si aún quieres una sección peque, mantenemos solo el nivel/CR si no lo pusiste arriba:
  const s4 = section('Combate', [
    row('Nivel / CR', input.lvl ?? input.levelOrCR),
  ]);

  // Tip: si ya mostramos nivel en Perfil, Combate podría repetirse.
  // cleanSections() quitará secciones vacías, pero no elimina duplicados.
  // Para evitar duplicado visual, puedes comentar s4 si no lo quieres.
  return cleanSections([s1, sProfile, s2, s3]);
}

/* -------------------------
   Location helper
-------------------------- */

export type LocationInfoboxInput = {
  hasProfile?: boolean;

  type?: string; // Reino / Ciudad / Dungeon / Isla / Templo...
  realm?: string; // Hyberia, Jeyperia...
  climate?: string;
  danger?: string; // Bajo/Medio/Alto
  access?: string; // Libre/Restringido/Cerrado

  government?: string; // Monarquía, Consejo...
  authority?: string; // Rey, Corte, etc.
  population?: string;
  economy?: string;

  pointsOfInterest?: React.ReactNode; // JSX list or bullet-like string
  activeFactions?: React.ReactNode; // JSX list

  officialName?: string;
  nickname?: string;
  demonym?: string;
  capital?: string;
  founder?: string;
  ruler?: string;
  foundation?: string;
  motto?: string;
  currency?: React.ReactNode;
  officialLanguages?: React.ReactNode;
  majorityReligion?: string;
  geography?: string;
  culturalIdentity?: React.ReactNode;
  characteristicPower?: string;
  currentSituation?: string;
  relatedFactions?: React.ReactNode;
  additionalIdentityFacts?: { label: string; value: React.ReactNode }[];
  additionalGovernmentFacts?: { label: string; value: React.ReactNode }[];
  additionalTerritoryFacts?: { label: string; value: React.ReactNode }[];
};

export function makeLocationSections(input: LocationInfoboxInput): Section[] {
  if (input.hasProfile) {
    const identity = section('Identidad', [
      row('Nombre oficial', input.officialName),
      row('Sobrenombre', input.nickname),
      row('Gentilicio', input.demonym),
      row('Capital', input.capital),
      row('Fundación', input.foundation),
      row('Lema', input.motto),
      ...(input.additionalIdentityFacts ?? []).map((fact) => row(fact.label, fact.value)),
      row('Tipo', input.type),
      row('Reino', input.realm),
    ]);

    const government = section('Gobierno', [
      row('Forma de gobierno', input.government),
      row('Gobernante actual', input.ruler),
      row('Fundador', input.founder),
      row('Autoridad', input.authority),
      ...(input.additionalGovernmentFacts ?? []).map((fact) => row(fact.label, fact.value)),
    ]);

    const society = section('Sociedad y cultura', [
      row('Moneda', input.currency),
      row('Idiomas oficiales', input.officialLanguages),
      row('Religión mayoritaria', input.majorityReligion),
      row('Identidad cultural', input.culturalIdentity),
      row('Población', input.population),
      row('Economía', input.economy),
    ]);

    const territory = section('Territorio', [
      row('Geografía', input.geography),
      row('Clima', input.climate),
      row('Peligro', input.danger),
      row('Acceso', input.access),
      row('Puntos de interés', input.pointsOfInterest),
      ...(input.additionalTerritoryFacts ?? []).map((fact) => row(fact.label, fact.value)),
    ]);

    const influence = section('Poder e influencia', [
      row('Poder característico', input.characteristicPower),
      row('Facciones emblemáticas', input.relatedFactions ?? input.activeFactions),
      row('Situación actual', input.currentSituation),
    ]);

    return cleanSections([identity, government, society, territory, influence]);
  }

  const s1 = section('Información general', [
    row('Tipo', input.type),
    row('Reino', input.realm),
    row('Clima', input.climate),
    row('Peligro', input.danger),
    row('Acceso', input.access),
  ]);

  const s2 = section('Gobierno', [
    row('Sistema', input.government),
    row('Autoridad', input.authority),
    row('Población', input.population),
    row('Economía', input.economy),
  ]);

  const s3 = section('En el mapa', [
    row('Puntos de interés', input.pointsOfInterest),
    row('Facciones activas', input.activeFactions),
  ]);

  return cleanSections([s1, s2, s3]);
}

/* -------------------------
   Faction helper
-------------------------- */

export type FactionInfoboxInput = {
  type?: string; // Facción / Gremio / Orden / Manada...
  reputation?: string; // Proscritos, venerados...
  base?: React.ReactNode; // base principal (linkable)
  realm?: React.ReactNode;

  goal?: string;
  methods?: string;

  leader?: React.ReactNode; // linkable
  allies?: React.ReactNode;
  rivals?: React.ReactNode;
};

export function makeFactionSections(input: FactionInfoboxInput): Section[] {
  const s1 = section('Resumen', [
    row('Tipo', input.type),
    row('Reputación', input.reputation),
    row('Base', input.base),
    row('Territorio', input.realm),
  ]);

  const s2 = section('Agenda', [
    row('Objetivo', input.goal),
    row('Métodos', input.methods),
  ]);

  const s3 = section('Liderazgo', [
    row('Líder', input.leader),
    row('Aliados', input.allies),
    row('Rivales', input.rivals),
  ]);

  return cleanSections([s1, s2, s3]);
}
