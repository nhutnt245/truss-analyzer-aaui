// `node scripts/restyle-compare.mjs --url <address of the restyled page> [--out <folder>]`: step 5 of kit/style/restyle.md.
// Holds the page as it is now to the page as `restyle-inventory` recorded it (restyle-before.json in --out, default restyle/):
// every text and every control (role and name) the old page had must still be there, in every view the record names, with the same clicks.
// A missing text or control fails (exit 1). A text or control that is new is listed and does not fail: it is yours to explain (AUI-07).
// A fold arrow the old page wrote as a character (a triangle before a tree row) is not asked for, as a text made only of it or in a tree item's
// name: the tree recipe draws its own arrow. One that is gone is listed as a note. A text with a word beside the arrow ("▲ 12%") is compared as it is.
// It never changes the page, never opens a debugging port, and writes pictures of what it read into <out>/after/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localAddress, option, readPages } from './restyle-read.mjs';
import { compareViews, record } from './restyle-rules.mjs';

const USAGE = 'usage: node scripts/restyle-compare.mjs --url <local address of the restyled page> [--out <folder holding restyle-before.json>]';
const FIX = {
  text: 'The restyle must keep every text of the old page (AUI-07). Put the text back where the old page had it. An odd text or a typo is kept, never fixed.',
  control: 'The restyle must keep every control of the old page (AUI-08). Put the control back with the same name; if a part drew it differently, give the part the old name (a label or aria-label).',
  title: 'The title of the page is a text of the page: put the old one back.',
};

export async function main(argv, { log = console.log, error = console.error } = {}) {
  const url = option(argv, '--url');
  if (!url || !localAddress(url)) {
    error(`restyle-compare: --url must be the local address of the page you started (got ${url ?? 'nothing'}).\n${USAGE}`);
    return 1;
  }
  const out = path.resolve(option(argv, '--out') ?? 'restyle');
  const file = path.join(out, 'restyle-before.json');
  let before;
  try {
    before = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(before.views) || !Array.isArray(before.records)) throw new Error('it holds no views');
  } catch (problem) {
    error(`restyle-compare: ${path.relative(process.cwd(), file) || file} cannot be read (${problem.message}). Run node scripts/restyle-inventory.mjs on the old page first, before you change it.`);
    return 1;
  }
  let read;
  try {
    read = await readPages({ url, views: before.views, out: path.join(out, 'after') });
  } catch (problem) {
    error(`restyle-compare: ${problem.message}`);
    return 1;
  }
  const total = { views: read.length, missingTexts: 0, missingControls: 0, addedTexts: 0, addedControls: 0 };
  const lines = [];
  const notes = [];
  const folds = [];
  for (const { view, result } of read) {
    const was = before.records.find((one) => one.name === view.name);
    const now = record(view, result);
    const found = compareViews(was, now);
    for (const text of found.missingTexts) lines.push(`AUI-07: Missing text "${text}" in the view "${view.name}".\n    Fix: ${FIX.text}`);
    for (const control of found.missingControls) lines.push(`AUI-08: Missing control ${control} in the view "${view.name}".\n    Fix: ${FIX.control}`);
    if (found.titleChanged) lines.push(`AUI-07: The title of the view "${view.name}" was "${found.titleChanged.before}" and is "${found.titleChanged.after}".\n    Fix: ${FIX.title}`);
    for (const text of found.addedTexts) notes.push(`  new text "${text}" in the view "${view.name}"`);
    for (const control of found.addedControls) notes.push(`  new control ${control} in the view "${view.name}"`);
    for (const text of found.foldTexts) folds.push(`  "${text}" in the view "${view.name}"`);
    total.missingTexts += found.missingTexts.length + (found.titleChanged ? 1 : 0);
    total.missingControls += found.missingControls.length;
    total.addedTexts += found.addedTexts.length;
    total.addedControls += found.addedControls.length;
  }
  for (const line of lines) error(`${line}\n`);
  if (notes.length > 0) log(`restyle-compare: new since the old page (not a failure; each must be a part of a control you replaced, or be deleted, AUI-07):\n${notes.join('\n')}`);
  if (folds.length > 0) log(`restyle-compare: fold arrows the old page wrote as text and this page does not (not a failure: the tree recipe draws its own arrow, so the old character is never put back, as a text or in a tree item's name):\n${folds.join('\n')}`);
  const failed = total.missingTexts + total.missingControls > 0;
  const shown = path.relative(process.cwd(), out) || '.';
  if (!failed) log(`restyle-compare: ok. Every text and control of the old page is on the restyled page, in ${total.views} view(s). Pictures: ${shown}/after/ (open them and compare with ${shown}/before/).`);
  (failed ? error : log)(`restyle-compare: summary ${JSON.stringify(total)}`);
  return failed ? 1 : 0;
}

// realpath: the script must also run when its folder is reached through a link.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.stdout.write('', () => process.stderr.write('', () => process.exit(code))));
}
