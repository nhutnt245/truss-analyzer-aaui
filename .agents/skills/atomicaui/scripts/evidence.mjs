// `npm run evidence`: looks at the app in a private headless browser and writes what it saw.
// For every view in evidence.views.json: four screenshots (desktop and narrow, light and dark),
// the measured spacing, and the page problems.
//   node scripts/evidence.mjs                       starts this app's dev server on a free port, and stops it
//   node scripts/evidence.mjs --url http://127.0.0.1:5173/   looks at an app you already started (any framework)
// The url of a view is a hash, a query or a path of that address ("#/home", "?id=3#top", "parts.html", "/orders/7"), never another address.
// Options: --views <file.json>  --out <folder>. It never opens or attaches to a debugging port.
// A step of a view (a click, or a box to type in) that finds nothing still writes a picture (of the page before the step): the command then ends with exit 1 and names the view and the step.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser, launchBrowser, SETTLE_WITH_ICONS } from './browser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Output and the list of views belong to the app being looked at: they are read from where the command runs.
const outDir = path.resolve('evidence');
const SIZES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'narrow', width: 390, height: 844 },
];
const THEMES = ['light', 'dark'];
const measureSource = fs.readFileSync(path.join(root, 'scripts/measure-page.mjs'), 'utf8');

// A name is the aria-label, whole visible text or title of the control (the value of an <input type="button"> or "submit").
// A card's text is its title and its description together, so when nothing has that exact text, the one control whose text begins with the name is the one
// (two such controls: no guess, nothing is clicked). Besides buttons, links, tabs, tree items and their rows, and cells, an input button and any element with an onclick
// attribute can be clicked; of several elements with the same whole text, one inside the other, the innermost one is pressed (a button inside a box that has an onclick).
export const clickSource = (text) => `(() => {
  const wanted = ${JSON.stringify(text)};
  const named = [...document.querySelectorAll('[aria-label]')].find((element) => element.getAttribute('aria-label') === wanted);
  const controls = [...document.querySelectorAll('button,[role="button"],[role="tab"],[role="treeitem"],[data-aui-tree-view-row],a,td,input[type="button" i],input[type="submit" i],[onclick]')];
  const titled = controls.find((element) => element.getAttribute('title') === wanted);
  const textOf = (element) => (element.localName === 'input' ? element.value : (element.textContent ?? '')).trim();
  const innermost = (found) => found.filter((element) => !found.some((other) => other !== element && element.contains(other) && textOf(other) === textOf(element)));
  const exact = innermost(controls.filter((element) => textOf(element) === wanted));
  const begins = innermost(controls.filter((element) => textOf(element).startsWith(wanted)));
  const hit = named ?? exact[0] ?? titled ?? (begins.length === 1 ? begins[0] : null);
  if (!hit) return false;
  hit.click();
  return true;
})()`;

export const scrollSource = (text) => `(() => {
  const wanted = ${JSON.stringify(text)};
  const candidates = [...document.querySelectorAll('body *')];
  const named = candidates.find((element) => element.getAttribute('aria-label') === wanted || element.getAttribute('title') === wanted);
  const exact = candidates.filter((element) => (element.textContent ?? '').trim() === wanted);
  const hit = named ?? exact.find((element) => !exact.some((other) => other !== element && element.contains(other)));
  if (!hit) return false;
  hit.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
  return true;
})()`;

