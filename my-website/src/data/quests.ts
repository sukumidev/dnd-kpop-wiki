export type QuestStatus = "locked" | "active" | "completed" | "failed" | "paused";
export type QuestType = "main" | "side" | "faction" | "personal" | "event";
export type QuestVisibility = "public" | "hidden" | "secret";

export type LinkRef = {
  label: string;
  doc?: string;
};

export type QuestObjective = {
  id: string;
  label: string;
  done: boolean;
  weight?: number;
  optional?: boolean;
  notes?: string;
};

export type Quest = {
  id: string;
  parentQuestId?: string;
  childQuestIds?: string[];

  title: string;
  subtitle?: string;
  type?: QuestType;
  types?: QuestType[];
  status: QuestStatus;
  visibility?: QuestVisibility;
  priority?: "low" | "medium" | "high" | "critical";

  summary: string;
  description?: string;

  progress?: {
  mode: "manual" | "objectives" | "children";
  current?: number;
  goal?: number;
  percent?: number;
};

  objectives?: QuestObjective[];

  questGiver?: LinkRef;
  factions?: LinkRef[];
  characters?: Array<{ id: string; label: string; doc?: string }>;
  locations?: LinkRef[];
  sessions?: LinkRef[];

  rewards?: string[];
  tags?: string[];

  imageSrc?: string;
  accent?: string;

  isRepeatable?: boolean;
  failedConditions?: string[];
  notes?: string;
  sortOrder?: number;
};

export type QuestMap = Record<string, Quest>;