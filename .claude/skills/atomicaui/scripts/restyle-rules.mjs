// The rules of the restyle path, as pure functions: what a page holds (from scripts/restyle-page.mjs) turned into a map with a suggested level
// for each kind of element, and the comparison of a page before and after. The scan's own tables (kit/scan/) say what an element is;
// this file adds only what the scan does not know: which of the four levels of kit/style/restyle.md fits, and which recipe.
import path from 'node:path';
import { behaviours, classify } from './scan-classify.mjs';
import { readJson, standardDir } from './standard-lib.mjs';
import { MARKUP_FILES, SCRIPT_FILES, SKIPPED_FOLDERS, STYLE_FILES, alignedMarks, isVendorScript } from './standard-rules.mjs';
import { alignedNames, alignedStylesheets, keptOutsideStylesheets, keptStylesheets, notAppStylesheet, realAlignedStylesheets } from './styled-rules.mjs';

export const LEVEL_NAMES = { 1: 'Replace', 2: 'Re-class', 3: 'Compose', 4: 'Align' };

/**
 * The class recipe of a kind, for a page that keeps its stack (kit/standard/recipes.json holds the ids, the mapping pages of kit/style/maps/ the levels;
 * tests hold this table to both). [level, recipe ids, the recipe page]. Level 1: the markup becomes the recipe. Level 2: the element stays, and only its class list is the recipe's.
 */
export const RECIPES = {
  button: [2, ['button-default', 'button-main', 'button-quiet', 'button-disabled'], 'button'],
  'icon-button': [2, ['icon-button'], 'button'],
  'text-input': [2, ['field-input', 'field-input-readonly'], 'field'],
  textarea: [2, ['field-textarea'], 'form'],
  'date-input': [2, ['field-date'], 'field'],
  label: [2, ['field-input'], 'field'],
  heading: [2, ['type-heading'], 'view'],
  text: [2, ['type-heading'], 'view'],
  table: [2, ['table-display', 'table-row-selected', 'table-sortable'], 'table'],
  'row-click': [2, ['table-row-selected'], 'table'],
  'grid-sorting': [2, ['table-sortable'], 'page'],
  form: [2, ['view-stack'], 'view'],
  toolbar: [2, ['view-toolbar'], 'view'],
  box: [2, ['view-panel', 'view-row', 'view-stack'], 'view'],
  card: [2, ['view-panel', 'section-card'], 'cards'],
  list: [2, ['view-panel', 'view-row', 'view-stack'], 'view'],
  menubar: [2, ['view-toolbar'], 'view'],
  icon: [2, [], 'button'],
  'number-input': [1, ['field-number-unit'], 'form'],
  checkbox: [1, ['checkbox'], 'field'],
  radio: [1, ['field-radio'], 'form'],
  switch: [1, ['field-switch'], 'form'],
  select: [1, ['select-open', 'field-select'], 'field'],
  dialog: [1, ['dialog'], 'dialog'],
  confirm: [1, ['dialog'], 'dialog'],
  'native-dialog': [1, ['dialog'], 'dialog'],
  tabs: [1, ['tabs', 'tabs-closable'], 'tabs'],
  badge: [1, ['chip-status'], 'chip'],
  accordion: [1, ['accordion-sections'], 'view'],
  collapsible: [1, ['accordion-sections'], 'view'],
  splitter: [1, ['panes-two', 'panes-side-and-pair'], 'layout'],
  tree: [1, ['tree'], 'tree'],
  banner: [1, ['message-banner'], 'view'],
  'banner-with-icon': [1, ['message-banner-with-icon'], 'view'],
};
/** The readings of an icon a banner can hold: a font icon (`fa`, `aui-icon`), an `<svg>`, an `<img>`. Such a banner takes the recipe with the library's icon slot; an icon of a control inside it (a close button, a link) is the control's, one in its heading the banner's. */
const ICON_KINDS = new Set(['icon', 'drawing', 'image']);

/** Kinds that only show things or are one thing to click and have no recipe: level 3, the style-anything procedure (kit/style/start.md). */
const COMPOSE = new Set(['avatar', 'progress', 'spinner', 'breadcrumb', 'pagination', 'link']);
/**
 * The framework classes the mapping pages put at gap (the gap rows of kit/style/maps/bootstrap.md). On an element that is no control, such a class
 * names the element, whatever role it states (Bootstrap's spinner says role="status", its bar role="progressbar", an open offcanvas role="dialog"),
 * and changes only itself: a <progress> or <meter> stays level 3, a <details> level 1, also with one of these classes, unless it is a popup.
 */
const GAP_CLASSES = new Set(['dropdown', 'tooltip', 'popover', 'offcanvas', 'collapse', 'spinner-border', 'spinner-grow', 'progress', 'progress-bar']);
/** The gap classes of a popup: on a <details> too (Pico's and DaisyUI's dropdown), the element is a popup, not a collapsible. */
const POPUP_CLASSES = new Set(['dropdown', 'tooltip', 'popover', 'offcanvas']);
/** Classes that make a collapse part of another pattern, which is read without its `collapse` class: the sections of an accordion, the links of a navbar. */
const PATTERN_COLLAPSE = new Set(['accordion-collapse', 'panel-collapse', 'navbar-collapse']);

