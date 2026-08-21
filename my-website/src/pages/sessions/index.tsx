import React, {useMemo, useState} from "react";
import Heading from "@theme/Heading";
import SessionCard from "@site/src/components/SessionCard";
import WikiSidebarPageLayout from "@site/src/components/WikiSidebarPageLayout";
import {
  formatSessionDate,
  getSessionStartingLocation,
  sessionList,
} from "@site/src/data/sessions";
import styles from "./styles.module.css";

type SortOrder = "newest" | "oldest";

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX");
}

export default function SessionsIndex(): React.ReactElement {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const visibleSessions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query.trim());

    return sessionList
      .filter((session) => {
        if (!normalizedQuery) return true;

        const startingLocation = getSessionStartingLocation(session);
        const searchableText = normalizeSearchValue([
          session.number,
          `sesion ${session.number}`,
          session.title,
          session.sessionDate,
          session.sessionDate ? formatSessionDate(session.sessionDate) : undefined,
          session.campaignDate,
          startingLocation,
        ].filter(Boolean).join(" "));

        return searchableText.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const dateDifference = (b.sessionDate ? new Date(b.sessionDate).getTime() : 0)
          - (a.sessionDate ? new Date(a.sessionDate).getTime() : 0);
        const newestFirst = dateDifference || b.number - a.number;
        return sortOrder === "newest" ? newestFirst : -newestFirst;
      });
  }, [query, sortOrder]);

  return (
    <WikiSidebarPageLayout
      title="Crónica de sesiones"
      description="El registro de las aventuras de los Panes del Destino.">
      <main className={styles.page}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <div className={styles.kicker}>Archivo de campaña</div>
            <Heading as="h1" className={styles.title}>Crónica de sesiones</Heading>
            <p className={styles.subtitle}>
              El registro de las aventuras de los Panes del Destino.
            </p>
          </header>

          <div className={styles.toolbar} aria-label="Herramientas de la crónica">
            <label className={styles.search}>
              <span className="sr-only">Buscar sesiones</span>
              <span className={styles.searchIcon} aria-hidden="true">⌕</span>
              <input
                className={styles.searchInput}
                type="search"
                placeholder="Buscar sesión, lugar o título…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <label>
              <span className="sr-only">Ordenar sesiones</span>
              <select
                className={styles.orderSelect}
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
                <option value="newest">Más recientes primero</option>
                <option value="oldest">Más antiguas primero</option>
              </select>
            </label>
          </div>

          {visibleSessions.length > 0 ? (
            <div className={styles.list} aria-live="polite">
              {visibleSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className={styles.empty} role="status">
              <div>
                <span className={styles.emptyMark} aria-hidden="true">◇</span>
                <Heading as="h2" className={styles.emptyTitle}>
                  Ningún capítulo coincide
                </Heading>
                <p className={styles.emptyText}>
                  Prueba con otro número, título, fecha o lugar de inicio.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </WikiSidebarPageLayout>
  );
}
