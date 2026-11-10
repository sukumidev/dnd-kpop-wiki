import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  characterClasses,
  characterSubclasses,
  getCharacterClass,
  getCharacterSubclass,
} from '../src/data/characterClasses';

test('the class directory keeps the approved order and has a document for each class', () => {
  assert.deepEqual(characterClasses.map(({id}) => id), [
    'barbaro', 'bardo', 'clerigo', 'druida', 'guerrero', 'hechicero', 'mago',
    'monje', 'paladin', 'picaro', 'ranger', 'warlock', 'artifice',
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
