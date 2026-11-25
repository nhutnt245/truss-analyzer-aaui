// `npm run screen:copy -- <name>`: makes a recipe yours. Copies the recipe's folder to src/screens/<last part of the name>/
// and points src/screens/index.ts at the copy. Edit the copy; the recipe stays read-only.
// Names: form, table, overview (the page recipes of the core); aras/shell, aras/search, aras/item (the Aras pack). shell, search and item still work and print "now aras/<name>".
// A page recipe's shared parts (the form field and its types) stay in the kit: the copy imports them by their full address and does not hold a second one.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packUse } from './pack-use.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NAMES = ['form', 'table', 'overview', 'aras/shell', 'aras/search', 'aras/item'];
/** Files of a page recipe that are shared parts: not copied, imported from where they are. */
const SHARED = { form: { 'FormField.tsx': '@/recipes/form/FormField', 'types.ts': '@/recipes/form/types' } };
const requested = process.argv[2];
const fail = (message) => {
  console.error(`screen:copy: ${message}`);
  process.exit(1);
};
const name = NAMES.includes(`aras/${requested}`) ? `aras/${requested}` : requested;
if (name !== requested) console.log(`screen:copy: ${requested} is now ${name}.`);
if (!NAMES.includes(name)) fail(`say which recipe: npm run screen:copy -- ${NAMES.join(' | ')}`);
const last = name.split('/').at(-1);
const from = path.join(root, name.startsWith('aras/') ? 'src/packs' : 'src/recipes', name.startsWith('aras/') ? name : last);
const to = path.join(root, 'src/screens', last);
if (fs.existsSync(to)) fail(`src/screens/${last}/ already exists. Edit the files there.`);
// The line in src/screens/index.ts that points at the kit's version: the pack's address, or the old address of kit 0.3.x.
// A page recipe has no such line: the copy is exported from the index as a new line.
const indexPath = path.join(root, 'src/screens/index.ts');
const page = ['form', 'table', 'overview'].includes(name);
const lineIn = (text) => [`from '@/packs/aras/${last}'`, `from '@/recipes/${last}'`].find((candidate) => text.includes(candidate));
// A pack screen needs the pack's data and routes: with the pack off, the one command turns it on first (the same as npm run pack:use -- aras),
// so `screen:copy -- item` or `-- search` works in a fresh app. The pack never overwrites a file you changed: it lists it and nothing is written.
if (!page && !lineIn(fs.readFileSync(indexPath, 'utf8'))) {
  const turnedOn = packUse(root, 'aras');
  console.log(turnedOn.lines.join('\n'));
  if (turnedOn.status !== 0) fail(`nothing was copied: the Aras pack could not be turned on (above). Merge those files by hand, run the npm run pack:use -- aras command it prints, then run this again.`);
}
const index = fs.readFileSync(indexPath, 'utf8');
const line = lineIn(index);
if (!line && !page) fail(`src/screens/index.ts has no line ${`from '@/packs/aras/${last}'`}, even with the pack on. Point the line at './${last}' by hand after the copy.`);
// The views a pack screen shows, by name: the pack's own lines (its evidence.views.json seed), at the shell addresses a copy is routed at.
// A copy is looked at in each of them: a screen no picture was made of has nothing to claim a look about.
const EVIDENCE = { 'aras/item': ['item', 'item-edit'], 'aras/search': ['search', 'search-selected'] };
const EVIDENCE_SEED = path.join(root, 'src/packs/aras/seed/evidence.views.json.seed');
/** Adds the views named that evidence.views.json lacks (by name), as the pack's seed writes them. Returns the names it added. The file is left as it is when nothing is missing or it is not a list. */
function addEvidenceViews(names) {
  const file = path.join(root, 'evidence.views.json');
  if (!names || !fs.existsSync(file)) return [];
  let list;
  try {
    list = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
  if (!Array.isArray(list)) return [];
  const views = JSON.parse(fs.readFileSync(EVIDENCE_SEED, 'utf8')).filter((view) => names.includes(view.name));
  const missing = views.filter((view) => !list.some((one) => one.name === view.name));
  if (missing.length === 0) return [];
  fs.writeFileSync(file, `${JSON.stringify([...list, ...missing], null, 1)}\n`);
  return missing.map((view) => view.name);
}
const shared = SHARED[name] ?? {};
fs.mkdirSync(to, { recursive: true });
const copied = [];
const styled = new Set();
for (const file of fs.readdirSync(from).sort()) {
  if (shared[file]) continue;
  let text = fs.readFileSync(path.join(from, file), 'utf8');
  if (/\.tsx?$/.test(file)) {
    // The shared kit parts stay in the kit: a copy imports them by their full address.
    text = text.replaceAll("'../shared/", "'@/recipes/shared/");
    for (const [sharedFile, address] of Object.entries(shared)) text = text.replaceAll(`'./${sharedFile.replace(/\.tsx?$/, '')}'`, `'${address}'`);
    for (const [, piece] of text.matchAll(/data-aui-styled="([^"]+)"/g)) styled.add(piece);
  }
  fs.writeFileSync(path.join(to, file), text);
  copied.push(`src/screens/${last}/${file}`);
}
fs.writeFileSync(indexPath, page ? `${index.replace(/\n*$/, '\n')}export * from './${last}';\n` : index.replace(line, `from './${last}'`));
const addedViews = addEvidenceViews(EVIDENCE[name]);
const sheets = [...styled].map((piece) => ` The copy holds the styled piece ${piece}: npm run verify:page writes evidence/styled-${piece}.md and fails until its lines marked "(you)" are filled (kit/style/proof.md).`).join('');
const switchImport = page ? ` Then import it from '@/screens' instead of '@/recipes/${last}'.` : '';
console.log(`screen:copy: copied ${copied.length} files:\n  ${copied.join('\n  ')}\nsrc/screens/index.ts now exports ./${last}.${switchImport} ${addedViews.length > 0 ? ` evidence.views.json: added ${addedViews.join(', ')}.` : ''} Edit the copy, then run npm run verify:page while you fix (npm run verify comes last).${copied.some((file) => file.endsWith('.test.tsx')) ? ` The copied test is yours: change its cases with the screen, delete a case your spec does not have, and run it alone with npm run test -- src/screens/${last}.` : ''}${sheets}`);
