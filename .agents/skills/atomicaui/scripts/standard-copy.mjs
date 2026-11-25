// `node scripts/standard-copy.mjs <your static files folder>`
// For an app built without the React parts. Copies what a page loads to <folder>/aui/:
// the AtomicAUI stylesheet, the page setup, the light and dark switch, and the fonts.
// Run it again after a kit update. Never edit the copied files (AUI-06): the standard check compares them.
import fs from 'node:fs';
import path from 'node:path';
import { copyStandard, loadStandard } from './standard-lib.mjs';
import { ensureIconKit } from './icon-kit.mjs';

const target = process.argv[2];
if (!target || target.startsWith('--')) {
  console.error('standard-copy: say where your static files are, for example: node scripts/standard-copy.mjs wwwroot');
  process.exit(1);
}
const folder = path.resolve(target);
if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
  console.error(`standard-copy: ${folder} is not a folder. Create it first, or give the folder your app serves static files from.`);
  process.exit(1);
}
const written = copyStandard(folder);
console.log(`standard-copy: ${written.length} files in ${path.join(target, 'aui')}/ (${written.filter((name) => !name.startsWith('fonts/')).join(', ')}, and ${written.filter((name) => name.startsWith('fonts/')).length} fonts).
Next: set up your page as ${loadStandard().where}/start.md says (two <link> lines, one <script>, four attributes on <html>).`);
const icons = ensureIconKit(folder, { write: true });
if (icons.added.length > 0) console.log(`standard-copy: added the AtomicAUI Global Kit (icons) to ${icons.added.length} page(s) here. Pages elsewhere (layouts, views): node scripts/icon-kit.mjs <app folder>.`);
else console.log('Icons: node scripts/icon-kit.mjs <app folder> adds the AtomicAUI Global Kit to every page that lacks it.');
