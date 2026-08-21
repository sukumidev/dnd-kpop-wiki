import React from "react";
import Link from "@docusaurus/Link";
import {useLocation} from "@docusaurus/router";
import Layout from "@theme/Layout";
import {
  getDocumentCharacterRelations,
  getDocumentKind,
  getDocumentPath,
  getDocumentTypeLabel,
  getPublicChildDocuments,
  getPublicDocumentById,
  getPublicParentDocument,
  type Document,
} from "@site/src/data/documents";
import {getCharacterDocPath, type Character} from "@site/src/data/relationships";
import DocumentEntryNavigation from "./DocumentEntryNavigation";
import DocumentRelationshipsSection from "./DocumentRelationshipsSection";
import styles from "@site/src/pages/documents/styles.module.css";

type DocumentReaderPageProps = {documentId?: string};

function getDocumentIdFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return decodeURIComponent(segments[segments.length - 1] ?? "");
}

function CharacterLinks({characters}: {characters: Character[]}) {
  return <>{characters.map((character, index) => (
    <React.Fragment key={character.id}>
      {index ? <span aria-hidden="true"> · </span> : null}
      <Link to={`/${getCharacterDocPath(character)}`}>{character.title}</Link>
    </React.Fragment>
  ))}</>;
}

function DocumentMetadata({document}: {document: Document}) {
  const {authors, recipients} = getDocumentCharacterRelations(document);
  const author = authors.length
    ? <CharacterLinks characters={authors} />
    : document.authorName || null;
  const items = [
    document.inWorldDate ? {label: "Fecha", value: document.inWorldDate, emphasis: document.type === "diary"} : undefined,
    author ? {label: "Autor", value: author, emphasis: document.type === "letter"} : undefined,
    recipients.length ? {label: recipients.length === 1 ? "Destinatario" : "Destinatarios", value: <CharacterLinks characters={recipients} />, emphasis: document.type === "letter"} : undefined,
    document.dateLabel ? {label: "Registro", value: document.dateLabel, emphasis: false} : undefined,
  ].filter(Boolean) as {label: string; value: React.ReactNode; emphasis: boolean}[];

  if (!items.length) return null;
  return (
    <dl className={styles.metadata} aria-label="Metadatos del documento">
      {items.map((item) => (
        <div className={item.emphasis ? styles.metadataItemEmphasis : styles.metadataItem} key={item.label}>
          <dt>{item.label}</dt><dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ArchiveLabel({document}: {document: Document}) {
  const kind = getDocumentKind(document);
  const parts = [kind === "single" ? "Documento" : "Archivo", getDocumentTypeLabel(document.type)];
  if (kind === "entry" && document.chapterNumber !== undefined) {
    parts.push(`Capítulo ${String(document.chapterNumber).padStart(2, "0")}`);
  }
  return <div className={styles.archiveLabel}>{parts.join(" / ")}</div>;
}

function DocumentHeader({document, parent}: {document: Document; parent?: Document}) {
  const kind = getDocumentKind(document);
  return (
    <header className={styles.readerHeader}>
      <ArchiveLabel document={document} />
      {kind === "entry" && parent ? <Link className={styles.collectionContext} to={getDocumentPath(parent)}>{parent.title}</Link> : null}
      {kind === "entry" && document.chapterNumber !== undefined ? <p className={styles.chapterNumber}>Capítulo {document.chapterNumber}</p> : null}
      <h1 className={styles.readerTitle}>{document.title}</h1>
      {document.chapterTitle ? <p className={styles.chapterTitle}>{document.chapterTitle}</p> : null}
      {document.subtitle ? <p className={styles.readerSubtitle}>{document.subtitle}</p> : null}
      <div className={styles.headerOrnament} aria-hidden="true"><span>✦</span></div>
    </header>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((token, index) => {
    const bold = token.match(/^\*\*(.+)\*\*$/);
    if (bold) return <strong key={index}>{bold[1]}</strong>;
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <Link key={index} to={link[2]}>{link[1]}</Link>;
    return <React.Fragment key={index}>{token}</React.Fragment>;
  });
}

function MarkdownContent({content}: {content: string}) {
  return (
    <div className={styles.documentReaderContent} data-document-reader-content>
      {content.trim().split(/\n{2,}/).map((block, index) => {
        if (block.startsWith("### ")) return <h3 key={index}>{renderInlineMarkdown(block.slice(4))}</h3>;
        if (block.startsWith("## ")) return <h2 key={index}>{renderInlineMarkdown(block.slice(3))}</h2>;
        if (block.startsWith("# ")) return <h2 key={index}>{renderInlineMarkdown(block.slice(2))}</h2>;
        const lines = block.split("\n");
        if (lines.every((line) => /^[-*] /.test(line))) {
          return <ul key={index}>{lines.map((line, itemIndex) => <li key={itemIndex}>{renderInlineMarkdown(line.slice(2))}</li>)}</ul>;
        }
        return <p key={index}>{lines.map((line, lineIndex) => <React.Fragment key={lineIndex}>{lineIndex ? <br /> : null}{renderInlineMarkdown(line)}</React.Fragment>)}</p>;
      })}
    </div>
  );
}

function DocumentBody({document, includeSummary = true}: {document: Document; includeSummary?: boolean}) {
  const summary = document.summary || document.excerpt;
  if (!document.content && (!includeSummary || !summary) && !document.imageSrc) return null;
  return (
    <section className={styles.bodySection} aria-label="Contenido del documento">
      {includeSummary && summary ? <p className={styles.summaryBlock}>{summary}</p> : null}
      {document.imageSrc ? <figure className={styles.documentImage}><img src={document.imageSrc} alt={`Ilustración de ${document.title}`} /></figure> : null}
      {document.content ? <MarkdownContent content={document.content} /> : null}
    </section>
  );
}

function formatEntryNumber(entry: Document, index: number): string {
  const marker = entry.chapterNumber ?? entry.order;
  return marker === undefined ? String(index + 1).padStart(2, "0") : String(marker).padStart(2, "0");
}

function CollectionContents({collection}: {collection: Document}) {
  const entries = getPublicChildDocuments(collection.id);
  if (!entries.length) return null;
  return (
    <section className={styles.collectionContents} aria-labelledby="collection-contents-title">
      <div className={styles.sectionHeadingEditorial}><span>Índice</span><h2 id="collection-contents-title">Contenido</h2></div>
      <ol className={styles.entryList}>
        {entries.map((entry, index) => (
          <li key={entry.id}>
            <Link className={styles.entryLink} to={getDocumentPath(entry)}>
              <span className={styles.entryMarker}>{formatEntryNumber(entry, index)}</span>
              <span className={styles.entryBody}>
                <strong>{entry.chapterTitle || entry.title}</strong>
                {entry.chapterTitle && entry.title !== entry.chapterTitle ? <small>{entry.title}</small> : null}
              </span>
              <span className={styles.entryArrow} aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ReaderShell({document}: {document: Document}) {
  const kind = getDocumentKind(document);
  const parent = kind === "entry" ? getPublicParentDocument(document) : undefined;
  const summary = document.summary || document.excerpt;
  return (
    <Layout title={document.title} description={summary ?? "Documento de la campaña"}>
      <main className={styles.page}>
        <div className={styles.readerFrame}>
          <Link className={styles.backLink} to="/documents">← Archivo de documentos</Link>
          <article className={styles.reader} data-document-type={document.type} data-document-kind={kind}>
            <DocumentHeader document={document} parent={parent} />
            <DocumentMetadata document={document} />
            {kind === "collection" ? <>
              {summary ? <p className={styles.collectionSummary}>{summary}</p> : null}
              <DocumentBody document={document} includeSummary={false} />
              <CollectionContents collection={document} />
            </> : <DocumentBody document={document} />}
            <DocumentRelationshipsSection document={document} />
            {kind === "entry" ? <DocumentEntryNavigation document={document} /> : null}
          </article>
        </div>
      </main>
    </Layout>
  );
}

function UnavailableDocument() {
  return <Layout title="Documento no disponible" description="Documento no disponible"><main className={styles.page}><div className={styles.readerFrame}><Link className={styles.backLink} to="/documents">← Archivo de documentos</Link><section className={styles.emptyState}><h1>Documento no disponible</h1><p>No existe un documento público publicado para esta dirección.</p></section></div></main></Layout>;
}

export default function DocumentReaderPage({documentId}: DocumentReaderPageProps = {}): React.ReactElement {
  const location = useLocation();
  const document = getPublicDocumentById(documentId ?? getDocumentIdFromPath(location.pathname));
  return document ? <ReaderShell document={document} /> : <UnavailableDocument />;
}
