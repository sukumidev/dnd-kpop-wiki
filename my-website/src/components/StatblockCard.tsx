import React from "react";
import styles from "@site/src/css/StatblockCard.module.css";
import type { Statblock } from "@site/src/data/statblocks";
import { classesLabel, totalLevel } from "@site/src/data/statblocks";

function mod(score: number) {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}
const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

function Chips({ items }: { items: string[] }) {
  if (!items?.length) return <span className={styles.muted}>—</span>;
  return (
    <div className={styles.chips}>
      {items.map((x) => (
        <span key={x} className={styles.chip}>{x}</span>
      ))}
    </div>
  );
}

export default function StatblockCard({ data }: { data?: Statblock | null }) {
  if (!data) return null;

  const abilities = [
    ["STR", data.str],
    ["DEX", data.dex],
    ["CON", data.con],
    ["INT", data.int],
    ["WIS", data.wis],
    ["CHA", data.cha],
  ] as const;

  const saves = data.savingThrows
    ? ([
        ["STR", data.savingThrows.str],
        ["DEX", data.savingThrows.dex],
        ["CON", data.savingThrows.con],
        ["INT", data.savingThrows.int],
        ["WIS", data.savingThrows.wis],
        ["CHA", data.savingThrows.cha],
      ] as const)
    : null;

  return (
    <section
      className={styles.card}
      data-primary-class={data.classes?.[0]?.name?.toLowerCase() || "default"}
    >
      <div className={styles.top}>
        <div className={styles.headLeft}>
          <div className={styles.classLine}>
            <span className={styles.classText}>{classesLabel(data)}</span>
            <span className={styles.levelPill}>Lvl {totalLevel(data)}</span>
          </div>
          <div className={styles.meta}>
            <span>{data.race}</span>
            <span className={styles.dot}>•</span>
            <span>{data.alignment}</span>
          </div>
        </div>

        <div className={styles.headRight}>
          <span className={styles.pill} aria-label="Proficiency Bonus">
            🎯 PB {signed(data.proficiencyBonus)}
          </span>
          <span className={styles.pill} aria-label="Initiative">
            ⚡ Init {signed(data.initiative)}
          </span>
          <span className={styles.pill} aria-label="Passive Perception">
            👁️ PP {data.passivePerception}
          </span>
        </div>
      </div>

      {/* Fila 1: KPIs */}
      <div className={styles.grid3}>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>🛡️ AC</div>
          <div className={styles.kpiValue}>{data.ac}</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>❤️ HP</div>
          <div className={styles.kpiValue}>{data.hp}</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>👟 Speed</div>
          <div className={styles.kpiValue}>{data.speed}</div>
        </div>
      </div>

      {/* Fila 2: Abilities */}
      <div className={styles.sectionTitleRow}>
        <span className={styles.sectionTitle}>Abilities</span>
      </div>

      <div className={styles.sixGrid}>
        {abilities.map(([label, score]) => (
          <div key={label} className={styles.abilityCard}>
            <div className={styles.abilityTop}>
              <span className={styles.abilityName}>{label}</span>
              <span className={styles.modPill}>{mod(score)}</span>
            </div>
            <div className={styles.abilityScoreBig}>{score}</div>
          </div>
        ))}
      </div>

      {/* Fila 3: Saving Throws */}
      {saves ? (
        <>
          <div className={styles.sectionTitleRow}>
            <span className={styles.sectionTitle}>Saving Throws</span>
          </div>

          <div className={styles.sixGrid}>
            {saves.map(([label, value]) => (
              <div key={label} className={styles.saveCard}>
                <div className={styles.saveTop}>
                  <span className={styles.saveName}>{label}</span>
                </div>
                <div className={styles.saveValue}>{signed(value)}</div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {/* Daños */}
      <div className={styles.traits}>
        <div className={styles.traitRow}>
          <div className={styles.traitLabel}>Resistances</div>
          <Chips items={data.resistances} />
        </div>
        <div className={styles.traitRow}>
          <div className={styles.traitLabel}>Vulnerabilities</div>
          <Chips items={data.vulnerability} />
        </div>
        <div className={styles.traitRow}>
          <div className={styles.traitLabel}>Immunities</div>
          <Chips items={data.immunity} />
        </div>
      </div>
    </section>
  );
}