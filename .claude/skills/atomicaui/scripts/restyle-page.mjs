// Runs inside the page (the form of scripts/conformance-page.mjs): this file is one expression that the browser evaluates.
// It reads what a person sees and can use, in any page on any stack, and writes nothing to the page:
//   elements  every element that draws, as an observation for scripts/scan-classify.mjs (tag, role, type, classes, flags) plus where it is
//             and `inside`, the index of the drawn element it sits in (-1: none)
//   texts     every piece of visible text in reading order (also a placeholder and the label a closed select shows)
//   controls  every control a person can use, as role and name
//   styles    the stylesheets the page loads, to delete once the page is restyled
// `restyle-inventory` turns the elements into a map, and `restyle-compare` holds the texts and the controls of the page before and after.
(() => {
  const clean = (text) => (text ?? '').replace(/\s+/g, ' ').trim();
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'OPTION', 'OPTGROUP', 'BR', 'WBR', 'LINK', 'META', 'TITLE', 'HEAD', 'HTML', 'BODY', 'SOURCE', 'TRACK', 'DATALIST']);
  const shown = (element) => {
    if (typeof element.checkVisibility === 'function') return element.checkVisibility({ visibilityProperty: true });
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
  };
  // Where the element sits: its id when it has one, otherwise the path from the nearest ancestor that has one.
  const selector = (element) => {
    const parts = [];
    for (let at = element; at && at.nodeType === 1 && at !== document.body; at = at.parentElement) {
      if (at.id && document.querySelectorAll(`[id="${CSS.escape(at.id)}"]`).length === 1) {
        parts.unshift(`#${CSS.escape(at.id)}`);
        return parts.join(' > ');
      }
      const same = [...at.parentElement.children].filter((one) => one.localName === at.localName);
      parts.unshift(same.length > 1 ? `${at.localName}:nth-of-type(${same.indexOf(at) + 1})` : at.localName);
    }
    return parts.join(' > ');
  };
  const IMPLICIT = { button: 'button', summary: 'button', select: 'combobox', textarea: 'textbox', a: 'link', area: 'link' };
  const INPUT = { checkbox: 'checkbox', radio: 'radio', range: 'slider', number: 'spinbutton', search: 'searchbox', submit: 'button', button: 'button', reset: 'button', image: 'button', file: 'button', color: 'button', email: 'textbox', tel: 'textbox', text: 'textbox', url: 'textbox', password: 'textbox', date: 'textbox', 'datetime-local': 'textbox', month: 'textbox', week: 'textbox', time: 'textbox' };
  const CONTROL_ROLES = new Set(['button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'textbox', 'searchbox', 'combobox', 'listbox', 'slider', 'spinbutton', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'treeitem']);
  const roleOf = (element) => {
    const explicit = (element.getAttribute('role') ?? '').split(/\s+/)[0];
    if (explicit) return explicit;
    if (element.localName === 'input') return INPUT[(element.getAttribute('type') ?? 'text').toLowerCase()] ?? '';
    if (element.localName === 'a' || element.localName === 'area') return element.hasAttribute('href') ? 'link' : '';
    return IMPLICIT[element.localName] ?? '';
  };
  const nameOf = (element) => {
    const labelled = element.getAttribute('aria-labelledby');
    if (labelled) {
      const text = clean(labelled.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' '));
      if (text) return text;
    }
    const direct = clean(element.getAttribute('aria-label'));
    if (direct) return direct;
    if (element.labels && element.labels.length > 0) return clean([...element.labels].map((label) => label.textContent).join(' '));
    const type = (element.getAttribute('type') ?? '').toLowerCase();
    if (element.localName === 'input' && ['submit', 'button', 'reset'].includes(type)) return clean(element.value || (type === 'submit' ? 'Submit' : type === 'reset' ? 'Reset' : ''));
    if (element.localName === 'input' && type === 'image') return clean(element.getAttribute('alt'));
    const own = clean(element.textContent);
    if (own && !['input', 'select', 'textarea'].includes(element.localName)) return own;
    return clean(element.getAttribute('title')) || clean(element.getAttribute('placeholder'));
  };

  const elements = [];
  const controls = [];
  const drawn = new Map();
  for (const element of document.body.querySelectorAll('*')) {
    if (SKIP.has(element.tagName) || !shown(element)) continue;
    const classes = [...element.classList];
    const tag = element.localName;
    const hidden = tag === 'input' && (element.getAttribute('type') ?? '').toLowerCase() === 'hidden';
    if (hidden) continue;
    let inside = -1;
    for (let at = element.parentElement; at && inside < 0; at = at.parentElement) inside = drawn.get(at) ?? -1;
    drawn.set(element, elements.length);
    elements.push({
      tag,
      role: element.getAttribute('role') ?? '',
      type: tag === 'input' ? (element.getAttribute('type') ?? 'text') : undefined,
      classes,
      flags: {
        click: element.hasAttribute('onclick') || typeof element.onclick === 'function',
        keys: element.hasAttribute('onkeydown') || element.hasAttribute('onkeyup') || typeof element.onkeydown === 'function',
        drag: element.getAttribute('draggable') === 'true',
        context: element.hasAttribute('oncontextmenu'),
        editable: element.getAttribute('contenteditable') !== null && element.isContentEditable,
      },
      selector: selector(element),
      text: clean([...element.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent).join(' ')).slice(0, 40),
      inlineStyle: element.hasAttribute('style'),
      inside,
    });
    const role = roleOf(element);
    // A control behind an open dialog is still a control of the page, though the part makes it inert: it is listed.
    if (CONTROL_ROLES.has(role)) controls.push({ role, name: nameOf(element) });
  }

  const texts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    const text = clean(node.textContent);
    if (!text || !parent || SKIP.has(parent.tagName) || parent.localName === 'textarea' || !shown(parent)) continue;
    texts.push(text);
  }
  for (const element of document.body.querySelectorAll('input[placeholder],textarea[placeholder]')) if (shown(element) && clean(element.getAttribute('placeholder'))) texts.push(clean(element.getAttribute('placeholder')));
  // A closed native select shows one label; the list of the others is not on the page until it opens.
  for (const select of document.body.querySelectorAll('select')) if (shown(select) && select.selectedOptions[0]) texts.push(clean(select.selectedOptions[0].text));

  // The old look, to delete last: stylesheets the page loads, <style> blocks and elements with a style attribute.
  const styles = { links: [...document.querySelectorAll('link[rel~="stylesheet"]')].map((link) => link.getAttribute('href') ?? ''), blocks: document.querySelectorAll('style').length };
  return { title: clean(document.title), lang: document.documentElement.getAttribute('lang') ?? '', elements, texts, controls, styles };
})()
