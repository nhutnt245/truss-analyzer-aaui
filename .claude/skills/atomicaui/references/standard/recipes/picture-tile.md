# Class recipes: Picture placeholder in a table cell

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## table-picture-tile
Use for: A picture placeholder in a table cell (the spec's grey square, no picture file): a plain 32 by 32 surface-alt tile with a soft corner.
You add: It is a placeholder: a real picture is the app's, and one line in GAPS.md.
```html
<div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0 aui-width-32 aui-height-32" aria-hidden="true"></div>
```
