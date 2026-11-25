// The behaviour check's runner: the steps a user takes on each part, how they are pressed in a real browser,
// what is written down after each one, and how two records are compared.
// The steps are only what the user does. What must happen next is never written by hand: it is recorded from
// the real React part (the specification) and then demanded of every other page.
import { installBehaviour } from './behaviour-page.mjs';

export const PARTS = ['select', 'dialog', 'tabs'];

// Data attributes the stylesheet's rules depend on are state a page must carry; these few are motion or page setup.
const NOT_STATE = /^data-(starting-style|ending-style|instant|field-control|aui-(brand|theme|typeface|typography|focus-origin|popup-motion|script|icon-family|icon-style))$/;
export const stateDataOf = (css) => [...new Set([...css.matchAll(/\[(data-[a-z-]+)/g)].map((match) => match[1]))].filter((name) => !NOT_STATE.test(name)).sort();

const KEYS = {
  Tab: { key: 'Tab', code: 'Tab', vk: 9 },
  'Shift+Tab': { key: 'Tab', code: 'Tab', vk: 9, modifiers: 8 },
  Enter: { key: 'Enter', code: 'Enter', vk: 13, text: '\r' },
  Space: { key: ' ', code: 'Space', vk: 32, text: ' ' },
  Escape: { key: 'Escape', code: 'Escape', vk: 27 },
  ArrowDown: { key: 'ArrowDown', code: 'ArrowDown', vk: 40 },
  ArrowUp: { key: 'ArrowUp', code: 'ArrowUp', vk: 38 },
  ArrowLeft: { key: 'ArrowLeft', code: 'ArrowLeft', vk: 37 },
  ArrowRight: { key: 'ArrowRight', code: 'ArrowRight', vk: 39 },
  Home: { key: 'Home', code: 'Home', vk: 36 },
  End: { key: 'End', code: 'End', vk: 35 },
};
const letter = (text) => ({ key: text, code: `Key${text.toUpperCase()}`, vk: text.toUpperCase().charCodeAt(0), text });

// A step may carry a third item: why its result is not required of a page. The React part's result is still recorded
// and shown; the check does not compare it. Every such step is a question for the library owner, never a silent pass.
// The third item may instead be { keys, reason }: only those keys of the step are not required; the rest is compared.
// `keys` may be a function of the record so far, so the keys name what the React part really did.
// The third item may also be a function of the record so far that gives the reason, or nothing when the step is required.
// Seen with this order of steps and only with it: the list closed with Shift+Tab, then a letter typed while closed,
// then a pick by mouse. Leaving out the Shift+Tab or the typed letter, the React part opens on the picked option.
const STALE = 'Not required. Here the React part opens the list on the option that had focus when Shift+Tab closed it earlier, not on the option picked since. It does so only after that Shift+Tab close followed by a letter typed while closed. A page opens it on the picked option.';
// The same habit of the React part, seen one step earlier: a list closed with Tab while an option that cannot be
// picked (a disabled one) had focus opens again on that option.
const STALE_TAB = 'Not required. Here the React part opens the list on the option that had focus when Tab closed it, not on the selected option. It does so when that option could not be picked (it is disabled). A page opens it on the selected option.';
const STALE_STOP = 'Here the React part leaves a second tab stop (tabindex 0) on the option that had focus when Shift+Tab closed the list earlier. It does so only after that Shift+Tab close followed by a letter typed while closed. A page keeps one tab stop, on the option that has focus.';

/** What a user does to a part of this shape, in order. Each step is [what, with]. */
export function stepsFor(shape) {
  const key = (name) => ['key', name];
  if (shape.part === 'select') {
    const last = shape.options.length - 1;
    const firstLetter = (shape.options[0]?.name ?? 'a').slice(0, 1).toLowerCase();
    const lastEnabled = shape.options.map((option, index) => (option.disabled ? -1 : index)).filter((index) => index >= 0).pop() ?? 0;
    const disabled = shape.options.findIndex((option) => option.disabled);
    const disabledLetter = disabled < 0 ? '' : shape.options[disabled].name.slice(0, 1).toLowerCase();
    // A pause before each typed letter: letters typed close together are read as one word.
    const type = (text) => [['wait', 900], ['type', text]];
    const staleStop = {
      keys: (trace) => {
        const closedAt = trace.findLastIndex((one) => one.do[0] === 'key' && one.do[1] === 'Shift+Tab');
        const focus = trace[closedAt - 1]?.then.focus ?? '';
        return focus.startsWith('option ') ? [`parts > ${focus} > tabindex`] : [];
      },
      reason: STALE_STOP,
    };
    // Not required only when the record shows it: the option that had focus when Tab closed the list was not the selected one.
    const staleOpen = (trace) => {
      const closedAt = trace.findLastIndex((one) => one.do[0] === 'key' && one.do[1] === 'Tab');
      const before = trace[closedAt - 1]?.then;
      const focus = before?.focus ?? '';
      return focus.startsWith('option ') && before.parts?.[focus]?.attributes?.['aria-selected'] !== 'true' ? STALE_TAB : '';
    };
    return [
      ['focus', 'trigger'], key('Enter'),
      ...Array.from({ length: last + 1 }, () => key('ArrowDown')),
      key('Home'), key('ArrowUp'), key('End'), ...type(firstLetter), key('Escape'),
      key('ArrowDown'), key('ArrowUp'), key('Enter'),
      key('Space'), key('Tab'),
      ['focus', 'trigger'], ['key', 'ArrowUp', staleOpen], key('Shift+Tab'),
      ['focus', 'trigger'], ...type(firstLetter),
      ['click', 'trigger', staleStop], ['click', `option ${lastEnabled}`],
      ['click', 'trigger', STALE], ['click', 'trigger'],
      ['click', 'trigger', STALE], ['click', 'outside'],
      // What a disabled option does when the user reaches it, presses it, clicks it or types its letter.
      ...(disabled < 0 ? [] : [
        key('Enter'), key('Home'), ...Array.from({ length: disabled }, () => key('ArrowDown')), key('Enter'), key('Space'), ['click', `option ${disabled}`],
        key('Home'), ...type(disabledLetter), key('Escape'), ...type(disabledLetter),
      ]),
      ['focus', 'trigger'], key('Tab'),
    ];
  }
  if (shape.part === 'dialog') {
    const stops = 1 + shape.fields.length + shape.actions.length;
    return [
      ['focus', 'opener'], key('Enter'),
      ...Array.from({ length: stops + 1 }, () => key('Tab')),
      key('Shift+Tab'), key('Shift+Tab'), key('Escape'),
      key('Space'), ['click', 'item 0'],
      key('Enter'), ['click', `item ${stops - 1}`],
      key('Enter'), ['click', 'description'], key('Tab'), ['click', 'outside'],
      ['click', 'opener'], key('Tab'), key('Escape'),
      key('Tab'),
    ];
  }
  const count = shape.tabs.length;
  const other = (shape.selected + 1) % count;
  return [
    ['focus', `tab ${shape.selected}`],
    ...Array.from({ length: count }, () => key('ArrowRight')),
    key('ArrowLeft'), key('Home'), key('End'), key('ArrowDown'), key('ArrowUp'), key('Enter'),
    key('Tab'), key('Shift+Tab'), key('ArrowLeft'), key('Space'),
    key('ArrowRight'), key('Tab'), key('Shift+Tab'),
    ['click', `tab ${other}`], ['click', `tab ${shape.selected}`], key('Tab'), key('Tab'),
  ];
}

/** The count variants avoid typeahead, whose result depends on the page's option words. */
export function stepsForSelectCount(shape) {
  const last = shape.options.length - 1;
  const keyed = shape.selected === 1 ? 0 : 1;
  return [
    ['focus', 'trigger'], ['key', 'Enter'],
    ...Array.from({ length: last + 1 }, () => ['key', 'ArrowDown']),
    ['key', 'Home'], ['key', 'End'], ['key', 'Escape'],
    ['key', 'Enter'], ['key', 'Home'], ...Array.from({ length: keyed }, () => ['key', 'ArrowDown']), ['key', 'Enter'],
    ['key', 'Space'], ['key', 'Tab'], ['focus', 'trigger'], ['key', 'Enter'],
    ['click', `option ${1 - keyed}`], ['click', 'trigger'], ['click', 'outside'],
    ['focus', 'trigger'], ['key', 'Tab'],
  ];
}

const nameOf = (option) => option.name;
// As aui/aui-behaviour.js writes the hidden input: the option's data-value where it has one, its name where it has none.
const valueOf = (option) => option.value ?? option.name;

/**
 * A recorded variant with the same structure can compare independently of the words on the page: each of the shape's own words is
 * written as a place holder where it stands. Anything else is left as it is, so a value that is not the page's word stays a difference.
 */
export function maskWords(steps, shape) {
  const copy = structuredClone(steps);
  const swap = (holder, key, to) => { if (typeof holder?.[key] === 'string') holder[key] = to(holder[key]); };
  const word = (own, token) => (value) => (value === own ? token : value);
  const lead = (own, token) => (value) => (value.startsWith(own) ? `${token}${value.slice(own.length)}` : value);
  const option = (said) => (value) => {
    const at = shape.options.findIndex((one) => said(one) === value);
    return at < 0 ? value : `__option_${at}__`;
  };
  for (const step of copy) for (const [ref, part] of Object.entries(step.then?.parts ?? {})) {
    const [, kind, number] = /^(option|item) (\d+)$/.exec(ref) ?? [];
    const at = Number(number);
    if (shape.part === 'select') {
      if (ref === 'trigger') {
        swap(part.reader, 'name', word(shape.label, '__label__'));
        swap(part, 'text', option(nameOf));
        swap(part, 'formValue', option(valueOf));
        swap(part.reader, 'value', option(nameOf));
      } else if (kind === 'option') swap(part.reader, 'name', word(shape.options[at]?.name, `__option_${at}__`));
    } else {
      if (ref === 'opener') swap(part.reader, 'name', word(shape.opener, '__opener__'));
      if (ref === 'title' || ref === 'dialog') swap(part.reader, 'name', lead(shape.title, '__title__'));
      if (ref === 'dialog') swap(part.reader, 'description', word(shape.description, '__description__'));
      if (kind === 'item' && at > 0) swap(part.reader, 'name', word(shape.actions[at - 1], `__action_${at - 1}__`));
    }
  }
  if (steps.redraws !== undefined) copy.redraws = steps.redraws;
  return copy;
}

/**
 * The record of a select of the same size and picked option, or of a confirm-only dialog, with the recorded words replaced by place
 * holders, or null when no record fits. A record stands for a page only where every word it carries is said on the page and each
 * option can be told from the others by its name and by its form value.
 */
export function countRecord(spec, shape) {
  const said = (words) => words.every(Boolean);
  const distinct = (words) => new Set(words).size === words.length;
  if (shape.part === 'select' && shape.options.every((option) => !option.disabled) && said([shape.label, ...shape.options.map(nameOf)]) && distinct(shape.options.map(nameOf)) && distinct(shape.options.map(valueOf))) {
    const variant = spec.variants?.find((one) => one.fixture.options.length === shape.options.length && one.fixture.selected === shape.selected);
    if (variant) return { steps: maskWords(variant.steps, variant.fixture), shape };
  }
  if (shape.part === 'dialog' && shape.fields.length === 0 && shape.actions.length === 2 && said([shape.opener, shape.title, shape.description, ...shape.actions])) {
    const variant = spec.variants?.find((one) => one.fixture.fields.length === 0 && one.fixture.actions.length === 2);
    if (variant) return { steps: maskWords(variant.steps, variant.fixture), shape };
  }
  return null;
}

/**
 * A tab set of any size is compared with a recorded set of the same size, whatever the tabs are called. The specification holds the
 * record of the set it was written on and of a few other sizes (`variants`); only the tab names differ between two sets of one size.
 * Returns { steps, names } (the recorded steps with the tab names replaced by place holders, and the names of the page's tabs), or null
 * when no record fits: a tab with a close button or a disabled tab, a picked tab that is not the first, or a size nobody recorded.
 */
export function tabsRecord(spec, shape) {
  if (shape.part !== 'tabs' || shape.closable || shape.disabledTab || shape.selected !== 0) return null;
  const same = [spec, ...(spec.variants ?? [])].find((one) => one.fixture.tabs.length === shape.tabs.length && one.fixture.selected === 0);
  return same ? { steps: maskNames(same.steps, same.fixture.tabs.map((tab) => tab.name)), names: shape.tabs.map((tab) => tab.name) } : null;
}

/** A record with each tab name (what a screen reader says for a tab or the panel it opens) written as `tab name <n>`, by place in the set. */
export function maskNames(steps, names) {
  const mask = (value) => (typeof value === 'string' && names.includes(value) ? `tab name ${names.indexOf(value)}` : value);
  const copy = steps.map((step) => structuredClone(step));
  for (const step of copy) for (const part of Object.values(step.then?.parts ?? {})) if (part.reader && 'name' in part.reader) part.reader.name = mask(part.reader.name);
  if (steps.redraws !== undefined) copy.redraws = steps.redraws;
  return copy;
}

/** The steps of a recorded specification, to take again on another page. */
export const stepsOf = (spec) => spec.steps.map((step) => (step.free ? [...step.do, step.free] : step.loose ? [...step.do, step.loose] : step.do));

export const sayStep = ([what, arg]) => (what === 'wait' ? 'wait' : what === 'key' ? `press ${arg}` : what === 'type' ? `type "${arg}"` : what === 'click' ? `click ${arg === 'outside' ? 'outside the part' : arg}` : `focus ${arg}`);

const AX_PROPERTIES = ['focused', 'expanded', 'selected', 'disabled', 'hasPopup', 'modal', 'orientation', 'checked', 'invalid', 'required', 'readonly', 'level'];

/** A page (from scripts/browser.mjs) with the behaviour reader installed and one part chosen. */
export async function openPart(page, part, index, stateData) {
  await page.evaluate(`(${installBehaviour})(${JSON.stringify(stateData)})`);
  return page.evaluate(`window.__auiBehaviour.choose(${JSON.stringify(part)}, ${index})`);
}

async function act(page, [what, arg]) {
  const call = page.call;
  if (what === 'wait') return page.evaluate(`new Promise((resolve) => setTimeout(() => resolve(true), ${Number(arg)}))`);
  if (what === 'focus') return page.evaluate(`window.__auiBehaviour.focus(${JSON.stringify(arg)})`);
  if (what === 'key' || what === 'type') {
    const one = what === 'key' ? KEYS[arg] : letter(arg);
    const base = { key: one.key, code: one.code, windowsVirtualKeyCode: one.vk, nativeVirtualKeyCode: one.vk, modifiers: one.modifiers ?? 0 };
    await call('Input.dispatchKeyEvent', { type: one.text ? 'keyDown' : 'rawKeyDown', ...base, text: one.text, unmodifiedText: one.text });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
    return true;
  }
  const spot = await page.evaluate(`window.__auiBehaviour.point(${JSON.stringify(arg)})`);
  if (!spot) return false;
  await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: spot.x, y: spot.y });
  await call('Input.dispatchMouseEvent', { type: 'mousePressed', x: spot.x, y: spot.y, button: 'left', clickCount: 1 });
  await call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: spot.x, y: spot.y, button: 'left', clickCount: 1 });
  return true;
}

