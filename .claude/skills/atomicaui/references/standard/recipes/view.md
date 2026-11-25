# Class recipes: View and Type

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## view-panel
Use for: A panel or card frame on the page surface.
You add: nothing.
```html
<div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0">
  <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Content</span>
</div>
```

## view-row
Use for: Things side by side, one gap, centred.
You add: nothing.
```html
<div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-display-flex aui-align-items-center">
  <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">One</span>
  <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Two</span>
</div>
```

## view-stack
Use for: Blocks under each other in a panel: the stack owns the gap.
You add: nothing.
```html
<div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-fill aui-display-flex aui-flex-direction-column">
  <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">First block</span>
  <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Second block</span>
</div>
```

## view-toolbar
Use for: A row of actions: a labelled group (not role toolbar), over a panel or under the title. Padded like the panel beside it, so its first button starts where the panel text starts.
You add: nothing.
```html
<div class="aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface-alt aui-elevation-0 aui-gap-8 aui-display-flex aui-align-items-center aui-flex-none" aria-label="Actions" role="group">
  <button type="button" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-secondary aui-elevation-0">Search</button>
  <button type="button" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0">Clear</button>
</div>
```

## type-heading
Use for: A heading. It has no margin: the parent gap makes the space.
You add: nothing.
```html
<h2 class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-margin-0 aui-typography-typescale-l3" data-aui-typeface="engineering" data-aui-typography="body">Product structure</h2>
```

## view-filter-row
Use for: A filter or toolbar row that mixes labelled fields and buttons: aligned to its end (aui-align-items-end), so each button shares its bottom edge with the field box beside it, not the middle of the row (aui-align-items-center would centre it on the label too). Fields and buttons are direct children; Reset first, the main action last.
You add: nothing.
```html
<div class="aui-view aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-gap-8 aui-width-fill aui-display-flex aui-flex-wrap-wrap aui-align-items-end" aria-label="Filters" role="group">
  <div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3">
    <label id="view-filter-row-1" for="view-filter-row-2" class="aui-field-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface">Name contains</label>
    <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-field-control aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-elevation-0">
      <input id="view-filter-row-2" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-input aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0" name="name" aria-labelledby="view-filter-row-1">
    </div>
  </div>
  <div class="aui-field aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0 aui-gap-3">
    <label id="view-filter-row-3" for="view-filter-row-4" class="aui-field-label aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface">Status</label>
    <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-field-control aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-fixed-surface aui-frame--inset aui-elevation-0">
      <input id="view-filter-row-4" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-input aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0" name="status" aria-labelledby="view-filter-row-3">
    </div>
  </div>
  <button type="button" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0">Reset</button>
  <button type="button" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-button aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-secondary aui-elevation-0">Apply</button>
</div>
```

## accordion-sections
Use for: Sections that open and close in a pane: no corners, a 1 px divider above every section but the first.
You add: Toggle the panel on click of the section title.
```html
<div data-orientation="vertical" dir="ltr" class="aui-accordion">
  <div data-orientation="vertical" data-open class="aui-accordion-item aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0">
    <h3 data-orientation="vertical" data-open class="aui-accordion-header">
      <button type="button" data-value="one,two" data-orientation="vertical" data-panel-open aria-disabled="false" aria-controls="accordion-sections-1" aria-expanded="true" id="accordion-sections-2" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-accordion-trigger aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface">
        <span class="aui-accordion-trigger-content">
          <span>General</span>
        </span>
        <span aria-hidden="true" data-aui-rotate class="aui-accordion-chevron">
          <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-none">
            <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-chevron-down" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
          </span>
        </span>
      </button>
    </h3>
    <div data-orientation="vertical" data-open id="accordion-sections-1" aria-labelledby="accordion-sections-2" role="region" class="aui-accordion-panel aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface">
      <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">First section</span>
    </div>
  </div>
  <div data-orientation="vertical" data-open class="aui-accordion-item aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-solid-surface aui-elevation-0 aui-border-color-outlined aui-border-block-start-width-1 aui-border-style-solid">
    <h3 data-orientation="vertical" data-open class="aui-accordion-header">
      <button type="button" data-value="one,two" data-orientation="vertical" data-panel-open aria-disabled="false" aria-controls="accordion-sections-3" aria-expanded="true" id="accordion-sections-4" class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-accordion-trigger aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface">
        <span class="aui-accordion-trigger-content">
          <span>Relationships</span>
        </span>
        <span aria-hidden="true" data-aui-rotate class="aui-accordion-chevron">
          <span aria-hidden="true" class="aui-contained-icon aui-icon-lh-l3 aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-shape-none">
            <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-duotone fa-chevron-down" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
          </span>
        </span>
      </button>
    </h3>
    <div data-orientation="vertical" data-open id="accordion-sections-3" aria-labelledby="accordion-sections-4" role="region" class="aui-accordion-panel aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface">
      <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent" data-aui-typeface="engineering" data-aui-typography="body">Second section</span>
    </div>
  </div>
</div>
```

