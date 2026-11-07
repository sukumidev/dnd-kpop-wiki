import React from "react";
import styles from "./HallyuraHeroTitle.module.css";

export default function HallyuraHeroTitle(): React.ReactElement {
  return (
    <header className={styles.hero}>
      <div className={styles.topOrnament} aria-hidden="true">
        <span className={styles.topLine} />
        <span className={styles.topStar}>✦</span>
        <span className={styles.topLine} />
      </div>

      <h1 className={styles.title}>Hallyura</h1>

      <div className={styles.divider} aria-hidden="true">
        <span className={styles.outerStar}>✦</span>
        <span className={styles.dividerLine} />
        <span className={styles.centerStar}>✧</span>
        <span className={styles.dividerLine} />
        <span className={styles.outerStar}>✦</span>
      </div>

      <p className={styles.subtitle}>Un mundo de magia viva, reinos divididos y leyendas que se niegan a morir.</p>

      <div className={styles.suits} aria-hidden="true">
        <span>♣︎</span><span>♥︎</span><span>♠︎</span><span>♦︎</span>
      </div>
    </header>
  );
}
