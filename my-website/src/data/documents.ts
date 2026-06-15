import documentsJson from "./documents.json";
import { hasPublicDocumentVisibility } from "./documentVisibility";
import {
  getCharacterById,
  getFactionById,
  getLocationById,
  getQuestById,
  type Character,
  type Faction,
  type Location,
  type Quest,
} from "./relationships";

export const DOCUMENT_TYPES = [
  "book",
  "lore",
  "rumor",
  "guild-announcement",
  "letter",
  "note",
  "newspaper",
  "diary",
  "report",
  "decree",
  "testimony",
  "contract",
  "prophecy",
  "handout",
  "other",
] as const;

export const DOCUMENT_STATUSES = ["draft", "published", "archived"] as const;

export const DOCUMENT_VISIBILITIES = [
  "public",
  "hidden",
  "secret",
  "dm-only",
] as const;

export const DOCUMENT_KINDS = ["single", "collection", "entry"] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
export type DocumentVisibility = (typeof DOCUMENT_VISIBILITIES)[number];
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];
export type DocumentCharacterRelationRole = "author" | "recipient" | "related";

export type Document = {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  visibility: DocumentVisibility;
  documentKind?: DocumentKind;
  parentDocumentId?: string;
  order?: number;
  chapterNumber?: number;
  chapterTitle?: string;

  subtitle?: string;
  summary?: string;
  content?: string;
  excerpt?: string;

  authorName?: string;
  authorCharacterId?: string | null;
  recipientCharacterIds?: string[];

  dateLabel?: string;
  inWorldDate?: string;
  sessionIds?: string[];

  characterIds?: string[];
  questIds?: string[];
  factionIds?: string[];
  locationIds?: string[];

  tags?: string[];
  imageSrc?: string;
  attachments?: unknown[];
  source?: string;
  notes?: string;
  metadata?: Record<string, unknown>;

  [key: string]: unknown;
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  book: "Libro",
  lore: "Lore",
  rumor: "Rumor",
  "guild-announcement": "Anuncio del gremio",
  letter: "Carta",
  note: "Nota",
  newspaper: "Periódico",
  diary: "Diario",
  report: "Reporte",
  decree: "Decreto",
  testimony: "Testimonio",
  contract: "Contrato",
  prophecy: "Profecía",
  handout: "Handout",
  other: "Otro",
};

const DOCUMENT_TYPE_SET = new Set<string>(DOCUMENT_TYPES);
const DOCUMENT_STATUS_SET = new Set<string>(DOCUMENT_STATUSES);
const DOCUMENT_VISIBILITY_SET = new Set<string>(DOCUMENT_VISIBILITIES);
const DOCUMENT_KIND_SET = new Set<string>(DOCUMENT_KINDS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isDocumentType(value: unknown): value is DocumentType {
  return typeof value === "string" && DOCUMENT_TYPE_SET.has(value);
}

export function isDocumentStatus(value: unknown): value is DocumentStatus {
  return typeof value === "string" && DOCUMENT_STATUS_SET.has(value);
}

export function isDocumentVisibility(value: unknown): value is DocumentVisibility {
  return typeof value === "string" && DOCUMENT_VISIBILITY_SET.has(value);
}

export function isDocumentKind(value: unknown): value is DocumentKind {
  return typeof value === "string" && DOCUMENT_KIND_SET.has(value);
}

export function isDocument(value: unknown): value is Document {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    isDocumentType(value.type) &&
    isDocumentStatus(value.status) &&
    isDocumentVisibility(value.visibility) &&
    (value.documentKind === undefined || isDocumentKind(value.documentKind))
  );
}

export function normalizeDocuments(value: unknown): Document[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isDocument);
}

/**
 * Public Wiki visibility gate.
 *
 * Public document pages must use this helper (or helpers built on top of it)
 * instead of checking status/visibility inline.
 */
export function isPublicDocument(document: Document): boolean {
  return hasPublicDocumentVisibility(document);
}

export const documents = normalizeDocuments(documentsJson);

export const publicDocuments = getPublicDocuments(documents);

export const publicIndexDocuments = getPublicIndexDocuments(documents);

export function getDocuments(list: Document[] = documents): Document[] {
  return [...list];
}

export function getPublicDocuments(list: Document[] = documents): Document[] {
  return list.filter(isPublicDocument);
}

export function getDocumentKind(document: Document): DocumentKind {
  return document.documentKind ?? "single";
}

export function getDocumentPath(document: Document): string {
  return `/documents/${encodeURIComponent(document.id)}`;
}

export function isDocumentCollection(document: Document): boolean {
  return getDocumentKind(document) === "collection";
}

export function isDocumentEntry(document: Document): boolean {
  return getDocumentKind(document) === "entry";
}

export function isStandaloneDocument(document: Document): boolean {
  return getDocumentKind(document) === "single";
}

/**
 * Public /documents index items.
 *
 * Entries with a parent are intentionally omitted from the main index to keep
 * large collections readable. They remain reachable from their public parent.
 */
