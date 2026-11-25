# Panes

A pane is a framed, tinted box on the page with a 28 px header and a body. Any page layout is panes in a tree: `Panes`, `Pane`, `PaneBody` from `@/recipes/layout`. Release 7.0.9; the blocks wrap the library's `Panels`. Source: `src/recipes/layout/`.

## Say your layout as a tree
```tsx
// "A filter pane that collapses, beside an overview over a table."
<Panes label="Filters and work area">
  <Pane id="filters" title="Filters" size="narrow" collapsible="start">
    <PaneBody><Sections sections={filterSections} /></PaneBody>
  </Pane>
  <PaneGroup id="work" size="main">
    <Panes orientation="vertical" nested label="Overview and orders">
      <Pane id="overview" title="Overview" size="upper"><PaneBody surface="cards">…</PaneBody></Pane>
      <Pane id="orders" title="Orders" size="lower" labelled actions={…}><PaneBody scroll="content">…</PaneBody></Pane>
    </Panes>
  </PaneGroup>
</Panes>
```
Five arrangements as working code: [layouts](../recipes/layouts.md).

## Which body for which content
| Content | Body |
|---|---|
| A form, sections, text | `<PaneBody>`: one card that grows; the pane scrolls |
| A table, a tree, a drawing frame | `<PaneBody scroll="content">`: one card that fills; the content scrolls itself |
| Cards side by side | `<PaneBody surface="cards">`: no shared card; `<Sections layout="cards">` or soft cards |

A page title is the `title` of its pane: never a heading, and never a padded `View`, above or around `Panes` (AUI-05: the page frame is the only padding around the panes).
The body card is padded 4 px above and below and 8 px at the sides (`profile: 'default'`): a table, a note, a tip line, a count or a pager never touches the card's edge, so add no padding of your own to fix a flush body.

## Pane props
| Prop | Meaning |
|---|---|
| `id` | Names the pane and its collapse buttons |
| `title` | The heading (an `h2`, 16 / 20, semi-bold) |
| `size` | A name from the table below, never pixels |
| `collapsible` | `'start'` or `'end'`: the side the pane sits on. It folds to a 40 px rail |
| `leading` | Controls at the start of the header, before the title: a back or up arrow (`<IconButton name="angle-left" aui={PANE_ICON_AUI} aria-label="Back" />`, 20 x 20). In a pane that collapses toward the start it follows the collapse button. Never an arrow written into the title text or a `Type` beside the pane |
| `actions` | Controls at the end of the header. Icon controls: `<IconButton aui={PANE_ICON_AUI} aria-label="…" />` (20 x 20) |
| `labelled` | The header holds labelled buttons: no block padding, the actions 6 px apart, may wrap to a second row |
| `tabs` | A row of tabs in place of the title: the page tabs of the Aras shell (its page area is a `data-aui-pane-body="screen"` row: the routed screen brings its own card), or the `Tabs.List` of views whose panels are the rows of the pane ([tabs](tabs.md)) |

`Panes` takes `label` (names each handle "Resize <label>"), `orientation`, `nested` (inside a `PaneGroup`) and `resizable={false}` (plain boxes: no handle, no collapsing).
Known limit: collapsing or expanding a pane with the keyboard drops focus to the page body, because the library's `Panels` moves focus nowhere when the trigger that was pressed goes away. It is a line in `GAPS.md` for the library owner; add no focus code of your own.
Known limit: the width at which a page stacks counts the panes the page writes in its `Panes` and in the `Panes` written directly inside each `PaneGroup`, not the panes a screen component draws there. So a pane a component shows at run time inside a nested row is squeezed rather than stacked between 768 px and the width that row needs (`GAPS.md`).

## Sizes
`side` 440 (400 to 560) · `narrow` 320 (280 to 480) · `main` at least 480 · `half` 50 % (at least 260) · `upper` 40 % (at least 160) · `lower` at least 200 · `nav` 224 (the Aras shell's navigation panel). In the static form (`resizable={false}` and the class recipes) `narrow` is 320 and `side` is 384, the nearest width tokens.

## What the blocks give: do not rebuild
Page frame (4 px above and below, 8 px at the sides, 6 px between panes) · soft, outlined, tinted frame · 28 px header with an `h2` title · the 40 px rail and its 28 px button · the 6 px resize handles · the body card 8 px inside the frame and 4 px under the header · the 1 px line above every section but the first · below 768 px wide the group stacks: one column, full-width panes, the page scrolls. A resizable row stacks too while the window is narrower than its panes at their minimum sizes, the frame and the handles (side by side `narrow` and `main` need 782 px, three in a row 1068), so no pane is squeezed below its minimum and a collapsed pane can always expand.

## Never
- `Panels`, `Panels.Panel` or `Panels.ResizeHandle` in a screen (AUI-09; use `Panes`, `Pane`, `PaneGroup`).
- A pane written from the constants (`PANE_AUI`, `PANE_HEADER_AUI`, `PANE_SCROLL_AUI`, …): it passes no pane check.
- A button row, a note or any block beside the body card (under it, outside it): the pane holds its header and one body card, so put it inside `PaneBody` (the pane check fails it, PN6).
- A pane inside the body of a pane. Nest with `PaneGroup` around a nested `Panes`.
- `Panes` or `Pane` in a screen of the Aras pack's shell: it is drawn inside the shell's page pane, so it brings its own card, as the search and item recipes do (PN7). In the general starter a screen is `Panes` under the top bar ([app frame](../recipes/app-frame.md)), as `src/screens/Home/Home.tsx` is.
- A pixel size, a divider element (a line is a border on the block below: `DIVIDED_AUI`), a shadow, another radius.

## Mistakes
| Mistake | Fix |
|---|---|
| Text or a control outside every pane | Put the screen in a `PaneBody` |
| A plain `IconButton` in a header (28 x 28) | `aui={PANE_ICON_AUI}` (20 x 20) |
| Labelled buttons in a header without `labelled` | Add `labelled` |
| A card in a pane that touches the frame | Use `PaneBody`; it insets the card 8 px |
| Sections parted by space | `<Sections>`: a divider line, no gap |

## Checks
`npm run check` (AUI-09) fails the first two "Never" lines. `npm run check:layout` measures every pane, also one written by hand, and fails a pane that is not the block (rules PN1 to PN11, named in the message). Without React: [class recipes](../standard/recipes/layout.md); panes there cannot be resized or collapsed.
A view in `evidence.views.json` that collapses a pane writes the click as `{ "text": "Collapse <title>", "only": "desktop" }`: collapsing is off while the group stacks, so at the narrow size there is nothing to click.
