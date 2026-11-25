# Behaviour: Select

Recorded from the AtomicAUI 7.0.8 React part by the kit's behaviour build. Do not edit this page (AUI-13).
Your page must do the same, step for step: `node scripts/check-behaviour.mjs --url <address>` presses the same keys on it and fails on any difference.
The record is `select.json` beside this page. `aui/aui-behaviour.js` already does all of it for the class recipes; load it, or build the same in your own technology.

Recorded on: a field labelled "State" with the options 0 "Preliminary", 1 "In Review", 2 "Released", 3 "Superseded", 4 "Obsolete" (disabled); option 2 is picked.

## Elements at the start
| Element | A screen reader is given | Attributes | Tab stop |
|---|---|---|---|
| trigger | combobox "State" invalid=false focused=true hasPopup=listbox | aria-expanded="false" aria-haspopup="listbox" aria-labelledby="<label>" | yes |

## Steps, in order
| # | The user | Then |
|---|---|---|
| 1 | Focus trigger | focus is on **trigger** |
| 2 | Press Enter | focus moves to **option 2**; the layer opens on top of the page (left 0, top 8, width 0 px from the trigger); the page behind: does not scroll, stays live, is not covered; 6 element(s) appear: list, option 0, 1, 2, 3, 4 (table "Elements that appear"); trigger: aria-expanded false → true, reader: focused true → absent, data-popup-open absent → set, data-pressed absent → set, aria-controls absent → list, reader: expanded absent → true |
| 3 | Press ArrowDown | focus moves to **option 3**; option 2: tabindex 0 → -1, data-highlighted set → absent, reader: focused true → absent; option 3: tabindex -1 → 0, data-highlighted absent → set, reader: focused absent → true |
| 4 | Press ArrowDown | focus moves to **option 4**; option 3: tabindex 0 → -1, data-highlighted set → absent, reader: focused true → absent; option 4: tabindex -1 → 0, data-highlighted absent → set, reader: focused absent → true |
| 5 | Press ArrowDown | nothing changes |
| 6 | Press ArrowDown | nothing changes |
| 7 | Press ArrowDown | nothing changes |
| 8 | Press Home | focus moves to **option 0**; option 0: tabindex -1 → 0, data-highlighted absent → set, reader: focused absent → true; option 4: tabindex 0 → -1, data-highlighted set → absent, reader: focused true → absent |
| 9 | Press ArrowUp | nothing changes |
| 10 | Press End | focus moves to **option 4**; option 0: tabindex 0 → -1, data-highlighted set → absent, reader: focused true → absent; option 4: tabindex -1 → 0, data-highlighted absent → set, reader: focused absent → true |
| 11 | Wait a second | nothing changes |
| 12 | Type `p` | focus moves to **option 0**; option 0: tabindex -1 → 0, data-highlighted absent → set, reader: focused absent → true; option 4: tabindex 0 → -1, data-highlighted set → absent, reader: focused true → absent |
| 13 | Press Escape | focus moves to **trigger**; the layer closes; goes: list, option 0, 1, 2, 3, 4; trigger: aria-expanded true → false, data-popup-open set → absent, data-pressed set → absent, aria-controls list → absent, reader: expanded true → absent, reader: focused absent → true |
| 14 | Press ArrowDown | focus moves to **option 2**; the layer opens on top of the page (left 0, top 8, width 0 px from the trigger); the page behind: does not scroll, stays live, is not covered; the same elements appear as in step 2; trigger: aria-expanded false → true, reader: focused true → absent, data-popup-open absent → set, data-pressed absent → set, aria-controls absent → list, reader: expanded absent → true |
| 15 | Press ArrowUp | focus moves to **option 1**; option 1: tabindex -1 → 0, data-highlighted absent → set, reader: focused absent → true; option 2: tabindex 0 → -1, data-highlighted set → absent, reader: focused true → absent |
| 16 | Press Enter | focus moves to **trigger**; the layer closes; goes: list, option 0, 1, 2, 3, 4; trigger: aria-expanded true → false, data-popup-open set → absent, data-pressed set → absent, aria-controls list → absent, text Released → In Review, formValue Released → In Review, reader value Released → In Review, reader: expanded true → absent, reader: focused absent → true |
| 17 | Press Space | focus moves to **option 1**; the layer opens on top of the page (left 0, top 8, width 0 px from the trigger); the page behind: does not scroll, stays live, is not covered; the same elements appear as in step 14, except option 1: option "In Review" focused=true selected=true; aria-selected="true" data-selected data-highlighted; a tab stop / option 2: option "Released"; aria-selected="false"; not a tab stop; trigger: aria-expanded false → true, reader: focused true → absent, data-popup-open absent → set, data-pressed absent → set, aria-controls absent → list, reader: expanded absent → true |
| 18 | Press Tab | focus moves to **after the part**; the layer closes; goes: list, option 0, 1, 2, 3, 4; trigger: aria-expanded true → false, data-popup-open set → absent, data-pressed set → absent, aria-controls list → absent, reader: expanded true → absent |
| 19 | Focus trigger | focus moves to **trigger**; trigger: reader: focused absent → true |
| 20 | Press ArrowUp | focus moves to **option 1**; the layer opens on top of the page (left 0, top 8, width 0 px from the trigger); the page behind: does not scroll, stays live, is not covered; the same elements appear as in step 17; trigger: aria-expanded false → true, reader: focused true → absent, data-popup-open absent → set, data-pressed absent → set, aria-controls absent → list, reader: expanded absent → true |
| 21 | Press Shift+Tab | focus moves to **trigger**; the layer closes; goes: list, option 0, 1, 2, 3, 4; trigger: aria-expanded true → false, data-popup-open set → absent, data-pressed set → absent, aria-controls list → absent, reader: expanded true → absent, reader: focused absent → true |
| 22 | Focus trigger | nothing changes |
| 23 | Wait a second | nothing changes |
| 24 | Type `p` | trigger: text In Review → Preliminary, formValue In Review → Preliminary, reader value In Review → Preliminary |
| 25 | Click trigger | focus moves to **option 0**; the layer opens on top of the page (left 0, top 8, width 0 px from the trigger); the page behind: does not scroll, stays live, is not covered; the same elements appear as in step 20, except option 0: option "Preliminary" focused=true selected=true; aria-selected="true" data-selected data-highlighted; a tab stop / option 1: option "In Review"; aria-selected="false"; a tab stop; trigger: aria-expanded false → true, reader: focused true → absent, data-popup-open absent → set, data-pressed absent → set, aria-controls absent → list, reader: expanded absent → true *Not required at this step: parts > option 1 > tabindex. Here the React part leaves a second tab stop (tabindex 0) on the option that had focus when Shift+Tab closed the list earlier. It does so only after that Shift+Tab close followed by a letter typed while closed. A page keeps one tab stop, on the option that has focus.* |
| 26 | Click option 3 | focus moves to **trigger**; the layer closes; goes: list, option 0, 1, 2, 3, 4; trigger: aria-expanded true → false, data-popup-open set → absent, data-pressed set → absent, aria-controls list → absent, text Preliminary → Superseded, formValue Preliminary → Superseded, reader value Preliminary → Superseded, reader: expanded true → absent, reader: focused absent → true |
| 27 | Click trigger | focus moves to **option 1**; the layer opens on top of the page (left 0, top 8, width 0 px from the trigger); the page behind: does not scroll, stays live, is not covered; the same elements appear as in step 25, except option 0: option "Preliminary"; aria-selected="false"; not a tab stop / option 1: option "In Review" focused=true; aria-selected="false" data-highlighted; a tab stop / option 3: option "Superseded" selected=true; aria-selected="true" data-selected; not a tab stop; trigger: aria-expanded false → true, reader: focused true → absent, data-popup-open absent → set, data-pressed absent → set, aria-controls absent → list, reader: expanded absent → true *Not required. Here the React part opens the list on the option that had focus when Shift+Tab closed it earlier, not on the option picked since. It does so only after that Shift+Tab close followed by a letter typed while closed. A page opens it on the picked option.* |
| 28 | Click trigger | focus moves to **trigger**; the layer closes; goes: list, option 0, 1, 2, 3, 4; trigger: aria-expanded true → false, data-popup-open set → absent, data-pressed set → absent, aria-controls list → absent, reader: expanded true → absent, reader: focused absent → true |
| 29 | Click trigger | focus moves to **option 1**; the layer opens on top of the page (left 0, top 8, width 0 px from the trigger); the page behind: does not scroll, stays live, is not covered; the same elements appear as in step 27; trigger: aria-expanded false → true, reader: focused true → absent, data-popup-open absent → set, data-pressed absent → set, aria-controls absent → list, reader: expanded absent → true *Not required. Here the React part opens the list on the option that had focus when Shift+Tab closed it earlier, not on the option picked since. It does so only after that Shift+Tab close followed by a letter typed while closed. A page opens it on the picked option.* |
| 30 | Click outside the part | focus moves to **trigger**; the layer closes; goes: list, option 0, 1, 2, 3, 4; trigger: aria-expanded true → false, data-popup-open set → absent, data-pressed set → absent, aria-controls list → absent, reader: expanded true → absent, reader: focused absent → true |
| 31 | Press Enter | focus moves to **option 3**; the layer opens on top of the page (left 0, top 8, width 0 px from the trigger); the page behind: does not scroll, stays live, is not covered; the same elements appear as in step 29, except option 1: option "In Review"; aria-selected="false"; not a tab stop / option 3: option "Superseded" focused=true selected=true; aria-selected="true" data-selected data-highlighted; a tab stop; trigger: aria-expanded false → true, reader: focused true → absent, data-popup-open absent → set, data-pressed absent → set, aria-controls absent → list, reader: expanded absent → true |
| 32 | Press Home | focus moves to **option 0**; option 0: tabindex -1 → 0, data-highlighted absent → set, reader: focused absent → true; option 3: tabindex 0 → -1, data-highlighted set → absent, reader: focused true → absent |
| 33 | Press ArrowDown | focus moves to **option 1**; option 0: tabindex 0 → -1, data-highlighted set → absent, reader: focused true → absent; option 1: tabindex -1 → 0, data-highlighted absent → set, reader: focused absent → true |
| 34 | Press ArrowDown | focus moves to **option 2**; option 1: tabindex 0 → -1, data-highlighted set → absent, reader: focused true → absent; option 2: tabindex -1 → 0, data-highlighted absent → set, reader: focused absent → true |
| 35 | Press ArrowDown | focus moves to **option 3**; option 2: tabindex 0 → -1, data-highlighted set → absent, reader: focused true → absent; option 3: tabindex -1 → 0, data-highlighted absent → set, reader: focused absent → true |
| 36 | Press ArrowDown | focus moves to **option 4**; option 3: tabindex 0 → -1, data-highlighted set → absent, reader: focused true → absent; option 4: tabindex -1 → 0, data-highlighted absent → set, reader: focused absent → true |
| 37 | Press Enter | nothing changes |
| 38 | Press Space | nothing changes |
| 39 | Click option 4 | nothing changes |
| 40 | Press Home | focus moves to **option 0**; option 0: tabindex -1 → 0, data-highlighted absent → set, reader: focused absent → true; option 4: tabindex 0 → -1, data-highlighted set → absent, reader: focused true → absent |
| 41 | Wait a second | nothing changes |
| 42 | Type `o` | nothing changes |
| 43 | Press Escape | focus moves to **trigger**; the layer closes; goes: list, option 0, 1, 2, 3, 4; trigger: aria-expanded true → false, data-popup-open set → absent, data-pressed set → absent, aria-controls list → absent, reader: expanded true → absent, reader: focused absent → true |
| 44 | Wait a second | nothing changes |
| 45 | Type `o` | nothing changes |
| 46 | Focus trigger | nothing changes |
| 47 | Press Tab | focus moves to **after the part**; trigger: reader: focused true → absent |