export function getPublicIndexDocuments(list: Document[] = documents): Document[] {
  return getPublicDocuments(list).filter(
    (document) => !isDocumentEntry(document) || !document.parentDocumentId,
  );
}

export function getPublicTopLevelDocuments(list: Document[] = documents): Document[] {
  return getPublicIndexDocuments(list);
}

export function getPublicStandaloneDocuments(list: Document[] = documents): Document[] {
  return getPublicDocuments(list).filter(isStandaloneDocument);
}

export function getPublicCollections(list: Document[] = documents): Document[] {
  return getPublicDocuments(list).filter(isDocumentCollection);
}

/**
 * Internal lookup. Public pages must use getPublicDocumentById so draft,
 * archived, hidden, secret, and dm-only documents cannot leak metadata.
 */
export function getDocumentById(id: string, list: Document[] = documents): Document | undefined {
  return list.find((document) => document.id === id);
}

export function getPublicDocumentById(
  id: string,
  list: Document[] = documents,
): Document | undefined {
  return getPublicDocuments(list).find((document) => document.id === id);
}

export function getParentDocument(
  document: Document,
  list: Document[] = documents,
): Document | undefined {
  if (!document.parentDocumentId) return undefined;
  return getDocumentById(document.parentDocumentId, list);
}

export function getPublicParentDocument(
  document: Document,
  list: Document[] = documents,
): Document | undefined {
  if (!document.parentDocumentId) return undefined;
  return getPublicDocumentById(document.parentDocumentId, list);
}

export function sortDocumentEntries(entries: Document[]): Document[] {
  return [...entries].sort((a, b) => {
    const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;

    if (aOrder !== bOrder) return aOrder - bOrder;

    const aChapter = a.chapterNumber ?? Number.MAX_SAFE_INTEGER;
    const bChapter = b.chapterNumber ?? Number.MAX_SAFE_INTEGER;

    if (aChapter !== bChapter) return aChapter - bChapter;
    return a.title.localeCompare(b.title);
  });
}

export function getChildDocuments(
  parentId: string,
  list: Document[] = documents,
): Document[] {
  return sortDocumentEntries(list.filter((document) => document.parentDocumentId === parentId));
}

export function getPublicChildDocuments(
  parentId: string,
  list: Document[] = documents,
): Document[] {
  return sortDocumentEntries(
    getPublicDocuments(list).filter((document) => document.parentDocumentId === parentId),
  );
}

export function getSiblingEntriesForDocument(
  document: Document,
  list: Document[] = documents,
): Document[] {
  if (!isDocumentEntry(document) || !document.parentDocumentId) return [];
  return sortDocumentEntries(
    list.filter(
      (candidate) =>
        isDocumentEntry(candidate) && candidate.parentDocumentId === document.parentDocumentId,
    ),
  );
}

export function getPublicSiblingEntriesForDocument(
  document: Document,
  list: Document[] = documents,
): Document[] {
  if (!isDocumentEntry(document) || !document.parentDocumentId) return [];

  const publicParent = getPublicParentDocument(document, list);
  if (!publicParent || !isDocumentCollection(publicParent)) return [];

  return getPublicChildDocuments(publicParent.id, list).filter(isDocumentEntry);
}

export function getPreviousAndNextDocumentEntries(
  document: Document,
  list: Document[] = documents,
): { previous?: Document; next?: Document } {
  const siblings = getPublicSiblingEntriesForDocument(document, list);
  const currentIndex = siblings.findIndex((entry) => entry.id === document.id);

  if (currentIndex < 0) return {};

  return {
    previous: currentIndex > 0 ? siblings[currentIndex - 1] : undefined,
    next: currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : undefined,
  };
}

export function getPublicEntryCountForCollection(
  parentId: string,
  list: Document[] = documents,
): number {
  return getPublicChildDocuments(parentId, list).length;
}

/**
 * Display target for public entity backlinks.
 *
 * Public entries with a public collection parent collapse to the collection so
 * entity pages do not list every chapter. If an entry points to a non-public
 * parent, the backlink is hidden to avoid exposing private collection metadata.
 */
export function getRelatedDocumentDisplayTarget(
  document: Document,
  list: Document[] = documents,
): Document | null {
  if (!isPublicDocument(document)) return null;

  if (isDocumentEntry(document) && document.parentDocumentId) {
    const publicParent = getPublicDocumentById(document.parentDocumentId, list);

    if (publicParent && isDocumentCollection(publicParent)) {
      return publicParent;
    }

    const parent = getDocumentById(document.parentDocumentId, list);
    if (parent && !isPublicDocument(parent)) {
      return null;
    }
  }

  return document;
}

export function collapseCollectionEntries(
  documentList: Document[],
  list: Document[] = documents,
): Document[] {
  const displayDocumentsById = new Map<string, Document>();

  for (const document of documentList) {
    const target = getRelatedDocumentDisplayTarget(document, list);
    if (!target) continue;

    displayDocumentsById.set(target.id, target);
  }

  return [...displayDocumentsById.values()].sort((a, b) => a.title.localeCompare(b.title));
}

