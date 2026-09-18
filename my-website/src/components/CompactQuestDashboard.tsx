import React from "react";
import Link from "@docusaurus/Link";

import {
  calculateQuestProgress,
  getQuestById,
  getQuestChildren,
  getQuestsByStatus,
  type Quest,
} from "@site/src/data/quests";
import {featuredQuestIds} from "@site/src/data/home";
import styles from "./CompactQuestDashboard.module.css";

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    main: "Main",
    side: "Secundaria",
    faction: "Facción",
    personal: "Personal",
    event: "Evento",
  };
  return labels[type] ?? type;
}

function getProgressCounter(quest: Quest): string | null {
  if (quest.progress?.mode === "children") {
    const children = getQuestChildren(quest.id);
    if (!children.length) return null;
    return `${children.filter((child) => child.status === "completed").length}/${children.length}`;
  }

  if (quest.progress?.mode === "objectives" && quest.objectives?.length) {
    const total = quest.objectives.reduce((sum, objective) => sum + (objective.weight ?? 1), 0);
    const complete = quest.objectives.reduce(
      (sum, objective) => sum + (objective.done ? objective.weight ?? 1 : 0),
      0,
    );
    return `${complete}/${total}`;
  }

  if (typeof quest.progress?.current === "number" && typeof quest.progress?.goal === "number") {
    return `${quest.progress.current}/${quest.progress.goal}`;
  }
  return null;
}

function getFeaturedQuests(): Quest[] {
  const configured = featuredQuestIds
    .map((id) => getQuestById(id))
    .filter((quest): quest is Quest => quest?.status === "active" && quest.visibility === "public");

  if (configured.length >= 3) return configured.slice(0, 3);

  const configuredIds = new Set(configured.map((quest) => quest.id));
  const fallback = getQuestsByStatus("active")
    .filter((quest) => quest.visibility === "public" && !configuredIds.has(quest.id))
    .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));

  return [...configured, ...fallback].slice(0, 3);
}

export function getActiveQuestCount() {
  return getQuestsByStatus("active").filter((quest) => quest.visibility === "public").length;
}

export default function CompactQuestDashboard(): React.ReactElement {
  const featuredQuests = getFeaturedQuests();

  return (
    <section className={styles.wrapper} aria-labelledby="featured-quests-title">
      <div className={styles.headingRow}>
        <div>
          <span className={styles.eyebrow}>Hilos del destino</span>
          <h2 id="featured-quests-title" className={styles.heading}>Quests destacadas</h2>
        </div>
        <span className={styles.count}>{getActiveQuestCount()} activas</span>
      </div>

      <div className={styles.list}>
        {featuredQuests.map((quest) => {
          const percent = calculateQuestProgress(quest) ?? 0;
          const counter = getProgressCounter(quest);
          const types = quest.types ?? (quest.type ? [quest.type] : []);

          return (
            <article className={styles.card} key={quest.id}>
              <div className={styles.cardTop}>
                <div className={styles.badges}>
                  {types.slice(0, 2).map((type) => (
                    <span className={styles.typeBadge} key={type}>{getTypeLabel(type)}</span>
                  ))}
                  <span className={styles.statusBadge}>Activa</span>
                </div>
                <span className={styles.percent}>{percent}%</span>
              </div>

              <h3 className={styles.title}>{quest.title}</h3>
              {(quest.subtitle || quest.summary) && (
                <p className={styles.summary}>{quest.subtitle || quest.summary}</p>
              )}

              <div className={styles.progressMeta}>
                <span>Progreso</span>
                <span>{counter ? `${percent}% · ${counter}` : `${percent}%`}</span>
              </div>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-label={`Progreso de ${quest.title}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <span className={styles.progressFill} style={{width: `${percent}%`}} />
              </div>
            </article>
          );
        })}
      </div>

      <Link className={styles.allLink} to="/quests">
        Ver todas las quests activas <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
