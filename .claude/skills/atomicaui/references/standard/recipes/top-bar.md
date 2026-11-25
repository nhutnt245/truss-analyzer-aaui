# Class recipes: Top bar

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## top-bar-edge
Use for: A top bar that runs from edge to edge of the window: only the bar loses its corners; its buttons stay soft.
You add: The bar is 36 px high (PN11). Copy its whole class list. At the window edges its four radius classes are none; never replace its shape class with aui-shape-none, which would also square its buttons.
```html
<div data-orientation="horizontal" data-modal role="menubar" id="top-bar-edge-1" aria-orientation="horizontal" class="aui-menubar aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-raised aui-radius-start-start-none aui-radius-start-end-none aui-radius-end-start-none aui-radius-end-end-none aui-flex-none">
  <button type="button" aria-label="Navigation" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-raised aui-elevation-0">
    <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
      <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-bars" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
    </span>
  </button>
  <div class="aui-menubar-spacer"></div>
  <button type="button" aria-label="Toggle theme" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-raised aui-elevation-0">
    <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
      <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-moon" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
    </span>
  </button>
</div>
```

## top-bar-inset
Use for: A top bar with space around it: the bar and its buttons keep their soft corners.
You add: Copy the whole class list when the bar has space around it. Keep the default soft radius and do not add radius-none classes.
```html
<div data-orientation="horizontal" data-modal role="menubar" id="top-bar-inset-1" aria-orientation="horizontal" class="aui-menubar aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-raised aui-flex-none">
  <button type="button" aria-label="Navigation" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-raised aui-elevation-0">
    <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
      <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-bars" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
    </span>
  </button>
  <div class="aui-menubar-spacer"></div>
  <button type="button" aria-label="Toggle theme" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-raised aui-elevation-0">
    <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
      <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-moon" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
    </span>
  </button>
</div>
```

## top-bar-links
Use for: Two or more page links in a top bar. Each link keeps its address and role; the current page is marked without changing its look.
You add: Keep each link as an <a href role="link"> with the whole link class list. Give exactly the current page aria-current="page". The edge-to-edge bar has square corners only on itself; its buttons stay soft. A bar with space around it keeps these links and takes the bar class list of top-bar-inset. This block has no narrow form: the React NavLinks folds the links into a "Menu" below 768 px (references/recipes/app-frame.md) and this block does not, so a bar with many links can run wider than a 390 px window (GAPS.md).
```html
<div data-orientation="horizontal" data-modal role="menubar" id="top-bar-links-1" aria-orientation="horizontal" class="aui-menubar aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-raised aui-radius-start-start-none aui-radius-start-end-none aui-radius-end-start-none aui-radius-end-end-none aui-flex-none">
  <nav class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-4 aui-display-flex aui-align-items-center aui-flex-none" aria-label="Main">
    <a href="#/orders" role="link" aria-current="page" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-raised aui-elevation-0 aui-text-decoration-none">Orders</a>
    <a href="#/customers" role="link" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-raised aui-elevation-0 aui-text-decoration-none">Customers</a>
  </nav>
  <div class="aui-menubar-spacer"></div>
  <button type="button" aria-label="Toggle theme" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-square-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-raised aui-elevation-0">
    <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-soft">
      <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-moon" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
    </span>
  </button>
</div>
```
