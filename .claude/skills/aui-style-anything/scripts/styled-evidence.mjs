// Writes the evidence sheet of a styled piece: evidence/styled-<name>.md.
//   node scripts/styled-evidence.mjs [<name> ...] [--in <folder> ...] [--check]
// Run it after the checks (npm run verify:page, or check-standard.mjs with --url), from the app folder. It reads what they
// measured (evidence/measure.json, evidence/standard-measure.json) and fills every line it can prove.
// A source file of the piece newer than that measurement fails the run (STALE): the pictures show the old page; run the check again and open them.
// You fill the lines marked "(you)". Run it again after a change: what you wrote on those lines is kept, also on a line whose label you wrote
// without the mark ("Sheet: kind B; ...") or cut short ("Reference: ..." for "Reference in our apps"): the run writes the label back whole.
// No name: one sheet per data-aui-styled marker found. --in: the folders with your pages (apps without React; default: here).
// --check (what npm run verify:page and npm run verify run, after the layout check): no marker and no name is not an error, and the exit code is 1 while a sheet still has an unfilled line marked "(you)" (the run names each one) or says STALE, SOURCE NOT FOUND or MISSING in GAPS.md. NOT MEASURED also fails unless a measurement newer than the piece holds a view and the sheet explains why no listed view can show the state.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// In the kit the checks are beside this script; in an app they are in the atomicaui skill beside this one.
const scripts = [here, path.resolve(here, '../../atomicaui/scripts')].find((dir) => fs.existsSync(path.join(dir, 'standard-rules.mjs')));
if (!scripts) {
  console.error('styled-evidence: the atomicaui skill is not installed beside this one. Install both with the kit: node install.mjs <your app>.');
  process.exit(1);
}
const load = (name) => import(pathToFileURL(path.join(scripts, name)).href);
const { styledPieces: piecesOfMarkup, MARKUP_FILES } = await load('standard-rules.mjs');
const { gapNames, loadProfile } = await load('styled-rules.mjs');
const { checkLayout } = await load('layout-rules.mjs');
const { staleFiles } = await load('stale-evidence.mjs');

const args = process.argv.slice(2);
const folders = args.flatMap((arg, index) => (arg === '--in' ? [args[index + 1]] : [])).filter(Boolean);
const wanted = args.filter((arg, index) => !arg.startsWith('--') && args[index - 1] !== '--in');
const checking = args.includes('--check');
const root = process.cwd();
const out = path.join(root, 'evidence');
const gapsText = fs.existsSync(path.join(root, 'GAPS.md')) ? fs.readFileSync(path.join(root, 'GAPS.md'), 'utf8') : '';
const shown = (file) => path.relative(root, path.resolve(root, file)).split(path.sep).join('/');

// 1. The pieces in the source: React screens (the kit starter), or markup (any other stack).
const SKIPPED = new Set(['node_modules', '.git', '.agents', '.claude', 'bin', 'obj', 'dist', 'evidence', 'vendor', 'aui']);
const walk = (dir, keep, found = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) { if (!SKIPPED.has(entry.name)) walk(path.join(dir, entry.name), keep, found); } else if (keep(entry.name)) found.push(path.join(dir, entry.name));
  }
  return found;
};
let pieces = [];
if (fs.existsSync(path.join(root, 'src/vendor/atomic-aui')) && folders.length === 0) {
  const { styledPieces } = await load('check-rules.mjs');
  pieces = styledPieces(root, walk(path.join(root, 'src'), (name) => /\.[jt]sx$/.test(name)).map(shown));
} else {
  const standard = { profile: loadProfile(path.resolve(scripts, '..')), gaps: gapNames(gapsText) };
  for (const folder of folders.length > 0 ? folders : ['.']) {
    if (!fs.existsSync(folder)) continue;
    for (const file of walk(path.resolve(folder), (name) => MARKUP_FILES.test(name))) pieces.push(...piecesOfMarkup(shown(file), fs.readFileSync(file, 'utf8'), standard));
  }
}
const names = wanted.length > 0 ? wanted : [...new Set(pieces.map((piece) => piece.name))];
if (names.length === 0 && checking) {
  console.log('styled-evidence: ok. No styled piece in this app, so no evidence sheet to fill.');
  process.exit(0);
}
if (names.length === 0) {
  console.error('styled-evidence: no styled piece found. Put data-aui-styled="<name>" on the root of the piece, or name the piece: node scripts/styled-evidence.mjs <name>.');
  process.exit(1);
}

