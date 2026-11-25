// Functions that run inside a page (they are sent to the browser as text, so each one stands alone).
// Used by the recipe build (maintainers) and by the standard check (everyone).

/**
 * Every element that carries an AtomicAUI class, under each element matching `selector`: its class list and its measured look.
 * With `libraryCss` (the shipped stylesheet as text) each element also gets `library`: the look of the same markup
 * in a hidden copy of the page that loads nothing but that stylesheet. A difference means something overrides the library.
 * `picks` (maintainers) names the case of an element drawn over the page: [{ id, selectors }].
 */
export const measureStandard = (selector, libraryCss, picks = []) => {
  const PROPS = [
    'color', 'background-color', 'opacity', 'box-shadow',
    'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
    'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'row-gap', 'column-gap', 'min-height',
    'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform',
  ];
  const round = (value) => value.replace(/-?\d+(\.\d+)?px/g, (length) => `${Math.round(parseFloat(length) * 10) / 10}px`);
  // An element that takes no room (an icon without the icon kit, a hidden panel) has a class list but no look.
  const lookOf = (element) => {
    const box = element.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return null;
    const style = element.ownerDocument.defaultView.getComputedStyle(element);
    const look = {};
    for (const name of PROPS) look[name] = round(style.getPropertyValue(name));
    // A side with no border has no colour worth comparing.
    for (const side of ['top', 'right', 'bottom', 'left']) if (look[`border-${side}-width`] === '0px') look[`border-${side}-color`] = '';
    if (/^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(element.tagName)) look.height = `${Math.round(box.height * 10) / 10}px`;
    return look;
  };
  const flags = (element) => ({ checked: element.hasAttribute('data-checked'), unchecked: element.hasAttribute('data-unchecked'), filled: element.hasAttribute('data-filled') });
  const stateOf = (element) => {
    const thumb = element.querySelector('.aui-switch-thumb');
    return { ariaChecked: element.getAttribute('aria-checked') ?? undefined, ...flags(element), thumb: thumb ? flags(thumb) : undefined };
  };
  const all = [...document.documentElement.querySelectorAll('[class*="aui-"]')];
  let twins = null;
  let frame = null;
  if (libraryCss) {
    const copy = document.documentElement.cloneNode(true);
    for (const node of copy.querySelectorAll('style, link[rel~="stylesheet"], script, iframe')) node.remove();
    for (const node of copy.querySelectorAll('[style]')) {
      const kept = node.getAttribute('style').split(';').map((one) => one.trim()).filter((one) => one.startsWith('--aui-'));
      if (kept.length > 0) node.setAttribute('style', kept.join('; '));
      else node.removeAttribute('style');
    }
    const sheet = document.createElement('style');
    sheet.textContent = libraryCss;
    (copy.querySelector('head') ?? copy).appendChild(sheet);
    frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = `position: fixed; left: 0; top: 0; width: ${window.innerWidth}px; height: ${window.innerHeight}px; border: 0; visibility: hidden; pointer-events: none;`;
    document.body.appendChild(frame);
    frame.contentDocument.open();
    frame.contentDocument.write(`${document.doctype ? '<!doctype html>' : ''}${copy.outerHTML}`);
    frame.contentDocument.close();
    twins = [...frame.contentDocument.documentElement.querySelectorAll('[class*="aui-"]')];
  }
  const found = [];
  for (const root of document.querySelectorAll(selector)) {
    // A layout case (data-aui-layout on its box) also records where each element sits, relative to the case, rounded to 1 px: the build proves the page without React puts it in the same place.
    const layout = root.hasAttribute('data-aui-layout');
    const rootBox = root.getBoundingClientRect();
    for (const element of root.querySelectorAll('[class*="aui-"]')) {
      const own = [...element.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent.trim()).join(' ').trim();
      const twin = twins && twins.length === all.length ? twins[all.indexOf(element)] : null;
      found.push({
        tag: element.tagName.toLowerCase(),
        classes: [...element.classList].filter((name) => name.startsWith('aui-')),
        text: (own || element.getAttribute('aria-label') || element.getAttribute('value') || '').slice(0, 32),
        group: root.getAttribute('data-aui-case') ?? picks.find((one) => one.selectors.some((layer) => element.closest(layer)))?.id ?? '',
        look: lookOf(element),
        // A switch's state attributes, its thumb's too: the standard check compares them with its colour class.
        ...(element.classList.contains('aui-switch') ? { state: stateOf(element) } : {}),
        ...(layout && !/^(I|SVG)$/i.test(element.tagName) ? { box: (() => { const one = element.getBoundingClientRect(); return [one.left - rootBox.left, one.top - rootBox.top, one.width, one.height].map((value) => Math.round(value)); })() } : {}),
        ...(twin ? { library: lookOf(twin) } : {}),
      });
    }
  }
  frame?.remove();
  return found;
};