/** What a screen reader is given for each element of the part: role, name, description and states from the browser's accessibility tree. */
async function accessibility(page, refs) {
  const found = {};
  for (const ref of refs) {
    const { result } = await page.call('Runtime.evaluate', { expression: `window.__auiBehaviourRefs[${JSON.stringify(ref)}]` });
    if (!result.objectId) continue;
    const { nodes } = await page.call('Accessibility.getPartialAXTree', { objectId: result.objectId, fetchRelatives: false });
    const node = nodes[0];
    if (!node || node.ignored) {
      found[ref] = { hidden: true };
      continue;
    }
    const states = {};
    for (const property of node.properties ?? []) if (AX_PROPERTIES.includes(property.name) && property.value.value !== false) states[property.name] = String(property.value.value);
    found[ref] = { role: node.role?.value ?? '', name: node.name?.value ?? '', ...(node.description?.value ? { description: node.description.value } : {}), ...(node.value?.value !== undefined && node.value.value !== '' ? { value: String(node.value.value) } : {}), states };
  }
  return found;
}

const LOOK_EVERY = 60;
const LOOKS = 100;
const PATIENCE = `${(LOOK_EVERY * LOOKS) / 1000} s`;

/**
 * A part may animate: waits until three looks in a row are the same and no animation or transition is still running,
 * for LOOKS looks at most. Returns { snapshot, calm }: `calm` false means the page never came to rest.
 */
