// Reads a running page the way the restyle commands need it: each view once, at desktop width in the light theme, with the pictures kept.
// `capture` (scripts/evidence.mjs) does the opening, the clicks and the private browser; this adds what scripts/restyle-page.mjs reads.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBrowser } from './browser.mjs';
import { capture } from './evidence.mjs';

const pageSource = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'restyle-page.mjs'), 'utf8');

/** The value after an option, or undefined. */
export const option = (argv, name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);

/** The address must be a local one, as for every command of the kit that opens a page. */
export const localAddress = (address) => /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?\//.test(address ?? '');

/**
 * The views to read: a file in the form of evidence.views.json (`--views`), or the one page at `--url`.
 * A view is { name, url, click? }: its url is a hash, a query or a path of the address, never another address; `click` is its steps (a name to click, { fill, with } to type).
 */
export function viewsOf(argv) {
  const file = option(argv, '--views');
  if (file) return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  return [{ name: 'page', url: '' }];
}

/**
 * Opens every view at desktop width in the light theme and reads it. Pictures go to `out` (emptied first).
 * Returns [{ view, result }] where result is what restyle-page.mjs read. Throws when no browser is found or a click in a view is not found.
 */
export async function readPages({ url, views, out }) {
  if (!findBrowser()) throw new Error('No Chrome for Testing, headless shell, Chrome Canary, Chromium or Edge was found (set AUI_BROWSER to its full path). Nothing was read: say so in your report.');
  const results = await capture({ url, views, out, log: () => undefined, extra: { restyle: pageSource } });
  const missed = results.filter((result) => result.missedClicks.length > 0 && result.size === 'desktop' && result.theme === 'light');
  if (missed.length > 0) throw new Error(`In the view "${missed[0].view}" nothing to click or type in was found with the name ${missed[0].missedClicks.map((text) => `"${text}"`).join(', ')}: write the aria-label, title or whole text of the control (the value of an input button), for a box its label, id or name, or for a scroll step the exact aria-label, title or text of the element to bring into view, then run it again.`);
  return views.map((view) => ({ view, result: results.find((one) => one.view === view.name && one.size === 'desktop' && one.theme === 'light').restyle }));
}
