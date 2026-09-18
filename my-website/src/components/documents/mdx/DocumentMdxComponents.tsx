import React from "react";
import styles from "./DocumentMdxComponents.module.css";

export type QuoteProps = React.PropsWithChildren<{cite?: string}>;
export function Quote({children, cite}: QuoteProps) {
  return <blockquote className={styles.quote}>{children}{cite ? <cite>— {cite}</cite> : null}</blockquote>;
}

export type CalloutProps = React.PropsWithChildren<{
  title?: string;
  tone?: "note" | "warning" | "mystery";
}>;
export function Callout({children, title, tone = "note"}: CalloutProps) {
  return <aside className={styles.callout} data-tone={tone}>{title ? <strong>{title}</strong> : null}{children}</aside>;
}

export type SpoilerProps = React.PropsWithChildren<{summary?: string}>;
export function Spoiler({children, summary = "Mostrar contenido"}: SpoilerProps) {
  return <details className={styles.spoiler}><summary>{summary}</summary><div>{children}</div></details>;
}

export type DocumentImageProps = {
  src: string;
  alt: string;
  caption?: string;
};
export function DocumentImage({src, alt, caption}: DocumentImageProps) {
  return <figure className={styles.image}><img src={src} alt={alt} />{caption ? <figcaption>{caption}</figcaption> : null}</figure>;
}

export type DividerProps = {label?: string};
export function Divider({label}: DividerProps) {
  return <div className={styles.divider} role="separator" aria-label={label}><span aria-hidden="true">✦</span></div>;
}
