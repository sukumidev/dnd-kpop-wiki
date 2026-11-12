import React, { useMemo, useState } from "react";
import Bookshelf from "@site/src/components/documents/Bookshelf";
import WikiSidebarPageLayout from "@site/src/components/WikiSidebarPageLayout";
import {
  DOCUMENT_TYPES,
  filterDocumentsByType,
  getDocumentTypeLabel,
  getPublicTopLevelDocuments,
  searchDocuments,
  type Document,
  type DocumentType,
} from "@site/src/data/documents";
import { getLibraryMetadata, groupLibraryDocuments } from "@site/src/data/library";
import styles from "./styles.module.css";

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon} aria-hidden="true">
        Archivo
      </div>
      <h2>No hay volúmenes públicos todavía</h2>
      <p>
        Cuando haya documentos publicados y visibles en la Biblioteca, aparecerán aquí.
      </p>
    </div>
  );
}

function NoMatchesState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon} aria-hidden="true">
        Filtros
      </div>
      <h2>No hay volúmenes que coincidan</h2>
      <p>Prueba con otro título, palabra o tipo para seguir explorando.</p>
    </div>
  );
}

function getTypeOptions(documents: Document[]): DocumentType[] {
  const availableTypes = new Set(documents.map((document) => document.type));
  return DOCUMENT_TYPES.filter((type) => availableTypes.has(type));
}

export default function DocumentsPage(): React.ReactElement {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "all">("all");

  const topLevelDocuments = useMemo(() => getPublicTopLevelDocuments().filter((document) => !getLibraryMetadata(document).hidden), []);
  const typeOptions = useMemo(() => getTypeOptions(topLevelDocuments), [topLevelDocuments]);
  const filteredDocuments = useMemo(() => {
    return searchDocuments(filterDocumentsByType(topLevelDocuments, typeFilter), query);
  }, [query, topLevelDocuments, typeFilter]);

  const shelves = useMemo(() => groupLibraryDocuments(filteredDocuments), [filteredDocuments]);
  const hasPublicDocuments = topLevelDocuments.length > 0;
  const hasFilteredDocuments = filteredDocuments.length > 0;

  return (
    <WikiSidebarPageLayout
      title="Biblioteca"
      description="Biblioteca de documentos y colecciones hallados durante la campaña"
    >
      <main className={styles.page}>
        <div className="container">
          <header className={styles.pageHeader}>
            <div className={styles.pageEyebrow}>✦ &nbsp; Archivo de la campaña &nbsp; ✦</div>
            <div className={styles.headerRow}>
              <div>
                <h1 className={styles.pageTitle}>Biblioteca de Hallyura</h1>
                <p className={styles.pageSubtitle}>
                  Recorre los estantes y abre los volúmenes de la aventura. Cada reino reúne
                  los hallazgos cuya procedencia está registrada; los demás conservan su
                  ubicación sin atribuciones inventadas.
                </p>
              </div>
              <div className={styles.countBadge}>
                {topLevelDocuments.length}{" "}
                {topLevelDocuments.length === 1 ? "volumen" : "volúmenes"}
              </div>
            </div>
          </header>

          {hasPublicDocuments ? (
            <>
              <section className={styles.filters} aria-label="Filtros de documentos">
                <label className={styles.filterField}>
                  <span>Buscar</span>
                  <input
                    className={styles.filterInput}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Titulo o resumen"
                  />
                </label>

                <label className={styles.filterField}>
                  <span>Tipo</span>
                  <select
                    className={styles.filterInput}
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value as DocumentType | "all")}
                  >
                    <option value="all">Todos</option>
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {getDocumentTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </label>
              </section>

              {hasFilteredDocuments ? (
                <div className={styles.library} aria-label="Estanterías de la Biblioteca">
                  {shelves.map((shelf) => <Bookshelf key={shelf.id} shelf={shelf} />)}
                </div>
              ) : (
                <NoMatchesState />
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </WikiSidebarPageLayout>
  );
}
