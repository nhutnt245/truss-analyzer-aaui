# Class recipes: Tabs in a pane header: a card that fills the panel

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## pane-tabs-header-fill
Use for: A pane whose header band holds tabs, for a tab that shows a table, a tree or a drawing frame: the card fills the panel; a table or a drawing frame scrolls inside its own frame, a tree inside the scroll area of tree-scroll.
You add: Everything pane-tabs-header (recipes/tabs.md) says about the Tabs root, the markers, the tab row and the padded panel. The card (data-aui-pane-body="fill") is the only child of each panel: no scroll area around it, and never a second box beside it. Below 768 px aui/aui-behaviour.js makes it as high as what it holds, 192 px at least. Replace the table with your table or drawing frame, or with the whole tree-scroll block (recipes/tree.md) for a tree. A table keeps what makes this one scroll inside the card with its header in place, as table-scroll does (recipes/table-wide.md): data-aui-min-inline-size, the style attribute with --aui-table-min-inline-size (128 px for each column, 48 px for a column of one icon button) and the aui-table-scroll-clip div around its header; without them the rows below the pane cannot be reached. The last column holds one icon button: aui-width-48 on its header cell, which has an aria-label and no text, and on every cell of the column; the cells are centred (aui-text-align-center).
```html
<div data-orientation="horizontal" class="aui-tabs aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-min-height-0 aui-flex-fill">
  <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-min-height-0 aui-display-flex aui-flex-direction-row aui-flex-fill aui-overflow-hidden" data-aui-panes="page">
    <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-min-width-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" data-aui-pane="details">
      <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-min-height-28 aui-display-flex aui-flex-wrap-wrap aui-align-items-center aui-flex-none" data-aui-pane-header="">
        <div role="presentation" data-aui-tab-row="" class="aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-min-width-0 aui-flex-fill">
          <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
            <div data-orientation="horizontal" role="tablist" class="aui-tabs-list aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-display-inline-flex">
              <button type="button" data-active="" data-orientation="horizontal" aria-disabled="false" role="tab" aria-selected="true" id="pane-tabs-header-fill-tab-0" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-overlay aui-elevation-0" aria-controls="pane-tabs-header-fill-panel-0">BOM</button>
              <button type="button" data-orientation="horizontal" aria-disabled="false" tabindex="-1" role="tab" aria-selected="false" id="pane-tabs-header-fill-tab-1" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tabs-tab aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0" aria-controls="pane-tabs-header-fill-panel-1">Documents</button>
            </div>
          </div>
        </div>
      </div>
      <div data-orientation="horizontal" id="pane-tabs-header-fill-panel-0" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" aria-labelledby="pane-tabs-header-fill-tab-0">
        <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-overflow-hidden" data-aui-pane-body="fill">
          <div aria-label="Parts" class="aui-table aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-border-color-outlined aui-border-block-start-width-1 aui-border-block-end-width-1 aui-border-inline-start-width-1 aui-border-inline-end-width-1 aui-gap-0 aui-min-height-0" role="table" data-aui-border="all-cells" data-aui-border-style="tonal" data-aui-selection-target="none" data-aui-a11y="table" data-aui-fit="fill" data-aui-scroll="self" data-aui-body-fit="content" data-aui-min-inline-size="" style="--aui-scrollbar-size: var(--p-px-8); --aui-table-min-inline-size: 304px">
            <div class="aui-table-scroll-clip">
              <table class="aui-table-scroll-fixed aui-table-scroll-header" role="presentation">
                <thead role="rowgroup" class="aui-table-head">
                  <tr data-aui-header-row="true" class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row="">
                    <th scope="col" role="columnheader" data-aui-table-cell-painted="" class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-left">Number</th>
                    <th scope="col" role="columnheader" data-aui-table-cell-painted="" class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-center">Name</th>
                    <th aria-label="Edit" scope="col" role="columnheader" data-aui-table-cell-painted="" class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-width-48 aui-text-align-center">
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div role="presentation" class="aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-display-flex aui-flex-direction-column aui-table-scroll-region" style="--aui-scrollbar-size: var(--p-px-8)">
              <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
                <table class="aui-table-scroll-body" role="presentation">
                  <colgroup data-aui-table-column-lock="">
                    <col>
                    <col>
                    <col>
                  </colgroup>
                  <tbody role="rowgroup" class="aui-table-body">
                    <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row="">
                      <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1001</td>
                      <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Mounting Bracket</td>
                      <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-48 aui-text-align-center">
                        <button type="button" aria-label="Edit P-1001" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0">
                          <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
                            <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-pen" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone">
                            </i>
                          </span>
                        </button>
                      </td>
                    </tr>
                    <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row="">
                      <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1002</td>
                      <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Hex Bolt M8</td>
                      <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-48 aui-text-align-center">
                        <button type="button" aria-label="Edit P-1002" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0">
                          <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
                            <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-pen" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone">
                            </i>
                          </span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div data-orientation="horizontal" id="pane-tabs-header-fill-panel-1" role="tabpanel" tabindex="0" class="aui-tabs-panel aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-display-none" aria-labelledby="pane-tabs-header-fill-tab-1">
        <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-overflow-hidden" data-aui-pane-body="fill">
          <div aria-label="Parts" class="aui-table aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-border-color-outlined aui-border-block-start-width-1 aui-border-block-end-width-1 aui-border-inline-start-width-1 aui-border-inline-end-width-1 aui-gap-0 aui-min-height-0" role="table" data-aui-border="all-cells" data-aui-border-style="tonal" data-aui-selection-target="none" data-aui-a11y="table" data-aui-fit="fill" data-aui-scroll="self" data-aui-body-fit="content" data-aui-min-inline-size="" style="--aui-scrollbar-size: var(--p-px-8); --aui-table-min-inline-size: 304px">
            <div class="aui-table-scroll-clip">
              <table class="aui-table-scroll-fixed aui-table-scroll-header" role="presentation">
                <thead role="rowgroup" class="aui-table-head">
                  <tr data-aui-header-row="true" class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row="">
                    <th scope="col" role="columnheader" data-aui-table-cell-painted="" class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-left">Number</th>
                    <th scope="col" role="columnheader" data-aui-table-cell-painted="" class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-text-align-center">Name</th>
                    <th aria-label="Edit" scope="col" role="columnheader" data-aui-table-cell-painted="" class="aui-table-header-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised aui-elevation-0 aui-width-48 aui-text-align-center">
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div role="presentation" class="aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-display-flex aui-flex-direction-column aui-table-scroll-region" style="--aui-scrollbar-size: var(--p-px-8)">
              <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
                <table class="aui-table-scroll-body" role="presentation">
                  <colgroup data-aui-table-column-lock="">
                    <col>
                    <col>
                    <col>
                  </colgroup>
                  <tbody role="rowgroup" class="aui-table-body">
                    <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row="">
                      <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1001</td>
                      <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Mounting Bracket</td>
                      <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-48 aui-text-align-center">
                        <button type="button" aria-label="Edit P-1001" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0">
                          <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
                            <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-pen" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone">
                            </i>
                          </span>
                        </button>
                      </td>
                    </tr>
                    <tr class="aui-table-row aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0" role="row" data-aui-table-row="">
                      <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-left">P-1002</td>
                      <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-text-align-center">Hex Bolt M8</td>
                      <td role="cell" class="aui-table-cell aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-48 aui-text-align-center">
                        <button type="button" aria-label="Edit P-1002" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0">
                          <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
                            <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-pen" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone">
                            </i>
                          </span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```
