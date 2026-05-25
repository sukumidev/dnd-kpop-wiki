# SD-001 — Schema de mapa

Versión: v0.1  
Sprint: 0  
Área: Shared Data / Map / CMS / Wiki

## Objetivo

Definir un schema compartido para que el CMS pueda registrar lugares, coordenadas y configuración global del mapa, mientras que la Wiki pueda renderizar pines, capas e íconos de forma consistente.

Este contrato cubre:

- `location.map`
- `mapConfig.defaultMap`
- `mapConfig.layers`
- `mapConfig.icons`

## Archivos relacionados

```txt
src/data/locations.json
src/data/locations.ts
src/data/mapConfig.json
src/data/mapConfig.ts
```

## Principios

1. No todos los lugares deben aparecer en el mapa.
2. Un lugar puede existir en `locations.json` sin coordenadas.
3. Las coordenadas se manejan como porcentaje, no como pixeles.
4. Las capas e íconos disponibles se definen globalmente en `mapConfig.json`.
5. Un pin visible debe tener coordenadas válidas.
6. La UI puede ocultar o mostrar capas sin modificar los datos base.

---

# `location.map`

## Descripción

El campo `map` define si un lugar aparece en el mapa interactivo y cómo debe renderizarse su pin.

## Tipo recomendado

```ts
type LocationMapPin = {
  visible: boolean;
  x?: number | null;
  y?: number | null;
  icon?: string | null;
  layer?: string | null;
  label?: string | null;
};
```

## Campos

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `visible` | `boolean` | Sí | Define si el lugar aparece como pin en el mapa |
| `x` | `number \| null` | Solo si `visible: true` | Posición horizontal en porcentaje |
| `y` | `number \| null` | Solo si `visible: true` | Posición vertical en porcentaje |
| `icon` | `string \| null` | No | ID de ícono definido en `mapConfig.icons` |
| `layer` | `string \| null` | No | ID de capa definida en `mapConfig.layers` |
| `label` | `string \| null` | No | Texto visible opcional para el pin |

## Coordenadas

Las coordenadas usan porcentaje de `0` a `100`.

```txt
x: 0   = borde izquierdo
x: 100 = borde derecho

y: 0   = borde superior
y: 100 = borde inferior
```

Ejemplo:

```json
{
  "map": {
    "visible": true,
    "x": 67.5,
    "y": 38.2,
    "icon": "port",
    "layer": "cities",
    "label": "Hotou"
  }
}
```

## Lugar oculto en mapa

Un lugar puede existir sin mostrarse en el mapa.

```json
{
  "id": "dreamscape",
  "title": "Dreamscape",
  "type": "plane",
  "status": "active",
  "map": {
    "visible": false,
    "x": null,
    "y": null,
    "icon": null,
    "layer": null,
    "label": null
  }
}
```

## Lugar sin coordenadas todavía

Durante migración o captura inicial de datos, un lugar puede no tener coordenadas.

```json
{
  "id": "guarida-de-los-lobos",
  "title": "Guarida de los Lobos",
  "type": "landmark",
  "status": "active",
  "map": {
    "visible": false,
    "x": null,
    "y": null,
    "icon": "landmark",
    "layer": "landmarks",
    "label": "Guarida de los Lobos"
  }
}
```

Este caso no debe bloquear generación mientras `visible` sea `false`.

---

# `mapConfig`

## Descripción

`mapConfig.json` define la configuración global del mapa interactivo: imagen base, capas disponibles e íconos disponibles.

## Tipo recomendado

```ts
type MapConfig = {
  defaultMap: MapDefinition;
  layers: MapLayer[];
  icons: MapIcon[];
};

type MapDefinition = {
  id: string;
  title: string;
  imageSrc: string;
  width: number;
  height: number;
};

type MapLayer = {
  id: string;
  label: string;
  visibleByDefault: boolean;
};

type MapIcon = {
  id: string;
  label: string;
  imageSrc?: string | null;
};
```

---

# `mapConfig.defaultMap`

## Descripción

Define el mapa base que la Wiki debe renderizar.

## Campos

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `id` | `string` | Sí | ID técnico del mapa |
| `title` | `string` | Sí | Nombre visible del mapa |
| `imageSrc` | `string` | Sí | Ruta de la imagen del mapa |
| `width` | `number` | Sí | Ancho original de la imagen |
| `height` | `number` | Sí | Alto original de la imagen |

## Ejemplo

```json
{
  "defaultMap": {
    "id": "hallyura-main",
    "title": "Mapa de Hallyura",
    "imageSrc": "/img/maps/hallyura-main.png",
    "width": 1920,
    "height": 1080
  }
}
```

---

# `mapConfig.layers`

## Descripción

Las capas permiten agrupar pines por tipo de contenido.

Ejemplos:

- ciudades
- puertos
- regiones
- facciones
- tripuertos
- landmarks
- zonas peligrosas

## Campos

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `id` | `string` | Sí | ID técnico de la capa |
| `label` | `string` | Sí | Nombre visible |
| `visibleByDefault` | `boolean` | Sí | Si la capa aparece encendida inicialmente |

## Ejemplo

