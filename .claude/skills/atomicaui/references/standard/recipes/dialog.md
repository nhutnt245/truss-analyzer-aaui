# Class recipes: Dialog

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## dialog
Use for: A modal form or details: the open look.
You add: Write the two layers around it, closed, as references/standard/behaviour/reference.html does, and load aui/aui-behaviour.js: it opens and closes the dialog, keeps focus inside and gives it back. The steps it must pass: references/standard/behaviour/dialog.md. Copy every slot of the block: the title with its close button, the body and the actions. The close button in the title is part of the recipe even when a spec says "two buttons": those are the footer buttons, the title keeps its Close. Never write a script of your own that changes how it closes (the backdrop, Escape). A behaviour you changed or did not try is one line in GAPS.md.
Drawn over the page inside these layers, outermost first: `<div data-open role="presentation" data-aui-typeface="engineering" data-aui-typography="body" class="aui-dialog-backdrop">` then `<div data-open role="presentation" class="aui-dialog-viewport">`.
```html
<div data-open id="dialog-1" role="dialog" tabindex="-1" data-aui-typeface="engineering" data-aui-typography="body" class="aui-dialog-popup aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-4" aria-labelledby="dialog-2" aria-describedby="dialog-3">
  <h2 id="dialog-2" class="aui-dialog-title aui-frame aui-typography-typescale-default aui-color-solid-surface-alt aui-scale-default-sm">
    Promote Part
    <div class="aui-dialog-spacer"></div>
    <button type="button" aria-label="Close" class="aui-dialog-close aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-contained-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface-alt aui-elevation-0">
      <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
        <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-xmark" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
      </span>
    </button>
  </h2>
  <p id="dialog-3" class="aui-dialog-description aui-frame aui-typography-typescale-default aui-scale-default-sm">Choose the next state.</p>
  <div class="aui-dialog-body aui-frame aui-typography-typescale-default aui-scale-no-padding-sm">
    <div role="presentation" class="aui-view-scroll-area aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-dialog-body-scroll" style="--aui-scrollbar-size: var(--p-px-8)">
      <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
        <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Content</span>
      </div>
    </div>
  </div>
  <div data-align="end" class="aui-dialog-actions aui-frame aui-typography-typescale-default aui-scale-default-sm">
    <button type="button" class="aui-dialog-button aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0">Cancel</button>
    <button type="button" class="aui-dialog-button aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-secondary aui-elevation-0">Promote</button>
  </div>
</div>
```
