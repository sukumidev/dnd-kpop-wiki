import React from 'react';
import Link from '@docusaurus/Link';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

type Props = {
  href: string;
  name: string;
  originalName: string;
  description?: string;
  imageSrc?: string | null;
  count?: number;
  badge?: string;
};

export default function DirectoryCard({
  href, name, originalName, description, imageSrc, count, badge,
}: Props) {
  const {withBaseUrl} = useBaseUrlUtils();

  return (
    <Link to={withBaseUrl(href)} className={styles.cardLink} aria-label={`Ver ${name}`}>
      <article className={styles.card}>
        <div className={styles.cardArt}>
          {imageSrc ? (
            <img src={withBaseUrl(imageSrc)} alt="" loading="lazy" className={styles.cardImage} />
          ) : (
            <span className={styles.cardGlyph} aria-hidden="true">✦</span>
          )}
        </div>
        <div className={styles.cardBody}>
          <span className={styles.cardOriginal}>{originalName}</span>
          <h3 className={styles.cardTitle}>{name}</h3>
          {description && <p className={styles.cardDescription}>{description}</p>}
          <div className={styles.cardFooter}>
            {typeof count === 'number' && count > 0 && (
              <span>{count} {count === 1 ? 'subclase' : 'subclases'}</span>
            )}
            {badge && <span className={styles.badge}>{badge}</span>}
            <span className={styles.cardArrow} aria-hidden="true">→</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
