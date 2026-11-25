# Class recipes: Tabs

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## tabs-closable
Use for: Page tabs the user can close: the label takes the free width, so the close button is at the far right edge of the tab.
You add: On click on the close button, remove the tab. Keep the label in its span.
```html
<div data-orientation="horizontal" class="aui-tabs aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none">
  <div data-orientation="horizontal" role="tablist" class="aui-tabs-list aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0">
    <div data-active data-orientation="horizontal" role="tab" tabindex="0" aria-selected="true" id="tabs-closable-1" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-overlay aui-elevation-0">
      <span class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-min-width-0 aui-flex-fill aui-overflow-hidden aui-white-space-nowrap aui-text-overflow-ellipsis">Parts</span>
      <button type="button" aria-label="Close Parts" class="aui-tabs-close-button aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-contained-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface-alt aui-elevation-0">
        <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
          <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-xmark" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
        </span>
      </button>
    </div>
    <div data-orientation="horizontal" role="tab" tabindex="-1" aria-selected="false" id="tabs-closable-2" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0">
      <span class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-min-width-0 aui-flex-fill aui-overflow-hidden aui-white-space-nowrap aui-text-overflow-ellipsis">P-1001</span>
      <button type="button" aria-label="Close P-1001" tabindex="-1" class="aui-tabs-close-button aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-contained-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface-alt aui-elevation-0">
        <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
          <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-xmark" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
        </span>
      </button>
    </div>
  </div>
</div>
```

## tabs
Use for: Views of the same thing; the first tab is active.
You add: Copy the block whole, panels included, and load aui/aui-behaviour.js in the page head: it moves focus with the arrow keys and switches on Enter, Space and click; without it nothing switches. The block is two tabs with their two panels, written the way the page needs them: every tab has aria-controls naming its panel, every panel has role="tabpanel" and aria-labelledby naming its tab, and every panel but the picked one takes the layout class aui-display-none (the hidden attribute does not hide a panel). A tab without its panel selects and shows nothing: for another tab copy one tab and one panel together with new ids (tab, panel and the two references). Change the text only; the panel holds the page content of that tab. The steps it must pass: references/standard/behaviour/tabs.md.
```html
<div data-orientation="horizontal" class="aui-tabs aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none">
  <div data-orientation="horizontal" role="tablist" class="aui-tabs-list aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0">
    <button type="button" data-active data-orientation="horizontal" aria-disabled="false" role="tab" aria-selected="true" id="tabs-tab-0" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-overlay aui-elevation-0" aria-controls="tabs-panel-0">BOM</button>
    <button type="button" data-orientation="horizontal" aria-disabled="false" tabindex="-1" role="tab" aria-selected="false" id="tabs-tab-1" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0" aria-controls="tabs-panel-1">Documents</button>
  </div>
  <div data-orientation="horizontal" id="tabs-panel-0" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface" aria-labelledby="tabs-tab-0">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">BOM content</span>
  </div>
  <div data-orientation="horizontal" id="tabs-panel-1" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-display-none" aria-labelledby="tabs-tab-1">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Documents content</span>
  </div>
</div>
```

## tabs-gapless
Use for: Tabs that touch in a row with space around it: tabs have no corners and their inset row keeps soft corners.
You add: Copy the block whole and load aui/aui-behaviour.js. The Tabs root sets shape none for its tabs; the inset tab row and list explicitly keep soft corners. The list is as wide as its tabs (aui-display-inline-flex), so tabs that keep a width scroll inside the row.
```html
<div data-orientation="horizontal" class="aui-tabs aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none">
  <div role="presentation" data-aui-tab-row="" class="aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-min-width-0 aui-flex-fill">
    <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
      <div data-orientation="horizontal" role="tablist" class="aui-tabs-list aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-0 aui-display-inline-flex aui-overflow-hidden">
        <button type="button" data-active="" data-orientation="horizontal" aria-disabled="false" role="tab" aria-selected="true" id="tabs-gapless-tab-0" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-overlay aui-elevation-0" aria-controls="tabs-gapless-panel-0">BOM</button>
        <button type="button" data-orientation="horizontal" aria-disabled="false" tabindex="-1" role="tab" aria-selected="false" id="tabs-gapless-tab-1" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface-alt aui-elevation-0" aria-controls="tabs-gapless-panel-1">Documents</button>
      </div>
    </div>
  </div>
  <div data-orientation="horizontal" id="tabs-gapless-panel-0" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface" aria-labelledby="tabs-gapless-tab-0">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">BOM content</span>
  </div>
  <div data-orientation="horizontal" id="tabs-gapless-panel-1" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-display-none" aria-labelledby="tabs-gapless-tab-1">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Documents content</span>
  </div>
</div>
```

