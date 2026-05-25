import React, { useMemo, useState } from "react";
import Link from "@docusaurus/Link";

import questsJson from "@site/src/data/quests.json";
import type { Quest, QuestMap } from "@site/src/data/quests";

type QuestDashboardProps = {
  showHidden?: boolean;
};

const quests = questsJson as QuestMap;

function getQuestProgress(
  quest: Quest,
  questMap: QuestMap
): { current: number; goal: number; percent: number } {
  if (quest.progress?.mode === "children") {
    const children = Object.values(questMap).filter(
      (candidate) => candidate.parentQuestId === quest.id
    );

    const goal = children.length;
    const current = children.filter(
      (child) => child.status === "completed"
    ).length;

    const percent = goal > 0 ? Math.round((current / goal) * 100) : 0;

    return { current, goal, percent };
  }

  if (quest.progress?.mode === "manual") {
    const current = quest.progress.current ?? 0;
    const goal = quest.progress.goal ?? 0;
    const percent =
      typeof quest.progress.percent === "number"
        ? quest.progress.percent
        : goal > 0
        ? Math.round((current / goal) * 100)
        : 0;

    return { current, goal, percent };
  }

  if (quest.progress?.mode === "objectives" && quest.objectives?.length) {
    const normalizedObjectives = quest.objectives.filter(
      (obj): obj is Exclude<typeof obj, string> => typeof obj !== "string"
    );

    const goal = normalizedObjectives.reduce(
      (sum, obj) => sum + (obj.weight ?? 1),
      0
    );

    const current = normalizedObjectives.reduce(
      (sum, obj) => sum + (obj.done ? obj.weight ?? 1 : 0),
      0
    );

    const percent = goal > 0 ? Math.round((current / goal) * 100) : 0;

    return { current, goal, percent };
  }

  const current = quest.progress?.current ?? 0;
  const goal = quest.progress?.goal ?? 0;
  const percent = goal > 0 ? Math.round((current / goal) * 100) : 0;

  return { current, goal, percent };
}

function getAccentColor(accent?: string): string {
  if (!accent) return "#7c8aa5";

  if (accent.startsWith("#")) {
    return accent;
  }

  switch (accent) {
    case "gold":
      return "#d4a017";
    case "red":
      return "#d9534f";
    case "pink":
      return "#d96bb3";
    case "purple":
      return "#8b6be8";
    case "blue":
      return "#4a90e2";
    case "green":
      return "#4caf50";
    default:
      return "#7c8aa5";
  }
}

function getStatusLabel(status: Quest["status"]): string {
  switch (status) {
    case "active":
      return "Activa";
    case "completed":
      return "Completada";
    case "failed":
      return "Fallida";
    case "paused":
      return "Pausada";
    case "locked":
      return "Bloqueada";
    default:
      return status;
  }
}

function buildQuestList(questMap: QuestMap, showHidden = false): Quest[] {
  return Object.values(questMap)
    .filter((quest) => showHidden || quest.visibility !== "hidden")
    .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
}

function getDepth(quest: Quest, questMap: QuestMap): number {
  let depth = 0;
  let current = quest;

  while (current.parentQuestId && questMap[current.parentQuestId]) {
    depth += 1;
    current = questMap[current.parentQuestId];
  }

  return depth;
}

function getTypeLabels(quest: Quest): string[] {
  if ("types" in quest && Array.isArray((quest as any).types)) {
    return (quest as any).types;
  }

  if ("type" in quest && (quest as any).type) {
    return [(quest as any).type];
  }

  return [];
}

function formatTypeLabel(type: string): string {
  switch (type) {
    case "main":
      return "Main Quest";
    case "side":
      return "Side Quest";
    case "faction":
      return "Faction Quest";
    case "personal":
      return "Personal Quest";
    case "event":
      return "Event Quest";
    default:
      return type;
  }
}

function isQuestVisible(
  quest: Quest,
  questMap: QuestMap,
  openQuestIds: Record<string, boolean>
): boolean {
  let current = quest;

  while (current.parentQuestId) {
    const parent = questMap[current.parentQuestId];
    if (!parent) return true;

    if (!openQuestIds[parent.id]) {
      return false;
    }

    current = parent;
  }

  return true;
}

function hasChildren(quest: Quest, questMap: QuestMap): boolean {
  return Object.values(questMap).some(
    (candidate) => candidate.parentQuestId === quest.id
  );
}

