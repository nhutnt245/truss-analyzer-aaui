// The app scan, layer 1 and 2: turns an observation (a tag, a role, classes, flags) into a kind, the neutral word for the job.
// Pure: it reads the tables of kit/scan/ and nothing else. The answer for each kind (part, no part, ...) is the kit's: kit/scan/kinds.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const has = (object, key) => Object.hasOwn(object, key);

/** The answers a kind can have in the kit's table; `unknown` is made by the scan, never listed. */
export const ANSWERS = ['part', 'kit piece', 'plain box', 'styled piece', 'no part', 'decide'];
/** The only answers an app's own answers file may give to a kind the kit does not know. */
export const MAP_ANSWERS = ['no part', 'decide'];
export const dateBoxKind = (type, whenMissing = 'date-input') => {
  if (type === undefined) return whenMissing;
  if (type === null) return 'datebox';
  const value = type.toLowerCase();
  if (value === 'date') return 'date-input';
  if (value === 'datetime') return 'datetime-input';
  if (value === 'time') return 'time-input';
  return 'datebox';
};

/** Reads the four tables. In the starter they are in kit/scan/, in the packed skill in references/scan/. */
export function loadTables(root = kitRoot) {
  const folder = ['kit/scan', 'references/scan'].map((relative) => path.join(root, relative)).find((candidate) => fs.existsSync(path.join(candidate, 'kinds.json')));
  if (!folder) throw new Error('The scan tables (kit/scan/kinds.json and its three companions) were not found.');
  const read = (name) => JSON.parse(fs.readFileSync(path.join(folder, name), 'utf8'));
  const html = read('html.json');
  const classes = read('classes.json');
  const libraries = read('libraries.json');
  return {
    kinds: read('kinds.json'),
    kindsPath: folder.endsWith(`${path.sep}references${path.sep}scan`) ? 'references/scan/kinds.json' : 'kit/scan/kinds.json',
    roles: html.roles,
    partRoles: new Set(html.partRoles),
    textRoles: new Set(html.textRoles),
    boxKinds: new Set(html.boxKinds),
    tags: html.tags,
    strongTags: new Set(html.strongTags),
    inputTypes: html.inputTypes,
    quietTags: new Set(html.quietTags),
    classRows: Object.entries(classes.sets).flatMap(([set, rows]) => rows.map(([pattern, kind]) => [set, new RegExp(pattern), kind])),
    machinery: new RegExp(classes.machinery.join('|')),
    libraries,
    renderers: new Set(libraries.renderers ?? []),
    jqueryPlugins: libraries.jqueryPlugins ?? {},
  };
}

/** The tables plus the kinds the app's answers file adds. A kind the kit knows keeps the kit's answer. */
export function withMap(tables, appMap) {
  const kinds = { ...tables.kinds };
  for (const [kind, entry] of Object.entries(appMap?.kinds ?? {})) {
    if (!has(kinds, kind)) kinds[kind] = { answer: entry.answer, becomes: entry.note ?? '', read: '' };
  }
  return { ...tables, kinds };
}

/** The problems of an answers file. `errors` stop the scan, `warnings` are printed. */
export function checkMap(appMap, tables) {
  const errors = [];
  const warnings = [];
  const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  if (!record(appMap)) return { errors: ['answers file: expected an object.'], warnings };
  for (const section of ['kinds', 'components', 'classes', 'elements']) {
    if (appMap[section] !== undefined && !record(appMap[section])) errors.push(`answers file: ${section} must be an object.`);
  }
  if (appMap.ignore !== undefined && (!Array.isArray(appMap.ignore) || appMap.ignore.some((one) => typeof one !== 'string'))) errors.push('answers file: ignore must be a list of strings.');
  if (appMap.libraries !== undefined) errors.push('answers file: libraries is not supported; use components.');
  if (errors.length) return { errors, warnings };
  const kinds = new Set(Object.keys(tables.kinds));
  for (const [kind, entry] of Object.entries(appMap.kinds ?? {})) {
    if (!record(entry) || !MAP_ANSWERS.includes(entry.answer)) {
      errors.push(`answers file: kind "${kind}" has the answer ${JSON.stringify(entry?.answer)}. A kind there is always "no part" or "decide": only the kit decides that a part exists.`);
    } else if (entry.note !== undefined && typeof entry.note !== 'string') {
      errors.push(`answers file: kind "${kind}" note must be a string.`);
    } else if (has(tables.kinds, kind)) {
      if (tables.kinds[kind].answer !== entry.answer) warnings.push(`answers file: kind "${kind}" is already a kind of the kit with the answer "${tables.kinds[kind].answer}"; yours is ignored.`);
    } else {
      kinds.add(kind);
    }
  }
  const values = [
    ...Object.entries(appMap.components ?? {}).map(([key, kind]) => ['components', key, kind]),
    ...Object.entries(appMap.classes ?? {}).map(([key, kind]) => ['classes', key, kind]),
    ...Object.entries(appMap.elements ?? {}).map(([key, kind]) => ['elements', key, kind]),
  ];
  for (const [section, key, kind] of values) {
    if (kind !== null && !kinds.has(kind)) errors.push(`answers file: ${section} "${key}" says "${kind}", which is no kind of ${tables.kindsPath} (add it under "kinds" with the answer "no part" or "decide", or use null).`);
  }
  return { errors, warnings };
}

