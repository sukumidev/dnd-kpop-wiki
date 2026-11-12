import React from "react";
import Link from "@docusaurus/Link";
import {getDocumentPath, getPublicChildDocuments, type Document} from "@site/src/data/documents";
import styles from "@site/src/pages/documents/styles.module.css";

export function formatEntryNumber(entry: Document, index: number): string {
  const marker = entry.chapterNumber ?? entry.order;
  return String(marker === undefined ? index + 1 : marker).padStart(2, "0");
}

export default function DocumentCollectionContents({collection}: {collection: Document}) {
  const entries = getPublicChildDocuments(collection.id);
  if (!entries.length) return null;
  return (
    <section className={styles.collectionContents} aria-labelledby="collection-contents-title">
      <div className={styles.sectionHeadingEditorial}><span>Índice del volumen</span><h2 id="collection-contents-title">Contenido</h2></div>
      <ol className={styles.entryList}>
        {entries.map((entry, index) => <li key={entry.id}>
          <Link className={styles.entryLink} to={getDocumentPath(entry)} aria-label={`Abrir ${entry.chapterTitle || entry.title}`}>
            <span className={styles.entryMarker}>{formatEntryNumber(entry, index)}</span>
            <span className={styles.entryBody}>
              <strong>{entry.chapterTitle || entry.title}</strong>
              {entry.chapterTitle && entry.title !== entry.chapterTitle ? <small>{entry.title}</small> : null}
            </span>
            <span className={styles.entryArrow} aria-hidden="true">→</span>
          </Link>
        </li>)}
      </ol>
    </section>
  );
}
