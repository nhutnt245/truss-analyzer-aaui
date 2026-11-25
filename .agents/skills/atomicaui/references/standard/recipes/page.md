# Class recipes: Page parts: header with buttons, sorted and pinned table, notes

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## table-sortable
Use for: Rows and columns with headers the user can sort by: the sorted header shows its direction and has aria-sort.
You add: On click on a sortable header, order the rows yourself and move the sort mark: the second header here is the sorted one (ascending), the first an unsorted one. Write aria-sort="ascending" or "descending" on the sorted header only. Sorting is built into the AtomicAUI Table as its sortable option, off by default: sort buttons only on the columns the user or the spec sorts, every other header is the table-display header cell, and never a sort button or arrow built by hand.
```html
<div aria-label="Parts" class="aui-table aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-border-color-outlined aui-border-block-start-width-1 aui-border-block-end-width-1 aui-border-inline-start-width-1 aui-border-inline-end-width-1 aui-gap-0 aui-min-height-0" role="table" data-aui-border="all-cells" data-aui-border-style="tonal" data-aui-selection-target="none" data-aui-a11y="table" data-aui-fit="fill" data-aui-scroll="self" data-aui-body-fit="content" style="--aui-scrollbar-size: var(--p-px-8)">
  <table class="aui-table-scroll-fixed aui-table-scroll-header" role="presentation">
    <thead role="rowgroup" class="aui-table-head">
      <tr data-aui-header-row="true" class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row>
        <th scope="col" role="columnheader" aria-sort="none" data-aui-table-cell-painted data-aui-table-sortable class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-left">
          <button type="button" class="aui-table-sort-button" data-aui-sort="none">
            Number
            <span aria-hidden="true" class="aui-contained-icon aui-color-text-surface aui-scale-contained-xs aui-table-sort-indicator">
              <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-10 fa-regular fa-chevron-down" data-aui-icon-family="fa-7-pro" data-aui-icon-style="monotone"></i>
            </span>
          </button>
        </th>
        <th scope="col" role="columnheader" aria-sort="ascending" data-aui-table-cell-painted data-aui-table-sortable class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-center">
          <button type="button" class="aui-table-sort-button" data-aui-sort="asc">
            Name
            <span aria-hidden="true" class="aui-contained-icon aui-color-text-surface aui-scale-contained-xs aui-table-sort-indicator">
              <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-10 fa-regular fa-chevron-up" data-aui-icon-family="fa-7-pro" data-aui-icon-style="monotone"></i>
            </span>
          </button>
        </th>
      </tr>
    </thead>
  </table>
  <div role="presentation" class="aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-display-flex aui-flex-direction-column aui-table-scroll-region" style="--aui-scrollbar-size: var(--p-px-8)">
    <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
      <table class="aui-table-scroll-body" role="presentation">
        <colgroup data-aui-table-column-lock>
          <col></col>
          <col></col>
        </colgroup>
        <tbody role="rowgroup" class="aui-table-body">
          <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1001</td>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Hex Bolt M8</td>
          </tr>
          <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1002</td>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Mounting Bracket</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

## table-notes
Use for: Notes under a table: a heading and numbered lines in a block with a 1 px line above it.
You add: Nothing. The line is a border on the notes block, never an element. One line per note, numbered in the text.
```html
<div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-border-color-outlined aui-border-block-start-width-1 aui-gap-8 aui-display-flex aui-flex-direction-column aui-border-style-solid">
  <h3 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-margin-0 aui-typography-typescale-l3" data-aui-typeface="engineering" data-aui-typography="body">Notes</h3>
  <div class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-typescale-p3" data-aui-typeface="engineering" data-aui-typography="body">1. Due dates are the dates the parts are needed at the line.</div>
</div>
```

## pane-actions
Use for: A pane header with the icon-only Configure columns button and a labelled button, in that order: the header has no block padding, the actions are 6 px apart and end at the right edge.
You add: Layout only. The Configure columns button is the 20 x 20 header icon button of this recipe.
```html
<div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-min-height-0 aui-display-flex aui-flex-direction-row aui-flex-fill aui-overflow-hidden" data-aui-panes="page">
  <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-min-width-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" data-aui-pane="orders">
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-min-height-28 aui-display-flex aui-flex-wrap-wrap aui-align-items-center aui-flex-none" data-aui-pane-header>
      <h2 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-flex-auto aui-margin-0 aui-typography-typescale-l3" data-aui-typeface="engineering" data-aui-typography="body">Work orders</h2>
      <div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-6 aui-height-28 aui-display-flex aui-align-items-center aui-justify-content-end aui-flex-auto">
        <button type="button" aria-label="Configure columns" title="Configure columns" id="pane-actions-1" aria-haspopup="dialog" aria-expanded="false" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-contained-sm aui-typography-typescale-default aui-shape-soft aui-color-text-secondary aui-elevation-0">
          <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
            <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-table-columns" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
          </span>
        </button>
        <button type="button" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-secondary aui-elevation-0">New</button>
      </div>
    </div>
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-fill">
      <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-overflow-hidden" data-aui-pane-body="fill">
        <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Orders</span>
      </div>
    </div>
  </div>
</div>
```

## table-pinned
Use for: A table wider than its frame: the first column stays at the start edge while the others scroll sideways, and the table scrolls inside its own frame.
You add: Layout only: the scrolling comes from the table recipe and aui/aui-behaviour.js (load it). Set the minimum width of the table (the --aui-table-min-inline-size variable in its style) to what its columns need; below that width the table scrolls. Only when the source pinned its first column: any other wide table is table-scroll (recipes/table-wide.md).
```html
<div aria-label="Parts" class="aui-table aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-border-color-outlined aui-border-block-start-width-1 aui-border-block-end-width-1 aui-border-inline-start-width-1 aui-border-inline-end-width-1 aui-gap-0 aui-min-height-0" role="table" data-aui-border="all-cells" data-aui-border-style="tonal" data-aui-selection-target="none" data-aui-a11y="table" data-aui-fit="fill" data-aui-scroll="self" data-aui-body-fit="content" data-aui-min-inline-size data-aui-frozen-columns="1" style="--aui-scrollbar-size: var(--p-px-8); --aui-table-min-inline-size: 640px; --aui-table-frozen-offset-0: 0px">
  <div class="aui-table-scroll-clip">
    <table class="aui-table-scroll-fixed aui-table-scroll-header" role="presentation">
      <thead role="rowgroup" class="aui-table-head">
        <tr data-aui-header-row="true" class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row>
          <th data-aui-table-frozen data-aui-table-frozen-last scope="col" role="columnheader" data-aui-table-cell-painted class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-left" style="--aui-table-frozen-offset: var(--aui-table-frozen-offset-0, 0px)">Number</th>
          <th scope="col" role="columnheader" data-aui-table-cell-painted class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-center">Name</th>
          <th scope="col" role="columnheader" data-aui-table-cell-painted class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-center">Owner</th>
        </tr>
      </thead>
    </table>
  </div>
  <div role="presentation" class="aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-display-flex aui-flex-direction-column aui-table-scroll-region" style="--aui-scrollbar-size: var(--p-px-8)">
    <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
      <table class="aui-table-scroll-body" role="presentation">
        <colgroup data-aui-table-column-lock>
          <col></col>
          <col></col>
          <col></col>
        </colgroup>
        <tbody role="rowgroup" class="aui-table-body">
          <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row>
            <td data-aui-table-frozen data-aui-table-frozen-last role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left" style="--aui-table-frozen-offset: var(--aui-table-frozen-offset-0, 0px)">P-1001</td>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Mounting Bracket</td>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">A. Rivera</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```