export async function settled(page) {
  let previous = '';
  let same = 0;
  let look = null;
  for (let turn = 0; turn < LOOKS && !(same >= 3 && !look.moving); turn++) {
    await page.evaluate(`new Promise((resolve) => setTimeout(resolve, ${LOOK_EVERY}))`);
    look = await page.evaluate('({ snapshot: window.__auiBehaviour.snapshot(), moving: window.__auiBehaviour.moving() })');
    const text = JSON.stringify(look.snapshot);
    same = text === previous ? same + 1 : 1;
    previous = text;
  }
  return { snapshot: look.snapshot, calm: same >= 3 && !look.moving };
}

/** What a step's third item puts in the record: { free }, { loose: { keys, reason } }, or nothing when all of the step is required. */
export function markOf(marker, trace) {
  if (typeof marker === 'function') return markOf(marker(trace), trace);
  if (!marker) return {};
  if (typeof marker === 'string') return { free: marker };
  const keys = typeof marker.keys === 'function' ? marker.keys(trace) : marker.keys;
  return keys.length > 0 ? { loose: { keys, reason: marker.reason } } : {};
}

/** Takes every step on the chosen part and returns the record: [{ do, then }]. A step after which the page never came to rest is marked `unsettled`. */
export async function record(page, steps) {
  await page.call('Accessibility.enable');
  const trace = [];
  for (const step of steps) {
    const done = await act(page, step);
    const { snapshot, calm } = await settled(page);
    const tree = await accessibility(page, Object.keys(snapshot.parts));
    for (const [ref, one] of Object.entries(snapshot.parts)) one.reader = tree[ref] ?? { hidden: true };
    const [what, arg, free] = step;
    trace.push({ do: [what, arg], ...markOf(free, trace), ...(calm ? {} : { unsettled: true }), then: done ? snapshot : { ...snapshot, missing: `could not ${sayStep(step)}` } });
  }
  // Not part of the record that is compared: how often the page replaced the part's own element during these steps.
  trace.redraws = await page.evaluate('window.__auiBehaviour.redraws()');
  return trace;
}

