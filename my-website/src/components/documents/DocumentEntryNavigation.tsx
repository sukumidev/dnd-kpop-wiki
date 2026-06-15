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
  const title = document.chapterTitle || document.title;
  const marker = document.chapterNumber ?? document.order;

  if (marker === undefined) return title;
  return `Capitulo ${marker}: ${title}`;
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
        {isPrevious ? "<- Entrada anterior" : "Siguiente entrada ->"}
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

  if (!publicParent && !previous && !next) return null;

  return (
    <nav className={styles.entryNav} aria-label="Navegacion de entradas">
      <div className={styles.entryNavSide}>
        {previous ? <EntryNavLink direction="previous" document={previous} /> : null}
      </div>

      <div className={styles.entryNavCenter}>
        {publicParent ? (
          <Link
            className={styles.entryNavBack}
            to={withBaseUrl(getDocumentPath(publicParent))}
          >
            Volver a {publicParent.title}
          </Link>
        ) : null}
      </div>

      <div className={styles.entryNavSide}>
        {next ? <EntryNavLink direction="next" document={next} /> : null}
      </div>
    </nav>
  );
}
