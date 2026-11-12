import React from 'react';
import CharacterGrid from '@site/src/components/CharacterGrid';
import {getCharacterClass, getCharacterSubclass, resolveCharacterSubclass} from '@site/src/data/characterClasses';
import {getCharactersForClass} from '@site/src/data/classCharacters';
import styles from './styles.module.css';

type ClassProps = {classId: string};
type SubclassProps = ClassProps & {subclassId: string};

/**
 * These small components provide content between actual MDX headings.
 * Docusaurus only indexes headings authored in MDX; React-rendered headings
 * do not populate the native right-hand table of contents.
 */
export function ClassHeader({classId}: ClassProps) {
  const characterClass = getCharacterClass(classId);
  if (!characterClass) return <p>Clase no registrada.</p>;

  return (
    <header className={styles.pageHeader}>
      <span className={styles.eyebrow}>
        {classId === 'blood-hunter' ? 'Clase · material de terceros' : 'Clase · D&D 5.5e'}
      </span>
      <h1 className={styles.pageTitle}>{characterClass.name}</h1>
      <p className={styles.originalName}>{characterClass.originalName}</p>
      {characterClass.description && <p className={styles.lead}>{characterClass.description}</p>}
      {characterClass.source && <p className={styles.source}><strong>Procedencia:</strong> {characterClass.source}</p>}
    </header>
  );
}

export function ClassDetails({classId}: ClassProps) {
  const characterClass = getCharacterClass(classId);
  if (!characterClass) return <p>Clase no registrada.</p>;

  const hasDetails = Boolean(
    characterClass.hitDie || characterClass.primaryAbilities?.length || characterClass.savingThrows?.length,
  );
  if (!hasDetails) {
    return <p className={styles.emptyState}>La información mecánica de esta clase está pendiente de incorporación.</p>;
  }

  return (
    <dl className={styles.facts}>
      {characterClass.hitDie && <div><dt>Dado de golpe</dt><dd>d{characterClass.hitDie}</dd></div>}
      {Boolean(characterClass.primaryAbilities?.length) && (
        <div><dt>Características principales</dt><dd>{characterClass.primaryAbilities?.join(', ')}</dd></div>
      )}
      {Boolean(characterClass.savingThrows?.length) && (
        <div><dt>Tiradas de salvación</dt><dd>{characterClass.savingThrows?.join(', ')}</dd></div>
      )}
    </dl>
  );
}

export function ClassSubclass({classId, subclassId}: SubclassProps) {
  const subclass = getCharacterSubclass(classId, subclassId);
  if (!subclass) return <p className={styles.emptyState}>Subclase no registrada para Hallyura.</p>;

  return (
    <section className={styles.subclassArticle} aria-label={`Información de ${subclass.name}`}>
      {subclass.contentCategory === 'partner' && <span className={styles.badge}>Material de terceros</span>}
      {subclass.isHomebrew && <span className={styles.badge}>Homebrew</span>}
      {subclass.description && <p className={styles.subclassDescription}>{subclass.description}</p>}
      {subclass.source && <p className={styles.subclassMetadata}><strong>Fuente:</strong> {subclass.source}</p>}
      {Boolean(subclass.aliases?.length) && (
        <p className={styles.subclassMetadata}>
          <strong>Nombres anteriores:</strong> {subclass.aliases?.join(', ')}
        </p>
      )}
      {Boolean(subclass.features?.length) && (
        <div className={styles.subclassFeatures}>
          {subclass.features?.map((feature, index) => (
            <section key={`${feature.level}-${index}`} className={styles.subclassFeature}>
              <h4>Nivel {feature.level}: {feature.name}</h4>
              <p>{feature.description}</p>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

export function ClassCharacters({classId}: ClassProps) {
  const characterClass = getCharacterClass(classId);
  if (!characterClass) return <p>Clase no registrada.</p>;

  const classCharacters = getCharactersForClass(classId);
  if (!classCharacters.length) {
    return <p className={styles.emptyState}>Aún no hay personajes registrados para esta clase.</p>;
  }

  const classLevels = new Map<string, number>();
  const classSubclasses = new Map<string, string>();
  for (const {character, level, subclass} of classCharacters) {
    if (level !== undefined) classLevels.set(character.id, level);
    if (subclass) classSubclasses.set(character.id, resolveCharacterSubclass(classId, subclass)?.name ?? subclass);
  }

  return (
    <div className={styles.classCharacters}>
      <span className={styles.countPill}>{classCharacters.length} personajes</span>
      <CharacterGrid
        characters={classCharacters.map(({character}) => character)}
        classLevels={classLevels}
        classSubclasses={classSubclasses}
        largeCards
        label={`Personajes de la clase ${characterClass.name}`}
      />
    </div>
  );
}
