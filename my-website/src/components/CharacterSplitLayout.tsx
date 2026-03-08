import React from "react";
import styles from "@site/src/css/CharacterSplitLayout.module.css";

export default function CharacterSplitLayout({
  statblock,
  side,
  children,
}: {
  statblock?: React.ReactNode;
  side: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrap}>
      <aside className={styles.side}>{side}</aside>
      {statblock ? <div className={styles.stat}>{statblock}</div> : null}
      <div className={styles.body}>{children}</div>
    </div>
  );
}