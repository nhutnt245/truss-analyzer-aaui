// `node scripts/restyle-done.mjs <the pages, scripts and CSS in scope, and the aui/ folder> --url <address of the restyled page> [--out <folder>] [--keep <stylesheet file name>]`
// The last step of kit/style/restyle.md. A restyle is done only when this exits 0; it is the precondition of the words "done", "restyled" and "follows the design system".
// It holds the whole scope to four things, and says every one that fails (a failure never hides the next step):
//   1 the old look is gone: no page of the scope links a stylesheet of the app's own (old, re-tokened or new; the outer-page <style> block of the layout recipe is not a link), no such file is in the scope,
//     every page of the scope (an .html file with <html>: a fragment is measured in the page that loads it) is one the run measures (one address, one page),
//     and the copied aui/ folder is among the paths. --keep names the file name of the one stylesheet that stays, and only with its "Kept for pages outside
//     the scope `name`" or "Kept stylesheet `name`" line in the GAPS.md of the folder it runs in. A link to another host is read like a local one. Given page
//     files, every other .html page in the folders of those files (read down; never one the kit wrote, nor the output folder) that still loads an app
//     stylesheet is listed under "Not done" in <out>/restyle-map.md: a partial scope is declared, never silent;
//   2 `check-standard` reports zero problems on every page of the record (desktop and narrow, light and dark), with no baseline: a baseline is for work in progress.
//     It reads the paths given and every script of the app's own that a page of the scope loads with <script src> and that is not among them (it says
//     which): what a script draws after a search is look, and a script that was not given never passes unread. One it finds no file for was not
//     read, and that is a failure: run the command from the app's root folder, or name the script's file or folder;
//   3 `restyle-compare` finds every text and control of the old page, with its role and name, in every view of the record;
//   4 `check-behaviour` finds no problem in any select, dialog or tabs part of the pages of the record, each as it opens.
//     A dialog that differs from the React part only in where its focus starts or the order of its buttons is printed and does not stop
//     "done": the old page or the spec decides those (AUI-08): focus on another place inside the dialog, and a button there on both sides with
//     another name, class list or focused state. A dialog that does not open, a console error while using it, steps that never came to rest,
//     another role, tab stop or attribute of a button, and every other difference are NOT DONE. Neither a part it could not compare (NOT CHECKED) nor a page that shows none of
//     the three parts stops "done". Each is said, and yours to say in your final message.
// It also fails while a row of <out>/restyle-map.md has an empty "Level used" cell: the map says what was done to each kind of element.
// Pages are the views of <out>/restyle-before.json (written by restyle-inventory before the first edit), opened under the address given.
// Nothing measured is nothing done: no browser, no record, no page is a failure. It never changes the page and never opens a debugging port.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KIT_MANIFEST } from './kit-files.mjs';
import { HOST_PAGE } from './pack-use.mjs';
import { localAddress, option } from './restyle-read.mjs';
import { main as compare } from './restyle-compare.mjs';
import { PAGE_FILE, doneProblems, levelProblems, ownScripts, scopeFiles, uncoveredPages } from './restyle-rules.mjs';
import { slugOf } from './standard-baseline.mjs';
import { viewTargets } from './check-standard.mjs';
import { checkBehaviour, reportOf } from './check-behaviour.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const USAGE = 'usage: node scripts/restyle-done.mjs <the pages, scripts and CSS in scope, and the aui/ folder>... --url <local address of the restyled page> [--out <folder holding restyle-before.json>] [--keep <file name of the one stylesheet that stays, with its line in GAPS.md>]';
const OPTIONS_WITH_VALUE = new Set(['--url', '--out', '--keep']);

const paths = (argv) => argv.filter((arg, index) => !arg.startsWith('--') && !OPTIONS_WITH_VALUE.has(argv[index - 1]));

/** Reads the files and folders of the scope as they are on disk, each shown from `cwd` with `/`. */
const walkIn = (cwd) => ({ exists: fs.existsSync, isDirectory: (full) => fs.statSync(full).isDirectory(), list: fs.readdirSync, show: (full) => (path.relative(cwd, full).startsWith('..') ? full : path.relative(cwd, full) || '.').split(path.sep).join('/') });

