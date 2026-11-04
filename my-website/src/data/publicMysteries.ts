import rawMysteries from "./publicMysteries.json";

export type PublicMystery = {
  slug: string;
  title: string;
  teaser: string;
  imageSrc?: string;
};

/**
 * Generated at build time from DM-approved, external teaser definitions.
 * Deliberately contains NO characterId, factionId, or reference to private data.
 */
export const publicMysteries: PublicMystery[] = rawMysteries as PublicMystery[];

export function getPublicMystery(slug: string): PublicMystery | undefined {
  return publicMysteries.find((mystery) => mystery.slug === slug);
}
