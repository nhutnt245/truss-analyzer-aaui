# Class recipes: Button and IconButton

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## button-default
Use for: An ordinary action.
You add: nothing.
```html
<button type="button" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0">Cancel</button>
```

## button-main
Use for: The one main action of a bar or dialog.
You add: nothing.
```html
<button type="button" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-secondary aui-elevation-0">Save</button>
```

## button-quiet
Use for: A quiet action in a list or menu.
You add: nothing.
```html
<button type="button" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface-alt aui-elevation-0">Parts</button>
```

## button-disabled
Use for: An action that is not available.
You add: nothing.
```html
<button type="button" data-disabled disabled class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-disabled aui-elevation-0">Promote</button>
```

## icon-button
Use for: An action with only an icon. The aria-label is required.
You add: nothing.
```html
<button type="button" aria-label="Settings" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0">
  <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
    <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-gear" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
  </span>
</button>
```
