import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  characterClasses,
  characterSubclasses,
  getCharacterClass,
  getCharacterSubclass,
  resolveCharacterSubclass,
} from '../src/data/characterClasses';

test('the class directory keeps the approved order and has a document for each class', () => {
  assert.deepEqual(characterClasses.map(({id}) => id), [
    'barbaro', 'bardo', 'clerigo', 'druida', 'guerrero', 'hechicero', 'mago',
    'monje', 'paladin', 'picaro', 'ranger', 'warlock', 'artifice', 'blood-hunter',
  ]);

  for (const characterClass of characterClasses) {
    assert.match(characterClass.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(existsSync(path.join('docs', 'mechanics', 'classes', `${characterClass.id}.mdx`)));
  }
  assert.equal(getCharacterClass('artifice')?.source, 'Material complementario compatible con D&D 5.5e');
});

test('registered subclass IDs resolve to one approved class and document route', () => {
  assert.equal(new Set(characterSubclasses.map(({id}) => id)).size, characterSubclasses.length);

  for (const subclass of characterSubclasses) {
    const characterClass = getCharacterClass(subclass.classId);
    assert.ok(characterClass, `${subclass.id}: unknown class`);
    assert.ok(characterClass.subclassIds.includes(subclass.id), `${subclass.id}: class is missing its ID`);
    assert.equal(getCharacterSubclass(subclass.classId, subclass.id), subclass);
    assert.ok(existsSync(path.join('docs', 'mechanics', 'classes', subclass.classId, `${subclass.id}.mdx`)));
  }

  for (const characterClass of characterClasses) {
    assert.equal(new Set(characterClass.subclassIds).size, characterClass.subclassIds.length);
    for (const subclassId of characterClass.subclassIds) {
      assert.ok(getCharacterSubclass(characterClass.id, subclassId), `${characterClass.id}: unknown ${subclassId}`);
    }
  }
});


test('all 14 classes expose valid core traits and cite their rules source', () => {
  for (const entry of characterClasses) {
    assert.ok(entry.description?.length, `${entry.id}: missing description`);
    assert.ok([6, 8, 10, 12].includes(entry.hitDie ?? 0), `${entry.id}: invalid hit die`);
    assert.ok(entry.primaryAbilities?.length, `${entry.id}: missing primary abilities`);
    assert.equal(entry.savingThrows?.length, 2, `${entry.id}: expected two saving throws`);
    assert.ok(entry.source, `${entry.id}: missing source`);
  }
  assert.equal(getCharacterClass('mago')?.hitDie, 6);
  assert.deepEqual(getCharacterClass('picaro')?.savingThrows, ['Destreza', 'Inteligencia']);
  assert.deepEqual(getCharacterClass('artifice')?.savingThrows, ['Constitución', 'Inteligencia']);
});

test('all 119 approved canonical subclasses have provenance and valid class IDs', () => {
  assert.equal(characterSubclasses.length, 119);
  assert.equal(characterClasses.length, 14);
  assert.equal(new Set(characterSubclasses.map(({id}) => id)).size, 119);
  for (const subclass of characterSubclasses) {
    assert.ok(subclass.source, `${subclass.id} lacks a source`);
    assert.ok(['official', 'partner', 'homebrew'].includes(subclass.contentCategory ?? ''), subclass.id);
    assert.ok(getCharacterClass(subclass.classId), `${subclass.id} has an unknown parent`);
  }
  assert.equal(getCharacterClass('blood-hunter')?.subclassIds.length, 4);
  assert.equal(resolveCharacterSubclass('barbaro', 'Path of the Totem Warrior')?.name, 'Path of the Wild Heart');
  assert.equal(resolveCharacterSubclass('mago', 'School of Divination')?.name, 'Diviner');
  assert.equal(resolveCharacterSubclass('warlock', 'Great Old One Patron')?.name, 'Great Old One Patron');
  assert.equal(resolveCharacterSubclass('mago', 'Vestige Patron'), undefined);
  assert.equal(getCharacterClass('barbaro')?.subclassIds.includes('path-of-the-world-tree'), true);
});
