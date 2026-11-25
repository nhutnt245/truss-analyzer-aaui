// Prints the class list of a look, for a page built without the React parts. Nobody types a class list from memory.
//   node scripts/aui-class.mjs view '{"color":"surface","paint":"solid","shape":"soft","profile":"default","sx":{"display":"flex","gap":"8"}}'
//   node scripts/aui-class.mjs text '{"role":"l4","weight":"semi-bold"}'
// The look is the same object React takes in `aui` (for text: role, weight, color, sx). With "states" it prints one
// list per state; with "interactive": true it adds the state layer, for a native <button type="button"> or <a>.
// It refuses a class that is not in the stylesheet of this release, and says which looks our apps do not use.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// In the kit the rules and the stylesheet's class list are beside this script; in an app they are in the atomicaui skill beside this one.
const first = (candidates) => candidates.map((one) => path.resolve(here, one)).find((one) => fs.existsSync(one));
const rulesFile = first(['styled-rules.mjs', '../../atomicaui/scripts/styled-rules.mjs']);
const classesFile = first(['../kit/standard/classes.json', '../../atomicaui/references/standard/classes.json']);
const fail = (message) => {
  console.error(`aui-class: ${message}`);
  process.exit(1);
};
if (!rulesFile || !classesFile) fail('the atomicaui skill is not installed beside this one. Install both with the kit: node install.mjs <your app>.');
const { TEXT_ATTRIBUTES, loadProfile, outsideProfile, stateLooks, textClasses, usesOfType, usesOfView, viewClasses } = await import(pathToFileURL(rulesFile).href);

const [kind, json] = process.argv.slice(2);
if (!['view', 'text'].includes(kind) || !json) fail(`say what the element is and its look: node scripts/aui-class.mjs view '{"paint":"text","profile":"no-padding","sx":{"display":"flex","gap":"8"}}'  (or: text '{"role":"l4"}')`);
let look;
try {
  look = JSON.parse(json);
} catch (error) {
  fail(`the look is not JSON (${error.message}). Use double quotes: '{"gap":"8"}'.`);
}
const known = new Set(JSON.parse(fs.readFileSync(classesFile, 'utf8')).classes);
const profile = loadProfile(path.resolve(path.dirname(rulesFile), '..'));
const lists = kind === 'text' ? [['', textClasses(look), usesOfType(look)]] : stateLooks(look).map(([state, one]) => [state, viewClasses({ ...one, interactive: look.interactive }), usesOfView(one)]);
let failed = false;
for (const [state, names, uses] of lists) {
  const unknown = names.filter((name) => !known.has(name));
  if (unknown.length > 0) {
    console.error(`aui-class: not in the AtomicAUI stylesheet${state ? ` (${state})` : ''}: ${unknown.join(' ')}. Values are token strings such as "8", "28", "fill"; names are the ones React takes in aui.`);
    failed = true;
    continue;
  }
  console.log(`${state ? `${state}: ` : ''}${names.join(' ')}`);
  const outside = outsideProfile(uses, profile);
  if (outside.length > 0) console.error(`  Not a look our apps use: ${outside.join('; ')}. Take the nearest role in the role tables, or give the reason on the evidence sheet.`);
  if (uses.some((use) => use.set === 'elevation')) console.error('  A styled piece has no elevation: only a library popup floats.');
}
if (kind === 'text' && !failed) console.log(`attributes: ${TEXT_ATTRIBUTES}`);
if (look.interactive && !failed) console.log('element: a native <button type="button"> or <a>, never a div');
process.exit(failed ? 1 : 0);