/** What the scan sees of an element. */
const observed = (element) => ({ tag: element.tag, role: element.role, type: element.type, classes: element.classes, flags: element.flags });
/** Whether a class is one the scan's class table takes for an accordion (Bootstrap's `accordion` and `panel-group`). */
const accordionClass = (name, tables) => tables.classRows.some(([, pattern, kind]) => kind === 'accordion' && pattern.test(name));
/** Whether an element sits inside one the map read as an accordion (Bootstrap 4: div.accordion > div.card > div.collapse), from the `readings` of its ancestors. */
const inAccordion = (element, elements, readings) => {
  for (let at = element.inside; at >= 0; at = elements[at].inside) if (readings[at]?.hit?.kind === 'accordion') return true;
  return false;
};

/**
 * How the map reads an element of `elements`: the scan's classification, and the gap class that names it. A control element (an input, or a tag
 * the scan takes for a control whatever class it carries) is read as itself, but a popup class makes a <details> a popup. Any other element with
 * a gap class or an accordion class is read by that class alone, whatever role it states (Bootstrap 3 writes role="tablist" on its accordion);
 * a collapse inside an accordion is one of its sections.
 */
const reading = (element, tables, elements, readings, textOnly) => {
  const classes = element.classes.some((name) => PATTERN_COLLAPSE.has(name)) ? element.classes.filter((name) => name !== 'collapse') : element.classes;
  const control = element.tag === 'input' || tables.strongTags.has(element.tag);
  const names = (name) => {
    if (!GAP_CLASSES.has(name)) return false;
    if (control) return element.tag === 'details' && POPUP_CLASSES.has(name);
    return name !== 'collapse' || !inAccordion(element, elements, readings);
  };
  const gapClass = classes.find(names);
  const named = gapClass ?? (control ? undefined : classes.find((name) => accordionClass(name, tables)));
  const hit = classify(named ? { classes: [named] } : { ...observed(element), classes, textOnly }, tables);
  return { hit, gapClass };
};
/**
 * The reading of each of `elements`, in their order: an element's `inside` is an earlier one, so its ancestors are read before it. An element of a
 * text role (`textRoles`) is read again once its descendants are: text only when none of them reads as a kind of `boxKinds` (an icon, also an `<svg>` or `<img>`, a progress bar, a heading, a badge, a button or another control).
 */
const readingsOf = (elements, tables) => {
  const readings = [];
  for (const element of elements) readings.push(reading(element, tables, elements, readings));
  const holders = new Set();
  for (const [index, element] of elements.entries()) {
    if (!tables.boxKinds.has(readings[index].hit?.kind)) continue;
    for (let at = element.inside; at >= 0; at = elements[at].inside) holders.add(at);
  }
  for (const [index, element] of elements.entries()) {
    if (tables.textRoles.has((element.role ?? '').toLowerCase()) && !holders.has(index)) readings[index] = reading(element, tables, elements, readings, true);
  }
  return readings;
};
/** Kinds a third-party widget draws, and pictures and frames that keep their own pixels: nothing in the markup changes, it is aligned (level 4). */
const THIRD_PARTY = new Set(['chart', 'canvas', 'drawing', 'frame', 'image', 'media', 'scheduler', 'spreadsheet', 'filter-builder', 'file-manager', 'rich-text', 'data-grid', 'tree-grid', 'rating', 'color-picker']);
const LIBRARY_SETS = new Set(['devextreme', 'sweetalert2']);
/** A page of the kit as the person running the command finds it: kit/ in the starter, references/ in the skill (the style pages are in the aui-style-anything skill beside it). */
const pageOf = (where, name) => {
  const base = where.replace(/\\/g, '/').replace(/standard$/, '');
  if (/(^|\/)kit\/$/.test(base) || !name.startsWith('style/')) return `${base}${name}`;
  return path.posix.normalize(`${base.replace(/references\/$/, '')}../aui-style-anything/${name === 'style/start.md' ? 'SKILL.md' : `references/${name.slice(6)}`}`);
};

const isAui = (observation) => observation.classes.some((name) => name.startsWith('aui-'));
/** The first word of a class name: `tc-bar` and `tc_bar` are `tc`, `dxChart` is `dx`. */
const prefixOf = (name) => name.match(/^[a-z]+(?=[-_A-Z0-9]|$)/)?.[0] ?? '';
/**
 * Prefixes that never mark a widget: the plain boxes of old frameworks and hand-kept stylesheets, and utility and state classes
 * (Bootstrap and Tailwind spacing, colour, type and layout; is-, has-, js-, Angular's ng-; an app's own app-).
 */
const PLAIN_PREFIX = /^(modal|btn|form|table|nav|navbar|panel|card|list|input|dropdown|breadcrumb|pagination|alert|label|badge|well|container|row|col|page|help|checkbox|radio|tab|jumbotron|progress|carousel|glyphicon|fa|text|pull|clearfix|hidden|visible|section|toolbar|header|footer|content|wrapper|main|sidebar|menu|item|title|subtitle|button|field|grid|flex|box|group|link|icon|[mp][tbselrxy]|g[xy]|bg|fw|fs|lh|ls|font|gap|min|max|mw|mh|vw|vh|top|end|sr|sm|md|lg|xl|xxl|tw|is|has|js|no|ng|app)$/;

/**
 * The prefixes that mark a third-party widget: three or more different class names on the page's own boxes that start the same way, no word of
 * PLAIN_PREFIX, and a root: one element of the group holds two others or more, so the widget's root carries the prefix. An element of the group
 * outside it (a tooltip the widget adds to the body) is still the widget's. Each element's `inside` is the index of the drawn element it sits in (-1: none).
 */
