// The behaviour check, for any page: React or not, whatever built it.
//   node scripts/check-behaviour.mjs --url <address>...   every select, dialog and tabs part on each running page
//   node scripts/check-behaviour.mjs --reference          the kit's own reference page (`npm run check:behaviour`)
//   node scripts/check-behaviour.mjs --react              the real React parts against the shipped specifications
//                                                         (starter only: fails first when a library update changes behaviour)
//   --size 800x500                                        the window size, for a page that lives in a frame
// It presses real keys and clicks in a private headless browser and compares, step for step, what a keyboard user and
// a screen reader are given with the record of the real React part: focus, roles, names, states, the open layer and
// the page behind it. A part with the shape the specification was recorded on is compared with that record. A part
// with another shape (more options, other buttons) is compared with the real component given that shape, where the
// starter is present; elsewhere it is NOT CHECKED, which fails the check unless GAPS.md owns up to it (below). A run
// where no part could be checked exits 1. An enabled select whose trigger names a list (aria-controls), or an enabled
// dialog opener, that does not open on Enter is a difference from the React part. A disabled one, and a select whose
// trigger has no aria-controls, is NOT CHECKED without failing. It never opens or attaches to a debugging port.
// A tab set of 2 to 5 tabs is compared with the record of its own size whatever the tabs are called, with no starter needed.
// A part that could not be compared because its shape is not the recorded one (and the real component is not here to ask), or because the
// specification does not cover it, FAILS the check, unless GAPS.md owns up to it with a line "- Behaviour not checked `<view>`: <why>".
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NO_PAGE, PAGE_LOAD_MS, findBrowser, launchBrowser } from './browser.mjs';
import { PARTS, compare, countRecord, explain, maskNames, maskWords, openPart, readShape, record, stateDataOf, stepsFor, stepsOf, tabsRecord } from './behaviour-run.mjs';
import { copyStandard, loadStandard, serveFolder, standardDir } from './standard-lib.mjs';
import { prepare } from './standard-rules.mjs';

const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SETTLE = 'document.fonts.ready.then(() => new Promise((resolve) => setTimeout(resolve, 300)))';
// The React part was recorded between a button before it and one after it. On a page where the part is first or last
// in the tab order, Tab and Shift+Tab leave the page for the browser's own controls: a focus stop at each end of the page
// stands for those, so leaving the page compares as leaving the part.
const PAGE_ENDS = `for (const end of ['prepend', 'append']) {
  const stop = document.createElement('span');
  stop.tabIndex = 0;
  stop.style.position = 'fixed';
  document.body[end](stop);
}`;
const NOT_COVERED = { closable: 'tabs with close buttons', disabledTab: 'a disabled tab', other: 'a control in the dialog that is not a text field or a footer button' };
// What an enabled part that stays closed on Enter shows, and what makes the kit's script open it.
const OPENS = {
  select: { shown: 'no list (role="listbox") is shown', hint: ', with aria-controls on the trigger naming the id of its list' },
  dialog: { shown: 'no dialog is shown', hint: ', with data-aui-dialog-open on the opener naming the id of the dialog' },
};

/** The views GAPS.md owns up to: every "- Behaviour not checked `<page> <part> <n>`" line (read from the folder the command runs in). */
export function ownedUp(gapsText) {
  return new Set([...gapsText.matchAll(/^\s*-\s*behaviour not checked `([^`]+)`/gim)].map((match) => match[1].trim().toLowerCase()));
}

/**
 * Whether every difference of a dialog (from `compare`) is only where its focus starts or the order of its buttons, which the old page or the
 * spec may decide (AUI-08): focus on another place inside the dialog (an item, the dialog itself, its title or description, or inside one of
 * them), and an item that is there on both sides with another name, class list or focused state. Focus that leaves the dialog, an item that is
 * gone or added, another role, tab stop or attribute of an item, and anything of the layer or the page behind are not.
 */
export function focusOrOrderOnly(differences) {
  const inside = /^(?:inside )?(?:item \d+|dialog|title|description)$/;
  return differences.length > 0 && differences.every((one) => !one.unsettled && (one.what === 'focus'
    ? inside.test(one.expected) && inside.test(one.found)
    : /^parts > (?:item \d+|dialog|title|description) > reader > states > focused$/.test(one.what) || (/^parts > item \d+ > (?:reader > name|classes)$/.test(one.what) && one.expected !== 'absent' && one.found !== 'absent')));
}

export const loadSpecs = (root = here) => Object.fromEntries(PARTS.map((part) => [part, JSON.parse(fs.readFileSync(path.join(standardDir(root), 'behaviour', `${part}.json`), 'utf8'))]));

/** The real components, for a part whose shape is not the recorded one. Only where the starter (Vite and the library) is present. */
async function startReal(root) {
  if (!fs.existsSync(path.join(root, 'src/standard/behaviour.html'))) return null;
  try {
    const { createServer } = await import('vite');
    const server = await createServer({ root, logLevel: 'silent', server: { host: '127.0.0.1', port: 0, strictPort: false, open: false } });
    await server.listen();
    return { address: `http://127.0.0.1:${server.httpServer.address().port}/src/standard/behaviour.html`, close: () => server.close() };
  } catch {
    return null;
  }
}

