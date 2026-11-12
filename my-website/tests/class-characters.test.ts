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
    hero: {id: 'hero', classes: [{name: 'Paladin', level: 6}]},
  }, {hero: character});

  assert.deepEqual(result, [{character, level: 6}]);
  assert.equal(resolveClassId('  BÁRBARO  '), 'barbaro');
  assert.equal(resolveClassId('Fighter'), 'guerrero');
  assert.equal(resolveClassId('Blood Hunter'), 'blood-hunter');
});

test('includes multiclass characters in each class with separate levels', () => {
  const character = profile('multiclass');
  const blocks = {
    multiclass: {id: 'multiclass', classes: [
      {name: 'Druid', level: 3}, {name: 'Bard', level: 5},
    ]},
  };
  const profiles = {multiclass: character};

  assert.deepEqual(resolveCharactersForClass('druida', blocks, profiles), [{character, level: 3}]);
  assert.deepEqual(resolveCharactersForClass('bardo', blocks, profiles), [{character, level: 5}]);
});

test('deduplicates multiple statblocks and uses an explicitly recorded class level', () => {
  const character = profile('hero');
  const result = resolveCharactersForClass('mago', {
    first: {id: 'hero', classes: [{name: 'Wizard', level: 4}]},
    second: {id: 'hero', classes: [{name: 'mago', level: 6}, {name: 'Wizard', level: 6}]},
  }, {hero: character});

  assert.deepEqual(result, [{character, level: 6}]);
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

  for (const characterClass of characterClasses) {
    for (const {character} of getCharactersForClass(characterClass.id)) {
      assert.ok(existsSync(path.join('docs', 'characters', character.group, `${character.id}.mdx`)),
        `${characterClass.id}: missing profile for ${character.id}`);
    }
  }
});

test('uses the approved Mark multiclass and retains subclass provenance from statblocks', () => {
  const wizard = getCharactersForClass('mago').find(({character}) => character.id === 'nct-mark');
  const artificer = getCharactersForClass('artifice').find(({character}) => character.id === 'nct-mark');
  assert.equal(wizard?.level, 13);
  assert.equal(wizard?.subclass, 'Abjurer');
  assert.equal(artificer?.level, 3);
  assert.equal(artificer?.subclass, 'Artillerist');
  const hunter = getCharactersForClass('blood-hunter').find(({character}) => character.id === 'skz-bangchan');
  assert.equal(hunter?.subclass, 'Order of the Lycan');
});