/** Sets light or dark on every element that carries the theme attribute, and waits for colour transitions to end. */
export const setTheme = (theme) => {
  const holders = document.querySelectorAll('[data-aui-theme]');
  for (const holder of holders) holder.setAttribute('data-aui-theme', theme);
  return new Promise((resolve) => setTimeout(() => resolve(holders.length), 600));
};

/**
 * Maintainers: reads one recipe case from the page the real components rendered, as HTML a page without them can use.
 * What it changes, and nothing else: generated ids become stable names; elements and attributes that only the
 * component's own script uses are left out; inline styles are dropped except `--aui-*` variables; a button with no type gets type="button".
 */
export const readCase = ({ id, pick, around = [] }) => {
  const host = document.querySelector(pick ?? `[data-aui-case="${id}"]`);
  if (!host) return null;
  const ids = new Map();
  const stable = (value) => value.split(' ').map((one) => {
    if (!/_r_/.test(one)) return one;
    if (!ids.has(one)) ids.set(one, `${id}-${ids.size + 1}`);
    return ids.get(one);
  }).join(' ');
  const SCRIPT_ONLY = /^(data-base-ui-|data-composite-|data-activation-direction$|data-index$|data-id$|data-aui-brand$|data-aui-theme$|data-field-control$)/;
  const ID_ATTRIBUTES = new Set(['id', 'for', 'aria-labelledby', 'aria-describedby', 'aria-controls']);
  const NATIVE_FOCUS = /^(BUTTON|INPUT|SELECT|TEXTAREA|A)$/;
  const VOID = /^(INPUT|BR|HR|IMG)$/;
  const leftOut = (element) => element.hasAttribute('data-base-ui-focus-guard') || element.hasAttribute('aria-owns') || (element.tagName === 'INPUT' && element.getAttribute('aria-hidden') === 'true');
  const open = (element) => {
    const parts = [element.tagName.toLowerCase()];
    for (const { name, value } of element.attributes) {
      if (SCRIPT_ONLY.test(name)) continue;
      if (name === 'tabindex' && ((value === '0' && NATIVE_FOCUS.test(element.tagName)) || /^(TD|TH)$/.test(element.tagName))) continue;
      if (name === 'style') {
        const kept = value.split(';').map((one) => one.trim()).filter((one) => one.startsWith('--aui-'));
        if (kept.length > 0) parts.push(`style="${kept.join('; ')}"`);
        continue;
      }
      // Classes of the headless library under the React parts have no rule in the stylesheet.
      const text = ID_ATTRIBUTES.has(name) ? stable(value) : name === 'class' ? value.split(' ').filter((one) => !one.startsWith('base-ui-')).join(' ') : value;
      parts.push(text === '' ? name : `${name}="${text.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`);
    }
    // A button the React part rendered with no type (a View as a button) would submit a form it sits in.
    if (element.tagName === 'BUTTON' && !element.hasAttribute('type')) parts.splice(1, 0, 'type="button"');
    return `<${parts.join(' ')}>`;
  };
  const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const print = (element, depth) => {
    if (leftOut(element)) return [];
    const pad = '  '.repeat(depth);
    const tag = element.tagName.toLowerCase();
    if (VOID.test(element.tagName)) return [`${pad}${open(element)}`];
    const children = [...element.childNodes].filter((node) => node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim()));
    if (children.every((node) => node.nodeType === 3)) return [`${pad}${open(element)}${escape(element.textContent.trim())}</${tag}>`];
    const lines = [`${pad}${open(element)}`];
    for (const node of children) {
      if (node.nodeType === 3) lines.push(`${'  '.repeat(depth + 1)}${escape(node.textContent.trim())}`);
      else lines.push(...print(node, depth + 1));
    }
    lines.push(`${pad}</${tag}>`);
    return lines;
  };
  // A part drawn over the page is read together with what its case leaves in place (a select's field and trigger).
  const roots = pick ? [...(document.querySelector(`[data-aui-case="${id}"]`)?.children ?? []), host] : [...host.children];
  return {
    html: roots.flatMap((root) => print(root, 0)).join('\n'),
    // For a part drawn over the page: the opening tags of the layers around it, outermost first.
    around: around.map((selector) => document.querySelector(selector)).filter(Boolean).map((element) => open(element)),
    wrapper: open(document.querySelector(`[data-aui-case="${id}"]`) ?? host),
  };
};