export function widgetPrefixes(elements, tables, readings = readingsOf(elements, tables)) {
  const groups = new Map();
  elements.forEach((element, index) => {
    if (readings[index].hit !== null) return;
    for (const name of element.classes) {
      const prefix = prefixOf(name);
      if (prefix.length < 2 || prefix.length > 4 || name.startsWith('aui-') || PLAIN_PREFIX.test(prefix)) continue;
      const group = groups.get(prefix) ?? { names: new Set(), members: new Set() };
      group.names.add(name);
      group.members.add(index);
      groups.set(prefix, group);
    }
  });
  const rooted = ({ names, members }) => {
    if (names.size < 3) return false;
    const held = new Map();
    for (const index of members) for (let at = elements[index].inside; at >= 0; at = elements[at].inside) if (members.has(at)) held.set(at, (held.get(at) ?? 0) + 1);
    return [...held.values()].some((count) => count >= 2);
  };
  return new Set([...groups].filter(([, group]) => rooted(group)).map(([prefix]) => prefix));
}

/** The stop rule (kit/rules.md): no recipe and no part. */
const stopRule = (where) => ({ level: 'gap', recipes: [], read: pageOf(where, 'rules.md'), why: `no recipe or part: a form, grid or toolbar a host or another application draws is never restyled (colours by configuration only); anything else, restyle it where it is, keeping its markup, roles and behaviour, its look from the tokens and the nearest part (${pageOf(where, 'style/start.md')}); what cannot be styled is one line in GAPS.md` });

/** The suggestion for one kind: { level, recipes, read, why }. `level` is 1 to 4, or 'done' (already AtomicAUI), 'gap' (no part: the stop rule), 'ask' (a person decides). */
export function suggest(kind, answer, hit, where = 'kit/standard') {
  const recipe = RECIPES[kind === 'banner' && hit.icon ? 'banner-with-icon' : kind];
  if (hit.aui) return { level: 'done', recipes: [], read: '', why: 'already carries AtomicAUI classes: check it with check-standard' };
  if (kind.startsWith('element:')) return { level: 4, recipes: [], read: pageOf(where, 'style/align.md'), why: 'a custom element of a third-party widget: align it, never edit its markup' };
  if (kind.startsWith('tag:') || kind.startsWith('role:') || (answer === 'decide' && !THIRD_PARTY.has(kind))) return { level: 'ask', recipes: [], read: '', why: 'the scan cannot tell what this is: say what it does, then pick a level' };
  if (hit.gap) return stopRule(where);
  if (hit.library || THIRD_PARTY.has(kind)) return { level: 4, recipes: [], read: pageOf(where, 'style/align.md'), why: 'a third-party widget: align it, never edit its markup' };
  if (recipe) return { level: recipe[0], recipes: recipe[1], read: `${where}/recipes/${recipe[2]}.md`, why: recipe[0] === 1 ? 'a control AtomicAUI has: its recipe replaces the markup' : 'the element stays: only its class list becomes the recipe\'s' };
  if (answer === 'styled piece' || COMPOSE.has(kind)) return { level: 3, recipes: [], read: pageOf(where, 'style/start.md'), why: 'no recipe: it only shows things or is one thing to click' };
  return stopRule(where);
}

/**
 * The rows of a map from the observations of a page (`elements`, each with tag, role, type, classes, flags, selector, text, inlineStyle, inside).
 * One row per kind, what, AtomicAUI or not and gap or not (a lone `collapse` at gap and a section's at 1 are two rows), and per tag and class list of an unclassified box. Pure: `tables` is the scan's (loadTables) and `kinds` its answers.
 */
