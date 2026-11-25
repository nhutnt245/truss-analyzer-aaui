// The app scan, layer 3 and the output: gives each kind the kit's answer, counts places and pages, and formats Markdown and JSON.
// Pure: no file access. Same input, same bytes (no date, no absolute path), so two runs on the same app give identical files.
import path from 'node:path';

const byCode = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const has = (object, key) => Object.hasOwn(object ?? {}, key);
export const ANSWER_ORDER = ['no part', 'unknown', 'decide', 'part', 'kit piece', 'plain box', 'styled piece'];
const TO_SETTLE = new Set(['no part', 'unknown', 'decide']);

/** The app folder as it is shown: as typed when relative (with `/`), only its last folder name when absolute (Windows or not). */
export function appLabel(argument, lib = path) {
  const trimmed = argument.replace(/[\\/]+$/, '');
  if (lib.isAbsolute(argument)) return lib.basename(trimmed) || trimmed;
  return trimmed.replace(/\\/g, '/') || '.';
}

/** Where a component key `file#Name` ends up: itself, or what the file exports under that name, one re-export at a time; a cycle ends. `export *` carries no default. */
export function makeResolver(scan) {
  const definitions = new Set(scan.definitions.map((one) => one.key));
  const resolve = (key, seen = new Set()) => {
    if (definitions.has(key)) return [key];
    if (seen.has(key)) return [];
    seen.add(key);
    const at = key.lastIndexOf('#');
    const file = key.slice(0, at);
    const name = key.slice(at + 1);
    return scan.reexports.filter((one) => one.file === file && (one.exported === name || (one.exported === null && name !== 'default'))).flatMap((one) => resolve(`${one.to}#${one.exported === null ? name : one.imported}`, seen));
  };
  return resolve;
}

/** A function from component keys to every definition they reach: themselves, resolved, and everything they use. */
export function makeReach(scan) {
  const resolve = makeResolver(scan);
  const edges = new Map();
  for (const use of scan.uses) edges.set(use.from, [...(edges.get(use.from) ?? []), ...resolve(use.to)]);
  return (keys) => {
    const seen = new Set();
    const queue = keys.flatMap((key) => resolve(key));
    while (queue.length > 0) {
      const key = queue.pop();
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push(...(edges.get(key) ?? []));
    }
    return seen;
  };
}

/** For each component key, the sorted paths of the routes that reach it (a route's component, and everything it uses). */
export function pagesBySource(scan) {
  const reach = makeReach(scan);
  const pages = new Map();
  for (const route of scan.routes) for (const key of reach(route.targets)) pages.set(key, new Set([...(pages.get(key) ?? []), route.path]));
  return new Map([...pages].map(([key, paths]) => [key, [...paths].sort(byCode)]));
}

/**
 * The first kind whose name words are whole words of the name, and nothing when the component already holds that kind (or one alike).
 * The name is split at capitals, digits and separators; a word may span several of them (`DropDown` is `dropdown`), never part of one (`UpdateButton` is not `date`).
 */
export function nameSays(name, holds, kinds) {
  const parts = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const words = new Set(parts.flatMap((_, start) => parts.slice(start).map((__, length) => parts.slice(start, start + length + 1).join(''))));
  for (const [kind, entry] of Object.entries(kinds)) {
    if (!entry.words?.some((word) => words.has(word))) continue;
    return [kind, ...(entry.alike ?? [])].some((one) => has(holds, one)) ? null : kind;
  }
  return null;
}

const tally = (items) => {
  const counts = new Map();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return counts;
};

/** One row per kind: the kit's answer, the places, the files and the pages. */
export function buildRows(scan, tables, pages) {
  const groups = new Map();
  for (const finding of scan.findings) groups.set(finding.kind, [...(groups.get(finding.kind) ?? []), finding]);
  const rows = [];
  for (const [kind, findings] of groups) {
    const entry = has(tables.kinds, kind) && !findings.some((one) => one.unknown) ? tables.kinds[kind] : null;
    const where = findings.map((one) => ({ file: one.file, line: one.line, by: one.by })).sort((a, b) => byCode(a.file, b.file) || a.line - b.line || byCode(a.by, b.by));
    rows.push({
      kind,
      answer: entry ? entry.answer : 'unknown',
      becomes: entry?.becomes ?? '',
      read: entry?.read ?? '',
      source: {
        places: findings.length,
        files: new Set(findings.map((one) => one.file)).size,
        pages: [...new Set(findings.flatMap((one) => pages.get(one.owner) ?? []))].sort(byCode),
        where,
      },
    });
  }
  return rows.sort((a, b) => b.source.places - a.source.places || byCode(a.kind, b.kind));
}

