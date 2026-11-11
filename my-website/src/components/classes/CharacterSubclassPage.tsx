import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {getCharacterClass, getCharacterClassHref, getCharacterSubclass} from '@site/src/data/characterClasses';
import styles from './styles.module.css';

type Props = {classId: string; subclassId: string; children?: ReactNode};

/** Use in an MDX document at mechanics/classes/[classId]/[subclassId]. */
export default function CharacterSubclassPage({classId, subclassId, children}: Props) {
  const characterClass = getCharacterClass(classId);
  const subclass = getCharacterSubclass(classId, subclassId);
  if (!characterClass || !subclass) return <p>Subclase no registrada para Hallyura.</p>;

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Ruta de navegación">
        <Link to="/mechanics">Mecánicas</Link><span aria-hidden="true">/</span>
        <Link to="/mechanics/classes">Clases</Link><span aria-hidden="true">/</span>
        <Link to={getCharacterClassHref(classId)}>{characterClass.name}</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{subclass.name}</span>
      </nav>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>Subclase de {characterClass.name}</span>
        <h1 className={styles.pageTitle}>{subclass.name}</h1>
        <p className={styles.originalName}>{subclass.originalName}</p>
        {subclass.contentCategory === 'partner' && <span className={styles.badge}>Terceros</span>}
        {subclass.isHomebrew && <span className={styles.badge}>Homebrew</span>}
        {subclass.description && <p className={styles.lead}>{subclass.description}</p>}
      </header>
      {subclass.source && <p className={styles.source}><strong>Fuente:</strong> {subclass.source}</p>}
      {Boolean(subclass.aliases?.length) && <p className={styles.source}><strong>Nombres anteriores:</strong> {subclass.aliases?.join(', ')}</p>}
      {!children && <p className={styles.emptyState}>Ficha de referencia registrada en Hallyura. Las características mecánicas por nivel se documentarán más adelante; consulta el suplemento citado para las reglas completas.</p>}
      {children && <section className={styles.section} aria-label="Características por nivel">{children}</section>}
    </div>
  );
}
