// The check for pages built without the React parts (plain HTML, Razor, Blazor, other templates).
//   node scripts/check-standard.mjs <file or folder>... [--url <address>]...
//   node scripts/check-standard.mjs <file or folder>... --url <address> --views <file>   the pages of a views file (evidence.views.json, restyle/restyle-before.json) under that one address;
//                                                    a view with steps ("click": a name to click, { "fill": <box>, "with": <text> } to type) is worked first, so what a search draws is measured
//   node scripts/check-standard.mjs <file or folder>...   without --url (or with no browser found): also fails (STALE) when a file changed after the last page measurement, because the pictures in evidence/ are then of the old page
//   node scripts/check-standard.mjs --example        the kit's own example page and the three page recipes in kit/standard/pages/ (`npm run check:standard`);
//                                                    its pictures and measurement go to evidence/standard-example/, never over those of your pages
//   node scripts/check-standard.mjs <...> --baseline <file> --record   writes today's findings of an old app; the same command without --record
//                                                    then fails only on a finding that is not in the file (the count can only go down)
//   node scripts/check-standard.mjs <...> --findings <file>   also writes every finding of the run to <file> as JSON, for a command that reads them (restyle-done):
//                                                    [{ rule, message, file }] for a file finding, [{ rule, message, pages }] for a page finding, with every page it is on (`page <name>`)
// Files and folders: reads markup, CSS and scripts. Class lists against the recipes, raw colours and lengths,
//   inline styles, markup and style a script writes, restyling of the library, page setup, and that the copied aui/ folder is untouched. A stylesheet that GAPS.md names as an
//   aligned widget's own ("Aligned widget stylesheet `file` of `widget`", with the widget's own line and a page that marks it, kit/style/align.md) or as kept for pages outside the scope of a restyle
//   ("Kept for pages outside the scope `file`", kit/style/restyle.md) is skipped like lib/ and vendor/.
// --url: opens the running page in a private headless browser (desktop and narrow, light and dark),
//   checks every class list as rendered, compares every element with the same markup under the untouched
//   stylesheet (so anything that overrides the library shows), runs the spacing rules,
//   and writes screenshots to evidence/. It never opens or attaches to a debugging port.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NO_PAGE, findBrowser, launchBrowser, SETTLE_WITH_ICONS } from './browser.mjs';
import { checkLayout } from './layout-rules.mjs';
import { copyStandard, loadStandard, serveFolder, sha256, standardDir } from './standard-lib.mjs';
import { applyBaseline, baselineText, coveredBy, pagesOf, readBaseline, slugOf } from './standard-baseline.mjs';
import { readViewsFile, runSteps } from './evidence.mjs';
import { measureStandard, setTheme } from './standard-measure.mjs';
import { staleFiles, staleMessage } from './stale-evidence.mjs';
import { ALIGN_FILE, MARKUP_FILES, SCRIPT_FILES, SKIPPED_FOLDERS, STYLE_FILES, alignRoots, alignedMarks, checkAlignStyles, checkMarkup, checkRendered, checkScript, checkStyles, isVendorScript, prepare, styledPieces } from './standard-rules.mjs';
import { alignedNames, alignedStylesheets, gapNames, keptOutsideStylesheets, keptScripts, loadProfile, notAppStylesheet, realAlignedStylesheets, styledBlocks } from './styled-rules.mjs';

