/** Values exported by the CMS ornamentalSymbols catalog (2026-11-11). */
export const ARCHIVE_SYMBOLS = {
  star: "✦", seal: "❖", spark: "✧", asterisk: "✳",
  moon: "☾", sun: "☼", constellation: "✩", eclipse: "⊙", "arcane-eye": "◉", crystal: "◆",
  "crossed-swords": "⚔", shield: "⛨", arrow: "➶", crown: "♛", laurel: "❧", "fleur-de-lis": "⚜",
  leaf: "☙", flower: "❀", branch: "❦", seed: "✥", wildflower: "⚘", vine: "✾",
  envelope: "✉", quill: "✒", scroll: "▤", stamp: "▣", "wax-seal": "◈", inkwell: "⚗",
  flame: "♨", "rune-circle": "⊛", hourglass: "⌛", key: "⚿",
} as const;

const catalogValues = new Set<string>(Object.values(ARCHIVE_SYMBOLS));

/** The CMS exports glyphs, but accepting its internal IDs is safe for future exports. */
export function resolveArchiveSymbol(value: unknown, fallback: string = ARCHIVE_SYMBOLS.star): string {
  if (typeof value !== "string") return fallback;
  if (catalogValues.has(value)) return value;
  return ARCHIVE_SYMBOLS[value as keyof typeof ARCHIVE_SYMBOLS] ?? fallback;
}
