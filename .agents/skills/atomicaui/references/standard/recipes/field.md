# Class recipes: Field: Input and Select

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## field-input
Use for: One line of text with its label.
You add: nothing.
```html
<div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3" data-filled>
  <label id="field-input-1" for="field-input-2" class="aui-field-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface" data-filled>Name</label>
  <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-field-control aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-elevation-0" data-aui-filled>
    <input id="field-input-2" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-input aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0" value="Mounting Bracket" name="name" data-filled aria-labelledby="field-input-1">
  </div>
</div>
```

## field-input-readonly
Use for: The same field in a read-only page mode.
You add: nothing.
```html
<div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3" data-filled>
  <label id="field-input-readonly-1" for="field-input-readonly-2" class="aui-field-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface" data-filled>Number</label>
  <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-field-control aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-elevation-0" data-aui-filled>
    <input id="field-input-readonly-2" readonly class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-input aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0" value="P-1001" name="number" data-filled aria-labelledby="field-input-readonly-1">
  </div>
</div>
```

## field-select
Use for: Pick one of a list: the closed look alone. For a select that works use select-open.
You add: Nothing: this block is the look only.
```html
<div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3" data-filled>
  <label id="field-select-1" for="field-select-2" class="aui-field-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface" data-filled>State</label>
  <button type="button" id="field-select-2" role="combobox" aria-expanded="false" aria-haspopup="listbox" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-select-trigger aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-width-fill" data-filled aria-labelledby="field-select-1">
    <span class="aui-select-value">Released</span>
    <span aria-hidden="true" data-aui-rotate class="aui-select-chevron">
      <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0">
        <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-chevron-down" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
      </span>
    </span>
  </button>
</div>
```

## select-open
Use for: Pick one of a list, working: the trigger and its list, shown open with the third option picked and one option disabled.
You add: Write it closed, as references/standard/behaviour/reference.html does, and load aui/aui-behaviour.js: it opens, places and closes the list and moves focus. The steps it must pass: references/standard/behaviour/select.md.
Drawn over the page inside these layers, outermost first: `<div data-open data-side="bottom" data-align="center" role="presentation" data-aui-typeface="engineering" data-aui-typography="body" class="aui-select-positioner">`.
```html
<div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3" data-filled>
  <label id="select-open-1" for="select-open-2" class="aui-field-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface" data-filled>State</label>
  <button type="button" data-popup-open data-pressed id="select-open-2" role="combobox" aria-expanded="true" aria-haspopup="listbox" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-select-trigger aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-width-fill" data-filled aria-labelledby="select-open-1" data-popup-side="bottom" aria-controls="select-open-3">
    <span class="aui-select-value">Released</span>
    <span aria-hidden="true" data-aui-rotate class="aui-select-chevron">
      <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0">
        <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-chevron-down" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
      </span>
    </span>
  </button>
</div>
<div data-open data-side="bottom" data-align="center" tabindex="-1" role="presentation" class="aui-select-popup aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-4" data-aui-popup-motion="anchored" style="--aui-width: var(--anchor-width)">
  <div role="presentation">
    <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
      <div id="select-open-3" role="listbox" class="aui-select-list">
        <div role="option" aria-selected="false" tabindex="-1" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-select-item aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface">
          <div class="aui-select-item-text">Preliminary</div>
          <span aria-hidden="true" class="aui-select-item-indicator aui-frame aui-part aui-bg-transparent aui-scale-no-padding-sm">
            <svg class="aui-select-item-glyph" viewBox="0 0 16 16" focusable="false" width="1em" height="1em">
              <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </span>
        </div>
        <div role="option" aria-selected="false" tabindex="-1" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-select-item aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface">
          <div class="aui-select-item-text">In Review</div>
          <span aria-hidden="true" class="aui-select-item-indicator aui-frame aui-part aui-bg-transparent aui-scale-no-padding-sm">
            <svg class="aui-select-item-glyph" viewBox="0 0 16 16" focusable="false" width="1em" height="1em">
              <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </span>
        </div>
        <div data-selected role="option" aria-selected="true" tabindex="0" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-select-item aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-raised" data-highlighted>
          <div class="aui-select-item-text">Released</div>
          <span data-selected aria-hidden="true" class="aui-select-item-indicator aui-frame aui-part aui-bg-transparent aui-scale-no-padding-sm">
            <svg class="aui-select-item-glyph" viewBox="0 0 16 16" focusable="false" width="1em" height="1em">
              <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </span>
        </div>
        <div data-disabled role="option" aria-disabled="true" aria-selected="false" tabindex="-1" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-select-item aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-disabled">
          <div class="aui-select-item-text">Obsolete</div>
          <span aria-hidden="true" class="aui-select-item-indicator aui-frame aui-part aui-bg-transparent aui-scale-no-padding-sm">
            <svg class="aui-select-item-glyph" viewBox="0 0 16 16" focusable="false" width="1em" height="1em">
              <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
```

