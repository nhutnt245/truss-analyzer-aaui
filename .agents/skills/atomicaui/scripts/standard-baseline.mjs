// The baseline of check-standard: an old app has many findings today, and a baseline lets the count only go down.
// `--baseline <file> --record` writes today's findings; later runs with `--baseline <file>` fail only on a finding that is not in the file.
// A finding is identified by its rule, the file or page it is in, and its message (never its line, which moves as the app is edited),
// and counted: a file that had three of one finding may keep three, and fails at a fourth. A run compares only the places it looked at:
// a finding of a page or file it did not look at is never fixed, and --record keeps it. Pure functions; the command reads and writes the file.
import path from 'node:path';

/** The key of one finding: rule, where, message. `where` is a file (forward slashes) or a page (`page <name>`). */
export const findingKey = ({ rule, where, message }) => `${rule} | ${String(where).replace(/\\/g, '/')} | ${message.replace(/\s+/g, ' ').trim()}`;

/** The pages of a list of view names ("standard-orders-desktop-light"), as the `where` of a finding: each page once, `page orders`. */
export const pagesOf = (views) => [...new Set(views.map((view) => `page ${view.replace(/^standard-/, '').replace(/-(desktop|narrow)-(light|dark)$/, '')}`))];
/** The name of a page's views and findings: the last part of its address, without an extension. */
export const pageSlug = (url) => (new URL(url).pathname.split('/').filter(Boolean).pop() ?? 'page').replace(/\.[a-z]+$/i, '').replace(/[^\w-]+/g, '-') || 'page';
/** The slug of a page this run measures: an address, or a view with steps ({ slug }) that check-standard opens and works before it measures. */
export const slugOf = (target) => (typeof target === 'string' ? pageSlug(target) : target.slug);
const whereOf = (key) => key.split(' | ')[1] ?? '';

/** Whether a run looked at the place of a finding: a page among the addresses it measured, a file under a file or folder it read. */
export function coveredBy({ paths, urls }) {
  const pages = new Set(urls.map(slugOf));
  const roots = paths.map((one) => path.resolve(one));
  return (where) => {
    if (where.startsWith('page ')) return pages.has(where.slice(5));
    const full = path.resolve(where);
    return roots.some((root) => {
      const inside = path.relative(root, full);
      return !/^\.\.([\\/]|$)/.test(inside) && !path.isAbsolute(inside);
    });
  };
}

/** Key to count. */
export function tally(findings) {
  const counts = new Map();
  for (const finding of findings) counts.set(findingKey(finding), (counts.get(findingKey(finding)) ?? 0) + 1);
  return counts;
}

/** The text of a baseline file: the findings, and the `kept` counts (key to count) of places the run did not look at. Sorted, so two recordings of the same findings are the same file. */
export function baselineText(findings, kept = new Map()) {
  const counts = tally(findings);
  for (const [key, count] of kept) counts.set(key, (counts.get(key) ?? 0) + count);
  const entries = Object.fromEntries([...counts].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  return `${JSON.stringify({ note: 'Findings of check-standard that are accepted for now. The count can only go down: fix findings, then record again with --record. Never edit by hand.', total, findings: entries }, null, 1)}\n`;
}

/** Reads a baseline file's text. Returns { counts: Map, total } or throws an Error that says what is wrong. */
export function readBaseline(text) {
  let data;
  try {
    data = JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch (error) {
    throw new Error(`the baseline file is not valid JSON (${error.message}).`);
  }
  if (data === null || typeof data !== 'object' || data.findings === null || typeof data.findings !== 'object' || Array.isArray(data.findings)) throw new Error('the baseline file holds no "findings" object: record it again with --record.');
  const counts = new Map();
  for (const [key, count] of Object.entries(data.findings)) {
    if (!Number.isInteger(count) || count < 1) throw new Error(`the baseline file has a count that is not a whole number above 0 for "${key}".`);
    counts.set(key, count);
  }
  return { counts, total: [...counts.values()].reduce((sum, count) => sum + count, 0) };
}

/**
 * The findings of a run against a baseline. `fresh` are the findings the baseline does not cover (in the order given), `remaining` how many the baseline covers,
 * `fixed` how many of the baseline's findings in a place the run looked at (`covered`, from coveredBy) are gone. The others were not compared: `kept`, key to count.
 */
export function applyBaseline(findings, baseline, covered = () => true) {
  const left = new Map(baseline.counts);
  const fresh = [];
  let remaining = 0;
  for (const finding of findings) {
    const key = findingKey(finding);
    if ((left.get(key) ?? 0) > 0) {
      left.set(key, left.get(key) - 1);
      remaining += 1;
    } else {
      fresh.push(finding);
    }
  }
  const kept = new Map([...left].filter(([key, count]) => count > 0 && !covered(whereOf(key))));
  const fixed = [...left].filter(([key]) => covered(whereOf(key))).reduce((sum, [, count]) => sum + count, 0);
  return { fresh, remaining, fixed, kept };
}
