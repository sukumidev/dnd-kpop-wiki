import React from "react";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import {
  getDocumentPath,
  getPublicEntryCountForCollection,
  isDocumentCollection,
  isDocumentEntry,
  type Document,
} from "@site/src/data/documents";
import DocumentTags from "./DocumentTags";
import DocumentTypeBadge from "./DocumentTypeBadge";
import styles from "@site/src/pages/documents/styles.module.css";

function getDocumentTeaser(document: Document): string | undefined {
  return document.summary || document.excerpt;
}

export default function DocumentCard({ document }: { document: Document }): React.ReactElement {
  const { withBaseUrl } = useBaseUrlUtils();
  const teaser = getDocumentTeaser(document);
  const isCollection = isDocumentCollection(document);
  const publicEntryCount = isCollection ? getPublicEntryCountForCollection(document.id) : 0;
  const actionLabel = isDocumentCollection(document)
    ? "Abrir colección"
    : isDocumentEntry(document)
      ? "Leer entrada"
      : "Leer documento";

  return (
    <Link
      className={styles.cardLink}
      to={withBaseUrl(getDocumentPath(document))}
      aria-label={`Abrir documento ${document.title}`}
    >
      <article className={styles.card}>
        <div className={styles.cardHeader}>
          <DocumentTypeBadge type={document.type} />
          {isCollection ? <span className={styles.kindBadge}>Coleccion</span> : null}
          {document.dateLabel ? (
            <span className={styles.dateLabel}>{document.dateLabel}</span>
          ) : null}
        </div>

        <div className={styles.cardBody}>
          <h2 className={styles.cardTitle}>{document.title}</h2>
          {document.subtitle ? <p className={styles.subtitle}>{document.subtitle}</p> : null}
          {teaser ? <p className={styles.summary}>{teaser}</p> : null}
        </div>

        <div className={styles.cardFooter}>
          <DocumentTags documentId={document.id} tags={document.tags} />
          {isCollection ? (
            <span className={styles.entryCount}>
              {publicEntryCount} {publicEntryCount === 1 ? "entrada" : "entradas"}
            </span>
          ) : null}
          <span className={styles.cardAction}>{actionLabel}</span>
        </div>
      </article>
    </Link>
  );
}
