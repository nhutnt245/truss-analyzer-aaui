// `node scripts/icon-kit.mjs <app folder>` adds the AtomicAUI Global Kit (icons) to every page of an app that lacks it.
// `--check` only reports. Pages: .html, .htm, .cshtml, .razor files that have a <head>. Run it as the first step of a build without React.
// A page that names another kit id is reported, never rewritten: ask who owns the page.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const GLOBAL_KIT_ID = 'c852ddbb54';
export const GLOBAL_KIT_TAG = `<script src="https://kit.fontawesome.com/${GLOBAL_KIT_ID}.js" crossorigin="anonymous"></script>`;
const SKIPPED = new Set(['node_modules', '.git', 'bin', 'obj', 'dist', 'build', 'evidence']);
const PAGE = /\.(html?|cshtml|razor)$/i;
const KIT_URL = /kit\.fontawesome\.com\/([A-Za-z0-9]+)\.js/g;

/** Pure: what one page needs. Returns { skip, wrongIds, missing }. */
export function inspectPage(text) {
  if (!/<head[\s>]/i.test(text)) return { skip: true, wrongIds: [], missing: false };
  const ids = [...text.matchAll(KIT_URL)].map((match) => match[1]);
  return { skip: false, wrongIds: ids.filter((id) => id !== GLOBAL_KIT_ID), missing: !ids.includes(GLOBAL_KIT_ID) };
}

/** Pure: the page with the Global Kit tag as the last thing in <head>, indented like the line before it. */
export function addKitTag(text) {
  return text.replace(/([ \t]*)<\/head>/i, (whole, indent) => `${indent}  ${GLOBAL_KIT_TAG}\n${whole}`);
}

export function walkPages(folder) {
  const found = [];
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && !SKIPPED.has(entry.name)) found.push(...walkPages(full));
    } else if (PAGE.test(entry.name)) found.push(full);
  }
  return found;
}

export function ensureIconKit(folder, { write }) {
  const added = [];
  const wrongId = [];
  for (const file of walkPages(folder)) {
    const text = fs.readFileSync(file, 'utf8');
    const page = inspectPage(text);
    if (page.skip) continue;
    if (page.wrongIds.length > 0) wrongId.push(file);
    else if (page.missing) {
      added.push(file);
      if (write) fs.writeFileSync(file, addKitTag(text));
    }
  }
  return { added, wrongId };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const target = args.find((arg) => !arg.startsWith('--'));
  if (!target || !fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    console.error('icon-kit: say which app folder to set up, for example: node scripts/icon-kit.mjs .');
    process.exit(1);
  }
  const check = args.includes('--check');
  const { added, wrongId } = ensureIconKit(path.resolve(target), { write: !check });
  for (const file of added) console.log(`icon-kit: ${check ? 'missing in' : 'added to'} ${file}`);
  for (const file of wrongId) console.error(`icon-kit: ${file} loads a different icon kit. Do not change it yourself: ask who owns the page (the kit uses ${GLOBAL_KIT_ID}).`);
  console.log(`icon-kit: ${added.length} page(s) ${check ? 'without' : 'now with'} the AtomicAUI Global Kit, ${wrongId.length} with another kit.`);
  process.exit(wrongId.length > 0 || (check && added.length > 0) ? 1 : 0);
}
