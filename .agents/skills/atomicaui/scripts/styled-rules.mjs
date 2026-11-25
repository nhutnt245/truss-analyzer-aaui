// The rules for styled pieces (a piece AtomicAUI has no part for), as pure functions. No package is needed.
//   - one look, two forms: the `aui` object React takes, and the class list any other stack writes
//   - the usage profile: the looks and values the AtomicAUI apps use, and what a piece uses outside it
//   - the marker: data-aui-styled="<name>" on the root of every styled piece
// Rule ids match kit/rules.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** `aui.sx` key to class prefix. A copy of the library's STYLE_PROP_MAP; a test fails when the two differ. */
export const SX_CLASS = {
  background: 'aui-bg', foreground: 'aui-fg', borderColor: 'aui-border-color',
  borderBlockStartWidth: 'aui-border-block-start-width', borderBlockEndWidth: 'aui-border-block-end-width',
  borderInlineStartWidth: 'aui-border-inline-start-width', borderInlineEndWidth: 'aui-border-inline-end-width',
  radiusStartStart: 'aui-radius-start-start', radiusStartEnd: 'aui-radius-start-end', radiusEndStart: 'aui-radius-end-start', radiusEndEnd: 'aui-radius-end-end',
  paddingInlineStart: 'aui-padding-inline-start', paddingBlockStart: 'aui-padding-block-start', paddingInlineEnd: 'aui-padding-inline-end', paddingBlockEnd: 'aui-padding-block-end',
  gap: 'aui-gap', rowGap: 'aui-row-gap', columnGap: 'aui-column-gap',
  width: 'aui-width', minWidth: 'aui-min-width', maxWidth: 'aui-max-width', height: 'aui-height', minHeight: 'aui-min-height', maxHeight: 'aui-max-height',
  fontSize: 'aui-font-size', lineHeight: 'aui-line-height', letterSpacing: 'aui-letter-spacing', typographyStyle: 'aui-typography-style',
  iconSize: 'aui-icon-size', iconContainer: 'aui-icon-container', dotSize: 'aui-dot-size', focusColor: 'aui-focus-color', focusWidth: 'aui-focus-width',
  textAlign: 'aui-text-align', display: 'aui-display', flexDirection: 'aui-flex-direction', flexWrap: 'aui-flex-wrap',
  alignItems: 'aui-align-items', justifyContent: 'aui-justify-content', alignSelf: 'aui-align-self', flex: 'aui-flex', flexBasis: 'aui-flex-basis',
  overflow: 'aui-overflow', overflowX: 'aui-overflow-x', overflowY: 'aui-overflow-y', position: 'aui-position',
  gridTemplateColumns: 'aui-grid-template-columns', gridColumn: 'aui-grid-column', margin: 'aui-margin',
  whiteSpace: 'aui-white-space', textOverflow: 'aui-text-overflow', textDecoration: 'aui-text-decoration', borderStyle: 'aui-border-style',
};
/** The two shorthands the library expands before it writes classes. */
export const SX_SHORTHAND = {
  borderWidth: ['borderBlockStartWidth', 'borderBlockEndWidth', 'borderInlineStartWidth', 'borderInlineEndWidth'],
  radius: ['radiusStartStart', 'radiusStartEnd', 'radiusEndStart', 'radiusEndEnd'],
};
/** The `sx` keys that carry a look (spacing, sizes, borders, fills): the usage profile holds their values. */
export const LOOK_SX_KEYS = [
  'gap', 'paddingInlineStart', 'paddingInlineEnd', 'paddingBlockStart', 'paddingBlockEnd',
  'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight',
  'borderColor', 'borderBlockStartWidth', 'borderBlockEndWidth', 'borderInlineStartWidth', 'borderInlineEndWidth',
  'background', 'foreground', 'fontSize', 'lineHeight',
];
/** What a `View` is when nothing is set (kit/components/view.md). */
export const VIEW_DEFAULTS = { color: 'surface', paint: 'solid', shape: 'none', profile: 'no-padding', scale: 'sm' };
const STATE_LAYER = ['aui-stateful', 'aui-focus-color-info', 'aui-focus-width-2'];
const TEXT_BASE = ['aui-frame', 'aui-scale-no-padding-sm', 'aui-bg-transparent'];
export const TEXT_ATTRIBUTES = 'data-aui-typeface="engineering" data-aui-typography="body"';

