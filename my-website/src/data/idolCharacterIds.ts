// DATA-001: Curated IDs verified in dev-docs/audits/idol-birthdates-audit.md.
// The public build sanitises the JSON source to avoid bundling hidden IDs.
import idolIds from "./idolCharacterIds.json";

export const idolCharacterIds = new Set<string>(idolIds);