// A box to type in is named by its aria-label or the whole text of its <label> (a colon at the end of either is left out), then by its id or its name:
// the first of these that matches, among the visible text boxes and text areas. The text goes in as a person's typing does (input, keyup and change events fire),
// so a script that listens for them runs. Hidden, disabled and read-only boxes are not filled.
export const fillSource = (name, value) => `(() => {
  const plain = (text) => (text ?? '').replace(/\\s+/g, ' ').trim().replace(/:$/, '');
  const wanted = plain(${JSON.stringify(name)});
  const text = ${JSON.stringify(value)};
  const NOT_TEXT = ['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset', 'image', 'file', 'range', 'color'];
  const boxes = [...document.querySelectorAll('input,textarea')].filter((element) => !NOT_TEXT.includes((element.getAttribute('type') ?? 'text').toLowerCase()) && !element.disabled && !element.readOnly && element.getClientRects().length > 0);
  const names = [
    (element) => element.getAttribute('aria-label'),
    (element) => [...(element.labels ?? [])].map((label) => plain(label.textContent)).join(' '),
    (element) => element.id,
    (element) => element.getAttribute('name'),
  ];
  let box = null;
  for (const nameOf of names) {
    box = boxes.find((element) => plain(nameOf(element)) === wanted);
    if (box) break;
  }
  if (!box) return false;
  box.focus();
  Object.getOwnPropertyDescriptor(box.localName === 'textarea' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(box, text);
  for (const type of ['input', 'keyup', 'change']) box.dispatchEvent(new Event(type, { bubbles: true }));
  return true;
})()`;

/**
 * The steps of a view, in order, on an open page: a name to click, { text, only? } to click, { fill, with, only? } to type, or { scroll, only? } to bring a named element into view.
 * `only` ('desktop' or 'narrow') leaves the step out at the other size. Returns the steps nothing matched, as a name each (a box: "<name> (type)").
 * What a step sets going is waited for: the requests it starts in the background (a search that fetches its answer), until they have ended and the page
 * is quiet (page.quiet, a time limit), and a page it loads again (a submit in a form, a link): the next step and the measurement see the answer drawn, or the new page, loaded and settled.
 */
export async function runSteps(page, steps, sizeName) {
  const missed = [];
  let documents = await page.documents();
  for (const entry of steps ?? []) {
    if (typeof entry !== 'string' && entry.only && entry.only !== sizeName) continue;
    const typing = typeof entry !== 'string' && entry.fill !== undefined;
    const scrolling = typeof entry !== 'string' && entry.scroll !== undefined;
    const label = typing ? entry.fill : scrolling ? entry.scroll : typeof entry === 'string' ? entry : entry.text;
    const from = Date.now();
    const done = typing ? await page.evaluate(fillSource(String(entry.fill), String(entry.with ?? ''))) : scrolling ? await page.evaluate(scrollSource(String(label))) : await page.evaluate(clickSource(label));
    if (!done) missed.push(typing ? `${label} (type)` : scrolling ? `${label} (scroll)` : label);
    // The wait runs here, not in the page: a page that the step sends away takes a wait of its own with it.
    await page.quiet(from);
    const now = await page.documents();
    if (now !== documents) await page.evaluate(SETTLE_WITH_ICONS);
    documents = now;
  }
  return missed;
}

// Size of the rows or bars a view names in "rows" (by aria-label): measured before and after the clicks.
const rowsSource = (labels) => `(() => ${JSON.stringify(labels)}.map((label) => {
  const element = [...document.querySelectorAll('[aria-label]')].find((one) => one.getAttribute('aria-label') === label);
  const box = element?.getBoundingClientRect();
  return { label, found: Boolean(element), width: box ? Math.round(box.width * 10) / 10 : 0, height: box ? Math.round(box.height * 10) / 10 : 0 };
}))()`;

