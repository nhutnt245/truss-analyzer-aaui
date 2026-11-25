// `node scripts/restyle-inventory.mjs --url <address of the page> [--views <file>] [--out <folder>]`: step 2 of kit/style/restyle.md.
// Opens the page you started in a private headless browser (never a debugging port), lists every kind of element it draws with the level
// that probably fits, and records what a person sees and can use. Writes, into --out (default restyle/):
//   restyle-map.md      the kinds of element, a suggested level each, and the columns you fill
//   restyle-before.json the texts and the controls of the page as it is: `restyle-compare` holds the finished page to it
//   before/             a picture of every view, light and dark, wide and narrow
// It never changes the page. A view is { name, url, click? } as in evidence.views.json: a state that needs a click or typing (an open dialog, the table a search draws) is a view whose `click` steps
// name a control to press or { "fill": <box>, "with": <text> } to type in a box.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadStandard } from './standard-lib.mjs';
import { loadTables } from './scan-classify.mjs';
import { localAddress, option, readPages, viewsOf } from './restyle-read.mjs';
import { mapRows, record, toMap } from './restyle-rules.mjs';

const USAGE = 'usage: node scripts/restyle-inventory.mjs --url <local address of the page, ending in / or the page file> [--views <file>] [--out <folder>]';

export async function main(argv, { log = console.log, error = console.error } = {}) {
  const url = option(argv, '--url');
  if (!url || !localAddress(url)) {
    error(`restyle-inventory: --url must be the local address of the page you started, for example http://127.0.0.1:5000/index.html (got ${url ?? 'nothing'}).\n${USAGE}`);
    return 1;
  }
  const out = path.resolve(option(argv, '--out') ?? 'restyle');
  let views;
  try {
    views = viewsOf(argv);
  } catch (problem) {
    error(`restyle-inventory: the views file cannot be read (${problem.message}).`);
    return 1;
  }
  let read;
  try {
    fs.mkdirSync(out, { recursive: true });
    read = await readPages({ url, views, out: path.join(out, 'before') });
  } catch (problem) {
    error(`restyle-inventory: ${problem.message}`);
    return 1;
  }
  const where = loadStandard().where;
  const tables = loadTables();
  const mapped = read.map(({ view, result }) => ({ ...view, ...mapRows(result.elements, tables, where), title: result.title, elements: result.elements, styles: result.styles }));
  fs.writeFileSync(path.join(out, 'restyle-map.md'), toMap(mapped, { where }));
  fs.writeFileSync(path.join(out, 'restyle-before.json'), `${JSON.stringify({ views, records: read.map(({ view, result }) => record(view, result)) }, null, 1)}\n`);
  const count = (level) => mapped.reduce((sum, view) => sum + view.rows.filter((row) => row.suggestion.level === level).length, 0);
  const shown = path.relative(process.cwd(), out) || '.';
  log(`restyle-inventory: wrote ${shown}/restyle-map.md, ${shown}/restyle-before.json and pictures in ${shown}/before/. Open the pictures and look at them.`);
  log(`restyle-inventory: summary ${JSON.stringify({ views: mapped.length, kinds: mapped.reduce((sum, view) => sum + view.rows.length, 0), level1: count(1), level2: count(2), level3: count(3), level4: count(4), gap: count('gap'), ask: count('ask'), done: count('done') })}`);
  return 0;
}

// realpath: the script must also run when its folder is reached through a link.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.stdout.write('', () => process.exit(code)));
}
