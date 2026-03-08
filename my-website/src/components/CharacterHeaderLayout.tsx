import React from "react";
import styles from "@site/src/css/CharacterHeaderLayout.module.css";

export default function CharacterHeaderLayout({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.left}>{left}</div>
      <div className={styles.right}>{right}</div>
    </div>
  );
}