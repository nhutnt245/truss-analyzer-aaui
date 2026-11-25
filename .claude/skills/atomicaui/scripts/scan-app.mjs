// `npm run scan -- --app ../old-app`: lists the controls of an old React app and what the kit has for each one.
// Writes conversion/scan.md (tables a person reads), conversion/scan.json (the same rows for an assistant) and, when it finds
// routes, conversion/scan.views.json (a first views file). Reads the old app, never changes it. Uses Node built-ins and the installed TypeScript package.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkMap, kitRoot, loadTables, withMap } from './scan-classify.mjs';
import { appLabel, buildReport, toJson, toMarkdown, viewsFromRoutes } from './scan-report.mjs';

const USAGE = [
  'usage: npm run scan -- --app <folder of the old app> [--out <folder>] [--strict]',
  '  --app     the old React app (its src/ folder is read; the app is never changed)',
  '  --out     where scan.md and scan.json go (default: conversion)',
  '  --strict  exit 1 while any row is "unknown"',
].join('\n');

/** The real path of a path that may not exist yet: the nearest existing parent, resolved in the file system's own letter case, plus the rest. */
function realOf(target) {
  const rest = [];
  let at = path.resolve(target);
  while (!fs.existsSync(at)) {
    if (path.dirname(at) === at) throw new Error(`scan: --out ${target} has no accessible drive or parent folder.`);
    rest.unshift(path.basename(at));
    at = path.dirname(at);
  }
  return path.join(fs.realpathSync.native(at), ...rest);
}

const inside = (parent, child) => {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

function parseArguments(argv) {
  const options = { app: null, out: 'conversion', strict: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--strict') options.strict = true;
    else if (['--app', '--out'].includes(argument)) {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) return { error: `scan: ${argument} needs a folder or file name.` };
      options[argument.slice(2)] = value;
      index += 1;
    } else {
      return { error: `scan: unknown argument ${argument}.` };
    }
  }
  if (!options.app) return { error: 'scan: --app <folder of the old app> is needed.' };
  return { options };
}

/** Runs the scan. Returns the exit code: 0 when the files were written, 1 for a wrong argument, an unreadable folder or a wrong answers file (or --strict with an unknown row). */
export async function main(argv, { cwd = process.cwd(), log = console.log, error = console.error, root = kitRoot } = {}) {
  const fail = (...lines) => {
    for (const line of lines) error(line);
    return 1;
  };
  const parsed = parseArguments(argv);
  if (parsed.error) return fail(parsed.error, USAGE);
  const { options } = parsed;
  const appDir = path.resolve(cwd, options.app);
  if (!fs.existsSync(appDir) || !fs.statSync(appDir).isDirectory()) return fail(`scan: the app folder ${appLabel(options.app)} does not exist.`, USAGE);
  const outDir = path.resolve(cwd, options.out);
  let realOut;
  try {
    realOut = realOf(outDir);
  } catch (problem) {
    return fail(problem.message);
  }
  const realApp = realOf(appDir);
  const realCwd = realOf(cwd);
  const nestedApp = realCwd !== realApp && inside(realApp, realCwd);
  if (inside(realApp, realOut) && !(nestedApp && inside(realCwd, realOut))) return fail(`scan: --out ${appLabel(options.out)} is inside the app folder. The old app is never changed: choose a folder beside it, for example conversion.`);

  let scanReact;
  try {
    ({ scanReact } = await import('./scan-react.mjs'));
  } catch (problem) {
    if (problem?.code === 'ERR_MODULE_NOT_FOUND') return fail('scan: run npm install first (the scan reads the app files with the typescript package).');
    throw problem;
  }

  const mapFile = path.resolve(cwd, options.out, 'scan-map.json');
  let appMap = {};
  if (fs.existsSync(mapFile)) {
    try {
      appMap = JSON.parse(fs.readFileSync(mapFile, 'utf8').replace(/^\uFEFF/, ''));
    } catch (problem) {
      return fail(`scan: the answers file ${appLabel(path.relative(cwd, mapFile))} is not valid JSON (${problem.message}).`);
    }
  }

  const tables = loadTables(root);
  const checked = checkMap(appMap, tables);
  if (checked.errors.length > 0) return fail(...checked.errors.map((line) => `scan: ${line}`));
  for (const line of checked.warnings) log(`scan: warning: ${line}`);

  let scan;
  const ownFolder = nestedApp ? path.relative(realApp, realCwd).split(path.sep).join('/') : null;
  try {
    scan = scanReact(appDir, tables, ownFolder ? { ...appMap, ignore: [...(appMap.ignore ?? []), ownFolder] } : appMap);
  } catch (problem) {
    return fail(`scan: ${problem.message}`);
  }
  for (const one of scan.unmatched.filter((one) => one !== `ignore ${ownFolder}`)) log(`scan: warning: answers file: ${one} matches nothing in the app (a typo?).`);
  for (const one of scan.warnings) log(`scan: warning: ${one}`);
  const report = buildReport(scan, withMap(tables, appMap), { label: appLabel(options.app), appMap });

  fs.mkdirSync(outDir, { recursive: true });
  const written = [['scan.md', toMarkdown(report)], ['scan.json', toJson(report)]];
  const views = viewsFromRoutes(scan.routes);
  if (views.length > 0) written.push(['scan.views.json', `${JSON.stringify(views, null, 2)}\n`]);
  for (const name of ['scan.md', 'scan.json', 'scan.views.json']) {
    let entry;
    try {
      entry = fs.lstatSync(path.join(outDir, name));
    } catch (problem) {
      if (problem.code !== 'ENOENT') return fail(`scan: cannot inspect ${name} (${problem.message}).`);
    }
    if (entry && (!entry.isFile() || entry.nlink > 1)) return fail(`scan: ${name} is a link or is not a regular file.`);
  }
  for (const [name, text] of written) fs.writeFileSync(path.join(outDir, name), text);
  if (views.length === 0) fs.rmSync(path.join(outDir, 'scan.views.json'), { force: true });
  log(`scan: wrote ${written.map(([name]) => `${options.out.replace(/\\/g, '/').replace(/\/$/, '')}/${name}`).join(', ')}`);
  if (report.pages.length === 0) log('scan: no router found: pages are not known from the source.');
  for (const one of report.notRead) log(`scan: not read: ${one.file} (${one.why})`);
  log(`scan: summary ${JSON.stringify(report.summary)}`);
  if (options.strict && report.summary.unknown > 0) return fail(`scan: ${report.summary.unknown} unknown kind(s) left: say what each is in the answers file, then run the scan again.`);
  return 0;
}

// realpath: the script must also run when its folder is reached through a link.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
