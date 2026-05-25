import tagsJson from "./tags.json";

export type TagCategory =
  | "region"
  | "faction"
  | "arc"
  | "theme"
  | "species"
  | "magic"
  | "narrative"
  | "character"
  | "lore"
  | "other";

export type TagStatus = "active" | "inactive" | "deprecated";

export type Tag = {
  id: string;
  title: string;
  category: TagCategory;
  status: TagStatus;
  description?: string | null;
  color?: string | null;
  aliases?: string[];
};

export type TagsById = Record<string, Tag>;

export const tags = tagsJson as TagsById;
export const tagList = Object.values(tags);

export function getTagById(id: string | null | undefined): Tag | undefined {
  if (!id) return undefined;
  return tags[id];
}

export function getTagsByIds(tagIds: string[] = []): Tag[] {
  return tagIds
    .map((tagId) => getTagById(tagId))
    .filter(Boolean) as Tag[];
}

export function getTagsByCategory(category: TagCategory): Tag[] {
  return tagList.filter((tag) => tag.category === category);
}

export function getTagLabel(id: string): string {
  return getTagById(id)?.title ?? id;
}

export function isValidTagId(id: string): boolean {
  return Boolean(tags[id]);
}