/** `sx` with the shorthands expanded; a key written out wins over its shorthand, as in the library. */
export function expandSx(sx = {}) {
  const out = {};
  for (const [key, value] of Object.entries(sx)) if (SX_SHORTHAND[key]) for (const one of SX_SHORTHAND[key]) out[one] = value;
  for (const [key, value] of Object.entries(sx)) if (!SX_SHORTHAND[key]) out[key] = value;
  return out;
}
const sxClasses = (sx) => Object.entries(expandSx(sx)).map(([key, value]) => `${SX_CLASS[key] ?? `aui-unknown-${key}`}-${value}`);

/** The class list a `View` with this look writes. `interactive` adds the state layer (a native button or a). */
export function viewClasses({ color, paint, scale, profile, shape, elevation = 0, sx, interactive = false } = {}) {
  const look = { ...VIEW_DEFAULTS, ...Object.fromEntries(Object.entries({ color, paint, scale, profile, shape }).filter(([, value]) => value !== undefined)) };
  return [
    'aui-view', 'aui-frame', `aui-scale-${look.profile}-${look.scale}`, 'aui-typography-typescale-default', `aui-shape-${look.shape}`,
    `aui-color-${look.paint}-${look.color}`, ...(look.paint === 'tonal' || look.paint === 'fixed' ? ['aui-frame--inset'] : []),
    `aui-elevation-${elevation}`, ...sxClasses(sx), ...(interactive ? STATE_LAYER : []),
  ];
}

/** The class list a `Type` with this look writes. The element also takes TEXT_ATTRIBUTES. */
export function textClasses({ role, weight, color, sx } = {}) {
  return [...TEXT_BASE, ...(color ? [`aui-fg-${color}`] : []), ...(weight ? [`aui-typography-style-${weight}`] : []), ...sxClasses(sx), ...(role ? [`aui-typography-typescale-${role}`] : [])];
}

/** One look per state of a look object: `states.unselected` and `states.selected` are laid over the rest. */
export function stateLooks(look = {}) {
  const { states, ...base } = look;
  const merged = (state) => ({ ...base, ...state, sx: { ...base.sx, ...state?.sx } });
  if (!states || typeof states !== 'object') return [['', base]];
  const named = ['unselected', 'selected'].filter((name) => states[name]);
  return [...(states.unselected ? [] : [['unselected', base]]), ...named.map((name) => [name, merged(states[name])])];
}

const viewKey = (look) => ['color', 'paint', 'shape', 'profile'].map((axis) => look[axis] ?? VIEW_DEFAULTS[axis]).join(' ');
const typeKey = (look) => ['role', 'weight', 'color'].map((name) => look[name] ?? '-').join(' ');
/** A value that was read: a token string or a number. A string that starts with `$` stands for something the reader could not follow. */
const known = (value) => (typeof value === 'string' && !value.startsWith('$')) || typeof value === 'number';
const sxKeys = (sx) => Object.entries(expandSx(sx)).filter(([key, value]) => LOOK_SX_KEYS.includes(key) && known(value)).map(([key, value]) => `${key}=${value}`);

/** What a `View` look object uses, as usage-profile keys: one per state. Axes that are not plain strings are left out. */
export function usesOfView(look) {
  const found = [];
  const plain = (value) => value === undefined || known(value);
  for (const [, one] of stateLooks(look)) {
    // `$open`: the reader met a spread it could not follow, so the axes are not all known.
    if (!one.$open && ['color', 'paint', 'shape', 'profile'].every((axis) => plain(one[axis]))) found.push({ set: 'view', key: viewKey(one) });
    for (const key of sxKeys(one.sx)) found.push({ set: 'sx', key });
    if (one.elevation !== undefined && String(one.elevation) !== '0') found.push({ set: 'elevation', key: String(one.elevation) });
  }
  return found;
}
/** What a `Type` uses: its role, weight and colour, and the look values of its `sx`. */
export function usesOfType({ role, weight, color, sx } = {}) {
  const plain = (value) => value === undefined || known(value);
  return [...([role, weight, color].every(plain) ? [{ set: 'type', key: typeKey({ role, weight, color }) }] : []), ...sxKeys(sx).map((key) => ({ set: 'sx', key }))];
}

