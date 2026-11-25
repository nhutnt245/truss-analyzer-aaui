# Class recipes: Table

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## table-display
Use for: Rows and columns of data, display only.
You add: nothing, unless a column must be narrow or the table picks rows. Columns share the width equally; a narrow column takes the layout class aui-width-<n> (for example aui-width-96) on its header cell and on every cell of that column, never a width attribute on col, td or th and no width in your CSS. A selection column is the first column with an empty header cell and the checkbox recipe (recipes/field.md) in each cell, all with aui-width-64, as the React control column is 64 px wide; what a tick does is yours (OPEN: if unknown). One row to pick: the table-row-selected recipe (a click on the row) or table-row-radio (a radio in that column). A table whose columns do not fit 390 px is table-scroll (recipes/table-wide.md), never a wrapper box. A status or State column puts the chip-status recipe (recipes/chip.md) in every cell. When you restyle an existing table, a status that was plain text stays plain text: the chip only where the source already showed a status badge. A picture placeholder in a cell uses table-picture-tile (recipes/picture-tile.md).
```html
<div aria-label="Parts" class="aui-table aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-border-color-outlined aui-border-block-start-width-1 aui-border-block-end-width-1 aui-border-inline-start-width-1 aui-border-inline-end-width-1 aui-gap-0 aui-min-height-0" role="table" data-aui-border="all-cells" data-aui-border-style="tonal" data-aui-selection-target="none" data-aui-a11y="table" data-aui-fit="fill" data-aui-scroll="self" data-aui-body-fit="content" style="--aui-scrollbar-size: var(--p-px-8)">
  <table class="aui-table-scroll-fixed aui-table-scroll-header" role="presentation">
    <thead role="rowgroup" class="aui-table-head">
      <tr data-aui-header-row="true" class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row>
        <th scope="col" role="columnheader" data-aui-table-cell-painted class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-left">Number</th>
        <th scope="col" role="columnheader" data-aui-table-cell-painted class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-center">Name</th>
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
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Mounting Bracket</td>
          </tr>
          <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1002</td>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Hex Bolt M8</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

## table-row-selected
Use for: A table with one row to pick by a click on the row, with no control column; the second row is selected.
You add: On click, give the picked row the class list, data-selected and aria-selected="true" of the second row here, and every other row those of the first row. A second click on the picked row keeps it picked. Picking a row with the keyboard is not covered in this version: a line in GAPS.md.
```html
<div aria-label="Parts" class="aui-table aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-border-color-outlined aui-border-block-start-width-1 aui-border-block-end-width-1 aui-border-inline-start-width-1 aui-border-inline-end-width-1 aui-gap-0 aui-min-height-0" role="grid" data-aui-border="all-cells" data-aui-border-style="tonal" data-aui-hoverable="true" data-aui-hover-target="row" data-aui-selection-target="row" data-aui-a11y="grid" data-aui-fit="fill" data-aui-scroll="self" data-aui-body-fit="content" style="--aui-scrollbar-size: var(--p-px-8)">
  <div role="presentation" class="aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-display-flex aui-flex-direction-column aui-table-scroll-region" style="--aui-scrollbar-size: var(--p-px-8)">
    <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
      <table class="aui-table-scroll-body" role="presentation">
        <tbody role="rowgroup" class="aui-table-body">
          <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row aria-selected="false">
            <td role="gridcell" data-aui-table-cell class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1001</td>
            <td role="gridcell" data-aui-table-cell class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Mounting Bracket</td>
          </tr>
          <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-border-color-secondary aui-border-inline-start-width-4" role="row" data-aui-table-row data-selected aria-selected="true">
            <td role="gridcell" data-aui-table-cell class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1002</td>
            <td role="gridcell" data-aui-table-cell class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Hex Bolt M8</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