/** Every component of the app that is used at least once, with what it holds and what its name says. */
export function ownComponents(scan, tables, appMap = {}) {
  const resolve = makeResolver(scan);
  const uses = new Map();
  for (const use of scan.uses) for (const key of resolve(use.to)) uses.set(key, (uses.get(key) ?? 0) + 1);
  const holding = new Map();
  for (const finding of scan.findings) holding.set(finding.owner, [...(holding.get(finding.owner) ?? []), finding.kind]);
  return scan.definitions
    .filter((one) => uses.has(one.key))
    .map((one) => {
      const holds = Object.fromEntries([...tally(holding.get(one.key) ?? [])].sort((a, b) => b[1] - a[1] || byCode(a[0], b[0])));
      return { name: one.name, file: one.file, line: one.line, uses: uses.get(one.key), holds, nameSays: nameSays(one.name, holds, tables.kinds), mappedAs: has(appMap.components, one.name) ? appMap.components[one.name] : null };
    })
    .sort((a, b) => b.uses - a.uses || byCode(a.name, b.name) || byCode(a.file, b.file));
}

export function summarise(rows) {
  const kindsOf = (answer) => rows.filter((row) => row.answer === answer).length;
  return { kinds: rows.length, places: rows.reduce((sum, row) => sum + row.source.places, 0), 'no part': kindsOf('no part'), unknown: kindsOf('unknown'), decide: kindsOf('decide') };
}

/** One view per route without `:` or `*`: a first views file for the page scan (the scan's own output, written again on each run). A hash router's route is a `#/` address. */
export function viewsFromRoutes(routes) {
  const urls = new Map();
  for (const route of routes) if (!/[:*]|\(computed\)/.test(route.path)) urls.set(route.hash ? `#${route.path}` : route.path.replace(/^\//, ''), route.path);
  const names = new Set();
  return [...urls].sort((a, b) => byCode(a[1], b[1]) || byCode(a[0], b[0])).map(([url, one]) => {
    const base = one.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'home';
    let name = base;
    for (let suffix = 2; names.has(name); suffix += 1) name = `${base}-${suffix}`;
    names.add(name);
    return { name, url };
  });
}

/** Everything the two files say, as one plain object. */
export function buildReport(scan, tables, { label, appMap = {} }) {
  const pages = pagesBySource(scan);
  const rows = buildRows(scan, tables, pages);
  const routes = scan.routes.map((route) => ({ path: route.path, component: route.component, file: route.file, line: route.line })).sort((a, b) => byCode(a.path, b.path) || byCode(a.file, b.file) || a.line - b.line);
  return {
    scan: 1,
    app: { folder: label, stacks: ['react'], files: scan.files, elements: scan.elements, atomicaui: scan.atomicaui, libraries: Object.fromEntries(Object.entries(scan.libraries).sort((a, b) => byCode(a[0], b[0]))) },
    summary: summarise(rows),
    rows,
    own: ownComponents(scan, tables, appMap),
    pages: routes,
    notRead: [...scan.notRead].sort((a, b) => byCode(a.file, b.file)),
  };
}

export const toJson = (report) => `${JSON.stringify(report, null, 2)}\n`;

const cell = (text) => String(text).replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
const code = (text) => `\`${String(text).replace(/`/g, "'")}\``;
const place = (row) => (row.source.where[0] ? code(`${row.source.where[0].file}:${row.source.where[0].line}`) : '');
const seenAs = (row) => {
  const counts = [...tally(row.source.where.map((one) => one.by))].sort((a, b) => b[1] - a[1] || byCode(a[0], b[0]));
  return counts.slice(0, 3).map(([by, count]) => `${code(by)} (${count})`).join(', ') + (counts.length > 3 ? ', ...' : '');
};

