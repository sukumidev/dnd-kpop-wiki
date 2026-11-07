import publishedFactionRoutes from "./publicFactionRoutes.json";

// Only actual MDX profiles may be linked. Build regenerates the manifest
// using each faction's frontmatter factionId and slug.
const factionRoutes = publishedFactionRoutes as Record<string, string>;

export function getPublicFactionHref(factionId?: string | null): string | undefined {
  if (!factionId) return undefined;
  return factionRoutes[factionId];
}

const realmRoutes: Record<string, string> = {
  hyberia: '/world/realms/hyberia',
  jeyperia: '/world/realms/jeyperia',
  sylmorien: '/world/realms/sylmorien',
  yggdrasil: '/world/realms/ygdrassil',
  hotou: '/world/realms/hotou',
  guozhong: '/world/realms/guozhong',
};

export function getPublicRealmHref(realmId: string): string | undefined {
  return realmRoutes[realmId];
}

export function getPublicLocationHref(locationId: string): string {
  return getPublicRealmHref(locationId) ?? `/world/locations/${locationId}`;
}