/**
 * The whole .html pages in the folders of the page files given, read down, as shown paths. None the kit wrote (a folder that holds KIT.json, a file
 * kit/KIT.json lists, the Aras pack's host page) and none in the output folder `out`, where a copy of the old folder is kept (restyle/old/): no walk
 * of this command or of check-standard reads that folder as the app.
 */
export function pagesAround(pageFiles, { cwd, out }) {
  const manifest = path.join(cwd, KIT_MANIFEST);
  const sealed = new Set(fs.existsSync(manifest) ? JSON.parse(fs.readFileSync(manifest, 'utf8')).files.map((one) => path.resolve(cwd, one.path)) : []);
  const kitWrote = (full) => full === out || fs.existsSync(path.join(full, 'KIT.json')) || sealed.has(full) || full === path.resolve(cwd, HOST_PAGE);
  return [...new Set(scopeFiles(pageFiles.map((one) => path.dirname(one)), { ...walkIn(cwd), skip: kitWrote }).markup)].filter((file) => PAGE_FILE.test(file));
}

/**
 * The scripts of the app's own that the pages of the scope load (`files`: { file, text } of its markup) and that are not among the paths (`targets`,
 * full paths): check-standard reads them too. A src is looked for beside its page, then, the longest end of its path first, under the folders given,
 * the folders of the files given and `cwd` (a path from the site root: `/js/app.js`, `~/Scripts/app.js`). Never the copied aui/ folder: it is not app code.
 * Returns { added, unfound }: the full paths to read, and what no file was found for, as "src (file:line)".
 */
export function scriptsLoaded(files, targets, cwd) {
  const isFile = (full) => fs.existsSync(full) && fs.statSync(full).isFile();
  const roots = [...new Set([...targets.filter((one) => fs.existsSync(one)).map((one) => (fs.statSync(one).isDirectory() ? one : path.dirname(one))), cwd])];
  const given = (full) => targets.some((one) => full === one || full.startsWith(`${one}${path.sep}`));
  const copied = (full) => path.basename(path.dirname(full)) === 'aui' && fs.existsSync(path.join(path.dirname(full), 'aui.css'));
  const added = new Set();
  const unfound = [];
  for (const { file, text } of files) {
    const beside = path.dirname(path.resolve(cwd, file));
    for (const { src, line, parts, rooted } of ownScripts(text)) {
      const plain = parts.filter((part) => part !== '.' && part !== '..');
      const candidates = [...(rooted ? [] : [path.resolve(beside, ...parts)]), ...plain.flatMap((_, from) => roots.map((root) => path.join(root, ...plain.slice(from))))];
      const full = candidates.find(isFile);
      if (!full) unfound.push(`${src} (${file}:${line})`);
      else if (!given(full) && !copied(full)) added.add(full);
    }
  }
  return { added: [...added], unfound };
}

/** The addresses the run measures: the views of the record, once each, under the address given. */
export function addressesOf(views, url) {
  return [...new Set(views.map((view) => new URL(view.url ?? '', url).href))];
}

/**
 * One remaining-work line per kind and file, under the detailed findings, each finding once for every file it is in, and their total last.
 * `problems` are the entries of doneProblems; `standardFindings` what check-standard wrote with --findings (a file finding with its file, a page
 * finding with every page it is on); `compareErrors` what restyle-compare printed as errors; `behaviourProblems` the differences check-behaviour
 * found, each with the address of its page; `pages` the page files of the scope as shown paths.
 * A page finding of check-standard, a finding of restyle-compare (its view) and one of check-behaviour are in the page file their address opens,
 * the one doneProblems holds that address to; an address that opens no file of the scope is named by its path. The kind is the rule, `stylesheet`
 * for an app stylesheet left or linked, `text` or `control` for what restyle-compare misses, and `behaviour` for a select, dialog or tabs part that does not pass check-behaviour.
 */
