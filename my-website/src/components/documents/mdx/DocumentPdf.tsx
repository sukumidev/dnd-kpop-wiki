import React, {useEffect, useState} from "react";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import {isDocumentPdfDisplay, isDocumentPdfSrc, type DocumentPdfDisplay} from "./documentPdfContract";
import styles from "./DocumentPdf.module.css";

export type DocumentPdfProps = {
  src: string;
  title: string;
  caption?: string;
  display?: DocumentPdfDisplay;
};

export function DocumentPdf({src, title, caption, display = "embedded"}: DocumentPdfProps) {
  const {withBaseUrl} = useBaseUrlUtils();
  const valid = isDocumentPdfSrc(src) && typeof title === "string" && Boolean(title.trim()) && isDocumentPdfDisplay(display);
  const url = valid ? withBaseUrl(src) : "";
  const fileName = valid ? src.split("/").at(-1) : undefined;
  const [missing, setMissing] = useState(false);
  const [viewerUnsupported, setViewerUnsupported] = useState(false);

  useEffect(() => {
    if (!valid) return;
    setMissing(false);
    const navigatorWithPdf = navigator as Navigator & {pdfViewerEnabled?: boolean};
    if (navigatorWithPdf.pdfViewerEnabled === false) setViewerUnsupported(true);
    const controller = new AbortController();
    void fetch(url, {method: "HEAD", signal: controller.signal}).then((response) => {
      setMissing(!response.ok && response.status !== 405);
    }).catch(() => {
      // Network failures are ambiguous; keep the direct links available.
    });
    return () => controller.abort();
  }, [url, valid]);

  if (!valid) {
    return <p className={styles.error} role="alert">El PDF no tiene una ruta pública y un título válidos.</p>;
  }

  return <figure className={styles.pdf} data-display={display}>
    <div className={styles.heading}>
      <span className={styles.icon} aria-hidden="true">PDF</span>
      <div className={styles.identity}>
        <strong className={styles.title}>{title}</strong>
        <span className={styles.filename}>{fileName}</span>
      </div>
    </div>
    {missing ? <p className={styles.error} role="alert">No se encontró este PDF en la Biblioteca. Prueba los enlaces o avisa al equipo.</p> : null}
    {display === "embedded" && !missing ? <div className={styles.viewerRegion}>
      {viewerUnsupported ? <p className={styles.fallback}>Este navegador no admite la vista integrada de PDF. Puedes abrir o descargar el original.</p> :
        <iframe className={styles.viewer} src={url} title={`Vista previa del PDF: ${title}`} loading="lazy" referrerPolicy="no-referrer" />}
      <p className={styles.mobileFallback}>Abre el PDF para leerlo en el visor de tu dispositivo.</p>
    </div> : null}
    {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    <div className={styles.actions} aria-label={`Acciones para ${title}`}>
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir PDF: ${title}`}>Abrir PDF</a>
      <a href={url} download={fileName} aria-label={`Descargar PDF: ${title}`}>Descargar original</a>
    </div>
  </figure>;
}