## table-row-radio
Use for: A table with one row to pick by a radio (or a checkbox) in a column of its own, with or without a click on the row; the second row is picked.
You add: On a click on a radio, and on a click on the row if the source screen picks by the row too, tick that row's radio and untick the others, and give the picked row the class list, data-selected and aria-selected="true" of the second row here, every other row those of the first row. The ticked and the unticked class list of a radio are those of field-radio (recipes/form.md); here every radio keeps tabindex="0", as each one is alone in its radiogroup. A second click on the picked row or radio keeps it picked. A source that picks by the radio alone leaves the click on the row out. A source that picks one row by a checkbox uses the checkbox recipe (recipes/field.md) in the same column instead of the radio, with the same rule: ticking one box unticks the box of the row picked before, so one box is ticked at most, and a click on the ticked box keeps it ticked. The column is the first one, with an empty header cell above it, and 64 px wide like the checkbox column of table-display (aui-width-64 on its header cell and on every cell).
```html
<div aria-label="Parts" class="aui-table aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-border-color-outlined aui-border-block-start-width-1 aui-border-block-end-width-1 aui-border-inline-start-width-1 aui-border-inline-end-width-1 aui-gap-0 aui-min-height-0" role="grid" data-aui-border="all-cells" data-aui-border-style="tonal" data-aui-hoverable="true" data-aui-hover-target="row" data-aui-selection-target="row" data-aui-a11y="grid" data-aui-fit="fill" data-aui-scroll="self" data-aui-body-fit="content" data-aui-control-column style="--aui-scrollbar-size: var(--p-px-8)">
  <table class="aui-table-scroll-fixed aui-table-scroll-header" role="presentation">
    <thead role="rowgroup" class="aui-table-head">
      <tr data-aui-header-row="true" class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row>
        <th scope="col" role="columnheader" data-aui-table-cell data-aui-table-cell-painted class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-center"></th>
        <th scope="col" role="columnheader" data-aui-table-cell data-aui-table-cell-painted class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-left">Number</th>
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
          <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row aria-selected="false">
            <td data-aui-table-control-cell="true" role="gridcell" data-aui-table-cell class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-table-cell--control">
              <span class="aui-table-control-stack">
                <div role="radiogroup">
                  <span data-unchecked role="radio" tabindex="0" aria-checked="false" id="table-row-radio-1" aria-label="Select P-1001" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-radio aui-frame aui-scale-checkable-sm aui-typography-typescale-default aui-shape-pill aui-color-tonal-surface aui-frame--inset aui-elevation-0 aui-border-color-outlined">
                    <span data-unchecked aria-hidden="true" class="aui-radio-indicator"></span>
                  </span>
                </div>
              </span>
            </td>
            <td role="gridcell" data-aui-table-cell class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1001</td>
          </tr>
          <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-border-color-secondary aui-border-inline-start-width-4" role="row" data-aui-table-row data-selected aria-selected="true">
            <td data-aui-table-control-cell="true" role="gridcell" data-aui-table-cell class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-table-cell--control">
              <span class="aui-table-control-stack">
                <div role="radiogroup">
                  <span data-checked role="radio" tabindex="0" aria-checked="true" id="table-row-radio-2" aria-label="Select P-1002" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-radio aui-frame aui-scale-checkable-sm aui-typography-typescale-default aui-shape-pill aui-color-solid-primary aui-elevation-0">
                    <span data-checked aria-hidden="true" class="aui-radio-indicator"></span>
                  </span>
                </div>
              </span>
            </td>
            <td role="gridcell" data-aui-table-cell class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1002</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

## table-search-bar
Use for: A search field in a bar above a table, inside the body card: the field fills the bar (at least 96 wide, 28 high, with a magnifier) and the bar keeps 4 px above and below.
You add: Layout only. Keep the aria-label of the field. The bar is shown in every state: it stays when no row matches, so a search can be cleared, and while the rows load or failed to load, so the field keeps the focus.
```html
<div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-min-height-0 aui-display-flex aui-flex-direction-row aui-flex-fill aui-overflow-hidden" data-aui-panes="page">
  <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-min-width-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" data-aui-pane="orders">
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-min-height-28 aui-display-flex aui-flex-wrap-wrap aui-align-items-center aui-flex-none" data-aui-pane-header>
      <h2 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-flex-auto aui-margin-0 aui-typography-typescale-l3" data-aui-typeface="engineering" data-aui-typography="body">Work orders</h2>
    </div>
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-fill">
      <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-overflow-hidden" data-aui-pane-body="fill">
        <div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill">
          <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-gap-8 aui-display-flex aui-align-items-center aui-flex-none">
            <div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3 aui-min-width-96 aui-flex-fill">
              <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-field-control aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-elevation-0">
                <span class="aui-contained-icon aui-bg-transparent aui-scale-contained-sm" aria-hidden="true">
                  <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-magnifying-glass" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
                </span>
                <input id="table-search-bar-1" aria-label="Search work orders" placeholder="Search work orders" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-input aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0" type="search">
              </div>
            </div>
          </div>
          <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Orders</span>
        </div>
      </div>
    </div>
  </div>
</div>
```