export function remainingGroups({ problems = [], standardFindings = [], compareErrors = '', behaviourProblems = [], views = [], url, pages = [] }) {
  const groups = new Map();
  const add = (kind, file) => groups.set(`${kind}\u0000${file}`, (groups.get(`${kind}\u0000${file}`) ?? 0) + 1);
  const fileOf = (address) => {
    const unopened = uncoveredPages(pages, [address]);
    return pages.find((page) => !unopened.includes(page)) ?? address.slice(new URL(address).origin.length);
  };
  let named;
  const fileOfPage = (page) => {
    named ??= new Map(viewTargets(views, url).map((target) => [`page ${slugOf(target)}`, typeof target === 'string' ? target : target.url]));
    return named.has(page) ? fileOf(named.get(page)) : page;
  };
  for (const one of problems) add(/^The (stylesheet|page still loads) /.test(one.message) ? 'stylesheet' : one.rule, one.file);
  for (const one of standardFindings) for (const file of new Set(one.pages ? one.pages.map(fileOfPage) : [one.file])) add(one.rule, file);
  for (const line of compareErrors.split('\n')) {
    const message = /^AUI-\d+: (.*)$/.exec(line)?.[1];
    const view = message && views.find((one) => message.endsWith(` in the view "${one.name}".`) || message.startsWith(`The title of the view "${one.name}" was "`));
    if (view) add(message.startsWith('Missing control ') ? 'control' : 'text', fileOf(new URL(view.url ?? '', url).href));
  }
  for (const one of behaviourProblems) add('behaviour', fileOf(one.url));
  if (groups.size === 0) return [];
  const lines = [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([key, count]) => {
    const [kind, file] = key.split('\u0000');
    return `Remaining: ${kind} in ${file}: ${count} problem(s).`;
  });
  return [...lines, `Remaining in all: ${[...groups.values()].reduce((sum, count) => sum + count, 0)} problem(s).`];
}

/**
 * check-standard in its own process (never spawnSync: the page may be served by this very process), with a missing browser a failure.
 * Returns { code, out, err, findings }: `findings` is what it wrote with --findings, none when it ended before it looked.
 */
function runCheckStandard(targets, url, recordFile, cwd) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'aui-findings-'));
  const findingsFile = path.join(folder, 'findings.json');
  // The views of the record, with their steps (a search typed and pressed), opened under the address given: what a search draws is measured too.
  const args = [path.join(here, 'check-standard.mjs'), ...targets, '--url', url, '--views', recordFile, '--findings', findingsFile];
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { cwd, env: { ...process.env, AUI_LAYOUT: 'required' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    const end = (code) => {
      const findings = fs.existsSync(findingsFile) ? JSON.parse(fs.readFileSync(findingsFile, 'utf8')) : [];
      fs.rmSync(folder, { recursive: true, force: true });
      resolve({ code, out, err, findings });
    };
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.stderr.on('data', (chunk) => { err += chunk; });
    child.on('error', (problem) => {
      err += `\n${problem.message}`;
      end(1);
    });
    child.on('close', (code) => end(code ?? 1));
  });
}

/**
 * `cwd` is where the app is (GAPS.md is read from there, as check-standard does); a test runs it elsewhere than the process folder.
 * `behaviour` is the behaviour check of step 4 (checkBehaviour): a test of the other steps gives its own, because the real one presses every
 * key of every part again and takes half a minute a run in the kit starter.
 */
