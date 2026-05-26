// src/utils/infoboxJson.tsx
import React from 'react';
import Link from '@docusaurus/Link';
import type { Section } from '../components/Infobox';
import {
  makeCharacterSections,
  makeLocationSections,
  makeFactionSections,
  type CharacterInfoboxInput,
  type LocationInfoboxInput,
  type FactionInfoboxInput,
} from './infoboxHelpers';
import {
  getCharacterById,
  getCharacterDocPath,
  getFactionById,
  getLocationById,
} from '../data/relationships';

/**
 * JSON-friendly references
 * - doc: docId or route without leading slash (e.g. "characters/svt-joshua")
 * - external: optional external link
 */
export type DocRef = { label: string; doc: string };
export type DocPathRef = { label: string | null; docPath: string | null };
export type ExternalRef = { label: string; href: string };
export type Ref = DocRef | DocPathRef | ExternalRef;

export type Value = string | number | Ref | Ref[];

/** Narrowing helpers */
function isDocRef(v: Ref): v is DocRef {
  return (v as DocRef).doc !== undefined;
}
function isExternalRef(v: Ref): v is ExternalRef {
  return (v as ExternalRef).href !== undefined;
}

function renderRef(ref: Ref): React.ReactNode {
  if ('href' in ref) {
    return (
      <a href={ref.href} target="_blank" rel="noreferrer">
        {ref.label}
      </a>
    );
  }

  // aquí TS ya sabe que es DocRef
  if ('docPath' in ref) {
    if (!ref.docPath) return ref.label ?? undefined;
    return <Link to={`/${ref.docPath}`}>{ref.label ?? ref.docPath}</Link>;
  }

  return <Link to={`/${ref.doc}`}>{ref.label}</Link>;
}

function renderValue(v: Value | undefined): React.ReactNode | undefined {
  if (v === undefined || v === null) return undefined;

  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v;

  if (Array.isArray(v)) {
    return (
      <>
        {v.map((x, i) => (
          <React.Fragment key={(isDocRef(x) ? x.doc : isExternalRef(x) ? x.href : x.docPath ?? x.label ?? '') + i}>
            {renderRef(x)}
            {i < v.length - 1 ? ' • ' : null}
          </React.Fragment>
        ))}
      </>
    );
  }

  return renderRef(v);
}

function renderDocLink(label: string, docPath: string): React.ReactNode {
  return <Link to={`/${docPath}`}>{label}</Link>;
}

function renderFactionLinkFromId(factionId?: string | null): React.ReactNode | undefined {
  if (!factionId) return undefined;

  const faction = getFactionById(factionId);
  if (!faction) return factionId;

  return renderDocLink(faction.title, `factions/${faction.id}`);
}

function renderDelimitedValues(values: React.ReactNode[]): React.ReactNode | undefined {
  const clean = values.filter(Boolean);
  if (!clean.length) return undefined;

  return (
    <>
      {clean.map((value, i) => (
        <React.Fragment key={i}>
          {value}
          {i < clean.length - 1 ? ' • ' : null}
        </React.Fragment>
      ))}
    </>
  );
}

/* -----------------------------
   Character JSON + converter
------------------------------ */

export type CharacterJson = {
  id?: string;
  title: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  caption?: string;
  group?: 'party' | 'npc' | string;

  // identity
  role?: string;
  status?: string;

  // ✅ nuevo: dob ISO "YYYY-MM-DD"
  dateOfBirth?: string;

  // edad opcional (si no, la calculamos)
  age?: number | string;

  // legacy (si aún existen en algunos)
  birthday?: string;

  zodiac?: string;
  mbti?: string;
  race?: string;
  dynamic?: string;
  occupation?: string | string[];

  // ✅ nuevo: perfil
  orientation?: string;
  romanticSituation?: string | null;
  romantic_situation?: string;
  polyamoryStatus?: string | null;
  poli?: string; // "Sí", "No", "SUPER SÍ"

  // places & appearances (ahora refs)
  hometown?: Value;
  regionId?: string | null;
  locationIds?: string[];
  questIds?: string[];
  realm?: Value; // ahora linkeable
  actual_location?: Value;

  origin?: Value;
  currentLocation?: Value;

  firstAppearance?: Value; // antes string
  lastSeen?: Value;        // antes string

  // affiliation
  factionId?: string | null;
  faction?: Value;
  factions?: string[];

  // combat-lite (opcional; clase/subclase ya no es necesario si statblock manda)
  class?: string;
  subclass?: string;
  lvl?: number | string;
  levelOrCR?: string; // legacy

  // extras
  bonds?: Ref[];
  destinyCard?: Value;
  theme?: string;
  alignment?: string;

  doc?: string;
};

function renderMultilineText(v: string | string[] | undefined): React.ReactNode | undefined {
  if (!v) return undefined;

  const lines = Array.isArray(v) ? v : v.split('\n');

  const clean = lines.map(s => s.trim()).filter(Boolean).filter(s => s !== '—');
  if (!clean.length) return undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {clean.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}

function formatBirthdayFromISO(iso?: string): string | undefined {
  if (!iso) return undefined;
  const [yy, mm, dd] = iso.split('-').map((x) => parseInt(x, 10));
  if (!yy || !mm || !dd) return undefined;

  const months = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
  ];
  const month = months[mm - 1];
  if (!month) return undefined;
  return `${dd} de ${month}`;
}

