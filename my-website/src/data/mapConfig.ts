import mapConfigJson from "./mapConfig.json";

export type MapDefinition = {
  id: string;
  title: string;
  imageSrc: string;
  width: number;
  height: number;
};

export type MapLayer = {
  id: string;
  label: string;
  visibleByDefault: boolean;
  sortOrder?: number;
};

export type MapIcon = {
  id: string;
  label: string;
  imageSrc?: string | null;
};

export type MapConfig = {
  defaultMap: MapDefinition;

  /** Optional future support for multiple maps. */
  maps?: MapDefinition[];

  layers: MapLayer[];
  icons: MapIcon[];
};

export const mapConfig = mapConfigJson as MapConfig;

export const mapLayers = [...mapConfig.layers].sort((a, b) => {
  const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.label.localeCompare(b.label);
});

export const mapIcons = mapConfig.icons;

export function getDefaultMap(): MapDefinition {
  return mapConfig.defaultMap;
}

export function getMapById(mapId: string): MapDefinition | undefined {
  if (mapConfig.defaultMap.id === mapId) return mapConfig.defaultMap;
  return mapConfig.maps?.find((map) => map.id === mapId);
}

export function getMapLayerById(layerId: string): MapLayer | undefined {
  return mapConfig.layers.find((layer) => layer.id === layerId);
}

export function getMapIconById(iconId: string): MapIcon | undefined {
  return mapConfig.icons.find((icon) => icon.id === iconId);
}

export function isLayerVisibleByDefault(layerId: string): boolean {
  return getMapLayerById(layerId)?.visibleByDefault ?? false;
}