export function mapRows(elements, tables, where = 'kit/standard') {
  const rows = new Map();
  let plain = 0;
  let styled = 0;
  const readings = readingsOf(elements, tables);
  const widgets = widgetPrefixes(elements, tables, readings);
  const iconHolders = new Set();
  for (const [index, element] of elements.entries()) {
    if (!ICON_KINDS.has(readings[index].hit?.kind)) continue;
    for (let at = element.inside; at >= 0; at = elements[at].inside) {
      const kind = readings[at].hit?.kind;
      if (tables.boxKinds.has(kind) && !ICON_KINDS.has(kind) && kind !== 'heading') break;
      iconHolders.add(at);
    }
  }
  const add = (key, make, element) => {
    const row = rows.get(key) ?? { ...make(), count: 0, example: element.selector, text: element.text, inlineStyle: 0 };
    row.count += 1;
    if (element.inlineStyle) row.inlineStyle += 1;
    rows.set(key, row);
  };
  for (const [index, element] of elements.entries()) {
    if (element.inlineStyle) styled += 1;
    const { hit, gapClass } = readings[index];
    for (const extra of behaviours(element.flags)) {
      const entry = tables.kinds[extra.kind];
      add(`${extra.kind}|`, () => ({ kind: extra.kind, what: extra.by, answer: entry?.answer ?? 'decide', becomes: entry?.becomes ?? '', suggestion: suggest(extra.kind, entry?.answer ?? 'decide', {}, where) }), element);
    }
    if (hit === null) {
      const own = element.classes.filter((name) => !name.startsWith('aui-'));
      const widget = own.map(prefixOf).find((prefix) => widgets.has(prefix));
      if (widget) {
        add(`widget|${widget}`, () => ({ kind: 'widget', what: `${widget}-*`, answer: 'no part', becomes: 'a third-party widget: its markup stays', suggestion: suggest('chart', 'no part', {}, where) }), element);
        continue;
      }
      if (own.length === 0 && !element.inlineStyle && !element.classes.some((name) => name.startsWith('aui-'))) { plain += 1; continue; }
      if (isAui(element)) continue;
      const shape = `${element.tag}${own.map((name) => `.${name}`).join('')}`;
      const entry = tables.kinds.box;
      add(`box|${shape}`, () => ({ kind: 'box', what: shape, answer: entry.answer, becomes: entry.becomes, suggestion: suggest('box', entry.answer, {}, where) }), element);
      continue;
    }
    // A click handler on a table row is a row to pick: the table's own state, not a box that is clicked (kit/components/table.md).
    if (hit.kind === 'clickable-box' && element.tag === 'tr') hit.kind = 'row-click';
    const entry = tables.kinds[hit.kind] ?? { answer: 'decide', becomes: '' };
    const aui = isAui(element);
    const library = LIBRARY_SETS.has(hit.set);
    const gap = gapClass !== undefined;
    const icon = hit.kind === 'banner' && iconHolders.has(index);
    const what = gap || hit.by.startsWith('class ') ? `${element.tag}.${gapClass ?? hit.name}` : `${element.tag}${element.type !== undefined ? `[type=${element.type}]` : ''}${element.role ? `[role=${element.role}]` : ''}`;
    add(`${hit.kind}|${what}|${aui}|${gap}|${icon}`, () => ({ kind: hit.kind, what, answer: entry.answer, becomes: entry.becomes ?? '', suggestion: suggest(hit.kind, entry.answer, { aui, library, gap, icon }, where) }), element);
  }
  return { rows: [...rows.values()].sort((a, b) => levelOrder(a.suggestion.level) - levelOrder(b.suggestion.level) || b.count - a.count || a.kind.localeCompare(b.kind) || a.what.localeCompare(b.what)), plain, styled };
}

const levelOrder = (level) => ({ 1: 1, 2: 2, 3: 3, 4: 4, gap: 5, ask: 6, done: 7 }[level] ?? 8);
const cell = (text) => String(text ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
const levelText = (level) => (typeof level === 'number' ? `${level} ${LEVEL_NAMES[level]}` : { gap: 'gap', ask: 'ask', done: 'done' }[level] ?? String(level));

/** `restyle-map.md`: what the page holds, with a suggested level for each kind, and the columns the agent or the person fills. Same page, same file. */
export function toMap(views, { where = 'kit/standard' } = {}) {
  const lines = ['# Restyle map', '', 'Made by `node scripts/restyle-inventory.mjs`. The "Suggested" column is a first guess from the kit\'s tables; "Level used" and "What stays" are yours to fill. Levels: 1 Replace, 2 Re-class, 3 Compose, 4 Align (`' + pageOf(where, 'style/restyle.md') + '`).', ''];
  for (const view of views) {
    lines.push(`## View: ${view.name}${view.url ? ` (${view.url})` : ''}`, '', `Title: ${view.title || '(none)'}. Elements that draw: ${view.elements.length}. Plain boxes with no class and no style: ${view.plain}. Elements with a style attribute: ${view.styled}.`, '');
    lines.push(`Stylesheets the page loads: ${view.styles.links.length > 0 ? view.styles.links.map((href) => `\`${href}\``).join(', ') : 'none'}${view.styles.blocks > 0 ? `; ${view.styles.blocks} style block(s)` : ''}. The old stylesheet is deleted from every page of the scope, never re-tokened, and no new app stylesheet is written: only the \`aui/\` files, \`aui-align.css\` and the stylesheet of a widget you align (level 4) stay linked (\`node scripts/restyle-done.mjs\` fails any other).`, '');
    lines.push('| Suggested | Kind | What | Count | Example | Recipe or part | Recipe file | Level used | What stays |', '|---|---|---|---|---|---|---|---|---|');
    for (const row of view.rows) {
      const recipes = row.suggestion.recipes.length > 0 ? row.suggestion.recipes.map((id) => `\`${id}\``).join(', ') : cell(row.suggestion.why);
      lines.push(`| ${levelText(row.suggestion.level)} | ${cell(row.kind)} | \`${cell(row.what)}\` | ${row.count} | \`${cell(row.example)}\`${row.text ? ` "${cell(row.text)}"` : ''} | ${recipes} | ${cell(row.suggestion.read)} | | |`);
    }
    if (view.rows.length === 0) lines.push('| | (nothing found) | | | | | | | |');
    lines.push('');
  }
  lines.push('Say for each row which level you used. A row marked `ask` or `gap`: write what you decided and why (`' + pageOf(where, 'rules.md') + '`, the stop rule). Copy the class list of the recipe whole from the file in "Recipe file"; a kind with no recipe file is level 3 or the stop rule, never a stylesheet of your own. Recipes are in `' + where + '/recipes/`.', '');
  return lines.join('\n');
}

/** What `restyle-compare` keeps of a page: the title, the texts in reading order, and the controls (role and name). No selectors, no classes. */
export const record = (view, result) => ({ name: view.name, url: view.url ?? '', title: result.title, texts: result.texts, controls: result.controls.map(({ role, name }) => ({ role, name })) });

const normal = (text) => text.replace(/\s+/g, ' ').trim();
const occurrences = (haystack, needle) => {
  let count = 0;
  for (let at = haystack.indexOf(needle); at >= 0; at = haystack.indexOf(needle, at + 1)) count += 1;
  return count;
};