## message-banner
Use for: The result of a check or an action: passed, needs attention, failed.
You add: Nothing. Copy the block of the result you show: passed and needs attention are role="status", failed is role="alert". Its aria-label repeats the banner text: when you change the text, give the aria-label the same words. The text says the result; the colour never says it alone.
```html
<div role="status" aria-label="The design meets the criteria." data-aui-banner-color="success" data-aui-banner-scale="sm" class="aui-banner aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-success aui-elevation-0">
  <div class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-margin-0 aui-typography-typescale-l4 aui-banner-description" data-aui-typeface="engineering" data-aui-typography="body">The design meets the criteria.</div>
</div>
<div role="status" aria-label="The design was checked with default loads." data-aui-banner-color="warning" data-aui-banner-scale="sm" class="aui-banner aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-warning aui-elevation-0">
  <div class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-margin-0 aui-typography-typescale-l4 aui-banner-description" data-aui-typeface="engineering" data-aui-typography="body">The design was checked with default loads.</div>
</div>
<div role="alert" aria-label="The design does not meet the criteria." data-aui-banner-color="error" data-aui-banner-scale="sm" class="aui-banner aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-error aui-elevation-0">
  <div class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-margin-0 aui-typography-typescale-l4 aui-banner-description" data-aui-typeface="engineering" data-aui-typography="body">The design does not meet the criteria.</div>
</div>
```

## message-banner-with-icon
Use for: A message box whose source has an icon: the same result banners, a Font Awesome icon beside the text.
You add: Nothing. As message-banner, with its role and aria-label: passed is the first block, failed the second; needs attention is the warning block of message-banner with this icon slot first in it. The icon slot is the whole aui-banner-icon span with its <i>: change only the fa- name of the <i> to the icon the source shows, never a copied <svg> or <img>. Keep the span: without it the icon sits on its own row above the text.
```html
<div role="status" aria-label="The design meets the criteria." data-aui-banner-color="success" data-aui-banner-scale="sm" class="aui-banner aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-success aui-elevation-0">
  <span class="aui-contained-icon aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-banner-icon" aria-hidden="true">
    <i aria-hidden="true" class="aui-icon fa-duotone fa-circle-check" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
  </span>
  <div class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-margin-0 aui-typography-typescale-l4 aui-banner-description" data-aui-typeface="engineering" data-aui-typography="body">The design meets the criteria.</div>
</div>
<div role="alert" aria-label="The design does not meet the criteria." data-aui-banner-color="error" data-aui-banner-scale="sm" class="aui-banner aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-error aui-elevation-0">
  <span class="aui-contained-icon aui-bg-transparent aui-min-width-0 aui-min-height-0 aui-padding-inline-start-0 aui-padding-inline-end-0 aui-padding-block-start-0 aui-padding-block-end-0 aui-gap-0 aui-banner-icon" aria-hidden="true">
    <i aria-hidden="true" class="aui-icon fa-duotone fa-circle-exclamation" data-aui-icon-family="fa-7-pro" data-aui-icon-style="duotone"></i>
  </span>
  <div class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-margin-0 aui-typography-typescale-l4 aui-banner-description" data-aui-typeface="engineering" data-aui-typography="body">The design does not meet the criteria.</div>
</div>
```
