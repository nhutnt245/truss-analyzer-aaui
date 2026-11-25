// The rules of the rendered layout check, as pure functions over what scripts/measure-page.mjs returns.
// Every problem is { rule, view, message, fix }.
export const TOKEN_STEPS = new Set([0, 1, 2, 3, 4, 6, 8, 9, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 96, 128, 160, 192]);
const TEXT_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'dl', 'dd', 'blockquote', 'figure', 'pre']);
const TABLE_TAGS = /^(table|thead|tbody|tfoot|tr)\b/;
// TreeView owns the spacing of its rows and nested groups, as Table owns its rows.
const TREE_VIEW_STACKS = /^div\.aui-tree-view(?:-item|-group)?(?:\[|\{|$)/;
const SELECT_LIST = /^div\.aui-select-list(?:\[|\{|$)/;
const BLOCK_DISPLAYS = new Set(['block', 'flow-root', 'inline-block', 'list-item']);
const IGNORED_CONSOLE = /VITE_ICON_KIT_ID/;

/** The fixes in React form. The standard check passes its own, in class form. */
const REACT_FIXES = {
  margin: "Text is <Type aui={TEXT_AUI}> (margin 0) or <Type as=\"span\">. The parent's gap makes the space.",
  step: 'Use a profile, or a token string in aui.sx (kit/spacing.md).',
  gap: 'Put them in one column: <View aui={STACK_AUI}> (gap 8), or use <ActionRow> for a button row (kit/spacing.md).',
  square: "An icon button or clickable icon is square: choose the AtomicAUI profile for square icon controls (`profile: 'square'`, or `'square-compact'` in a compact row), never raw px or CSS (kit/components/button.md).",
  stable: "Reserve the slot, or set the control's aui.profile to a value AtomicAUI defines, for example 'compact' (never raw px), so the row is the same size with the control hidden and shown (kit/spacing.md).",
  edge: "Text touches the window edge: the page has no padding. Put the screen in <Panes> and <Pane> (from @/recipes/layout): <Panes> is the page frame, padded 4/8, and every pane sits inside it (kit/components/panes.md).",
  frame: "A pane touches the window edge: the page frame has no padding. Put the panes in <Panes> (from @/recipes/layout): it is the page frame, 4 px above and below, 8 px left and right (kit/components/panes.md).",
  card: "A body card touches its pane frame: there is no padded row under the pane header. The body of a pane is <PaneBody> (from @/recipes/layout): its card sits 8 px inside the frame (kit/components/panes.md).",
  cut: 'A table is cut off by its parent instead of scrolling. Spread {...TABLE_PROPS} and do not override scroll: the table scrolls inside its own frame.',
  tableText: 'Give the Table minInlineSize (kit/components/table.md): its columns keep enough width for their text and scroll inside the table frame.',
  pane: 'A pane scrolls sideways because of a wide table. Give the Table {...TABLE_PROPS}: it scrolls inside its own frame (scroll="self") and the toolbar and paging bar stay put.',
  tree: "A table tree with nothing in its control column starts far in from its edge. Import Tree from @/recipes/shared/Tree to use TreeView, which has no table control column, or give the Table indicatorColumn={false} (kit/recipes/tree.md).",
  align: "A button in a row with labelled fields lines up with the field boxes, not with the labels: put the row in <View aui={FILTER_ROW_AUI}> (from @/recipes/shared/aui; alignItems 'end'), the fields and buttons its direct children (kit/spacing.md).",
  link: "A navigation link or tab is not underlined (a link in a bar, a menu, a navigation, a list of tabs, or a link marking the current page): give the Menubar.Button, the Menubar.DropdownLinkItem of a folded menu, and a text Button that renders an <a> (a breadcrumb link), aui={NAV_LINK_AUI} (from @/recipes/shared/aui; text paint, textDecoration 'none'); a Tabs.Tab, or a Button that keeps a filled look (ACTION_AUI), adds sx: { textDecoration: 'none' } to its own aui and keeps its chip or fill, or the class aui-text-decoration-none without React (kit/recipes/app-frame.md). Keep its focus ring and aria-current.",
  radius: "An icon control has another corner radius than IconButton. Do not set shape on a control: the part's default is the kit look (AUI-09).",
  tab: 'Put the tab label in <View as="span" aui={TAB_LABEL_AUI}>: it takes the free width, so the close button is at the far right (kit/components/tabs.md).',
  inset: 'Give every <Tabs.Panel> aui={TAB_PANEL_AUI} (from @/recipes/shared/aui): the panel has no padding of its own, so the table, card or form in it starts at the left edge of the tab row. Put no padded View between the panel and what it holds. Only the panel of a pane whose header holds the tab row takes PANE_TAB_PANEL_AUI: it is the padded row of that pane (kit/components/tabs.md).',
  header: "The first column is left, header and cells alike: give its <Table.HeaderCell> aui={HEADER_START_AUI} and the other header cells aui={HEADER_CELL_AUI} (from @/recipes/shared/aui; kit/components/table.md).",
  cell: 'Give a text field in a table cell aui={CELL_INPUT_AUI} (from @/recipes/shared/aui): it fills its cell and shrinks with it, at any column width (kit/components/table.md).',
  bar: "A toolbar, title bar or paging bar starts at the left edge of the blocks beside it: give it aui={{ ...BAR_AUI }} beside a block that fills the card (a table), or aui={{ ...BAR_PADDED_AUI }} beside padded blocks such as form sections (from @/recipes/shared/aui; kit/spacing.md). Never profile 'compact' on a bar.",
  ring: 'Focus rings show for the keyboard only. On a page without React, load aui/aui-theme.js (it marks where focus came from); do not style :focus yourself.',
  font: 'The AtomicAUI font (Inter) did not load, so the page shows serif text. Serve the page from a folder made by `node scripts/standard-copy.mjs <folder>` (it adds aui/fonts/), or check the font link.',
  overflow: "Let rows wrap (flexWrap: 'wrap') or put the wide part in a View.ScrollArea.",
  flexOverlap: "The first flex child shrinks below its content and paints over the next one. Give that child flex: 'none' through aui.sx, or put its content in a scrolling View.ScrollArea (kit/components/view.md).",
  size: "A box is never smaller than 10 px, so a size of 1 to 9 draws 10 px: a line is a border (borderBlockStartWidth: '1', borderColor: 'outlined'), never a box. A slot that grew: its content is larger than the size; choose the token size that fits it (kit/spacing.md).",
  pn1: 'Put the panes in <Panes> (from @/recipes/layout): it is the page frame, 4 px above and below, 8 px at the sides and 6 px between panes. Never set padding or gap on a frame yourself (kit/components/panes.md).',
  pn2: "Use <Pane>: its frame is the kit's tinted, outlined, soft pane. Never change its colour, shape or border (kit/components/panes.md).",
  pn3: 'Use <Pane>: its header is one 28 px band, 8 px at the sides and 6 px between its items (kit/components/panes.md).',
  pn4: 'Give <Pane> a title: it writes the h2 (16 / 20, semi-bold). Page tabs go in its tabs prop (kit/components/panes.md).',
  pn5: 'A header icon control is <IconButton aui={PANE_ICON_AUI} aria-label="..."> (PANE_ICON_AUI from @/recipes/shared/aui): 20 x 20. Labelled buttons need <Pane labelled> (kit/components/panes.md).',
  pn6: 'The body of a pane is <PaneBody>: its card sits 8 px inside the frame and 4 px under the header, soft, with no border (kit/components/panes.md).',
  stray: 'A pane holds its header and one body card: move the button row or block into <PaneBody>, inside the card (kit/components/panes.md).',
  pn7: 'Nest panes with <PaneGroup> around a nested <Panes>, never inside a body (kit/components/panes.md).',
  pn8: 'Use <Sections> (a 1 px line above every section but the first), or <Sections layout="cards"> in <PaneBody surface="cards"> (soft cards, 6 px apart). Do not part sections by space (kit/components/panes.md). Cards to pick (selection-cards) are not the pane\'s cards: put the group inside a card (a SectionCard block, or the default PaneBody), never as the direct children of <PaneBody surface="cards"> (kit/recipes/overview-page.md).',
  pn9: 'A collapsible pane is <Pane collapsible="start"> (or "end"): the block draws the 40 px rail and its 28 px button (kit/components/panes.md).',
  pn10: 'Use <Pane>; a card inside a pane is <PaneBody>; a card to pick is SELECTED_CARD_AUI (kit/components/panes.md).',
  pn11: "The top bar is a <Menubar aui={{ scale: 'sm' }}> that holds a 28 px control: it is 36 px high. Do not set its height or padding.",
  shadow: 'Delete the elevation. A styled piece sits in the page: elevation is always 0 (kit/style/roles.md). Only a library popup floats.',
  edgeBar: "Give the Menubar sx: { radius: 'none' }; its buttons keep their soft corners (kit/recipes/app-frame.md).",
  insetBar: 'Keep the default soft bar corners (kit/recipes/app-frame.md).',
  barButton: 'Keep the Button or IconButton default soft shape (kit/recipes/app-frame.md).',
  tabRow: "Use TAB_ROW_AUI in a pane header; at the window edges use { ...TAB_ROW_AUI, shape: 'none' } (kit/components/tabs.md).",
  tabsTouch: "Set shape: 'none' once on Tabs, not on each Tab (kit/components/tabs.md).",
  tabsGap: 'Keep the default soft shape on Tabs (kit/components/tabs.md).',
  tabContainer: 'Set the tab container shape for its position (kit/components/tabs.md).',
};

const near = (value, expected) => Math.abs(value - expected) <= 0.5;
const PANE_CLASSES = ['aui-color-fixed-surface-alt', 'aui-shape-soft', 'aui-scale-block-padding-sm'];

/**
 * The pane rules PN1 to PN11 over view.panes (scripts/measure-page.mjs). Tolerance 0.5 px.
 * A pane that is collapsed is checked for PN2, PN9 and PN10 only. Every message ends with its rule's number.
 */
export function checkPanes(view, fixes = REACT_FIXES) {
  const found = [];
  const panes = view.panes;
  if (!panes) return found;
  const add = (rule, number, message, key = `pn${number}`) => found.push({ rule, view: view.name, message: `${message} [PN${number}]`, fix: fixes[key] ?? REACT_FIXES[key] });
  const list = panes.list ?? [];
  const edges = panes.edges;
  if (edges) {
    const wrong = [['left', 8], ['right', 8], ['bottom', 4], ['top', 4]].filter(([side, want]) => edges[side] !== null && edges[side] !== undefined && !near(edges[side], want));
    if (wrong.length > 0) {
      const where = edges.from === 'frame' ? (side) => `the ${side} of the page frame` : (side) => (side === 'top' ? 'the top bar' : `the window ${side}`);
      add('AUI-05', 1, `The page frame is padded 4 / 8 and panes are 6 px apart: measured ${wrong.map(([side, want]) => `${edges[side]} px from ${where(side)} (must be ${want})`).join(', ')}.`);
    }
  }
  for (const gap of panes.gaps ?? []) {
    if (!near(gap.gap, 6)) add('AUI-05', 1, `The page frame is padded 4 / 8 and panes are 6 px apart: measured ${gap.gap} px between ${gap.a} and ${gap.b}.`);
  }
  for (const pane of list) {
    const named = pane.title ? `${pane.element} "${pane.title}"` : pane.element;
    const wrongClasses = PANE_CLASSES.filter((name) => !pane.classes.includes(name));
    const sides = pane.border.some((width) => !near(width, 1));
    if (wrongClasses.length > 0 || sides || !near(pane.radius, 4)) {
      add('AUI-09', 2, `A pane is a tinted, outlined, soft frame: ${named} ${[wrongClasses.length > 0 ? `lacks ${wrongClasses.join(', ')}` : '', sides ? `has borders ${pane.border.join('/')} px` : '', !near(pane.radius, 4) ? `has radius ${pane.radius} px` : ''].filter(Boolean).join(' and ')}.`);
    }
    if (pane.collapsed) {
      const rail = Math.min(pane.box.w, pane.box.h);
      if (!near(rail, 40) || !pane.trigger || !near(pane.trigger.w, 28) || !near(pane.trigger.h, 28) || pane.trigger.expanded === 'true') {
        add('AUI-09', 9, `A collapsed pane is a 40 px rail with one 28 px button: ${named} is ${rail} px, its button is ${pane.trigger ? `${pane.trigger.w} x ${pane.trigger.h} px and says aria-expanded="${pane.trigger.expanded}"` : 'missing'}.`);
      }
    } else {
      const header = pane.header;
      if (header) {
        if (![28, 56].some((height) => near(header.h, height)) || !header.paddingInline.every((value) => near(value, 8)) || !near(header.gap, 6)) {
          add('AUI-05', 3, `A pane header is one 28 px band: ${named} has a header of ${header.h} px, padding ${header.paddingInline.join(' / ')} px at the sides and gap ${header.gap} px (28 or 56 high, 8 / 8, gap 6).`);
        }
        const text = header.firstText;
        if (!header.hasTablist && !(text && text.tag === 'h2' && near(text.size, 16) && near(text.line, 20) && text.weight === '600')) {
          add('AUI-09', 4, `The title of a pane is an h2, 16 / 20, semi-bold: ${named} has ${text ? `${text.tag} ${text.size} / ${text.line}, weight ${text.weight}` : 'no title'}.`);
        }
        for (const control of header.iconControls) {
          if (!near(control.w, 20) || !near(control.h, 20)) add('AUI-11', 5, `An icon control in a pane header is 20 x 20: ${control.element} in ${named} is ${control.w} x ${control.h} px.`);
        }
      }
      const body = pane.body;
      // A body of kind "screen" (the Aras shell's page area) holds a screen that brings its own card, or none: not measured.
      if (body && body.kind !== 'screen') {
        const cardsMode = body.kind === 'cards';
        const wrong = [
          !near(body.insetLeft, 9) || !near(body.insetRight, 9) ? `${body.insetLeft} / ${body.insetRight} px from the frame's sides (must be 9)` : '',
          body.underHeader !== null && !near(body.underHeader, 4) ? `${body.underHeader} px under the header (must be 4)` : '',
          !cardsMode && body.aboveBottom < 7.5 ? `${body.aboveBottom} px above the frame's bottom (at least 8)` : '',
          !cardsMode && body.border.some((width) => width > 0) ? `a border of ${body.border.join('/')} px` : '',
          !cardsMode && !near(body.radius, 4) ? `radius ${body.radius} px (must be 4)` : '',
        ].filter(Boolean);
        if (wrong.length > 0) add('AUI-05', 6, `A body card sits 8 px inside its pane: in ${named} it is ${wrong.join(', ')}.`);
      }
      // Everything a pane holds is in its body card: a button row or a block outside it has no card under it and touches the frame.
      if (body && (pane.stray ?? []).length > 0) add('AUI-09', 6, `A pane holds its header and one body card, nothing beside them: in ${named} ${pane.stray.join(', ')} sits outside the card.`, 'stray');
      for (const section of pane.sections ?? []) {
        const problem = section.radius > 0 ? `section ${section.index + 1} has a radius of ${section.radius} px` : section.index > 0 && !near(section.borderTop, 1) ? `section ${section.index + 1} has no 1 px line above it` : section.index === 0 && section.borderTop > 0 ? 'the first section has a line above it' : section.gapAbove > 0.5 ? `section ${section.index + 1} is ${section.gapAbove} px below the one above it` : '';
        if (problem) add('AUI-09', 8, `Sections in a card are parted by a 1 px divider, not by space: in ${named} ${problem}.`);
      }
      for (const card of pane.cards ?? []) {
        const problem = !near(card.radius, 4) ? `a card has radius ${card.radius} px (must be 4)` : [card.gapRight, card.gapBelow].some((gap) => gap !== null && !near(gap, 6)) ? `cards are ${[card.gapRight, card.gapBelow].filter((gap) => gap !== null).join(' and ')} px apart (must be 6)` : '';
        if (problem) add('AUI-09', 8, `Sections in a card are parted by a 1 px divider, not by space: in ${named} ${problem} (cards on the pane colour: soft, 6 px apart).`);
      }
    }
    if (pane.inside !== '') add('AUI-09', 7, `A pane inside a pane: nest panes with PaneGroup, never inside a body (${named} is inside ${pane.inside}).`);
    if (!pane.marked) add('AUI-09', 10, `This box looks like a pane and is not one: ${named} is a pane written by hand, not <Pane>.`);
  }
  // Class form only (the React Panes stacks itself, and its Aras shell keeps a row on purpose): below 768 px the script stacks the panes and says so in
  // the marker, and at 768 px or more it takes the word off again, so a frame that says it there had it written by hand.
  if (fixes.stack) {
    const stacked = (panes.frames ?? []).map((frame) => /(^|\s)stacked(\s|$)/.test(frame.label ?? ''));
    if (view.innerWidth < 768 && stacked.includes(false)) {
      found.push({ rule: 'AUI-10', view: view.name, message: `The panes are not stacked at ${view.innerWidth} px: aui/aui-behaviour.js is not loaded, and below 768 px a page of panes is one column.`, fix: fixes.stack });
    }
    if (view.innerWidth >= 768 && stacked.includes(true)) {
      found.push({ rule: 'AUI-10', view: view.name, message: `A frame of panes says it is stacked at ${view.innerWidth} px: its marker was written by hand. Only aui/aui-behaviour.js marks a frame, below 768 px, and it takes the mark off above.`, fix: fixes.stack });
    }
  }
  for (const box of panes.lookalikes ?? []) {
    add('AUI-09', 10, `This box looks like a pane and is not one: ${box.element} (${box.w} x ${box.h} px, filled, outlined, rounded).`);
  }
  if (panes.topBar && !near(panes.topBar.h, 36)) add('AUI-05', 11, `The top bar is 36 px: it must hold a 28 px control. It is ${panes.topBar.h} px.`);
  return found;
}

export function checkLayout(view, fixes = REACT_FIXES) {
  const problems = [];
  const add = (rule, message, fix) => problems.push({ rule, view: view.name, message, fix });
  for (const item of view.spacing) {
    if (TEXT_TAGS.has(item.tag) && item.margin.some((value) => value > 0)) {
      add('AUI-05', `Browser-default margin ${item.margin.join('/')} on ${item.element}.`, fixes.margin);
    }
    // A bordered part gives one step of padding minus its border, so padding plus border must be a step.
    const odd = [...item.padding.map((value, side) => [value, value + item.border[side]]), ...item.gap.map((value) => [value, value])]
      .filter(([value, withBorder]) => !TOKEN_STEPS.has(value) && !TOKEN_STEPS.has(withBorder))
      .map(([value]) => value);
    if (odd.length > 0) {
      add('AUI-05', `Spacing ${odd.join(', ')} px on ${item.element} is not a token step.`, fixes.step);
    }
  }
  for (const pair of view.stacks) {
    if (pair.text || pair.distance >= 1 || pair.distance < -0.5) continue;
    if (!BLOCK_DISPLAYS.has(pair.parentDisplay) || TABLE_TAGS.test(pair.parent) || TREE_VIEW_STACKS.test(pair.parent) || SELECT_LIST.test(pair.parent)) continue;
    add('AUI-05', `No gap: ${pair.above} and ${pair.below} touch (0 px) inside ${pair.parent}.`, fixes.gap);
  }
  for (const pair of view.overlappingFlexChildren ?? []) {
    add('AUI-10', `${pair.above} has ${pair.excess} px of visible content beyond its box, overlapping ${pair.below} by ${pair.overlap} px.`, fixes.flexOverlap);
  }
  for (const control of view.iconControls ?? []) {
    if (Math.abs(control.width - control.height) > 0.5) {
      add('AUI-11', `Icon control ${control.element} is not square: ${control.width} x ${control.height} px.`, fixes.square);
    }
  }
  // Shape by position: the top bar and a tab row follow the window edge; the tabs themselves follow their gap.
  const hasCorners = (corners, want) => corners.every((corner) => Math.abs(corner - want) <= 0.5);
  const shape = view.shapes ?? {};
  const bar = shape.topBar;
  if (bar?.position === 'edge' && !hasCorners(bar.corners, 0)) {
    add('AUI-09', `The top bar runs from edge to edge of the window and has corners of ${bar.corners.join(' / ')} px: a bar at the window edges has no corners.`, fixes.edgeBar ?? REACT_FIXES.edgeBar);
  } else if (bar?.position === 'inset' && !hasCorners(bar.corners, 4)) {
    add('AUI-09', `The top bar has space around it and has corners of ${bar.corners.join(' / ')} px: an inset bar keeps soft 4 px corners.`, fixes.insetBar ?? REACT_FIXES.insetBar);
  }
  for (const button of bar?.buttons ?? []) {
    if (!hasCorners(button.corners, 4)) add('AUI-09', `The top bar button ${button.element} has corners of ${button.corners.join(' / ')} px: buttons in the bar keep soft 4 px corners.`, fixes.barButton ?? REACT_FIXES.barButton);
  }
  for (const row of shape.tabRows ?? []) {
    const want = row.position === 'edge' ? 0 : row.position === 'inset' ? 4 : null;
    if (want !== null && !hasCorners(row.corners, want)) {
      add('AUI-09', `The tab row ${row.element} is ${row.position === 'edge' ? 'at the window edges' : 'inset'} and has corners of ${row.corners.join(' / ')} px: it takes ${want === 0 ? 'no' : 'soft'} corners.`, fixes.tabRow ?? REACT_FIXES.tabRow);
    }
  }
  for (const list of shape.tabLists ?? []) {
    const want = list.touches ? 0 : 4;
    const wrong = list.tabs.filter((tab) => !hasCorners(tab.corners, want));
    if (wrong.length > 0) {
      add('AUI-09', `The tabs of ${list.element} ${list.touches ? 'touch each other' : 'have a gap'} and have corners of ${wrong[0].corners.join(' / ')} px: tabs ${list.touches ? 'that touch have no corners' : 'with a gap keep soft 4 px corners'}.`, list.touches ? fixes.tabsTouch ?? REACT_FIXES.tabsTouch : fixes.tabsGap ?? REACT_FIXES.tabsGap);
    }
    const container = list.container;
    const containerWant = container?.position === 'edge' ? 0 : container?.position === 'inset' ? 4 : null;
    if (containerWant !== null && !hasCorners(container.corners, containerWant)) {
      add('AUI-09', `The tab container ${list.element} is ${container.position === 'edge' ? 'at the window edges' : 'inset'} and has corners of ${container.corners.join(' / ')} px: it takes ${containerWant === 0 ? 'no' : 'soft'} corners.`, fixes.tabContainer ?? REACT_FIXES.tabContainer);
    }
  }
  // The prototype look: page padding, tables that scroll in their own frame, one corner radius for icon controls, the font.
  // The bare address (mode=bare) shows the page with no shell and no padded frame: a page there fills the window, so it touches the edge whatever the screen holds. The measured address is the shell route.
  const bare = /[?&]mode=bare\b/.test(view.url ?? '') ? ' This view is the bare address (mode=bare): nothing in your screen causes it. List the page at its shell address in evidence.views.json: #/item/<Type>/<id> for an item, #/search/<Type> for a search page; use the bare address only in public/host.html and look at it at /host.html (kit/packs/aras/frame.md).' : '';
  for (const touch of view.edgeTouches ?? []) {
    add('AUI-05', `${touch.element} is ${Math.min(touch.left, touch.right)} px from the window edge (a page and its panes are padded at least 8 px).`, `${fixes.edge ?? REACT_FIXES.edge}${bare}`);
  }
  for (const box of view.framedEdge ?? []) {
    add('AUI-05', `${box.element} is ${Math.min(box.left, box.right)} px from the window edge (a framed pane sits at least 8 px inside it).`, fixes.frame ?? REACT_FIXES.frame);
  }
  for (const card of view.flushCards ?? []) {
    add('AUI-05', `${card.element} sits ${Math.min(card.left, card.right)} px from the frame of ${card.frame} (a body card sits at least 6 px inside its pane frame).`, fixes.card ?? REACT_FIXES.card);
  }
  for (const table of view.cutOffTables ?? []) {
    add('AUI-10', `${table.element} is ${table.tableWidth} px wide but ${table.clippedBy} clips it at ${table.clipWidth} px: columns cannot be reached.`, fixes.cut ?? REACT_FIXES.cut);
  }
  for (const text of view.tableTextOverflows ?? []) {
    add('AUI-10', `${text.row} cell ${text.cell} in ${text.table} has text ${text.over} px outside its cell.`, fixes.tableText ?? REACT_FIXES.tableText);
  }
  // Class form only: a React Table scrolls by its own props, so the React fixes have no "stuck".
  for (const table of fixes.stuck ? view.stuckTables ?? [] : []) {
    add('AUI-10', `${table.element} is ${table.content} px wide in a ${table.box} px frame and does not scroll: columns cannot be reached.`, fixes.stuck);
  }
  for (const pane of view.sidewaysPanes ?? []) {
    add('AUI-10', `${pane.element} scrolls sideways (content ${pane.content} px in a ${pane.box} px box).`, fixes.pane ?? REACT_FIXES.pane);
  }
  for (const tab of view.tabCloseGaps ?? []) {
    if (tab.gap > 12) add('AUI-09', `The close button of ${tab.element} is ${tab.gap} px from the right edge of the tab: it must sit at the far right.`, fixes.tab ?? REACT_FIXES.tab);
  }
  // What sits under a row of tabs shares the tab row's left edge.
  for (const inset of view.tabInsets ?? []) {
    if (Math.abs(inset.left) > 0.5) add('AUI-05', `${inset.under} under the tabs ${inset.tabs} starts ${Math.abs(inset.left)} px to the ${inset.left > 0 ? 'right' : 'left'} of the tab row: a table, card or form under tabs starts at the left edge of the tab row.`, fixes.inset ?? REACT_FIXES.inset);
  }
  // The first column's header starts where its cells start.
  for (const miss of view.headerStarts ?? []) {
    add('AUI-09', `The header "${miss.header}" of ${miss.table} has text-align ${miss.align} over a left-aligned first column: the header and the cells of the first column start at one edge.`, fixes.header ?? REACT_FIXES.header);
  }
  // A text field in a table cell stays inside its cell.
  for (const field of view.cellFields ?? []) {
    add('AUI-05', `${field.element} is ${field.width} px wide in a table cell with room for ${field.room} px: ${field.over} px too wide, it runs over the next column.`, fixes.cell ?? REACT_FIXES.cell);
  }
  // A bar starts where the blocks beside it start. Up to 12 px off is a padding that does not match; more is another layout.
  for (const inset of view.barInsets ?? []) {
    const off = Math.abs(inset.left);
    if (off > 0.5 && off <= 12) add('AUI-05', `${inset.first}, the first item of the bar ${inset.bar}, starts ${off} px to the ${inset.left > 0 ? 'right' : 'left'} of the blocks beside the bar: a toolbar, title bar or paging bar starts at the left edge of the table, form or tabs around it.`, fixes.bar ?? REACT_FIXES.bar);
  }
  // A tree with an empty control column: the label starts the width of that column (and one indent more) in from the tree's edge. A foldable tree keeps the column for its chevrons.
  for (const tree of view.trees ?? []) {
    if (tree.emptyControlColumn) add('AUI-05', `${tree.element} draws an empty ${tree.controlWidth} px control column before its labels: the top level starts ${tree.inset} px in from the tree's edge (the library's own first-cell padding is 8 px).`, fixes.tree ?? REACT_FIXES.tree);
  }
  // A button beside a labelled field: its bottom edge is the field box's, within half a pixel.
  for (const row of view.fieldRows ?? []) {
    if (Math.abs(row.off) > 0.5) add('AUI-09', `${row.button} is ${Math.abs(row.off)} px ${row.off > 0 ? 'below' : 'above'} the bottom edge of the field box ${row.field} in its row: it is centred on the whole field, label included.`, fixes.align ?? REACT_FIXES.align);
  }
  // A navigation link or item (a link in a menubar, toolbar, navigation, tab list, open menu or a row of links; a link that marks the current page; a tab; a menu item): no underline, the anchor's browser default.
  for (const link of view.barLinks ?? []) {
    if (link.decoration !== 'none') add('AUI-09', `The link or tab ${link.element} in a bar, menu or tab list is drawn with text-decoration "${link.decoration}": a navigation link or tab is not underlined.`, fixes.link ?? REACT_FIXES.link);
  }
  const referenceRadius = (view.iconControls ?? []).find((control) => control.iconButton)?.radius;
  for (const control of view.iconControls ?? []) {
    if (referenceRadius !== undefined && control.radius !== referenceRadius) {
      add('AUI-09', `Icon control ${control.element} has corner radius ${control.radius} px; IconButton has ${referenceRadius} px.`, fixes.radius ?? REACT_FIXES.radius);
    }
  }
  // A styled piece (data-aui-styled) is flat, and a size written as a token comes out as written.
  for (const miss of view.sizeMisses ?? []) {
    add('AUI-05', `${miss.element} asks for a ${miss.axis} of ${miss.asked} px but is ${miss.got} px.`, fixes.size ?? REACT_FIXES.size);
  }
  for (const piece of view.styled ?? []) {
    for (const shadow of piece.shadows) add('AUI-09', `The styled piece "${piece.name}" has a shadow on ${shadow.slice(0, 120)}.`, fixes.shadow ?? REACT_FIXES.shadow);
  }
  if (view.pointerRing === true) add('AUI-04', 'A mouse click on a text field leaves a focus ring. The ring is for keyboard focus only.', fixes.ring ?? REACT_FIXES.ring);
  if (view.fontLoaded === false) add('AUI-06', 'The font Inter is not loaded: the text shows in the browser default.', fixes.font ?? REACT_FIXES.font);
  // A control that appears or disappears (on scroll, hover, selection, loading, edit mode) must not resize its row or bar.
  for (const row of view.rows ?? []) {
    if (row.auto && (!row.before.found || !row.after.found)) continue; // a bar that exists only before or after is not a resize
    if (!row.before.found || !row.after.found) {
      add('AUI-12', `evidence.views.json: no row or bar named "${row.label}" ${row.before.found ? 'after' : 'before'} the clicks.`, 'Name it by its aria-label.');
    } else if (row.auto && Math.abs(row.before.height - row.after.height) <= 0.5 && row.before.paneWidth !== undefined && row.after.paneWidth !== undefined
      && Math.abs((row.after.width - row.before.width) - (row.after.paneWidth - row.before.paneWidth)) <= 0.5) {
      // A bar that only follows its pane (the pane around it collapsed or was resized) did not change by itself.
      continue;
    } else if (Math.abs(row.before.height - row.after.height) > 0.5 || Math.abs(row.before.width - row.after.width) > 0.5) {
      add('AUI-05', `"${row.label}" changed size when a control appeared or disappeared: ${row.before.width} x ${row.before.height} px before, ${row.after.width} x ${row.after.height} px after.`, fixes.stable);
    }
  }
  if (view.overflowX) add('AUI-10', `The page scrolls sideways at ${view.innerWidth} px wide (content is ${view.scrollWidth} px).`, fixes.overflow);
  for (const text of view.missedClicks ?? []) add('AUI-12', `evidence.views.json: nothing to click or type in named "${text}".`, 'Use the visible text, aria-label or title of the control (the value of an input button; for a box to type in its label, id or name; for a scroll step the exact aria-label, title or text of the element to bring into view): a tab is its label, a card its title and description together (a name that begins its text is enough while only one control begins with it). A control that is on screen at one size only (collapsing a pane is off below 768 px) is written { "text": "Collapse <title>", "only": "desktop" } (or "narrow").');
  for (const text of (view.consoleErrors ?? []).filter((line) => !IGNORED_CONSOLE.test(line))) {
    add('AUI-12', `Browser console: ${text.slice(0, 160)}`, 'Fix the error or warning, then look again.');
  }
  problems.push(...checkPanes(view, fixes));
  return problems;
}