/**
 * The characters an old tree or a folding section writes as text to say "open" or "closed": the triangles and pointers (▸ ▾ ▶ ▼ ◂ ▴ and
 * their kin), the media arrows and the boxed plus and minus. The tree recipe draws its arrow as an icon, with no text, so the comparison
 * never asks for the old character: a text made only of them is left out, and they are left out of a tree item's name, before and after
 * alike. A text that holds a word as well ("▲ 12%", "Name ▲") is compared as it is, and so is the name of every other control.
 */
const FOLD = /[\u25B2-\u25C5\u23F4-\u23F7\u229E\u229F]/g;
const foldOnly = (text) => normal(text) !== '' && normal(text.replace(FOLD, ' ')) === '';
const nameOf = ({ role, name }) => (role === 'treeitem' ? normal(name.replace(FOLD, ' ')) || normal(name) : normal(name));

/**
 * The page before and after. A text is missing when it appears fewer times in the page now than it did (nodes may be split or joined, so the
 * texts are searched in the whole reading, not matched one to one). A control is missing when fewer controls with its role and name remain.
 * A text made only of fold characters is not compared (FOLD): one that is gone is listed in `foldTexts`, as a note.
 * Returns { missingTexts, missingControls, addedTexts, addedControls, foldTexts, titleChanged }. Only the first two fail the check.
 */