// 2. What the page checks measured.
const readJson = (name) => (fs.existsSync(path.join(out, name)) ? JSON.parse(fs.readFileSync(path.join(out, name), 'utf8')) : []);
const views = [
  ...readJson('measure.json').map((view) => ({ ...view, problems: checkLayout(view).length, measuredIn: 'measure.json' })),
  ...readJson('standard-measure.json').map((view) => ({ ...view, measuredIn: 'standard-measure.json' })),
];
const text = (one) => (one ? `${one.size} / ${one.line}, weight ${one.weight}` : 'no text');
const both = (light, dark) => (dark === undefined || light === dark ? `${light}` : `${light} / ${dark}`);

const NO_FOCUS = 'no clickable thing';
const FOCUS = 'Tab reaches each clickable thing and the ring shows; a mouse click shows none; Enter and Space act. Not tried: say so';
// The line this script writes in place of "Sizes that must not move (you)" when a view names rows: a measurement, never your answer.
const MEASURED_MOVE = / before, \d+ x \d+ after the clicks of /;
let failed = false;
fs.mkdirSync(out, { recursive: true });
for (const name of names) {
  const sources = pieces.filter((piece) => piece.name === name);
  const seen = views.filter((view) => (view.styled ?? []).some((piece) => piece.name === name));
  const find = (size, theme) => seen.find((view) => view.name.includes(`-${size}-${theme}`))?.styled.find((piece) => piece.name === name);
  const [light, dark, narrow] = [find('desktop', 'light'), find('desktop', 'dark'), find('narrow', 'light')];
  const file = path.join(out, `styled-${name}.md`);
  // What the sheet of the last run holds, by the label as it stands there: "Sheet (you): ..." and, from someone who left the mark out, "Sheet: ...".
  const written = new Map();
  for (const line of fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n') : []) {
    const match = line.match(/^([^:(]+?)(?: \(you\))?: (.*)$/);
    if (match && match[2].trim()) written.set(match[1], [...(written.get(match[1]) ?? []), match[2]]);
  }
  // The lines that are yours, in the order of the sheet: each is answered below, once every label of this sheet is known.
  const asked = [];
  const you = (label, ...hints) => {
    asked.push({ label, hints });
    return asked.at(-1);
  };
  const gapLine = gapsText.split('\n').findIndex((line) => line.toLowerCase().includes(`styled piece \`${name}\``)) + 1;
  const outside = sources.flatMap((piece) => piece.outside);
  const problems = sources.flatMap((piece) => piece.problems);
  const clickable = light?.clickable ?? [];
  // A measurement that shows the piece is older than its source: what it saw is not the page as it is now.
  const sourceFiles = [...new Set(sources.map((piece) => path.resolve(root, piece.file)))];
  const measuredIn = (list) => [...new Set(list.map((view) => path.join(out, view.measuredIn)))];
  const stale = [...new Set(seen.length > 0 ? measuredIn(seen).flatMap((measurement) => staleFiles(sourceFiles, [measurement])) : staleFiles(sourceFiles, measuredIn(views)))].map(shown);
  // Rows a view names in "rows" are measured before and after its clicks (the React starter's evidence.views.json).
  const moves = seen.filter((view) => view.name.includes('-desktop-light')).flatMap((view) => (view.rows ?? []).filter((row) => !row.auto && row.before.found && row.after.found)
    .map((row) => `Sizes that must not move: "${row.label}" ${row.before.width} x ${row.before.height} before, ${row.after.width} x ${row.after.height} after the clicks of ${view.view ?? view.name}: ${row.before.width === row.after.width && row.before.height === row.after.height ? 'the same' : 'CHANGED'}.`));
  const lines = [
    `# Styled piece: ${name}`,
    sources.length > 0 ? `Source: ${sources.map((piece) => `${piece.file}:${piece.line}`).join(', ')}` : 'Source: NOT FOUND. No data-aui-styled marker with this name in the source.',
    you('Sheet', 'kind A or B; the nearest example; the role of each box and text'),
    `Rules: ${sources.length === 0 ? 'not read' : problems.length === 0 ? 'no problem in the source of this piece' : problems.map((one) => `${one.rule} ${one.message}`).join(' ')}`,
    you('Checks', 'paste the last line of npm run check:layout, or of check-standard.mjs', 'paste the last line of npm run verify, or of check-standard.mjs'),
    stale.length > 0 ? `Page check: STALE. ${stale.join(', ')} changed after the last measurement: the pictures show the old page. Run the check again (npm run verify:page, or check-standard.mjs with --url), open the new pictures and run this again. Claim no look.` : seen.length > 0 ? `Page check: ${seen.length} view(s) show this piece; ${seen.reduce((sum, view) => sum + (view.problems ?? 0), 0)} problem(s) in them.` : 'Page check: NOT MEASURED. No measured view shows this piece: list its screen in evidence.views.json and run npm run verify:page, or run check-standard.mjs with --url. Claim no look.',
    ...(seen.length === 0 ? [you('Not measured', 'No listed view can show this state because (give the reason)')] : []),
    ...(outside.length === 0 ? ['Looks our apps do not use: none.'] : outside.map((look) => you(`Not a look our apps use, ${look.replace(/[:(]/g, ' ').replace(/\)/g, '')}, why`, 'remove it, or say why the piece needs it'))),
    you('Reference in our apps', 'the example you copied, or "none in any app: a person must look"'),
    light ? `Measured, desktop (light / dark): ${light.width} x ${light.height}; padding ${light.padding.join(' ')}; radius ${light.radius}; fill of the root ${both(light.fill || 'none', dark ? dark.fill || 'none' : undefined)}; text ${text(light.text)}, ${both(light.text?.colour ?? '', dark?.text?.colour)}.` : 'Measured: nothing.',
    ...(narrow ? [`Measured, narrow: ${narrow.width} x ${narrow.height}.`] : []),
    clickable.length === 0 ? 'Clickable: none.' : `Clickable: ${clickable.length}: ${clickable.map((one) => `${one.width} x ${one.height}${one.pressed === null ? '' : ` pressed ${one.pressed}`}`).join('; ')}.`,
    ...(light && (light.shadows.length > 0 || dark?.shadows.length > 0) ? ['Shadow: FOUND. A styled piece has none.'] : light ? ['Shadow: none.'] : []),
    ...(moves.length > 0 ? moves : [you('Sizes that must not move', 'none; or name the row in "rows" of evidence.views.json, with the click that changes it, and run the checks again')]),
    you('Focus', ...(clickable.length === 0 ? [NO_FOCUS, FOCUS] : [FOCUS, NO_FOCUS])),
    you('Access', 'the ten lines of the access checklist, yes or no'),
    `Screenshots: ${seen.length > 0 ? seen.map((view) => `${view.name}.png`).join(', ') : 'none'}`,
    you('Not checked', 'for example: screen reader'),
    gapLine > 0 ? `GAPS.md: line ${gapLine}.` : `GAPS.md: MISSING. Add one line: - Styled piece \`${name}\`: what was missing, which screen, which file.`,
  ];
  // A line you filled is kept: under its label, with or without the mark, or under the first words of its label when they can be no other line
  // of this sheet ("Reference" for "Reference in our apps"; "Not" could be three lines, so it is none). A line that still holds its hint, or the
  // sizes this script measured in an earlier run, is still open.
  const open = [];
  const answered = ({ label, hints }) => {
    const mine = (name) => name === label || (label.startsWith(`${name} `) && asked.filter((one) => one.label === name || one.label.startsWith(`${name} `)).length === 1);
    const answer = [...written].filter(([name]) => mine(name)).flatMap(([, values]) => values).find((value) => !hints.includes(value) && !MEASURED_MOVE.test(value));
    if (answer === undefined) open.push(label);
    return `${label} (you): ${answer ?? hints[0]}`;
  };
  fs.writeFileSync(file, `${lines.map((line) => (typeof line === 'string' ? line : answered(line))).join('\n')}\n`);
  if (sources.length === 0 || (seen.length === 0 && (!checking || views.length === 0)) || gapLine === 0 || problems.length > 0 || stale.length > 0 || (checking && open.length > 0)) failed = true;
  console.log(`styled-evidence: evidence/styled-${name}.md written. ${seen.length} measured view(s); ${outside.length} look(s) our apps do not use; ${open.length} line(s) marked (you) to fill${checking && open.length > 0 ? `: ${open.join('; ')}` : ''}.${sources.length === 0 ? ' SOURCE NOT FOUND.' : ''}${seen.length === 0 ? ' NOT MEASURED: claim no look.' : ''}${stale.length > 0 ? ' STALE: the page changed after the last measurement; run the check again and open the pictures.' : ''}${gapLine === 0 ? ' NO LINE IN GAPS.md.' : ''}`);
}
if (failed && checking) console.error(`styled-evidence: not done. Open evidence/styled-<name>.md for each piece above and fill every line marked "(you)" that is named above (what you saw, in your words; "not tried" is an answer). A filled line keeps its label and has your answer after the colon, for example "Sheet (you): kind A; nearest example label-value-rows; roles: arranger (the group and each row), label, body text." (written without the mark, "Sheet: kind A; ...", it is kept too, and the next run writes the mark back). A line that still holds the words this script wrote is not filled, also when they hold your answer (Focus: "no clickable thing"; Sizes that must not move: "none; or ..."): write the answer in your own words. For NOT MEASURED, list a view that shows the piece, or fill Not measured with why no listed view can show its state; keep its marker and sheet. Fix each STALE, SOURCE NOT FOUND or NO LINE IN GAPS.md it says. NOT MEASURED or STALE under a line "check:layout: SKIPPED" above: no browser was found, so nothing was measured; set AUI_BROWSER to the full path of one, or install one. Then run the page-only run again.`);
process.exit(failed ? 1 : 0);