// Every toolbar, group, menubar and tablist: tagged before the clicks and the same nodes measured after, so a bar
// that grows is caught even when the view does not name it, and a bar that appears does not shift the others.
// A bar inside a region that is inert, hidden from assistive technology or collapsed is not tagged: it is not on screen.
// A tagged bar that is inside a collapsed pane after the clicks is not found: it left the screen, it did not change size.
// The width of the pane around the bar (the page, when it is in no pane) is recorded with it, so a bar that only follows its pane (a pane that collapsed) is told from one that grew.
export const barsSource = (tag) => `(() => [...document.querySelectorAll(${tag ? "'[role=\"toolbar\"],[role=\"group\"],[role=\"menubar\"],[role=\"tablist\"]'" : "'[data-aui-bar]'"})].filter((element) => !${tag} || !element.closest('[inert],[aria-hidden="true"],[data-aui-collapsed]')).map((element, index) => {
  if (${tag}) element.setAttribute('data-aui-bar', 'bar ' + (element.getAttribute('aria-label') || element.getAttribute('role') + ' #' + index));
  const box = element.getBoundingClientRect();
  const pane = element.closest('[data-aui-pane]');
  return { label: element.getAttribute('data-aui-bar'), found: ${tag} || !element.closest('[data-aui-collapsed]'), auto: true, width: Math.round(box.width * 10) / 10, height: Math.round(box.height * 10) / 10, paneWidth: Math.round((pane ? pane.getBoundingClientRect().width : document.documentElement.clientWidth) * 10) / 10 };
}))()`;

/** The address of a view in a theme: the view's url resolved against the app's address, with the theme added to its query. A url that leaves that address is refused. */
export function viewAddress(base, view, theme) {
  const address = new URL(view.url, base);
  if (address.origin !== new URL(base).origin) throw new Error(`The url of the view "${view.name}" must be a hash, a query or a path of ${base}, not another address (got ${view.url}).`);
  address.search = [address.search.slice(1), `theme=${theme}`].filter(Boolean).join('&');
  return address.href;
}

