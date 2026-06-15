export const PUBLIC_DOCUMENT_STATUS = "published";
export const PUBLIC_DOCUMENT_VISIBILITY = "public";

export type DocumentVisibilityFields = {
  status?: unknown;
  visibility?: unknown;
};

/**
 * Public Wiki rule for documents.
 *
 * A document is public only when it is explicitly published and explicitly public.
 * Everything else (draft, archived, hidden, secret, dm-only, missing, or unknown)
 * must be treated as non-public so public pages cannot expose spoilers by accident.
 */
export function hasPublicDocumentVisibility(document: DocumentVisibilityFields): boolean {
  return (
    document.status === PUBLIC_DOCUMENT_STATUS &&
    document.visibility === PUBLIC_DOCUMENT_VISIBILITY
  );
}