## field-date
Use for: A date: the browser's own date field with the AtomicAUI field look. Its input is 2 px taller than a text input, with the React parts too.
You add: Nothing. The browser gives the calendar, the keys and the date format of the user's own settings; the value posts as yyyy-mm-dd.
```html
<div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3" data-filled>
  <label id="field-date-1" for="field-date-2" class="aui-field-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface" data-filled>Effective date</label>
  <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-field-control aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-elevation-0" data-aui-filled>
    <input id="field-date-2" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-input aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0" type="date" value="2026-01-15" name="effective" data-filled aria-labelledby="field-date-1">
  </div>
</div>
```

## checkbox
Use for: Tick one or many: a 1 px outlined box, solid primary when ticked.
You add: Toggle the checked class on click and on Space. A box with a visible label (a form option such as "Needs calibration") is the first pair: the label sits beside the box in the same control row and the box has aria-labelledby with the id of its label, so the visible text is its name (restyle-compare finds the control by it); the for of the label points at no element in the class form, as in field-switch: leave it. A click on the text toggles the box: your own script, the same toggle as a click on the box. Copy the first pair whole and change the text; never give a labelled box an aria-label of its own: an aria-label is only for the table-row box ("Select row" here). A table row checkbox has no visible label: it is the last box here, its aria-label names its row ("Select Bench grinder"), and it is the same box.
```html
<div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-fill aui-display-flex aui-flex-direction-column">
  <div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3">
    <span class="aui-control-row">
      <span data-unchecked role="checkbox" tabindex="0" id="checkbox-1" aria-checked="false" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-checkbox aui-frame aui-scale-checkable-sm aui-typography-typescale-default aui-shape-soft aui-color-tonal-surface aui-frame--inset aui-elevation-0 aui-border-color-outlined" aria-labelledby="checkbox-2">
        <span data-unchecked aria-hidden="true" class="aui-checkbox-indicator"></span>
      </span>
      <label id="checkbox-2" for="checkbox-3" class="aui-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0">Accept the terms</label>
    </span>
  </div>
  <div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3" data-filled>
    <span class="aui-control-row">
      <span data-checked role="checkbox" tabindex="0" id="checkbox-4" aria-checked="true" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-checkbox aui-frame aui-scale-checkable-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-primary aui-elevation-0" data-filled aria-labelledby="checkbox-5">
        <span data-checked aria-hidden="true" class="aui-checkbox-indicator" data-filled>
          <span aria-hidden="true" class="aui-contained-icon aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0">
            <i aria-hidden="true" class="aui-icon fa-regular fa-check" data-aui-icon-family="fa-7-pro" data-aui-icon-style="monotone"></i>
          </span>
        </span>
      </span>
      <label id="checkbox-5" for="checkbox-6" class="aui-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0">Send me the news</label>
    </span>
  </div>
  <div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-display-flex aui-align-items-center">
    <span data-unchecked role="checkbox" tabindex="0" id="checkbox-7" aria-checked="false" aria-label="Select row" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-checkbox aui-frame aui-scale-checkable-sm aui-typography-typescale-default aui-shape-soft aui-color-tonal-surface aui-frame--inset aui-elevation-0 aui-border-color-outlined">
      <span data-unchecked aria-hidden="true" class="aui-checkbox-indicator"></span>
    </span>
  </div>
</div>
```
