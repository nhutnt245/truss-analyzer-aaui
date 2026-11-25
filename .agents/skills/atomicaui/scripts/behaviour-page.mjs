// The part of the behaviour check that runs inside a page (it is sent to the browser as text, so it stands alone).
// It finds the parts on any page by their roles, whatever built the page, and writes down what a keyboard user and
// a screen reader are given: where focus is, each element's role and states, the open layer, the page behind it.
// Used by the specification build (maintainers) and by the behaviour check (everyone).

/** Installs `window.__auiBehaviour`. `stateData` is the list of data attributes the stylesheet's rules depend on. */
export const installBehaviour = (stateData) => {
  const visible = (element) => {
    if (!element || !element.isConnected) return false;
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  };
  const byId = (value) => (value ? value.split(/\s+/).map((id) => document.getElementById(id)).filter(Boolean) : []);
  const tidy = (text) => (text ?? '').trim().replace(/\s+/g, ' ');
  const off = (element) => element.disabled === true || element.getAttribute('aria-disabled') === 'true';
  const FINDERS = {
    // Every part is found by what a screen reader is told it is, never by a class or by who built it.
    select: () => [...document.querySelectorAll('[role="combobox"][aria-haspopup="listbox"]')],
    tabs: () => [...document.querySelectorAll('[role="tablist"]')],
    dialog: () => [...document.querySelectorAll('[data-aui-dialog-open]')],
  };
  const TABBABLE = 'a[href], button, input, select, textarea, [tabindex]';
  const tabbable = (root) => [...root.querySelectorAll(TABBABLE)].filter((one) => one.tabIndex >= 0 && !one.disabled && one.getAttribute('aria-hidden') !== 'true' && one.type !== 'hidden' && visible(one));
  // The part being checked is remembered as an element and as "the nth part of its kind". A page may draw its
  // elements again while it runs (a component framework taking over what the server drew): the element remembered
  // then no longer belongs to the page, and the part is found again by its number. `redraws` counts how often.
  const state = { part: '', index: 0, anchor: null, redraws: 0 };
  const anchorNow = () => {
    if (state.anchor && !state.anchor.isConnected) {
      state.anchor = FINDERS[state.part]().filter(visible)[state.index] ?? null;
      state.redraws += 1;
    }
    return state.anchor;
  };

  /** The elements of the chosen part, by a stable name: trigger, option 0, tab 2, item 1. */
  const elements = () => {
    const { part } = state;
    const anchor = anchorNow();
    if (!anchor) return [];
    const found = [];
    const add = (ref, element) => { if (element) found.push({ ref, element }); };
    if (part === 'select') {
      add('trigger', anchor);
      const controlled = byId(anchor.getAttribute('aria-controls')).find((one) => one.matches('[role="listbox"]') || one.querySelector('[role="listbox"]'));
      const list = [controlled?.matches('[role="listbox"]') ? controlled : controlled?.querySelector('[role="listbox"]'), ...document.querySelectorAll('[role="listbox"]')].filter(Boolean).find(visible);
      add('list', list);
      [...(list?.querySelectorAll('[role="option"]') ?? [])].forEach((option, index) => add(`option ${index}`, option));
    } else if (part === 'tabs') {
      add('list', anchor);
      const tabs = [...anchor.querySelectorAll('[role="tab"]')];
      tabs.forEach((tab, index) => add(`tab ${index}`, tab));
      const scope = anchor.parentElement ?? document;
      const panels = [...new Set([...tabs.flatMap((tab) => byId(tab.getAttribute('aria-controls'))), ...scope.querySelectorAll('[role="tabpanel"]')])].filter(visible);
      panels.forEach((panel, index) => add(`panel ${index}`, panel));
    } else if (part === 'dialog') {
      add('opener', anchor);
      const dialog = [...document.querySelectorAll('[role="dialog"]')].filter(visible).pop();
      add('dialog', dialog);
      if (dialog) {
        add('title', byId(dialog.getAttribute('aria-labelledby'))[0]);
        add('description', byId(dialog.getAttribute('aria-describedby'))[0]);
        tabbable(dialog).forEach((item, index) => add(`item ${index}`, item));
      }
    }
    return found;
  };
  const refOf = (element, known) => known.find((one) => one.element === element)?.ref ?? null;
  const layerOf = (known) => known.find((one) => one.ref === 'list' && state.part === 'select')?.element ?? known.find((one) => one.ref === 'dialog')?.element ?? null;

  const describe = (element, known) => {
    const attributes = {};
    for (const { name, value } of element.attributes) {
      if (/^aria-(labelledby|describedby|controls|owns|activedescendant)$/.test(name)) {
        // An id is different on every page: what matters is which element it points at. An element that is not shown
        // is not there for a screen reader, so a link to it counts as no link (a closed list, the panel of another tab).
        const targets = byId(value).filter(visible).map((target) => refOf(target, known) ?? `<${target.tagName.toLowerCase()}>`);
        if (targets.length > 0) attributes[name] = targets.join(' ');
      } else if (name.startsWith('aria-')) {
        attributes[name] = value;
      } else if (name === 'disabled' || name === 'readonly') attributes[name] = '';
      // `inert` and `hidden` are not written down per element: which element carries them differs from page to page.
      // What they do is recorded instead: `page.behindInert`, and `reader.hidden` for each element.
      else if (stateData.includes(name)) attributes[name] = value;
    }
    // The panel of a pane whose header holds the tab row is the row of that pane: it carries the row's 4 / 8 px (pane-tabs-header in
    // recipes/tabs.md) where every other panel has none. It is compared as the unpadded panel the record holds.
    const paneRow = element.matches('[data-aui-pane] > [role="tabpanel"]') && Boolean(element.parentElement.querySelector(':scope > [data-aui-pane-header] [role="tablist"]'));
    // Tabs that touch each other have no corners (tabs-gapless in recipes/tabs.md: their list carries aui-gap-0) where the record's tabs,
    // 6 px apart, are soft. Such a tab is compared as the soft tab the record holds.
    const touching = element.matches('.aui-tabs-list.aui-gap-0 > [role="tab"]');
    const recorded = (name) => (paneRow && name === 'aui-scale-default-sm' ? 'aui-scale-no-padding-sm' : touching && name === 'aui-shape-none' ? 'aui-shape-soft' : name);
    return { role: element.getAttribute('role') ?? '', tabindex: element.tabIndex, attributes, classes: [...element.classList].filter((name) => name.startsWith('aui-')).map(recorded).sort() };
  };

  const api = {
    /** How many of each part the page shows, and how many elements only look like one (the class list, without the role). */
    count: () => Object.fromEntries(Object.entries(FINDERS).map(([part, find]) => [part, find().filter(visible).length])),
    lookalikes: () => ({
      select: [...document.querySelectorAll('.aui-select-trigger')].filter((one) => visible(one) && !FINDERS.select().includes(one)).length,
      tabs: [...document.querySelectorAll('.aui-tabs-list')].filter((one) => visible(one) && !FINDERS.tabs().includes(one)).length,
      // A dialog nothing declares it opens cannot be opened by the check.
      dialog: [...document.querySelectorAll('.aui-dialog-popup')].filter((one) => !one.id || !document.querySelector(`[data-aui-dialog-open="${one.id}"]`)).length - [...document.querySelectorAll('[data-aui-dialog-open=""]')].length,
    }),
    /** Chooses the part the next calls are about. */
    choose(part, index) {
      state.part = part;
      state.index = index;
      state.redraws = 0;
      state.anchor = FINDERS[part]().filter(visible)[index] ?? null;
      window.__auiBehaviourRefs = {};
      return state.anchor !== null;
    },
    focus(ref) {
      const target = elements().find((one) => one.ref === ref)?.element;
      target?.focus();
      return Boolean(target);
    },
    /** The middle of an element, for a real mouse click; `outside` is a spot that belongs to no control and no layer. */
    point(ref) {
      const known = elements();
      if (ref !== 'outside') {
        const target = known.find((one) => one.ref === ref)?.element;
        if (!target) return null;
        const box = target.getBoundingClientRect();
        return { x: Math.round(box.left + box.width / 2), y: Math.round(box.top + box.height / 2) };
      }
      const layer = layerOf(known);
      for (let y = window.innerHeight - 4; y > 0; y -= 24) {
        for (let x = window.innerWidth - 4; x > 0; x -= 24) {
          const hit = document.elementFromPoint(x, y);
          if (!hit || layer?.contains(hit) || known.some((one) => one.element.contains(hit))) continue;
          if (hit.closest('a, button, input, select, textarea, label, [role="tab"], [role="option"], [role="menuitem"], [tabindex]:not([tabindex="-1"])')) continue;
          return { x, y };
        }
      }
      return null;
    },
    /** What is true right now. Element handles are left in window.__auiBehaviourRefs so the caller can ask the accessibility tree about each. */
    /** How many times the page replaced the part's own element since it was chosen. */
    redraws: () => state.redraws,
    /** Whether an animation or transition that has an end is still running anywhere in the page. One with no end cannot be waited for. */
    moving: () => document.getAnimations().some((one) => one.playState === 'running' && one.effect?.getComputedTiming().endTime !== Infinity),
    snapshot() {
      const known = elements();
      window.__auiBehaviourRefs = Object.fromEntries(known.map((one) => [one.ref, one.element]));
      const active = document.activeElement;
      let focus = refOf(active, known);
      if (!focus) {
        const inside = known.find((one) => one.element.contains(active));
        if (!active || active === document.body) focus = 'page';
        else if (inside) focus = `inside ${inside.ref}`;
        else focus = anchorNow() && anchorNow().compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING ? 'after the part' : 'before the part';
      }
      const parts = Object.fromEntries(known.map((one) => [one.ref, describe(one.element, known)]));
      if (state.part === 'select' && anchorNow()) {
        parts.trigger.text = tidy(anchorNow().textContent);
        const holder = anchorNow().closest('.aui-field') ?? anchorNow().parentElement;
        parts.trigger.formValue = holder?.querySelector('input[type="hidden"], input[aria-hidden="true"]')?.value ?? '(no form value)';
      }
      const layer = layerOf(known);
      let layerState = null;
      if (layer && anchorNow()) {
        const box = layer.getBoundingClientRect();
        const from = anchorNow().getBoundingClientRect();
        const middle = document.elementFromPoint(box.left + box.width / 2, box.top + Math.min(box.height / 2, 12));
        layerState = {
          onTop: Boolean(middle && layer.contains(middle)),
          focusInside: layer.contains(active),
          // A list is placed against its trigger; a dialog against the window.
          place: state.part === 'select' ? { left: Math.round(box.left - from.left), top: Math.round(box.top - from.bottom), width: Math.round(box.width - from.width) } : { left: Math.round(box.left - (window.innerWidth - box.width) / 2), top: Math.round(box.top - (window.innerHeight - box.height) / 2) },
        };
      }
      const root = document.documentElement;
      const anchorHit = anchorNow() ? document.elementFromPoint(anchorNow().getBoundingClientRect().left + 4, anchorNow().getBoundingClientRect().top + 4) : null;
      return {
        focus,
        parts,
        layer: layerState,
        page: layer ? {
          scrollLocked: [root, document.body].some((one) => /hidden|clip/.test(getComputedStyle(one).overflowY)),
          behindInert: Boolean(anchorNow()?.closest('[inert], [aria-hidden="true"]')) || (layer.matches('dialog:modal') || Boolean(layer.closest('dialog:modal'))),
          behindCovered: Boolean(anchorHit && !anchorNow().contains(anchorHit)),
        } : null,
      };
    },
    /**
     * The shape of the chosen part: what the real component must be given to be the same part. Call with the part open
     * where it has a layer. The shape is read from what the part looks like (its classes) as well as from its roles, so
     * an element that looks like an option but is not one for a screen reader still counts, and then fails the steps.
     * A part that shows no layer says why in `closed`: its control is 'disabled', its trigger has no aria-controls ('no list'), or it is 'unopened'.
     */
    shape() {
      const known = elements();
      if (state.part === 'select') {
        const list = known.find((one) => one.ref === 'list')?.element;
        const options = [...(list?.querySelectorAll('.aui-select-item, [role="option"]') ?? [])];
        const label = byId(anchorNow().getAttribute('aria-labelledby'))[0] ?? (anchorNow().id ? document.querySelector(`label[for="${anchorNow().id}"]`) : null) ?? (anchorNow().closest('.aui-field') ?? anchorNow().parentElement)?.querySelector('label');
        return { part: 'select', label: tidy(label?.textContent ?? anchorNow().getAttribute('aria-label')), options: options.map((option) => {
          const name = tidy(option.textContent);
          const value = option.getAttribute('data-value');
          return { name, ...(value !== null && value !== name ? { value } : {}), ...(option.getAttribute('aria-disabled') === 'true' || option.hasAttribute('data-disabled') ? { disabled: true } : {}) };
        }), selected: options.findIndex((option) => option.getAttribute('aria-selected') === 'true' || option.hasAttribute('data-selected')), ...(list ? {} : { closed: off(anchorNow()) ? 'disabled' : !anchorNow().hasAttribute('aria-controls') ? 'no list' : 'unopened' }) };
      }
      if (state.part === 'tabs') {
        const tabs = [...anchorNow().querySelectorAll('.aui-tabs-tab, [role="tab"]')];
        return { part: 'tabs', tabs: tabs.map((tab) => ({ name: tidy(tab.textContent) })), selected: tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true' || tab.hasAttribute('data-active')), ...(tabs.some((tab) => tab.querySelector('button')) ? { closable: true } : {}), ...(tabs.some((tab) => tab.getAttribute('aria-disabled') === 'true' || tab.disabled) ? { disabledTab: true } : {}) };
      }
      const dialog = known.find((one) => one.ref === 'dialog')?.element ?? [...document.querySelectorAll('.aui-dialog-popup')].filter(visible).pop();
      const title = dialog?.querySelector('.aui-dialog-title') ?? known.find((one) => one.ref === 'title')?.element;
      const description = dialog?.querySelector('.aui-dialog-description') ?? known.find((one) => one.ref === 'description')?.element;
      const items = dialog ? tabbable(dialog) : [];
      const own = (element) => tidy([...element.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent).join(' '));
      const actions = items.filter((item) => item.closest('.aui-dialog-actions'));
      const fields = items.filter((item) => item.matches('input, textarea') && !actions.includes(item));
      const labelOf = (field) => byId(field.getAttribute('aria-labelledby'))[0]?.textContent ?? (field.id ? document.querySelector(`label[for="${field.id}"]`)?.textContent : null) ?? field.closest('.aui-field')?.querySelector('label')?.textContent ?? field.getAttribute('aria-label');
      return {
        part: 'dialog',
        opener: tidy(anchorNow().textContent),
        title: title ? own(title) : '',
        description: tidy(description?.textContent),
        fields: fields.map((field) => tidy(labelOf(field))),
        actions: actions.map((action) => tidy(action.textContent)),
        // Anything else a user can reach inside is not something the fixtures can render.
        ...(dialog && items.length !== fields.length + actions.length + (title?.querySelector('button') ? 1 : 0) ? { other: items.length - fields.length - actions.length } : {}),
        ...(dialog ? {} : { closed: off(anchorNow()) ? 'disabled' : 'unopened' }),
      };
    },
  };
  window.__auiBehaviour = api;
  return true;
};
