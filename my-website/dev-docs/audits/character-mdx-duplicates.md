# Auditoría de MDX duplicados de personajes

## Hallazgo principal

La Wiki utiliza actualmente `docs/characters/npc/<characterId>.mdx` para los NPC. El directorio heredado `docs/characters/misc/` contiene copias generadas con el mismo `characterId`, a menudo sin lore. La configuración de Docusaurus ya incluye `exclude: ['characters/misc/**']`, de modo que esas copias **no se publican como páginas de documentación activas**.

Esto no convierte automáticamente todos los archivos de `misc/` en basura: algunos podrían incluir contenido propio o tener referencias explícitas. No se propone borrarlos en bloque sin auditoría.

## Ejemplos revisados

| Personaje | Canon vigente | Copia heredada | Decisión |
| --- | --- | --- | --- |
| Park Seonghwa (`ateez-seonghwa`) | `docs/characters/npc/ateez-seonghwa.mdx` tiene contenido narrativo | `docs/characters/misc/ateez-seonghwa.mdx` es una plantilla vacía y no aparecieron referencias directas a su ruta | Se eliminó la plantilla `misc/` en esta rama |
| Hong Jisoo (`svt-joshua`) | `docs/characters/npc/svt-joshua.mdx` contiene biografía extensa | `docs/characters/misc/svt-joshua.mdx` contiene plantilla vacía | Se conserva para revisión: se detectaron referencias de la ruta heredada en archivos de respaldo |
| Hyungwon (`mx-hyungwon`) | `docs/characters/npc/mx-hyungwon.mdx` es la ruta canónica | También existe una plantilla `misc/` | Se deja pendiente hasta que se integren los cambios de contenido del Lote 4 |
| Shownu (`mx-shownu`) | `docs/characters/npc/mx-shownu.mdx` es la ruta canónica | También existe una plantilla `misc/` | Se deja pendiente hasta que se integren los cambios de contenido del Lote 4 |

## Herramienta añadida

Desde `my-website/`:

```bash
npm run audit:character-docs
```

La auditoría solo lee archivos. Agrupa páginas por `characterId`, detecta copias `misc/`, obtiene su ruta canónica desde `characters.json`, clasifica plantillas vacías y revisa referencias explícitas a las rutas heredadas. Muestra un informe JSON y **no modifica el repositorio**.

Para eliminar solo las copias que superan todas las comprobaciones:

```bash
npm run cleanup:character-docs:safe
```

El modo de limpieza requiere dos flags explícitos: `--write --confirm-safe-only`. Solo elimina un archivo heredado si:

1. Está bajo `misc/` y comparte `characterId` con otra página.
2. Su cuerpo coincide exactamente con la lista blanca de elementos de la plantilla sin contenido.
3. Existe una página canónica determinada por `characters.json` con una introducción sustancial.
4. No hay referencias textuales exactas a `characters/misc/<id>` en `docs/`, `src/` o los archivos de configuración examinados.

**Nunca modifica ni borra una página canónica `npc/`, `party/` o `pet/`.** La herramienta no borra los casos ambiguos, y requiere revisión manual cuando encuentra contenido real o referencias. Por seguridad, no realiza migraciones de enlaces, ni intenta deducir si los archivos de respaldo están activos.

## Próximos pasos

- Ejecutar `npm run audit:character-docs` localmente y revisar todo el reporte antes de ejecutar la limpieza.
- Verificar el build y enlaces después de cualquier eliminación.
- Si la auditoría detecta referencias heredadas necesarias, migrarlas con cambios explícitos y comprobar que el nuevo destino existe.
- Mantener `misc/` excluido en Docusaurus mientras se completa la migración.

## Validación actual

Se verificó manualmente la plantilla vacía de Seonghwa, su ficha canónica con biografía y la ausencia de referencias directas en la búsqueda del repositorio. Se añadieron pruebas unitarias para los criterios de seguridad. **No se ejecutaron las pruebas ni el barrido completo local desde este cambio realizado mediante GitHub.**