/** Opens the part's layer, if it has one, reads its shape, and leaves the page to be opened again. */
export async function readShape(page, part) {
  if (part === 'tabs') return page.evaluate('window.__auiBehaviour.shape()');
  await act(page, ['focus', part === 'select' ? 'trigger' : 'opener']);
  await act(page, ['key', 'Enter']);
  await settled(page);
  return page.evaluate('window.__auiBehaviour.shape()');
}

const flat = (value, prefix, out) => {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, inner] of Object.entries(value)) flat(inner, prefix ? `${prefix} > ${key}` : key, out);
  } else out.set(prefix, Array.isArray(value) ? value.join(' ') : value === null ? 'none' : String(value));
  return out;
};
// The React tab panels were recorded holding no control; a page's panel holds the content of its tab. Focus on a control inside the
// shown panel stands where the record has the panel itself or the page after it, and whether the panel is a tab stop of its own
// follows from its content. The tab strip's keys and focus leaving the tab list into the panel are compared as recorded.
const PANEL_OWN_STOP = /^parts > panel \d+ > (?:tabindex|reader > states > focused)$/;
const inPanel = (a, b) => /^inside panel \d+$/.test(b) && (a === 'after the part' || a === b.slice('inside '.length));
const close = (key, a, b) => a === b || (key === 'focus' && inPanel(a, b)) || (key.startsWith('layer > place > ') && /^-?\d+$/.test(a) && /^-?\d+$/.test(b) && Math.abs(Number(a) - Number(b)) <= 1);