/** A class list read back as usage-profile keys: a View box, a text element, or neither (a part: its recipe is checked elsewhere). */
export function usesOfClasses(names) {
  const has = (name) => names.includes(name);
  const after = (prefix) => names.find((name) => name.startsWith(prefix))?.slice(prefix.length);
  const sx = {};
  const prefixes = Object.entries(SX_CLASS).sort((a, b) => b[1].length - a[1].length);
  for (const name of names) {
    const hit = prefixes.find(([, prefix]) => name.startsWith(`${prefix}-`));
    if (hit) sx[hit[0]] = name.slice(hit[1].length + 1);
  }
  const elevation = after('aui-elevation-');
  if (has('aui-view')) {
    const cell = after('aui-color-') ?? '';
    const paint = ['solid', 'tonal', 'text', 'fixed'].find((one) => cell.startsWith(`${one}-`));
    const scale = after('aui-scale-') ?? '';
    const look = { color: paint ? cell.slice(paint.length + 1) : undefined, paint, shape: after('aui-shape-'), profile: scale.replace(/-(xs|sm|md|lg|xl)$/, '') || undefined };
    return [{ set: 'view', key: viewKey(look) }, ...sxKeys(sx).map((key) => ({ set: 'sx', key })), ...(elevation && elevation !== '0' ? [{ set: 'elevation', key: elevation }] : [])];
  }
  const marker = names.find((name) => /^aui-(?!frame(--inset)?$|stateful$|scale-|bg-|fg-|typography-|margin-|elevation-|shape-|color-)/.test(name) && !Object.values(SX_CLASS).some((prefix) => name.startsWith(`${prefix}-`)));
  if (TEXT_BASE.every(has) && !marker) {
    // On text, the colour class is the Type colour and the style class is its weight; the transparent fill is part of every text.
    const rest = Object.fromEntries(Object.entries(sx).filter(([key]) => !['background', 'foreground', 'typographyStyle'].includes(key)));
    return usesOfType({ role: after('aui-typography-typescale-'), weight: sx.typographyStyle, color: sx.foreground, sx: rest });
  }
  return elevation && elevation !== '0' && has('aui-frame') && !marker ? [{ set: 'elevation', key: elevation }] : [];
}

/** The usage profile: kit/style/usage-profile.json in the starter, data/usage-profile.json of the aui-style-anything skill in an app. */
export function loadProfile(root = path.resolve(here, '..')) {
  const file = [path.join(root, 'kit/style/usage-profile.json'), path.join(root, '../aui-style-anything/data/usage-profile.json'), path.join(root, 'data/usage-profile.json')].find((one) => fs.existsSync(one));
  return file ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}

/**
 * The uses that are not in the profile, each once, as text: `sx gap=14`. A look of the kit's own examples (profile.kit)
 * counts as in the profile. Elevation is not listed here: it fails by itself.
 */
export function outsideProfile(uses, profile) {
  if (!profile) return [];
  const inside = (use) => use.key in (profile[use.set] ?? {}) || use.key in (profile.kit?.[use.set] ?? {});
  return [...new Set(uses.filter((use) => use.set !== 'elevation' && !inside(use)).map((use) => `${use.set} ${use.key}`))];
}