## Elements that appear
As each one is the first time it appears. The steps say what changes after that.
| Element | First at step | A screen reader is given | Attributes | Tab stop |
|---|---|---|---|---|
| list | 2 | listbox "" orientation=vertical | none | no |
| option 0 | 2 | option "Preliminary" | aria-selected="false" | no |
| option 1 | 2 | option "In Review" | aria-selected="false" | no |
| option 2 | 2 | option "Released" focused=true selected=true | data-selected aria-selected="true" data-highlighted | yes |
| option 3 | 2 | option "Superseded" | aria-selected="false" | no |
| option 4 | 2 | option "Obsolete" disabled=true | data-disabled aria-disabled="true" aria-selected="false" | no |

## States
A state is a whole class list and its attributes. Switch between these lists as wholes; never add or drop one class.
| Element | When it carries | Class list |
|---|---|---|
| option | no state attribute or data-highlighted | `aui-color-text-surface aui-focus-color-info aui-focus-width-2 aui-frame aui-scale-default-sm aui-select-item aui-shape-none aui-stateful aui-typography-typescale-default` |
| option | data-selected data-highlighted or data-selected | `aui-color-solid-raised aui-focus-color-info aui-focus-width-2 aui-frame aui-scale-default-sm aui-select-item aui-shape-none aui-stateful aui-typography-typescale-default` |
| option | data-disabled or data-disabled data-highlighted | `aui-color-solid-disabled aui-focus-color-info aui-focus-width-2 aui-frame aui-scale-default-sm aui-select-item aui-shape-none aui-stateful aui-typography-typescale-default` |