// extra: { name: <source of an expression that runs in the page> }: each result is added to the view's measurement under that name.
export async function capture({ views, out = outDir, url, log = console.log, extra = {} }) {
  const executable = findBrowser();
  if (!executable) {
    throw new Error('No Chrome for Testing, headless shell, Chrome Canary, Chromium or Edge was found. Install one, or set AUI_BROWSER to its full path. Nothing was looked at.');
  }
  let server;
  let base = url;
  if (!base) {
    // No address given: start this app's own dev server on a port the system picks, and stop it at the end.
    const { createServer } = await import('vite');
    server = await createServer({ root, logLevel: 'silent', server: { host: '127.0.0.1', port: 0, strictPort: false, open: false } });
    await server.listen();
    base = `http://127.0.0.1:${server.httpServer.address().port}/`;
  }
  if (!/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?\//.test(base)) throw new Error(`--url must be a local address that ends with "/", for example http://127.0.0.1:5173/ (got ${base}).`);
  for (const view of views) viewAddress(base, view, THEMES[0]);
  const browser = await launchBrowser(executable);
  const results = [];
  try {
    // Old screenshots go; the evidence sheets of styled pieces (styled-<name>.md) stay: they hold lines a person or an assistant wrote.
    fs.mkdirSync(out, { recursive: true });
    for (const name of fs.readdirSync(out)) if (!/^styled-[\w-]+\.md$/.test(name)) fs.rmSync(path.join(out, name), { recursive: true, force: true });
    const page = await browser.newPage();
    for (const view of views) {
      for (const theme of THEMES) {
        // The theme is asked for in the address, and as the system setting too: a page that a step loads again (a form that sends its own page) has a new address,
        // and falls back to the system setting. Reduced motion is asked for too: a part that animates in (a chart) is then drawn finished when its picture is taken.
        await page.call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
        for (const size of SIZES) {
          const name = `${view.name}-${size.name}-${theme}`;
          const url = viewAddress(base, view, theme);
          page.consoleErrors.length = 0;
          await page.size(size.width, size.height);
          await page.open(url);
          const iconsLoaded = await page.evaluate(SETTLE_WITH_ICONS); // waits for the icon font, not a fixed time
          const rowsBefore = [...(view.rows ? await page.evaluate(rowsSource(view.rows)) : []), ...((view.click ?? []).length > 0 ? await page.evaluate(barsSource(true)) : [])];
          // A step is a name to click, { text, only: 'desktop' | 'narrow' } for a control that exists at one size only (collapsing a pane is off in a narrow window),
          // or { fill, with } to type in a box (runSteps).
          const missed = await runSteps(page, view.click, size.name);
          const rowsAfter = rowsBefore.map((row) => ({ ...row, found: false }));
          const nowNamed = view.rows ? await page.evaluate(rowsSource(view.rows)) : [];
          const nowBars = (view.click ?? []).length > 0 ? await page.evaluate(barsSource(false)) : [];
          const paired = new Set();
          for (const now of [...nowNamed, ...nowBars]) {
            const index = rowsBefore.findIndex((row, at) => row.label === now.label && !paired.has(at));
            if (index >= 0) {
              paired.add(index);
              rowsAfter[index] = now;
            }
          }
          await page.screenshot(path.join(out, `${name}.png`));
          const measured = await page.evaluate(measureSource);
          const more = {};
          for (const [key, source] of Object.entries(extra)) more[key] = await page.evaluate(source);
          // Last, because it presses a field with the mouse: every reading above sees the page as it was opened.
          const pointerRing = await page.pointerRing();
          results.push({ name, view: view.name, theme, size: size.name, url: url.slice(new URL(base).origin.length), missedClicks: missed, rows: rowsBefore.map((row, index) => ({ label: row.label, auto: Boolean(row.auto), before: row, after: rowsAfter[index] })), consoleErrors: [...page.consoleErrors], pointerRing, iconsLoaded, ...measured, ...more });
          log(`evidence: ${name}.png`);
        }
      }
    }
  } finally {
    await browser.close();
    await server?.close();
  }
  // What `extra` read is for the caller: it is not written into measure.json, which a person or an assistant opens.
  const kept = results.map((result) => Object.fromEntries(Object.entries(result).filter(([key]) => !(key in extra))));
  fs.writeFileSync(path.join(out, 'measure.json'), `${JSON.stringify(kept, null, 1)}\n`);
  return results;
}

/** One line per view and click that found nothing to press (at any size or theme): the picture of that view is the page before its click. */
export function missedClicks(results) {
  const seen = new Set();
  const lines = [];
  for (const result of results) {
    for (const text of result.missedClicks ?? []) {
      const key = `${result.view}\u0000${text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(`the view "${result.view}": nothing to click or type in named "${text}".`);
    }
  }
  return lines;
}

/** The views of a file: a list (evidence.views.json), or the record `restyle-inventory` wrote (restyle-before.json, whose list is `views`). */
export function readViewsFile(file) {
  const data = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  const views = Array.isArray(data) ? data : data?.views;
  if (!Array.isArray(views)) throw new Error(`${file} holds no list of views: [{ "name", "url", "click"? }].`);
  return views;
}

export function readOptions(argv) {
  const value = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);
  return {
    url: value('--url'),
    out: value('--out') ? path.resolve(value('--out')) : outDir,
    views: readViewsFile(value('--views') ?? 'evidence.views.json'),
  };
}

// realpath: the script must also run when its folder is reached through a link.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const options = readOptions(process.argv.slice(2));
  capture(options)
    .then((results) => {
      console.log(`evidence: wrote ${results.length} screenshots and measure.json to ${path.relative(process.cwd(), options.out) || '.'}/. Open the screenshots and look at them.`);
      const missed = missedClicks(results);
      if (missed.length > 0) {
        console.error(`${missed.map((line) => `evidence: ${line}`).join('\n')}\nevidence: a step that finds nothing still writes a picture, but of the page before the step: that state was not captured. Write the aria-label, title or whole text of the control (the value of an input button), for a box to type in its label, id or name, or for a scroll step the exact aria-label, title or text of the element to bring into view, run it again, and open the new picture.`);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error(`evidence: ${error.message}`);
      process.exit(1);
    });
}
