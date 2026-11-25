// AtomicAUI behaviour for a page built without the React parts: select, dialog, tabs, and a table that scrolls sideways. Never edit it (AUI-06).
// Load it once, anywhere in the page: <script src="aui/aui-behaviour.js"></script>. It needs no start-up call.
// It listens on the document and reads the state from the markup, so it also works for markup that is added
// later (a server template, a component framework, a form's load event), and for a part whose trigger, opener
// or tab list the page draws again, even while its list or dialog is open. One thing it does not do: an element
// the page adds behind a dialog that is already open is not made inert.
// It does what the React parts do, step for step: the behaviour pages (standard/behaviour/<part>.md) are the record it is checked against.
//   Tabs    role="tablist" with role="tab" children; each tab has aria-controls="<panel id>".
//   Select  the trigger (role="combobox") has aria-controls="<list id>"; the list sits in its positioner, closed.
//           A hidden <input> in the same field holds the value for a form.
//   Dialog  its two layers wait in a plain <div data-aui-dialog-layers hidden>. Any element with
//           data-aui-dialog-open="<dialog id>" opens it. Its footer and close buttons close it.
//           A dialog opened over a dialog must have its layers inside the first dialog's popup: anywhere else it is shown and cannot be reached.
//   Panes   below 768 px every [data-aui-panes] frame is one column and says "stacked" in its marker; the page writes the wide layout only.
// It tells your code what happened with events that bubble: "aui-change" (tabs: detail.index; select: detail.value),
// "aui-open" and "aui-close" (dialog). From script: AUI.dialog.open(id), AUI.dialog.close(id).
(() => {
  if (window.AUI?.dialog) return;
  const HIDDEN = 'aui-display-none';
  const EDGE = 5; // the room a list keeps from the window edge, as the React part does
  const byId = (id) => (id ? document.getElementById(id) : null);
  const tell = (element, name, detail) => element.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  const mark = (element, name, on) => (on ? element.setAttribute(name, '') : element.removeAttribute(name));
  /** A state is a whole class list: two elements that trade state trade their lists. */
  const trade = (a, b) => { [a.className, b.className] = [b.className, a.className]; };
  const shown = (element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
  const stops = (root) => [...root.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')].filter((one) => one.tabIndex >= 0 && !one.disabled && one.type !== 'hidden' && shown(one));
  let pageOverflow = null;
  let locks = 0;
  const lockScroll = (on) => {
    locks += on ? 1 : -1;
    if (on && locks === 1) { pageOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    if (!on && locks === 0) document.body.style.overflow = pageOverflow;
  };

  // ── Tabs ──────────────────────────────────────────────────────────────────────────────────────────────
  const tabsOf = (list) => [...list.querySelectorAll('[role="tab"]')].filter((tab) => tab.closest('[role="tablist"]') === list);
  const reachTab = (list, tab) => {
    for (const one of tabsOf(list)) one.tabIndex = one === tab ? 0 : -1;
    tab.focus();
  };
  const pickTab = (list, tab) => {
    const tabs = tabsOf(list);
    const old = tabs.find((one) => one.getAttribute('aria-selected') === 'true');
    if (old === tab || tab.getAttribute('aria-disabled') === 'true') return;
    if (old) {
      trade(old, tab);
      mark(old, 'data-active', false);
      old.setAttribute('aria-selected', 'false');
      byId(old.getAttribute('aria-controls'))?.classList.add(HIDDEN);
    }
    mark(tab, 'data-active', true);
    tab.setAttribute('aria-selected', 'true');
    byId(tab.getAttribute('aria-controls'))?.classList.remove(HIDDEN);
    tell(list, 'aui-change', { index: tabs.indexOf(tab), tab });
  };
  /** Whether the tab used the key. */
  const tabKey = (event, tab) => {
    const list = tab.closest('[role="tablist"]');
    const tabs = tabsOf(list);
    const at = tabs.indexOf(tab);
    const to = { ArrowRight: (at + 1) % tabs.length, ArrowLeft: (at - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
    if (to === undefined) return false;
    event.preventDefault();
    reachTab(list, tabs[to]);
    return true;
  };

  // ── Select ────────────────────────────────────────────────────────────────────────────────────────────
  let openSelect = null; // { trigger, list, positioner, popup }
  /** The open select. A page that draws its markup again may have replaced the trigger remembered at opening: it is found again by its list. */
  const openNow = () => {
    if (openSelect && !openSelect.trigger.isConnected) openSelect.trigger = document.querySelector(`[role="combobox"][aria-controls="${CSS.escape(openSelect.list.id)}"]`) ?? openSelect.trigger;
    return openSelect;
  };
  let typed = '';
  let typedAt = 0;
  const optionsOf = (list) => [...list.querySelectorAll('[role="option"]')];
  const pickedOf = (list) => optionsOf(list).find((one) => one.getAttribute('aria-selected') === 'true');
  const off = (option) => option.getAttribute('aria-disabled') === 'true';
  const nameOf = (option) => (option.querySelector('.aui-select-item-text') ?? option).textContent.trim();
  const valueOf = (option) => option.getAttribute('data-value') ?? nameOf(option);
  const reachOption = (list, option) => {
    for (const one of optionsOf(list)) {
      one.tabIndex = one === option ? 0 : -1;
      mark(one, 'data-highlighted', one === option);
    }
    option.focus({ preventScroll: true });
    option.scrollIntoView({ block: 'nearest' });
  };
  const placeSelect = () => {
    if (!openSelect) return;
    const { trigger, positioner, popup } = openNow();
    const gap = 4;
    positioner.style.position = 'fixed';
    positioner.style.left = '0';
    positioner.style.top = '0';
    const anchor = trigger.getBoundingClientRect();
    positioner.style.setProperty('--anchor-width', `${anchor.width}px`);
    positioner.style.setProperty('--anchor-height', `${anchor.height}px`);
    positioner.style.setProperty('--available-width', `${window.innerWidth - 2 * EDGE}px`);
    const below = window.innerHeight - anchor.bottom - gap - EDGE;
    const above = anchor.top - gap - EDGE;
    positioner.style.setProperty('--available-height', `${below}px`);
    const height = popup.getBoundingClientRect().height;
    const up = height > below && above > below;
    if (up) positioner.style.setProperty('--available-height', `${above}px`);
    const box = popup.getBoundingClientRect();
    const left = Math.min(Math.max(anchor.left + (anchor.width - box.width) / 2, EDGE), Math.max(EDGE, window.innerWidth - box.width - EDGE));
    const top = up ? anchor.top - gap - box.height : anchor.bottom + gap;
    positioner.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
    for (const one of [positioner, popup]) one.setAttribute('data-side', up ? 'top' : 'bottom');
  };
  const closeSelect = (refocus) => {
    if (!openSelect) return;
    const { trigger, list, positioner, popup } = openNow();
    openSelect = null;
    positioner.classList.add(HIDDEN);
    for (const one of [positioner, popup]) mark(one, 'data-open', false);
    for (const one of optionsOf(list)) mark(one, 'data-highlighted', false);
    trigger.setAttribute('aria-expanded', 'false');
    mark(trigger, 'data-popup-open', false);
    mark(trigger, 'data-pressed', false);
    lockScroll(false);
    if (refocus) trigger.focus();
  };
  const openSelectFor = (trigger) => {
    const list = byId(trigger.getAttribute('aria-controls'));
    const positioner = list?.closest('.aui-select-positioner');
    const popup = list?.closest('.aui-select-popup');
    if (!list || !positioner || !popup || trigger.disabled) return;
    closeSelect(false);
    openSelect = { trigger, list, positioner, popup };
    positioner.classList.remove(HIDDEN);
    for (const one of [positioner, popup]) mark(one, 'data-open', true);
    trigger.setAttribute('aria-expanded', 'true');
    mark(trigger, 'data-popup-open', true);
    mark(trigger, 'data-pressed', true);
    // A long list scrolls inside its popup, never past the window edge.
    const scroller = list.closest('.aui-view-scroll-area-viewport');
    if (scroller) {
      scroller.style.overflow = 'hidden auto';
      scroller.style.maxBlockSize = 'min(calc(var(--aui-popup-max-block-size, 100vh) - var(--aui-padding-block-start, 0px) - var(--aui-padding-block-end, 0px)), calc(var(--available-height, 100vh) - var(--aui-padding-block-start, 0px) - var(--aui-padding-block-end, 0px)))';
    }
    lockScroll(true);
    placeSelect();
    const first = pickedOf(list) ?? optionsOf(list)[0];
    if (first) reachOption(list, first);
  };
  const setSelect = (trigger, option) => {
    const list = option.closest('[role="listbox"]');
    const old = pickedOf(list);
    if (old !== option) {
      if (old) {
        trade(old, option);
        old.setAttribute('aria-selected', 'false');
      } else if (list.getAttribute('data-aui-picked-class')) {
        // Nothing was picked yet, so there is no picked option to trade lists with: the list names the picked class list.
        option.className = list.getAttribute('data-aui-picked-class');
      }
      for (const one of [old, old?.querySelector('.aui-select-item-indicator')]) if (one) mark(one, 'data-selected', false);
      for (const one of [option, option.querySelector('.aui-select-item-indicator')]) if (one) mark(one, 'data-selected', true);
      option.setAttribute('aria-selected', 'true');
    }
    // The text is changed in place: a framework that drew this text keeps its hold on the same node.
    const shownValue = trigger.querySelector('.aui-select-value');
    const text = shownValue?.childNodes.length === 1 && shownValue.firstChild.nodeType === 3 ? shownValue.firstChild : null;
    if (text) text.data = nameOf(option);
    else if (shownValue) shownValue.textContent = nameOf(option);
    mark(trigger, 'data-placeholder', false);
    const holder = (trigger.closest('.aui-field') ?? trigger.parentElement)?.querySelector('input[type="hidden"]');
    if (old !== option && holder) {
      holder.value = valueOf(option);
      holder.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (old !== option) tell(trigger, 'aui-change', { value: valueOf(option), name: nameOf(option), index: optionsOf(list).indexOf(option) });
  };
  /** The option a typed letter leads to: the next one after `from` whose name starts with what was typed in the last half second. */
  const typedOption = (list, key, from) => {
    const now = Date.now();
    typed = now - typedAt > 500 ? key : typed + key;
    typedAt = now;
    const options = optionsOf(list);
    const order = [...options.slice(from + 1), ...options.slice(0, from + 1)];
    return order.find((one) => !off(one) && nameOf(one).toLowerCase().startsWith(typed.toLowerCase()));
  };
  const printable = (event) => event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey;
  /** Whether the closed select used the key. */
  const triggerKey = (event, trigger) => {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      openSelectFor(trigger);
      return true;
    }
    if (!printable(event)) return false;
    const list = byId(trigger.getAttribute('aria-controls'));
    const found = list && typedOption(list, event.key, optionsOf(list).indexOf(pickedOf(list)));
    if (found) setSelect(trigger, found);
    return true;
  };
  const optionKey = (event, option) => {
    const { trigger, list } = openNow();
    const options = optionsOf(list);
    const at = options.indexOf(option);
    const to = { ArrowDown: Math.min(at + 1, options.length - 1), ArrowUp: Math.max(at - 1, 0), Home: 0, End: options.length - 1 }[event.key];
    if (to !== undefined) {
      event.preventDefault();
      reachOption(list, options[to]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (off(option)) return;
      setSelect(trigger, option);
      closeSelect(true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeSelect(true);
    } else if (event.key === 'Tab') {
      // The list closes. Tab goes on from the trigger to the next stop; Shift+Tab stays on the trigger.
      if (event.shiftKey) event.preventDefault();
      closeSelect(true);
    } else if (printable(event)) {
      const found = typedOption(list, event.key, at);
      if (found) reachOption(list, found);
    }
  };

  // ── Dialog ────────────────────────────────────────────────────────────────────────────────────────────
  const openDialogs = []; // { popup, layers, holder, opener, inerted }
  const layersOf = (popup) => {
    const viewport = popup.closest('.aui-dialog-viewport');
    const backdrop = viewport?.previousElementSibling?.matches('.aui-dialog-backdrop') ? viewport.previousElementSibling : null;
    return [backdrop, viewport, popup].filter(Boolean);
  };
  const openDialog = (target, opener = document.activeElement) => {
    const popup = typeof target === 'string' ? byId(target) : target;
    if (!popup || openDialogs.some((one) => one.popup === popup)) return;
    const layers = layersOf(popup);
    // Closed, the layers wait inside a plain element that carries the hidden attribute.
    const holder = popup.closest('[data-aui-dialog-layers]');
    if (holder) holder.hidden = false;
    for (const one of layers) mark(one, 'data-open', true);
    // Everything that is not on the way from <body> to the dialog is taken out of reach of keyboard, pointer and screen reader.
    const inerted = [];
    for (let node = holder ?? layers[layers.length - 2] ?? popup; node && node !== document.body; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling === node || layers.includes(sibling) || sibling.inert || /^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(sibling.tagName)) continue;
        sibling.inert = true;
        // Marked as well as remembered: a page that draws an element again may copy it, inert and all, and the copy must be let go too.
        if (popup.id) sibling.setAttribute('data-aui-inert-for', popup.id);
        inerted.push(sibling);
      }
    }
    lockScroll(true);
    openDialogs.push({ popup, layers, holder, opener, inerted });
    (stops(popup)[0] ?? popup).focus();
    tell(popup, 'aui-open', {});
  };
  const closeDialog = (target) => {
    const popup = typeof target === 'string' ? byId(target) : target;
    const at = openDialogs.findIndex((one) => one.popup === popup);
    if (at < 0) return;
    const [{ layers, holder, opener, inerted }] = openDialogs.splice(at, 1);
    if (holder) holder.hidden = true;
    for (const one of layers) mark(one, 'data-open', false);
    const marked = popup.id ? [...document.querySelectorAll(`[data-aui-inert-for="${CSS.escape(popup.id)}"]`)] : [];
    for (const one of new Set([...inerted, ...marked])) {
      one.inert = false;
      one.removeAttribute('data-aui-inert-for');
    }
    lockScroll(false);
    // Focus goes back to what opened the dialog. If the page has replaced that element since, to the element that opens this dialog now.
    const back = opener?.isConnected ? opener : popup.id ? document.querySelector(`[data-aui-dialog-open="${CSS.escape(popup.id)}"]`) : null;
    back?.focus();
    tell(popup, 'aui-close', {});
  };
  const dialogKey = (event, top) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog(top.popup);
    } else if (event.key === 'Tab') {
      const inside = stops(top.popup);
      const [first, last] = [inside[0], inside[inside.length - 1]];
      const active = document.activeElement;
      if (!first) event.preventDefault();
      else if (event.shiftKey && (active === first || !top.popup.contains(active) || active === top.popup)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (active === last || !top.popup.contains(active))) { event.preventDefault(); first.focus(); }
    }
  };

  // ── One set of listeners for the whole page ───────────────────────────────────────────────────────────
  const closest = (event, selector) => (event.target instanceof Element ? event.target.closest(selector) : null);
  document.addEventListener('keydown', (event) => {
    const option = openSelect && closest(event, '[role="option"]');
    if (option && openSelect.list.contains(option)) return optionKey(event, option);
    const trigger = closest(event, '[role="combobox"][aria-haspopup="listbox"]');
    if (trigger && !openSelect && triggerKey(event, trigger)) return undefined;
    const tab = closest(event, '[role="tab"]');
    if (tab && event.target === tab && tabKey(event, tab)) return undefined;
    const top = openDialogs[openDialogs.length - 1];
    if (top) return dialogKey(event, top);
    return undefined;
  });
  let swallow = null;
  const unswallow = () => {
    if (swallow) window.removeEventListener('click', swallow, true);
    swallow = null;
  };
  window.addEventListener('mouseup', () => { if (swallow) setTimeout(unswallow, 0); }, true);
  document.addEventListener('mousedown', (event) => {
    unswallow();
    if (!openSelect || !(event.target instanceof Node)) return;
    if (openSelect.popup.contains(event.target) || openNow().trigger.contains(event.target)) return;
    // A press outside an open list, with any button, only closes it: it does not reach what is under the pointer.
    event.preventDefault();
    event.stopPropagation();
    closeSelect(true);
    // Only the primary button is followed by a click to cancel.
    if (event.button !== 0) return;
    swallow = (click) => { swallow = null; click.preventDefault(); click.stopPropagation(); };
    window.addEventListener('click', swallow, { capture: true, once: true });
  }, true);
  document.addEventListener('mouseover', (event) => {
    const option = openSelect && closest(event, '[role="option"]');
    if (option && openSelect.list.contains(option) && !off(option)) reachOption(openSelect.list, option);
  });
  document.addEventListener('click', (event) => {
    const option = openSelect && closest(event, '[role="option"]');
    if (option && openSelect.list.contains(option)) {
      if (off(option)) return;
      setSelect(openNow().trigger, option);
      closeSelect(true);
      return;
    }
    const trigger = closest(event, '[role="combobox"][aria-haspopup="listbox"]');
    if (trigger) {
      if (openNow()?.trigger === trigger) closeSelect(true);
      else openSelectFor(trigger);
      return;
    }
    const tab = closest(event, '[role="tab"]');
    if (tab && !closest(event, '.aui-tabs-close-button')) {
      const list = tab.closest('[role="tablist"]');
      reachTab(list, tab);
      pickTab(list, tab);
      return;
    }
    const opener = closest(event, '[data-aui-dialog-open]');
    if (opener) {
      openDialog(opener.getAttribute('data-aui-dialog-open'), opener);
      return;
    }
    const top = openDialogs[openDialogs.length - 1];
    if (!top) return;
    const closer = closest(event, '.aui-dialog-close, .aui-dialog-button');
    if (closer && top.popup.contains(closer)) closeDialog(top.popup);
    // A click on the backdrop, outside the dialog itself, closes it.
    else if (top.layers.includes(event.target) && event.target !== top.popup) closeDialog(top.popup);
  });
  window.addEventListener('resize', placeSelect);

  // ── A table that scrolls sideways ───────────────────────────────────────────────────────────────────────
  // A table with data-aui-min-inline-size (the table-scroll recipe) is wider than a narrow page. Its body scrolls on both axes
  // inside the table's own frame; the header and footer sit in clipped wrappers (aui-table-scroll-clip) that follow the body, as
  // the React Table does. The React part gets the body's overflow from Base UI, whose bar takes no room; here the body keeps the
  // browser's bar. While the body shows a bar that takes room (Windows, Linux, a Mac with a mouse), the table carries its width
  // in --aui-table-body-bar and the wrappers are that much narrower, so header and body have the same width and the same scroll
  // range and their columns stay in line to the far end; with no bar, no strip. (A scrollbar-gutter on the wrappers gives the width
  // but not the range: Chrome scrolls a box that hides its overflow only to its outer width.)
  // The rules are added through the style object model so a strict content security policy allows them.
  if ('adoptedStyleSheets' in document && typeof CSSStyleSheet === 'function') {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync('[data-aui-pane] > .aui-view-scroll-area > .aui-view-scroll-area-viewport, [data-aui-pane] > [role=tabpanel] > .aui-view-scroll-area > .aui-view-scroll-area-viewport, [data-aui-pane-body=fill] > .aui-view-scroll-area > .aui-view-scroll-area-viewport { overflow-y: auto; } [data-aui-tab-row] > .aui-view-scroll-area-viewport { overflow-x: auto; overflow-y: hidden; scrollbar-width: none; } [data-aui-tab-row] > .aui-view-scroll-area-viewport::-webkit-scrollbar { display: none; } .aui-table[data-aui-scroll=self][data-aui-min-inline-size] > .aui-table-scroll-region > .aui-view-scroll-area-viewport { overflow: auto; } .aui-table[data-aui-scroll=self][data-aui-min-inline-size] > .aui-table-scroll-clip { inline-size: calc(100% - var(--aui-table-body-bar, 0px)); }');
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }
  // The bar comes and goes with the rows and the height of the body, which a resize observer on the body sees; a table the page adds later is observed when it is added.
  const bars = new ResizeObserver((entries) => {
    for (const { target } of entries) {
      const table = target.isConnected && target.closest('.aui-table');
      const bar = target.offsetWidth - target.clientWidth;
      if (!table) bars.unobserve(target);
      else if (bar > 0) table.style.setProperty('--aui-table-body-bar', `${bar}px`);
      else table.style.removeProperty('--aui-table-body-bar');
    }
  });
  const watchBars = () => {
    for (const body of document.querySelectorAll('.aui-table[data-aui-min-inline-size] > .aui-table-scroll-region > .aui-view-scroll-area-viewport')) bars.observe(body);
  };
  // ── Panes at a narrow width ───────────────────────────────────────────────────────────────────────────
  // Below 768 px a page of panes is one column, as the React Panes is: every pane is full width and as high as what it holds,
  // no pane body scrolls by itself, and the page scrolls. The frame says so in its marker (data-aui-panes="page stacked"), which the
  // layout check reads. Only layout classes are traded, each for the one the React part has when stacked, and every one is put
  // back when the window is wide again. The page writes the wide layout only.
  const narrow = window.matchMedia?.('(max-width: 767px)');
  /** The classes an element traded, kept on the element (data-aui-swap) so a copy of it carries them: "-name" taken off, "+name" put on. */
  const traded = (element) => {
    const words = element.getAttribute('data-aui-swap')?.split(' ') ?? [];
    return { gone: words.filter((word) => word.startsWith('-')).map((word) => word.slice(1)), fresh: words.filter((word) => word.startsWith('+')).map((word) => word.slice(1)) };
  };
  /** The page wrote the element's class list again since the trade: a class put on is missing, or one taken off is back. */
  const rewritten = (element) => {
    const old = traded(element);
    return old.fresh.some((name) => !element.classList.contains(name)) || old.gone.some((name) => element.classList.contains(name));
  };
  const swap = (element, remove, add) => {
    if (rewritten(element)) element.removeAttribute('data-aui-swap');
    const gone = [...element.classList].filter((name) => remove.test(name) && !add.includes(name));
    const fresh = add.filter((name) => !element.classList.contains(name));
    if (gone.length + fresh.length === 0) return;
    element.classList.remove(...gone);
    element.classList.add(...fresh);
    const old = traded(element);
    element.setAttribute('data-aui-swap', [...[...old.gone, ...gone].map((name) => `-${name}`), ...[...old.fresh, ...fresh].map((name) => `+${name}`)].join(' '));
  };
  const unswap = (element) => {
    if (!element.hasAttribute('data-aui-swap')) return;
    if (!rewritten(element)) {
      const old = traded(element);
      element.classList.remove(...old.fresh);
      element.classList.add(...old.gone);
    }
    element.removeAttribute('data-aui-swap');
  };
  /** The boxes of one frame that change: its panes and pane groups, the row under each pane header, and a card that fills its pane. */
  const stackParts = (frame) => {
    const items = [...frame.children];
    const panes = items.filter((one) => one.hasAttribute('data-aui-pane'));
    const rows = panes.flatMap((pane) => [...pane.children].filter((one) => !one.hasAttribute('data-aui-pane-header')));
    const fills = panes.flatMap((pane) => [...pane.querySelectorAll('[data-aui-pane-body="fill"]')].filter((card) => card.closest('[data-aui-pane]') === pane));
    return { items, rows, fills };
  };
  const stackPanes = () => {
    if (!narrow) return;
    for (const frame of document.querySelectorAll('[data-aui-panes]')) {
      const words = frame.getAttribute('data-aui-panes').split(/\s+/).filter(Boolean);
      const { items, rows, fills } = stackParts(frame);
      if (!narrow.matches) {
        if (words.includes('stacked')) frame.setAttribute('data-aui-panes', words.filter((word) => word !== 'stacked').join(' '));
        for (const one of [frame, ...items, ...rows, ...fills]) unswap(one);
        continue;
      }
      if (!words.includes('stacked')) frame.setAttribute('data-aui-panes', [...words, 'stacked'].join(' '));
      // The page frame is as high as its panes, so the page scrolls; a nested frame keeps its place in its group.
      const nested = words.includes('nested');
      swap(frame, nested ? /^aui-flex-direction-/ : /^aui-flex-(direction-.+|fill)$/, nested ? ['aui-flex-direction-column'] : ['aui-flex-direction-column', 'aui-flex-none']);
      for (const one of items) swap(one, /^aui-(width-.+|min-width-0|flex-(fill|none|auto))$/, ['aui-width-fill', 'aui-flex-none']);
      for (const one of rows) swap(one, /^aui-flex-fill$/, ['aui-flex-none']);
      for (const one of fills) swap(one, /^aui-(flex-fill|min-height-0)$/, ['aui-flex-none', 'aui-min-height-192']);
    }
  };
  narrow?.addEventListener?.('change', stackPanes);
  // Markup the page adds or draws again later is stacked when it arrives.
  /** A box whose classes are traded: a frame, a box in a frame, a box in a pane, or a card that fills its pane. */
  const panesPart = (one) => one.hasAttribute('data-aui-panes') || one.matches('[data-aui-pane-body="fill"]') || Boolean(one.parentElement?.matches('[data-aui-panes], [data-aui-pane]'));
  new MutationObserver((records) => {
    if (records.some((one) => one.type === 'childList')) watchBars();
    if (records.some((one) => one.type === 'childList' || one.attributeName === 'data-aui-panes' || panesPart(one.target))) stackPanes();
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'data-aui-panes'] });
  watchBars();
  stackPanes();
  // A scroll does not bubble, so it is heard in the capture phase.
  document.addEventListener('scroll', (event) => {
    const from = event.target;
    if (!(from instanceof Element)) return;
    const table = from.closest('.aui-table[data-aui-min-inline-size]');
    const body = table?.querySelector(':scope > .aui-table-scroll-region > .aui-view-scroll-area-viewport');
    if (!body || (from !== body && !from.matches('.aui-table-scroll-clip'))) return;
    for (const one of [body, ...table.querySelectorAll(':scope > .aui-table-scroll-clip')]) if (one !== from && one.scrollLeft !== from.scrollLeft) one.scrollLeft = from.scrollLeft;
  }, true);

  // ── Where focus came from ─────────────────────────────────────────────────────────────────────────────
  // A field shows its focus ring for the keyboard and not for the mouse, as the React parts do. aui-theme.js marks
  // this for a whole page of ours; an area inside a host's document does not load that file, so the same few lines
  // are here. Whichever script comes first does it.
  if (!window.__auiFocusOrigin) {
    window.__auiFocusOrigin = true;
    let origin = 'pointer';
    window.addEventListener('keydown', (event) => { if (event.key === 'Tab') origin = 'keyboard'; }, true);
    for (const type of ['pointerdown', 'mousedown', 'touchstart']) window.addEventListener(type, () => { origin = 'pointer'; }, true);
    const HOSTS = '.aui-field-control, .aui-number-field-group, .aui-datepicker-input';
    document.addEventListener('focusin', (event) => {
      if (!(event.target instanceof Element)) return;
      for (const host of [event.target, event.target.closest(HOSTS)]) host?.setAttribute('data-aui-focus-origin', origin);
    });
    document.addEventListener('focusout', (event) => {
      if (!(event.target instanceof Element)) return;
      for (const host of [event.target, event.target.closest(HOSTS)]) host?.removeAttribute('data-aui-focus-origin');
    });
  }

  window.AUI = { ...(window.AUI ?? {}), dialog: { open: openDialog, close: closeDialog } };
})();
