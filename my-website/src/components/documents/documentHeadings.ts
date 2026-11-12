/** Stable, URL-safe anchors shared by legacy Markdown headings and the optional index. */
export function slugDocumentHeading(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "seccion";
}

export function nextDocumentHeadingId(text: string, used: Map<string, number>): string {
  const base = slugDocumentHeading(text);
  const count = (used.get(base) ?? 0) + 1;
  used.set(base, count);
  return count === 1 ? base : `${base}-${count}`;
}