/**
 * An observation: { tag, role, type, classes: string[], flags: { click, keys, drag, editable, context, rawHtml }, textOnly? }. `textOnly`: it holds nothing that reads as a kind of `boxKinds` (an icon, also an `<svg>` or `<img>`, a progress bar, a heading, a badge, a button or another control).
 * Returns { kind, by, set?, unknown? } or null for an element that is no control and no pattern.
 */
export function classify(observation, tables) {
  const { roles, partRoles, textRoles, tags, strongTags, inputTypes, quietTags, classRows, machinery } = tables;
  const tag = (observation.tag ?? '').toLowerCase();
  const role = (observation.role ?? '').toLowerCase();
  const flags = observation.flags ?? {};
  const classes = observation.classes ?? [];
  let byClass = null;
  outer: for (const name of classes) {
    for (const [set, pattern, kind] of classRows) {
      if (pattern.test(name)) {
        byClass = { kind, by: `class ${name}`, set, name };
        break outer;
      }
    }
  }
  // 1 A root class of a library widget: the widget is the thing, whatever role its root carries.
  if (byClass && machinery.test(byClass.name)) return byClass.kind === 'datebox' ? { ...byClass, kind: dateBoxKind(observation.type, 'datebox') } : byClass;
  // An element that carries a library's class and is no root of it is that library's machinery (the grid's inner tables).
  if (!byClass && classes.some((name) => machinery.test(name)) && !['input', 'button', 'a', 'select', 'textarea'].includes(tag)) return null;
  // 2 A control element, whatever class it carries (a.btn is a link, form.well is a form).
  if (tag === 'input') {
    if (observation.type === null) return { kind: 'input-type', by: 'input type=(computed)' };
    const type = (observation.type ?? 'text').toLowerCase();
    if (has(inputTypes, type)) return inputTypes[type] ? { kind: inputTypes[type], by: `input type=${type}` } : null;
    return { kind: 'text-input', by: `input type=${type}` };
  }
  if (strongTags.has(tag)) return { kind: tags[tag], by: `<${tag}>` };
  // 3 A role the page states. A role of textRoles on an element that holds only text is a line of text (a status line a script fills), not a message box.
  if (role && textRoles.has(role) && observation.textOnly && !byClass) return { kind: 'text', by: `role=${role}, text only` };
  if (role && has(roles, role)) return { kind: roles[role], by: `role=${role}` };
  // 4 A class of a known framework names the pattern (a span that is a badge, a ul that is a breadcrumb).
  if (byClass) return byClass;
  if (flags.editable) return { kind: 'rich-text', by: 'contenteditable' };
  if (has(tags, tag)) return { kind: tags[tag], by: `<${tag}>` };
  // 5 A click or key handler written by hand on an element that is no control.
  if (role && partRoles.has(role)) return null;
  if (tag === 'html' || tag === 'body') return null;
  if (flags.click && (quietTags.has(tag) || tag === '')) return { kind: 'clickable-box', by: `click handler on <${tag}>` };
  if (flags.keys && (quietTags.has(tag) || tag === '')) return { kind: 'hand-keyboard', by: `key handler on <${tag}>` };
  if (role) return { kind: `role:${role}`, by: `role=${role}`, unknown: true };
  if (tag.includes('-')) return { kind: `element:${tag}`, by: `custom element <${tag}>`, unknown: true };
  if (tag && !quietTags.has(tag)) return { kind: `tag:${tag}`, by: `<${tag}>`, unknown: true };
  return null;
}

const BEHAVIOURS = [['drag', 'drag-and-drop', 'drag handlers'], ['context', 'context-menu', 'context menu handler'], ['rawHtml', 'raw-html', 'markup from a string']];

/** Drag, context-menu and raw-HTML behaviour written by hand on any element: one { kind, by } each, beside the element's own kind. */
export const behaviours = (flags = {}) => BEHAVIOURS.filter(([flag]) => flags[flag]).map(([, kind, by]) => ({ kind, by }));
