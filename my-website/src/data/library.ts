import realmCatalogJson from "./realmCatalog.json";
import { locations } from "./locations";
import { getOrnamentSymbol, resolveArchiveSymbol } from "./archiveSymbols";
import {
  getPublicTopLevelDocuments,
  isDocumentCollection,
  type BookAppearance,
  type ArchiveDisplayMode,
  type ArchiveMaterial,
  type ArchiveWear,
  type Document,
  type LibraryMetadata,
} from "./documents";

type Realm = { id: string; title: string; administrative?: boolean };
const realms = realmCatalogJson as Realm[];
const realmById = new Map(realms.filter((realm) => !realm.administrative).map((realm) => [realm.id, realm]));
const realmOrder = new Map(realms.map((realm, index) => [realm.id, index]));

export type LibraryShelf = {
  id: string;
  title: string;
  description: string;
  documents: Document[];
  kind: "realm" | "other" | "unknown";
};

export type ResolvedBookAppearance = Required<Omit<BookAppearance, "displayMode" | "material" | "wear">>;

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** Reads the optional extension without changing the existing public document contract. */
export function getLibraryMetadata(document: Document): LibraryMetadata {
  const value = document.metadata?.library;
  return record(value) ? value as LibraryMetadata : {};
}

function nonemptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function realmForLocation(locationId: string): Realm | undefined {
  let currentId: string | null | undefined = locationId;
  const seen = new Set<string>();
  while (currentId && !seen.has(currentId)) {
    seen.add(currentId);
    const realm = realmById.get(currentId);
    if (realm) return realm;
    const location = locations[currentId];
    currentId = location?.regionId || location?.parentLocationId;
  }
  return undefined;
}

export function getDiscoveryPlacement(document: Document): Pick<LibraryShelf, "id" | "title" | "description" | "kind"> {
  const library = getLibraryMetadata(document);
  const discoveredAt = nonemptyString(library.discoveredAt);
  if (discoveredAt) {
    const realm = realmForLocation(discoveredAt);
    if (realm) return { ...realm, kind: "realm", description: `Encontrado en ${locations[discoveredAt]?.title ?? realm.title}` };
    return { id: "other", title: "Otros lugares", kind: "other", description: `Lugar de hallazgo: ${locations[discoveredAt]?.title ?? discoveredAt}` };
  }

  const discoveredRealmId = nonemptyString(library.discoveredRealmId);
  if (discoveredRealmId) {
    const realm = realmById.get(discoveredRealmId);
    if (realm) return { ...realm, kind: "realm", description: `Encontrado en ${realm.title}` };
    return { id: "other", title: "Otros lugares", kind: "other", description: `Reino de hallazgo no catalogado: ${discoveredRealmId}` };
  }

  return { id: "unknown", title: "Ubicación no registrada", kind: "unknown", description: "No se ha registrado el lugar del hallazgo" };
}

/** One top-level volume per document or collection, ordered independently of JSON input order. */
export function groupLibraryDocuments(list: Document[] = getPublicTopLevelDocuments()): LibraryShelf[] {
  const groups = new Map<string, LibraryShelf>();
  for (const document of getPublicTopLevelDocuments(list)) {
    if (getLibraryMetadata(document).hidden === true) continue;
    const placement = getDiscoveryPlacement(document);
    const shelf = groups.get(placement.id) ?? { ...placement, documents: [] };
    shelf.documents.push(document);
    groups.set(placement.id, shelf);
  }
  return [...groups.values()]
    .map((shelf) => ({
      ...shelf,
      documents: shelf.documents.sort((a, b) => a.title.localeCompare(b.title, "es") || a.id.localeCompare(b.id)),
    }))
    .sort((a, b) => {
      const rank = (shelf: LibraryShelf) => shelf.kind === "realm" ? 0 : shelf.kind === "other" ? 1 : 2;
      return rank(a) - rank(b) || (realmOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (realmOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title, "es");
    });
}

export const ARCHIVE_DISPLAY_MODES = ["book", "letter", "newspaper", "dossier", "notice", "scroll"] as const;
export const ARCHIVE_MATERIALS = ["leather", "cloth", "parchment", "newsprint", "canvas", "aged-paper"] as const;
export const ARCHIVE_WEARS = ["new", "used", "ancient"] as const;
export const ORNAMENT_FRAME_STYLES = ["none", "circle", "diamond", "laurel-frame", "arcane", "filigree-frame"] as const;
export type OrnamentFrameStyle = (typeof ORNAMENT_FRAME_STYLES)[number];
export function isDecorativeFrame(value: BookAppearance["ornament"]): value is Exclude<OrnamentFrameStyle, "none"> {
  return value !== "none" && ORNAMENT_FRAME_STYLES.includes(value as OrnamentFrameStyle);
}

const materialsByMode = {
  book: ["leather", "cloth", "canvas"],
  letter: ["parchment", "aged-paper"],
  newspaper: ["newsprint", "aged-paper"],
  dossier: ["leather", "cloth", "canvas"],
  notice: ["leather", "canvas", "aged-paper"],
  scroll: ["parchment", "aged-paper"],
} as const;
const defaultMaterial = {
  book: "leather", letter: "parchment", newspaper: "newsprint", dossier: "canvas", notice: "leather", scroll: "aged-paper",
} as const;

export type ResolvedArchiveAppearance = ResolvedBookAppearance & {
  displayMode: ArchiveDisplayMode;
  material: ArchiveMaterial;
  wear: ArchiveWear;
};

const colors = ["#384a77", "#4e467a", "#295568", "#55476d", "#345b66", "#454c78"];
const accents = ["#d8bc82", "#a9d6bd", "#c3b3e7", "#b5d4df"];
const symbols = ["✦", "❖", "✧", "✳"];
const ornaments: ResolvedBookAppearance["ornament"][] = ["filigree", "stars", "laurel"];

function hash(value: string): number {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}

function option<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? value as T : fallback;
}

