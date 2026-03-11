import React, { useMemo, useState } from "react";
import Link from "@docusaurus/Link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import questsJson from "@site/src/data/quests.json";
import type { Quest, QuestMap } from "@site/src/data/quests";

type QuestDashboardProps = {
  showHidden?: boolean;
};

const quests = questsJson as QuestMap;

function getQuestPercent(quest: Quest): number {
  if (quest.progress?.mode === "manual") {
    if (typeof quest.progress.percent === "number") return quest.progress.percent;
    if ((quest.progress.goal ?? 0) <= 0) return 0;
    return Math.round((quest.progress.current / quest.progress.goal) * 100);
  }

  if (quest.progress?.mode === "objectives" && quest.objectives?.length) {
    const totalWeight = quest.objectives.reduce(
      (sum, obj) => sum + (obj.weight ?? 1),
      0
    );
    if (totalWeight === 0) return 0;

    const completedWeight = quest.objectives.reduce(
      (sum, obj) => sum + (obj.done ? obj.weight ?? 1 : 0),
      0
    );

    return Math.round((completedWeight / totalWeight) * 100);
  }

  if ((quest.progress?.goal ?? 0) > 0) {
    return Math.round(((quest.progress?.current ?? 0) / (quest.progress?.goal ?? 1)) * 100);
  }

  return 0;
}

function getAccentColor(accent?: string): string {
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

export default function QuestDashboard({
  showHidden = false,
}: QuestDashboardProps): React.ReactElement {
  const [openQuestIds, setOpenQuestIds] = useState<Record<string, boolean>>({
    "mq-collect-cards": true,
  });

  const questList = useMemo(() => buildQuestList(quests, showHidden), [showHidden]);

  const chartData = useMemo(
    () =>
      questList.map((quest) => ({
        id: quest.id,
        title: quest.title,
        percent: getQuestPercent(quest),
        accent: getAccentColor(quest.accent),
      })),
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
        <h1 style={{ marginBottom: "0.5rem" }}>Quest Log</h1>
        <p style={{ opacity: 0.8 }}>
          Seguimiento del progreso de las quests principales, de facción y personales.
        </p>
      </div>

      <div
        style={{
          border: "1px solid var(--ifm-color-emphasis-300)",
          borderRadius: "16px",
          padding: "1rem",
          marginBottom: "2rem",
          background: "var(--ifm-background-surface-color)",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Progreso general</h2>

        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 24, right: 24 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis type="category" dataKey="title" width={240} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`${value}%`, "Progreso"]} />
              <Bar dataKey="percent" radius={[0, 8, 8, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.id} fill={entry.accent} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {questList.map((quest) => {
          const percent = getQuestPercent(quest);
          const depth = getDepth(quest, quests);
          const isOpen = !!openQuestIds[quest.id];
          const progressCurrent = quest.progress?.current ?? 0;
          const progressGoal = quest.progress?.goal ?? 0;
          const typeLabels = getTypeLabels(quest);

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
              }}
            >
              <button
                type="button"
                onClick={() => toggleQuest(quest.id)}
                aria-expanded={isOpen}
                aria-controls={`quest-panel-${quest.id}`}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
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
                </div>
              </button>

              <div
                id={`quest-panel-${quest.id}`}
                style={{
                  display: isOpen ? "block" : "none",
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
                      {quest.objectives.map((objective) => (
                        <li key={objective.id} style={{ opacity: objective.done ? 0.7 : 1 }}>
                          {objective.done ? "✅ " : "⬜ "}
                          {objective.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {quest.parentQuestId && quests[quest.parentQuestId] ? (
                  <p style={{ marginBottom: "0.75rem", opacity: 0.78 }}>
                    <strong>Quest padre:</strong> {quests[quest.parentQuestId].title}
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
        })}
      </div>
    </section>
  );
}