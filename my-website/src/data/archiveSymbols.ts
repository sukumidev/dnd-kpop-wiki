import vectorAssets from "./archiveVectorAssets.json";

/** The 32 historical CMS symbols are persisted as glyphs. */
export const ARCHIVE_SYMBOLS = {
  star: "✦", seal: "❖", spark: "✧", asterisk: "✳",
  moon: "☾", sun: "☼", constellation: "✩", eclipse: "⊙", "arcane-eye": "◉", crystal: "◆",
  "crossed-swords": "⚔", shield: "⛨", arrow: "➶", crown: "♛", laurel: "❧", "fleur-de-lis": "⚜",
  leaf: "☙", flower: "❀", branch: "❦", seed: "✥", wildflower: "⚘", vine: "✾",
  envelope: "✉", quill: "✒", scroll: "▤", stamp: "▣", "wax-seal": "◈", inkwell: "⚗",
  flame: "♨", "rune-circle": "⊛", hourglass: "⌛", key: "⚿",
} as const;

export type OrnamentSymbolDefinition = {
  id: string;
  label: string;
  category: string;
  /** The exact value persisted in metadata.library.appearance.symbol. */
  value: string;
  /** Approved local SVG; only the twelve newer CMS symbols have an asset. */
  asset?: string;
};

const legacyInfo: [keyof typeof ARCHIVE_SYMBOLS, string, string][] = [
  ["star", "Estrella", "classic"], ["seal", "Rombo", "classic"], ["spark", "Destello", "classic"], ["asterisk", "Astro", "classic"],
  ["moon", "Luna", "celestial"], ["sun", "Sol", "celestial"], ["constellation", "Constelación", "celestial"], ["eclipse", "Eclipse", "celestial"], ["arcane-eye", "Ojo arcano", "celestial"], ["crystal", "Cristal", "celestial"],
  ["crossed-swords", "Espadas cruzadas", "heraldic"], ["shield", "Escudo", "heraldic"], ["arrow", "Flecha", "heraldic"], ["crown", "Corona", "heraldic"], ["laurel", "Laurel", "heraldic"], ["fleur-de-lis", "Flor de lis", "heraldic"],
  ["leaf", "Hoja", "nature"], ["flower", "Flor", "nature"], ["branch", "Rama", "nature"], ["seed", "Semilla", "nature"], ["wildflower", "Flor silvestre", "nature"], ["vine", "Enredadera", "nature"],
  ["envelope", "Sobre", "editorial"], ["quill", "Pluma", "editorial"], ["scroll", "Legajo", "editorial"], ["stamp", "Estampa", "editorial"], ["wax-seal", "Sello de cera", "editorial"], ["inkwell", "Tintero", "editorial"],
  ["flame", "Llama", "mystic"], ["rune-circle", "Círculo rúnico", "mystic"], ["hourglass", "Reloj de arena", "mystic"], ["key", "Llave", "mystic"],
];

export const ORNAMENTAL_SYMBOLS: OrnamentSymbolDefinition[] = [
  ...legacyInfo.map(([id, label, category]) => ({ id, label, category, value: ARCHIVE_SYMBOLS[id] })),
  ...vectorAssets.map(({ id, label, family, asset }) => ({ id, label, category: family, value: id, asset })),
];

const byValue = new Map(ORNAMENTAL_SYMBOLS.map((symbol) => [symbol.value, symbol]));
const byId = new Map(ORNAMENTAL_SYMBOLS.map((symbol) => [symbol.id, symbol]));

export function getOrnamentSymbol(value: unknown): OrnamentSymbolDefinition | undefined {
  return typeof value === "string" ? byValue.get(value) ?? byId.get(value) : undefined;
}

/** Resolve the stored CMS value without changing the original JSON. */
export function resolveArchiveSymbol(value: unknown, fallback: string = ARCHIVE_SYMBOLS.star): string {
  return getOrnamentSymbol(value)?.value ?? fallback;
}