export function filterDocumentsByType(
  documentList: Document[],
  type: DocumentType | "all",
): Document[] {
  if (type === "all") return documentList;
  return documentList.filter((document) => document.type === type);
}

export function filterDocumentsByTag(documentList: Document[], tag: string): Document[] {
  if (!tag || tag === "all") return documentList;
  return documentList.filter((document) => document.tags?.includes(tag));
}

export function searchDocuments(documentList: Document[], query: string): Document[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return documentList;

  return documentList.filter((document) => {
    const searchableText = [
      document.title,
      document.subtitle,
      document.summary,
      document.excerpt,
      document.dateLabel,
      document.inWorldDate,
      ...(document.tags ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export function getCharacterDocumentRelationRole(
  document: Document,
  characterId: string,
): DocumentCharacterRelationRole | undefined {
  if (document.authorCharacterId === characterId) return "author";
  if (document.recipientCharacterIds?.includes(characterId)) return "recipient";
  if (document.characterIds?.includes(characterId)) return "related";
  return undefined;
}

export function getPublicDocumentsForCharacter(
  characterId: string,
  list: Document[] = documents,
): Document[] {
  return getPublicDocuments(list).filter((document) =>
    Boolean(getCharacterDocumentRelationRole(document, characterId)),
  );
}

export function getPublicDocumentsForQuest(
  questId: string,
  list: Document[] = documents,
): Document[] {
  return getPublicDocuments(list).filter((document) => document.questIds?.includes(questId));
}

export function getPublicDocumentsForFaction(
  factionId: string,
  list: Document[] = documents,
): Document[] {
  return getPublicDocuments(list).filter((document) => document.factionIds?.includes(factionId));
}

export function getPublicDocumentsForLocation(
  locationId: string,
  list: Document[] = documents,
): Document[] {
  return getPublicDocuments(list).filter((document) => document.locationIds?.includes(locationId));
}

function pushRelatedCharacter(
  relations: Map<string, DocumentCharacterRelationRole>,
  characterId: string | null | undefined,
  relationRole: DocumentCharacterRelationRole,
) {
  if (!characterId) return;

  const existingRole = relations.get(characterId);
  if (existingRole === "author") return;
  if (existingRole === "recipient" && relationRole === "related") return;

  relations.set(characterId, relationRole);
}

export function getRelatedCharactersForDocument(
  document: Document,
): { character: Character; relationRole: DocumentCharacterRelationRole }[] {
  const relations = new Map<string, DocumentCharacterRelationRole>();

  pushRelatedCharacter(relations, document.authorCharacterId, "author");
  for (const characterId of document.recipientCharacterIds ?? []) {
    pushRelatedCharacter(relations, characterId, "recipient");
  }
  for (const characterId of document.characterIds ?? []) {
    pushRelatedCharacter(relations, characterId, "related");
  }

  return [...relations.entries()]
    .map(([characterId, relationRole]) => {
      const character = getCharacterById(characterId);
      return character ? { character, relationRole } : undefined;
    })
    .filter(Boolean) as { character: Character; relationRole: DocumentCharacterRelationRole }[];
}

export function getDocumentCharacterRelations(document: Document): {
  authors: Character[];
  recipients: Character[];
  related: Character[];
} {
  const relatedCharacters = getRelatedCharactersForDocument(document);

  return {
    authors: relatedCharacters
      .filter((relation) => relation.relationRole === "author")
      .map((relation) => relation.character),
    recipients: relatedCharacters
      .filter((relation) => relation.relationRole === "recipient")
      .map((relation) => relation.character),
    related: relatedCharacters
      .filter((relation) => relation.relationRole === "related")
      .map((relation) => relation.character),
  };
}

function resolveRelatedEntities<T>(
  ids: string[] | undefined,
  resolver: (id: string) => T | undefined,
): T[] {
  const seen = new Set<string>();
  const resolved: T[] = [];

  for (const id of ids ?? []) {
    if (seen.has(id)) continue;
    seen.add(id);

    const entity = resolver(id);
    if (entity) resolved.push(entity);
  }

  return resolved;
}

export function getRelatedQuestsForDocument(document: Document): Quest[] {
  return resolveRelatedEntities(document.questIds, getQuestById);
}

export function getRelatedFactionsForDocument(document: Document): Faction[] {
  return resolveRelatedEntities(document.factionIds, getFactionById);
}

export function getRelatedLocationsForDocument(document: Document): Location[] {
  return resolveRelatedEntities(document.locationIds, getLocationById);
}

export function getDocumentRelationships(document: Document): {
  characters: { character: Character; relationRole: DocumentCharacterRelationRole }[];
  quests: Quest[];
  factions: Faction[];
  locations: Location[];
} {
  return {
    characters: getRelatedCharactersForDocument(document),
    quests: getRelatedQuestsForDocument(document),
    factions: getRelatedFactionsForDocument(document),
    locations: getRelatedLocationsForDocument(document),
  };
}

export function getDocumentTypeLabel(type: DocumentType): string {
  return DOCUMENT_TYPE_LABELS[type];
}
