import React from "react";
import styles from "@site/src/css/CharacterSplitLayout.module.css";

export default function CharacterSplitLayout({
  statblock,
  side,
  introduction,
  children,
}: {
  statblock?: React.ReactNode;
  side: React.ReactNode;
  introduction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={introduction ? `${styles.wrap} ${styles.withIntroduction}` : styles.wrap}>
      <aside className={styles.side}>{side}</aside>
      {introduction ? <div className={styles.introduction}>{introduction}</div> : null}
      {statblock ? <div className={styles.stat}>{statblock}</div> : null}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
