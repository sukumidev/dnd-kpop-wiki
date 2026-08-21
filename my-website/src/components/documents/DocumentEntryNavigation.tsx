import React from "react";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import {
  getDocumentPath,
  getPreviousAndNextDocumentEntries,
  getPublicParentDocument,
  type Document,
} from "@site/src/data/documents";
import styles from "@site/src/pages/documents/styles.module.css";

function getEntryDisplayTitle(document: Document): string {
  return document.chapterTitle || document.title;
}

function EntryNavLink({
  direction,
  document,
}: {
  direction: "previous" | "next";
  document: Document;
}) {
  const { withBaseUrl } = useBaseUrlUtils();
  const isPrevious = direction === "previous";

  return (
    <Link
      className={styles.entryNavLink}
      to={withBaseUrl(getDocumentPath(document))}
      aria-label={`${isPrevious ? "Entrada anterior" : "Siguiente entrada"}: ${document.title}`}
    >
      <span className={styles.entryNavLabel}>
        {isPrevious ? "← Anterior" : "Siguiente →"}
      </span>
      <span className={styles.entryNavTitle}>{getEntryDisplayTitle(document)}</span>
    </Link>
  );
}

export default function DocumentEntryNavigation({
  document,
}: {
  document: Document;
}): React.ReactElement | null {
  const { withBaseUrl } = useBaseUrlUtils();
  const publicParent = getPublicParentDocument(document);
  const { previous, next } = getPreviousAndNextDocumentEntries(document);

  if (!previous && !next) return null;

  return (
    <nav className={styles.entryNav} aria-label="Navegacion de entradas">
      <div className={styles.entryNavSide}>
        {previous ? <EntryNavLink direction="previous" document={previous} /> : null}
      </div>

      <div className={styles.entryNavSide}>
        {next ? <EntryNavLink direction="next" document={next} /> : null}
      </div>

      {publicParent ? (
        <Link className={styles.entryNavBack} to={withBaseUrl(getDocumentPath(publicParent))}>
          Ver índice de {publicParent.title}
        </Link>
      ) : null}
    </nav>
  );
}
