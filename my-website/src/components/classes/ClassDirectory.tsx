import React from 'react';
import {characterClasses, getCharacterClassHref} from '@site/src/data/characterClasses';
import DirectoryCard from './DirectoryCard';
import styles from './styles.module.css';

export default function ClassDirectory() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>Mecánicas · D&amp;D 5.5e</span>
        <h1 className={styles.pageTitle}>Clases</h1>
        <p className={styles.lead}>Las 13 clases utilizadas en Hallyura. Consulta cada ficha para ver sus datos y las subclases aprobadas conforme se incorporen.</p>
      </header>
      <div className={styles.sectionHeading}>
        <h2>Directorio de clases</h2>
        <span className={styles.countPill}>{characterClasses.length} clases</span>
      </div>
      <div className={styles.grid}>
        {characterClasses.map((characterClass) => (
          <DirectoryCard
            key={characterClass.id}
            href={getCharacterClassHref(characterClass.id)}
            name={characterClass.name}
            originalName={characterClass.originalName}
            description={characterClass.description}
            imageSrc={characterClass.imageSrc}
            count={characterClass.subclassIds.length}
          />
        ))}
      </div>
    </div>
  );
}
