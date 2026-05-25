# Reglas y convenciones del proyecto

Versión: v0.1  
Sprint: 0  
Scope: Wiki / Shared Data / CMS / Scripts

Esta carpeta documenta las reglas base para mantener consistentes los datos compartidos de la Wiki de Hallyura.

Estas convenciones aplican a:

- `characters.json`
- `quests.json`
- `factions.json`
- `locations.json`
- `mapConfig.json`
- futuros JSON exportados por Hallyura Studio
- scripts generadores de documentos
- validadores de datos

## Archivos

| Archivo | Propósito |
|---|---|
| `ids.md` | Reglas para crear y validar IDs |
| `relationships.md` | Reglas para relacionar entidades por ID |
| `tags.md` | Reglas y taxonomía inicial de tags |
| `statuses.md` | Estados permitidos por entidad |
| `validation.md` | Errores críticos, warnings y comportamiento esperado de scripts |

## Principios generales

1. Los JSON de `src/data` son la fuente de verdad.
2. Las relaciones entre entidades se hacen por ID, no por nombre visible.
3. Los nombres visibles pueden cambiar; los IDs deben mantenerse estables.
4. Los valores técnicos usan inglés.
5. La UI puede traducir labels técnicos a español.
6. Los placeholders visuales como `—` o `-` no deben usarse en datos. Se usa `null`.
7. Los campos de combate viven en `statblocks.json`, no en `characters.json`.
8. El CMS debe poder importar/exportar estos JSON sin transformaciones manuales.
