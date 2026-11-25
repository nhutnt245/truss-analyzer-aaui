# Behaviour: Tabs

Recorded from the AtomicAUI 7.0.8 React part by the kit's behaviour build. Do not edit this page (AUI-13).
Your page must do the same, step for step: `node scripts/check-behaviour.mjs --url <address>` presses the same keys on it and fails on any difference.
The record is `tabs.json` beside this page. `aui/aui-behaviour.js` already does all of it for the class recipes; load it, or build the same in your own technology.

Recorded on: the tabs 0 "BOM", 1 "Documents", 2 "Changes"; tab 0 is picked.

## Elements at the start
| Element | A screen reader is given | Attributes | Tab stop |
|---|---|---|---|
| list | tablist "" orientation=horizontal | data-orientation="horizontal" | no |
| tab 0 | tab "BOM" invalid=false focused=true selected=true | data-active data-orientation="horizontal" aria-disabled="false" aria-selected="true" aria-controls="panel 0" | yes |
| tab 1 | tab "Documents" invalid=false | data-orientation="horizontal" aria-disabled="false" aria-selected="false" | no |
| tab 2 | tab "Changes" invalid=false | data-orientation="horizontal" aria-disabled="false" aria-selected="false" | no |
| panel 0 | tabpanel "BOM" | data-orientation="horizontal" aria-labelledby="tab 0" | yes |

## Steps, in order
| # | The user | Then |
|---|---|---|
| 1 | Focus tab 0 | focus is on **tab 0** |
| 2 | Press ArrowRight | focus moves to **tab 1**; tab 0: tabindex 0 → -1, reader: focused true → absent; tab 1: tabindex -1 → 0, reader: focused absent → true |
| 3 | Press ArrowRight | focus moves to **tab 2**; tab 1: tabindex 0 → -1, reader: focused true → absent; tab 2: tabindex -1 → 0, reader: focused absent → true |
| 4 | Press ArrowRight | focus moves to **tab 0**; tab 0: tabindex -1 → 0, reader: focused absent → true; tab 2: tabindex 0 → -1, reader: focused true → absent |
| 5 | Press ArrowLeft | focus moves to **tab 2**; tab 0: tabindex 0 → -1, reader: focused true → absent; tab 2: tabindex -1 → 0, reader: focused absent → true |
| 6 | Press Home | focus moves to **tab 0**; tab 0: tabindex -1 → 0, reader: focused absent → true; tab 2: tabindex 0 → -1, reader: focused true → absent |
| 7 | Press End | focus moves to **tab 2**; tab 0: tabindex 0 → -1, reader: focused true → absent; tab 2: tabindex -1 → 0, reader: focused absent → true |
| 8 | Press ArrowDown | nothing changes |
| 9 | Press ArrowUp | nothing changes |
| 10 | Press Enter | tab 0: data-active set → absent, aria-selected true → false, aria-controls panel 0 → absent, reader: selected true → absent, class list changes (see States); tab 2: aria-selected false → true, data-active absent → set, aria-controls absent → panel 0, reader: selected absent → true, class list changes (see States); panel 0: aria-labelledby tab 0 → tab 2, reader name BOM → Changes |
| 11 | Press Tab | focus moves to **panel 0**; tab 2: reader: focused true → absent; panel 0: reader: focused absent → true |
| 12 | Press Shift+Tab | focus moves to **tab 2**; tab 2: reader: focused absent → true; panel 0: reader: focused true → absent |
| 13 | Press ArrowLeft | focus moves to **tab 1**; tab 1: tabindex -1 → 0, reader: focused absent → true; tab 2: tabindex 0 → -1, reader: focused true → absent |
| 14 | Press Space | tab 1: aria-selected false → true, data-active absent → set, aria-controls absent → panel 0, reader: selected absent → true, class list changes (see States); tab 2: aria-selected true → false, data-active set → absent, aria-controls panel 0 → absent, reader: selected true → absent, class list changes (see States); panel 0: aria-labelledby tab 2 → tab 1, reader name Changes → Documents |
| 15 | Press ArrowRight | focus moves to **tab 2**; tab 1: tabindex 0 → -1, reader: focused true → absent; tab 2: tabindex -1 → 0, reader: focused absent → true |
| 16 | Press Tab | focus moves to **panel 0**; tab 2: reader: focused true → absent; panel 0: reader: focused absent → true |
| 17 | Press Shift+Tab | focus moves to **tab 2**; tab 2: reader: focused absent → true; panel 0: reader: focused true → absent |
| 18 | Click tab 1 | focus moves to **tab 1**; tab 1: tabindex -1 → 0, reader: focused absent → true; tab 2: tabindex 0 → -1, reader: focused true → absent |
| 19 | Click tab 0 | focus moves to **tab 0**; tab 0: tabindex -1 → 0, aria-selected false → true, data-active absent → set, aria-controls absent → panel 0, reader: focused absent → true, reader: selected absent → true, class list changes (see States); tab 1: tabindex 0 → -1, aria-selected true → false, data-active set → absent, aria-controls panel 0 → absent, reader: focused true → absent, reader: selected true → absent, class list changes (see States); panel 0: aria-labelledby tab 1 → tab 0, reader name Documents → BOM |
| 20 | Press Tab | focus moves to **panel 0**; tab 0: reader: focused true → absent; panel 0: reader: focused absent → true |
| 21 | Press Tab | focus moves to **after the part**; panel 0: reader: focused true → absent |

## States
A state is a whole class list and its attributes. Switch between these lists as wholes; never add or drop one class.
| Element | When it carries | Class list |
|---|---|---|
| tab | data-active data-orientation="horizontal" or data-orientation="horizontal" data-active | `aui-color-solid-overlay aui-elevation-0 aui-focus-color-info aui-focus-width-2 aui-frame aui-scale-default-sm aui-shape-soft aui-stateful aui-tabs-tab aui-typography-typescale-default` |
| tab | data-orientation="horizontal" | `aui-color-solid-surface-alt aui-elevation-0 aui-focus-color-info aui-focus-width-2 aui-frame aui-scale-default-sm aui-shape-soft aui-stateful aui-tabs-tab aui-typography-typescale-default` |
