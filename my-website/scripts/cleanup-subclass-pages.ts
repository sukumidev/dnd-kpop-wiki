/**
 * Remove only the exact MDX placeholders created by the retired
 * generate-subclass-pages.ts script. Keep custom/edited files untouched.
 */
import {existsSync, readFileSync, readdirSync, rmSync, rmdirSync} from 'node:fs';
import path from 'node:path';
import {characterSubclasses} from '../src/data/characterClasses';

const root = path.resolve(process.cwd(), 'docs', 'mechanics', 'classes');
let removed = 0;
let preserved = 0;

for (const subclass of characterSubclasses) {
  const dir = path.join(root, subclass.classId);
  const destination = path.join(dir, `${subclass.id}.mdx`);
  if (!existsSync(destination)) continue;

  const generated = [
    '---',
    'hide_title: true',
    'hide_table_of_contents: true',
    '---',
    '',
    "import CharacterSubclassPage from '@site/src/components/classes/CharacterSubclassPage';",
    '',
    `<CharacterSubclassPage classId="${subclass.classId}" subclassId="${subclass.id}" />`,
    '',
  ].join('\n');

  if (readFileSync(destination, 'utf8').trim() !== generated.trim()) {
    preserved += 1;
    continue;
  }

  rmSync(destination);
  removed += 1;
  if (readdirSync(dir).length === 0) rmdirSync(dir);
}

console.log(`Legacy generated subclass routes cleaned: ${removed}; hand-edited routes preserved: ${preserved}.`);
