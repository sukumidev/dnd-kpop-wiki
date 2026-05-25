# MapConfig Data Contract v0.1

## Propósito

El contrato `MapConfig` define la configuración global del mapa interactivo de Hallyura: imagen base, tamaño de referencia, capas disponibles e íconos permitidos para pines.

Los lugares concretos viven en `locations.json`; `mapConfig.json` solo define cómo se renderiza el mapa.

## Fuente de verdad

Archivo oficial:

```txt
src/data/mapConfig.json
```

Contrato TypeScript:

```txt
src/data/mapConfig.ts
```

## Decisiones del Sprint 0

- `defaultMap` define la imagen base del mapa.
- `width` y `height` son dimensiones de referencia de la imagen, no coordenadas de pines.
- Los pines usan coordenadas porcentuales en `locations.json`.
- `layers` define capas disponibles.
- `icons` define íconos permitidos.
- Un lugar puede existir aunque no sea visible en el mapa.

## Campos requeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `defaultMap` | `MapDefinition` | Mapa base principal. |
| `layers` | `MapLayer[]` | Capas disponibles. |
| `icons` | `MapIcon[]` | Íconos disponibles. |

## Tipos

```ts
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
  layers: MapLayer[];
  icons: MapIcon[];
};
```

## Relaciones

| Campo | Usado por | Regla |
|---|---|---|
| `layers[].id` | `locations[].map.layer` | Debe existir para que el pin use esa capa. |
| `icons[].id` | `locations[].map.icon` | Debe existir para que el pin use ese ícono. |
| `defaultMap.id` | UI del mapa | ID estable del mapa principal. |
| `defaultMap.imageSrc` | UI del mapa | Ruta a imagen base. |

## Ejemplo mínimo válido

```json
{
  "defaultMap": {
    "id": "hallyura-main",
    "title": "Mapa de Hallyura",
    "imageSrc": "/img/maps/hallyura-main.png",
    "width": 1920,
    "height": 1080
  },
  "layers": [
    {
      "id": "regions",
      "label": "Regiones",
      "visibleByDefault": true,
      "sortOrder": 1
    },
    {
      "id": "cities",
      "label": "Ciudades",
      "visibleByDefault": true,
      "sortOrder": 2
    },
    {
      "id": "tripuertos",
      "label": "Tripuertos",
      "visibleByDefault": true,
      "sortOrder": 4
    }
  ],
  "icons": [
    {
      "id": "region",
      "label": "Región",
      "imageSrc": null
    },
    {
      "id": "city",
      "label": "Ciudad",
      "imageSrc": null
    },
    {
      "id": "tripuerto",
      "label": "Tripuerto",
      "imageSrc": null
    }
  ]
}
```

## Validaciones recomendadas

- `defaultMap.id`, `defaultMap.title`, `defaultMap.imageSrc`, `width` y `height` son obligatorios.
- `layers[].id` debe ser único.
- `icons[].id` debe ser único.
- Si una location usa `map.layer`, ese layer debe existir.
- Si una location usa `map.icon`, ese icon debe existir.
