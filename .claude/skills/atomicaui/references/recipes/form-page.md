# Form page

A page of fields in folding sections, with the buttons under them. Release 7.0.9. Code: `src/recipes/form/` (`FormPage.tsx`, `FormDialog.tsx`, `FormField.tsx`, `sample.ts`). Running: `#/recipe/form`, with a failed save at `#/recipe/form-error`. These addresses work in the general starter only: the Aras pack's router does not know `recipe`, so with the pack on `#/recipe/form` opens a search page (`GAPS.md`).
Make it yours: `npm run screen:copy -- form` (copies the folder to `src/screens/form/`; the field and its types stay in the kit and are imported), then import it from `'@/screens'` instead of `'@/recipes/form'`. Without React: `references/standard/pages/form.html`.
The copied test is yours: change its cases with the screen, delete a case your spec does not have, and run it alone with `npm run test -- src/screens/form`.

## What it is
One pane (`Panes resizable={false}`, one `Pane size="main"`), one body card. Inside it, top to bottom: the message banner when there is one, `Sections` (each folds; its content is a two-column field grid), and under them, in the same card behind a 1 px line, the button row.
Every look is one the ten apps share: sections that fold in one card (all ten), a two-column grid from 360 wide with gap 8 (adm `FieldGrid.tsx:6-33`, hs `FieldGrid.tsx:4-33`, pfd `fields.tsx:305-330`), 3 px from label to control in a page (rws `inputs.tsx:351`, pbs `aui-presets.tsx:9`, hs `InputFields.tsx:150`) and the library's 6 px in a dialog (hs `ShellExtras.tsx:216`, pbs `WorkspaceTools.tsx:216`, adccp `ProjectInformationDialog.tsx:363-380`), error text under the control (ace `EstimatorInputPanel.tsx:795`), a form in a dialog (adc `NewProjectDialog.tsx:171-204`), Cancel first and the main action last in the button row and the dialog footer (adm `FeedbackDialog.tsx:224`, ace `FeedbackDialog.tsx:161`, adm `SaveAsTemplateDialog.tsx:109`, adm `BasePlateModal.tsx:444`, adc `CapImportConfirmDialog.tsx:52`, ace `NewFromTemplateDialog.tsx:201`).

## Props (data in, events out)
| Prop | Meaning |
|---|---|
| `title` | The pane heading |
| `sections` | `{ id, label, fields: { name, label, kind, options?, placeholder?, unit?, required?, wide?, inline? }[] }[]`; `placeholder` is what a select shows while nothing is picked (default "Select"): give the app's own; `inline` puts the label of a `text`, `number` or `date` beside its control |
| `values`, `errors?` | Text by field name. A checkbox or switch holds `'true'` or `'false'` |
| `readOnly?` | Every field read-only |
| `actions` | `{ label, main?, onClick }[]` in the order shown: Cancel first, the main action last; exactly one has `main` (the one with `ACTION_AUI`) |
| `actionsLabel?` | The name of the button row (default "Form actions"): give the app's own |
| `message?` | `{ tone: 'success' \| 'warning' \| 'error', text }`: the result of the last action, as a banner above the sections |
| `onChange(name, value)` | The caller keeps the values; the page shows them |

## The eight kinds (`FormField`)
| `kind` | Control |
|---|---|
| `text` | `Field.Input` |
| `textarea` | `Field.Textarea`; `wide` spans both columns |
| `select` | `Field.Select` with `SELECT_TRIGGER_AUI` |
| `number` | `Field.Input` with a numeric keypad; with `unit`, the number ends at the unit (`Field.NumberFieldUnit`, ace `EstimatorInputPanel.tsx:241-246`) |
| `date` | The browser's own date input in a field |
| `checkbox` | `Checkbox` with `TOGGLE_AUI`; its label is beside the box |
| `radio` | `RadioGroup` of `Radio` with `TOGGLE_AUI` and `Radio.Label` |
| `switch` | `Switch` with `SWITCH_AUI` (solid primary when on) |
Every `Field` takes `FIELD_AUI` (size `sm`, label above the control, gap 3), or `FIELD_WIDE_AUI` for a field across both columns; in a dialog `FIELD_DIALOG_AUI` or `FIELD_DIALOG_WIDE_AUI` (no gap written: the library's 6; `FormDialog` does it). A field with `inline: true` (a `text`, `number` or `date`) takes `FIELD_INLINE_AUI`: a row with the label and the control half each, and its error under that row; it takes one column of the grid (`references/components/field.md`). `npm run check` fails a `Field` without one of them, any other gap written by hand, and the page look on a `Field` written inside a dialog or a popup (AUI-09). The size is `aui.scale` next to the constant (`xs`, `sm`, `md`, `lg` or `xl`; the recipe uses `sm`). An error shows as `Field.Error` with `role="alert"` and `aui={FIELD_ERROR_AUI}` (the error colour; the field is `invalid`).

## As a dialog
`FormDialog` takes the same props but `readOnly` and `actionsLabel`, and `open`, `onOpenChange`, `closeLabel?` (the name of the close button, default "Close": give the app's own). Same sections, not folded: a heading and a field grid for each. The actions are the dialog's footer (`Dialog.Button`): Cancel first, the main action last. The main action keeps the dialog open (`dismiss={false}`): the app closes it when the save passed ([dialog](../components/dialog.md)).

## Rules
- The sections, fields, texts and rules come from the source screen. No required marker and no helper line unless the source screen has one (AUI-07).
- Validation is the app's: it sets `errors` and `message`. The page never decides what is valid.
- Read-only is the app's choice: at 7.0.9 a read-only field looks like an editable one (`GAPS.md`).
- The button row stays inside the card. A row outside it fails the pane check (PN6).
- Cancel first, the main action (Save, Submit, ...) last on the right, on every screen, new or converted: the order is the kit's look (AUI-09), not a text of the source screen. `npm run check` fails a row that ends with another button, and a Cancel, Discard, Close or Back after the main action in any row. Record the change in `CONVERSION.md` when the source had Save first.
- Several kinds in one grid: put `wide` only on long text.
- The copy imports the shared `MessageBanner` wrapper over AtomicAUI `Banner` (`references/components/banner.md`). List a view that shows the message in `evidence.views.json`.

## Mistakes
| Mistake | Fix |
|---|---|
| A `Field` written by hand beside the grid | Use `FormField`; a new kind is a line in `GAPS.md` |
| A banner for every field | One banner for the result of the action; each field shows its own error |
| The dialog closes on a failed save | Keep `dismiss={false}` on the main action |