## Other recorded shapes
The JSON record also holds these shapes. Where the real component is not present to ask, the check compares a page that has the same structure with them step for step; the page may use its own names and text.
| Shape | Steps |
|---|---:|
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo"; option 0 is picked | 20 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo"; option 1 is picked | 19 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie"; option 0 is picked | 21 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie"; option 1 is picked | 20 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie"; option 2 is picked | 21 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta"; option 0 is picked | 22 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta"; option 1 is picked | 21 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta"; option 2 is picked | 22 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta"; option 3 is picked | 22 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta", 4 "Echo"; option 0 is picked | 23 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta", 4 "Echo"; option 1 is picked | 22 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta", 4 "Echo"; option 2 is picked | 23 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta", 4 "Echo"; option 3 is picked | 23 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta", 4 "Echo"; option 4 is picked | 23 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta", 4 "Echo", 5 "Foxtrot"; option 0 is picked | 24 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta", 4 "Echo", 5 "Foxtrot"; option 1 is picked | 23 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta", 4 "Echo", 5 "Foxtrot"; option 2 is picked | 24 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta", 4 "Echo", 5 "Foxtrot"; option 3 is picked | 24 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta", 4 "Echo", 5 "Foxtrot"; option 4 is picked | 24 |
| a field labelled "Choice" with the options 0 "Alpha", 1 "Bravo", 2 "Charlie", 3 "Delta", 4 "Echo", 5 "Foxtrot"; option 5 is picked | 24 |