export async function main(argv, { log = console.log, error = console.error, cwd = process.cwd(), behaviour = checkBehaviour } = {}) {
  const url = option(argv, '--url');
  if (!url || !localAddress(url)) {
    error(`restyle-done: --url must be the local address of the restyled page you started (got ${url ?? 'nothing'}).\n${USAGE}`);
    return 1;
  }
  if (argv.includes('--baseline') || argv.includes('--record')) {
    error('restyle-done: a baseline is for work in progress (kit/style/restyle.md, step 4). Done is zero problems without one: fix the findings, delete the baseline file, and run this again.');
    return 1;
  }
  const keeps = argv.flatMap((arg, index) => (arg === '--keep' ? [argv[index + 1]] : []));
  if (keeps.length > 1 || keeps.some((name) => !name || name.startsWith('--'))) {
    error(`restyle-done: --keep names one stylesheet, once (--keep site.css), and only with its line in GAPS.md ("Kept for pages outside the scope \`site.css\`" or "Kept stylesheet \`site.css\`"): every other stylesheet of the app is deleted (kit/style/restyle.md, step 6).\n${USAGE}`);
    return 1;
  }
  if (keeps.some((name) => /[\\/\s`]/.test(name))) {
    error(`restyle-done: --keep takes the file name of the stylesheet, with no folder and no space: --keep site.css, not --keep css/site.css (got ${keeps[0]}). Its GAPS.md line names the same file name.\n${USAGE}`);
    return 1;
  }
  const targets = paths(argv).map((one) => path.resolve(cwd, one));
  if (targets.length === 0) {
    error(`restyle-done: give the folders or files of every page, script and stylesheet in the scope, and the aui/ folder.\n${USAGE}`);
    return 1;
  }
  const out = path.resolve(cwd, option(argv, '--out') ?? 'restyle');
  const recordFile = path.join(out, 'restyle-before.json');
  let views;
  try {
    views = JSON.parse(fs.readFileSync(recordFile, 'utf8')).views;
    if (!Array.isArray(views) || views.length === 0) throw new Error('it holds no views');
  } catch (problem) {
    error(`restyle-done: ${path.relative(cwd, recordFile) || recordFile} cannot be read (${problem.message}). Run node scripts/restyle-inventory.mjs on the old page first, before you change it: a restyle with no record of the old page is not done.`);
    return 1;
  }
  const addresses = addressesOf(views, url);
  const failed = [];

  // 1 The old look is gone, and no new one was written.
  const scope = scopeFiles(targets, { ...walkIn(cwd), skip: (full) => full === out });
  const read = (file) => ({ file, text: fs.readFileSync(path.resolve(cwd, file), 'utf8') });
  const files = scope.markup.map(read);
  const pageFiles = targets.filter((one) => fs.existsSync(one) && !fs.statSync(one).isDirectory());
  const others = pagesAround(pageFiles, { cwd, out }).filter((file) => !scope.markup.includes(file)).map(read);
  const gapsFile = path.join(cwd, 'GAPS.md');
  const gapsText = fs.existsSync(gapsFile) ? fs.readFileSync(gapsFile, 'utf8') : '';
  const mapFile = path.join(out, 'restyle-map.md');
  const mapText = fs.existsSync(mapFile) ? fs.readFileSync(mapFile, 'utf8') : '';
  const problems = doneProblems({ scope, files, addresses, keep: keeps[0], gapsText, others, mapText });
  for (const one of problems) error(`${one.rule}: ${one.message} ${one.file}:${one.line}\n    Fix: ${one.fix}\n`);
  if (problems.length > 0) failed.push(`the old look is not gone (${problems.length} problem(s))`);
  // The map says which level each kind of element got: a row left empty is a kind nobody accounted for.
  const unlevelled = levelProblems(mapText, walkIn(cwd).show(mapFile));
  for (const one of unlevelled) error(`${one.rule}: ${one.message} ${one.file}:${one.line}\n    Fix: ${one.fix}\n`);
  if (unlevelled.length > 0) failed.push('restyle-map.md has rows with an empty "Level used" cell');

  // 2 check-standard: zero.
  const loaded = scriptsLoaded(files, targets, cwd);
  if (loaded.added.length > 0) log(`restyle-done: also read, because a page of the scope loads it: ${loaded.added.map(walkIn(cwd).show).join(', ')}.`);
  if (loaded.unfound.length > 0) {
    error(`restyle-done: not read, because no file was found for it under the paths you gave or the folder this runs in: ${loaded.unfound.join(', ')}. The markup and style a script writes are look, and a script that was not read is never a pass: run this command from the app's root folder, or name the script's file or folder among the paths.`);
    failed.push(`a script that a page of the scope loads was not read (${loaded.unfound.length})`);
  }
  const standard = await runCheckStandard([...targets, ...loaded.added], url, recordFile, cwd);
  if (standard.out.trim()) log(standard.out.trimEnd());
  if (standard.err.trim()) error(standard.err.trimEnd());
  if (standard.code !== 0 || !/check-standard: ok\./.test(standard.out) || /SKIPPED/.test(standard.out)) failed.push('check-standard does not report zero');

  // 3 restyle-compare: nothing lost.
  const lines = [];
  const compareErrors = [];
  const code = await compare(['--url', url, '--out', out], { log: (line) => { lines.push(line); log(line); }, error: (line) => { compareErrors.push(line); error(line); } });
  if (code !== 0 || !lines.some((line) => /^restyle-compare: ok\./.test(line))) failed.push('restyle-compare finds a text or control of the old page gone');

  // 4 check-behaviour: no problem in a select, a dialog or tabs. It prints what the command prints; a dialog that differs only in where its focus
  // starts or the order of its buttons, and a part that could not be compared, are said and do not stop "done".
  let behaved = null;
  try {
    behaved = reportOf([await behaviour(addresses, { cwd })]);
  } catch (problem) {
    error(`check-behaviour: ${problem.message}`);
    failed.push('check-behaviour did not run, so no key was pressed on any page');
  }
  const differences = behaved ? behaved.problems.filter((one) => !one.notChecked && !one.focusOrOrder) : [];
  const inDialogs = behaved ? behaved.problems.filter((one) => one.focusOrOrder) : [];
  // What step 4 says and does not fail on, for the result line and the line under the check's own.
  const said = behaved ? [
    ...(inDialogs.length > 0 ? [`${inDialogs.length} dialog(s) that differ only in where focus starts or the order of the buttons (above; the old page or the spec decides them): say each one in your final message`] : []),
    ...(behaved.uncompared > 0 ? [`${behaved.uncompared} part(s) NOT CHECKED (above): say NOT CHECKED in your final message`] : []),
    ...(behaved.checked + behaved.uncompared === 0 ? ['the pages of the record show no select, dialog or tabs part'] : []),
  ] : [];
  if (behaved) {
    for (const line of behaved.lines) error(line);
    (behaved.failed ? error : log)(behaved.verdict);
    log(behaved.summary);
    if (differences.length > 0) failed.push(`check-behaviour finds a part that does not behave like the React part (${differences.length} problem(s))`);
    if (said.length > 0) log(`restyle-done: not stopping "done" in check-behaviour: ${said.join('; ')}.`);
  }

  if (failed.length > 0) {
    error(`restyle-done: NOT DONE. ${failed.join('; ')}. Fix them and run this command again; do not write "done", "restyled" or "follows the design system" until it ends with "restyle-done: ok".`);
    for (const line of remainingGroups({ problems: [...problems, ...unlevelled], standardFindings: standard.findings, compareErrors: compareErrors.join('\n'), behaviourProblems: differences, views, url, pages: scope.markup.filter((file) => PAGE_FILE.test(file)) })) error(line);
    error(`Next: Fix one kind or one page (use node scripts/aui-class.mjs for class lists), then run node scripts/restyle-done.mjs ${argv.map((arg) => `'${arg.replaceAll("'", "'\\''")}'`).join(' ')}.`);
    return 1;
  }
  const parts = said.length === 0 ? `${behaved.checked} select, dialog or tabs part(s) the same as the React part` : behaved.checked + behaved.uncompared === 0 ? 'no select, dialog or tabs part to check' : `no part differs from the React part beyond what is said (${[...(inDialogs.length > 0 ? [`${inDialogs.length} dialog(s) differ only in where focus starts or the order of the buttons`] : []), ...(behaved.uncompared > 0 ? [`${behaved.uncompared} part(s) NOT CHECKED`] : [])].join(', ')}: say so)`;
  log(`restyle-done: ok. ${addresses.length} page(s) of the record: no old or new app stylesheet, check-standard zero, every text and control of the old page still there, ${parts}. Open restyle/after/ and evidence/standard-*.png and look before you claim anything.`);
  return 0;
}

// realpath: the script must also run when its folder is reached through a link.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => process.stdout.write('', () => process.stderr.write('', () => process.exit(code))));
}
