import questsJson from "./quests.json";

export type QuestStatus = "locked" | "active" | "completed" | "failed" | "paused";
export type QuestType = "main" | "side" | "faction" | "personal" | "event";
export type QuestVisibility = "public" | "hidden" | "secret" | "dm-only";
export type QuestPriority = "P0" | "P1" | "P2" | "P3" | "low" | "medium" | "high" | "critical";
export type QuestProgressMode = "manual" | "objectives" | "children";

export type QuestProgress = {
  mode: QuestProgressMode;
  current?: number;
  goal?: number;
  percent?: number;
};

export type QuestObjective = {
  id: string;
  label: string;
  done: boolean;
  failed?: boolean;
  weight?: number;
  optional?: boolean;
  notes?: string | null;
};

export type QuestLink = {
  label: string | null;
  docPath: string | null;
};

export type Quest = {
  id: string;
  parentQuestId?: string | null;

  title: string;
  subtitle?: string | null;
  types: QuestType[];
  status: QuestStatus;
  visibility: QuestVisibility;
  priority?: QuestPriority | null;

  summary: string;
  description?: string | null;

  progress?: QuestProgress;
  objectives?: QuestObjective[];

  /** Session IDs match sessions.json/doc slugs, e.g. "01", "11", "11-5". */
  sessionStartedId?: string | null;
  lastUpdatedSessionId?: string | null;
  sessionIds?: string[];

  /** Loose document link, useful for lore pages that are not entities in JSON yet. */
  questGiver?: QuestLink | null;

  /** Entity relationships. These are the source of truth for cross-data linking. */
  characterIds?: string[];
  factionIds?: string[];
  regionIds?: string[];
  locationIds?: string[];

  /** Non-entity supporting links. Do not use this for characters/factions/regions/locations. */
  relatedLinks?: QuestLink[];

  rewards?: string[];
  tags?: string[];

  imageSrc?: string | null;
  accent?: string | null;

  isRepeatable?: boolean;
  failedConditions?: string[];
  notes?: string | null;
  sortOrder?: number;
};

export type QuestsById = Record<string, Quest>;
export type QuestMap = QuestsById;

export const quests = questsJson as QuestsById;

export const questList = Object.values(quests).sort((a, b) => {
  const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.title.localeCompare(b.title);
});

export function getQuestById(id: string): Quest | undefined {
  return quests[id];
}

export function getRootQuests(list: Quest[] = questList): Quest[] {
  return list.filter((quest) => !quest.parentQuestId);
}

export function getQuestChildren(parentQuestId: string, list: Quest[] = questList): Quest[] {
  return list.filter((quest) => quest.parentQuestId === parentQuestId);
}

export function getQuestDescendants(parentQuestId: string, list: Quest[] = questList): Quest[] {
  const directChildren = getQuestChildren(parentQuestId, list);

  return directChildren.flatMap((child) => [
    child,
    ...getQuestDescendants(child.id, list),
  ]);
}

export function getQuestsByType(type: QuestType, list: Quest[] = questList): Quest[] {
  return list.filter((quest) => quest.types.includes(type));
}

export function getQuestsByStatus(status: QuestStatus, list: Quest[] = questList): Quest[] {
  return list.filter((quest) => quest.status === status);
}

export function getQuestsByCharacterId(characterId: string, list: Quest[] = questList): Quest[] {
  return list.filter((quest) => quest.characterIds?.includes(characterId));
}

export function getQuestsByFactionId(factionId: string, list: Quest[] = questList): Quest[] {
  return list.filter((quest) => quest.factionIds?.includes(factionId));
}

export function getQuestsByRegionId(regionId: string, list: Quest[] = questList): Quest[] {
  return list.filter((quest) => quest.regionIds?.includes(regionId));
}

export function getQuestsByLocationId(locationId: string, list: Quest[] = questList): Quest[] {
  return list.filter((quest) => quest.locationIds?.includes(locationId));
}

export function calculateQuestProgress(quest: Quest, list: Quest[] = questList): number | null {
  const progress = quest.progress;

  if (!progress) return null;

  if (typeof progress.percent === "number") {
    return clampPercent(progress.percent);
  }

  if (
    progress.mode === "manual" &&
    typeof progress.current === "number" &&
    typeof progress.goal === "number" &&
    progress.goal > 0
  ) {
    return clampPercent((progress.current / progress.goal) * 100);
  }

  if (progress.mode === "objectives") {
    return calculateObjectivesProgress(quest.objectives);
  }

  if (progress.mode === "children") {
    const children = getQuestChildren(quest.id, list);
    if (children.length === 0) return null;

    const completedWeight = children.filter((child) => child.status === "completed").length;
    return clampPercent((completedWeight / children.length) * 100);
  }

  return null;
}

export function calculateObjectivesProgress(objectives: QuestObjective[] | undefined): number | null {
  if (!objectives || objectives.length === 0) return null;

  const totalWeight = objectives.reduce((total, objective) => total + (objective.weight ?? 1), 0);
  if (totalWeight <= 0) return null;

  const completedWeight = objectives.reduce((total, objective) => {
    if (!objective.done) return total;
    return total + (objective.weight ?? 1);
  }, 0);

  return clampPercent((completedWeight / totalWeight) * 100);
}

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
