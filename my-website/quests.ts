import questsJson from "./quests.json";

export type QuestStatus =
  | "active"
  | "completed"
  | "failed"
  | "paused"
  | "hidden"
  | "unknown";

export type QuestType =
  | "main"
  | "side"
  | "faction"
  | "personal"
  | "event"
  | "exploration"
  | "investigation";

export type QuestVisibility =
  | "public"
  | "hidden"
  | "dm-only";

export type QuestProgressMode =
  | "manual"
  | "objectives"
  | "children";

export type QuestPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type QuestObjective = {
  id: string;
  label: string;
  done: boolean;
  failed?: boolean;
  weight?: number;
  optional?: boolean;
  notes?: string;
};

export type QuestProgress = {
  mode: QuestProgressMode;
  current?: number;
  goal?: number;
  percent?: number;
};

export type QuestLink = {
  label: string;
  docPath?: string | null;
};

export type Quest = {
  id: string;
  title: string;

  subtitle?: string;
  types: QuestType[];
  status: QuestStatus;
  visibility: QuestVisibility;
  priority?: QuestPriority;

  summary?: string;
  description?: string;

  progress?: QuestProgress;
  objectives?: QuestObjective[];

  parentQuestId?: string | null;

  characterIds?: string[];
  factionIds?: string[];
  regionIds?: string[];
  locationIds?: string[];
  sessionIds?: string[];

  sessionStartedId?: string | null;
  lastUpdatedSessionId?: string | null;

  questGiver?: QuestLink | null;

  rewards?: string[];
  tagIds?: string[];

  imageSrc?: string;
  accent?: string;

  isRepeatable?: boolean;
  failedConditions?: string[];
  notes?: string;
  sortOrder?: number;
};

export type QuestsById = Record<string, Quest>;

export const quests = questsJson as QuestsById;
export const questList = Object.values(quests);

export function getQuestById(id: string | null | undefined): Quest | undefined {
  if (!id) return undefined;
  return quests[id];
}

export function getQuestChildren(parentQuestId: string): Quest[] {
  return questList
    .filter((quest) => quest.parentQuestId === parentQuestId)
    .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
}

export function getRootQuests(): Quest[] {
  return questList
    .filter((quest) => !quest.parentQuestId)
    .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
}

export function getQuestsByCharacterId(characterId: string): Quest[] {
  return questList.filter((quest) => quest.characterIds?.includes(characterId));
}

export function getQuestsByFactionId(factionId: string): Quest[] {
  return questList.filter((quest) => quest.factionIds?.includes(factionId));
}

export function getQuestsByRegionId(regionId: string): Quest[] {
  return questList.filter((quest) => quest.regionIds?.includes(regionId));
}

export function getQuestsByLocationId(locationId: string): Quest[] {
  return questList.filter((quest) => quest.locationIds?.includes(locationId));
}

export function getQuestsByTagId(tagId: string): Quest[] {
  return questList.filter((quest) => quest.tagIds?.includes(tagId));
}

export function calculateQuestProgress(quest: Quest): number | null {
  if (quest.progress?.mode === "manual") {
    const current = quest.progress.current ?? 0;
    const goal = quest.progress.goal ?? 0;

    if (goal <= 0) return null;
    return Math.round((current / goal) * 100);
  }

  if (quest.progress?.mode === "objectives") {
    const objectives = quest.objectives ?? [];
    if (objectives.length === 0) return null;

    const totalWeight = objectives.reduce((sum, objective) => sum + (objective.weight ?? 1), 0);
    const completedWeight = objectives
      .filter((objective) => objective.done)
      .reduce((sum, objective) => sum + (objective.weight ?? 1), 0);

    if (totalWeight <= 0) return null;
    return Math.round((completedWeight / totalWeight) * 100);
  }

  return quest.progress?.percent ?? null;
}