/**
 * Checks every pilot part on each page. Returns { problems: [{ rule, view, message, fix, url }], checked, steps, notChecked: [text], notes: [text], uncompared, pagesWithParts };
 * `url` is the address of the page a problem is on, and a problem that only says a part was NOT CHECKED (no GAPS.md line owns up to it) has `notChecked: true`. A dialog whose differences are only where
 * its focus starts or the order of its buttons (focusOrOrderOnly) has `focusOrOrder: true`.
 * `real` true: the pages are the React fixtures themselves, so a difference means the library changed.
 * `flag`: the flag that started this run (--reference, --react) when the pages are the kit's own, served only while it runs.
 * `cwd`: the folder whose GAPS.md owns up to a part left unchecked (restyle-done runs this for an app that is elsewhere than the process folder).
 */
export async function checkBehaviour(urls, { root = here, size = { width: 1440, height: 900 }, real = false, flag, cwd = process.cwd() } = {}) {
  const standard = prepare(loadStandard(root));
  const specs = loadSpecs(root);
  const stateData = stateDataOf(fs.readFileSync(path.join(standardDir(root), 'aui/aui.css'), 'utf8'));
  const where = standard.where;
  // The exact command that gives an answer for a part left NOT CHECKED: this script, on the page's address (from a kit starter for a shape it cannot ask the React part about).
  const script = `node ${path.relative(process.cwd(), fileURLToPath(import.meta.url)).split(path.sep).join('/')}`;
  const command = `${script} --url`;
  const again = (url) => (flag ? `${script} ${flag}` : `${command} ${url}`);
  const fixFor = (part, step, hint = '') => (real
    ? `The library's behaviour changed. Record it again (npm run behaviour:build), read the difference in ${where}/behaviour/${part}.md, and bring aui/aui-behaviour.js into line.`
    : `Read step ${step} in ${where}/behaviour/${part}.md. Load aui/aui-behaviour.js as copied and write the part as ${where}/behaviour/reference.html does${hint}; or make your own code do what that step says. Never change the specification.`);
  const problems = [];
  const notChecked = [];
  const gapsFile = path.resolve(cwd, 'GAPS.md');
  const owned = ownedUp(fs.existsSync(gapsFile) ? fs.readFileSync(gapsFile, 'utf8') : '');
  // `notes`: things worth knowing that are neither a difference nor a part left unchecked.
  const notes = [];
  // `uncompared`: parts that were found and could not be compared. `pagesWithParts`: pages that show at least one part.
  let uncompared = 0;
  // A part that could not be compared because of its shape is a failure, unless GAPS.md owns up to this view: a claim of "not checked" costs a line.
  const unchecked = (view, why) => {
    uncompared += 1;
    if (owned.has(view.toLowerCase())) notChecked.push(`${view}: ${why} (GAPS.md owns up to it)`);
    else problems.push({ rule: 'AUI-12', view, notChecked: true, message: `NOT CHECKED: ${why}`, fix: `Make it checkable: ${where}/behaviour/reference.html has the recorded shapes${real ? '' : ', and tabs of 2 to 5 tabs are compared on any page'}; or run the check where the kit starter is. Where that cannot be done, add one line to GAPS.md, - Behaviour not checked \`${view}\`: <why, and what you did by hand>, and say NOT CHECKED in your report.` });
  };
  let pagesWithParts = 0;
  let checked = 0;
  let steps = 0;
  // Where the problems of each page start in `problems`: every problem is given the address of its page before this returns.
  const pageStarts = [];
  // The command says SKIPPED before it comes here; a caller that runs this itself (restyle-done) is told why nothing was pressed.
  const executable = findBrowser();
  if (!executable) throw new Error('No Chrome for Testing, headless shell, Chrome Canary, Chromium or Edge was found (set AUI_BROWSER to its full path): no key was pressed on any page.');
  const browser = await launchBrowser(executable);
  let twin = null;
  try {
    const page = await browser.newPage();
    await page.size(size.width, size.height);
    const load = async (url) => {
      await page.open(url);
      await page.evaluate(SETTLE);
    };
    for (const url of urls) {
      pageStarts.push({ url, at: problems.length });
      const slug = (new URL(url).pathname.split('/').filter(Boolean).pop() ?? 'page').replace(/\.[a-z]+$/i, '').replace(/[^\w-]+/g, '-') || 'page';
      try {
        await load(url);
      } catch (error) {
        if (error.code !== NO_PAGE) throw error;
        problems.push({ rule: 'AUI-12', view: slug, message: `The page at ${url} did not load: ${error.reason}.`, fix: 'Start your app, open the address in a browser yourself, and give the address that shows the page.' });
        continue;
      }
      // A page that sends the browser to another address is not the page that was asked for.
      const arrived = await page.evaluate('location.href');
      if (new URL(arrived).origin !== new URL(url).origin) {
        problems.push({ rule: 'AUI-12', view: slug, message: `The page at ${url} did not load: the browser ended at ${arrived}.`, fix: 'Start your app, open the address in a browser yourself, and give the address that shows the page.' });
        continue;
      }
      await openPart(page, 'tabs', 0, stateData);
      const counts = await page.evaluate('window.__auiBehaviour.count()');
      if (PARTS.every((part) => counts[part] === 0)) notChecked.push(`${slug}: the page shows no select, dialog or tabs part. A page that has none of the three parts needs no behaviour check: say so. A dialog is counted when the button that opens it carries data-aui-dialog-open="<dialog id>": write it as the dialog recipe (${where}/recipes/dialog.md), closed, as ${where}/behaviour/reference.html does, then run: ${again(url)}`);
      else pagesWithParts += 1;
      const lookalikes = await page.evaluate('window.__auiBehaviour.lookalikes()');
      if (lookalikes.select > 0) problems.push({ rule: 'AUI-01', view: slug, message: `${lookalikes.select} element(s) look like a select trigger but are not one for a screen reader.`, fix: `Keep role="combobox" and aria-haspopup="listbox" on the trigger, as the select-open recipe in ${where}/recipes/field.md writes it.` });
      if (lookalikes.tabs > 0) problems.push({ rule: 'AUI-01', view: slug, message: `${lookalikes.tabs} element(s) look like a tab list but are not one for a screen reader.`, fix: `Keep role="tablist" on the list, as the tabs recipe in ${where}/recipes/tabs.md writes it.` });
      if (lookalikes.dialog > 0) {
        notChecked.push(`${slug}: ${lookalikes.dialog} dialog(s) have no element with data-aui-dialog-open="<dialog id>", so the check cannot open them. Add the attribute, then run: ${again(url)}`);
        uncompared += lookalikes.dialog;
      }
      for (const part of PARTS) {
        for (let index = 0; index < counts[part]; index++) {
          const view = `${slug} ${part} ${index + 1}`;
          await load(url);
          if (!(await openPart(page, part, index, stateData))) {
            // Counted a moment ago and gone now: never skip it without saying so.
            notChecked.push(`${view}: the part was on the page when it was counted and was not there when the check came to it (a page that draws its parts late, or draws them again). Run it again: ${again(url)}`);
            uncompared += 1;
            continue;
          }
          const shape = await readShape(page, part);
          const named = `${part} ${index + 1}${shape.label || shape.opener ? ` ("${shape.label ?? shape.opener}")` : ''}`;
          if (shape.closed) {
            // The React fixtures are enabled and have a list: there a part that stays closed is always a difference.
            const why = !real && {
              disabled: `its ${part === 'select' ? 'trigger' : 'opener'} is disabled, so it stays closed and its steps cannot be taken. Check it on a page where it is enabled: ${command} <address of that page>`,
              'no list': `its trigger has no aria-controls, so it has no list: the closed look alone, as the field-select recipe. A select that works is the select-open recipe in ${where}/recipes/field.md.`,
            }[shape.closed];
            if (why) {
              notChecked.push(`${view}: ${why}`);
              uncompared += 1;
            } else problems.push({ rule: 'AUI-08', view, message: `${named} does not behave like the React part: it did not open on Enter. After focus on it and Enter, ${OPENS[part].shown}; the React part opens at step 2.`, fix: fixFor(part, 2, OPENS[part].hint) });
            continue;
          }
          const gap = Object.keys(NOT_COVERED).find((key) => shape[key]);
          if (gap) {
            unchecked(view, `${NOT_COVERED[gap]} is not covered by the specification of this kit version.`);
            continue;
          }
          let expected = specs[part].steps;
          // Tabs of a size the specification holds are compared with the record of that size, whatever the tabs are called.
          const sized = part === 'tabs' ? tabsRecord(specs.tabs, shape) : null;
          let counted = null;
          if (sized) expected = sized.steps;
          else if (JSON.stringify(shape) !== JSON.stringify(specs[part].fixture)) {
            twin ??= (await startReal(root)) ?? false;
            if (!twin) counted = countRecord(specs[part], shape);
            if (counted) expected = counted.steps;
            else if (!twin) {
              unchecked(view, `its shape is not the one the specification was recorded on, and the real component is not present here to ask. Run this in a copy of the kit starter (a clone of the kit with npm install done): \`node scripts/check-behaviour.mjs --url ${url}\`. Or show it on a page with the recorded shape (${where}/behaviour/reference.html).`);
              continue;
            } else {
              await load(`${twin.address}?fixtures=${encodeURIComponent(JSON.stringify([shape]))}`);
              if (!(await openPart(page, part, 0, stateData))) {
                unchecked(view, `the real component could not be drawn with this shape. Show the part on a page with the recorded shape (${where}/behaviour/reference.html) and run: ${command} <address of that page>`);
                continue;
              }
              expected = await record(page, stepsFor(shape));
            }
          }
          await load(url);
          await openPart(page, part, index, stateData);
          await page.evaluate(PAGE_ENDS);
          page.consoleErrors.length = 0;
          const found = await record(page, stepsOf({ steps: expected }));
          const compared = compare(expected, sized ? maskNames(found, sized.names) : counted ? maskWords(found, counted.shape) : found, standard.fixedOf);
          const restless = compared.filter((one) => one.unsettled);
          const differences = compared.filter((one) => !one.unsettled);
          checked += 1;
          steps += expected.length;
          if (restless.length > 0) problems.push({ rule: 'AUI-12', view, message: `${named}: ${restless.length} of ${expected.length} steps never came to rest and were not compared. The first:\n      ${explain(restless).join('\n      ')}`, fix: 'Run the check again with less load on the machine. If the same steps come back, something on the page keeps moving after them: find the animation or transition and let it end.' });
          if (differences.length > 0) {
            const first = differences[0];
            problems.push({
              rule: 'AUI-08',
              view,
              message: `${named} does not behave like the React part: ${differences.length} difference(s) in ${new Set(differences.map((one) => one.step)).size} of ${expected.length} steps. The first:\n      ${explain(differences).join('\n      ')}`,
              fix: fixFor(part, first.step),
              ...(part === 'dialog' && focusOrOrderOnly(differences) ? { focusOrOrder: true } : {}),
            });
          }
          // A page that draws the part again while it is in use may throw away what the user just did (an open list, a pick).
          // That is not itself a difference from the React part: if something was lost, a step above says so. It is said, not counted.
          if (found.redraws > 0) notes.push(`${view}: the page replaced the elements of this part ${found.redraws} time(s) while it was being used. The check went on with the new elements. If the steps are the same, nothing was lost this time; a page that swaps elements under the user can still lose focus or state where no step looks.`);
          if (page.consoleErrors.length > 0) problems.push({ rule: 'AUI-12', view, message: `Browser console while using ${part} ${index + 1}: ${page.consoleErrors[0].slice(0, 160)}`, fix: 'Fix the error.' });
        }
      }
    }
  } finally {
    await browser.close();
    if (twin) await twin.close();
  }
  for (const [index, one] of problems.entries()) one.url = pageStarts.findLast((start) => start.at <= index).url;
  return { problems, checked, steps, notChecked, notes, uncompared, pagesWithParts };
}