function SectionToggle({
  title,
  count,
  isOpen,
  onToggle,
}: {
  title: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      style={{
        width: "100%",
        border: "1px solid var(--ifm-color-emphasis-300)",
        background: "var(--ifm-background-surface-color)",
        borderRadius: "14px",
        padding: "0.9rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{title}</h2>
        <span
          style={{
            padding: "0.2rem 0.55rem",
            borderRadius: "999px",
            background: "var(--ifm-color-emphasis-200)",
            fontSize: "0.8rem",
            opacity: 0.85,
          }}
        >
          {count}
        </span>
      </div>

      <div
        aria-hidden="true"
        style={{
          fontSize: "1.2rem",
          lineHeight: 1,
          transition: "transform 0.2s ease",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          opacity: 0.8,
        }}
      >
        ˅
      </div>
    </button>
  );
}

function renderQuestCard(
  quest: Quest,
  questMap: QuestMap,
  openQuestIds: Record<string, boolean>,
  toggleQuest: (questId: string) => void
): React.ReactElement {
  const { current: progressCurrent, goal: progressGoal, percent } =
    getQuestProgress(quest, questMap);

  const depth = getDepth(quest, questMap);
  const isOpen = !!openQuestIds[quest.id];
  const typeLabels = getTypeLabels(quest);
  const childrenExist = hasChildren(quest, questMap);
  const isCompleted = quest.status === "completed";

  return (
    <article
      key={quest.id}
      style={{
        border: "1px solid var(--ifm-color-emphasis-300)",
        borderRadius: "18px",
        background: "var(--ifm-background-surface-color)",
        marginLeft: `${depth * 28}px`,
        overflow: "hidden",
        boxShadow: isOpen ? "0 0 0 1px rgba(255,255,255,0.03)" : "none",
        borderLeft: `4px solid ${getAccentColor(quest.accent)}`,
        opacity: isCompleted ? 0.88 : 1,
      }}
    >
      <button
        type="button"
        onClick={() => (childrenExist ? toggleQuest(quest.id) : undefined)}
        aria-expanded={childrenExist ? isOpen : undefined}
        aria-controls={childrenExist ? `quest-panel-${quest.id}` : undefined}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          cursor: childrenExist ? "pointer" : "default",
          textAlign: "left",
          padding: "1rem 1.1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
              marginBottom: "0.35rem",
            }}
          >
            <h3 style={{ margin: 0 }}>{quest.title}</h3>

            {typeLabels.map((type) => (
              <span
                key={`${quest.id}-${type}`}
                style={{
                  padding: "0.25rem 0.6rem",
                  borderRadius: "999px",
                  background: "var(--ifm-color-emphasis-200)",
                  fontSize: "0.8rem",
                }}
              >
                {formatTypeLabel(type)}
              </span>
            ))}

            <span
              style={{
                padding: "0.25rem 0.6rem",
                borderRadius: "999px",
                background: "var(--ifm-color-emphasis-200)",
                fontSize: "0.8rem",
              }}
            >
              {getStatusLabel(quest.status)}
            </span>
          </div>

          {quest.subtitle ? (
            <p style={{ margin: 0, opacity: 0.72 }}>{quest.subtitle}</p>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              minWidth: "64px",
              textAlign: "right",
              fontSize: "0.9rem",
              opacity: 0.85,
            }}
          >
            {percent}%
          </div>

          {childrenExist ? (
            <div
              aria-hidden="true"
              style={{
                fontSize: "1.2rem",
                lineHeight: 1,
                transition: "transform 0.2s ease",
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                opacity: 0.8,
              }}
            >
              ˅
            </div>
          ) : (
            <div
              aria-hidden="true"
              style={{
                width: "1rem",
                opacity: 0.25,
                textAlign: "center",
              }}
            >
              •
            </div>
          )}
        </div>
      </button>

      <div
        id={`quest-panel-${quest.id}`}
        style={{
          display: isOpen || !childrenExist ? "block" : "none",
          padding: "0 1.1rem 1rem",
          borderTop: "1px solid var(--ifm-color-emphasis-200)",
        }}
      >
        <p style={{ marginTop: "1rem", marginBottom: "0.85rem" }}>{quest.summary}</p>

        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.35rem",
              fontSize: "0.9rem",
            }}
          >
            <span>Progreso</span>
            <span>
              {percent}% {progressGoal > 0 ? `(${progressCurrent}/${progressGoal})` : ""}
            </span>
          </div>

          <div
            style={{
              width: "100%",
              height: "12px",
              borderRadius: "999px",
              background: "var(--ifm-color-emphasis-200)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: "100%",
                background: getAccentColor(quest.accent),
                borderRadius: "999px",
                transition: "width 0.25s ease",
              }}
            />
          </div>
        </div>

        {quest.objectives?.length ? (
          <div style={{ marginBottom: "1rem" }}>
            <strong>Objetivos</strong>
            <ul style={{ marginTop: "0.5rem", marginBottom: 0 }}>
              {quest.objectives.map((objective, index) => {
                if (typeof objective === "string") {
                  return (
                    <li key={`${quest.id}-objective-${index}`}>
                      ⬜ {objective}
                    </li>
                  );
                }

                return (
                  <li
                    key={objective.id ?? `${quest.id}-objective-${index}`}
                    style={{
                      opacity: objective.done || (objective as any).failed ? 0.7 : 1,
                    }}
                  >
                    {objective.done ? "✅ " : (objective as any).failed ? "❌ " : "⬜ "}
                    {objective.label}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {quest.parentQuestId && questMap[quest.parentQuestId] ? (
          <p style={{ marginBottom: "0.75rem", opacity: 0.78 }}>
            <strong>Quest padre:</strong> {questMap[quest.parentQuestId].title}
          </p>
        ) : null}

        {quest.factions?.length ? (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {quest.factions.map((faction) =>
              faction.doc ? (
                <Link
                  key={`${quest.id}-${faction.label}`}
                  to={`/docs/${faction.doc}`}
                  style={{ fontSize: "0.92rem" }}
                >
                  #{faction.label}
                </Link>
              ) : (
                <span
                  key={`${quest.id}-${faction.label}`}
                  style={{ fontSize: "0.92rem", opacity: 0.8 }}
                >
                  #{faction.label}
                </span>
              )
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function CompactQuestDashboard({
  showHidden = false,
}: QuestDashboardProps): React.ReactElement {
  const [openQuestIds, setOpenQuestIds] = useState<Record<string, boolean>>({
    "mq-collect-cards": true,
  });

  const [isActiveSectionOpen, setIsActiveSectionOpen] = useState(true);
  const [isCompletedSectionOpen, setIsCompletedSectionOpen] = useState(true);

  const questList = useMemo(() => buildQuestList(quests, showHidden), [showHidden]);

  const visibleByTree = useMemo(
    () => questList.filter((quest) => isQuestVisible(quest, quests, openQuestIds)),
    [questList, openQuestIds]
  );

  const activeQuests = useMemo(
    () => visibleByTree.filter((quest) => quest.status !== "completed"),
    [visibleByTree]
  );

  const completedQuests = useMemo(
    () => questList.filter((quest) => quest.status === "completed"),
    [questList]
  );

  function toggleQuest(questId: string) {
    setOpenQuestIds((prev) => ({
      ...prev,
      [questId]: !prev[questId],
    }));
  }

  return (
    <section>
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ opacity: 0.8 }}>
          Seguimiento del progreso de las quests principales, de facción y personales.
        </p>
      </div>

      <div style={{ display: "grid", gap: "2rem" }}>
        <section>
          <SectionToggle
            title="Quests activas"
            count={activeQuests.length}
            isOpen={isActiveSectionOpen}
            onToggle={() => setIsActiveSectionOpen((prev) => !prev)}
          />

          {isActiveSectionOpen ? (
            <div style={{ marginTop: "1rem" }}>
              {activeQuests.length === 0 ? (
                <p style={{ opacity: 0.7 }}>No hay quests activas por ahora.</p>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {activeQuests.map((quest) =>
                    renderQuestCard(quest, quests, openQuestIds, toggleQuest)
                  )}
                </div>
              )}
            </div>
          ) : null}
        </section>

        <section>
          <SectionToggle
            title="Quests completadas"
            count={completedQuests.length}
            isOpen={isCompletedSectionOpen}
            onToggle={() => setIsCompletedSectionOpen((prev) => !prev)}
          />

          {isCompletedSectionOpen ? (
            <div style={{ marginTop: "1rem" }}>
              {completedQuests.length === 0 ? (
                <p style={{ opacity: 0.7 }}>Aún no hay quests completadas.</p>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {completedQuests.map((quest) =>
                    renderQuestCard(quest, quests, openQuestIds, toggleQuest)
                  )}
                </div>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}