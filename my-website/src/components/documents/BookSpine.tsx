import React from "react";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import { getDocumentPath, getDocumentTypeLabel, isDocumentCollection, type Document } from "@site/src/data/documents";
import { getDiscoveryPlacement, resolveBookAppearance } from "@site/src/data/library";
import styles from "./BookSpine.module.css";

export default function BookSpine({ document }: { document: Document }): React.ReactElement {
  const { withBaseUrl } = useBaseUrlUtils();
  const appearance = resolveBookAppearance(document);
  const placement = getDiscoveryPlacement(document);
  const collection = isDocumentCollection(document);
  const kind = collection ? "Colección" : getDocumentTypeLabel(document.type);
  const context = `${kind} · ${placement.description}`;

  return (
    <Link
      to={withBaseUrl(getDocumentPath(document))}
      className={styles.link}
      aria-label={`Abrir ${kind.toLocaleLowerCase("es")}: ${document.title}. ${placement.description}`}
      title={`${document.title} — ${context}`}
      data-collection={collection || undefined}
      data-height={appearance.height}
      data-thickness={appearance.thickness}
      data-texture={appearance.texture}
      style={{
        "--book-color": appearance.color,
        "--book-accent": appearance.accentColor,
      } as React.CSSProperties}
    >
      <span className={styles.book} aria-hidden="true">
        {appearance.spineImage ? <img className={styles.customImage} src={withBaseUrl(appearance.spineImage)} alt="" /> : null}
        <span className={styles.topBand} />
        <span className={styles.ornament} data-ornament={appearance.ornament}>
          <svg viewBox="0 0 52 48" focusable="false" aria-hidden="true">
            <path d="M26 3v42M5 24h42M11 10c5 0 8 3 9 9-6-1-9-4-9-9Zm30 0c-5 0-8 3-9 9 6-1 9-4 9-9ZM11 38c5 0 8-3 9-9-6 1-9 4-9 9Zm30 0c-5 0-8-3-9-9 6 1 9 4 9 9Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="26" cy="24" r="5" fill="none" stroke="currentColor" />
          </svg>
        </span>
        <span className={styles.symbol}>{appearance.symbol}</span>
        <span className={styles.title}>{appearance.spineTitle}</span>
        {collection ? <span className={styles.collectionMark}>COLECCIÓN</span> : null}
        <span className={styles.bottomBand} />
      </span>
      <span className={styles.tooltip} aria-hidden="true">
        <strong>{document.title}</strong>
        <small>{context}</small>
      </span>
    </Link>
  );
}