```json
{
  "layers": [
    {
      "id": "cities",
      "label": "Ciudades",
      "visibleByDefault": true
    },
    {
      "id": "tripuertos",
      "label": "Tripuertos",
      "visibleByDefault": true
    },
    {
      "id": "landmarks",
      "label": "Puntos de interés",
      "visibleByDefault": true
    }
  ]
}
```

---

# `mapConfig.icons`

## Descripción

Los íconos definen las variantes visuales disponibles para pines.

## Campos

| Campo | Tipo | Requerido | Descripción |
|---|---|---:|---|
| `id` | `string` | Sí | ID técnico del ícono |
| `label` | `string` | Sí | Nombre visible |
| `imageSrc` | `string \| null` | No | Ruta opcional a imagen/SVG del ícono |

## Ejemplo

```json
{
  "icons": [
    {
      "id": "city",
      "label": "Ciudad"
    },
    {
      "id": "port",
      "label": "Puerto"
    },
    {
      "id": "landmark",
      "label": "Punto de interés"
    },
    {
      "id": "tripuerto",
      "label": "Tripuerto"
    }
  ]
}
```

---

# Ejemplo completo de `locations.json`

```json
{
  "hotou": {
    "id": "hotou",
    "title": "Hotou",
    "type": "region",
    "status": "active",
    "regionId": "jeyperia",
    "parentLocationId": "jeyperia",
    "factionIds": ["neo-culturales-tecnologicos"],
    "characterIds": ["pc-kiyori"],
    "questIds": ["mq-protect-wishies"],
    "map": {
      "visible": true,
      "x": 67.5,
      "y": 38.2,
      "icon": "port",
      "layer": "cities",
      "label": "Hotou"
    },
    "tags": ["hotou", "jeyperia", "puerto"]
  }
}
```

---

# Ejemplo completo de `mapConfig.json`

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
      "id": "cities",
      "label": "Ciudades",
      "visibleByDefault": true
    },
    {
      "id": "tripuertos",
      "label": "Tripuertos",
      "visibleByDefault": true
    },
    {
      "id": "landmarks",
      "label": "Puntos de interés",
      "visibleByDefault": true
    }
  ],
  "icons": [
    {
      "id": "city",
      "label": "Ciudad"
    },
    {
      "id": "port",
      "label": "Puerto"
    },
    {
      "id": "tripuerto",
      "label": "Tripuerto"
    },
    {
      "id": "landmark",
      "label": "Punto de interés"
    }
  ]
}
```

---

# Validaciones

## Errores críticos

Estos errores deben bloquear generación/render avanzado:

| Error | Motivo |
|---|---|
| `mapConfig.defaultMap` faltante | La UI no sabe qué mapa renderizar |
| `defaultMap.id` inválido | Rompe identificación del mapa |
| `defaultMap.imageSrc` faltante | No hay imagen base |
| `defaultMap.width` o `height` inválidos | No se puede calcular proporción |
| `layers[].id` duplicado | Capa ambigua |
| `icons[].id` duplicado | Ícono ambiguo |
| `location.map.visible: true` sin `x` o `y` | Pin imposible de renderizar |
| `x` o `y` fuera del rango `0-100` | Coordenada inválida |
| `map.layer` inexistente y `visible: true` | Capa no renderizable |

## Warnings

Estos no bloquean generación:

| Warning | Motivo |
|---|---|
| `location.map.visible: false` con coordenadas | Puede ser intencional o dato pendiente |
| `location.map.icon` inexistente | La UI puede usar ícono default |
| `location.map.layer` inexistente con `visible: false` | Puede estar preparado para futura capa |
| Location sin `map` | Puede existir sin pin |
| Location sin `summary` | Menos útil para cards |

---

# Reglas de UI

La UI del mapa debe:

1. Renderizar solo lugares con `map.visible === true`.
2. Ignorar pines sin coordenadas válidas.
3. Resolver `map.layer` contra `mapConfig.layers`.
4. Resolver `map.icon` contra `mapConfig.icons`.
5. Usar fallback visual si `icon` no existe.
6. Permitir activar/desactivar capas.
7. No modificar `locations.json` desde el componente.
8. No usar pixeles guardados en data; convertir porcentaje a posición visual.

---

# Reglas para CMS

El CMS debe:

1. Permitir crear lugares sin coordenadas.
2. Permitir marcar un lugar como oculto en mapa.
3. Validar que `x` y `y` estén entre `0` y `100`.
4. Sugerir íconos desde `mapConfig.icons`.
5. Sugerir capas desde `mapConfig.layers`.
6. No exigir coordenadas si `visible` es `false`.
7. Exigir coordenadas si `visible` es `true`.
8. Exportar `null` en vez de `—` o `-`.

---

# Definition of Done

SD-001 queda Done cuando:

- Existe definición para `location.map`.
- Existe definición para `mapConfig`.
- Las coordenadas se manejan como porcentaje.
- Cada lugar puede indicar si es visible en mapa.
- Cada pin puede tener ícono.
- Cada pin puede pertenecer a una capa.
- El schema contempla lugares sin coordenadas.
- El schema contempla lugares ocultos.
- Existen ejemplos de lugar con pin.
- Existe ejemplo de configuración global de mapa.
- Las reglas de validación están documentadas.