export function compareViews(before, after) {
  const beforeTexts = before.texts.filter((text) => !foldOnly(text)).map(normal);
  const afterTexts = after.texts.filter((text) => !foldOnly(text)).map(normal);
  const was = ` ${beforeTexts.join(' ')} `;
  const now = ` ${afterTexts.join(' ')} `;
  const seen = new Set();
  const missingTexts = [];
  for (const text of beforeTexts) {
    if (seen.has(text)) continue;
    seen.add(text);
    const lost = occurrences(was, ` ${text} `) - occurrences(now, ` ${text} `);
    if (lost > 0 || !now.includes(text)) missingTexts.push(lost > 0 && occurrences(was, ` ${text} `) > 1 ? `${text} (${lost} fewer)` : text);
  }
  // The texts that were only fold characters, by how many fewer of each the page holds now.
  const folds = (texts) => {
    const counts = new Map();
    for (const text of texts.filter(foldOnly).map(normal)) counts.set(text, (counts.get(text) ?? 0) + 1);
    return counts;
  };
  const foldsNow = folds(after.texts);
  const foldTexts = [...folds(before.texts)].filter(([text, count]) => (foldsNow.get(text) ?? 0) < count).map(([text, count]) => (count > 1 ? `${text} (${count - (foldsNow.get(text) ?? 0)} fewer)` : text));
  const tally = (controls) => {
    const counts = new Map();
    for (const control of controls) {
      const key = `${control.role}\u0000${nameOf(control)}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  };
  const had = tally(before.controls);
  const has = tally(after.controls);
  const show = (key) => {
    const [role, name] = key.split('\u0000');
    return name ? `${role} "${name}"` : `${role} with no name`;
  };
  const missingControls = [];
  const addedControls = [];
  for (const [key, count] of had) if ((has.get(key) ?? 0) < count) missingControls.push(`${show(key)}${count - (has.get(key) ?? 0) > 1 ? ` (${count - (has.get(key) ?? 0)} fewer)` : ''}`);
  for (const [key, count] of has) if ((had.get(key) ?? 0) < count) addedControls.push(`${show(key)}${count - (had.get(key) ?? 0) > 1 ? ` (${count - (had.get(key) ?? 0)} more)` : ''}`);
  const addedTexts = [];
  const added = new Set();
  for (const text of afterTexts) {
    if (added.has(text)) continue;
    added.add(text);
    if (occurrences(now, ` ${text} `) > occurrences(was, ` ${text} `) && !was.includes(text)) addedTexts.push(text);
  }
  return { missingTexts, missingControls, addedTexts, addedControls, foldTexts, titleChanged: normal(before.title) !== normal(after.title) ? { before: before.title, after: after.title } : null };
}

// ---- The end of a restyle (scripts/restyle-done.mjs): the scope is finished, or it is not. Pure functions over the files the scope holds.

/** The stylesheets the kit ships in the copied aui/ folder: the ones check-standard compares with the kit's (classes.json `files`). */
const SHIPPED_STYLESHEETS = new Set(Object.keys(readJson(path.join(standardDir(), 'classes.json')).files).filter((name) => STYLE_FILES.test(name)).map((name) => name.toLowerCase()));
export const PAGE_FILE = /\.html?$/i;
/** A whole page, not a fragment a script loads into one: the test check-standard's page rules use (standard-rules.mjs, checkMarkup). */
const WHOLE_PAGE = /<html[\s>]/i;
const slashed = (file) => file.split(path.sep).join('/');
/** A part of a URL path as the file on disk is named: `Loan%20list.html` is `Loan list.html`. */
const decoded = (part) => {
  try { return decodeURIComponent(part); } catch { return part; }
};

/** The kit's own stylesheets, from the parts of a path: a shipped one in an aui/ folder, and aui-align.css (kit/style/align.md) for a widget that is aligned. */
const kitStylesheet = (parts) => {
  const name = (parts[parts.length - 1] ?? '').toLowerCase();
  return name === 'aui-align.css' || (SHIPPED_STYLESHEETS.has(name) && (parts[parts.length - 2] ?? '').toLowerCase() === 'aui');
};

/**
 * The files of the scope: the files and folders `restyle-done` was given, read the way check-standard reads them.
 * Returns { markup, styles, aui, missing } of shown paths (with `/`); `aui` is true when a copied aui/ folder (with aui.css) was reached. The shipped
 * stylesheets of that folder are not listed; any other file in it is, like a file anywhere else in the scope. `skip` leaves out a file or folder.
 */
export function scopeFiles(paths, { exists, isDirectory, list, show = slashed, skip = () => false } = {}) {
  const found = { markup: [], styles: [], aui: false, missing: [] };
  const visit = (full) => {
    if (skip(full)) return;
    if (isDirectory(full)) {
      const copied = path.basename(full) === 'aui' && exists(path.join(full, 'aui.css'));
      if (copied) found.aui = true;
      for (const name of list(full).sort()) if (!SKIPPED_FOLDERS.has(name) && !(copied && SHIPPED_STYLESHEETS.has(name.toLowerCase()))) visit(path.join(full, name));
    } else if (MARKUP_FILES.test(full)) found.markup.push(show(full));
    else if (STYLE_FILES.test(full)) found.styles.push(show(full));
  };
  for (const one of paths) {
    if (!exists(one)) found.missing.push(one);
    else visit(path.resolve(one));
  }
  return found;
}

const LINK = /<link\b[^>]*>/gi;
const ATTRIBUTE = (name) => new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
const attribute = (tag, name) => { const match = tag.match(ATTRIBUTE(name)); return match ? (match[1] ?? match[2] ?? match[3]) : undefined; };
/** An href that is a Razor or Blazor expression (@Assets["..."], @Url.Content("..."), @Href("...")): the path it names. */
const RAZOR_HREF = /\bhref\s*=\s*["']@(?:Assets\[|Url\.Content\(|Href\()\s*["']([^"']*)["']/i;
const COMMENT = /<!--[\s\S]*?-->/g;
const STYLE_BLOCK = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const IMPORT = /@import\s+(?:url\(\s*)?(["']?)([^"')\s;]+)\1/gi;

/** The stylesheets a page loads: [{ href, line }]. Every <link rel="stylesheet"> (any attribute order, any quotes, a Razor href by the path it names) and every @import of a <style> block; none inside an HTML comment. */
export function stylesheetLinks(text) {
  const page = text.replace(COMMENT, (comment) => comment.replace(/[^\n]/g, ' '));
  const lineAt = (index) => page.slice(0, index).split('\n').length;
  const links = [];
  for (const match of page.matchAll(LINK)) {
    if (!/stylesheet/i.test(attribute(match[0], 'rel') ?? '')) continue;
    const href = match[0].match(RAZOR_HREF)?.[1] ?? attribute(match[0], 'href');
    if (href) links.push({ href, line: lineAt(match.index) });
  }
  for (const block of page.matchAll(STYLE_BLOCK)) {
    const start = block.index + block[0].indexOf('>') + 1;
    for (const one of block[1].matchAll(IMPORT)) links.push({ href: one[2], line: lineAt(start + one.index) });
  }
  return links.sort((a, b) => a.line - b.line);
}

/** The path of a link in parts, named as the files on disk are. A link to another host (https://..., //host/...) is read by its path like a local one: nothing else reads it. */
const linkParts = (href) => href.split(/[?#]/)[0].replace(/\\/g, '/').replace(/^(?:[a-z][a-z0-9+.-]*:)?\/\/[^/]*/i, '').split('/').filter(Boolean).map(decoded);

const SCRIPT_TAG = /<script\b[^>]*>/gi;
/** A src that is a Razor or Blazor expression, as RAZOR_HREF: the path it names. */
const RAZOR_SRC = /\bsrc\s*=\s*["']@(?:Assets\[|Url\.Content\(|Href\()\s*["']([^"']*)["']/i;

/**
 * The script files of the app's own that a page loads with <script src>: [{ src, line, parts, rooted }]; none inside an HTML comment. `parts` is the
 * path as the files on disk are named, `rooted` says that it starts at the site root (`/js/app.js`, `~/Scripts/app.js`) and not beside the page.
 * Left out, as other people's code or no file: a script of another host, one that is no `.js` file (a bundle route), a library or a minified
 * file by its name (isVendorScript), and one in a folder check-standard skips (lib/, vendor/, node_modules/).
 */
export function ownScripts(text) {
  const page = text.replace(COMMENT, (comment) => comment.replace(/[^\n]/g, ' '));
  const scripts = [];
  for (const match of page.matchAll(SCRIPT_TAG)) {
    const src = match[0].match(RAZOR_SRC)?.[1] ?? attribute(match[0], 'src');
    if (!src || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(src)) continue;
    const parts = linkParts(src).filter((part, index) => !(index === 0 && part === '~'));
    const name = parts[parts.length - 1] ?? '';
    if (!SCRIPT_FILES.test(name) || isVendorScript(name) || parts.slice(0, -1).some((part) => SKIPPED_FOLDERS.has(part))) continue;
    scripts.push({ src, line: page.slice(0, match.index).split('\n').length, parts, rooted: /^[~/\\]/.test(src) });
  }
  return scripts;
}

/** The pages restyle-map.md lists as not done (kit/style/restyle.md, step 2): the page files named after its "Not done" heading or line (a name in backticks whole, spaces and all), as on disk, in lower case. */
const notDonePages = (mapText) => {
  const at = mapText.search(/^\W*not done\b/im);
  if (at < 0) return [];
  const list = mapText.slice(at);
  const names = [...list.matchAll(/`([^`]+\.html?)`/gi)].map((match) => match[1]);
  names.push(...[...list.replace(/`[^`]*`/g, ' ').matchAll(/[^\s`'"()[\]|,;:*]+\.html?\b/gi)].map((match) => match[0]));
  return names.map((name) => decoded(name.trim().replace(/\\/g, '/').replace(/^(?:\.?\/)+/, '')).toLowerCase());
};

/**
 * The rows of restyle-map.md that do not say which level was used (kit/style/restyle.md, step 3): a row of a table with a "Level used" column
 * whose cell there is empty. `file` is the map as shown. Returns one problem that names the first rows and counts them all, or none: a map with
 * no such table (rewritten by hand, or none) is not held to it, and neither is the row the inventory writes for a view where it found nothing.
 */
export function levelProblems(mapText, file = 'restyle/restyle-map.md') {
  const cellsOf = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((one) => one.trim());
  const blank = [];
  // undefined: outside a table; an object: the columns of the table the lines are in (level -1: it has no "Level used" column).
  let table;
  for (const [index, text] of mapText.split('\n').entries()) {
    if (!text.trim().startsWith('|')) {
      table = undefined;
      continue;
    }
    const cells = cellsOf(text);
    if (!table) table = { level: cells.findIndex((one) => /^level used$/i.test(one)), kind: cells.findIndex((one) => /^kind$/i.test(one)), what: cells.findIndex((one) => /^what$/i.test(one)) };
    else if (table.level >= 0 && !cells.every((one) => /^:?-+:?$/.test(one)) && cells[table.kind] !== '(nothing found)' && !cells[table.level]) blank.push(`${[cells[table.kind], cells[table.what]].filter(Boolean).join(' ') || 'a row'} (line ${index + 1})`);
  }
  if (blank.length === 0) return [];
  const line = Number(/\(line (\d+)\)$/.exec(blank[0])[1]);
  return [{ rule: 'AUI-12', file, line, message: `${blank.length} row(s) of the map do not say which level was used: the "Level used" cell is empty for ${blank.slice(0, 5).join(', ')}${blank.length > 5 ? ` and ${blank.length - 5} more` : ''}.`, fix: 'Fill "Level used" in every row with the level you used for that kind (1 Replace, 2 Re-class, 3 Compose, 4 Align; for a row marked ask, gap or done, what you decided), and "What stays" with what stays (kit/style/restyle.md, step 3). A row of a page or an element the task leaves out says "not done".' }];
}

/**
 * The pages that no address of the run opens. An address opens one page: of the pages with its file name (index.html or default.html for a
 * path ending in `/`), the one whose folders end with the most folders of the address, then the one nearest the top. Two addresses of one
 * page (`/` and `/index.html`) open it once, so pages of the same name in N folders need N addresses that name their folders.
 */
export function uncoveredPages(pages, addresses) {
  const opened = new Set();
  for (const address of addresses) {
    const where = new URL(address).pathname;
    const parts = where.split('/').filter(Boolean).map((part) => decoded(part).toLowerCase());
    const name = where.endsWith('/') ? undefined : parts.pop();
    let best;
    for (const page of pages) {
      const folders = page.toLowerCase().split('/');
      const file = folders.pop();
      if (name === undefined ? !/^(index|default)\.html?$/.test(file) : file !== name) continue;
      let ends = 0;
      while (ends < parts.length && ends < folders.length && parts[parts.length - 1 - ends] === folders[folders.length - 1 - ends]) ends += 1;
      if (!best || ends > best.ends || (ends === best.ends && folders.length < best.depth)) best = { page, ends, depth: folders.length };
    }
    if (best) opened.add(best.page);
  }
  return pages.filter((page) => !opened.has(page));
}

/**
 * What stops a restyle from being done, before any browser opens. `files` is { file: shown path, text } for every markup file in the scope:
 * its pages are the `.html` files with an <html> element (a fragment a script loads is measured in the page that loads it);
 * `scope` is what scopeFiles found; `addresses` the pages the run measures; `keep` the name of the one stylesheet that stays (file and link),
 * only when `gapsText` (the app's GAPS.md) has its "Kept for pages outside the scope `name`" or "Kept stylesheet `name`" line; only the second
 * may also be linked from a page of the scope (check-standard skips the first, and the pages that use it are outside the scope). An aligned widget's own stylesheet stays too: in lib/, vendor/
 * or node_modules/, or named by an "Aligned widget stylesheet `name` of `widget`" line of GAPS.md, with the widget's own line and a page of the scope that marks it.
 * `others` is { file, text } for the pages of the app that are not among the paths (given page files only): each that still loads an app
 * stylesheet is listed under "Not done" in `mapText` (restyle-map.md), or the scope is partial and silent.
 * Returns [{ rule, file, line, message, fix }]. Empty: nothing of the old look, and no new app stylesheet, is left in the scope.
 */
export function doneProblems({ scope, files, addresses, keep, gapsText = '', others = [], mapText = '' }) {
  const problems = [];
  const asked = keep?.toLowerCase();
  const keptOutside = keptOutsideStylesheets(gapsText);
  const staying = asked !== undefined && (keptOutside.has(asked) || keptStylesheets(gapsText).has(asked)) ? asked : undefined;
  const linkable = keptOutside.has(staying) ? undefined : staying;
  const marked = new Set(files.flatMap(({ text }) => alignedMarks(text).map((mark) => mark.name)));
  const aligned = realAlignedStylesheets(alignedStylesheets(gapsText), alignedNames(gapsText), marked);
  const stays = (parts, widget, kept) => kitStylesheet(parts) || notAppStylesheet(widget, aligned) || (parts[parts.length - 1] ?? '').toLowerCase() === kept;
  const appLink = (href) => {
    const parts = linkParts(href);
    return !stays(parts, parts, linkable);
  };
  const LINES = (name) => `"- Kept for pages outside the scope \`${name}\`: which pages" when pages outside the scope still use it as it is (check-standard then skips it, it is never re-tokened, and no page of the scope links it), or "- Kept stylesheet \`${name}\`: which widget script" when it holds only the show and hide rules a kept widget script needs (kit/style/maps/bootstrap.md; check-standard reads it like any CSS of the app)`;
  const STAYS = (name) => `The one stylesheet that must stay is named with --keep ${name} and has one line in GAPS.md: ${LINES(name)}.`;
  if (asked !== undefined && staying === undefined) problems.push({ rule: 'AUI-12', file: 'GAPS.md', line: 1, message: `--keep ${keep} has no line for it in GAPS.md, so it is held to the rules like any stylesheet of the app.`, fix: `Delete the stylesheet and its links. Only when it must stay, add one line to the GAPS.md beside where you run this: ${LINES(keep)}.` });
  const NOT_NEW = 'Give its look to the elements with the recipes\' class lists, then delete it. The page ends with aui/aui.css, aui/aui-setup.css and, for a widget you align, its own stylesheet and aui-align.css, and no other stylesheet file: never a stylesheet re-tokened, moved or written new (kit/style/restyle.md, step 4). The outer-page <style> block of the layout recipe is the only CSS of your own.';
  if (!scope.aui) problems.push({ rule: 'AUI-06', file: '(the paths you gave)', line: 1, message: 'No copied aui/ folder (with aui.css) is among the paths: its files are not compared with the kit\'s.', fix: 'Copy it with node scripts/standard-copy.mjs <your static files folder> and give its folder (or the folder above it) too.' });
  for (const file of scope.missing) problems.push({ rule: 'AUI-12', file, line: 1, message: 'Nothing to check: no such file or folder.', fix: 'Give the folders or files that hold every page and every stylesheet in the scope.' });
  if (scope.markup.length === 0) problems.push({ rule: 'AUI-12', file: '(the paths you gave)', line: 1, message: 'No page of the scope was found in the paths.', fix: 'Give the folders or files that hold every page in the scope.' });
  for (const style of scope.styles) {
    const parts = style.split('/');
    const name = parts[parts.length - 1].toLowerCase();
    if (stays(parts, [name], staying)) continue;
    problems.push({ rule: 'AUI-03', file: style, line: 1, message: `The stylesheet ${style} is still in the scope: an old stylesheet or a new one of the app's own.`, fix: `${NOT_NEW} ${STAYS(name)}` });
  }
  for (const { file, text } of files) {
    for (const { href, line } of stylesheetLinks(text)) {
      if (!appLink(href)) continue;
      const parts = linkParts(href);
      if (keptOutside.has((parts[parts.length - 1] ?? '').toLowerCase())) problems.push({ rule: 'AUI-03', file, line, message: `The page still loads ${href}, a stylesheet kept for pages outside the scope: a page of the scope never links it.`, fix: 'Remove the link from this page and from every page of the scope. The file stays for the pages outside the scope that still use it; they are not among the paths you gave (kit/style/restyle.md, step 6).' });
      else problems.push({ rule: 'AUI-03', file, line, message: `The page still loads ${href}: an old stylesheet or a new one of the app's own.`, fix: `Remove the link, in every page of the scope (a page left on the old stylesheet is a page not restyled). ${NOT_NEW}` });
    }
  }
  const notDone = notDonePages(mapText);
  for (const { file, text } of others) {
    if (!PAGE_FILE.test(file) || !WHOLE_PAGE.test(text) || notDone.some((name) => file.toLowerCase() === name || file.toLowerCase().endsWith(`/${name}`))) continue;
    const loads = stylesheetLinks(text).find(({ href }) => appLink(href));
    if (loads) problems.push({ rule: 'AUI-12', file, line: loads.line, message: `${file} is not among the paths you gave and still loads ${loads.href}: a page of the app left on the old look.`, fix: 'When the task covers it, restyle it and give it (or its folder) to this command. When the task leaves it out, list it under "Not done" at the end of restyle-map.md (kit/style/restyle.md, step 2): a partial scope is declared, never silent. A page the kit ships is never read here and never yours to edit.' });
  }
  const pages = files.filter(({ file, text }) => PAGE_FILE.test(file) && WHOLE_PAGE.test(text)).map(({ file }) => file);
  for (const page of uncoveredPages(pages, addresses)) {
    problems.push({ rule: 'AUI-12', file: page, line: 1, message: `${page} is in the scope and no view of restyle-before.json opens it: it was never listed, compared or measured.`, fix: 'Restyle every page of the scope (kit/style/restyle.md, step 2): put the page in your views file as a view whose url is its path, and read the old page again with restyle-inventory (from a copy of the old folder kept in restyle/old/, which no check reads as the app, or git) before you change it.' });
  }
  return problems;
}
