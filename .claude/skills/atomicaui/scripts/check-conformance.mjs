// `node scripts/check-conformance.mjs`: the token check. It says whether a running page, on any stack, uses only AtomicAUI's theme values.
//   node scripts/check-conformance.mjs                          the kit app's own views: starts its dev server on a free port, and stops it
//   node scripts/check-conformance.mjs --url http://127.0.0.1:8080/page.html   the one page at that address, already started (any framework)
//   node scripts/check-conformance.mjs --url http://127.0.0.1:8080/ --views file.json   many pages of an app you already started: each view's url is a hash, a query or a path of that address
// Every view is opened in light and dark, at 1440 and 390 wide, in a private headless browser. It reads values (colour, font, size and line,
// corner, shadow), not class names, and compares them with kit/standard/theme.json: what the kit's own AtomicAUI build allows.
// No theme value is read from the page, so a page cannot add or change one. Local addresses only; it never opens a debugging port.
// It runs the spacing rules of `npm run check:layout` as well and reports them apart from the token problems; --tokens-only leaves them out.
// A file of views is read only when --views names it, or (with no --url) as evidence.views.json of the folder, for the kit app's own views.
// A page is read once, when it has loaded. A view whose page still marks a region aria-busy="true" at that read, or whose click was not found, is not given the ok line:
// "tokens not proved" with the view, `"busy":N` or `"missedClicks":N` in the summary, exit 1 (also with --tokens-only).
// Last line: `check-conformance: summary {"views":N,"tokens":N,"layout":N}`. Exit 1 on any problem. How to read it by hand: kit/token-check.md.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser } from './browser.mjs';
import { classFixes } from './check-standard.mjs';
import { capture } from './evidence.mjs';
import { checkThemes, checkTokens } from './conformance-rules.mjs';
import { checkLayout } from './layout-rules.mjs';
import { loadStandard, readJson, standardDir } from './standard-lib.mjs';

/** The source of the expression that reads one page; `capture` runs it under the name `conformance`. */
export const pageSource = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'conformance-page.mjs'), 'utf8');
const plainFixes = classFixes(loadStandard().where);
const reference = readJson(path.join(standardDir(), 'theme.json'));

/**
 * The problems of a list of measurements from `capture` (each with `conformance`), joined: one entry per message and view (a page or screen),
 * with the sizes and themes of that view that show it. A token message names one element by its path, so two elements are never one entry.
 * { tokens, layout }: the token rules, and apart from them the spacing rules, whose fixes are in class form on a page without React.
 */
export function conformanceProblems(results) {
  const tokens = new Map();
  const layout = new Map();
  const note = (seen, problem, result) => {
    const text = `${problem.rule}: ${problem.message}\n    Fix: ${problem.fix}`;
    const key = `${result.view}\n${text}`;
    const entry = seen.get(key) ?? { text, names: [] };
    if (!entry.names.includes(result.name)) entry.names.push(result.name);
    seen.set(key, entry);
  };
  for (const result of results) {
    for (const problem of checkTokens(result.name, result.conformance, result.theme, reference)) note(tokens, problem, result);
    for (const problem of checkLayout(result, result.conformance.react ? undefined : plainFixes)) note(layout, problem, result);
    if (result.theme !== 'light') continue;
    const dark = results.find((other) => other.view === result.view && other.size === result.size && other.theme === 'dark');
    if (dark) for (const problem of checkThemes(result.name, result.conformance, dark.conformance, reference)) note(tokens, problem, result);
  }
  return { tokens: [...tokens.values()], layout: [...layout.values()] };
}

/** The address and the views to measure: with --url and no --views the one page at that address, otherwise a file of views (--views, or evidence.views.json of the folder). */
export function readViews(argv) {
  const value = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);
  const url = value('--url');
  const file = value('--views');
  if (url && !file) return { url, views: [{ name: 'page', url: new URL(url).hash }] };
  return { url, views: JSON.parse(fs.readFileSync(path.resolve(file ?? 'evidence.views.json'), 'utf8')) };
}

