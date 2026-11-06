import React from 'react';
import Link from '@docusaurus/Link';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import WikiSidebarPageLayout from '@site/src/components/WikiSidebarPageLayout';
import {locationList} from '@site/src/data/locations';
import {getPublicRealmHref} from '@site/src/data/publicRoutes';
import directoryStyles from '../characters/styles.module.css';
import styles from './styles.module.css';

const realms = locationList
  .filter((location) =>
    location.type === 'region' &&
    location.visibility === 'public' &&
    location.status !== 'hidden' &&
    getPublicRealmHref(location.id),
  )
  .map((location) => ({
    ...location,
    href: getPublicRealmHref(location.id)!,
  }));

export default function WorldPage() {
  const {withBaseUrl} = useBaseUrlUtils();

  return (
    <WikiSidebarPageLayout title="World" description="Índice de los reinos de Hallyura">
      <main className={directoryStyles.page}>
        <div className="container">
          <header className={directoryStyles.pageHeader}>
            <div className={directoryStyles.headerContent}>
              <div className={directoryStyles.kicker}>Atlas de Hallyura</div>
              <h1 className={directoryStyles.pageTitle}>Índice de reinos</h1>
              <p className={directoryStyles.pageSubtitle}>
                Explora las naciones que dan forma a la historia de Hallyura.
              </p>
            </div>
            <div className={directoryStyles.total} aria-label={`${realms.length} reinos`}>
              <strong>{realms.length}</strong>
              <span>reinos</span>
            </div>
          </header>

          <div className={styles.grid}>
            {realms.map((realm, index) => (
              <Link
                key={realm.id}
                to={withBaseUrl(realm.href)}
                className={styles.cardLink}
                aria-label={`Explorar ${realm.title}`}>
                <article className={styles.card}>
                  <div className={styles.cardArt} aria-hidden="true">
                    <span className={styles.cardNumber}>{String(index + 1).padStart(2, '0')}</span>
                    <span className={styles.cardSymbol}>✦</span>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardEyebrow}>Reino</div>
                    <h2 className={styles.cardTitle}>{realm.title}</h2>
                    {realm.profile?.nickname && (
                      <p className={styles.cardNickname}>{realm.profile.nickname}</p>
                    )}
                    {realm.summary && <p className={styles.cardSummary}>{realm.summary}</p>}
                    <span className={styles.cardAction}>Explorar reino <span aria-hidden="true">→</span></span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </WikiSidebarPageLayout>
  );
}