/**
 * What one or more runs of checkBehaviour found, as the command prints it: `lines` are the problems, the NOT CHECKED lines and the notes (all
 * to the error stream), `verdict` the line that says how it ended, `failed` whether the command fails on it, `summary` the one line a script
 * can read, and the counts behind them. restyle-done prints the same lines, and decides on the problems outside a dialog that are differences.
 */
export function reportOf(results) {
  const problems = results.flatMap((one) => one.problems);
  const checked = results.reduce((sum, one) => sum + one.checked, 0);
  const steps = results.reduce((sum, one) => sum + one.steps, 0);
  // Parts that were found on a page and could not be compared: not the same thing as a page that shows no part.
  const uncompared = results.reduce((sum, one) => sum + one.uncompared, 0);
  const lines = [
    ...problems.map((one) => `${one.rule}: ${one.view}: ${one.message}\n    Fix: ${one.fix}\n`),
    ...results.flatMap((one) => one.notChecked).map((text) => `NOT CHECKED: ${text}`),
    ...results.flatMap((one) => one.notes).map((text) => `NOTE: ${text}`),
  ];
  let verdict;
  if (problems.length > 0) verdict = `check-behaviour: ${problems.length} problem(s)${checked > 0 ? ` (${checked} part(s) were checked)` : ''}. Fix them, then run it again.`;
  // Parts were found and none could be compared: nothing was proved, so this is not a pass.
  else if (checked === 0 && uncompared > 0) verdict = `check-behaviour: no part was checked: ${uncompared} part(s) could not be compared here (above). Nothing is known about their behaviour: say so in your report.`;
  else if (checked === 0) verdict = 'check-behaviour: no part was checked. Give the address of a page that shows a select, a dialog or tabs.';
  else verdict = `check-behaviour: ok. ${checked} part(s), ${steps} steps, each the same as the React part${uncompared > 0 ? `; ${uncompared} part(s) NOT CHECKED (above): say so in your report` : ''}. It does not hear a screen reader speak and does not judge touch: the checklist covers those.`;
  // One line a script can read: an "ok" with parts not checked is not the same as every part checked.
  const summary = `check-behaviour: summary ${JSON.stringify({ checked, steps, notChecked: uncompared, problems: problems.length })}`;
  return { lines, verdict, failed: problems.length > 0 || checked === 0, summary, problems, checked, steps, uncompared };
}