## tabs-disabled
Use for: A tab that is unavailable beside enabled peer views: use its complete disabled class list and attributes.
You add: Load aui/aui-behaviour.js and keep every tab and panel id paired. The disabled tab cannot be selected. Disabled-tab behaviour is NOT CHECKED by the recorded tabs shape: add the behaviour line in GAPS.md as references/paths/build-standard.md says.
```html
<div data-orientation="horizontal" class="aui-tabs aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none">
  <div data-orientation="horizontal" role="tablist" class="aui-tabs-list aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0">
    <button type="button" data-active="" data-orientation="horizontal" aria-disabled="false" role="tab" aria-selected="true" id="tabs-disabled-tab-0" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-overlay aui-elevation-0" aria-controls="tabs-disabled-panel-0">BOM</button>
    <button type="button" data-orientation="horizontal" aria-disabled="false" tabindex="-1" role="tab" aria-selected="false" id="tabs-disabled-tab-1" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0" aria-controls="tabs-disabled-panel-1">Documents</button>
    <button type="button" data-disabled="" data-orientation="horizontal" aria-disabled="true" tabindex="-1" role="tab" aria-selected="false" id="tabs-disabled-tab-2" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-disabled aui-elevation-0" aria-controls="tabs-disabled-panel-2">Changes</button>
  </div>
  <div data-orientation="horizontal" id="tabs-disabled-panel-0" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface" aria-labelledby="tabs-disabled-tab-0">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">BOM content</span>
  </div>
  <div data-orientation="horizontal" id="tabs-disabled-panel-1" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-display-none" aria-labelledby="tabs-disabled-tab-1">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Documents content</span>
  </div>
  <div data-orientation="horizontal" id="tabs-disabled-panel-2" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-display-none" aria-labelledby="tabs-disabled-tab-2">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Changes content</span>
  </div>
</div>
```

## pane-tabs-header
Use for: A pane whose 28 px header band holds tabs instead of a title: each tab panel is the padded row of the pane and holds the body card.
You add: Keep the Tabs root around the page frame so the tab list in the header and the panels under it share one part. Keep data-aui-panes, data-aui-pane, data-aui-pane-header, data-aui-tab-row and data-aui-pane-body. Load aui/aui-behaviour.js, pair every tab with its panel by id, and hide each inactive panel with aui-display-none. The header pads the tab row 8 px at the sides (PN3) and the tabs fill its 28 px, so nothing is between the band and the tab row. The tab list sits in the tab row (data-aui-tab-row, a scroll area with only its viewport) and carries aui-display-inline-flex: it is as wide as its tabs, so a tab that keeps a width (aui-width-160) or a minimum width (aui-min-width-160) is never squeezed. Tabs that do not fit scroll sideways inside the row, with no bar, and the page never scrolls sideways. Keep the row and the list class for two tabs too, and never give the row a width or an overflow class. Each tab panel comes directly under the header as the row of the pane: it is padded 4 / 8, so the body card in it starts at the left edge of the tab row, 4 px under the header (PN6). The scroll area between the panel and the card has no padding and scrolls what is taller than the pane. Put the form, sections or text of a tab inside its card, which pads it 4 / 8 as in every pane. For a table, a tree or a drawing frame, copy pane-tabs-header-fill (recipes/tabs-fill.md) instead: its filling card is the only child of the panel. Never put a filling card inside this scroll area: it grows past the pane. This is the only padded tab panel: under a tab list that is not in a pane header the panel has no padding (the tabs recipe). Never put another padded box inside the panel, and never put a panel inside the card.
```html
<div data-orientation="horizontal" class="aui-tabs aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-min-height-0 aui-flex-fill">
  <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-min-height-0 aui-display-flex aui-flex-direction-row aui-flex-fill aui-overflow-hidden" data-aui-panes="page">
    <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-min-width-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" data-aui-pane="details">
      <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-min-height-28 aui-display-flex aui-flex-wrap-wrap aui-align-items-center aui-flex-none" data-aui-pane-header="">
        <div role="presentation" data-aui-tab-row="" class="aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-min-width-0 aui-flex-fill">
          <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
            <div data-orientation="horizontal" role="tablist" class="aui-tabs-list aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-display-inline-flex">
              <button type="button" data-active="" data-orientation="horizontal" aria-disabled="false" role="tab" aria-selected="true" id="pane-tabs-header-tab-0" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-overlay aui-elevation-0" aria-controls="pane-tabs-header-panel-0">BOM</button>
              <button type="button" data-orientation="horizontal" aria-disabled="false" tabindex="-1" role="tab" aria-selected="false" id="pane-tabs-header-tab-1" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0" aria-controls="pane-tabs-header-panel-1">Documents</button>
            </div>
          </div>
        </div>
      </div>
      <div data-orientation="horizontal" id="pane-tabs-header-panel-0" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" aria-labelledby="pane-tabs-header-tab-0">
        <div role="presentation" class="aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-min-height-0 aui-flex-fill" style="--aui-scrollbar-size: var(--p-px-8)">
          <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
            <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-display-flex aui-flex-direction-column aui-overflow-hidden" data-aui-pane-body="card">
              <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">BOM content</span>
            </div>
          </div>
        </div>
      </div>
      <div data-orientation="horizontal" id="pane-tabs-header-panel-1" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-display-none" aria-labelledby="pane-tabs-header-tab-1">
        <div role="presentation" class="aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-min-height-0 aui-flex-fill" style="--aui-scrollbar-size: var(--p-px-8)">
          <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
            <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-display-flex aui-flex-direction-column aui-overflow-hidden" data-aui-pane-body="card">
              <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Documents content</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```