const SIZES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'narrow', width: 390, height: 844 },
];
/** The spacing rules are shared with the React path; these are their fixes in class form. */
export const classFixes = (where) => ({
  margin: `Add the class aui-margin-0 to the text element (type-heading in ${where}/recipes/view.md). The gap of the box around it makes the space.`,
  step: 'Use a scale class or a layout class with a token step (aui-gap-8). No CSS of your own for spacing.',
  gap: `Put both in one stack: the view-stack recipe in ${where}/recipes/view.md. Its gap makes the space.`,
  edge: `Text touches the window edge: the page has no padding. Use the page frame and pane of ${where}/example.html (the pane recipes in ${where}/recipes/layout.md).`,
  frame: `A pane touches the window edge: the page frame has no padding. Put the panes inside the page frame of ${where}/example.html (view-pane in ${where}/recipes/layout.md).`,
  card: `A body card touches its pane frame: put it in a padded row under the pane header, the view-pane recipe in ${where}/recipes/layout.md.`,
  cut: `A table is cut off by its parent. Let it scroll inside its own frame: the table-scroll recipe in ${where}/recipes/table-wide.md.`,
  stuck: `A table is wider than its frame and cannot scroll. Copy the table-scroll recipe whole from ${where}/recipes/table-wide.md and load aui/aui-behaviour.js: the table scrolls inside its own frame, header and body together. No wrapper box, no overflow class of your own.`,
  tableText: `Table text runs outside its own cell. Copy the table-scroll recipe whole from ${where}/recipes/table-wide.md and set --aui-table-min-inline-size in the style of the table (data-aui-min-inline-size stays as written; load aui/aui-behaviour.js): its columns keep enough width for their text and the table scrolls inside its own frame.`,
  pane: `A pane scrolls sideways because of a wide table. Let the table scroll inside its own frame: the table-scroll recipe in ${where}/recipes/table-wide.md.`,
  radius: 'An icon control has another corner radius than the icon button recipe. Copy the recipe class list whole (AUI-09).',
  font: `The AtomicAUI font did not load, so the page shows serif text. Open the page from a folder made by \`node scripts/standard-copy.mjs <folder>\` (it adds aui/fonts/), never from ${where}/ itself.`,
  edgeBar: `A top bar that runs from edge to edge of the window has no corners, and its buttons stay soft: copy top-bar-edge whole from ${where}/recipes/top-bar.md, or top-bar-links for a bar with page links (its four radius classes are none). Never put aui-shape-none on the bar: it would square the buttons too.`,
  insetBar: `A top bar with space around it keeps its soft corners: copy top-bar-inset whole from ${where}/recipes/top-bar.md (no radius-none class on the bar). A bar with page links keeps the links of top-bar-links and takes the bar class list of top-bar-inset.`,
  barButton: `The buttons of the top bar keep their soft corners: copy the bar whole, its buttons included, from ${where}/recipes/top-bar.md (top-bar-edge at the window edges, top-bar-inset with space around it, top-bar-links for a bar with page links).`,
  tabRow: `A tab row (data-aui-tab-row) that runs from edge to edge of the window has no corners, and one with space around it is soft: copy the block whole, tabs-edge from ${where}/recipes/tabs-edge.md at the window edges, pane-tabs-header or tabs-gapless from ${where}/recipes/tabs.md with space around it.`,
  tabsTouch: `Tabs that touch each other have no corners: copy tabs-gapless whole from ${where}/recipes/tabs.md (aui-shape-none on the tabs root and on every tab).`,
  tabsGap: `Tabs with a gap between them keep their soft corners: copy the tabs recipe whole from ${where}/recipes/tabs.md (aui-shape-soft on every tab).`,
  tabContainer: `The tab list of the recipes paints no fill of its own, so it draws no corners: copy the list whole from ${where}/recipes/tabs.md and add no colour class to it. The box that follows the window edge is the tab row: tabs-edge in ${where}/recipes/tabs-edge.md at the window edges, pane-tabs-header or tabs-gapless with space around it.`,
  tab: `The label of a closable tab sits in a span that takes the free width, so the close button is at the far right: the tabs-closable recipe in ${where}/recipes/tabs.md.`,
  inset: `What sits under a row of tabs starts at the left edge of the tab row: copy the panel of the tabs recipe whole from ${where}/recipes/tabs.md (it has no padding), and put no padded box between the panel and what it holds. Tabs in a pane header: copy pane-tabs-header whole from the same page (there the panel is the padded row of the pane, and nothing else is padded before the card).`,
  header: `The first column is left, header and cells alike: copy the first header cell of the table-display recipe whole from ${where}/recipes/table.md (it carries aui-text-align-left).`,
  cell: 'Add the layout classes aui-width-fill and aui-min-width-0 to a text field in a table cell: it fills its cell and shrinks with it.',
  bar: `A toolbar, title bar or paging bar starts at the left edge of the blocks beside it: copy the view-toolbar recipe whole from ${where}/recipes/view.md (aui-scale-default-sm, padded like a panel) beside padded blocks; beside a table that fills its card change that one class to aui-scale-block-padding-sm (no padding at the sides). Never aui-scale-compact-sm on a bar.`,
  stack: 'Load aui/aui-behaviour.js in the page (the fourth line of the page setup in page.html): it stacks the panes below 768 px and marks the frame. Never write the word stacked, a wrap class or a narrow width yourself.',
  ring: 'A click on a field leaves a focus ring. Load aui/aui-theme.js in <head> (it marks where focus came from); do not style :focus yourself.',
  overflow: 'Let the row wrap (aui-flex-wrap-wrap), or let the wide part scroll inside its own box (aui-overflow-x-auto).',
  flexOverlap: 'The first flex child shrinks below its content and paints over the next one. Give that child aui-flex-none, or let its content scroll inside its own box (aui-overflow-y-auto).',
  square: `An icon button or clickable icon is square: copy the icon-button recipe whole from ${where}/recipes/button.md. Never a size of your own.`,
  stable: 'Reserve the slot with size classes (aui-width-72 aui-height-28), or use the recipe whose height equals the row, so the row is the same size with the control hidden and shown.',
  size: 'A box is never smaller than 10 px, so aui-height-1 draws 10 px: a line is a border (aui-border-block-start-width-1 aui-border-color-outlined), never a box. A slot that grew: its content is larger than the size class; choose the size class that fits it.',
  pn1: `Put the panes in the page frame of the view-pane recipe (${where}/recipes/layout.md): 4 px above and below, 8 px at the sides, and the gap of the frame between panes. Add no padding or gap class of your own to the frame. A page with a bar of its own above the panes marks the frame data-aui-panes="page under-bar": the 4 px above are then measured from that bar. A page you restyle inside a layout you keep (its own bar, container, footer) marks the frame data-aui-panes="page in-layout": the panes are then measured from the frame, not from the window.`,
  pn2: `Copy the frame of a pane whole from the view-pane recipe (${where}/recipes/layout.md): the tinted, outlined, soft pane. Never change its colour, shape or border classes.`,
  pn3: `Copy the header of the pane whole from view-pane (28 px), or from pane-labelled-header when it holds labelled buttons, in ${where}/recipes/layout.md.`,
  pn4: `The title of a pane is the h2 of the view-pane recipe (aui-typography-typescale-l3, semi-bold) in ${where}/recipes/layout.md.`,
  pn5: `A header icon control is the icon button of the pane-labelled-header recipe (20 x 20) in ${where}/recipes/layout.md, never the plain icon-button recipe.`,
  pn6: `The body of a pane is the padded row and the card of the view-pane recipe in ${where}/recipes/layout.md: the card sits 8 px inside the frame and 4 px under the header, soft, with no border.`,
  stray: `A pane holds its header and one body card, nothing beside them: move the button row or block inside the card of the view-pane recipe in ${where}/recipes/layout.md, never beside the header or beside the card in its padded row.`,
  pn7: `Nest panes with the nested group of the panes-side-and-pair recipe in ${where}/recipes/layout.md, never inside the body of a pane.`,
  pn8: `Sections fold in one card, a 1 px line above every one but the first (accordion-sections in ${where}/recipes/view.md); cards on the pane colour are soft and 6 px apart (pane-cards in ${where}/recipes/layout.md).`,
  pn9: 'A collapsed pane is a 40 px rail with one 28 px button. Without React a pane cannot be resized or collapsed (kit/paths/build-standard.md): do not build a rail by hand.',
  pn10: `Copy the pane whole from the view-pane recipe in ${where}/recipes/layout.md; a card inside a pane is its body card; a card to pick is the selection-cards example.`,
  pn11: 'The top bar is 36 px: it holds a 28 px control. Do not set its height or padding.',
  tree: `A tree has no empty column before its labels: copy the tree recipe whole from ${where}/recipes/tree.md (TreeView rows on the surface, with no table control cell before the labels).`,
  align: `Let the buttons line up with the field boxes: copy the view-filter-row recipe whole from ${where}/recipes/view.md (aui-align-items-end on the row, never aui-align-items-center).`,
  link: 'A link in a top bar, its menu or a list of tabs, a link that marks the current page, and a tab have no underline: add the class aui-text-decoration-none. Keep the focus ring and aria-current. A link inside a paragraph of text keeps its underline.',
  shadow: 'Delete the aui-elevation class above 0. A styled piece sits in the page: aui-elevation-0 always. Only a library popup floats.',
});
// Shown with `/` on every system, so the same line reads the same on Windows and macOS.
const shown = (full) => (path.relative(process.cwd(), full).startsWith('..') ? full : path.relative(process.cwd(), full) || '.').split(path.sep).join('/');