/**
 * Compares a page's record with the specification. `keep` drops class names the page may choose freely (layout classes).
 * Returns [{ step, after, what, expected, found }], the first step that differs first. A step that never came to rest
 * in either record is not compared: it gives one { step, after, unsettled: true }.
 */
export function compare(expected, found, keep = (name) => name) {
  const differences = [];
  const classes = (snapshot) => {
    const copy = structuredClone(snapshot);
    for (const one of Object.values(copy.parts ?? {})) one.classes = keep(one.classes ?? []);
    return copy;
  };
  expected.forEach((step, index) => {
    const mine = found[index];
    if (!mine || step.free) return;
    if (step.unsettled || mine.unsettled) {
      differences.push({ step: index + 1, after: sayStep(step.do), unsettled: true });
      return;
    }
    const want = flat(classes(step.then), '', new Map());
    const got = flat(classes(mine.then), '', new Map());
    for (const key of new Set([...want.keys(), ...got.keys()])) {
      if (step.loose?.keys.includes(key) || PANEL_OWN_STOP.test(key)) continue;
      const [a, b] = [want.get(key) ?? 'absent', got.get(key) ?? 'absent'];
      if (!close(key, a, b)) differences.push({ step: index + 1, after: sayStep(step.do), what: key, expected: a, found: b });
    }
  });
  return differences;
}

/** The first difference of each kind, in words a developer can act on. */
export function explain(differences, limit = 6) {
  const firstStep = differences[0]?.step;
  const first = differences.filter((one) => one.step === firstStep).slice(0, limit);
  return first.map((one) => (one.unsettled
    ? `step ${one.step} (${one.after}): the page was still moving after ${PATIENCE}, so this step was not compared`
    : `step ${one.step} (${one.after}): ${one.what} is "${one.found}", the React part gives "${one.expected}"`));
}
