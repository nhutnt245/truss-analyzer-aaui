// Runs inside the page. Returns what the layout check needs: every spacing value on screen,
// the distance between neighbouring blocks, and page-level problems.
(() => {
  // A page frame marked "in-layout" sits in a layout the page keeps (its own bar, container, footer): the page in scope is the element
  // with the four identity attributes around that frame, and what the kept layout draws outside that element is not measured.
  const scope = document.querySelector('[data-aui-panes~="in-layout"]')?.parentElement?.closest('[data-aui-theme]') ?? null;
  const root = scope || document.querySelector('.app-root') || document.body;
  const whole = scope || document;
  const px = (text) => Math.round(parseFloat(text) * 10) / 10 || 0;
  const visible = (element) => {
    const box = element.getBoundingClientRect();
    // The content of a collapsed pane is inert and stays laid out squeezed into the 40 px rail (opacity 0): it is not on screen, so it is not measured.
    return box.width > 0 && box.height > 0 && !element.closest('[data-panel] [inert]');
  };
  const label = (element) => {
    const marker = [...element.classList].find((name) => /^aui-(?!frame|scale|typography|shape|color|elevation|stateful|focus|display|flex|gap|width|height|align|justify|padding|min|max|overflow|border|radius|text|grid|position|row|column|font|line|letter|white|icon|dot|margin)/.test(name)) ?? '';
    const role = element.getAttribute('role');
    const name = element.getAttribute('aria-label');
    const own = [...element.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent.trim()).join(' ').slice(0, 24);
    return `${element.tagName.toLowerCase()}${marker ? `.${marker}` : ''}${role ? `[${role}]` : ''}${name ? `{${name.slice(0, 24)}}` : ''}${own ? ` "${own}"` : ''}`;
  };
  // The fill of an element, or '' when it has none: a transparent colour with an alpha of 0 is no fill (paint: 'text' computes to one).
  const fillOf = (element) => {
    const fill = getComputedStyle(element).backgroundColor;
    return /^rgba\(.*,\s*0\)$|^transparent$/.test(fill) ? '' : fill;
  };
  const TEXT = /^(P|SPAN|H[1-6]|LABEL|A|STRONG|EM|B|I|SMALL|BR)$/;
  const spacing = [];
  for (const element of root.querySelectorAll('*')) {
    if (!visible(element)) continue;
    const style = getComputedStyle(element);
    const padding = [px(style.paddingTop), px(style.paddingRight), px(style.paddingBottom), px(style.paddingLeft)];
    const margin = [px(style.marginTop), px(style.marginRight), px(style.marginBottom), px(style.marginLeft)];
    const gap = style.display.includes('flex') || style.display.includes('grid') ? [px(style.rowGap), px(style.columnGap)] : [0, 0];
    const border = [px(style.borderTopWidth), px(style.borderRightWidth), px(style.borderBottomWidth), px(style.borderLeftWidth)];
    if (padding.some(Boolean) || margin.some(Boolean) || gap.some(Boolean)) {
      spacing.push({ element: label(element), aui: /(^|\s)aui-/.test(element.className?.baseVal ?? element.className ?? ''), tag: element.tagName.toLowerCase(), padding, border, margin, gap });
    }
  }
  // Neighbouring blocks stacked in one parent: the distance between the bottom of one and the top of the next.
  const stacks = [];
  for (const parent of root.querySelectorAll('*')) {
    const children = [...parent.children].filter(visible);
    if (children.length < 2) continue;
    const parentStyle = getComputedStyle(parent);
    for (let index = 1; index < children.length; index++) {
      const above = children[index - 1].getBoundingClientRect();
      const below = children[index].getBoundingClientRect();
      if (below.top < above.bottom - 1) continue; // side by side, not stacked
      stacks.push({
        parent: label(parent),
        parentDisplay: parentStyle.display,
        parentGap: px(parentStyle.rowGap),
        above: label(children[index - 1]),
        below: label(children[index]),
        text: TEXT.test(children[index - 1].tagName) && TEXT.test(children[index].tagName),
        distance: Math.round((below.top - above.bottom) * 10) / 10,
      });
    }
  }
  // A flex column may shrink a child below its content height while overflow remains visible. The content then paints over the next child even though their boxes do not overlap (Truss SST Split).
  const overlappingFlexChildren = [];
  for (const parent of root.querySelectorAll('*')) {
    const parentStyle = getComputedStyle(parent);
    if (!parentStyle.display.includes('flex') || parentStyle.flexDirection !== 'column') continue;
    const children = [...parent.children].filter((child) => child.getBoundingClientRect().width > 0 && !child.closest('[data-panel] [inert]') && !/^(absolute|fixed)$/.test(getComputedStyle(child).position));
    for (let index = 0; index < children.length - 1; index++) {
      const above = children[index];
      const below = children.slice(index + 1).find(visible);
      if (!below) break;
      const upper = above.getBoundingClientRect();
      const lower = below.getBoundingClientRect();
      if (lower.top < upper.top || lower.left >= upper.right || lower.right <= upper.left) continue;
      if (getComputedStyle(above).overflowY !== 'visible') continue;
      const excess = above.scrollHeight - above.clientHeight;
      // Inline text may make scrollHeight exceed clientHeight by a few pixels without any child painting outside its box. Require a real descendant box crossing the next sibling.
      const hidden = (one) => {
        for (let node = one; node && node !== above; node = node.parentElement) {
          const style = getComputedStyle(node);
          if (/^(absolute|fixed)$/.test(style.position) || (node !== one && style.overflowY !== 'visible')) return true;
        }
        return false;
      };
      const painted = excess > 1 ? [...above.querySelectorAll('*')].filter((one) => {
        if (!visible(one) || hidden(one)) return false;
        const box = one.getBoundingClientRect();
        return box.bottom > lower.top + 1 && box.top < lower.bottom - 1 && box.left < lower.right && box.right > lower.left;
      }) : [];
      if (painted.length > 0) {
        const bottom = Math.max(...painted.map((one) => one.getBoundingClientRect().bottom));
        overlappingFlexChildren.push({ above: label(above), below: label(below), excess: Math.round(excess), overlap: Math.round(bottom - lower.top) });
      }
    }
  }
  // Icon-only controls (an IconButton or a clickable icon: a button with no text): width and height must be equal.
  const iconControls = [...root.querySelectorAll('button,[role="button"]')]
    .filter((element) => visible(element) && (element.textContent ?? '').trim() === '')
    .map((element) => {
      const box = element.getBoundingClientRect();
      return { element: label(element), width: Math.round(box.width * 10) / 10, height: Math.round(box.height * 10) / 10, radius: px(getComputedStyle(element).borderTopLeftRadius), iconButton: element.tagName === 'BUTTON' };
    });
  // Where a bar or a row sits in the window: 'edge' from edge to edge of it, 'inset' with space on both sides.
  const atWindow = (element) => {
    const box = element.getBoundingClientRect();
    const width = document.documentElement.clientWidth;
    return Math.abs(box.left) <= 0.5 && Math.abs(width - box.right) <= 0.5 ? 'edge'
      : box.left >= 0.5 && box.right <= width - 0.5 ? 'inset' : '';
  };
  // A tab row (data-aui-tab-row) scrolls its tabs sideways inside its viewport: a tab is on screen only as far as that viewport shows it.
  // A row whose viewport neither clips nor scrolls shows every tab whole, wherever it runs to.
  const shownBox = (element) => {
    const box = element.getBoundingClientRect();
    const row = element.closest('[data-aui-tab-row]');
    const viewport = row && [...row.children].find((one) => one.contains(element));
    if (!viewport || getComputedStyle(viewport).overflowX === 'visible') return box;
    const shown = viewport.getBoundingClientRect();
    const left = Math.max(box.left, shown.left);
    const right = Math.min(box.right, shown.right);
    return { left, right, width: Math.max(0, right - left), height: box.height };
  };
  // Text or a control closer than 8 px to the left or right window edge (the top bar and tables excepted): the page has no padding.
  // A tab row that runs from edge to edge of the window is like the top bar: its tabs may start at the window edge, and may not run out of the window.
  const edgeRoom = (element) => {
    const row = element.closest('[data-aui-tab-row]');
    return row && atWindow(row) === 'edge' ? -0.5 : 8;
  };
  const edgeTouches = [...root.querySelectorAll('*')]
    .filter((element) => visible(element) && !element.closest('[role="menubar"],.aui-table') && ([...element.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim() !== '') || /^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(element.tagName)))
    .map((element) => ({ element: label(element), box: shownBox(element), room: edgeRoom(element) }))
    .filter(({ box }) => box.width > 2 && box.height > 2) // a 1 px visually hidden input is not on screen
    .filter(({ box, room }) => box.left < room || box.right > window.innerWidth - room)
    .map(({ element, box }) => ({ element, left: Math.round(box.left), right: Math.round(window.innerWidth - box.right) }));
  // A pane that scrolls sideways (a table outside its own frame): a scroll container other than a table whose content is wider than its box.
  // The one other box that may: the viewport of a tab row (data-aui-tab-row), where tabs that keep a width scroll and the page does not.
  const sidewaysPanes = [...whole.querySelectorAll('*')]
    .filter((element) => element !== document.documentElement && element !== document.body && visible(element) && !element.closest('.aui-table') && !element.parentElement?.matches('[data-aui-tab-row]'))
    .filter((element) => ['auto', 'scroll'].includes(getComputedStyle(element).overflowX) && element.scrollWidth > element.clientWidth + 1)
    .map((element) => ({ element: label(element), content: element.scrollWidth, box: element.clientWidth }));
  // A framed box (1 px border on four sides and a radius, wider than 150 px) closer than 8 px to the left or right window edge: a pane without the page frame's padding.
  const framedEdge = [...whole.querySelectorAll('*')]
    .filter((element) => visible(element) && !/^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(element.tagName) && !element.closest('[role="menubar"],[role="dialog"],[data-base-ui-portal],.aui-table'))
    .filter((element) => {
      const style = getComputedStyle(element);
      return ['Top', 'Right', 'Bottom', 'Left'].every((side) => px(style['border' + side + 'Width']) >= 1 && style['border' + side + 'Style'] !== 'none') && px(style.borderTopLeftRadius) > 0;
    })
    .map((element) => ({ element: label(element), box: element.getBoundingClientRect() }))
    .filter(({ box }) => box.width > 150 && (box.left < 8 || box.right > window.innerWidth - 8))
    .map(({ element, box }) => ({ element, left: Math.round(box.left), right: Math.round(window.innerWidth - box.right) }));
  // A filled card inside a framed pane sits at least 6 px in from the frame's sides (the prototypes: 8): a card against the frame has no padded row under the header.
  const isFramed = (element) => {
    const style = getComputedStyle(element);
    return ['Top', 'Right', 'Bottom', 'Left'].every((side) => px(style['border' + side + 'Width']) >= 1 && style['border' + side + 'Style'] !== 'none') && px(style.borderTopLeftRadius) > 0;
  };
  const flushCards = [...whole.querySelectorAll('*')]
    .filter((element) => visible(element) && !/^(BUTTON|INPUT|SELECT|TEXTAREA|SVG|IMG)$/i.test(element.tagName) && !element.closest('[role="menubar"],[role="dialog"],[data-base-ui-portal],[role="tab"],[role="tablist"],.aui-table,.aui-field,.aui-accordion-trigger'))
    .filter((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return fillOf(element) !== '' && px(style.borderTopLeftRadius) > 0 && box.width > 150 && box.height > 40;
    })
    .flatMap((element) => {
      let frame = element.parentElement;
      while (frame && !isFramed(frame)) frame = frame.parentElement;
      if (!frame) return [];
      const box = element.getBoundingClientRect();
      const frameBox = frame.getBoundingClientRect();
      const left = Math.round(box.left - frameBox.left);
      const right = Math.round(frameBox.right - box.right);
      return left < 6 || right < 6 ? [{ element: label(element), frame: label(frame), left, right }] : [];
    });
  // A table cut off: wider than the nearest ancestor that clips it without scrolling (a table must scroll in its own frame).
  const cutOffTables = [...whole.querySelectorAll('.aui-table')].filter(visible).flatMap((table) => {
    let ancestor = table.parentElement;
    while (ancestor && getComputedStyle(ancestor).overflowX === 'visible') ancestor = ancestor.parentElement;
    if (!ancestor || ['auto', 'scroll'].includes(getComputedStyle(ancestor).overflowX)) return [];
    const tableBox = table.getBoundingClientRect();
    const clipBox = ancestor.getBoundingClientRect();
    return tableBox.right > clipBox.right + 1 || tableBox.left < clipBox.left - 1
      ? [{ element: label(table), tableWidth: Math.round(tableBox.width), clipWidth: Math.round(clipBox.width), clippedBy: label(ancestor) }]
      : [];
  });
  // Text can run past a squeezed table cell even when the table itself stays inside its scrolling frame.
  // Compare rendered text fragments with their own cell, so lines that wrap and columns scrolled out of view still pass.
  const tableTextOverflows = [...root.querySelectorAll('.aui-table')].filter(visible).flatMap((table) =>
    [...table.querySelectorAll('th,td')].filter((cell) => visible(cell) && cell.closest('.aui-table') === table).flatMap((cell) => {
      const box = cell.getBoundingClientRect();
      const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let over = 0;
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent.trim() || !visible(node.parentElement)) continue;
        range.selectNodeContents(node);
        const clips = [];
        for (let element = node.parentElement; element !== cell.parentElement; element = element.parentElement) {
          if (getComputedStyle(element).overflowX !== 'visible') clips.push(element.getBoundingClientRect());
        }
        for (const textBox of range.getClientRects()) {
          const left = Math.max(textBox.left, ...clips.map((clip) => clip.left));
          const right = Math.min(textBox.right, ...clips.map((clip) => clip.right));
          over = Math.max(over, box.left - left, right - box.right);
        }
      }
      const section = { THEAD: 'header', TFOOT: 'footer' }[cell.parentElement.parentElement.tagName] ?? 'body';
      return over > 1 ? [{ table: label(table), cell: `${label(cell)} (row ${cell.parentElement.sectionRowIndex + 1}, column ${cell.cellIndex + 1})`, row: section, over: Math.round(over * 10) / 10 }] : [];
    }));
  // A table body wider than its own frame that cannot scroll (a table recipe copied without its overflow, or without aui/aui-behaviour.js): its columns cannot be reached.
  const stuckTables = [...whole.querySelectorAll('.aui-table')].filter(visible).flatMap((table) => {
    const body = table.querySelector('.aui-table-scroll-region .aui-view-scroll-area-viewport');
    if (!body || body.scrollWidth <= body.clientWidth + 1 || ['auto', 'scroll'].includes(getComputedStyle(body).overflowX)) return [];
    return [{ element: label(table), content: body.scrollWidth, box: body.clientWidth }];
  });
  // A closable tab: the close button sits at the far right edge (little room between its right edge and the tab's).
  const tabCloseGaps = [...root.querySelectorAll('[role="tab"]')].filter(visible).flatMap((tab) => {
    const close = [...tab.querySelectorAll('button,[role="button"]')].find((one) => visible(one) && (one.textContent ?? '').trim() === '');
    if (!close) return [];
    return [{ element: label(tab), gap: Math.round((tab.getBoundingClientRect().right - close.getBoundingClientRect().right) * 10) / 10 }];
  });
  // What sits under a row of tabs starts at the left edge of the tab row (the prototypes: the tab and the card, frame or
  // table under it share one edge). For each tab list above a visible panel: the first wide painted box in the panel
  // (a border at its start side, or a fill other than the one behind the panel), or the panel itself when it is painted.
  const tabInsets = [...root.querySelectorAll('[role="tablist"]')].filter(visible).flatMap((list) => {
    const tabs = list.closest('.aui-tabs');
    const panel = tabs && [...tabs.querySelectorAll('[role="tabpanel"]')].find((one) => visible(one) && one.closest('.aui-tabs') === tabs);
    const first = [...list.querySelectorAll('[role="tab"]')].find(visible);
    if (!panel || !first || list.getAttribute('aria-orientation') === 'vertical') return [];
    let behind = panel.parentElement;
    while (behind && !fillOf(behind)) behind = behind.parentElement;
    const backdrop = behind ? fillOf(behind) : '';
    const panelBox = panel.getBoundingClientRect();
    const painted = (element) => {
      const style = getComputedStyle(element);
      const edge = px(style.borderLeftWidth) >= 1 && style.borderLeftStyle !== 'none' && !/^rgba\(.*,\s*0\)$|^transparent$/.test(style.borderLeftColor);
      return edge || (fillOf(element) !== '' && fillOf(element) !== backdrop);
    };
    const under = [panel, ...panel.querySelectorAll('*')].find((element) => {
      const box = element.getBoundingClientRect();
      return visible(element) && box.width >= panelBox.width / 2 && box.height >= 20 && (element === panel || !element.parentElement.closest('.aui-table')) && painted(element);
    });
    if (!under) return [];
    const left = Math.round((under.getBoundingClientRect().left - first.getBoundingClientRect().left) * 10) / 10;
    return [{ tabs: label(list), under: label(under), left }];
  });
  // The header of the first column starts where its cells start: a header that is not left over left-aligned cells
  // (the first header cell with text in the first header row, against the cell under it in the first body row).
  const startAligned = (element) => ['left', 'start'].includes(getComputedStyle(element).textAlign);
  const headerStarts = [...root.querySelectorAll('.aui-table')].filter(visible).flatMap((table) => {
    const headers = [...(table.querySelector('thead tr')?.children ?? [])];
    const at = headers.findIndex((cell) => (cell.textContent ?? '').trim() !== '');
    const row = [...table.querySelectorAll('tbody tr')].find((one) => visible(one) && one.children.length === headers.length);
    if (at < 0 || !row || headers.some((cell) => cell.colSpan > 1) || [...row.children].some((cell) => cell.colSpan > 1)) return [];
    return visible(headers[at]) && startAligned(row.children[at]) && !startAligned(headers[at])
      ? [{ table: label(table), header: (headers[at].textContent ?? '').trim().slice(0, 24), align: getComputedStyle(headers[at]).textAlign }]
      : [];
  });
  // A text field in a table cell stays inside its cell: one that is wider than the cell's content box runs into the next column.
  const cellFields = [...root.querySelectorAll('.aui-table th input, .aui-table td input, .aui-table th textarea, .aui-table td textarea')]
    .filter((field) => visible(field) && !['checkbox', 'radio', 'hidden'].includes(field.type))
    .flatMap((field) => {
      const cell = field.closest('th,td');
      const style = getComputedStyle(cell);
      const cellBox = cell.getBoundingClientRect();
      const box = (field.closest('.aui-field-control,.aui-number-field-group') ?? field).getBoundingClientRect();
      const room = cellBox.width - px(style.paddingLeft) - px(style.paddingRight) - px(style.borderLeftWidth) - px(style.borderRightWidth);
      const over = Math.round(Math.max(box.right - (cellBox.right - px(style.paddingRight) - px(style.borderRightWidth)), cellBox.left + px(style.paddingLeft) + px(style.borderLeftWidth) - box.left) * 10) / 10;
      return over > 0.5 ? [{ element: label(field), width: Math.round(box.width * 10) / 10, room: Math.round(room * 10) / 10, over }] : [];
    });
  // A bar (a toolbar, a title bar, a paging bar: a full-width row that starts with a button or an icon) starts where the
  // blocks stacked beside it start (the prototypes: the toolbar row and the table under it share one left edge).
  // The bar's start is its first item. A block's start is its leftmost ink: text, a field, an icon, a table, or a painted
  // box (a border at its start side, or a fill other than the one behind the bar's parent). A filled box as wide as the
  // bar is a band (a message banner): its content is the ink, not its fill.
  const isBar = (bar) => {
    if (!visible(bar) || !bar.parentElement || bar.closest('[role="menubar"],[role="dialog"],[role="alertdialog"],[data-base-ui-portal],.aui-table,[role="tablist"],.aui-field,button,label')) return false;
    const style = getComputedStyle(bar);
    if (!style.display.includes('flex') || style.flexDirection.startsWith('column')) return false;
    const first = [...bar.children].find(visible);
    if (!first || !first.matches('button,[role="button"],[role="combobox"],i,svg')) return false;
    const box = bar.getBoundingClientRect();
    const parentStyle = getComputedStyle(bar.parentElement);
    const room = bar.parentElement.getBoundingClientRect().width - px(parentStyle.paddingLeft) - px(parentStyle.paddingRight) - px(parentStyle.borderLeftWidth) - px(parentStyle.borderRightWidth);
    // Full width of its parent, and its first item sits at its start: the padding of the bar alone decides where it starts.
    return box.width >= 150 && Math.abs(box.width - room) <= 1 && Math.abs(first.getBoundingClientRect().left - box.left - px(style.borderLeftWidth) - px(style.paddingLeft)) <= 0.5;
  };
  const inkLeft = (block, backdrop, width) => {
    const blockBox = block.getBoundingClientRect();
    let least = Infinity;
    const walk = (element) => {
      const box = element.getBoundingClientRect();
      if (box.width <= 2 || box.height <= 2 || box.left < blockBox.left - 1) return; // a 1 px visually hidden input is not ink
      const style = getComputedStyle(element);
      const edge = px(style.borderLeftWidth) >= 1 && style.borderLeftStyle !== 'none' && !/^rgba\(.*,\s*0\)$|^transparent$/.test(style.borderLeftColor);
      const fill = fillOf(element);
      if (element.classList.contains('aui-table') || /^(INPUT|TEXTAREA|SELECT|I|SVG|IMG)$/i.test(element.tagName) || edge || (fill !== '' && fill !== backdrop && Math.abs(box.width - width) > 1)) {
        least = Math.min(least, box.left);
        return;
      }
      for (const node of element.childNodes) {
        if (node.nodeType !== 3 || node.textContent.trim() === '') continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) if (rect.width > 0) least = Math.min(least, rect.left);
      }
      for (const child of element.children) walk(child);
    };
    walk(block);
    return least;
  };
  const barInsets = [...root.querySelectorAll('*')].filter(isBar).flatMap((bar) => {
    const box = bar.getBoundingClientRect();
    let behind = bar.parentElement;
    while (behind && !fillOf(behind)) behind = behind.parentElement;
    const backdrop = behind ? fillOf(behind) : '';
    const blocks = [...bar.parentElement.children].filter((one) => {
      const other = one.getBoundingClientRect();
      return one !== bar && visible(one) && !isBar(one) && (other.top >= box.bottom - 1 || other.bottom <= box.top + 1);
    });
    const starts = blocks.map((block) => inkLeft(block, backdrop, box.width)).filter(Number.isFinite);
    if (starts.length === 0) return [];
    const first = [...bar.children].find(visible);
    return [{ bar: label(bar), first: label(first), left: Math.round((first.getBoundingClientRect().left - Math.min(...starts)) * 10) / 10 }];
  });
  // A size asked for with a class (aui-height-28, aui-width-160) that came out larger: a box is never smaller than 10 px
  // (a "line" of height 1 is 10 px thick), and content pushes a fixed slot open.
  const sizeMisses = [...root.querySelectorAll('[class*="aui-height-"],[class*="aui-width-"]')].filter(visible).flatMap((element) => {
    const box = element.getBoundingClientRect();
    return [...element.classList].flatMap((name) => {
      const asked = name.match(/^aui-(height|width)-(\d+)$/);
      if (!asked) return [];
      const got = Math.round((asked[1] === 'height' ? box.height : box.width) * 10) / 10;
      return got > Number(asked[2]) + 0.5 ? [{ element: label(element), axis: asked[1], asked: Number(asked[2]), got }] : [];
    });
  });
  // Styled pieces (data-aui-styled="<name>"): measured for the evidence sheet. A shadow inside one is a problem.
  // Elevation 0 computes to a shadow with no size and no colour: that one is not a shadow.
  const realShadow = (value) => value !== 'none' && value.split(/,(?![^(]*\))/).some((one) => {
    const colour = one.match(/rgba?\([^)]*\)/)?.[0] ?? '';
    return !/^rgba\(.*,\s*0\)$/.test(colour) && (one.replace(colour, '').match(/-?\d+(\.\d+)?px/g) ?? []).some((length) => parseFloat(length) !== 0);
  });
  const styled = [...whole.querySelectorAll('[data-aui-styled]')].filter(visible).map((piece) => {
    const style = getComputedStyle(piece);
    const box = piece.getBoundingClientRect();
    const inside = [piece, ...piece.querySelectorAll('*')].filter(visible);
    const text = inside.find((element) => [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim() !== ''));
    const textStyle = text ? getComputedStyle(text) : null;
    return {
      name: piece.getAttribute('data-aui-styled'),
      element: label(piece),
      width: Math.round(box.width * 10) / 10,
      height: Math.round(box.height * 10) / 10,
      padding: [px(style.paddingTop), px(style.paddingRight), px(style.paddingBottom), px(style.paddingLeft)],
      radius: px(style.borderTopLeftRadius),
      fill: /^rgba\(.*,\s*0\)$|^transparent$/.test(style.backgroundColor) ? '' : style.backgroundColor,
      text: textStyle ? { size: px(textStyle.fontSize), line: px(textStyle.lineHeight), weight: textStyle.fontWeight, colour: textStyle.color } : null,
      clickable: inside.filter((element) => element.matches('button,a[href],[role="button"]')).map((element) => {
        const one = element.getBoundingClientRect();
        return { element: label(element), width: Math.round(one.width * 10) / 10, height: Math.round(one.height * 10) / 10, pressed: element.getAttribute('aria-pressed') };
      }),
      shadows: inside.filter((element) => realShadow(getComputedStyle(element).boxShadow)).map((element) => `${label(element)}: ${getComputedStyle(element).boxShadow}`),
    };
  });
  // Panes (kit/components/panes.md): every framed pane, whether it carries the block's marker or was written by hand, with
  // the values the pane rules need. A pane is the element marked data-aui-pane (its frame is that element when it has a
  // border, otherwise its first child .aui-panels-panel), or any box with the class aui-scale-block-padding-sm and a border
  // on four sides. A box that only looks like a pane is a look-alike. Panes inside a dialog, a popup layer or a demo frame are skipped.
  const SKIPPED = '[role="dialog"],[role="alertdialog"],[data-base-ui-portal],[data-aui-demo]';
  const framedOn4 = (element) => ['Top', 'Right', 'Bottom', 'Left'].every((side) => {
    const style = getComputedStyle(element);
    return px(style['border' + side + 'Width']) >= 1 && style['border' + side + 'Style'] !== 'none';
  });
  const round1 = (value) => Math.round(value * 10) / 10;
  const rectOf = (element) => {
    const box = element.getBoundingClientRect();
    return { x: round1(box.left), y: round1(box.top), w: round1(box.width), h: round1(box.height) };
  };
  const frameOfMarked = (marked) => (framedOn4(marked) ? marked : marked.querySelector(':scope > .aui-panels-panel') ?? marked);
  const frameSet = new Map(); // frame element -> { marked, id }
  for (const marked of root.querySelectorAll('[data-aui-pane]')) {
    if (!marked.closest(SKIPPED) && visible(marked)) frameSet.set(frameOfMarked(marked), { marked: true, id: marked.getAttribute('data-aui-pane') || 'pane', holder: marked });
  }
  for (const element of root.querySelectorAll('.aui-scale-block-padding-sm')) {
    if (!frameSet.has(element) && !element.closest(SKIPPED) && visible(element) && framedOn4(element)) frameSet.set(element, { marked: false, id: `unmarked-${frameSet.size + 1}`, holder: element });
  }
  const frameList = [...frameSet.keys()];
  const paneAround = (element) => {
    for (let one = element.parentElement; one; one = one.parentElement) if (frameSet.has(one)) return one;
    return null;
  };
  const insideOf = (frame) => {
    const around = paneAround(frame);
    return around ? frameSet.get(around).id : '';
  };
  // The header: the marked one, or the highest box inside the frame that holds a heading or a tab list, spans the frame and is one or two rows high.
  const headerOf = (frame) => {
    const marked = [...frame.querySelectorAll('[data-aui-pane-header]')].find((one) => paneAround(one) === frame && visible(one));
    if (marked) return marked;
    const frameBox = frame.getBoundingClientRect();
    const heading = [...frame.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="tablist"]')].find((one) => paneAround(one) === frame && visible(one));
    if (!heading) return null;
    let found = null;
    for (let one = heading; one && one !== frame; one = one.parentElement) {
      const box = one.getBoundingClientRect();
      if (box.width >= frameBox.width - 6 && box.height <= 70) found = one;
    }
    return found;
  };
  const firstTextOf = (header) => {
    const element = [header, ...header.querySelectorAll('*')].find((one) => visible(one) && [...one.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim() !== ''));
    if (!element) return null;
    const style = getComputedStyle(element);
    return { tag: element.tagName.toLowerCase(), size: px(style.fontSize), line: px(style.lineHeight), weight: style.fontWeight, text: [...element.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent.trim()).join(' ') };
  };
  const clippedBottom = (element, frame) => {
    let bottom = element.getBoundingClientRect().bottom;
    for (let one = element.parentElement; one && one !== frame; one = one.parentElement) {
      if (getComputedStyle(one).overflowY !== 'visible') bottom = Math.min(bottom, one.getBoundingClientRect().bottom);
    }
    return bottom;
  };
  // The body: the marked one, or the first box under the header that has a fill of its own.
  const bodyOf = (frame, header) => {
    const marked = [...frame.querySelectorAll('[data-aui-pane-body]')].find((one) => paneAround(one) === frame && visible(one));
    if (marked) return marked;
    const floor = header ? header.getBoundingClientRect().bottom - 1 : frame.getBoundingClientRect().top;
    return [...frame.querySelectorAll('*')].find((one) => {
      const box = one.getBoundingClientRect();
      return visible(one) && paneAround(one) === frame && box.top >= floor && (!header || !header.contains(one)) && fillOf(one) !== '' && box.height >= 20 && !/^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(one.tagName);
    }) ?? null;
  };
  // What else sits in the pane beside its header and its body card: a button row or a note beside the header, or beside the card in its padded row. A scroll area's own bars are not content.
  const strayOf = (header, body) => {
    const top = header?.parentElement;
    if (!body || !top?.contains(body)) return [];
    const found = [];
    for (let one = body; one !== top; one = one.parentElement) {
      found.push(...[...one.parentElement.children].filter((other) => other !== one && other !== header && visible(other) && !other.matches('.aui-view-scroll-area-scrollbar,.aui-view-scroll-area-corner')));
    }
    return found.map((one) => label(one));
  };
  const sidesOf = (element) => {
    const style = getComputedStyle(element);
    return ['Top', 'Right', 'Bottom', 'Left'].map((side) => px(style['border' + side + 'Width']));
  };
  const paneList = frameList.map((frame) => {
    const info = frameSet.get(frame);
    const box = frame.getBoundingClientRect();
    const style = getComputedStyle(frame);
    const holder = frame.closest('[data-panel]') ?? frame;
    const collapsed = holder.hasAttribute('data-aui-collapsed');
    const header = headerOf(frame);
    let body = bodyOf(frame, header);
    // A hand-made grid of cards on the pane colour: the first filled box has filled, rounded siblings, so the body is the arranger that holds them.
    const siblingCards = (one) => [...(one?.parentElement?.children ?? [])].filter((other) => visible(other) && fillOf(other) !== '' && px(getComputedStyle(other).borderTopLeftRadius) > 0);
    const arranger = body && !body.hasAttribute('data-aui-pane-body') && siblingCards(body).length >= 2 ? body.parentElement : null;
    if (arranger) body = arranger;
    const bodyBox = body?.getBoundingClientRect();
    const headerBox = header?.getBoundingClientRect();
    const headerStyle = header ? getComputedStyle(header) : null;
    const kind = arranger ? 'cards' : body?.getAttribute('data-aui-pane-body') ?? '';
    // Cards on the pane colour: the filled, soft boxes in the body, or in the one unfilled arranger it holds (a grid of cards), and the sections that are cards.
    const shown = kind === 'cards' ? [...body.children].filter(visible) : [];
    const cardHolder = shown.length === 1 && fillOf(shown[0]) === '' ? shown[0] : body;
    const cardNodes = kind === 'cards' ? [...new Set([...body.querySelectorAll('.aui-accordion-item'), ...cardHolder.children])].filter((one) => visible(one) && fillOf(one) !== '' && px(getComputedStyle(one).borderTopLeftRadius) > 0) : [];
    const cardBoxes = cardNodes.map((one) => one.getBoundingClientRect());
    const cards = cardNodes.map((one, index) => {
      const mine = cardBoxes[index];
      const right = cardBoxes.filter((other, at) => at !== index && other.left >= mine.right - 0.5 && Math.min(other.bottom, mine.bottom) - Math.max(other.top, mine.top) > 1).map((other) => other.left - mine.right);
      const below = cardBoxes.filter((other, at) => at !== index && other.top >= mine.bottom - 0.5 && Math.min(other.right, mine.right) - Math.max(other.left, mine.left) > 1).map((other) => other.top - mine.bottom);
      return { radius: px(getComputedStyle(one).borderTopLeftRadius), gapRight: right.length ? round1(Math.min(...right)) : null, gapBelow: below.length ? round1(Math.min(...below)) : null };
    });
    // Sections: the items of one accordion in a stacked body, with the divider above each and the space between them.
    const sections = kind === 'cards' ? [] : [...frame.querySelectorAll('.aui-accordion')].filter((one) => paneAround(one) === frame && visible(one)).flatMap((accordion) => {
      const items = [...accordion.querySelectorAll(':scope > .aui-accordion-item')].filter(visible);
      return items.map((item, index) => {
        const trigger = item.querySelector('.aui-accordion-trigger');
        const above = index > 0 ? items[index - 1].getBoundingClientRect() : null;
        return {
          index,
          borderTop: px(getComputedStyle(item).borderTopWidth),
          radius: px(getComputedStyle(item).borderTopLeftRadius),
          gapAbove: above ? round1(item.getBoundingClientRect().top - above.bottom) : 0,
          triggerH: trigger ? round1(trigger.getBoundingClientRect().height) : 0,
        };
      });
    });
    const triggers = [...holder.querySelectorAll('.aui-panels-trigger')].filter((one) => visible(one) && paneAround(one) === frame && !one.closest('[inert],[aria-hidden="true"]'));
    const trigger = triggers[0] ? { ...(() => { const one = triggers[0].getBoundingClientRect(); return { w: round1(one.width), h: round1(one.height) }; })(), expanded: triggers[0].getAttribute('aria-expanded') } : null;
    return {
      id: info.id,
      title: (firstTextOf(header ?? frame)?.text ?? '').slice(0, 24),
      marked: info.marked,
      element: label(frame),
      classes: [...frame.classList].filter((name) => name.startsWith('aui-')),
      border: sidesOf(frame),
      radius: px(style.borderTopLeftRadius),
      box: rectOf(frame),
      inside: insideOf(frame),
      header: header ? {
        marked: header.hasAttribute('data-aui-pane-header'),
        h: round1(headerBox.height),
        paddingInline: [px(headerStyle.paddingLeft), px(headerStyle.paddingRight)],
        gap: px(headerStyle.columnGap),
        firstText: firstTextOf(header),
        hasTablist: Boolean(header.querySelector('[role="tablist"]')) || header.matches('[role="tablist"]'),
        iconControls: [...header.querySelectorAll('button,[role="button"]')].filter((one) => visible(one) && (one.textContent ?? '').trim() === '' && !one.closest('[inert],[aria-hidden="true"]')).map((one) => { const size = one.getBoundingClientRect(); return { element: label(one), w: round1(size.width), h: round1(size.height) }; }),
      } : null,
      body: body ? {
        kind,
        insetLeft: round1(bodyBox.left - box.left),
        insetRight: round1(box.right - bodyBox.right),
        underHeader: headerBox ? round1(bodyBox.top - headerBox.bottom) : null,
        aboveBottom: round1(box.bottom - Math.min(bodyBox.bottom, clippedBottom(body, frame))),
        radius: px(getComputedStyle(body).borderTopLeftRadius),
        border: sidesOf(body),
        classes: [...body.classList].filter((name) => name.startsWith('aui-')),
      } : null,
      stray: strayOf(header, body),
      sections,
      cards,
      collapsed,
      trigger,
    };
  });
  // The page frame, measured from the boxes of the outermost panes: distance to each window edge, to the top bar, and between neighbours.
  const bar = [...root.querySelectorAll('[role="menubar"]')].find((one) => visible(one) && one.getBoundingClientRect().top < 2);
  // A page frame marked "under-bar" (the class form) sits under a bar of the page's own: the nearest visible box before the frame, or before one of its ancestors.
  const pageFrame = [...root.querySelectorAll('[data-aui-panes]')].find((one) => visible(one) && !one.closest(SKIPPED));
  const boxBefore = (element) => {
    for (let one = element; one; one = one.parentElement) {
      for (let before = one.previousElementSibling; before; before = before.previousElementSibling) if (visible(before)) return before;
    }
    return null;
  };
  const above = pageFrame?.matches('[data-aui-panes~="under-bar"]') ? boxBefore(pageFrame) : bar;
  const topBarBottom = above ? round1(above.getBoundingClientRect().bottom) : 0;
  const outer = paneList.filter((one) => one.inside === '');
  const gaps = [];
  for (const a of outer) {
    const right = outer.filter((b) => b !== a && b.box.x >= a.box.x + a.box.w - 0.5 && Math.min(a.box.y + a.box.h, b.box.y + b.box.h) - Math.max(a.box.y, b.box.y) > 1).map((b) => ({ b, gap: round1(b.box.x - a.box.x - a.box.w) }));
    const below = outer.filter((b) => b !== a && b.box.y >= a.box.y + a.box.h - 0.5 && Math.min(a.box.x + a.box.w, b.box.x + b.box.w) - Math.max(a.box.x, b.box.x) > 1).map((b) => ({ b, gap: round1(b.box.y - a.box.y - a.box.h) }));
    for (const [axis, found] of [['x', right], ['y', below]]) {
      const nearest = found.sort((x, y) => x.gap - y.gap)[0];
      if (nearest) gaps.push({ a: a.id, b: nearest.b.id, axis, gap: nearest.gap });
    }
  }
  // No bottom edge to measure when the page scrolls down, or when the panes are stacked (as high as their content).
  const scrollsDown = document.documentElement.scrollHeight > window.innerHeight + 1 || Boolean(root.querySelector('[data-aui-panes~="stacked"]'));
  // A frame marked "in-layout" sits in a region of a layout the page keeps (a shared layout with its own bar, container and footer): its panes are measured from the frame's own box, not from the window.
  const inLayout = Boolean(pageFrame?.matches('[data-aui-panes~="in-layout"]'));
  const frameBox = inLayout ? pageFrame.getBoundingClientRect() : null;
  const edges = outer.length === 0 ? null : {
    from: inLayout ? 'frame' : 'window',
    left: round1(Math.min(...outer.map((one) => one.box.x)) - (frameBox ? frameBox.left : 0)),
    right: round1((frameBox ? frameBox.right : window.innerWidth) - Math.max(...outer.map((one) => one.box.x + one.box.w))),
    bottom: scrollsDown && !inLayout ? null : round1((frameBox ? frameBox.bottom : window.innerHeight) - Math.max(...outer.map((one) => one.box.y + one.box.h))),
    top: round1(Math.min(...outer.map((one) => one.box.y)) - (frameBox ? frameBox.top : topBarBottom)),
    topBarBottom,
  };
  const frames = [...root.querySelectorAll('[data-aui-panes]')].filter(visible).map((one) => {
    const wrapper = one.closest('.aui-panels') ?? one;
    const style = getComputedStyle(wrapper);
    return { label: one.getAttribute('data-aui-panes'), padding: [px(style.paddingTop), px(style.paddingRight), px(style.paddingBottom), px(style.paddingLeft)], gap: px(getComputedStyle(one).columnGap), handles: [...one.querySelectorAll('[role="separator"]')].map((handle) => { const size = handle.getBoundingClientRect(); return round1(Math.min(size.width, size.height)); }) };
  });
  // A look-alike: a wide, tall, filled, outlined, rounded box that is not a pane, a table, a dialog, a button or a styled piece.
  const lookalikes = [...root.querySelectorAll('*')].filter((element) => {
    if (frameSet.has(element) || !visible(element) || element.closest(`${SKIPPED},[data-aui-pane],.aui-table,[data-aui-styled],button,[role="button"]`)) return false;
    if (!framedOn4(element) || px(getComputedStyle(element).borderTopLeftRadius) <= 0 || fillOf(element) === '') return false;
    const box = element.getBoundingClientRect();
    if (box.width <= 150 || box.height <= 100) return false;
    let behind = element.parentElement;
    while (behind && fillOf(behind) === '') behind = behind.parentElement;
    return !behind || fillOf(behind) !== fillOf(element);
  }).map((element) => ({ element: label(element), w: round1(element.getBoundingClientRect().width), h: round1(element.getBoundingClientRect().height) }));
  const panes = {
    frames,
    edges,
    gaps,
    list: paneList,
    lookalikes,
    topBar: bar ? { h: round1(bar.getBoundingClientRect().height) } : null,
  };
  // The bar's corners belong to the bar, not its buttons. A row of tabs follows the same edge rule; tab corners follow the measured gap.
  const corners = (element) => {
    const style = getComputedStyle(element);
    return ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map((side) => px(style[`border${side}Radius`]));
  };
  const shapes = {
    topBar: (() => {
      const shapeBar = [...root.querySelectorAll('[role="menubar"]')].find((one) => visible(one) && one.getBoundingClientRect().top < 64);
      return shapeBar ? { element: label(shapeBar), position: atWindow(shapeBar), corners: corners(shapeBar), buttons: [...shapeBar.querySelectorAll('button,[role="button"]')].filter(visible).map((one) => ({ element: label(one), corners: corners(one) })) } : null;
    })(),
    tabRows: [...root.querySelectorAll('[data-aui-tab-row]')].filter(visible).map((row) => ({ element: label(row), position: atWindow(row), corners: corners(row) })),
    tabLists: [...root.querySelectorAll('[role="tablist"]')].filter(visible).map((list) => {
      const tabs = [...list.querySelectorAll(':scope > [role="tab"]')].filter(visible);
      if (tabs.length < 2) return null;
      const vertical = list.getAttribute('data-orientation') === 'vertical' || list.getAttribute('aria-orientation') === 'vertical';
      const gaps = tabs.slice(1).map((tab, index) => {
        const before = tabs[index].getBoundingClientRect();
        const after = tab.getBoundingClientRect();
        return round1(vertical ? after.top - before.bottom : after.left - before.right);
      });
      return { element: label(list), touches: gaps.some((gap) => gap <= 0.5), tabs: tabs.map((tab) => ({ element: label(tab), corners: corners(tab) })),
        container: list.closest('[data-aui-tab-row]') || fillOf(list) === '' ? null : { position: atWindow(list), corners: corners(list) } };
    }).filter(Boolean),
  };
  // A navigation link or item: a link in a bar (the top menubar, a toolbar, a navigation, a list of tabs, a group of two or more links in a row, `<nav>`), a link that marks the current page,
  // a tab, a menu item, and a link in an open menu (the bar's links folded at a narrow width). The browser underlines every anchor, a navigation link or item is not underlined: not the item, nor any text inside it.
  // An open menu is a popup portalled to the end of <body>, outside the app root: it is looked for in the whole page in scope.
  // A link in a content group (one link beside buttons, or a sentence with a link in it) is body text and keeps its underline: a button never counts toward the two links.
  const NAV_AREA = '[role="menubar"],[role="toolbar"],[role="navigation"],[role="tablist"],nav';
  const NAV_ITEM = '[role="tab"],[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"]';
  const LINK = 'a[href],[role="link"],[role="tab"]';
  const linkBars = [...root.querySelectorAll('[role="group"]')].filter((group) => {
    const own = [...group.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim() !== '');
    const style = getComputedStyle(group);
    const links = [...group.children].filter((child) => child.matches(LINK));
    return !own && style.display.includes('flex') && !style.flexDirection.startsWith('column') && links.length >= 2;
  });
  const navTargets = new Set([
    ...root.querySelectorAll(`:is(${NAV_AREA}) a, a[aria-current], ${NAV_ITEM}`),
    ...linkBars.flatMap((group) => [...group.querySelectorAll('a')]),
    ...whole.querySelectorAll('[role="menu"] a, [role="menu"] [role^="menuitem"]'),
  ]);
  const lineOf = (element) => getComputedStyle(element).textDecorationLine;
  // The element's own underline, else the first underline drawn by text inside it (a tab whose label is underlined in a span). An overline or a strike-through is not an underline: 'none'.
  const decorationOf = (element) => [lineOf(element), ...[...element.querySelectorAll('*')].map(lineOf)].find((line) => line.includes('underline')) ?? 'none';
  const barLinks = [...navTargets].filter(visible).map((link) => ({ element: label(link), decoration: decorationOf(link) }));
  // A tree whose control column holds nothing: the column is drawn (and indented once more) in front of every label, so the top level starts far in from the tree's edge.
  const trees = [...root.querySelectorAll('[role="tree"]')].filter(visible).map((tree) => {
    const slots = [...tree.querySelectorAll('[data-aui-table-control-cell]')].filter(visible);
    const first = tree.querySelector('[role="treeitem"][aria-level="1"]');
    const text = first && [...first.querySelectorAll('td')].filter(visible).map((cell) => [...cell.childNodes].find((node) => node.nodeType === 3 && node.textContent.trim() !== '')).find(Boolean);
    const range = text && document.createRange();
    if (range) range.selectNodeContents(text);
    return { element: label(tree), emptyControlColumn: slots.length > 0 && slots.every((slot) => !slot.querySelector('button,input,[role]')), controlWidth: slots[0] ? round1(slots[0].getBoundingClientRect().width) : 0, inset: range ? round1(range.getBoundingClientRect().left - tree.getBoundingClientRect().left) : null };
  });
  // A button beside a labelled field in one row lines up with the field box (its bottom edge), not with the whole field, label included.
  const FIELD_BOX = '.aui-field-control,.aui-select-trigger,textarea,input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])';
  const fieldRows = [];
  for (const button of root.querySelectorAll('button')) {
    if (!visible(button) || button.getAttribute('role') === 'combobox' || (button.textContent ?? '').trim() === '' || button.closest('.aui-table,[role="menubar"],[role="tablist"],.aui-field')) continue;
    const box = button.getBoundingClientRect();
    let node = button;
    for (let up = 0; up < 3 && node.parentElement && node.parentElement !== root; up += 1, node = node.parentElement) {
      const row = node.parentElement;
      const style = getComputedStyle(row);
      if (!style.display.includes('flex') || style.flexDirection.startsWith('column')) continue;
      const field = [...row.children].filter((one) => one !== node && visible(one) && one.querySelector('label,.aui-field-label')).map((one) => ({ one, control: [...one.querySelectorAll(FIELD_BOX)].find(visible) })).find(({ one, control }) => {
        if (!control) return false;
        const a = one.getBoundingClientRect();
        return a.top < box.bottom && a.bottom > box.top && one.querySelector('label,.aui-field-label').getBoundingClientRect().bottom <= control.getBoundingClientRect().top + 0.5;
      });
      if (!field) continue;
      const control = field.control.getBoundingClientRect();
      // Something under the control (an error or a hint) puts the field's own bottom lower than the control's: only a row without it is measured.
      if (control.bottom < field.one.getBoundingClientRect().bottom - 0.5) break;
      fieldRows.push({ button: label(button), field: label(field.control), off: round1(box.bottom - control.bottom) });
      break;
    }
  }
  const page = document.documentElement;
  return {
    spacing,
    stacks,
    overlappingFlexChildren,
    iconControls,
    trees,
    fieldRows,
    barLinks,
    edgeTouches,
    framedEdge,
    flushCards,
    cutOffTables,
    tableTextOverflows,
    stuckTables,
    tabCloseGaps,
    tabInsets,
    headerStarts,
    cellFields,
    barInsets,
    sidewaysPanes,
    sizeMisses,
    styled,
    panes,
    shapes,
    fontLoaded: document.fonts.check('16px Inter'),
    overflowX: page.scrollWidth > window.innerWidth + 1,
    scrollWidth: page.scrollWidth,
    innerWidth: window.innerWidth,
    plainHeadings: [...root.querySelectorAll('h1,h2,h3,h4,h5,h6,p,ul,ol')].filter((element) => visible(element) && !/(^|\s)aui-/.test(element.className)).map(label),
  };
})()