function color(value: unknown, fallback: string): string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function imagePath(value: unknown): string | null {
  return typeof value === "string" && /^\/(?!\/)[\w./%\-]+$/.test(value) && !value.includes("..") ? value : null;
}

export function resolveBookAppearance(document: Document): ResolvedBookAppearance {
  const index = hash(document.id);
  const custom = getLibraryMetadata(document).appearance;
  const appearance = record(custom) ? custom : {};
  const collection = isDocumentCollection(document);
  const defaultTitle = document.title.length > 38 ? `${document.title.slice(0, 35).trimEnd()}…` : document.title;
  const requestedSymbol = nonemptyString(appearance.symbol);
  const fallbackSymbol = symbols[(index >>> 7) % symbols.length];
  return {
    spineTitle: nonemptyString(appearance.spineTitle)?.slice(0, 80) ?? defaultTitle,
    color: color(appearance.color, colors[index % colors.length]),
    accentColor: color(appearance.accentColor, accents[(index >>> 3) % accents.length]),
    symbol: getOrnamentSymbol(requestedSymbol) ? resolveArchiveSymbol(requestedSymbol) : fallbackSymbol,
    ornament: option(appearance.ornament, ["filigree", "stars", "laurel", ...ORNAMENT_FRAME_STYLES] as const, ornaments[(index >>> 5) % ornaments.length]),
    height: option(appearance.height, ["short", "medium", "tall"] as const, collection ? "tall" : ["short", "medium", "tall"][(index >>> 9) % 3] as ResolvedBookAppearance["height"]),
    thickness: option(appearance.thickness, ["thin", "medium", "thick"] as const, collection ? "thick" : ["thin", "medium"][(index >>> 11) % 2] as ResolvedBookAppearance["thickness"]),
    texture: option(appearance.texture, ["leather", "cloth", "aged"] as const, ["leather", "cloth", "aged"][(index >>> 13) % 3] as ResolvedBookAppearance["texture"]),
    spineImage: imagePath(appearance.spineImage),
  };
}

/** Opt-in physical modes. Missing displayMode retains the exact legacy book preset. */
export function resolveArchiveAppearance(document: Document): ResolvedArchiveAppearance {
  const custom = getLibraryMetadata(document).appearance;
  const appearance = record(custom) ? custom : {};
  const displayMode = option(appearance.displayMode, ARCHIVE_DISPLAY_MODES, "book");
  const legacy = resolveBookAppearance(document);
  const requestedMaterial = option(appearance.material, ARCHIVE_MATERIALS, defaultMaterial[displayMode]);
  const material = (materialsByMode[displayMode] as readonly string[]).includes(requestedMaterial) ? requestedMaterial : defaultMaterial[displayMode];
  return {
    ...legacy,
    displayMode,
    material,
    wear: option(appearance.wear, ARCHIVE_WEARS, "new"),
  };
}

/** Validation shared by the Wiki data check and future JSON exporters. */
export function validateLibraryMetadata(value: unknown): string[] {
  if (value === undefined) return [];
  if (!record(value)) return ["metadata.library debe ser un objeto"];
  const errors: string[] = [];
  for (const field of ["discoveredAt", "discoveredRealmId"] as const) {
    if (value[field] !== undefined && value[field] !== null && !nonemptyString(value[field])) errors.push(`${field} debe ser un ID no vacío o null`);
  }
  if (value.hidden !== undefined && typeof value.hidden !== "boolean") errors.push("hidden debe ser booleano");
  if (value.appearance !== undefined) {
    if (!record(value.appearance)) return [...errors, "appearance debe ser un objeto"];
    const appearance = value.appearance;
    for (const field of ["spineTitle", "symbol"] as const) {
      if (appearance[field] !== undefined && !nonemptyString(appearance[field])) errors.push(`appearance.${field} debe ser texto no vacío`);
    }
    if (nonemptyString(appearance.symbol) && !getOrnamentSymbol(appearance.symbol)) errors.push("appearance.symbol no pertenece al catálogo ornamental");
    for (const field of ["color", "accentColor"] as const) {
      if (appearance[field] !== undefined && color(appearance[field], "") === "") errors.push(`appearance.${field} debe ser un color hexadecimal #RRGGBB`);
    }
    for (const [field, allowed] of [
      ["ornament", ["filigree", "stars", "laurel", ...ORNAMENT_FRAME_STYLES]],
      ["height", ["short", "medium", "tall"]],
      ["thickness", ["thin", "medium", "thick"]],
      ["texture", ["leather", "cloth", "aged"]],
      ["displayMode", ARCHIVE_DISPLAY_MODES],
      ["material", ARCHIVE_MATERIALS],
      ["wear", ARCHIVE_WEARS],
    ] as const) {
      if (appearance[field] !== undefined && !allowed.includes(appearance[field] as never)) errors.push(`appearance.${field} no es un valor admitido`);
    }
    if (appearance.spineImage !== undefined && appearance.spineImage !== null && !imagePath(appearance.spineImage)) errors.push("appearance.spineImage debe ser una ruta pública absoluta del sitio");
  }
  return errors;
}
