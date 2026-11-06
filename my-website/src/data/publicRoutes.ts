// These factions appear in public data but do not have a published profile yet.
// Remove an ID when its profile is published; the strict build checks the route.
const factionsWithoutProfile = new Set([
  'os-guild',
  'ciudadanos-de-hyberia',
  'andteam',
  'ciudadanos-de-jeyperia',
  'lngshot',
  'ciudadanos-de-sylmorien',
  'ncit',
  'ciudadanos-de-hotou',
  'mascotas',
  'loossemble',
]);

export function getPublicFactionHref(factionId?: string | null): string | undefined {
  return factionId && !factionsWithoutProfile.has(factionId)
    ? `/factions/${factionId}`
    : undefined;
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
