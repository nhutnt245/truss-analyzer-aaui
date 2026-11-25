// The rules of the standard check, for pages built without the React parts, as pure functions.
// They read any markup (HTML, Razor, Blazor, other templates) and any CSS. No package is needed.
// Every problem is { rule, file, line, message, fix }. Rule ids match kit/rules.md.
import { checkPiece, outsideProfile, styledBlocks, usesOfClasses } from './styled-rules.mjs';

export const MARKUP_FILES = /\.(html?|cshtml|razor|aspx|ascx|master|vue|svelte|php|jsp|erb|hbs|twig|liquid)$/i;
export const STYLE_FILES = /\.(css|scss|less)$/i;
export const SCRIPT_FILES = /\.js$/i;
/**
 * Folders that hold other people's code or output, never read as the app's own: lib and vendor hold a third-party widget (wwwroot/lib of the .NET
 * template), and restyle the restyle path's own output with its copy of the old folder (restyle/old/). Restyling a widget away is the job of the restyle guide.
 */
export const SKIPPED_FOLDERS = new Set(['node_modules', '.git', '.agents', '.claude', 'bin', 'obj', 'dist', 'coverage', 'evidence', 'restyle', 'lib', 'vendor']);

const FAMILIES = { frame: /^aui-frame$/, scale: /^aui-scale-/, typography: /^aui-typography-typescale-/, shape: /^aui-shape-/, color: /^aui-color-/, elevation: /^aui-elevation-/ };
const STATE = /^aui-(stateful|frame--inset|focus-color-.+|focus-width-.+)$/;
const HEX_COLOUR = /#[0-9a-fA-F]{3,8}\b/;
const FUNCTION_COLOUR = /\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\(/;
const PIXEL_LENGTH = /(?<![\w.-])\d+(?:\.\d+)?px\b/;
const OTHER_LIBRARY = /bootstrap|tailwind|bulma|foundation|materialize|material-ui|@mui|semantic-ui|fomantic|antd|ant-design|kendo|telerik|devexpress|devextreme|primeng|primefaces|jquery-ui|syncfusion|radzen|mudblazor/i;
/** Elements of a table column: none of them takes a width attribute. */
const COLUMN_ELEMENTS = new Set(['col', 'td', 'th']);
const PLAIN_CONTROLS = new Set(['button', 'input', 'select', 'textarea', 'table']);
/** Which recipe block a bare control is copied from: the recipe page and the block's name. A bare control is never styled by hand. */
const RECIPE_OF = { button: ['button', 'button-default'], input: ['field', 'field-input'], select: ['field', 'field-select'], textarea: ['form', 'field-textarea'], table: ['table', 'table-display'] };
const RECIPE_OF_INPUT_TYPE = { checkbox: ['field', 'checkbox'], radio: ['form', 'field-radio'], date: ['field', 'field-date'], submit: RECIPE_OF.button, button: RECIPE_OF.button, reset: RECIPE_OF.button, image: RECIPE_OF.button };
const ALLOW = /check-allow:\s*(AUI-\d\d)/g;
/**
 * The finding (AUI-01) for a table or a control that carries no AtomicAUI class, or undefined: one rule for a tag of a page and for a tag in a string that a script writes.
 * `classText` and `type` are the values of its class and type attributes as written ('' when it has none).
 */
function plainControl(tag, classText, type, where) {
  const lower = tag.toLowerCase();
  if (tag !== lower || !PLAIN_CONTROLS.has(lower) || /\baui-/.test(classText) || /^(hidden|file)$/i.test(type)) return undefined;
  const [recipePage, block] = (lower === 'input' && RECIPE_OF_INPUT_TYPE[type.toLowerCase()]) || RECIPE_OF[lower];
  return {
    message: `<${tag}> with no AtomicAUI class: a hand-styled control.`,
    fix: `Copy the whole block "${block}" from ${where}/recipes/${recipePage}.md (its wrapper and the control inside it), then change only text, ids, names and values. Never style <${tag}> yourself: no border, padding, colour or background of your own on it or in your CSS. No recipe fits: on a page you restyle, style it with the aui-style-anything skill (kit/style/start.md in the starter), keeping its roles and behaviour; on a new page, the stop rule.`,
  };
}
/** Elements the browser gives keyboard and focus: only these may carry a click handler. */
const NATIVE_CLICK = new Set(['button', 'a', 'input', 'select', 'textarea', 'summary', 'label', 'option', 'area']);
const CLICK_ATTRIBUTE = /(?:^|\s)(onclick|@onclick(?::\w+)?|\(click\)|v-on:click(?:\.\w+)*|@click(?:\.\w+)*|on:click)\s*=/i;
/** CSS properties that give a look. App CSS places the outer page; it never sets one of these. */
const LOOK_PROPERTY = /^(color|background(-[a-z-]+)?|border(-[a-z-]+)?|outline(-[a-z-]+)?|box-shadow|text-shadow|padding(-[a-z-]+)?|margin(-[a-z-]+)?|gap|row-gap|column-gap|font(-[a-z-]+)?|line-height|letter-spacing|text-transform|text-decoration(-[a-z-]+)?|opacity|fill|stroke|filter|backdrop-filter)$/;
/** The outer page: a rule on these alone may set the page's own margin, colour and font. */
const PAGE_SELECTOR = /^(html|body|:root|#root|\.app-root)$/;

/**
 * Every declaration in CSS that sets a look outside the outer page and outside @font-face.
 * Returns [{ line, selector, property }]. Comments and values are not judged: the property alone decides.
 */
export function lookDeclarations(text) {
  const blank = (comment) => comment.replace(/[^\n]/g, ' ');
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/(^|[^:'"(])\/\/[^\n]*/g, (comment, lead) => lead + blank(comment.slice(lead.length)));
  const found = [];
  const open = [];
  let buffer = '';
  let start = 0;
  let line = 1;
  const declaration = () => {
    const property = buffer.trim().match(/^([a-z-]+)\s*:/i)?.[1].toLowerCase();
    const rule = [...open].reverse().find((selector) => !/^@(media|supports|layer|container)\b/.test(selector));
    if (!property || !LOOK_PROPERTY.test(property) || !rule || open.some((selector) => selector.startsWith('@font-face'))) return;
    if (rule.split(',').every((one) => PAGE_SELECTOR.test(one.trim()))) return;
    found.push({ line: start, selector: rule.replace(/\s+/g, ' '), property });
  };
  for (const character of clean) {
    if (buffer.trim() === '') start = line;
    if (character === '{') { open.push(buffer.trim()); buffer = ''; }
    else if (character === '}') { declaration(); open.pop(); buffer = ''; }
    else if (character === ';') { declaration(); buffer = ''; }
    else buffer += character;
    if (character === '\n') line += 1;
  }
  return found;
}

// A value a Razor or Blazor template computes: @( ... ), with its texts and one level of brackets inside.
// A component that keeps one element per item writes the class list of every state this way:
//   class="@(picked ? "the whole picked list" : "the whole plain list")"
const TEXT = '"(?:[^"\\\\]|\\\\.)*"';
const COMPUTED = `@\\((?:${TEXT}|[^()"]|\\((?:${TEXT}|[^()"])*\\))*\\)`;
const TREE_ITEM = /\brole\s*=\s*["']treeitem["']/i;
const TAG = new RegExp(`<([a-zA-Z][\\w:.-]*)\\b((?:"${COMPUTED}"|'${COMPUTED}'|"[^"]*"|'[^']*'|[^<>"'])*)>`, 'g');
const WHOLE_COMPUTED = new RegExp(`^\\s*${COMPUTED}\\s*$`);
const TEXTS = new RegExp(TEXT, 'g');

export const familyOf = (name) => Object.keys(FAMILIES).find((family) => FAMILIES[family].test(name));

/** Adds the lookups the rules need to what loadStandard() returns. */
export function prepare(data) {
  const classes = new Set(data.classes);
  const layout = new Set(data.layout);
  const fixedOf = (names) => names.filter((name) => name.startsWith('aui-') && !layout.has(name)).sort();
  const markersOf = (names) => fixedOf(names).filter((name) => !familyOf(name) && !STATE.test(name));
  const byMarkers = new Map();
  const bySignature = new Map();
  for (const element of data.elements) {
    const key = markersOf(element.classes).join(' ');
    byMarkers.set(key, [...(byMarkers.get(key) ?? []), { ...element, fixed: fixedOf(element.classes) }]);
    bySignature.set(`${element.tag} ${[...element.classes].sort().join(' ')}`, element);
  }
  // `where` is kit/standard in the starter and references/standard in the packed skill.
  return { where: 'kit/standard', ...data, classSet: classes, fixedOf, markersOf, byMarkers, bySignature };
}

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

const nearest = (name, known) => [...known].map((other) => [distance(name, other), other]).sort((a, b) => a[0] - b[0]).slice(0, 3).map(([, other]) => other);

/** One element's class list against the stylesheet and the recipes. Returns [{ rule, message, fix }]. */
export function checkClassList(tag, names, standard) {
  const problems = [];
  const RECIPES = `${standard.where}/recipes/`;
  const aui = names.filter((name) => name.startsWith('aui-'));
  if (aui.length === 0) return problems;
  const unknown = aui.filter((name) => !standard.classSet.has(name));
  for (const name of unknown) {
    problems.push({ rule: 'AUI-01', message: `Unknown AtomicAUI class "${name}".`, fix: `It is not in the stylesheet of this release. Nearest: ${nearest(name, standard.classSet).join(', ')}. Copy class lists from ${RECIPES}; never write one from memory.` });
  }
  if (unknown.length > 0) return problems;
  const markers = standard.markersOf(aui);
  const candidates = standard.byMarkers.get(markers.join(' ')) ?? [];
  const named = markers.length > 0 ? markers.join(' ') : 'aui-frame';
  if (candidates.length === 0) {
    problems.push({ rule: 'AUI-01', message: `No class recipe for "${named}" in this kit version.`, fix: 'Do not build it from memory. A piece that only shows things, or is one thing to click: style it with the aui-style-anything skill (kit/style/start.md in the starter). Anything else: on a page you restyle, style it with the same skill where it is, keeping its markup, roles and behaviour; on a new page, the stop rule.' });
    return problems;
  }
  const fixed = standard.fixedOf(aui);
  if (candidates.some((candidate) => candidate.free)) {
    // Layout boxes and text: any layout classes, but one class of every family the recipes always carry.
    const required = Object.keys(FAMILIES).filter((family) => candidates.every((candidate) => candidate.fixed.some((name) => familyOf(name) === family)));
    for (const family of required) {
      const count = fixed.filter((name) => familyOf(name) === family).length;
      if (count !== 1) problems.push({ rule: 'AUI-09', message: `Incomplete class list on <${tag}> (${named}): ${count === 0 ? 'no' : count} ${family} class${count > 1 ? 'es' : ''}; it needs exactly one.`, fix: `Copy the whole class list from ${RECIPES}${candidates[0].part}.md, then change only layout classes (gap, display, width).` });
    }
    return problems;
  }
  const same = (candidate) => candidate.fixed.length === fixed.length && candidate.fixed.every((name, index) => name === fixed[index]);
  const match = candidates.find(same);
  if (!match) {
    const overlap = (candidate) => candidate.fixed.filter((name) => fixed.includes(name)).length - candidate.fixed.filter((name) => !fixed.includes(name)).length;
    const close = [...candidates].sort((a, b) => overlap(b) - overlap(a) || b.recipes.length - a.recipes.length)[0];
    const missing = close.fixed.filter((name) => !fixed.includes(name));
    const extra = fixed.filter((name) => !close.fixed.includes(name));
    problems.push({ rule: 'AUI-09', message: `Class list of ${named} on <${tag}> is not a recipe (nearest: ${close.recipes[0]}).${missing.length ? ` Missing: ${missing.join(' ')}.` : ''}${extra.length ? ` Not in the recipe: ${extra.join(' ')}.` : ''}`, fix: `Copy the whole class list from ${RECIPES}${close.part}.md. Never shorten, mix or extend it; a look that is not there is a line in GAPS.md.` });
  } else if (!candidates.some((candidate) => same(candidate) && candidate.tag === tag)) {
    problems.push({ rule: 'AUI-01', message: `<${tag}> carries the class list of <${match.tag}> (${match.recipes[0]}): a hand-built control.`, fix: `Use the element of the recipe, <${match.tag}>: the browser gives it keyboard and focus.` });
  }
  return problems;
}

/** AUI-02, 03, 06 for CSS the app wrote: no raw colour or length, no restyling of the library, a why: comment per rule. */
export function checkStyles(file, text, firstLine = 1) {
  const problems = [];
  let inComment = false;
  let lastComment = '';
  let previous = '';
  text.split('\n').forEach((raw, index) => {
    const line = firstLine + index;
    let code = '';
    let rest = raw;
    while (rest.length > 0) {
      if (inComment) {
        const end = rest.indexOf('*/');
        lastComment += rest.slice(0, end < 0 ? rest.length : end);
        rest = end < 0 ? '' : rest.slice(end + 2);
        inComment = end < 0;
      } else {
        const start = rest.search(/\/\*|\/\//);
        if (start < 0) { code += rest; rest = ''; }
        else if (rest.startsWith('//', start)) { code += rest.slice(0, start); lastComment = rest.slice(start); rest = ''; }
        else { code += rest.slice(0, start); rest = rest.slice(start + 2); inComment = true; lastComment = ''; }
      }
    }
    const allowed = new Set([...`${previous}\n${raw}`.matchAll(ALLOW)].map((match) => match[1]));
    previous = raw;
    const add = (rule, message, fix) => { if (!allowed.has(rule)) problems.push({ rule, file, line, message, fix }); };
    const trimmed = code.trim();
    if (!trimmed) return;
    const selector = trimmed.includes('{') ? trimmed.split('{')[0] : '';
    if (selector && !selector.startsWith('@')) {
      if (/\.aui-[\w-]+|\[data-aui-/.test(selector)) add('AUI-06', `App CSS restyles AtomicAUI: "${selector.trim()}".`, 'Delete the rule. The library is loaded as shipped; a look it does not have is a line in GAPS.md.');
      if (!/why:/i.test(lastComment)) add('AUI-03', 'CSS rule without a "why:" comment above it.', 'App CSS is only for the outer page. Add "/* why: <reason no AtomicAUI class can do this> */" on the line above, or delete the rule.');
      lastComment = '';
    }
    const variable = trimmed.match(/(?:^|[{;\s])(--(?:aui|theme|p)-[\w-]+)\s*:/);
    if (variable) add('AUI-06', `App CSS sets the library variable ${variable[1]}.`, 'Delete it. Tokens are never redefined; change the theme with the data-aui-theme attribute only.');
    if (/!important/.test(trimmed)) add('AUI-06', '"!important" in app CSS can beat the library.', 'Delete it.');
    const declarations = trimmed.includes('{') ? trimmed.split('{').slice(1).join('{') : trimmed;
    const colour = declarations.match(HEX_COLOUR) ?? declarations.match(FUNCTION_COLOUR);
    if (colour) add('AUI-02', `Raw colour "${colour[0]}" in app CSS.`, 'Use a token variable, for example var(--theme-surface-alt), or an AtomicAUI colour class.');
    const length = declarations.match(PIXEL_LENGTH);
    if (length) add('AUI-02', `Pixel value "${length[0]}" in app CSS.`, 'Use a token variable, for example var(--p-px-8), or an AtomicAUI class (aui-gap-8).');
  });
  // AUI-03: app CSS places the outer page. A look in CSS is a second design system, whatever its values and its comment.
  const lines = text.split('\n');
  for (const found of lookDeclarations(text)) {
    const allowed = new Set([...`${lines[found.line - 2] ?? ''}\n${lines[found.line - 1] ?? ''}`.matchAll(ALLOW)].map((match) => match[1]));
    if (allowed.has('AUI-03')) continue;
    problems.push({ rule: 'AUI-03', file, line: firstLine + found.line - 1, message: `App CSS sets a look: "${found.property}" in the rule "${found.selector}".`, fix: 'App CSS only places the outer page (position, size, grid placement, scroll). Colour, border, padding, margin, gap, font, radius, shadow and outline come from AtomicAUI classes on the element. A piece AtomicAUI has no part for: the aui-style-anything skill (kit/style/start.md in the starter).' });
  }
  return problems.sort((a, b) => a.line - b.line);
}

/** The one stylesheet allowed to set a look, and only as kit/style/align.md says: a third-party widget takes AtomicAUI's theme values. */
export const ALIGN_FILE = /(^|[\\/])aui-align\.css$/;
const ALIGN_ROOT = /^\[data-aui-aligned="([a-z][a-z0-9-]*)"\]/;
const ALIGN_VARIABLE = /var\(--(?:theme|p|typography)-[a-z0-9-]+\)/g;
const ALIGN_KEYWORD = /\b(?:inherit|initial|unset|none|transparent|currentcolor|solid|dashed|dotted|double|normal|bold|bolder|lighter|italic|oblique|uppercase|lowercase|capitalize|underline|overline|line-through|auto)\b/gi;

/** What is left of a value after the theme variables, the plain keywords, a zero and the signs of calc(): anything left (a number other than 0 too) is a value of the widget's own. */
export const alignLeftover = (value) => value.replace(ALIGN_VARIABLE, ' ').replace(ALIGN_KEYWORD, ' ').replace(/calc\(/gi, ' ').replace(/(?<![\w.])-?0+(?:\.0+)?(?![\w%.])/g, ' ').replace(/[\s()+*/,-]+/g, ' ').trim();

/**
 * `aui-align.css`: every rule starts at a root the page marks with data-aui-aligned="<name>", has a why: comment above it, sets only a look
 * property, and every value is a theme variable (var(--theme-...), var(--p-...), var(--typography-...)), a plain keyword or 0. Returns [{ rule, file, line, message, fix }].
 */
export function checkAlignStyles(file, text, firstLine = 1) {
  const problems = [];
  const lineOf = (index) => firstLine + text.slice(0, index).split('\n').length - 1;
  const add = (rule, index, message, fix) => problems.push({ rule, file, line: lineOf(index), message, fix });
  // Comments become blanks of the same length, so every position stays where it was; each is kept with where it ends.
  const comments = [];
  const code = text.replace(/\/\*([\s\S]*?)\*\//g, (whole, body, index) => {
    comments.push({ end: index + whole.length, body });
    return whole.replace(/[^\n]/g, ' ');
  });
  const commentAbove = (start) => comments.filter((one) => one.end <= start && /^\s*$/.test(code.slice(one.end, start))).pop()?.body ?? '';
  for (const match of code.matchAll(/([^{}]*)\{([^{}]*)\}|([^{}]*)\{/g)) {
    const head = (match[1] ?? match[3]).trim();
    const start = match.index + (match[1] ?? match[3]).search(/\S|$/);
    if (match[1] === undefined) {
      if (!/^@(media|supports)\b/.test(head)) add('AUI-03', start, `aui-align.css holds "${head.split(/\s/)[0]}": only rules for the aligned widget belong here.`, 'Keep to rules that start at [data-aui-aligned="<name>"] (kit/style/align.md). Fonts and keyframes are the page\'s own set-up, not an alignment.');
      continue;
    }
    if (head.startsWith('@')) {
      add('AUI-03', start, `aui-align.css holds "${head.split(/\s/)[0]}": only rules for the aligned widget belong here.`, 'Keep to rules that start at [data-aui-aligned="<name>"] (kit/style/align.md). Fonts and keyframes are the page\'s own set-up, not an alignment.');
      continue;
    }
    for (const selector of head.split(',').map((one) => one.trim())) {
      if (!ALIGN_ROOT.test(selector)) add('AUI-03', start, `The selector "${selector}" does not start at an aligned widget.`, 'Start every selector with [data-aui-aligned="<name>"], the root the page marks, then the widget\'s own parts (kit/style/align.md).');
      else if (/\.aui-|\[data-aui-(?!aligned)/.test(selector)) add('AUI-06', start, `The selector "${selector}" reaches into AtomicAUI.`, 'Name only the widget\'s own classes. AtomicAUI\'s classes and attributes are never a target (AUI-06).');
    }
    if (!/why:/i.test(commentAbove(start))) add('AUI-03', start, `The rule "${head}" has no "why:" comment above it.`, 'Write /* why: <what the widget\'s own settings cannot reach> */ on the line above, or delete the rule.');
    let offset = match.index + match[1].length + 1;
    for (const declaration of match[2].split(';')) {
      const here = offset + declaration.search(/\S|$/);
      offset += declaration.length + 1;
      const found = declaration.match(/^\s*([a-z-]+)\s*:\s*([\s\S]*?)\s*$/i);
      if (!found) continue;
      const [, property, value] = found;
      if (property.startsWith('--')) add('AUI-06', here, `aui-align.css sets the variable ${property}.`, 'Delete it. Variables are never redefined (AUI-06); read them with var(--theme-...).');
      else if (!LOOK_PROPERTY.test(property.toLowerCase())) add('AUI-03', here, `aui-align.css sets "${property}": not a look.`, 'Alignment gives colour, font, corner and space only. Layout and behaviour stay the widget\'s.');
      if (/!important/i.test(value)) add('AUI-06', here, '"!important" in aui-align.css can beat the library.', 'Delete it. Match the widget\'s own selector instead, and load aui-align.css after the widget\'s stylesheet.');
      if (alignLeftover(value.replace(/!important/gi, ''))) add('AUI-02', here, `The value "${value.trim()}" of ${property} is no theme value.`, 'Use var(--theme-<role>), var(--p-px-<n>), var(--p-weight-<name>) or var(--typography-...): the nearest role, never a colour, a length or a number of your own.');
    }
  }
  return problems.sort((a, b) => a.line - b.line);
}

/** The widget names an aui-align.css has rules for. */
export const alignRoots = (text) => new Set([...text.matchAll(/\[data-aui-aligned="([a-z][a-z0-9-]*)"\]/g)].map((match) => match[1]));

/** The widgets a page marks: every data-aui-aligned="<name>" attribute in markup, with its line. */
export function alignedMarks(text) {
  return [...text.matchAll(/(?:^|[\s"'])data-aui-aligned\s*=\s*"([^"]*)"/g)].map((match) => ({ name: match[1], line: text.slice(0, match.index).split('\n').length }));
}

/**
 * The styled pieces in markup: every data-aui-styled marker with what the elements inside it use.
 * Returns [{ name, file, line, problems, outside }]: `problems` fail the check; `outside` lists the looks that are not
 * in the usage profile (standard.profile). Those do not fail: each is removed, or explained on the evidence sheet.
 */
export function styledPieces(file, text, standard) {
  return styledBlocks(text).map((block) => {
    const dynamic = block.elements.some((element) => /[@{}$%()]/.test(element.attributes.match(/(?:^|\s)class\s*=\s*(?:"([^"]*)"|'([^']*)')/i)?.[0] ?? ''));
    const uses = block.elements.flatMap((element) => usesOfClasses(element.classes).map((use) => ({ ...use, line: element.line })));
    const outside = dynamic ? [] : outsideProfile(uses, standard.profile).map((look) => `${look} (line ${uses.find((use) => `${use.set} ${use.key}` === look).line})`);
    return { name: block.name, file, line: block.line, problems: checkPiece({ name: block.name, file, line: block.line, uses }, standard.gaps), outside };
  });
}

/**
 * A switch says its state twice: by its colour class (primary is on, surface-alt is off) and by attributes
 * (aria-checked, data-checked or data-unchecked, data-filled, and the thumb's own). Each class list alone can be a recipe
 * while the two disagree, for example a switch recoloured to look off that still says data-checked. `state` is
 * { ariaChecked, checked, unchecked, filled, thumb: { checked, unchecked, filled } | undefined }. Returns [{ rule, message, fix }].
 */
export function checkSwitchState(names, state, where = 'kit/standard') {
  if (!state || !names.includes('aui-switch')) return [];
  const look = names.includes('aui-color-solid-primary') ? 'on' : names.includes('aui-color-solid-surface-alt') ? 'off' : undefined;
  const says = (value) => [
    state.ariaChecked === String(value) && `aria-checked="${value}"`,
    (value ? state.checked : state.unchecked) && (value ? 'data-checked' : 'data-unchecked'),
    value && state.filled && 'data-filled',
    state.thumb && (value ? state.thumb.checked : state.thumb.unchecked) && `${value ? 'data-checked' : 'data-unchecked'} on the thumb`,
    value && state.thumb?.filled && 'data-filled on the thumb',
  ].filter(Boolean);
  const [on, off] = [says(true), says(false)];
  const fix = `Make the switch say one state: copy the first (on) or the second (off) switch of field-switch whole from ${where}/recipes/form.md, class list and attributes, on the switch and on its thumb. Never swap its colour class by hand.`;
  if (look === 'on' && off.length > 0) return [{ rule: 'AUI-04', message: `A switch looks on (aui-color-solid-primary) but says it is off (${off.join(', ')}).`, fix }];
  if (look === 'off' && on.length > 0) return [{ rule: 'AUI-04', message: `A switch looks off (aui-color-solid-surface-alt) but says it is on (${on.join(', ')}).`, fix }];
  return [];
}

/** The state attributes of one opening tag, or null when a template computes them (they cannot be read there; the page check reads them). */
function stateOfTag(attributes) {
  if (/@/.test(attributes.replace(/(?:^|\s)class\s*=\s*(?:"[^"]*"|'[^']*')/i, ' '))) return null;
  const bare = attributes.replace(/"[^"]*"|'[^']*'/g, '""');
  const flag = (name) => new RegExp(`(?:^|\\s)${name}(?=[\\s=/]|$)`, 'i').test(bare);
  const aria = attributes.match(/(?:^|\s)aria-checked\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
  return { ariaChecked: aria?.[1] ?? aria?.[2], checked: flag('data-checked'), unchecked: flag('data-unchecked'), filled: flag('data-filled') };
}

// A navigation area (a bar, a menu, a navigation, a list of tabs) and an item that is one by its own role: the places where text is not underlined.
const NAV_AREA_ROLE = /\brole\s*=\s*["'](?:menubar|toolbar|navigation|tablist|menu)["']/i;
const NAV_ITEM_ROLE = /\brole\s*=\s*["'](?:tab|menuitem|menuitemradio|menuitemcheckbox)["']/i;
const NAV_PIECE = /\bdata-aui-styled\s*=\s*["'](?:[^"']*[\s-])?(?:nav|tabs?|menu)(?:[\s-][^"']*)?["']/i;
const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/** The opening tags (by their index in the text) that sit inside a navigation area: <nav>, or an element with the role menubar, toolbar, navigation, tablist or menu. */
function insideNavigation(text, tags) {
  const inside = new Set();
  const stack = [];
  const closing = [...text.matchAll(/<\/([a-zA-Z][\w:.-]*)\s*>/g)].map((match) => ({ match, open: false }));
  for (const { match, open } of [...tags.map((match) => ({ match, open: true })), ...closing].sort((a, b) => a.match.index - b.match.index)) {
    const name = match[1].toLowerCase();
    if (open) {
      if (stack.some((one) => one.area)) inside.add(match.index);
      if (!VOID_ELEMENTS.has(name) && !match[0].endsWith('/>')) stack.push({ name, area: name === 'nav' || NAV_AREA_ROLE.test(match[2]) });
    } else {
      const at = stack.map((one) => one.name).lastIndexOf(name);
      if (at >= 0) stack.length = at;
    }
  }
  return inside;
}

/**
 * Whether a script file is other people's code, never read as the app's own, by its file name: a minified file or a bundle (`.min.js`, `.bundle.js`),
 * or a library by its exact name with at most a version after it (jquery.js, jquery-3.6.0.js, modernizr-2.8.3.js). Any other name is the app's own and is read
 * (bootstrap-setup.js, angular-app.js). Folders named lib and vendor are skipped as folders (SKIPPED_FOLDERS).
 */
export const VENDOR_SCRIPT = /^(?:jquery|bootstrap|modernizr|respond|popper|umd|angular|knockout|moment|lodash|underscore|signalr|select2|datatables|d3)(?:-\d[\w.-]*)?\.js$|\.(?:min|bundle)\.js$/i;
export const isVendorScript = (name) => VENDOR_SCRIPT.test(name);

/** CSS property of a camelCase name of element.style: backgroundColor is background-color. */
const kebab = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
/** A tag in a string, up to its `>`. Old presentational attributes of HTML, on any tag; and the ones that mean a size only on a column element (SIZED_ELEMENTS). Each ends with the blanks before its `=`, in a group. */
const TAG_IN_STRING = /<([a-zA-Z][\w-]*)\b[^<>]*/g;
const OLD_ATTRIBUTE = /\s(align|valign|bgcolor|bordercolor|background|border|cellpadding|cellspacing|hspace|vspace)(\s*)=/gi;
const OLD_SIZE = /\s(width|height)(\s*)=/gi;
const SIZED_ELEMENTS = new Set(['td', 'th', 'col', 'colgroup']);
const OLD_TAG = /<(font|center|marquee|blink|basefont)(?=[\s>/\\])/gi;
/** A style attribute in a string: the blanks before and after its `=`, and the quote its value opens with (none when the value is joined on from code, or written without quotes). */
const STYLE_IN_MARKUP = /[\s"']style(\s*)=(\s*)(?:\\?(["']))?/gi;
/** A string written in code, from where the scan stands: what a quoted string holds, up to its end or the end of its line (a backslash carries it on to the next line), or what a template holds, up to its end. */
const STRING_NEXT = /\s*(?:(["'])((?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\n])*)|`((?:\\[\s\S]|[^\\`])*))/y;
/**
 * Whether a style sets a look of its own: any declaration but an AtomicAUI custom property (--aui-table-frozen-offset on a frozen cell, which the recipes
 * carry; --aui-table-depth on a row of a table tree). One rule for a style in a page, in a string a script writes and in a style a script sets whole.
 */
const setsLook = (style) => style.split(';').map((one) => one.trim()).some((one) => one && !one.startsWith('--aui-'));
/** A regular expression written in a script, from its first `/` to its flags, on one line; and what it can follow: these characters and these words (after a name, a number or a `)` a `/` divides). */
const REGEX_LITERAL = /\/(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[a-z]*/y;
const BEFORE_REGEX = '(,=:[!&|?{};+-*%<>~^';
const WORD_BEFORE_REGEX = new Set(['return', 'typeof', 'case', 'throw', 'void', 'delete', 'in', 'of', 'instanceof', 'new', 'do', 'else', 'yield', 'await']);

/**
 * A script read once, character by character, into what each part is. Returns two texts as long as the script, line breaks kept:
 * `code` is the script with its comments blanked; `markup` is only what stands inside strings and templates (the rest blanked, the `${ }` parts of a template too).
 * A `/*` or `//` inside a string is text, not a comment; a quote inside a regular expression opens no string; a string ends at the end of its line at the latest,
 * unless a backslash before the line break (LF, or CR LF as one break) carries it on to the next line.
 */
function scriptParts(text) {
  const blank = (part) => part.replace(/[^\n]/g, ' ');
  let code = '';
  let markup = '';
  // The last character of code so far that is no blank, the word it ends (none after a dot: a property is a name), and whether it ends `x++` or `x--`: a `/` after that divides.
  let last = '';
  let word = '';
  let counted = false;
  const add = (from, to, kind) => {
    const part = text.slice(from, to);
    code += kind === 'comment' ? blank(part) : part;
    markup += kind === 'string' ? part : blank(part);
    const written = kind === 'code' ? part.trimEnd() : '';
    if (written) {
      last = written.slice(-1);
      counted = /(?:\+\+|--)$/.test(written);
      word = written.match(/(?<![.\w$])[A-Za-z_$][\w$]*$/)?.[0] ?? '';
    }
  };
  // One count of open braces for each template whose `${ }` the scan is inside.
  const braces = [];
  // The inside of a string or a template that starts at `from`, and the mark that ends it. Returns where the scan goes on.
  const literal = (from, quote) => {
    let end = from;
    while (end < text.length && text[end] !== quote && (quote === '`' ? !text.startsWith('${', end) : text[end] !== '\n')) end += text[end] !== '\\' ? 1 : text.startsWith('\r\n', end + 1) ? 3 : 2;
    end = Math.min(end, text.length);
    add(from, end, 'string');
    if (text[end] === quote) {
      add(end, end + 1, 'code');
      return end + 1;
    }
    if (quote === '`' && end < text.length) {
      add(end, end + 2, 'code');
      braces.push(0);
      return end + 2;
    }
    return end;
  };
  const special = /["'`/{}]/g;
  let at = 0;
  while (at < text.length) {
    special.lastIndex = at;
    const next = special.exec(text)?.index ?? text.length;
    if (next > at) {
      add(at, next, 'code');
      at = next;
      continue;
    }
    const char = text[at];
    if (char === '/' && text[at + 1] === '/') {
      const end = text.indexOf('\n', at);
      add(at, end < 0 ? text.length : end, 'comment');
      at = end < 0 ? text.length : end;
    } else if (char === '/' && text[at + 1] === '*') {
      const end = text.indexOf('*/', at + 2);
      add(at, end < 0 ? text.length : end + 2, 'comment');
      at = end < 0 ? text.length : end + 2;
    } else if (char === '/') {
      REGEX_LITERAL.lastIndex = at;
      const found = !counted && (BEFORE_REGEX.includes(last) || WORD_BEFORE_REGEX.has(word)) ? REGEX_LITERAL.exec(text) : null;
      add(at, at + (found ? found[0].length : 1), 'code');
      at += found ? found[0].length : 1;
    } else if (char === '}' && braces.at(-1) === 0) {
      braces.pop();
      add(at, at + 1, 'code');
      at = literal(at + 1, '`');
    } else if (char === '{' || char === '}') {
      if (braces.length > 0) braces[braces.length - 1] += char === '{' ? 1 : -1;
      add(at, at + 1, 'code');
      at += 1;
    } else {
      add(at, at + 1, 'code');
      at = literal(at + 1, char);
    }
  }
  return { code, markup };
}

/**
 * Markup and style that a script writes are look (kit/style/restyle.md): an HTML string with a style attribute, a presentational attribute (align, bgcolor,
 * border, cellpadding, width on a cell...) or a font or center tag, and element.style assignments of a look property (colour, background, border, padding,
 * margin, font...). Show and hide (style.display), sizes and positions are behaviour and are not read. A script inside a page is read the same way (checkMarkup).
 * Markup is read only inside strings and templates, so a comparison or a variable named style, align or border is not markup; a whole style is one written as a string.
 * A value that code joins on (' align=' + side) is a look as much as one written out. A style that sets only --aui- custom properties is the recipe's own (setsLook).
 * A name is read in any case (STYLE=), with the spaces the string holds around its `=` (width = "30"), as the browser reads it.
 * A table or a control (button, input, select, textarea) that a string writes with no AtomicAUI class is a hand-styled control, as the same tag on a page is (AUI-01, plainControl).
 * Comments are left out; a line may be allowed by a `check-allow: AUI-02` comment (`AUI-01` for a control with no class) on it or the line above, as in markup.
 */
export function checkScript(file, text, standard, { firstLine = 1 } = {}) {
  const problems = [];
  // Both texts are as long as the script, so an offset in either is the line of the file.
  const { code, markup } = scriptParts(text);
  const lines = text.split('\n');
  const lineAt = (offset) => text.slice(0, offset).split('\n').length;
  const add = (offset, message, fix, rule = 'AUI-02') => {
    const line = lineAt(offset);
    const allowed = new Set([...`${lines[line - 2] ?? ''}\n${lines[line - 1] ?? ''}`.matchAll(ALLOW)].map((match) => match[1]));
    if (!allowed.has(rule)) problems.push({ rule, file, line: line + firstLine - 1, message, fix });
  };
  const where = standard?.where ?? 'kit/standard';
  const reClass = `Re-class it in the script: write the class list of the recipe from ${where}/recipes/ into the string, delete the attribute, keep the logic around it, and list each changed line in your final message (kit/style/restyle.md: markup a script writes is look).`;
  // Blanks around the `=` of an attribute are spaces of the markup only when the string holds them: where code stood, the name and the `=` are not one attribute.
  const spaces = (from, length) => text.slice(from, from + length) === markup.slice(from, from + length);
  // Where the attribute whose `=` stands at `equals` is named, so a finding and its check-allow comment stand on the attribute's own line; -1 when code stood before its `=`.
  const nameAt = (equals, name, blanks) => (spaces(equals - blanks.length, blanks.length) ? equals - blanks.length - name.length : -1);
  // Every attribute of one kind in every tag the strings hold: the tag as written, the attribute's name and where the name stands.
  const attributes = (pattern) => [...markup.matchAll(TAG_IN_STRING)]
    .flatMap((tag) => [...tag[0].matchAll(pattern)].map((match) => ({ tag: tag[1], name: match[1].toLowerCase(), at: nameAt(tag.index + match.index + match[0].length - 1, match[1], match[2]) })))
    .filter((one) => one.at >= 0);
  // A piece of the strings as written: a blank that stands for code (a value that code joins on) is a NUL, a mark no string holds; a space the string holds stays a space.
  const asWritten = (from, to) => markup.slice(from, to).replace(/ /g, (space, index) => (text[from + index] === ' ' ? space : '\u0000'));
  for (const match of markup.matchAll(STYLE_IN_MARKUP)) {
    const equals = match.index + 6 + match[1].length;
    if (!spaces(equals - match[1].length, match[1].length)) continue;
    // The value as written, up to its closing quote: what code joins into it is a mark, so a value that is all code sets a look, and the value of a custom property does not.
    const from = match.index + match[0].length;
    const close = match[3] && spaces(equals + 1, match[2].length) ? markup.indexOf(match[3], from) : -1;
    const value = close < 0 ? '?' : asWritten(from, close).replace(/\\$/, '');
    if (setsLook(value)) add(match.index + 1, 'A style attribute in markup that a script writes: inline style is a hand-made look.', reClass);
  }
  for (const one of attributes(OLD_ATTRIBUTE)) add(one.at, `The attribute ${one.name} in markup that a script writes: an old presentational attribute, a look set by hand.`, reClass);
  for (const one of attributes(OLD_SIZE)) if (SIZED_ELEMENTS.has(one.tag.toLowerCase())) add(one.at, `A ${one.name} attribute on <${one.tag}> in markup that a script writes: a presentational size set by hand.`, `${reClass} A column's width is the layout class aui-width-<n> on its cells (${where}/recipes/table.md).`);
  for (const match of markup.matchAll(OLD_TAG)) add(match.index, `<${match[1].toLowerCase()}> in markup that a script writes: an old presentational tag.`, reClass);
  // A table or a control with no AtomicAUI class in a string is a hand-styled control as on a page (plainControl): its class and type as the string holds them,
  // a value in quotes up to its closing quote, one without quotes up to the first blank or to where code begins, as the browser reads it; what code joins on is no part of a value (asWritten).
  const valueOf = (tag, name) => {
    const found = tag.match(new RegExp(`[\\s\\u0000]${name}\\s*=\\s*(?:\\\\?["']([^"'\\\\]*)|([^\\s\\u0000"'\\\\]*))`, 'i'));
    return (found?.[1] ?? found?.[2] ?? '').trim();
  };
  for (const tag of markup.matchAll(TAG_IN_STRING)) {
    const whole = asWritten(tag.index, tag.index + tag[0].length);
    const plain = plainControl(tag[1], valueOf(whole, 'class'), valueOf(whole, 'type'), where);
    if (plain) add(tag.index, plain.message, plain.fix, 'AUI-01');
  }
  const FIX_CLASS = 'Switch a class of the recipe instead (classList.add / remove with the whole class list of the state, kit/style/restyle.md), or delete it. Show and hide may stay as style.display.';
  // The string written right after a match, if one is: the whole style a script sets. A string that sets only --aui- custom properties is no look (setsLook).
  const stringAfter = (match) => {
    STRING_NEXT.lastIndex = match.index + match[0].length;
    const found = STRING_NEXT.exec(code);
    return (found?.[2] ?? found?.[3])?.replace(/\\\r?\n/g, '');
  };
  for (const match of code.matchAll(/\.style\.([a-zA-Z]+)\s*(\+?=)(?!=)/g)) {
    const property = kebab(match[1]);
    if (property === 'css-text') {
      if (setsLook(stringAfter(match) ?? '?')) add(match.index, 'A script writes a whole style string (style.cssText): a look written in code, not a class.', FIX_CLASS);
    } else if (LOOK_PROPERTY.test(property)) add(match.index, `element.style sets ${property} in a script: a look written in code, not a class.`, FIX_CLASS);
  }
  for (const match of code.matchAll(/\.style\.setProperty\(\s*["']([\w-]+)["']/g)) if (LOOK_PROPERTY.test(match[1])) add(match.index, `element.style sets ${match[1]} in a script: a look written in code, not a class.`, FIX_CLASS);
  for (const match of code.matchAll(/setAttribute\(\s*["']style["']\s*,/g)) {
    if (setsLook(stringAfter(match) ?? '?')) add(match.index, 'A script writes a whole style string: a look written in code, not a class.', FIX_CLASS);
  }
  // `.style = <string>` is a style only when the string holds a declaration (property: value): a word alone is the value of some other object (the style of a number format: 'currency').
  for (const match of code.matchAll(/\.style\s*=(?!=)/g)) {
    const written = stringAfter(match) ?? '';
    if (written.includes(':') && setsLook(written)) add(match.index, 'A script writes a whole style string: a look written in code, not a class.', FIX_CLASS);
  }
  return problems;
}

/** Every rule that can be read from markup: class lists, inline styles, plain controls, page setup, other libraries. */
export function checkMarkup(file, text, standard) {
  const problems = [];
  const lines = text.split('\n');
  const lineAt = (offset) => text.slice(0, offset).split('\n').length;
  const add = (rule, line, message, fix) => {
    const allowed = new Set([...`${lines[line - 2] ?? ''}\n${lines[line - 1] ?? ''}`.matchAll(ALLOW)].map((match) => match[1]));
    if (!allowed.has(rule)) problems.push({ rule, file, line, message, fix });
  };
  const tags = [...text.matchAll(TAG)];
  const inNavigation = insideNavigation(text, tags);
  // The scripts written in the page itself (no src; no type, or a JavaScript one): what they write is a look too. A template kept in a <script type="text/html"> is markup, not code.
  const scripts = [...text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((block) => !/\ssrc\s*=/i.test(block[1]) && /^(?:module|(?:text|application)\/(?:java|ecma)script)?$/i.test(block[1].match(/\stype\s*=\s*["']?([^"'\s]*)/i)?.[1] ?? ''))
    .map((block) => ({ from: block.index + block[0].indexOf('>') + 1, to: block.index + block[0].length, text: block[2] }));
  const classNames = (one) => { const found = one[2].match(/(?:^|\s)class\s*=\s*(?:"([^"]*)"|'([^']*)')/i); const value = found?.[1] ?? found?.[2] ?? ''; return /[@{}$%()]/.test(value) ? [] : value.split(/\s+/).filter(Boolean); };
  for (const [position, match] of tags.entries()) {
    const [, tag, attributes] = match;
    const line = lineAt(match.index);
    const read = (name) => {
      const found = attributes.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"(${COMPUTED})"|'(${COMPUTED})'|"([^"]*)"|'([^']*)')`, 'i'));
      return found ? (found[1] ?? found[2] ?? found[3] ?? found[4]) : undefined;
    };
    const lower = tag.toLowerCase();
    const element = tag === 'NavLink' ? 'a' : lower;
    const classText = read('class') ?? '';
    if (WHOLE_COMPUTED.test(classText)) {
      // The whole value is chosen by the template: each text in it is the whole class list of one state.
      const lists = [...classText.matchAll(TEXTS)].map((one) => one[0].slice(1, -1)).filter((one) => /(^|\s)aui-/.test(one));
      const seen = new Set();
      for (const list of lists) {
        for (const one of checkClassList(element, list.split(/\s+/).filter(Boolean), standard)) {
          if (seen.has(one.message)) continue;
          seen.add(one.message);
          add(one.rule, line, one.message, one.fix);
        }
      }
    } else {
      // A list put together from pieces cannot be read whole here: only its names are checked. The page check sees the rest.
      const dynamic = /[@{}$%()]/.test(classText);
      const names = classText.split(/\s+/).filter((name) => /^[\w-]+$/.test(name));
      const found = dynamic ? checkClassList(element, names, standard).filter((one) => one.message.startsWith('Unknown')) : checkClassList(element, names, standard);
      for (const one of found) add(one.rule, line, one.message, one.fix);
    }
    // A switch's colour and its state attributes (its own and its thumb's, the next thumb tag before the next switch) say the same state.
    if (classNames(match).includes('aui-switch')) {
      const own = stateOfTag(attributes);
      const next = tags.slice(position + 1).find((one) => classNames(one).some((name) => name === 'aui-switch' || name === 'aui-switch-thumb'));
      const thumb = next && classNames(next).includes('aui-switch-thumb') ? stateOfTag(next[2]) : undefined;
      if (own) for (const one of checkSwitchState(classNames(match), { ...own, thumb: thumb ?? undefined }, standard.where)) add(one.rule, line, one.message, one.fix);
    }
    // A tag inside a script of the page is markup that the script writes: its style, its sizes and a control with no class are read with the script (checkScript, below), once.
    const written = scripts.some((block) => match.index >= block.from && match.index < block.to);
    const style = read('style');
    if (!written && style !== undefined && setsLook(style)) {
      add('AUI-02', line, `Inline style on <${tag}>.`, `Remove it. The look comes from AtomicAUI classes only (${standard.where}/start.md).`);
    }
    // A column's width is a layout class (aui-width-<n>) on its cells. A width attribute is a hand-made look, and the header and the body of a scrolling table are two tables that would drift apart.
    if (!written && tag === lower && COLUMN_ELEMENTS.has(lower) && /(?:^|\s)width\s*=/i.test(attributes.replace(/"[^"]*"|'[^']*'/g, '""'))) {
      add('AUI-02', line, `Width attribute on <${tag}>: a presentational width set by hand.`, `Remove it. Leave the columns equal, or give the header cell and every cell of that column the layout class aui-width-<n> (for example aui-width-96); see ${standard.where}/recipes/table.md.`);
    }
    const plain = written ? undefined : plainControl(tag, classText, read('type') ?? '', standard.where);
    if (plain) add('AUI-01', line, plain.message, plain.fix);
    if (lower === 'button' && /\baui-scale-(square|contained)-/.test(classText) && read('aria-label') === undefined && read('aria-labelledby') === undefined) {
      add('AUI-11', line, 'Icon-only button with no accessible name.', 'Add aria-label="What it does".');
    }
    if (/\brole\s*=\s*["']switch["']/i.test(attributes) && read('aria-label') === undefined && read('aria-labelledby') === undefined) {
      add('AUI-11', line, 'Switch with no accessible name.', `Copy field-switch whole from ${standard.where}/recipes/form.md: the switch carries aria-labelledby with the id of its label. Never leave a switch with only a text beside it.`);
    }
    const click = tag === lower && /^[a-z][a-z0-9]*$/.test(tag) && !NATIVE_CLICK.has(lower) ? attributes.match(CLICK_ATTRIBUTE)?.[1] : undefined;
    if (click) add('AUI-01', line, `<${tag}> with ${click}: a clickable thing with no keyboard, no role and no focus ring.`, `Put the handler on a native <button type="button"> or <a> that carries a class recipe (${standard.where}/recipes/button.md, or a styled piece of kind B).`);
    // A navigation link or tab is not underlined: a link in a bar, a menu, a navigation or a list of tabs, a link that marks the current page, a tab or menu item that is a link. Body-text links keep the browser underline.
    const isLink = element === 'a';
    const inNav = inNavigation.has(match.index) || NAV_AREA_ROLE.test(attributes) || NAV_ITEM_ROLE.test(attributes);
    if (isLink && (inNav || /(?:^|\s)aria-current\s*=/i.test(attributes) || NAV_PIECE.test(attributes)) && !/(?:^|[\s"'])aui-text-decoration-none(?:$|[\s"'])/.test(classText)) {
      add('AUI-09', line, `A navigation link (<${tag}> in a bar, menu, navigation or list of tabs, or marking the current page) is underlined: the browser underlines every link.`, 'Add the class aui-text-decoration-none to the link (the layout class of a view recipe; the stylesheet has it). Keep its focus ring and aria-current. A link inside a paragraph of text keeps its underline.');
    }
    if (inNav && /(?:^|[\s"'])aui-text-decoration-underline(?:$|[\s"'])/.test(classText)) {
      add('AUI-09', line, `<${tag}> in a bar, menu, navigation or list of tabs has the class aui-text-decoration-underline: a navigation item or tab is not underlined.`, `Remove the aui-text-decoration-underline class. A tab shows the current page by its filled chip (${standard.where}/recipes/tabs.md), never an underline.`);
    }
    // A tree row is the treeitem, or the TreeView row that opens it (the tree recipe in tree.md): never a button, and no fill, outline, border or tonal box of its own. The library's own states are its looks: the picked TreeView row (solid surface-alt), and the tonal surface and raised of a table tree. An <a role="treeitem"> is the navigation tree pattern that a restyled page keeps, so a link is no fault.
    const names = classNames(match);
    const before = tags[position - 1];
    const treeRow = /(?:^|\s)data-aui-tree-view-row(?=[\s=/]|$)/i.test(attributes) || (before !== undefined && TREE_ITEM.test(before[2]) && text.slice(before.index + before[0].length, match.index).trim() === '');
    const BOX = /^aui-color-(solid|outlined)-|^aui-border-|^aui-color-tonal-(?!surface$|raised$)/;
    if ((treeRow || TREE_ITEM.test(attributes)) && (lower === 'button' || names.includes('aui-button') || names.some((name) => BOX.test(name) && !(treeRow && name === 'aui-color-solid-surface-alt')))) {
      add('AUI-09', line, `A tree row (role="treeitem" or its TreeView row) drawn as ${lower === 'button' || names.includes('aui-button') ? 'a button' : 'a filled, tonal or bordered box'}: the rows of a tree are paint text on the surface, with no border and no fill of their own; only the picked row takes the library's picked fill.`, `Copy the whole tree recipe from ${standard.where}/recipes/tree.md: <div role="treeitem"> with its TreeView row, and the picked class list its "You add" line names.`);
    }
    if ((names.includes('aui-table-expand-trigger') || names.includes('aui-tree-view-chevron')) && names.some((name) => /^aui-color-(tonal|solid|outlined)-/.test(name))) {
      add('AUI-09', line, 'The fold arrow of a tree is a tonal or filled box: it is a plain text-paint icon control on the surface.', `Copy the disclosure arrow from the tree recipe in ${standard.where}/recipes/tree.md (no border or fill).`);
    }
    const address = lower === 'link' ? read('href') : lower === 'script' ? read('src') : undefined;
    const kept = lower === 'script' && address && standard.kept?.has(address.split(/[?#]/)[0].split('/').pop().toLowerCase());
    if (address && OTHER_LIBRARY.test(address) && !kept) add('AUI-01', line, `Another UI library is loaded: ${address}.`, lower === 'script' ? 'Remove it. Every control is built from an AtomicAUI class recipe. A widget script that a restyled element still needs for its behaviour (a Bootstrap dropdown or collapse) stays: one line in GAPS.md, - Kept widget script `<file name>`: which widgets, which page (kit/style/maps/bootstrap.md).' : 'Remove it. Every control is built from an AtomicAUI class recipe.');
  }
  if (/<html[\s>]/i.test(text)) {
    if (!/data-aui-brand\s*=/.test(text) || !/data-aui-theme\s*=/.test(text)) add('AUI-10', 1, 'The page has no AtomicAUI identity attributes, so no theme colour reaches it and dark mode cannot work.', `Put the four data-aui-* attributes on <html> as ${standard.where}/page.html shows.`);
    if (!/aui\.css/.test(text)) add('AUI-06', 1, 'The page does not load the AtomicAUI stylesheet (aui/aui.css).', `Add the two <link> lines and the theme script from ${standard.where}/page.html.`);
  }
  for (const block of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    problems.push(...checkStyles(file, block[1], lineAt(block.index + block[0].indexOf('>') + 1)));
  }
  for (const piece of styledPieces(file, text, standard)) for (const one of piece.problems) add(one.rule, one.line, one.message, one.fix);
  for (const block of scripts) problems.push(...checkScript(file, block.text, standard, { firstLine: lineAt(block.from) }));
  for (const mark of alignedMarks(text)) {
    if (!/^[a-z][a-z0-9-]*$/.test(mark.name)) add('AUI-09', mark.line, `data-aui-aligned="${mark.name}" is not a widget name.`, 'Name the widget in lower case with dashes, for example data-aui-aligned="tinychart".');
    else if (standard.aligned && !standard.aligned.has(mark.name)) add('AUI-12', mark.line, `The aligned widget "${mark.name}" has no line in GAPS.md.`, `Add one line to GAPS.md: - Aligned widget \`${mark.name}\`: what it is, which page, what alignment cannot give (its anatomy, states and behaviour stay its own).`);
  }
  return problems;
}

const numbers = (value) => (value.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
const sameValue = (a, b) => {
  if (a === b) return true;
  const [x, y] = [numbers(a), numbers(b)];
  return a.replace(/-?\d+(\.\d+)?/g, '#') === b.replace(/-?\d+(\.\d+)?/g, '#') && x.every((value, index) => Math.abs(value - y[index]) <= 0.5);
};

/** Maintainers, at build time: a page of recipes with no React against the look the React parts measured. */
export function compareLook(elements, standard, theme) {
  const problems = [];
  for (const element of elements) {
    const name = `<${element.tag}>${element.text ? ` "${element.text}"` : ''}`;
    const listed = checkClassList(element.tag, element.classes, standard);
    for (const one of listed) problems.push({ ...one, message: `${name}: ${one.message}` });
    const reference = standard.bySignature.get(`${element.tag} ${[...element.classes].sort().join(' ')}`);
    if (!reference) problems.push({ rule: 'AUI-09', message: `${name}: this class list was not read from a React part.`, fix: 'Rebuild the recipes: npm run standard:build.' });
    if (!reference || listed.length > 0 || !element.look || reference[theme].length === 0) continue;
    const differences = (look) => Object.keys(look).filter((property) => property in element.look && !sameValue(element.look[property], look[property])).map((property) => `${property} ${element.look[property] || 'none'}, React ${look[property] || 'none'}`);
    const best = reference[theme].map(differences).sort((a, b) => a.length - b.length)[0];
    if (best.length > 0) problems.push({ rule: 'AUI-06', message: `${name} does not look like the React part (${reference.recipes[0]}, ${theme}): ${best.slice(0, 3).join('; ')}.`, fix: 'The recipe lost something when it was read from the React part: look at readCase in scripts/standard-measure.mjs.' });
  }
  return problems;
}

/**
 * A running page: every class list as rendered must be a recipe, and every element must measure the same as the
 * same markup under the untouched stylesheet (`library`, from measureStandard). The recipes themselves are
 * proved equal to the React parts when the kit is built, so a page that passes both looks like the React parts.
 */
export function checkRendered(elements, standard) {
  const problems = [];
  const overridden = new Map();
  for (const element of elements) {
    const name = `<${element.tag}>${element.text ? ` "${element.text}"` : ''}`;
    for (const one of checkClassList(element.tag, element.classes, standard)) problems.push({ ...one, message: `${name}: ${one.message}` });
    for (const one of checkSwitchState(element.classes, element.state, standard.where)) problems.push({ ...one, message: `${name}: ${one.message}` });
    if (!element.look || !element.library) continue;
    const differences = Object.keys(element.library).filter((property) => !sameValue(element.look[property] ?? '', element.library[property])).map((property) => `${property} ${element.look[property] || 'none'}, the library gives ${element.library[property] || 'none'}`);
    if (differences.length === 0) continue;
    const key = `${element.tag} ${differences.join('; ')}`;
    overridden.set(key, { first: overridden.get(key)?.first ?? name, count: (overridden.get(key)?.count ?? 0) + 1, differences });
  }
  for (const { first, count, differences } of overridden.values()) {
    problems.push({ rule: 'AUI-06', message: `${first}${count > 1 ? ` and ${count - 1} more like it` : ''}: not the AtomicAUI look. ${differences.slice(0, 3).join('; ')}${differences.length > 3 ? `; and ${differences.length - 3} more properties` : ''}.`, fix: 'Something overrides the library: your CSS, an inline style, or the host page. Remove it. Never edit aui/aui.css; a look the library does not have is a line in GAPS.md.' });
  }
  return problems;
}