// realpath: the script must also run when its folder is reached through a link.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const urls = args.flatMap((arg, index) => (arg === '--url' ? [args[index + 1]] : []));
  const [width, height] = (args[args.indexOf('--size') + 1] ?? '').split('x').map(Number);
  const size = args.includes('--size') && width > 0 && height > 0 ? { width, height } : undefined;
  const reference = args.includes('--reference');
  const react = args.includes('--react');
  if (!reference && !react && urls.length === 0) {
    console.error('check-behaviour: give --url <address> for each running page.\n  Example: node scripts/check-behaviour.mjs --url http://localhost:5000/parts\n  A part NOT CHECKED because of its shape fails the check (AUI-12) unless GAPS.md has a line "- Behaviour not checked `<page> <part> <n>`: <why>". A disabled select or opener, and a select with no list, is NOT CHECKED without failing. A run where no part could be checked exits 1.');
    process.exit(1);
  }
  const wrong = urls.find((url) => !/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?\//.test(url ?? ''));
  if (wrong !== undefined) {
    console.error(`check-behaviour: --url must be a local address, for example http://localhost:5000/parts (got ${wrong}).`);
    process.exit(1);
  }
  if (!findBrowser()) {
    const required = process.env.AUI_LAYOUT === 'required';
    console[required ? 'error' : 'log']('check-behaviour: SKIPPED. No Chrome for Testing, headless shell, Chrome Canary, Chromium or Edge was found (set AUI_BROWSER to its full path). No key was pressed on any page: say so in your report.');
    process.exit(required ? 1 : 0);
  }
  let folder;
  let local;
  let server;
  let failed = false;
  try {
    if (reference) {
      // The kit's own reference page, set up the way an app is: the aui/ folder copied beside the page, then served.
      folder = fs.mkdtempSync(path.join(os.tmpdir(), 'aui-behaviour-'));
      copyStandard(folder);
      fs.copyFileSync(path.join(standardDir(), 'behaviour/reference.html'), path.join(folder, 'reference.html'));
      local = await serveFolder(folder);
    }
    if (react) {
      server = await startReal(here);
      if (!server) {
        console.error('check-behaviour: --react needs the kit starter (Vite and src/standard/behaviour.html).');
        process.exit(1);
      }
    }
    const results = [];
    if (urls.length > 0) results.push(await checkBehaviour(urls, { size }));
    if (local) results.push(await checkBehaviour([`${local.base}reference.html`], { size, flag: '--reference' }));
    if (server) results.push(await checkBehaviour([server.address], { size, real: true, flag: '--react' }));
    const report = reportOf(results);
    for (const line of report.lines) console.error(line);
    console[report.failed ? 'error' : 'log'](report.verdict);
    console.log(report.summary);
    failed = report.failed;
  } catch (error) {
    const loading = /Timed out waiting for Page\.loadEventFired/.test(error.message);
    console.error(`check-behaviour: ${loading ? `a page did not load within ${PAGE_LOAD_MS / 1000} seconds. Is the app running at the address you gave, and does it answer in a browser?` : error.message}`);
    failed = true;
  } finally {
    await local?.close();
    await server?.close();
    if (folder) fs.rmSync(folder, { recursive: true, force: true });
  }
  process.exit(failed ? 1 : 0);
}
