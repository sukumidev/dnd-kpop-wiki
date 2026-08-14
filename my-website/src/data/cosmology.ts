import cosmologyJson from "./cosmology.json";
import {characters, getCharacterDocPath} from "./characters";

export type MythicEntity = {
  id: string;
  title: string;
  characterId?: string | null;
  subtitle?: string | null;
  imageSrc?: string | null;
  pantheon?: string | null;
  summary?: string | null;
  /** Optional route to an existing page, without the leading slash. */
  docPath?: string | null;
  sortOrder?: number;
};

export type MythicEntitySource = Omit<
  MythicEntity,
  "title" | "subtitle" | "imageSrc" | "summary" | "docPath"
> & {
  title?: string;
  subtitle?: string | null;
  imageSrc?: string | null;
  summary?: string | null;
  docPath?: string | null;
};

export type CosmologySourceById = Record<string, MythicEntitySource>;
export type CosmologyById = Record<string, MythicEntity>;

const cosmologySources = cosmologyJson as CosmologySourceById;

export const cosmology = Object.fromEntries(
  Object.entries(cosmologySources).map(([id, source]) => {
    const character = source.characterId
      ? characters[source.characterId]
      : undefined;

    return [
      id,
      {
        ...source,
        id: source.id ?? id,
        title: source.title ?? character?.title ?? id,
        subtitle: source.subtitle ?? character?.subtitle,
        imageSrc: source.imageSrc ?? character?.imageSrc,
        summary: source.summary ?? character?.summary,
        docPath:
          source.docPath ??
          (character ? getCharacterDocPath(character) : undefined),
      },
    ];
  }),
) as CosmologyById;

export const mythicEntityList = Object.values(cosmology).sort((a, b) => {
  const orderDifference =
    (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
    (b.sortOrder ?? Number.MAX_SAFE_INTEGER);

  return orderDifference || a.title.localeCompare(b.title, "es");
});

export const mythicCharacterIds = new Set(
  mythicEntityList
    .map((entity) => entity.characterId)
    .filter((id): id is string => Boolean(id)),
);

export function getMythicEntityById(id: string): MythicEntity | undefined {
  return cosmology[id];
}
