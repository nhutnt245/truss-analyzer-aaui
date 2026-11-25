# Recipe 3: item page

The Aras item view: title bar, toolbar with view and edit modes, Form accordion with the two-column field grid, Relationships accordion with tabs.
Code: `src/packs/aras/item/ItemPage.tsx` and `RelationshipTab.tsx`; the shared `src/recipes/shared/FieldGrid.tsx` and `src/recipes/form/FormField.tsx`. Seen live at `#/pack/aras/item/Part/P-1001`.
Screen it mirrors: the Aras item view.

## Use it
1. **Step one: `npm run screen:copy -- item`** (the same as `aras/item`), then edit `src/screens/item/`. It works in an app that has not turned the pack on: it turns it on first (`npm run pack:use -- aras`) and says so. If a file you changed blocks the pack, it copies nothing and names the file to merge. Never copy the files by hand. Pass `itemType` and `itemId`.
2. Form sections, fields and relationship tabs come from the item type definition; a new item type is a new definition in the adapter.
3. Data: `getItem`, `getRelationship`, `saveItem` on `useData()`.
4. Buttons: view mode has Edit and Refresh, edit mode has Discard, Save and Done in the toolbar. **A spec that puts Save and Cancel under the form** takes those three out of edit mode and puts an `ActionRow` inside the form's `STACK_AUI` column, shown while editing: **Cancel first, the main action (Save) last on the right** (`references/components/button.md`; `npm run check` fails the other order). Never keep both: two "Save" buttons on the page. In the same change update the copied `src/screens/item/ItemPage.test.tsx`: its queries ask the toolbar group (`Part actions`) for Discard, Save and Done (`moves between view and edit toolbars and saves`, `keeps edit mode and the edits when Save fails`), and `npm run test` fails until they ask the new row.
5. **Evidence.** `npm run screen:copy -- item` adds the lines `item` and `item-edit` to `evidence.views.json` when they are missing, at the shell address `#/item/Part/<id>`. Every other view the spec lists (a tab, a message, an error) is a line there too: a click is the visible text or the `aria-label` of the control (`["Documents"]` is the tab with that label; `["Edit"]` the button). Run `npm run evidence` and look at each picture; a view with no picture has no look to claim. Never list `?mode=bare...`: the bare page fills the frame and touches the window edge by design, so `check:layout` fails it (AUI-05) whatever the screen holds. Look at the bare address in `/host.html` (`frame.md`).
6. **Keep the form whole.** The group name ("General") is the section's `label` from the type definition. As `<FieldGrid label={section.label}>` it names the group for a screen reader and draws no text (the recipe's own page, which shows no caption). **A spec that shows the name on the page** ("General" above the fields): `<FieldGrid caption={section.label}>` in your copy; it draws the name as a heading above the grid and names the group by it, so give `caption` and not `label`. Never a `View` and `Type` heading around the grid, and no `GAPS.md` line: `caption` is the part's own prop (`src/recipes/shared/FieldGrid.tsx`). A spec that shows no name keeps `label`. **Do not relabel the tabs** either: a relationship tab's label comes from the type definition, so a spec's tab names go in your `src/data/index.ts` (below), never as edited text in `ItemPage.tsx`.
7. **Fields come from the type's field list**, never from `itemType === 'Part'` conditions in the page. The pack's list is read-only: change it in your own `src/data/index.ts`. In `createDataAdapter()`, wrap `createFixturesAdapter()` and map `listItemTypes()` to the same types with your `formSections`: drop a field (the spec shows no "Modified On"), or add `{ name, label, kind }`. A record holds strings only: a number is `"12.5"`, a checkbox or switch is `'true'` or `'false'` (`src/recipes/form/FormField.tsx`). A new field needs a value in the records: wrap `getItem` and `search` there too.
8. **A message on the page** (saved, could not save, a warning) is the shared `MessageBanner` (`@/recipes/shared/MessageBanner`: `level` and `text`; `references/components/banner.md`), built from AtomicAUI `Banner`. A banner the user can dismiss is `Banner` with the same look, as that page says. No styled-piece gap line or evidence sheet is needed.

## What is where
| Region | Parts |
|---|---|
| Title bar | `View` band, `Icon`, `Type` heading. It spreads `BAR_PADDED_AUI` (4 / 8), so the icon starts where the section headings and fields start |
| Toolbar | `View role="group"` (a labelled row of actions) with `Button`s. Also `BAR_PADDED_AUI`: the first button is on the same left edge as the form |
| Form | `Accordion.Item` "Form" (`SECTION_ITEM_AUI`, the second item `SECTION_DIVIDER_AUI`); one `STACK_AUI` column holding a `FieldGrid` per section (two columns from 360 wide); `FormField` per field. A button row under the form: `ActionRow` inside that same stack |
| Relationships | `Accordion.Item` "Relationships"; `Tabs` with a `Table` per tab (`RelationshipTab`). Each `Tabs.Panel` takes `TAB_PANEL_AUI`: the table starts and ends with the tab row and the form fields |

## Modes
| Mode | Toolbar | Fields |
|---|---|---|
| View | Edit (main action), Refresh | read-only |
| Edit | Discard, Save, Done (main action, last on the right) | editable |

Save keeps the page in edit mode. Done saves and returns to view mode: it completes the job, so in the Discard, Save, Done bar Done is the main action (`ACTION_AUI`). Discard drops the changes and returns to view mode. These meanings are the starter's choice; confirm them against the source app (AUI-08).

## Adapter errors
Catch every adapter rejection. A failed load shows `EmptyState` with `onRetry` (short plain message, Retry re-runs the load); a failed action (Save, Done) keeps the page and the user's edits and shows a `Toast` with the error.

## Change only
The toolbar buttons (Promote, Navigate, Reports exist in Aras), what Done does, the title text, which accordions start open.

## Not here
Claiming on edit, validation messages, add or delete rows, type-ahead add (recipe 4), tree grid (recipe 5), promote dialog (recipe 6).

Tests: `src/packs/aras/item/ItemPage.test.tsx`.
