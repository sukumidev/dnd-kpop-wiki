const OMIT = Symbol("omitted-private-data");

export function publicCharacters(registry) {
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    throw new TypeError("Expected a character ID-indexed registry.");
  }
  return Object.fromEntries(Object.entries(registry).filter(([, c]) => c && c.visibility === "public"));
}

export function sanitiseRelations(value, hiddenIds) {
  if (typeof value === "string") {
    if (hiddenIds.has(value)) return OMIT;
    if ([...hiddenIds].some((id) => value.endsWith("characters/npc/" + id) ||
        value.endsWith("characters/party/" + id))) return OMIT;
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((x) => sanitiseRelations(x, hiddenIds)).filter((x) => x !== OMIT);
  }
  if (value && typeof value === "object") {
    // An entire relationship must be omitted to avoid leaking its label.
    if (["characterId", "id"].some((key) => hiddenIds.has(value[key]))) return OMIT;
    const filtered = {};
    for (const [key, item] of Object.entries(value)) {
      if (hiddenIds.has(key)) continue;
      const transformed = sanitiseRelations(item, hiddenIds);
      if (transformed !== OMIT) filtered[key] = transformed;
    }
    return filtered;
  }
  return value;
}

// Keep publicly authored mythic profiles even when their optional character
// reference is private. The character record remains excluded from the build.
export function sanitisePublicCosmology(cosmology, hiddenIds) {
  if (!cosmology || typeof cosmology !== "object" || Array.isArray(cosmology)) {
    throw new TypeError("Expected a cosmology ID-indexed registry.");
  }
  const result = {};
  for (const [id, entity] of Object.entries(cosmology)) {
    if (hiddenIds.has(id) || !entity || typeof entity !== "object" || Array.isArray(entity)) continue;
    const copy = {...entity};
    if (typeof copy.characterId === "string" && hiddenIds.has(copy.characterId)) {
      delete copy.characterId;
    }
    const safe = sanitiseRelations(copy, hiddenIds);
    if (safe !== OMIT) result[id] = safe;
  }
  return result;
}

export function containsTerm(text, term) {
  if (!term || typeof text !== "string") return false;
  const escaped = term.replace(/[.*+?^$()|[\]{}\\]/g, "\\$&");
  return new RegExp("(?<![\\p{L}\\p{N}])" + escaped + "(?![\\p{L}\\p{N}])", "iu").test(text);
}

export function findLeaks(text, forbidden, max = 25) {
  const leaks = [];
  for (const term of forbidden) {
    if (term.length >= 4 && containsTerm(text, term)) {
      leaks.push(term);
      if (leaks.length >= max) break;
    }
  }
  return leaks;
}

// Relax only narrative name/title matching when explicitly opted in.
// Private record identifiers remain blocked in public output audits.
export function restrictedIdentifiers(hidden, privateDocuments) {
  return new Set([
    ...Object.keys(hidden),
    ...privateDocuments.map((document) => document.id).filter((id) => typeof id === "string"),
  ]);
}

export function restrictedTerms(hidden, privateDocuments, publicRegistry) {
  const terms = new Set([...Object.keys(hidden), ...privateDocuments.map((d) => d.id)]);
  const publicTitles = new Set(Object.values(publicRegistry)
    .map((c) => String(c.title || "").toLowerCase()));
  for (const ch of Object.values(hidden)) {
    if (typeof ch.title === "string" && ch.title.trim().length >= 5 &&
        !publicTitles.has(ch.title.trim().toLowerCase())) terms.add(ch.title.trim());
  }
  for (const doc of privateDocuments) {
    if (typeof doc.title === "string" && doc.title.trim().length >= 8) terms.add(doc.title.trim());
  }
  return terms;
}

export function approvedTeasers(definitions, hidden, prohibited) {
  if (!Array.isArray(definitions)) throw new TypeError("Teaser definitions must be an array.");
  const published = [], slugs = new Set();
  for (const item of definitions) {
    if (item?.publish !== true) continue;
    if (!hidden[item.characterId]) throw new Error("Mystery target must be a hidden character.");
    if (typeof item.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) ||
        item.slug.length > 72 || slugs.has(item.slug)) throw new Error("Invalid or repeated mystery slug.");
    if (typeof item.title !== "string" || !item.title.trim() ||
        typeof item.teaser !== "string" || !item.teaser.trim()) {
      throw new Error("Approved teaser needs a title and public description.");
    }
    if (item.imageSrc !== undefined && (typeof item.imageSrc !== "string" ||
        !/^\/img\/mysteries\/[a-z0-9][a-z0-9/_-]*\.webp$/.test(item.imageSrc))) {
      throw new Error("Mystery images must be explicitly curated under /img/mysteries/.");
    }
    const text = [item.slug, item.title, item.teaser].join(" ");
    for (const phrase of prohibited) {
      const slugTerm = phrase.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (phrase.length >= 4 && (containsTerm(text, phrase) ||
          (slugTerm.length >= 4 && containsTerm(item.slug, slugTerm)))) {
        throw new Error("Teaser could disclose a private name or identifier: " + item.slug);
      }
    }
    slugs.add(item.slug);
    // Strict allowlist: deliberately do not serialize characterId or extra metadata.
    published.push({
      slug: item.slug,
      title: item.title.trim(),
      teaser: item.teaser.trim(),
      ...(item.imageSrc ? {imageSrc: item.imageSrc} : {}),
    });
  }
  return published;
}
