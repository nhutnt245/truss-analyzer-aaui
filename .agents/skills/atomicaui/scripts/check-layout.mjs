// `npm run check:layout`: looks at every view in evidence.views.json in a private headless browser
// (desktop and narrow, light and dark) and fails on spacing the eye would catch: touching blocks,
// browser-default margins, values that are not token steps, sideways page scroll, console errors.
// --if-app-imports <module>: the views exist only while a file of the app imports the module (a pack's demo route); otherwise nothing is measured.
// --tokens: the same pass also runs the token check of `npm run check:conformance` on what it read (what `npm run verify` runs: one pass over the views, not two).
import fs from 'node:fs';
import path from 'node:path';
import { findBrowser } from './browser.mjs';
import { capture, readOptions } from './evidence.mjs';
import { isKitOwned } from './kit-files.mjs';
import { checkLayout } from './layout-rules.mjs';

const argv = process.argv.slice(2);
const needed = argv.includes('--if-app-imports') ? argv[argv.indexOf('--if-app-imports') + 1] : undefined;
if (needed) {
  const appFiles = fs.readdirSync('src', { recursive: true }).map((file) => `src/${file.split(path.sep).join('/')}`).filter((file) => /\.tsx?$/.test(file) && !isKitOwned(file));
  if (!appFiles.some((file) => [`'${needed}'`, `"${needed}"`].some((quoted) => fs.readFileSync(file, 'utf8').includes(quoted)))) {
    console.log(`check:layout: skipped: no file of the app imports ${needed}, so the app has no address for these views.`);
    process.exit(0);
  }
}
if (!findBrowser()) {
  const required = process.env.AUI_LAYOUT === 'required';
  console[required ? 'error' : 'log']('check:layout: SKIPPED. No Chrome for Testing, headless shell, Chrome Canary, Chromium or Edge was found (set AUI_BROWSER to its full path). Nothing was measured or looked at: say so in your report.');
  process.exit(required ? 1 : 0);
}
const options = readOptions(argv);
const folder = path.relative(process.cwd(), options.out) || '.';
const conformance = argv.includes('--tokens') ? await import('./check-conformance.mjs') : undefined;
const results = await capture({ ...options, log: () => undefined, ...(conformance ? { extra: { conformance: conformance.pageSource } } : {}) }).catch((error) => {
  console.error(`check:layout: ${error.message}`);
  process.exit(1);
});

/** Prints what the spacing rules found, then the icon note. True when something is wrong. */
function reportLayout() {
  const seen = new Map();
  for (const view of results) {
    for (const found of checkLayout(view)) {
      const key = `${found.rule}: ${found.message}\n    Fix: ${found.fix}`;
      seen.set(key, [...(seen.get(key) ?? []), view.name]);
    }
  }
  if (seen.size > 0) {
    for (const [text, names] of seen) console.error(`${text}\n    Seen in: ${names.slice(0, 4).join(', ')}${names.length > 4 ? ` and ${names.length - 4} more` : ''}\n`);
    console.error(`check:layout: ${seen.size} problem(s) in ${results.length} views. Screenshots: ${folder}/*.png. Fix them, then run it again.`);
    return true;
  }
  const withIcons = results.filter((view) => view.iconsLoaded !== null && view.iconsLoaded !== undefined);
  const blank = withIcons.filter((view) => !view.iconsLoaded);
  if (blank.length > 0 && blank.length < withIcons.length) {
    console.error(`check:layout: ${blank.length} of ${withIcons.length} views were photographed with blank icons although the icon font loaded in the others (${blank.slice(0, 3).map((view) => view.name).join(', ')}). Those pictures are not evidence: run it again.`);
    return true;
  }
  const iconNote = withIcons.length === 0 ? 'no view shows an icon' : blank.length === 0 ? `the icon font loaded in all ${withIcons.length} views that show icons` : `ICONS BLANK in all ${withIcons.length} views: the icon kit could not be reached, so the screenshots show empty icon boxes (say so in your report)`;
  const iconControls = results.reduce((sum, view) => sum + (view.iconControls?.length ?? 0), 0);
  console.log(`check:layout: ok. ${results.length} views measured (desktop and narrow, light and dark), ${iconControls} icon controls measured; ${iconNote}. Screenshots are in ${folder}/: open them and look before you say "done".`);
  return false;
}

// Both reports always run, so one run lists every problem of both checks.
const layoutFailed = reportLayout();
const tokensFailed = conformance ? conformance.report(results, ['tokens']) : false;
// exitCode, not exit(): the token report can be long, and a piped stream must be written out first.
process.exitCode = layoutFailed || tokensFailed ? 1 : 0;