function calcAgeFromISO(iso?: string, atDate = new Date()): number | undefined {
  if (!iso) return undefined;
  const [yy, mm, dd] = iso.split('-').map((x) => parseInt(x, 10));
  if (!yy || !mm || !dd) return undefined;

  const dob = new Date(yy, mm - 1, dd);
  let age = atDate.getFullYear() - dob.getFullYear();
  const m = atDate.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && atDate.getDate() < dob.getDate())) age--;
  return age;
}

export function characterJsonToSections(data: CharacterJson): Section[] {
  const bondsNode = data.bonds ? (renderValue(data.bonds) as React.ReactNode) : undefined;
  const factionNode =
    renderFactionLinkFromId(data.factionId) ??
    (renderValue(data.faction) as React.ReactNode | undefined);

  const derivedBirthday = data.birthday ?? formatBirthdayFromISO(data.dateOfBirth);
  const derivedAge =
    data.age !== undefined && data.age !== null
      ? data.age
      : calcAgeFromISO(data.dateOfBirth);

  const input: CharacterInfoboxInput = {
    role: data.role,
    status: data.status,
    age: derivedAge !== undefined ? String(derivedAge) : undefined,
    birthday: derivedBirthday,
    zodiac: data.zodiac,
    mbti: data.mbti,
    race: data.race,
    dynamic: data.dynamic,
    occupation: renderMultilineText(data.occupation),

    // ✅ nuevos campos
    orientation: data.orientation,
    romantic_situation: data.romanticSituation ?? data.romantic_situation,
    poli: data.polyamoryStatus ?? data.poli,

    hometown: renderValue(data.hometown) as any,
    realm: renderValue(data.realm) as any,
    actual_location: renderValue(data.actual_location) as any,

    origin: renderValue(data.origin) as any,
    currentLocation: renderValue(data.currentLocation) as any,
    firstAppearance: renderValue(data.firstAppearance) as any,
    lastSeen: renderValue(data.lastSeen) as any,

    faction: factionNode,
    bonds: bondsNode,
    destinyCard: renderValue(data.destinyCard) as any,

    // combate-lite
    lvl: data.lvl ? String(data.lvl) : data.levelOrCR,

    theme: data.theme,
    alignment: data.alignment,
  };

  return makeCharacterSections(input);
}

/* -----------------------------
   Location JSON + converter
------------------------------ */

export type LocationJson = {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  caption?: string;

  type?: string;  // Reino/Ciudad/Isla/Dungeon…
  realm?: string; // Hyberia/Jeyperia…
  climate?: string;
  danger?: string;
  access?: string;

  government?: string;
  authority?: string;
  population?: string;
  economy?: string;

  pointsOfInterest?: Ref[];
  activeFactions?: Ref[];
};

export function locationJsonToSections(data: LocationJson): Section[] {
  const input: LocationInfoboxInput = {
    type: data.type,
    realm: data.realm,
    climate: data.climate,
    danger: data.danger,
    access: data.access,

    government: data.government,
    authority: data.authority,
    population: data.population,
    economy: data.economy,

    pointsOfInterest: renderValue(data.pointsOfInterest as any) as any,
    activeFactions: renderValue(data.activeFactions as any) as any,
  };

  return makeLocationSections(input);
}

/* -----------------------------
   Faction JSON + converter
------------------------------ */

export type FactionJson = {
  type?: string;
  reputation?: string;
  base?: Value;
  realm?: string;
  goal?: string;
  methods?: string;
  leader?: Value;
  allies?: Ref[];
  rivals?: Ref[];
};

export function factionJsonToSections(data: any): Section[] {
  if (!data) return [];

  const leader = data.leaderCharacterId
    ? getCharacterById(data.leaderCharacterId)
    : undefined;
  const base = data.baseLocationId ? getLocationById(data.baseLocationId) : undefined;
  const region = data.regionId ? getLocationById(data.regionId) : undefined;
  const allyIds = data.allyFactionIds ?? [];
  const rivalIds = data.rivalFactionIds ?? data.enemyFactionIds ?? [];

  return makeFactionSections({
    type: data.type,
    reputation: data.reputation,
    base: base?.title ?? data.baseLabel ?? data.baseLocationId,
    realm: region?.title ?? data.regionId,
    goal: data.goal,
    methods: data.methods,
    leader: leader
      ? renderDocLink(leader.title, getCharacterDocPath(leader))
      : data.leaderCharacterId
        ? 'Lider desconocido'
        : undefined,
    allies: renderDelimitedValues(
      allyIds.map((id: string) => getFactionById(id)?.title ?? id),
    ),
    rivals: renderDelimitedValues(
      rivalIds.map((id: string) => getFactionById(id)?.title ?? id),
    ),
  });
}

/* -----------------------------
   Optional helpers for DBs
------------------------------ */

export type CharacterDB = Record<string, CharacterJson>;
export type LocationDB = Record<string, LocationJson>;
export type FactionDB = Record<string, FactionJson>;
