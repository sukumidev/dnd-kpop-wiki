import React from "react";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import { getDocumentPath, getDocumentTypeLabel, isDocumentCollection, type Document } from "@site/src/data/documents";
import { getDiscoveryPlacement, isDecorativeFrame, resolveArchiveAppearance } from "@site/src/data/library";
import OrnamentalSymbol from "./OrnamentalSymbol";
import OrnamentFrame from "./OrnamentFrame";
import styles from "./BookSpine.module.css";
import archiveStyles from "./ArchiveObject.module.css";

const modeLabels = {
  book: "libro", letter: "carta", newspaper: "gaceta", dossier: "expediente", notice: "anuncio", scroll: "pergamino",
} as const;

export default function ArchiveObject({ document }: { document: Document }): React.ReactElement {
  const { withBaseUrl } = useBaseUrlUtils();
  const appearance = resolveArchiveAppearance(document);
  const placement = getDiscoveryPlacement(document);
  const collection = isDocumentCollection(document);
  const kind = collection ? "Colección" : getDocumentTypeLabel(document.type);
  const context = `${kind} · ${placement.description}`;

  return (
    <Link
      to={withBaseUrl(getDocumentPath(document))}
      className={appearance.displayMode === "book" ? styles.link : `${styles.link} ${archiveStyles.object}`}
      aria-label={`Abrir ${kind.toLocaleLowerCase("es")}: ${document.title}. ${placement.description}${appearance.displayMode === "book" ? "" : `. Objeto: ${modeLabels[appearance.displayMode]}`}`}
      title={`${document.title} — ${context}`}
      data-collection={collection || undefined}
      data-height={appearance.height}
      data-thickness={appearance.thickness}
      data-texture={appearance.texture}
      data-mode={appearance.displayMode}
      data-material={appearance.material}
      data-wear={appearance.wear}
      data-ornament={appearance.ornament}
      data-frame-modern={isDecorativeFrame(appearance.ornament) || undefined}
      style={{
        "--book-color": appearance.color,
        "--book-accent": appearance.accentColor,
        "--archive-color": appearance.color,
        "--archive-accent": appearance.accentColor,
      } as React.CSSProperties}
    >
      {appearance.displayMode === "book" ? <span className={styles.book} aria-hidden="true">
        {appearance.spineImage ? <img className={styles.customImage} src={withBaseUrl(appearance.spineImage)} alt="" /> : null}
        <span className={styles.topBand} />
        {isDecorativeFrame(appearance.ornament) ? <span className={styles.frameSlot}><OrnamentFrame frame={appearance.ornament} symbol={appearance.symbol} /></span> : <><span className={styles.ornament} data-ornament={appearance.ornament}>
          <svg viewBox="0 0 52 48" focusable="false" aria-hidden="true">
            <path d="M26 3v42M5 24h42M11 10c5 0 8 3 9 9-6-1-9-4-9-9Zm30 0c-5 0-8 3-9 9 6-1 9-4 9-9ZM11 38c5 0 8-3 9-9-6 1-9 4-9 9Zm30 0c-5 0-8-3-9-9 6 1 9 4 9 9Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="26" cy="24" r="5" fill="none" stroke="currentColor" />
          </svg>
        </span>
        <OrnamentalSymbol value={appearance.symbol} className={styles.symbol} /></>}
        <span className={styles.title}>{appearance.spineTitle}</span>
        {collection ? <span className={styles.collectionMark}>COLECCIÓN</span> : null}
        <span className={styles.bottomBand} />
      </span> : <span className={archiveStyles.surface} aria-hidden="true">
        <span className={archiveStyles.pages} />
        <span className={archiveStyles.fold} />
        <span className={archiveStyles.stitch} />
        <span className={archiveStyles.tab} />
        <span className={archiveStyles.sheet} />
        <span className={archiveStyles.clip} />
        <span className={archiveStyles.print} />
        <span className={archiveStyles.band} />
        <span className={archiveStyles.cord} />
        <span className={archiveStyles.seal}>{isDecorativeFrame(appearance.ornament) ? <OrnamentFrame frame={appearance.ornament} symbol={appearance.symbol} /> : <OrnamentalSymbol value={appearance.symbol} />}</span>
        <span className={archiveStyles.title}>{appearance.spineTitle}</span>
        {collection ? <span className={archiveStyles.collectionMark}>COLECCIÓN</span> : null}
      </span>}
      <span className={styles.tooltip} aria-hidden="true">
        <strong>{document.title}</strong>
        <small>{context}</small>
      </span>
    </Link>
  );
}