const SAID = {
  tokens: {
    failed: 'Each names the value, the element with its path, and the nearest theme role; fix them, then run it again.',
    ok: (results) => `${results.reduce((sum, result) => sum + result.conformance.elements.length, 0)} boxes read. Read, on each element that draws (one that is display: none or inside one, is visibility: hidden, or is fully clipped away, draws nothing and is not read; one at opacity: 0 is read; html and body, whatever their visibility, because their background is drawn over the whole window even when they are hidden; what an open shadow root holds, and HTML inside an SVG foreignObject) and on its ::before and ::after: text colour, fill, border, outline, gradient stops of the background, box shadow and text shadow, font, size and line, and corners; on each SVG shape: fill and stroke. Each is a theme value of AtomicAUI ${reference.atomicaui}. Skipped: ${results.reduce((sum, result) => sum + result.conformance.skipped, 0)} elements that are fully clipped away, each with what it holds (clip-path: inset(50%) or another shape with no area, or clip: rect(0, 0, 0, 0) on an absolute or fixed box; the usual hidden form input). Not read: an SVG shape with no box at all (also a zero-length stroke drawn only by its caps), what the page draws after this one read (taken when the page had loaded and its fonts were ready, with no region marked aria-busy="true"), frames (iframe) and closed shadow roots, images, canvas, what an SVG <use> draws, scrollbars, other pseudo-elements, text in a display: contents element, gradients of a border image or a mask, drop-shadow filters, text decoration, text fill and text stroke colours, what the browser itself draws of a native control (a checkbox, a radio, a progress bar) and accent-color, and states the page was not in (hover, focus, an open menu).`,
  },
  layout: {
    failed: 'These are the spacing rules of check-layout, not theme values; fix them, then run it again (--tokens-only leaves them out).',
    ok: () => 'the spacing rules of check-layout found nothing.',
  },
};

/** Prints the problems of `kinds` ('tokens', 'layout') in the measurements from `capture` (each with `conformance`), then the summary line. True when something is wrong. */
export function report(results, kinds) {
  const found = conformanceProblems(results);
  const busy = results.filter((result) => result.conformance.busy).map((result) => result.name);
  const missed = results.filter((result) => result.missedClicks.length > 0).map((result) => `${result.name} (${result.missedClicks.map((text) => `"${text}"`).join(', ')})`);
  const unproved = [
    busy.length > 0 ? `${busy.length} of ${results.length} views were still loading when they were read (a region marked aria-busy="true", after a wait of 5 seconds): ${busy.join(', ')}. What they draw later was not read. Take aria-busy off when the page has drawn, then run it again.` : '',
    missed.length > 0 ? `${missed.length} of ${results.length} views were not in the state they name, because nothing to click or type in was found with the name in brackets: ${missed.join(', ')}. What that step shows was not read. Write the aria-label, title or whole text of the control (a box: its label, id or name; a scroll step: the exact aria-label, title or text of the element to bring into view; one that is on screen at one size only as { "text": "<name>", "only": "desktop" }, or "narrow"), then run it again.` : '',
  ].filter(Boolean).join(' ');
  for (const kind of kinds) {
    const problems = found[kind];
    for (const { text, names } of problems) console.error(`${text}\n    Seen in: ${names.join(', ')}\n`);
    if (problems.length > 0) console.error(`check-conformance: ${kind}: ${problems.length} problem(s) in ${results.length} views. ${SAID[kind].failed}`);
    if (kind === 'tokens' && unproved) console.error(`check-conformance: tokens not proved. ${unproved}`);
    else if (problems.length === 0) console.log(`check-conformance: ${kind} ok. ${results.length} views measured (desktop and narrow, light and dark): ${SAID[kind].ok(results)}`);
  }
  const failed = Boolean(unproved) || kinds.some((kind) => found[kind].length > 0);
  console[failed ? 'error' : 'log'](`check-conformance: summary ${JSON.stringify({ views: results.length, ...Object.fromEntries(kinds.map((kind) => [kind, found[kind].length])), ...(busy.length > 0 ? { busy: busy.length } : {}), ...(missed.length > 0 ? { missedClicks: missed.length } : {}) })}`);
  return failed;
}

async function main(argv) {
  const explicit = argv.includes('--url');
  const kinds = argv.includes('--tokens-only') ? ['tokens'] : ['tokens', 'layout'];
  if (!findBrowser()) {
    const required = explicit || process.env.AUI_LAYOUT === 'required';
    console[required ? 'error' : 'log']('check-conformance: SKIPPED. No Chrome for Testing, headless shell, Chrome Canary, Chromium or Edge was found (set AUI_BROWSER to its full path). Nothing was measured: say so in your report.');
    return required ? 1 : 0;
  }
  let options;
  try {
    options = readViews(argv);
  } catch (error) {
    console.error(`check-conformance: ${error.message}`);
    return 1;
  }
  // The screenshots the capture takes are not kept: this check proves values, `npm run evidence` is the one that photographs.
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'aui-conformance-'));
  let results;
  try {
    results = await capture({ ...options, out, log: () => undefined, extra: { conformance: pageSource } });
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
  return report(results, kinds) ? 1 : 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const leave = (code) => process.stdout.write('', () => process.stderr.write('', () => process.exit(code)));
  main(process.argv.slice(2))
    .then(leave)
    .catch((error) => {
      console.error(`check-conformance: ${error.message}`);
      leave(1);
    });
}
