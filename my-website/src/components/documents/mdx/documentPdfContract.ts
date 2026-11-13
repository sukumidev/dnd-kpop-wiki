/** Matches the persisted DocumentPdf path contract in hallyura-cms PR #16. */
export function isDocumentPdfSrc(value: unknown): value is string {
  return typeof value === "string" &&
    /^\/handouts\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*\.pdf$/.test(value) &&
    !value.includes("..");
}

export type DocumentPdfDisplay = "embedded" | "card";

export function isDocumentPdfDisplay(value: unknown): value is DocumentPdfDisplay {
  return value === "embedded" || value === "card";
}
