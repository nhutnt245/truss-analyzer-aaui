# Behaviour: Dialog

Recorded from the AtomicAUI 7.0.8 React part by the kit's behaviour build. Do not edit this page (AUI-13).
Your page must do the same, step for step: `node scripts/check-behaviour.mjs --url <address>` presses the same keys on it and fails on any difference.
The record is `dialog.json` beside this page. `aui/aui-behaviour.js` already does all of it for the class recipes; load it, or build the same in your own technology.

Recorded on: a button "Promote" that opens a dialog titled "Promote Part" with a close button, the text "Choose the next state.", 1 text field(s) and the buttons "Cancel", "Promote".

## Elements at the start
| Element | A screen reader is given | Attributes | Tab stop |
|---|---|---|---|
| opener | button "Promote" invalid=false focused=true | none | yes |

## Steps, in order
| # | The user | Then |
|---|---|---|
| 1 | Focus opener | focus is on **opener** |
| 2 | Press Enter | focus moves to **item 0**; the layer opens on top of the page (left 0, top 0 px from the centre of the window); the page behind: does not scroll, is inert, is covered; 7 element(s) appear: dialog, title, description, item 0, 1, 2, 3 (table "Elements that appear"); opener: reader role button → absent, reader name Promote → absent, reader: invalid false → absent, reader: focused true → absent, reader hidden absent → true |
| 3 | Press Tab | focus moves to **item 1**; item 0: reader: focused true → absent; item 1: reader: focused absent → true |
| 4 | Press Tab | focus moves to **item 2**; item 1: reader: focused true → absent; item 2: reader: focused absent → true |
| 5 | Press Tab | focus moves to **item 3**; item 2: reader: focused true → absent; item 3: reader: focused absent → true |
| 6 | Press Tab | focus moves to **item 0**; item 0: reader: focused absent → true; item 3: reader: focused true → absent |
| 7 | Press Tab | focus moves to **item 1**; item 0: reader: focused true → absent; item 1: reader: focused absent → true |
| 8 | Press Shift+Tab | focus moves to **item 0**; item 0: reader: focused absent → true; item 1: reader: focused true → absent |
| 9 | Press Shift+Tab | focus moves to **item 3**; item 0: reader: focused true → absent; item 3: reader: focused absent → true |
| 10 | Press Escape | focus moves to **opener**; the layer closes; goes: dialog, title, description, item 0, 1, 2, 3; opener: reader hidden true → absent, reader role absent → button, reader name absent → Promote, reader: invalid absent → false, reader: focused absent → true |
| 11 | Press Space | focus moves to **item 0**; the layer opens on top of the page (left 0, top 0 px from the centre of the window); the page behind: does not scroll, is inert, is covered; the same elements appear as in step 2; opener: reader role button → absent, reader name Promote → absent, reader: invalid false → absent, reader: focused true → absent, reader hidden absent → true |
| 12 | Click item 0 | focus moves to **opener**; the layer closes; goes: dialog, title, description, item 0, 1, 2, 3; opener: reader hidden true → absent, reader role absent → button, reader name absent → Promote, reader: invalid absent → false, reader: focused absent → true |
| 13 | Press Enter | focus moves to **item 0**; the layer opens on top of the page (left 0, top 0 px from the centre of the window); the page behind: does not scroll, is inert, is covered; the same elements appear as in step 11; opener: reader role button → absent, reader name Promote → absent, reader: invalid false → absent, reader: focused true → absent, reader hidden absent → true |
| 14 | Click item 3 | focus moves to **opener**; the layer closes; goes: dialog, title, description, item 0, 1, 2, 3; opener: reader hidden true → absent, reader role absent → button, reader name absent → Promote, reader: invalid absent → false, reader: focused absent → true |
| 15 | Press Enter | focus moves to **item 0**; the layer opens on top of the page (left 0, top 0 px from the centre of the window); the page behind: does not scroll, is inert, is covered; the same elements appear as in step 13; opener: reader role button → absent, reader name Promote → absent, reader: invalid false → absent, reader: focused true → absent, reader hidden absent → true |
| 16 | Click description | focus moves to **dialog**; dialog: reader: focused absent → true; item 0: reader: focused true → absent |
| 17 | Press Tab | focus moves to **item 0**; dialog: reader: focused true → absent; item 0: reader: focused absent → true |
| 18 | Click outside the part | focus moves to **opener**; the layer closes; goes: dialog, title, description, item 0, 1, 2, 3; opener: reader hidden true → absent, reader role absent → button, reader name absent → Promote, reader: invalid absent → false, reader: focused absent → true |
| 19 | Click opener | focus moves to **item 0**; the layer opens on top of the page (left 0, top 0 px from the centre of the window); the page behind: does not scroll, is inert, is covered; the same elements appear as in step 15; opener: reader role button → absent, reader name Promote → absent, reader: invalid false → absent, reader: focused true → absent, reader hidden absent → true |
| 20 | Press Tab | focus moves to **item 1**; item 0: reader: focused true → absent; item 1: reader: focused absent → true |
| 21 | Press Escape | focus moves to **opener**; the layer closes; goes: dialog, title, description, item 0, 1, 2, 3; opener: reader hidden true → absent, reader role absent → button, reader name absent → Promote, reader: invalid absent → false, reader: focused absent → true |
| 22 | Press Tab | focus moves to **after the part**; opener: reader: focused true → absent |

## Elements that appear
As each one is the first time it appears. The steps say what changes after that.
| Element | First at step | A screen reader is given | Attributes | Tab stop |
|---|---|---|---|---|
| dialog | 2 | dialog "Promote Part Close" | data-open aria-labelledby="title" aria-describedby="description" | no |
| title | 2 | heading "Promote Part Close" level=2 | none | no |
| description | 2 | paragraph "" | none | no |
| item 0 | 2 | button "Close" invalid=false focused=true | aria-label="Close" | yes |
| item 1 | 2 | textbox "Comment" invalid=false | aria-labelledby="<label>" | yes |
| item 2 | 2 | button "Cancel" invalid=false | none | yes |
| item 3 | 2 | button "Promote" invalid=false | none | yes |

## States
A state is a whole class list and its attributes. Switch between these lists as wholes; never add or drop one class.
| Element | When it carries | Class list |
|---|---|---|
| item | no state attribute | `aui-button aui-color-text-surface-alt aui-dialog-close aui-elevation-0 aui-focus-color-info aui-focus-width-2 aui-frame aui-scale-contained-sm aui-shape-soft aui-stateful aui-typography-typescale-default` |
| item | no state attribute | `aui-color-text-surface aui-elevation-0 aui-focus-color-info aui-focus-width-2 aui-frame aui-input aui-scale-no-padding-sm aui-shape-none aui-stateful aui-typography-typescale-default` |
| item | no state attribute | `aui-button aui-color-solid-surface-alt aui-dialog-button aui-elevation-0 aui-focus-color-info aui-focus-width-2 aui-frame aui-scale-default-sm aui-shape-soft aui-stateful aui-typography-typescale-default` |
| item | no state attribute | `aui-button aui-color-solid-secondary aui-dialog-button aui-elevation-0 aui-focus-color-info aui-focus-width-2 aui-frame aui-scale-default-sm aui-shape-soft aui-stateful aui-typography-typescale-default` |

## Other recorded shapes
The JSON record also holds these shapes. Where the real component is not present to ask, the check compares a page that has the same structure with them step for step; the page may use its own names and text.
| Shape | Steps |
|---|---:|
| a button "Submit" that opens a dialog titled "Submit for review" with a close button, the text "Submit this part for review?", 0 text field(s) and the buttons "Cancel", "Submit" | 21 |
