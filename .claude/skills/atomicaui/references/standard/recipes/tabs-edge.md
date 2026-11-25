# Class recipes: Tabs at the window edges

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## tabs-edge
Use for: A tab row that runs from edge to edge of the window, under an edge-to-edge top bar: the row has no corners; its tabs keep their gap and their soft corners.
You add: Copy the block whole and load aui/aui-behaviour.js. Put it where it spans the window, with no padded box around it: the tab row (data-aui-tab-row) carries aui-shape-none there, and its tabs start at the window edge, which the page-padding check allows for this row only. With space around the row copy pane-tabs-header or tabs-gapless from tabs.md, whose row is soft. The tab list carries aui-display-inline-flex: it is as wide as its tabs, so a tab that keeps a width (aui-width-160) or a minimum width (aui-min-width-160) is never squeezed. Tabs that do not fit scroll sideways inside the row, and the page does not. The panel has no padding, so what it holds starts at the window edge with the tabs: use this row over what spans the window (a table). A page of panes takes its tabs in a pane header: pane-tabs-header in tabs.md.
```html
<div data-orientation="horizontal" class="aui-tabs aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none">
  <div role="presentation" data-aui-tab-row="" class="aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-min-width-0 aui-flex-fill">
    <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
      <div data-orientation="horizontal" role="tablist" class="aui-tabs-list aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-display-inline-flex">
        <button type="button" data-active="" data-orientation="horizontal" aria-disabled="false" role="tab" aria-selected="true" id="tabs-edge-tab-0" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-overlay aui-elevation-0" aria-controls="tabs-edge-panel-0">BOM</button>
        <button type="button" data-orientation="horizontal" aria-disabled="false" tabindex="-1" role="tab" aria-selected="false" id="tabs-edge-tab-1" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0" aria-controls="tabs-edge-panel-1">Documents</button>
      </div>
    </div>
  </div>
  <div data-orientation="horizontal" id="tabs-edge-panel-0" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface" aria-labelledby="tabs-edge-tab-0">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">BOM content</span>
  </div>
  <div data-orientation="horizontal" id="tabs-edge-panel-1" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-display-none" aria-labelledby="tabs-edge-tab-1">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Documents content</span>
  </div>
</div>
```
