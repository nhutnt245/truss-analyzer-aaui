# Class recipes: Paging bar under a table

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## table-paging
Use for: The paging bar under a table: previous, the range, next, and the closed page-size select at the far end. Copy it whole, the select included.
You add: Keep the bar whole: the two icon buttons keep their aria-label, the range text is "<first>-<last> of <total>", and the page-size control is the closed select (field-select look: a trigger with the value and a chevron, aria-label "Results per page"). Never replace it with a native select, an input or plain text. Previous is disabled on the first page and Next on the last. Without React the bar draws nothing by itself: your own script sets the range text and the disabled marks, and the select shows the closed look only (aui-behaviour.js opens a select that has aria-controls and a list: the select-open recipe in field.md, when the page size must be chosen from a list).
```html
<div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface-alt aui-elevation-0 aui-gap-8 aui-width-fill aui-display-flex aui-flex-wrap-wrap aui-align-items-center aui-flex-none" aria-label="Paging">
  <button type="button" data-disabled disabled aria-label="Previous page" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-disabled aui-elevation-0">
    <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
      <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-angle-left" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
    </span>
  </button>
  <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">1-10 of 42</span>
  <button type="button" aria-label="Next page" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0">
    <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
      <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-angle-right" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
    </span>
  </button>
  <div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-flex-fill"></div>
  <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Results per page</span>
  <button type="button" id="table-paging-1" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-label="Results per page" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-select-trigger aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-width-64">
    <span class="aui-select-value">10</span>
    <span aria-hidden="true" data-aui-rotate class="aui-select-chevron">
      <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0">
        <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-chevron-down" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
      </span>
    </span>
  </button>
</div>
```
