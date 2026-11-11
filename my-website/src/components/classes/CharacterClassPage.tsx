import React, {type ReactNode} from 'react';
import CharacterGrid from '@site/src/components/CharacterGrid';
import {getCharacterClass, getCharacterSubclassHref, getClassSubclasses, resolveCharacterSubclass} from '@site/src/data/characterClasses';
import {getCharactersForClass} from '@site/src/data/classCharacters';
import DirectoryCard from './DirectoryCard';
import styles from './styles.module.css';

type Props = {classId: string; children?: ReactNode};

export default function CharacterClassPage({classId, children}: Props) {
  const characterClass = getCharacterClass(classId);
  if (!characterClass) return <p>Clase no registrada.</p>;

  const subclasses = getClassSubclasses(characterClass);
  const classCharacters = getCharactersForClass(classId);
  const classLevels = new Map<string, number>();
  const classSubclasses = new Map<string, string>();
  for (const {character, level, subclass} of classCharacters) {
    if (level !== undefined) classLevels.set(character.id, level);
    if (subclass) classSubclasses.set(character.id, resolveCharacterSubclass(classId, subclass)?.name ?? subclass);
  }
  const hasDetails = Boolean(
    characterClass.hitDie || characterClass.primaryAbilities?.length || characterClass.savingThrows?.length,
  );

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>Clase · D&amp;D 5.5e</span>
        <h1 className={styles.pageTitle}>{characterClass.name}</h1>
        <p className={styles.originalName}>{characterClass.originalName}</p>
        {characterClass.description && <p className={styles.lead}>{characterClass.description}</p>}
        {characterClass.source && <p className={styles.source}><strong>Procedencia:</strong> {characterClass.source}</p>}
      </header>

      <section className={styles.section} aria-labelledby="class-details">
        <div className={styles.sectionHeading}><h2 id="class-details">Información de clase</h2></div>
        {hasDetails ? (
          <dl className={styles.facts}>
            {characterClass.hitDie && <div><dt>Dado de golpe</dt><dd>d{characterClass.hitDie}</dd></div>}
            {Boolean(characterClass.primaryAbilities?.length) && <div><dt>Características principales</dt><dd>{characterClass.primaryAbilities?.join(', ')}</dd></div>}
            {Boolean(characterClass.savingThrows?.length) && <div><dt>Tiradas de salvación</dt><dd>{characterClass.savingThrows?.join(', ')}</dd></div>}
          </dl>
        ) : <p className={styles.emptyState}>La información mecánica de esta clase está pendiente de incorporación.</p>}
      </section>

      <section className={styles.section} aria-labelledby="class-subclasses">
        <div className={styles.sectionHeading}><h2 id="class-subclasses">Subclases</h2></div>
        {subclasses.length ? (
          <div className={styles.grid}>
            {subclasses.map((subclass) => (
              <DirectoryCard
                key={subclass.id}
                href={getCharacterSubclassHref(classId, subclass.id)}
                name={subclass.name}
                originalName={subclass.originalName}
                description={subclass.description}
                imageSrc={subclass.imageSrc}
                badge={subclass.isHomebrew ? 'Homebrew' : undefined}
              />
            ))}
          </div>
        ) : <p className={styles.emptyState}>Aún no hay subclases aprobadas y registradas para esta clase.</p>}
      </section>

      <section className={styles.section} aria-labelledby="class-characters">
        <div className={styles.sectionHeading}>
          <h2 id="class-characters">Personajes de esta clase</h2>
          {classCharacters.length > 0 && <span className={styles.countPill}>{classCharacters.length}</span>}
        </div>
        {classCharacters.length ? (
          <CharacterGrid
            characters={classCharacters.map(({character}) => character)}
            classLevels={classLevels}
            classSubclasses={classSubclasses}
            largeCards
            label={`Personajes de la clase ${characterClass.name}`}
          />
        ) : <p className={styles.emptyState}>Aún no hay personajes registrados para esta clase.</p>}
      </section>

      {children && <section className={styles.section} aria-label="Contenido adicional de clase">{children}</section>}
    </div>
  );
}
