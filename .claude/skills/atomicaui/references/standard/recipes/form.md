# Class recipes: Form fields: number with unit, error, radio, switch, textarea

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## field-number-unit
Use for: A number with its unit: the number ends at the unit, which sits inside the field.
You add: Nothing. Change the unit text and the value; the number stays end-aligned.
```html
<div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3" data-filled>
  <label id="field-number-unit-1" for="field-number-unit-2" class="aui-field-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface" data-filled>Length</label>
  <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-field-control aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-elevation-0" data-aui-filled>
    <input id="field-number-unit-2" inputmode="decimal" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-input aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-min-width-0 aui-text-align-end aui-flex-fill" value="120" name="length" data-filled aria-labelledby="field-number-unit-1">
    <span class="aui-number-field-unit aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface">mm</span>
  </div>
</div>
```

## field-error
Use for: A field that did not pass: the label and control as usual, and the error text under the control in the error colour.
You add: Show the error text only while the field is invalid, with role="alert", and set aria-invalid="true" on the input. The rule that decides is yours.
```html
<div data-invalid class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3">
  <label data-invalid id="field-error-1" for="field-error-2" class="aui-field-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface">Name</label>
  <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-field-control aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-elevation-0">
    <input data-invalid id="field-error-2" aria-invalid="true" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-input aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0" type="text" value name="name" aria-labelledby="field-error-1" aria-describedby="field-error-3">
  </div>
  <div data-invalid id="field-error-3" role="alert" class="aui-field-error aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-error">Name is required</div>
</div>
```

## field-radio
Use for: Pick one of a few, all visible, as round buttons with a label.
You add: Tick the radio that is picked and untick the others: the first radio here is an unticked one, the second the ticked one. Move the whole tick: the picked radio takes aria-checked="true", data-checked, the ticked class list and tabindex="0"; the others aria-checked="false", data-unchecked, the unticked class list and tabindex="-1" (the indicator inside takes the same data attribute). Each radio is a span, not a native input: the arrow keys that move the pick between the radios of a group, and a click on a label, are your own script.
```html
<div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3" data-filled>
  <label id="field-radio-1" for="field-radio-2" class="aui-field-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface" data-filled>Finish</label>
  <div role="radiogroup" aria-label="Finish" data-direction="column" class="aui-radio-group aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0" data-filled>
    <span class="aui-control-row">
      <span data-unchecked role="radio" tabindex="-1" aria-checked="false" id="field-radio-3" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-radio aui-frame aui-scale-checkable-sm aui-typography-typescale-default aui-shape-pill aui-color-tonal-surface aui-frame--inset aui-elevation-0 aui-border-color-outlined" data-filled aria-labelledby="field-radio-4">
        <span data-unchecked aria-hidden="true" class="aui-radio-indicator" data-filled></span>
      </span>
      <label id="field-radio-4" for="field-radio-5" class="aui-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0">Plain</label>
    </span>
    <span class="aui-control-row">
      <span data-checked role="radio" tabindex="0" aria-checked="true" id="field-radio-6" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-radio aui-frame aui-scale-checkable-sm aui-typography-typescale-default aui-shape-pill aui-color-solid-primary aui-elevation-0" data-filled aria-labelledby="field-radio-7">
        <span data-checked aria-hidden="true" class="aui-radio-indicator" data-filled></span>
      </span>
      <label id="field-radio-7" for="field-radio-8" class="aui-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0">Zinc plated</label>
    </span>
  </div>
</div>
```

## field-switch
Use for: An option that is on or off, with its label beside it: solid primary when on. It takes effect at once, or is saved with its form or dialog where the source screen has a switch; a choice the source shows as a checkbox stays a checkbox.
You add: Toggle on click and on Space: aria-checked, data-checked or data-unchecked, and data-filled (there when on, removed when off), on the switch and its thumb, and the whole class list of the new state: the first switch here is on, the second off. A switch that starts off is written from the second one, copied whole; never take the on switch and swap or drop its colour classes by hand (check-standard fails an altered class list, and a switch whose colour disagrees with its aria-checked, data-checked, data-unchecked or data-filled, thumb included). The switch is a span with tabindex="0", not a native button: it keeps the focus, and a click on its label is your own script.
```html
<div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-fill aui-display-flex aui-flex-direction-column">
  <div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3" data-filled>
    <span class="aui-control-row">
      <span data-checked role="switch" tabindex="0" id="field-switch-1" aria-checked="true" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-switch aui-frame aui-scale-switch-sm aui-typography-typescale-default aui-shape-pill aui-color-solid-primary aui-elevation-0" data-filled aria-labelledby="field-switch-2">
        <span data-checked class="aui-switch-thumb" data-filled></span>
      </span>
      <label id="field-switch-2" for="field-switch-3" class="aui-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0">Notify the owner</label>
    </span>
  </div>
  <div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3">
    <span class="aui-control-row">
      <span data-unchecked role="switch" tabindex="0" id="field-switch-4" aria-checked="false" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-switch aui-frame aui-scale-switch-sm aui-typography-typescale-default aui-shape-pill aui-color-solid-surface-alt aui-elevation-0" aria-labelledby="field-switch-5">
        <span data-unchecked class="aui-switch-thumb"></span>
      </span>
      <label id="field-switch-5" for="field-switch-6" class="aui-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0">Send a weekly digest</label>
    </span>
  </div>
</div>
```

## field-textarea
Use for: Several lines of text with its label: it spans both columns of a form grid when it is long.
You add: Nothing. The box grows with the text up to its height and scrolls inside after that.
```html
<div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3" data-filled>
  <label id="field-textarea-1" for="field-textarea-2" class="aui-field-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface" data-filled>Description</label>
  <div role="presentation" class="aui-view-scroll-area aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-elevation-0 aui-textarea-scroll" style="--aui-scrollbar-size: var(--p-px-8)">
    <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport" style="--aui-textarea-rows: 3">
      <textarea rows="3" id="field-textarea-2" name="description" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-textarea aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-elevation-0" data-filled aria-labelledby="field-textarea-1" style="--aui-textarea-rows: 3">Mounting bracket for the front frame, zinc plated, with two slotted holes.</textarea>
    </div>
  </div>
</div>
```