/**
 * The gap names of a run on the kit's own example pages (`--example`): the names the app's GAPS.md holds, and the styled pieces the example pages carry.
 * The example pages are the kit's, so they need no line of the app's: an app whose GAPS.md lost the kit's lines (a file written over with one line)
 * made the kit's own pages fail with "message-banner has no line in GAPS.md", which says nothing about its screen.
 */
export function exampleGaps(gaps, folder) {
  const names = new Set(gaps);
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'aui') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (MARKUP_FILES.test(entry.name)) for (const block of styledBlocks(fs.readFileSync(full, 'utf8'))) names.add(block.name);
    }
  };
  visit(folder);
  return names;
}

/**
 * Reads markup, CSS and scripts under the given files and folders. Returns [{ rule, file, line, message, fix }]. Styled pieces found are added to `pieces`.
 * A script (.js) is read for the markup and style it writes (checkScript); a minified or bundled file, a library by its name (isVendorScript) and a file
 * in lib/ or vendor/ are other people's code: left out, and named in `skippedScripts` so the last line can say so.
 */
export function checkFiles(paths, standard, pieces = [], read = [], skippedScripts = []) {
  const problems = [];
  // The widgets aui-align.css has rules for, and the widgets pages mark: each rule set needs a marked root (kit/style/align.md).
  const roots = new Map();
  const marked = new Set();
  // Stylesheets are read after every page: an aligned widget's own is skipped only when a page marks the widget.
  const styles = [];
  const visit = (full) => {
    if (fs.statSync(full).isDirectory()) {
      if (fs.existsSync(path.join(full, 'aui.css')) && path.basename(full) === 'aui') {
        // The copied folder: not read as app code, only compared with what the kit shipped.
        for (const [name, hash] of Object.entries(standard.files)) {
          const file = path.join(full, name);
          if (!fs.existsSync(file)) problems.push({ rule: 'AUI-06', file: shown(file), line: 1, message: 'A shipped AtomicAUI file is missing.', fix: 'Copy the folder again: node scripts/standard-copy.mjs <your static files folder>.' });
          else if (sha256(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')) !== hash) problems.push({ rule: 'AUI-06', file: shown(file), line: 1, message: 'A shipped AtomicAUI file was edited.', fix: 'Copy the folder again: node scripts/standard-copy.mjs <your static files folder>. A look the library does not have is a line in GAPS.md.' });
        }
        return;
      }
      for (const name of fs.readdirSync(full).sort()) if (!SKIPPED_FOLDERS.has(name)) visit(path.join(full, name));
    } else if (MARKUP_FILES.test(full)) {
      read.push(full);
      problems.push(...checkMarkup(shown(full), fs.readFileSync(full, 'utf8'), standard));
      pieces.push(...styledPieces(shown(full), fs.readFileSync(full, 'utf8'), standard));
      for (const mark of alignedMarks(fs.readFileSync(full, 'utf8'))) marked.add(mark.name);
    } else if (SCRIPT_FILES.test(full)) {
      if (isVendorScript(path.basename(full))) {
        skippedScripts.push(shown(full));
      } else {
        read.push(full);
        problems.push(...checkScript(shown(full), fs.readFileSync(full, 'utf8'), standard));
      }
    } else if (ALIGN_FILE.test(full)) {
      read.push(full);
      problems.push(...checkAlignStyles(shown(full), fs.readFileSync(full, 'utf8')));
      for (const name of alignRoots(fs.readFileSync(full, 'utf8'))) roots.set(name, shown(full));
    } else if (STYLE_FILES.test(full)) {
      styles.push(full);
    }
  };
  for (const one of paths) {
    if (!fs.existsSync(one)) problems.push({ rule: 'AUI-12', file: one, line: 1, message: 'Nothing to check: no such file or folder.', fix: 'Give the files or folders that hold your pages, your scripts and your CSS.' });
    else visit(path.resolve(one));
  }
  const skipped = new Set([...realAlignedStylesheets(standard.alignedStylesheets ?? new Map(), standard.aligned, marked), ...(standard.keptOutside ?? [])]);
  for (const full of styles) {
    if (notAppStylesheet([path.basename(full)], skipped)) continue;
    read.push(full);
    problems.push(...checkStyles(shown(full), fs.readFileSync(full, 'utf8')));
  }
  for (const [name, file] of roots) {
    if (!marked.has(name)) problems.push({ rule: 'AUI-03', file, line: 1, message: `aui-align.css has rules for "${name}", and no page you gave marks an element data-aui-aligned="${name}".`, fix: 'Put data-aui-aligned="<name>" on the root element of the widget, and give the folders of all your pages in the same command.' });
  }
  return problems;
}

/**
 * Runs in a page: the tables that show their header and no row in the body, as { label }. A table of the library is a `.aui-table` with a
 * `tbody` of `tr` rows; a table with no visible `tr` there has nothing to read. A message row ("No results") is a row, so it passes.
 * Hidden tables (display: none, inside a hidden tab panel) are not asked.
 */
export const EMPTY_TABLES = `(() => {
  const visible = (element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
  return [...document.querySelectorAll('.aui-table')].filter(visible)
    .filter((table) => [...table.querySelectorAll('tbody tr')].filter(visible).length === 0)
    .map((table) => ({ label: table.getAttribute('aria-label') ?? table.getAttribute('aria-labelledby') ?? 'a table' }));
})()`;

/**
 * Looks at running pages. Returns [{ rule, view, message, fix }]. A page is an address, or { url, slug, click? } for a view with a name of its own (viewTargets):
 * a view with steps (kit/style/restyle.md), or a page whose address ends like another's. The page is opened and the steps run (a name to click, { fill, with } to type) at each size before it is measured, so what a search or an opened item draws is measured.
 */
export async function checkPages(urls, standard, out = path.resolve('evidence')) {
  const problems = [];
  const measures = [];
  const measureSource = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'measure-page.mjs'), 'utf8');
  // The untouched stylesheet and page setup, from the kit itself: an edited copy in the app cannot hide a difference.
  const libraryCss = ['aui.css', 'aui-setup.css'].map((name) => fs.readFileSync(path.join(standardDir(), 'aui', name), 'utf8')).join('\n');
  const browser = await launchBrowser(findBrowser());
  let views = 0;
  try {
    fs.mkdirSync(out, { recursive: true });
    const page = await browser.newPage();
    for (const target of urls) {
      const url = typeof target === 'string' ? target : target.url;
      const slug = slugOf(target);
      for (const size of SIZES) {
        await page.size(size.width, size.height);
        page.consoleErrors.length = 0;
        try {
          await page.open(url);
        } catch (error) {
          if (error.code !== NO_PAGE) throw error;
          problems.push({ rule: 'AUI-12', view: `standard-${slug}`, message: `The page at ${url} did not load: ${error.reason}.`, fix: 'Start your app, open the address in a browser yourself, and give the address that shows the page.' });
          break;
        }
        await page.evaluate(SETTLE_WITH_ICONS);
        // Before the steps, because it presses a field with the mouse: a dialog or a box the steps open would close on that press, and be measured closed.
        const pointerRing = await page.pointerRing();
        const missed = typeof target === 'string' ? [] : await runSteps(page, target.click, size.name);
        for (const theme of ['light', 'dark']) {
          const view = `standard-${slug}-${size.name}-${theme}`;
          if (missed.length > 0) problems.push({ rule: 'AUI-12', view, message: `In the view "${target.name}" nothing was found to click or type in with the name ${missed.map((name) => `"${name}"`).join(', ')}: what its steps show was not measured.`, fix: 'Write the aria-label, title or whole text of the control (the value of an input button), for a box to type in its label, id or name, or for a scroll step the exact aria-label, title or text of the element to bring into view, then run it again.' });
          const holders = await page.evaluate(`(${setTheme})(${JSON.stringify(theme)})`);
          if (holders === 0) problems.push({ rule: 'AUI-10', view, message: 'No element carries data-aui-theme, so the page has one theme at most.', fix: `Put the four data-aui-* attributes on <html> as ${standard.where}/page.html shows.` });
          await page.screenshot(path.join(out, `${view}.png`));
          const elements = await page.evaluate(`(${measureStandard})('body', ${JSON.stringify(libraryCss)})`);
          if (!elements.some((one) => one.look)) problems.push({ rule: 'AUI-01', view, message: 'The page shows no element with an AtomicAUI class.', fix: `Build the page from the class recipes in ${standard.where}/recipes/.` });
          if (!elements.some((one) => one.library)) problems.push({ rule: 'AUI-12', view, message: 'The page could not be compared with the untouched stylesheet.', fix: 'Say so in your report. (The hidden copy of the page did not match it element for element.)' });
          for (const one of checkRendered(elements, standard)) problems.push({ ...one, view });
          for (const one of await page.evaluate(EMPTY_TABLES)) problems.push({ rule: 'AUI-12', view, message: `The table "${one.label}" shows its header and no row: nothing in it can be read or looked at.`, fix: 'Fill the body with the rows of the data: one tr for each record, copied from the table-display recipe (class recipes, table.md). A table that has no records says so in one row ("No results"), never an empty body. If rows come from your script, look at the page after the script ran: an error in it (the browser console) is the usual cause.' });
          const layout = await page.evaluate(measureSource);
          for (const one of checkLayout({ name: view, ...layout, pointerRing: theme === 'light' ? pointerRing : null, consoleErrors: [...page.consoleErrors] }, classFixes(standard.where))) problems.push(one);
          // For the evidence sheet of a styled piece: what was measured of each one, and how many problems its view has.
          measures.push({ name: view, styled: layout.styled ?? [], problems: problems.filter((one) => one.view === view).length });
          views += 1;
        }
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(out, 'standard-measure.json'), `${JSON.stringify(measures, null, 1)}\n`);
  return { problems, views };
}

/**
 * The pages a views file names, under the one address they are opened at: a view with steps is { url, name, slug, click }, worked before it is measured;
 * a view without steps is its address, once. The slug names the pictures and the findings of a page, so each is given once: a name that is taken gets a
 * number after it. Pages are named first, by the last part of their address: a second page that ends the same (/Documents/Details/5 and /Parts/Details/5)
 * is { url, name, slug } with the number; then the views with steps, by their own name. Two names that differ only in case are one name: they are one
 * picture file on Windows and macOS.
 */
export function viewTargets(views, base) {
  const placed = views.map((view) => {
    const address = new URL(view.url ?? '', base);
    if (address.origin !== new URL(base).origin) throw new Error(`The url of the view "${view.name}" must be a hash, a query or a path of ${base}, not another address (got ${view.url}).`);
    return { view, url: address.href, steps: (view.click ?? []).length > 0 };
  });
  const taken = new Set();
  const unique = (name) => {
    let slug = name;
    for (let number = 2; taken.has(slug.toLowerCase()); number += 1) slug = `${name}-${number}`;
    taken.add(slug.toLowerCase());
    return slug;
  };
  const pages = new Map();
  for (const { view, url, steps } of placed) {
    if (steps || pages.has(url)) continue;
    const slug = unique(slugOf(url));
    pages.set(url, slug === slugOf(url) ? url : { url, name: view.name, slug });
  }
  const targets = [];
  for (const { view, url, steps } of placed) {
    if (steps) targets.push({ url, name: view.name, slug: unique(String(view.name).replace(/[^\w-]+/g, '-') || 'view'), click: view.click });
    else if (pages.has(url)) {
      targets.push(pages.get(url));
      pages.delete(url);
    }
  }
  return targets;
}

// realpath: the script must also run when its folder is reached through a link.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const urls = args.flatMap((arg, index) => (arg === '--url' ? [args[index + 1]] : []));
  const baselineFile = args.includes('--baseline') ? args[args.indexOf('--baseline') + 1] : undefined;
  const record = args.includes('--record');
  const findingsFile = args.includes('--findings') ? args[args.indexOf('--findings') + 1] : undefined;
  const paths = args.filter((arg, index) => !arg.startsWith('--') && !['--url', '--baseline', '--views', '--findings'].includes(args[index - 1]));
  const example = args.includes('--example');
  const pictures = example ? 'evidence/standard-example' : 'evidence';
  if (!example && urls.length === 0 && paths.length === 0) {
    console.error('check-standard: give the files or folders with your pages, and --url <address> for each running page.\n  Example: node scripts/check-standard.mjs wwwroot Pages --url http://localhost:5000/parts');
    process.exit(1);
  }
  if ((args.includes('--baseline') && (!baselineFile || baselineFile.startsWith('--'))) || (record && !baselineFile)) {
    console.error('check-standard: --baseline needs a file name, and --record needs --baseline: node scripts/check-standard.mjs wwwroot --url http://localhost:5000/ --baseline check-standard.baseline.json --record');
    process.exit(1);
  }
  if (args.includes('--findings') && (!findingsFile || findingsFile.startsWith('--'))) {
    console.error('check-standard: --findings needs a file name: node scripts/check-standard.mjs wwwroot --url http://localhost:5000/ --findings findings.json');
    process.exit(1);
  }
  const wrong = urls.find((url) => !/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?\//.test(url ?? ''));
  if (wrong !== undefined) {
    console.error(`check-standard: --url must be a local address, for example http://localhost:5000/parts (got ${wrong}).`);
    process.exit(1);
  }
  // --views: the pages of a views file (evidence.views.json, or restyle/restyle-before.json), each opened at its url under the one --url. A view with steps
  // ("click": a name to click, { "fill", "with" } to type) is worked before it is measured: what a search draws is measured, not the empty page.
  if (args.includes('--views')) {
    const viewsFile = args[args.indexOf('--views') + 1];
    if (!viewsFile || viewsFile.startsWith('--') || urls.length !== 1) {
      console.error('check-standard: --views needs a file and exactly one --url, the address its views are opened under: node scripts/check-standard.mjs wwwroot --url http://localhost:5000/ --views views.json');
      process.exit(1);
    }
    try {
      const base = urls.pop();
      urls.push(...viewTargets(readViewsFile(viewsFile), base));
      if (urls.length === 0) throw new Error(`${viewsFile} holds no views.`);
    } catch (error) {
      console.error(`check-standard: ${error.message}`);
      process.exit(1);
    }
  }
  // Styled pieces: the usage profile (shipped with the aui-style-anything skill) and the app's GAPS.md, read from where the command runs.
  const gapsFile = path.resolve('GAPS.md');
  const gapsText = fs.existsSync(gapsFile) ? fs.readFileSync(gapsFile, 'utf8') : '';
  const standard = { ...prepare(loadStandard()), profile: loadProfile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')), gaps: gapNames(gapsText), aligned: alignedNames(gapsText), kept: keptScripts(gapsText), alignedStylesheets: alignedStylesheets(gapsText), keptOutside: keptOutsideStylesheets(gapsText) };
  const pieces = [];
  let folder;
  let local;
  let failed = false;
  try {
    if (example) {
      // The kit's own example, set up the way an app is: the aui/ folder copied beside the page, then served.
      folder = fs.mkdtempSync(path.join(os.tmpdir(), 'aui-standard-'));
      copyStandard(folder);
      for (const name of ['example.html', 'page.html']) fs.copyFileSync(path.join(standardDir(), name), path.join(folder, name));
      // The page recipes (form, table, overview) are checked as pages too: each opens from <folder>/pages/ beside the copied aui/ folder.
      const pagesFrom = path.join(standardDir(), 'pages');
      const pageFiles = fs.existsSync(pagesFrom) ? fs.readdirSync(pagesFrom).filter((name) => name.endsWith('.html')).sort() : [];
      fs.mkdirSync(path.join(folder, 'pages'), { recursive: true });
      for (const name of pageFiles) fs.copyFileSync(path.join(pagesFrom, name), path.join(folder, 'pages', name));
      local = await serveFolder(folder);
      paths.push(folder);
      standard.gaps = exampleGaps(standard.gaps, folder);
      urls.push(`${local.base}example.html`, ...pageFiles.map((name) => `${local.base}pages/${name}`));
    }
    const read = [];
    const skippedScripts = [];
    const fileProblems = checkFiles(paths, standard, pieces, read, skippedScripts);
    const found = fileProblems.map((one) => ({ one, text: `${one.rule}: ${one.message} ${example ? path.basename(one.file) : one.file}:${one.line}\n    Fix: ${one.fix}` }));
    const seen = new Map();
    let looked = `${paths.length} path(s) read${skippedScripts.length > 0 ? `, ${skippedScripts.length} script file(s) skipped as other people's code (minified, bundled, or a library by name: ${skippedScripts.slice(0, 3).join(', ')}${skippedScripts.length > 3 ? ' and more' : ''})` : ''}`;
    const pagesSkipped = urls.length > 0 && !findBrowser();
    if (pagesSkipped) {
      const required = process.env.AUI_LAYOUT === 'required';
      console[required ? 'error' : 'log']('check-standard: pages SKIPPED. No Chrome for Testing, headless shell, Chrome Canary, Chromium or Edge was found (set AUI_BROWSER to its full path). No page was measured or looked at: say so in your report.');
      failed ||= required;
    } else if (urls.length > 0) {
      const { problems, views } = await checkPages(urls, standard, path.resolve(pictures));
      for (const one of problems) {
        const key = `${one.rule}: ${one.message}\n    Fix: ${one.fix}`;
        seen.set(key, { rule: one.rule, message: one.message, views: [...(seen.get(key)?.views ?? []), one.view] });
      }
      looked += `, ${views} views measured against the untouched stylesheet (desktop and narrow, light and dark)`;
    }
    if (findingsFile) fs.writeFileSync(findingsFile, `${JSON.stringify([...found.map(({ one }) => ({ rule: one.rule, message: one.message, file: one.file })), ...[...seen.values()].map((entry) => ({ rule: entry.rule, message: entry.message, pages: pagesOf(entry.views) }))], null, 1)}\n`);
    // Every finding once, for the baseline: a file finding by its file, a page finding by each page it is on.
    const findings = [
      ...found.map(({ one }) => ({ rule: one.rule, where: one.file, message: one.message, source: one })),
      ...[...seen.values()].flatMap((entry) => pagesOf(entry.views).map((page) => ({ rule: entry.rule, where: page, message: entry.message, source: entry }))),
    ];
    let shownFindings = findings;
    let baselineNote = '';
    // The pages and files this run looked at: a baseline finding anywhere else is not compared, never fixed, and kept by --record.
    const covered = coveredBy({ paths, urls: pagesSkipped ? [] : urls });
    const keptCount = (kept) => [...kept.values()].reduce((sum, one) => sum + one, 0);
    if (baselineFile && record) {
      if (pagesSkipped) throw new Error('no page was measured, so a baseline recorded now would hold none of the page findings. Record it where a browser is found.');
      const existing = fs.existsSync(baselineFile) ? readBaseline(fs.readFileSync(baselineFile, 'utf8')) : undefined;
      const compared = existing ? applyBaseline(findings, existing, covered) : { fresh: [], kept: new Map() };
      const worse = compared.fresh;
      if (worse.length > 0) throw new Error(`${worse.length} finding(s) are not in ${baselineFile}: a baseline can only go down. Fix them first. (To start a new baseline, delete the file: that is a visible change in git.)`);
      fs.writeFileSync(baselineFile, baselineText(findings, compared.kept));
      const kept = keptCount(compared.kept);
      console.log(`check-standard: recorded ${findings.length} finding(s) in ${baselineFile}${kept > 0 ? `, and kept its ${kept} finding(s) of pages and files this run did not look at` : ''}. Later runs with --baseline ${baselineFile} fail only on a finding that is not in it.`);
    } else if (baselineFile) {
      if (!fs.existsSync(baselineFile)) throw new Error(`${baselineFile} does not exist. Record it first, on the old app as it is: add --record.`);
      const baseline = readBaseline(fs.readFileSync(baselineFile, 'utf8'));
      const result = applyBaseline(findings, baseline, covered);
      shownFindings = result.fresh;
      const notCompared = keptCount(result.kept);
      baselineNote = ` Baseline ${baselineFile}: ${result.remaining} older finding(s) remain${result.fixed > 0 ? `, ${result.fixed} fixed since it was recorded${pagesSkipped ? '' : ': lower the baseline with --record'}` : ''}${notCompared > 0 ? `; ${notCompared} finding(s) of pages and files this run did not look at were not compared` : ''}.`;
    }
    const fresh = new Set(shownFindings.map((one) => one.source));
    const freshPages = new Map();
    for (const one of shownFindings) if (!fileProblems.includes(one.source)) freshPages.set(one.source, new Set([...(freshPages.get(one.source) ?? []), one.where]));
    for (const { one, text } of found) if (fresh.has(one) || (baselineFile && record)) console.error(`${text}\n`);
    for (const [text, entry] of seen) {
      const names = baselineFile && !record ? entry.views.filter((view) => freshPages.get(entry)?.has(pagesOf([view])[0])) : entry.views;
      if (names.length > 0) console.error(`${text}\n    Seen in: ${names.slice(0, 4).join(', ')}${names.length > 4 ? ` and ${names.length - 4} more` : ''}\n`);
    }
    if (pieces.length > 0) {
      console.log(`Styled pieces: ${pieces.map((piece) => `${piece.name} (${piece.file})`).join(', ')}.`);
      for (const piece of pieces) for (const look of piece.outside) console.log(`  Not a look our apps use: ${look} in ${piece.file}. Remove it, or give the reason on the evidence sheet.`);
      console.log('  Each styled piece needs its evidence sheet: styled-evidence.mjs <name> --check (in the aui-style-anything skill), after this check. If no listed view can show a transient state, fill the sheet\'s Not measured (you) reason; keep its marker and sheet.');
    }
    // No page measured (no --url, or no browser): the pictures in evidence/ are of an earlier run. If a file changed since, they show the old page.
    const measurement = path.join('evidence', 'standard-measure.json');
    const stale = (urls.length === 0 || pagesSkipped) && !example ? staleFiles(read, [path.resolve(measurement)]).map((file) => shown(file)) : [];
    if (stale.length > 0) {
      console.error(`${staleMessage('check-standard', stale, measurement.split(path.sep).join('/'), pagesSkipped ? 'Run it again where a browser is found (set AUI_BROWSER to its full path), with --url <address of each page>' : 'Run it again with --url <address of each page>')}\n`);
      failed = true;
    }
    const count = baselineFile && record ? 0 : baselineFile ? shownFindings.length : found.length + seen.size;
    if (count > 0) {
      console.error(`check-standard: ${count} ${baselineFile ? 'new problem(s) that are not in the baseline' : 'problem(s)'}.${baselineNote} Fix ${baselineFile ? 'the new ones' : 'them'}, then run it again.`);
      failed = true;
    } else if (!(baselineFile && record) && !failed) {
      console.log(`check-standard: ok. ${looked}.${baselineNote}${pagesSkipped ? ' No page was looked at.' : urls.length > 0 ? ` Screenshots are in ${pictures}/standard-*.png: open them and look before you say "done".` : ' No --url was given: no page was looked at.'}`);
    }
  } catch (error) {
    console.error(`check-standard: ${error.message}`);
    failed = true;
  } finally {
    await local?.close();
    if (folder) fs.rmSync(folder, { recursive: true, force: true });
  }
  process.stdout.write('', () => process.stderr.write('', () => process.exit(failed ? 1 : 0)));
}
