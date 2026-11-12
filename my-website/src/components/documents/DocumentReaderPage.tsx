import React from "react";
import Link from "@docusaurus/Link";
import {useLocation} from "@docusaurus/router";
import WikiSidebarPageLayout from "@site/src/components/WikiSidebarPageLayout";
import {
  getDocumentKind,
  getPublicDocumentById,
  getPublicParentDocument,
  type Document,
} from "@site/src/data/documents";
import DocumentCollectionContents from "./DocumentCollectionContents";
import DocumentEntryNavigation from "./DocumentEntryNavigation";
import DocumentMetadata from "./DocumentMetadata";
import DocumentNarrative from "./DocumentNarrative";
import DocumentReaderHeader from "./DocumentReaderHeader";
import DocumentRelationshipsSection from "./DocumentRelationshipsSection";
import {selectDocumentNarrativeContent} from "./documentContent";
import styles from "@site/src/pages/documents/styles.module.css";

type DocumentReaderPageProps = {
  documentId?: string;
  content?: React.ReactNode | React.ComponentType;
};

function getDocumentIdFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return decodeURIComponent(segments[segments.length - 1] ?? "");
}

function DocumentBody({document, content, includeSummary = true}: {
  document: Document;
  content?: React.ReactNode | React.ComponentType;
  includeSummary?: boolean;
}) {
  const compiledContent = typeof content === "function" ? React.createElement(content) : content;
  const narrative = selectDocumentNarrativeContent(document, compiledContent);
  const summary = document.summary || document.excerpt;
  const showSummary = includeSummary && !!summary && !(narrative.kind === "legacy" && narrative.content.includes(summary));
  if (narrative.kind === "none" && !showSummary && !document.imageSrc) return null;
  return (
    <section className={styles.bodySection} aria-label="Contenido del documento">
      {showSummary ? <p className={styles.summaryBlock}>{summary}</p> : null}
      {document.imageSrc ? <figure className={styles.documentImage}><img src={document.imageSrc} alt={`Ilustración de ${document.title}`} /></figure> : null}
      <DocumentNarrative document={document} narrative={narrative} />
    </section>
  );
}

function ReaderShell({document, content}: {document: Document; content?: React.ReactNode | React.ComponentType}) {
  const kind = getDocumentKind(document);
  const parent = kind === "entry" ? getPublicParentDocument(document) : undefined;
  const summary = document.summary || document.excerpt;
  return (
    <WikiSidebarPageLayout title={document.title} description={summary ?? "Documento de la campaña"}>
      <main className={styles.page}>
        <div className={styles.readerFrame}>
          <Link className={styles.backLink} to="/documents">← Biblioteca</Link>
          <article className={styles.reader} data-document-type={document.type} data-document-kind={kind}>
            <DocumentReaderHeader document={document} parent={parent} />
            <DocumentMetadata document={document} />
            {kind === "collection" ? <>
              {summary ? <p className={styles.collectionSummary}>{summary}</p> : null}
              <DocumentBody document={document} content={content} includeSummary={false} />
              <DocumentCollectionContents collection={document} />
            </> : <DocumentBody document={document} content={content} />}
            <DocumentRelationshipsSection document={document} />
            {kind === "entry" ? <DocumentEntryNavigation document={document} /> : null}
          </article>
        </div>
      </main>
    </WikiSidebarPageLayout>
  );
}

function UnavailableDocument() {
  return <WikiSidebarPageLayout title="Documento no disponible" description="Documento no disponible">
    <main className={styles.page}><div className={styles.readerFrame}>
      <Link className={styles.backLink} to="/documents">← Biblioteca</Link>
      <section className={styles.emptyState}><h1>Documento no disponible</h1><p>No existe un documento público publicado para esta dirección.</p></section>
    </div></main>
  </WikiSidebarPageLayout>;
}

export default function DocumentReaderPage({documentId, content}: DocumentReaderPageProps = {}): React.ReactElement {
  const location = useLocation();
  const document = getPublicDocumentById(documentId ?? getDocumentIdFromPath(location.pathname));
  return document ? <ReaderShell document={document} content={content} /> : <UnavailableDocument />;
}
