# Class recipes: Panes and page layout

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## view-pane
Use for: A page area: the padded page frame holds framed panes; each pane has a 28 px header and a body.
You add: Layout only. Put the screen in the body. Never put text or controls outside a pane. Keep the three markers data-aui-panes, data-aui-pane and data-aui-pane-header: the layout check reads them. A page you restyle inside a layout you keep (a shared _Layout.cshtml with its own bar, container and footer) marks the frame data-aui-panes="page in-layout": its panes are then measured from the frame, 8 px at the sides and 4 px above and below, and the kept layout is not measured. A pane whose body holds tabs: the tab list and its panels go inside this body card, never in place of it. The card keeps its 4 px under the header and its 8 px at the sides, a tab panel (role="tabpanel") is not the card and paints nothing, and the table, form or cards in it start at the left edge of the tab row and end at its right edge. Below 768 px aui/aui-behaviour.js puts the panes in one column, full width, and the page scrolls: write the wide layout only. Never write the word stacked, a wrap class or a narrow width yourself.
```html
<div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-min-height-0 aui-display-flex aui-flex-direction-row aui-flex-fill aui-overflow-hidden" data-aui-panes="page">
  <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-min-width-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" data-aui-pane="parts">
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-height-28 aui-display-flex aui-align-items-center aui-flex-none" data-aui-pane-header>
      <h2 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-flex-fill aui-margin-0 aui-typography-typescale-l3" data-aui-typeface="engineering" data-aui-typography="body">Parts</h2>
    </div>
    <div role="presentation" class="aui-view-scroll-area aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-fill" style="--aui-scrollbar-size: var(--p-px-8)">
      <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
        <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-display-flex aui-flex-direction-column aui-overflow-hidden" data-aui-pane-body="card">
          <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Pane content</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

## panes-two
Use for: Two panes side by side: a narrow one (320) and the main one. The page frame gives 4 px above and below, 8 px at the sides and 6 px between.
You add: Layout only: no handle, no collapsing. Change the texts; keep every class list whole.
```html
<div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-min-height-0 aui-display-flex aui-flex-direction-row aui-flex-fill aui-overflow-hidden" data-aui-panes="page">
  <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-width-320 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-none" data-aui-pane="list">
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-height-28 aui-display-flex aui-align-items-center aui-flex-none" data-aui-pane-header>
      <h2 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-flex-fill aui-margin-0 aui-typography-typescale-l3" data-aui-typeface="engineering" data-aui-typography="body">Items</h2>
    </div>
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-fill">
      <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-overflow-hidden" data-aui-pane-body="fill">
        <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">List</span>
      </div>
    </div>
  </div>
  <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-min-width-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" data-aui-pane="details">
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-height-28 aui-display-flex aui-align-items-center aui-flex-none" data-aui-pane-header>
      <h2 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-flex-fill aui-margin-0 aui-typography-typescale-l3" data-aui-typeface="engineering" data-aui-typography="body">Details</h2>
    </div>
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-fill">
      <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-overflow-hidden" data-aui-pane-body="fill">
        <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Details</span>
      </div>
    </div>
  </div>