const MARKER = /\bdata-aui-styled\s*=\s*(?:"([^"]*)"|'([^']*)')/;
export const MARKER_NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const TAG = /<(\/?)([a-zA-Z][\w:.-]*)\b((?:"[^"]*"|'[^']*'|[^<>"'])*)>/g;

/** Every marked piece in markup: its name, the line of its root, and the tags inside it (root included). */
export function styledBlocks(text) {
  const blocks = [];
  const open = [];
  const lineAt = (offset) => text.slice(0, offset).split('\n').length;
  for (const match of text.matchAll(TAG)) {
    const [, closing, tag, attributes] = match;
    const lower = tag.toLowerCase();
    if (closing) {
      for (const block of open) if (block.tag === lower) block.depth -= 1;
      while (open.length > 0 && open.at(-1).depth === 0) open.pop();
      continue;
    }
    const selfClosed = /\/\s*$/.test(attributes) || /^(input|br|hr|img|meta|link|col|source|area|base|embed|track|wbr)$/.test(lower);
    const classes = (attributes.match(/(?:^|\s)class\s*=\s*(?:"([^"]*)"|'([^']*)')/i)?.slice(1).find((one) => one !== undefined) ?? '').split(/\s+/).filter((name) => /^[\w-]+$/.test(name));
    const element = { tag: lower, line: lineAt(match.index), classes, attributes };
    for (const block of open) {
      block.elements.push(element);
      if (block.tag === lower && !selfClosed) block.depth += 1;
    }
    const marker = attributes.match(MARKER);
    if (marker) {
      const block = { name: marker[1] ?? marker[2], line: element.line, tag: lower, depth: selfClosed ? 0 : 1, elements: [element] };
      blocks.push(block);
      if (!selfClosed) open.push(block);
    }
  }
  return blocks;
}

/** The pieces GAPS.md lists: every "Styled piece `name`". */
export const gapNames = (gapsText) => new Set([...gapsText.matchAll(/styled piece `([a-z][a-z0-9-]*)`/gi)].map((match) => match[1]));
/** The widgets GAPS.md lists: every "Aligned widget `name`" (kit/style/align.md). */
export const alignedNames = (gapsText) => new Set([...gapsText.matchAll(/aligned widget `([a-z][a-z0-9-]*)`/gi)].map((match) => match[1]));
/** The library scripts GAPS.md keeps for the behaviour of a restyled widget: every "Kept widget script `file`" (kit/style/maps/bootstrap.md), by file name. */
export const keptScripts = (gapsText) => new Set([...gapsText.matchAll(/kept widget script `([^`\s/]+)`/gi)].map((match) => match[1].toLowerCase()));
/** The small stylesheet of show and hide rules a kept widget script needs, kept on a restyled page (scripts/restyle-done.mjs --keep) and read like any CSS of the app: every "Kept stylesheet `file`", by file name. */
export const keptStylesheets = (gapsText) => new Set([...gapsText.matchAll(/kept stylesheet `([^`\s/]+)`/gi)].map((match) => match[1].toLowerCase()));
/** The old stylesheet kept as it is because pages outside the scope of a restyle still use it (scripts/restyle-done.mjs --keep): every "Kept for pages outside the scope `file`", by file name. */
export const keptOutsideStylesheets = (gapsText) => new Set([...gapsText.matchAll(/kept for pages outside the scope `([^`\s/]+)`/gi)].map((match) => match[1].toLowerCase()));
/** The stylesheets GAPS.md names as an aligned widget's own: every "Aligned widget stylesheet `file` of `widget`", file name to widget (kit/style/align.md). */
export const alignedStylesheets = (gapsText) => new Map([...gapsText.matchAll(/aligned widget stylesheet `([^`\s/]+)` of `([a-z][a-z0-9-]*)`/gi)].map((match) => [match[1].toLowerCase(), match[2]]));
/**
 * The aligned-widget stylesheets that count (kit/style/align.md): their widget has its own "Aligned widget `name`" line (`widgets`, alignedNames)
 * and a page given marks it data-aui-aligned="name" (`marked`). A stylesheet line for no such widget counts for nothing: the stylesheet is the app's own.
 */
export const realAlignedStylesheets = (stylesheets, widgets, marked) => new Set([...stylesheets].filter(([, widget]) => Boolean(widgets?.has(widget)) && marked.has(widget)).map(([file]) => file));
/** The folders that hold a widget's own code and stylesheet. */
const WIDGET_FOLDERS = new Set(['lib', 'vendor', 'node_modules']);
/**
 * Whether a stylesheet is no CSS of the app's own, which neither check-standard nor restyle-done holds to the app's rules: its path goes through
 * a lib/, vendor/ or node_modules/ folder (a widget's own), or `names` holds its file name (realAlignedStylesheets, kit/style/align.md; for
 * check-standard keptOutsideStylesheets too, which restyle-done accepts only with --keep and never linked). `parts`: the folders and file name of a link's
 * address, or the file name alone of a stylesheet a folder walk found (the walk never enters those folders).
 */
export const notAppStylesheet = (parts, names) => parts.some((part) => WIDGET_FOLDERS.has(part.toLowerCase())) || Boolean(names?.has((parts[parts.length - 1] ?? '').toLowerCase()));

/**
 * The marker rules every stack shares (AUI-09, AUI-12). `piece` is { name, file, line, uses }.
 * Returns problems; the looks outside the usage profile are not problems, they are returned by outsideProfile.
 */
export function checkPiece(piece, gaps) {
  const problems = [];
  const add = (rule, message, fix) => problems.push({ rule, file: piece.file, line: piece.line, message, fix });
  if (!MARKER_NAME.test(piece.name)) add('AUI-09', `data-aui-styled="${piece.name}" is not a piece name.`, 'Name the piece in lower case with dashes, for example data-aui-styled="label-value-rows".');
  else if (gaps && !gaps.has(piece.name)) add('AUI-12', `The styled piece "${piece.name}" has no line in GAPS.md.`, `Add one line to GAPS.md: - Styled piece \`${piece.name}\`: what AtomicAUI lacks, which screen, which file. A styled piece is a stand-in until the library has the part.`);
  for (const use of piece.uses.filter((one) => one.set === 'elevation')) {
    add('AUI-09', `The styled piece "${piece.name}" sets elevation ${use.key}: a shadow.`, 'Delete it. A styled piece sits in the page: elevation is always 0. Only a library popup floats (Popover, Dropdown, Dialog).');
  }
  return problems;
}
