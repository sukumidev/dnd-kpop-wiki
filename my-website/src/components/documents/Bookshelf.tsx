import React from "react";
import type { LibraryShelf } from "@site/src/data/library";
import BookSpine from "./BookSpine";
import styles from "./Bookshelf.module.css";

/** A continuous shelf section; CSS creates another ledge when books wrap. */
export default function Bookshelf({ shelf }: { shelf: LibraryShelf }): React.ReactElement | null {
  if (!shelf.documents.length) return null;
  return (
    <section className={styles.section} aria-labelledby={`shelf-${shelf.id}`}>
      <div className={styles.plaqueRow}>
        <span className={styles.plaqueFlourish} aria-hidden="true">✦</span>
        <h2 id={`shelf-${shelf.id}`} className={styles.plaque}>{shelf.title}</h2>
        <span className={styles.plaqueFlourish} aria-hidden="true">✦</span>
      </div>
      <p className={styles.shelfDescription}>
        {shelf.kind === "unknown"
          ? "El lugar de hallazgo de estos volúmenes aún no está registrado."
          : shelf.kind === "other"
            ? "Hallazgos de lugares fuera de los reinos catalogados."
            : `Volúmenes hallados en ${shelf.title}.`}
      </p>
      <div className={styles.books} role="list" aria-label={`Libros de ${shelf.title}`}>
        {shelf.documents.map((document) => (
          <div className={styles.slot} role="listitem" key={document.id}>
            <BookSpine document={document} />
          </div>
        ))}
      </div>
    </section>
  );
}
