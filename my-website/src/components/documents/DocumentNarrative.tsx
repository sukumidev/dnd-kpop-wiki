import React, {useEffect, useRef, useState} from "react";
import Link from "@docusaurus/Link";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {MDXProvider} from "@mdx-js/react";
import MDXComponents from "@theme/MDXComponents";
import type {Document} from "@site/src/data/documents";
import type {SelectedDocumentContent} from "./documentContent";
import {nextDocumentHeadingId, slugDocumentHeading} from "./documentHeadings";
import styles from "@site/src/pages/documents/styles.module.css";

type TocItem = {id: string; title: string; level: 2 | 3};

function textOf(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (React.isValidElement<{children?: React.ReactNode}>(children)) return textOf(children.props.children);
  return "";
}

export default function DocumentNarrative({document, narrative}: {document: Document; narrative: SelectedDocumentContent}) {
  const {withBaseUrl} = useBaseUrlUtils();
  const root = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const usedIds = new Map<string, number>();

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const headings = Array.from(container.querySelectorAll<HTMLHeadingElement>("h2, h3"));
    const used = new Map<string, number>();
    const reservedIds = new Set(headings.map((heading) => heading.id).filter(Boolean));
    const entries = headings.map((heading) => {
      const title = heading.textContent?.trim() ?? "";
      if (!heading.id) {
        let id = nextDocumentHeadingId(title, used);
        while (reservedIds.has(id)) id = nextDocumentHeadingId(title, used);
        heading.id = id;
        reservedIds.add(id);
      } else {
        const base = slugDocumentHeading(title);
        used.set(base, (used.get(base) ?? 0) + 1);
      }
      return {id: heading.id, title, level: Number(heading.tagName.slice(1)) as 2 | 3};
    }).filter((entry) => entry.title);
    setToc(entries.length >= 2 && (container.textContent?.length ?? 0) >= 1200 ? entries : []);
  }, [document.id, document.content, document.contentPath, narrative.kind]);

  if (narrative.kind === "none") return null;

  const heading = (level: 1 | 2 | 3 | 4 | 5 | 6, children: React.ReactNode) => {
    const title = textOf(children).trim();
    if (level === 1 && slugDocumentHeading(title) === slugDocumentHeading(document.title)) return null;
    const tag = `h${level === 1 ? 2 : level}` as keyof React.JSX.IntrinsicElements;
    return React.createElement(tag, {id: nextDocumentHeadingId(title, usedIds)}, children);
  };

  return (
    <>
      {toc.length ? <nav className={styles.readerToc} aria-label="En este documento">
        <span>En este documento</span>
        <ol>{toc.map((item) => <li key={item.id} data-level={item.level}><a href={`#${item.id}`}>{item.title}</a></li>)}</ol>
      </nav> : null}
      <div ref={root} className={`${styles.documentReaderContent} ${narrative.kind === "legacy" ? styles.legacyContent : ""} markdown`} data-document-reader-content>
        {narrative.kind === "mdx" ? <MDXProvider components={MDXComponents}>{narrative.content}</MDXProvider> : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            skipHtml
            components={{
              h1: ({children}) => heading(1, children),
              h2: ({children}) => heading(2, children),
              h3: ({children}) => heading(3, children),
              h4: ({children}) => heading(4, children),
              h5: ({children}) => heading(5, children),
              h6: ({children}) => heading(6, children),
              a: ({href, children, title}) => href ? <Link to={href.startsWith("/") && !href.startsWith("//") ? withBaseUrl(href) : href} title={title}>{children}</Link> : <>{children}</>,
              img: ({src, alt, title}) => src ? <img src={src.startsWith("/") && !src.startsWith("//") ? withBaseUrl(src) : src} alt={alt || ""} title={title} loading="lazy" /> : null,
              table: ({children}) => <div className={styles.tableScroll}><table>{children}</table></div>,
            }}
          >{narrative.content}</ReactMarkdown>
        )}
      </div>
    </>
  );
}