</div>
```

## panes-side-and-pair
Use for: A side pane beside a pair stacked one above the other: the pair is a nested group (a box that paints nothing) holding two panes.
You add: Layout only. The nested group has no marker of its own: its panes keep theirs.
```html
<div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-min-height-0 aui-display-flex aui-flex-direction-row aui-flex-fill aui-overflow-hidden" data-aui-panes="page">
  <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-width-320 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-none" data-aui-pane="side">
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-height-28 aui-display-flex aui-align-items-center aui-flex-none" data-aui-pane-header>
      <h2 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-flex-fill aui-margin-0 aui-typography-typescale-l3" data-aui-typeface="engineering" data-aui-typography="body">Filters</h2>
    </div>
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-fill">
      <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-overflow-hidden" data-aui-pane-body="fill">
        <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Filters</span>
      </div>
    </div>
  </div>
  <div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-min-width-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill">
    <div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" data-aui-panes="nested">
      <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-min-width-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" data-aui-pane="overview">
        <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-height-28 aui-display-flex aui-align-items-center aui-flex-none" data-aui-pane-header>
          <h2 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-flex-fill aui-margin-0 aui-typography-typescale-l3" data-aui-typeface="engineering" data-aui-typography="body">Overview</h2>
        </div>
        <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-fill">
          <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-overflow-hidden" data-aui-pane-body="fill">
            <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Overview</span>
          </div>
        </div>
      </div>
      <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-min-width-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" data-aui-pane="orders">
        <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-height-28 aui-display-flex aui-align-items-center aui-flex-none" data-aui-pane-header>
          <h2 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-flex-fill aui-margin-0 aui-typography-typescale-l3" data-aui-typeface="engineering" data-aui-typography="body">Orders</h2>
        </div>
        <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-fill">
          <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-gap-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill aui-overflow-hidden" data-aui-pane-body="fill">
            <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Orders</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## pane-labelled-header
Use for: A pane whose header holds labelled buttons or an icon control at its end: the header has no block padding, the actions are 6 px apart.
You add: Layout only. A header icon control is the 20 x 20 icon-button look of this recipe, never the plain icon button.
```html
<div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-min-height-0 aui-display-flex aui-flex-direction-row aui-flex-fill aui-overflow-hidden" data-aui-panes="page">
  <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-min-width-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" data-aui-pane="orders">
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-min-height-28 aui-display-flex aui-flex-wrap-wrap aui-align-items-center aui-flex-none" data-aui-pane-header>
      <h2 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-flex-auto aui-margin-0 aui-typography-typescale-l3" data-aui-typeface="engineering" data-aui-typography="body">Orders</h2>
      <div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-6 aui-height-28 aui-display-flex aui-align-items-center aui-justify-content-end aui-flex-auto">
        <button type="button" aria-label="Settings" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-contained-sm aui-typography-typescale-default aui-shape-soft aui-color-text-secondary aui-elevation-0">
          <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
            <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-gear" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
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

## pane-cards
Use for: Cards on the pane colour instead of one white body card: soft cards, 6 px apart.
You add: Layout only. Each card is its own soft box; never a divider element between them.
```html
<div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-min-height-0 aui-display-flex aui-flex-direction-row aui-flex-fill aui-overflow-hidden" data-aui-panes="page">
  <div class="aui-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface-alt aui-frame--inset aui-elevation-0 aui-gap-0 aui-min-width-0 aui-min-height-0 aui-display-flex aui-flex-direction-column aui-flex-fill" data-aui-pane="overview">
    <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-height-28 aui-display-flex aui-align-items-center aui-flex-none" data-aui-pane-header>
      <h2 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-flex-fill aui-margin-0 aui-typography-typescale-l3" data-aui-typeface="engineering" data-aui-typography="body">Overview</h2>
    </div>
    <div role="presentation" class="aui-view-scroll-area aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-fill aui-min-height-0 aui-display-flex aui-flex-fill" style="--aui-scrollbar-size: var(--p-px-8)">
      <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
        <div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-width-fill" data-aui-pane-body="cards">
          <div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-6 aui-width-fill aui-display-grid aui-grid-template-columns-2">
            <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-radius-start-start-soft aui-radius-start-end-soft aui-radius-end-start-soft aui-radius-end-end-soft aui-overflow-hidden">
              <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">First card</span>
            </div>
            <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-radius-start-start-soft aui-radius-start-end-soft aui-radius-end-start-soft aui-radius-end-end-soft aui-overflow-hidden">
              <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Second card</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

For tabs in the pane header, copy `pane-tabs-header` from `tabs.md` for a form, sections or text that scrolls with the pane, or `pane-tabs-header-fill` from `tabs-fill.md` for a table or drawing frame that scrolls inside its own frame, or a tree in the scroll area of `tree-scroll` (`tree.md`). Each tab panel is the padded row of the pane and holds the body card at the left edge of the tab row. Tabs that do not fit scroll sideways inside the tab row.
