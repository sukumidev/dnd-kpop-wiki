/**
 * Generate minimal MDX routes for the approved Hallyura subclass catalog.
 * Never overwrite a hand-edited route. Full rules text will be authored later.
 */
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {characterSubclasses} from '../src/data/characterClasses';

const root = path.resolve(process.cwd(), 'docs', 'mechanics', 'classes');
let created = 0;
for (const subclass of characterSubclasses) {
  const dir = path.join(root, subclass.classId);
  const destination = path.join(dir, `${subclass.id}.mdx`);
  if (existsSync(destination)) continue;
  mkdirSync(dir, {recursive: true});
  const mdx = [
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
  writeFileSync(destination, mdx, 'utf8');
  created += 1;
}
console.log(`Subclass routes: ${characterSubclasses.length} catalog entries, ${created} new MDX pages.`);
