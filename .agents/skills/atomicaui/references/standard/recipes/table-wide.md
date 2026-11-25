# Class recipes: Wide table: scrolls sideways inside its own frame at a narrow width

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## table-scroll
Use for: A table whose columns need more room than a narrow page has (390 px): below its minimum width the table scrolls sideways inside its own frame, header and body together, and the page never does. For a table you restyle: when its columns do not fit 390 px, this is the table recipe, not table-display.
You add: Layout only. Set --aui-table-min-inline-size in the style of the table to 128 px for each column (more for a column of long text); the style attribute and data-aui-min-inline-size stay as written, and the header stays inside its aui-table-scroll-clip div. The scrolling is done by the recipe and aui/aui-behaviour.js (load it): no wrapper box, no overflow of your own, no pinned column unless the source pinned one (that is table-pinned).
```html
<div aria-label="Parts" class="aui-table aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-border-color-outlined aui-border-block-start-width-1 aui-border-block-end-width-1 aui-border-inline-start-width-1 aui-border-inline-end-width-1 aui-gap-0 aui-min-height-0" role="table" data-aui-border="all-cells" data-aui-border-style="tonal" data-aui-selection-target="none" data-aui-a11y="table" data-aui-fit="fill" data-aui-scroll="self" data-aui-body-fit="content" data-aui-min-inline-size style="--aui-scrollbar-size: var(--p-px-8); --aui-table-min-inline-size: 512px">
  <div class="aui-table-scroll-clip">
    <table class="aui-table-scroll-fixed aui-table-scroll-header" role="presentation">
      <thead role="rowgroup" class="aui-table-head">
        <tr data-aui-header-row="true" class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row>
          <th scope="col" role="columnheader" data-aui-table-cell-painted class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-left">Number</th>
          <th scope="col" role="columnheader" data-aui-table-cell-painted class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-center">Name</th>
          <th scope="col" role="columnheader" data-aui-table-cell-painted class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-center">Owner</th>
          <th scope="col" role="columnheader" data-aui-table-cell-painted class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-center">Due</th>
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
          <col></col>
        </colgroup>
        <tbody role="rowgroup" class="aui-table-body">
          <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1001</td>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Mounting Bracket</td>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">A. Rivera</td>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">2026-03-02</td>
          </tr>
          <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1002</td>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Hex Bolt M8</td>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">K. Tanaka</td>
            <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">2026-03-09</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```
