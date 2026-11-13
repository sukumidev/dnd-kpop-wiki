export const DOCUMENT_IMAGE_SIZES = ["small", "medium", "large", "full"] as const;
export const DOCUMENT_IMAGE_ALIGNMENTS = ["left", "center", "right"] as const;
export const DOCUMENT_GALLERY_COLUMNS = ["1", "2", "3"] as const;

export type DocumentImageSize = (typeof DOCUMENT_IMAGE_SIZES)[number];
export type DocumentImageAlign = (typeof DOCUMENT_IMAGE_ALIGNMENTS)[number];
export type DocumentGalleryColumns = (typeof DOCUMENT_GALLERY_COLUMNS)[number];

/** Mirrors the CMS URL guard for literal MDX and Markdown references. */
export function isSafeDocumentUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const normalized = [...value.trim()]
    .filter((character) => character.charCodeAt(0) > 31 && character.charCodeAt(0) !== 127 && !/\s/.test(character))
    .join("")
    .toLowerCase();
  return !/^(?:javascript|vbscript|data|blob):/.test(normalized);
}

export function isSafeDocumentImageSource(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim() || !isSafeDocumentUrl(value)) return false;
  const source = value.trim();
  if (source.startsWith("//")) return false;
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(source);
  return !scheme || /^https?:\/\/[^\s/?#]+/i.test(source);
}
