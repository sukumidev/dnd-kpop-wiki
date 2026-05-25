# Convención de tags

Versión: v0.1  
Sprint: 0

## Regla base

Los tags son auxiliares para búsqueda, filtrado y agrupación flexible. No reemplazan relaciones por ID.

Un tag debe escribirse en lowercase kebab-case.

## Formato válido

```txt
neo-academia
sol-ardiente
destiny-cards
dreamscape
tripuertos
clones
tieflings
sylmorien
hyberia
jeyperia
yggdrasil
```

## Formato inválido

```txt
Neo Academia
sol ardiente
DestinyCards
Dream_Scape
sylmorien!
```

## Cuándo usar tags

Usa tags para conceptos transversales que pueden aparecer en muchas entidades:

- temas de campaña
- arcos narrativos
- especies o linajes relevantes
- reinos/regiones como tema
- magia/sistemas
- amenazas
- eventos recurrentes
- contenido filtrable

## Cuándo NO usar tags

No uses tags para reemplazar relaciones estructurales.

Incorrecto:

```json
{
  "tags": ["nct-mark", "neo-culturales-tecnologicos"]
}
```

Correcto:

```json
{
  "characterIds": ["nct-mark"],
  "factionIds": ["neo-culturales-tecnologicos"],
  "tags": ["neo-academia", "tecnomagia"]
}
```

## Categorías iniciales

### Regiones

```txt
sylmorien
hyberia
jeyperia
yggdrasil
hotou
naxai
dreamscape
```

### Facciones

```txt
panes-del-destino
gremio-de-aventureros
neo-academia
sol-ardiente
hijos-de-la-noche
lobos-perdidos
marea-negra
guerreros-ascendidos
```

### Arcos principales

```txt
destiny-cards
portadores
cartas-robadas
tripuertos
sol-ardiente
arcos-personales
```

### Temas de personaje

```txt
identidad
familia
legado
memoria
venganza
pacto
reencarnacion
clones
```

### Especies / linajes

```txt
tieflings
vampiros
licantropos
superhumanos
changelings
genasi
elfos
semi-elfos
```

### Magia / sistemas

```txt
neovibra
dreamscape
tecnomagia
radiancia-disenada
baraja-del-destino
pactos
ritual
```

### Estado narrativo

```txt
rescate
proteccion
investigacion
guerra
infiltracion
recuperacion
```

## Reglas de creación de tags nuevos

Crear un tag nuevo solo si:

1. El concepto aparece o podría aparecer en más de una entidad.
2. No existe ya un tag equivalente.
3. El tag ayuda a buscar, filtrar o agrupar.
4. No es mejor representarlo como `characterId`, `factionId`, `regionId`, `locationId` o `questId`.

## Duplicados semánticos a evitar

No crear variantes como:

```txt
neo-academia
neo-culturales
neo-culturales-tecnologicos
```

Elegir uno como tag principal. Para campaña, se recomienda:

```txt
neo-academia
```

No crear:

```txt
sol-ardiente
clan-del-sol-ardiente
burning-sun
```

Elegir uno como tag principal. Para campaña, se recomienda:

```txt
sol-ardiente
```

## Checklist de validación

- [ ] El tag está en lowercase.
- [ ] El tag usa kebab-case.
- [ ] El tag no contiene espacios.
- [ ] El tag no contiene underscores.
- [ ] El tag no contiene acentos.
- [ ] El tag no duplica un concepto existente.
- [ ] El tag no reemplaza una relación por ID.
