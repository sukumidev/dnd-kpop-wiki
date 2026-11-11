import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {characterClasses} from '../src/data/characterClasses';
import {
  getCharactersForClass,
  resolveCharactersForClass,
  resolveClassId,
} from '../src/data/classCharacters';
import type {Character} from '../src/data/characters';

function profile(id: string, overrides: Partial<Character> = {}): Character {
  return {id, title: id, group: 'npc', status: 'active', visibility: 'public', ...overrides};
}

test('resolves one class by its statblock entry and keeps its recorded level', () => {
  const character = profile('hero');
  const result = resolveCharactersForClass('paladin', {
    hero: {id: 'hero', classes: [{name: 'Paladin', level: 6, subclass: 'Oath of Devotion'}]},
  }, {hero: character});

  assert.deepEqual(result, [{character, level: 6, subclass: 'Oath of Devotion'}]);
  assert.equal(resolveClassId('  BÁRBARO  '), 'barbaro');
  assert.equal(resolveClassId('Fighter'), 'guerrero');
  assert.equal(resolveClassId('Blood Hunter'), undefined);
});

test('includes multiclass characters in each class with separate levels', () => {
  const character = profile('multiclass');
  const blocks = {
    multiclass: {id: 'multiclass', classes: [
      {name: 'Druid', level: 3, subclass: 'Circle of Stars'},
      {name: 'Bard', level: 5, subclass: 'College of the Moon'},
    ]},
  };
  const profiles = {multiclass: character};

  assert.deepEqual(resolveCharactersForClass('druida', blocks, profiles), [
    {character, level: 3, subclass: 'Circle of Stars'},
  ]);
  assert.deepEqual(resolveCharactersForClass('bardo', blocks, profiles), [
    {character, level: 5, subclass: 'College of the Moon'},
  ]);
});

test('deduplicates statblocks and keeps the subclass from the selected class level', () => {
  const character = profile('hero');
  const result = resolveCharactersForClass('mago', {
    first: {id: 'hero', classes: [{name: 'Wizard', level: 4, subclass: 'Evoker'}]},
    second: {id: 'hero', classes: [{name: 'mago', level: 6, subclass: 'Abjurer'}]},
  }, {hero: character});

  assert.deepEqual(result, [{character, level: 6, subclass: 'Abjurer'}]);
  assert.deepEqual(resolveCharactersForClass('mago', {
    first: {id: 'hero', classes: [{name: 'Wizard', level: 4, subclass: 'Evoker'}]},
    second: {id: 'hero', classes: [{name: 'Wizard', level: 6}]},
  }, {hero: character}), [{character, level: 6}]);
  assert.deepEqual(resolveCharactersForClass('mago', {
    first: {id: 'hero', classes: [{name: 'Wizard', level: 6, subclass: 'Evoker'}]},
    second: {id: 'hero', classes: [{name: 'Wizard', level: 6, subclass: 'Abjurer'}]},
  }, {hero: character}), [{character, level: 6}]);
});

test('skips missing profiles and unidentifiable classes without inventing levels', () => {
  const valid = profile('valid');
  const result = resolveCharactersForClass('paladin', {
    missingId: {classes: [{name: 'Paladin', level: 4}]},
    missingProfile: {id: 'other', classes: [{name: 'Paladin', level: 4}]},
    noClasses: {id: 'valid'},
    unknownClass: {id: 'valid', classes: [{name: 'Blood Hunter', level: 4}]},
    malformedClass: {id: 'valid', classes: [{level: 4}]},
    incompleteLevel: {id: 'valid', classes: [{name: 'Paladin', level: '4'}]},
    noPage: {id: 'unpublished', classes: [{name: 'Paladin', level: 2}]},
  }, {valid, unpublished: profile('unpublished', {hasProfile: false})});

  assert.deepEqual(result, [{character: valid, level: undefined}]);
  assert.deepEqual(resolveCharactersForClass('unknown-id', {
    valid: {id: 'valid', classes: [{name: 'Paladin', level: 4}]},
  }, {valid}), []);
});

test('current statblocks resolve multiclass levels and linked character profiles', () => {
  const druid = getCharactersForClass('druida').find(({character}) => character.id === 'pc-kao');
  const bard = getCharactersForClass('bardo').find(({character}) => character.id === 'pc-kao');
  assert.equal(druid?.level, 3);
  assert.equal(bard?.level, 3);
  assert.equal(druid?.subclass, 'Circle of Stars');
  assert.equal(bard?.subclass, 'College of the Moon');
  assert.equal(getCharactersForClass('mago').find(({character}) => character.id === 'nct-mark')?.subclass, 'Abjurer');
  assert.equal(getCharactersForClass('artifice').find(({character}) => character.id === 'nct-mark')?.subclass, undefined);

  for (const characterClass of characterClasses) {
    for (const {character} of getCharactersForClass(characterClass.id)) {
      assert.ok(existsSync(path.join('docs', 'characters', character.group, `${character.id}.mdx`)),
        `${characterClass.id}: missing profile for ${character.id}`);
    }
  }
});
