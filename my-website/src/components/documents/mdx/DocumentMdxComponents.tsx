import React from "react";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import {
  DOCUMENT_GALLERY_COLUMNS,
  DOCUMENT_IMAGE_ALIGNMENTS,
  DOCUMENT_IMAGE_SIZES,
  isSafeDocumentImageSource,
  type DocumentGalleryColumns,
  type DocumentImageAlign,
  type DocumentImageSize,
} from "./documentMedia";
import styles from "./DocumentMdxComponents.module.css";

export type QuoteProps = React.PropsWithChildren<{cite?: string}>;
export function Quote({children, cite}: QuoteProps) {
  return <blockquote className={styles.quote}>{children}{cite ? <cite>— {cite}</cite> : null}</blockquote>;
}

export type CalloutProps = React.PropsWithChildren<{
  title?: string;
  type?: "note" | "warning" | "mystery";
  tone?: "note" | "warning" | "mystery";
}>;
export function Callout({children, title, type, tone}: CalloutProps) {
  return <aside className={styles.callout} data-tone={tone ?? type ?? "note"}>{title ? <strong>{title}</strong> : null}{children}</aside>;
}

export type SpoilerProps = React.PropsWithChildren<{summary?: string; label?: string}>;
export function Spoiler({children, summary, label}: SpoilerProps) {
  return <details className={styles.spoiler}><summary>{summary ?? label ?? "Mostrar contenido"}</summary><div>{children}</div></details>;
}

export type DocumentImageProps = {
  src: string;
  alt: string;
  caption?: string;
  title?: string;
  size?: DocumentImageSize;
  align?: DocumentImageAlign;
};
export function DocumentImage({src, alt, caption, title, size, align}: DocumentImageProps) {
  const {withBaseUrl} = useBaseUrlUtils();
  if (!isSafeDocumentImageSource(src)) return null;
  const source = src.trim();
  const imageSrc = source.startsWith("/") && !source.startsWith("//") ? withBaseUrl(source) : source;
  const validSize = size && DOCUMENT_IMAGE_SIZES.includes(size) ? size : undefined;
  const validAlign = align && DOCUMENT_IMAGE_ALIGNMENTS.includes(align) ? align : undefined;
  return <figure className={styles.image} data-size={validSize} data-align={validAlign}>
    <img src={imageSrc} alt={alt ?? ""} title={title} loading="lazy" decoding="async" />
    {caption ? <figcaption>{caption}</figcaption> : null}
  </figure>;
}

export type DocumentGalleryProps = React.PropsWithChildren<{columns?: DocumentGalleryColumns | 1 | 2 | 3}>;
export function DocumentGallery({children, columns = "2"}: DocumentGalleryProps) {
  const count = DOCUMENT_GALLERY_COLUMNS.includes(String(columns) as DocumentGalleryColumns) ? String(columns) : "2";
  return <div className={styles.gallery} data-columns={count} role="group" aria-label="Galería de imágenes">{children}</div>;
}

export type DividerProps = {label?: string};
export function Divider({label}: DividerProps) {
  return <div className={styles.divider} role="separator" aria-label={label}><span aria-hidden="true">✦</span></div>;
}
