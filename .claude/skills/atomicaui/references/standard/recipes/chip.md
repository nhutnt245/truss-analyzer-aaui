# Class recipes: Chip

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## chip-status
Use for: The kind or state of a thing, as a small tag: solid, its colour by the data. A state whose tone neither the source nor its context gives is surface-alt, the library default. The one that is current is primary and tonal.
You add: Nothing. Pick the whole chip by the data; the text says the state, the colour never says it alone.
```html
<div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-display-flex aui-align-items-center">
  <span class="aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-success aui-elevation-0 aui-gap-4">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-chip-label" data-aui-typeface="engineering" data-aui-typography="body">Done</span>
  </span>
  <span class="aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-info aui-elevation-0 aui-gap-4">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-chip-label" data-aui-typeface="engineering" data-aui-typography="body">Info</span>
  </span>
  <span class="aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-warning aui-elevation-0 aui-gap-4">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-chip-label" data-aui-typeface="engineering" data-aui-typography="body">In progress</span>
  </span>
  <span class="aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-error aui-elevation-0 aui-gap-4">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-chip-label" data-aui-typeface="engineering" data-aui-typography="body">Failed</span>
  </span>
  <span class="aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0 aui-gap-4">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-chip-label" data-aui-typeface="engineering" data-aui-typography="body">Draft</span>
  </span>
  <span class="aui-chip aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-tonal-primary aui-frame--inset aui-elevation-0 aui-gap-4">
    <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-chip-label" data-aui-typeface="engineering" data-aui-typography="body">Current</span>
  </span>
</div>
```
