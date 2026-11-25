# Class recipes: Cards and loading: section card, card grid, loading block

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## section-card
Use for: A card on the pane colour with a heading and its content in one column: a section of an overview.
You add: Nothing. Keep the group named by its heading (aria-labelledby on the card, the id on the heading).
```html
<div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-radius-start-start-soft aui-radius-start-end-soft aui-radius-end-start-soft aui-radius-end-end-soft aui-overflow-hidden" aria-labelledby="section-card-1" role="group">
  <div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-fill aui-display-flex aui-flex-direction-column">
    <h3 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-margin-0 aui-typography-typescale-l4" data-aui-typeface="engineering" data-aui-typography="body" id="section-card-1">Part</h3>
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-typescale-p3" data-aui-typeface="engineering" data-aui-typography="body">Mounting Bracket</span>
  </div>
</div>
```

## card-grid
Use for: Section cards side by side, 6 px apart both ways: at most two columns from 920 wide, three from 1376 (86 rem), one below. The number of columns follows the number of cards, so the rows are even: four cards are two and two, five are three and two.
You add: Layout only. Without a script a page cannot count its own width: set the column class by the width you expect (aui-grid-template-columns-3), or give aui-grid-template-columns-auto-fit, which fits as many columns of at least 320 px as the width holds.
```html
<div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-6 aui-width-fill aui-display-grid aui-grid-template-columns-2" aria-label="Cards" role="group">
  <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-radius-start-start-soft aui-radius-start-end-soft aui-radius-end-start-soft aui-radius-end-end-soft aui-overflow-hidden" aria-labelledby="card-grid-1" role="group">
    <div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-fill aui-display-flex aui-flex-direction-column">
      <h3 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-margin-0 aui-typography-typescale-l4" data-aui-typeface="engineering" data-aui-typography="body" id="card-grid-1">Part</h3>
      <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-typescale-p3" data-aui-typeface="engineering" data-aui-typography="body">Mounting Bracket</span>
    </div>
  </div>
  <div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-radius-start-start-soft aui-radius-start-end-soft aui-radius-end-start-soft aui-radius-end-end-soft aui-overflow-hidden" aria-labelledby="card-grid-2" role="group">
    <div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-fill aui-display-flex aui-flex-direction-column">
      <h3 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-margin-0 aui-typography-typescale-l4" data-aui-typeface="engineering" data-aui-typography="body" id="card-grid-2">Release</h3>
      <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-typescale-p3" data-aui-typeface="engineering" data-aui-typography="body">In Review</span>
    </div>
  </div>
</div>
```

## loading-block
Use for: Something is loading: a small spinner with a name, centred in a block that is at least 128 high.
You add: Show it in place of the content while loading, and take it away when the content is there. aria-busy on the block; the spinner keeps its label.
```html
<div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-fill aui-min-height-128 aui-display-flex aui-flex-direction-column aui-align-items-center aui-justify-content-center aui-flex-fill" aria-busy="true">
  <span role="status" aria-live="polite" data-indeterminate aria-label="Loading rows" class="aui-spinner aui-contained-icon aui-bg-transparent aui-scale-spinner-sm">
    <svg class="aui-spinner-ring" viewBox="0 0 24 24" aria-hidden="true">
      <circle class="aui-spinner-ring-track" cx="12" cy="12" r="10"></circle>
      <circle class="aui-spinner-ring-value" cx="12" cy="12" r="10"></circle>
    </svg>
  </span>
</div>
```