const LIMITS = [
  'The source scan reads the files, not the screen. It does not see a class that comes from data or from another file, an element a script builds, or markup the server sends.',
  'It does not see text or marks that the old CSS draws, and it does not see what a library draws inside itself beyond what its settings say.',
  'It does not know what a hand-built piece is for: the table of the app\'s own components, the name hint and the answers file (`conversion/scan-map.json`) are the way.',
  'Counts are places written in the source, not things on a screen, and not an estimate of work. "Dialog" means a dialog was written, not that it behaves like one.',
];

/** The tables a person reads. */
export function toMarkdown(report) {
  const out = [];
  const settle = report.rows.filter((row) => TO_SETTLE.has(row.answer)).sort((a, b) => b.source.pages.length - a.source.pages.length || b.source.places - a.source.places || byCode(a.kind, b.kind));
  const mapped = report.rows.filter((row) => !TO_SETTLE.has(row.answer));
  const pageCount = (row) => (report.pages.length > 0 ? row.source.pages.length : '-');
  out.push('# App scan', '');
  out.push(`App folder: ${code(report.app.folder)}. Files read: ${report.app.files} (${report.app.elements} elements written). Scans run: source scan (React).`, '');
  out.push('## Summary', '', '| Answer | Kinds | Places |', '|---|---|---|');
  for (const answer of ANSWER_ORDER) {
    const rows = report.rows.filter((row) => row.answer === answer);
    if (rows.length > 0) out.push(`| ${answer} | ${rows.length} | ${rows.reduce((sum, row) => sum + row.source.places, 0)} |`);
  }
  out.push(`| **all** | **${report.summary.kinds}** | **${report.summary.places}** |`, '');
  out.push('## To settle before conversion', '');
  if (settle.length === 0) out.push('Nothing: every kind found has a part, a kit piece, a plain box or a styled piece.', '');
  else {
    out.push('Decide each row: the stop rule builds it; it is built into the kit first; or the page improvises it within the AtomicAUI standard. Write the decision in the last column.', '');
    out.push('| Kind | Answer | Places | Pages | Seen as | First place | Decision |', '|---|---|---|---|---|---|---|');
    for (const row of settle) out.push(`| ${cell(row.kind)} | ${row.answer} | ${row.source.places} | ${pageCount(row)} | ${cell(seenAs(row))} | ${cell(place(row))} | |`);
    out.push('');
  }
  out.push('## Mapped', '');
  if (mapped.length === 0) out.push('Nothing.', '');
  else {
    out.push('| Kind | Becomes | Read | Places | Pages | Seen as | First place |', '|---|---|---|---|---|---|---|');
    for (const row of mapped) out.push(`| ${cell(row.kind)} | ${cell(row.becomes)} | ${cell(row.read ? code(row.read) : '')} | ${row.source.places} | ${pageCount(row)} | ${cell(seenAs(row))} | ${cell(place(row))} |`);
    out.push('');
  }
  out.push("## The app's own components", '');
  if (report.own.length === 0) out.push('None used.', '');
  else {
    out.push('| Name | File | Used in places | Holds | Name says | Mapped as |', '|---|---|---|---|---|---|');
    for (const one of report.own) {
      const holds = Object.entries(one.holds).map(([kind, count]) => `${kind} ${count}`).join(', ') || 'nothing the scan knows';
      out.push(`| ${cell(one.name)} | ${cell(code(`${one.file}:${one.line}`))} | ${one.uses} | ${cell(holds)} | ${one.nameSays ?? ''} | ${one.mappedAs ?? ''} |`);
    }
    out.push('');
  }
  out.push('## Pages', '');
  if (report.pages.length === 0) out.push('No router found: pages are not known from the source.', '');
  else {
    out.push('| Path | Component | Place |', '|---|---|---|');
    for (const route of report.pages) out.push(`| ${cell(code(route.path))} | ${cell(route.component)} | ${cell(code(`${route.file}:${route.line}`))} |`);
    out.push('');
  }
  out.push('## Not read', '');
  if (report.notRead.length === 0) out.push('Every file was read.', '');
  else out.push(...report.notRead.map((one) => `- ${code(one.file)}: ${one.why}`), '');
  out.push('## What this scan cannot see', '', ...LIMITS.map((line) => `- ${line}`), '');
  return `${out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}
