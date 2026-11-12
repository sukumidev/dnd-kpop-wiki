import React from "react";
import Link from "@docusaurus/Link";
import {getDocumentKind, getDocumentPath, getDocumentTypeLabel, type Document} from "@site/src/data/documents";
import styles from "@site/src/pages/documents/styles.module.css";

export default function DocumentReaderHeader({document, parent}: {document: Document; parent?: Document}) {
  const kind = getDocumentKind(document);
  const label = kind === "single" ? "Documento" : kind === "collection" ? "Colección" : "Entrada";
  const chapter = kind === "entry" && document.chapterNumber !== undefined
    ? `Capítulo ${String(document.chapterNumber).padStart(2, "0")}`
    : null;
  const distinctChapterTitle = document.chapterTitle?.trim() && document.chapterTitle.trim() !== document.title.trim()
    ? document.chapterTitle.trim()
    : null;

  return (
    <header className={styles.readerHeader}>
      <div className={styles.archiveLabel}>{label} / {getDocumentTypeLabel(document.type)}{chapter ? ` / ${chapter}` : ""}</div>
      {parent ? <Link className={styles.collectionContext} to={getDocumentPath(parent)}>Volumen: {parent.title}</Link> : null}
      <h1 className={styles.readerTitle}>{document.title}</h1>
      {distinctChapterTitle ? <p className={styles.chapterTitle}>{distinctChapterTitle}</p> : null}
      {document.subtitle ? <p className={styles.readerSubtitle}>{document.subtitle}</p> : null}
      <div className={styles.headerOrnament} aria-hidden="true"><span>✦</span></div>
    </header>
  );
}
