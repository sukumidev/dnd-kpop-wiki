# Sincronización del directorio de facciones

Fuente consultada: [[Factions] - Master Registry](https://docs.google.com/spreadsheets/d/1N5fAH1S1MBp3wxZ5LmkwHvnP6Yauq1Kd58xf10sKYE4/edit), pestañas `Música`, `Facciones originales`, `Reinos` y `Subunidades`, el 4 de noviembre de 2026.

- 60 facciones en `factions.json`; 59 visibles en el directorio. `heraldos-del-crepusculo` ya estaba oculta y conserva ese estado.
- 48 facciones visibles tienen asociación explícita por ID de la Wiki en `factionRegistryMetadata.json`: 45 en `Música` y 3 en `Facciones originales`.
- 45 tienen primera aparición registrada. Tres asociaciones no tienen sesión: `bigbang`, `dragonborns-del-clan-del-caos` y `dragonborns-del-clan-del-orden`. Se mantienen al final de sus respectivos reinos.
- `tvxq` y `bigbang` figuran en `Música` sin ID numérico del Registry. La asociación local se conserva por ID de la Wiki y se documenta con la fila consultada. `Facciones originales` no dispone de columna de ID.
- Las cuatro casas NCT existentes se asocian a sus propias filas en `Música`. Las unidades marcadas «Pendiente de adaptar» en `Subunidades` no se añadieron.

## Sin correspondencia en las pestañas de facciones

Estas 11 facciones visibles permanecen en el directorio con su reino local y sin sesión inventada:

`panes-del-destino`, `ciudadanos-de-hyberia`, `ciudadanos-de-jeyperia`, `ciudadanos-de-sylmorien`, `ncit`, `andteam`, `lngshot`, `os-guild`, `ciudadanos-de-hotou`, `loossemble`, `t1`.

## Discrepancias destacadas entre nombres

- `njz`: la Wiki muestra «Las Guardianas del Bosque Muerto»; `Música`, ID 5, «Guardianas del Bosque Perdido». La asociación está respaldada también por el grupo real NewJeans.
- `ateez`: la Wiki muestra «Los Piratas de la Marea Negra»; `Música`, ID 15, «Marea Negra». Coinciden el grupo real ATEEZ y el origen Isla Halazia.
- `clan-del-sol-ardiente`: la Wiki añade el artículo «El» al nombre de `Facciones originales`, fila 2.
- `dragonborns-del-clan-del-caos` y `dragonborns-del-clan-del-orden`: la Wiki añade «Dragonborns del» a los nombres «Clan del Caos» y «Clan del Orden». La descripción del Registry confirma la relación dragonborn.

No se renombraron ni fusionaron registros. La instantánea se indexa por ID de la Wiki, así que una facción presente en más de una pestaña solo puede generar una entrada del directorio.
