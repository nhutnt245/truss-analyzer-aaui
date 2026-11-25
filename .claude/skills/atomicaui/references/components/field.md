# Field, with Input and Select

A form field is a `Field` with a label and one control. `Field` wires label, control, hint and error together (ids, `aria-describedby`, validation). Release 7.0.9.
Source: `src/vendor/atomic-aui/lib/field/`, `lib/input/`, `lib/select/`. Working code: `src/recipes/form/FormField.tsx` (all eight kinds), the page: [form page](../recipes/form-page.md).

## Parts
| Part | Job |
|---|---|
| `Field` | The field. Props: `name`, `invalid`, `disabled`, `aui` (`sx` styles its box). |
| `Field.Label` | Label text, tied to the control. |
| `Field.Control` + `Field.Input` | One-line text input. `Input` props: `value`, `onChange`, `type`, `required`, `readOnly`. |
| `Field.Textarea` | Several lines. Compose it directly in the `Field`, not inside `Field.Control`. |
| `Field.Select` + `Field.Select*` | Pick one value (below). |
| `Field.Description`, `Field.Error` | Hint and error text. `Field.Error match` shows when invalid. |
| `Field.Combobox`, `Field.Autocomplete`, `Field.Datepicker`, `Field.NumberField` | Search-pick, type-ahead, date, number. |

## Text field (copy)
```tsx
<Field name="name" invalid={Boolean(error)} aui={FIELD_AUI}>
  <Field.Label>Name</Field.Label>
  <Field.Control>
    <Field.Input required value={value} onChange={(event) => setValue(event.target.value)} />
  </Field.Control>
  {error ? <Field.Error match role="alert">{error}</Field.Error> : null}
</Field>
```

## Checkbox and radio
A checkbox or radio takes `aui={TOGGLE_AUI}` (`@/recipes/shared/aui`): a 1 px outlined box, solid primary when ticked. The library default is a pale borderless box. A table's own checkboxes get the look from `TABLE_PROPS`.
```tsx
<Checkbox aria-label="Released" aui={TOGGLE_AUI} checked={value} onCheckedChange={setValue} />
<RadioGroup value={order} onValueChange={setOrder} aria-label="Order">
  <Radio value="asc" aui={TOGGLE_AUI}><Radio.Label>Ascending</Radio.Label></Radio>
  <Radio value="desc" aui={TOGGLE_AUI}><Radio.Label>Descending</Radio.Label></Radio>
</RadioGroup>
```
The label of a radio goes in `<Radio.Label>`: plain text inside `<Radio>` is ignored and the radio shows with no label. Write `aui={TOGGLE_AUI}` and nothing after it: a look written after the constant fails `npm run check` (AUI-09).

## Select field (copy)
A select looks like an input: `aui={SELECT_TRIGGER_AUI}` (`@/recipes/shared/aui`: surface fill, 1 px border, full width).
A pick-one list holds only values the spec or source names: one shown value is one option; any other option is a `// OPEN:` line.
```tsx
<Field name="state" aui={FIELD_AUI}>
  <Field.Label>State</Field.Label>
  <Field.Select value={value} onValueChange={(next) => next !== null && setValue(String(next))}>
    <Field.SelectTrigger placeholder="Select" aui={SELECT_TRIGGER_AUI}><Field.SelectChevron /></Field.SelectTrigger>
    <Field.SelectPortal>
      <Field.SelectPositioner sideOffset={4}>
        <Field.SelectPopup matchTriggerWidth>
          <Field.SelectList>
            {options.map((option) => <Field.SelectItem key={option} value={option}>{option}</Field.SelectItem>)}
          </Field.SelectList>
        </Field.SelectPopup>
      </Field.SelectPositioner>
    </Field.SelectPortal>
  </Field.Select>
</Field>
```
Read-only page mode: pass `readOnly` to `Field.Input`, `Field.Textarea` and `Field.Select`.

## Layout
- A `Field` has one of three layouts, and its size is chosen with `aui.scale` next to the constant, written out: `aui={{ ...FIELD_AUI, scale: 'md' }}` (`xs`, `sm`, `md`, `lg` or `xl`; the constants and the recipes use `sm`; a size that is no library step, or one given as a variable, fails `npm run check`). **Stacked in a page**, the label above the control: `aui={FIELD_AUI}` (`@/recipes/shared/aui`: size `sm`, 3 px between the label and the control; six of our apps write 3 px, in their input pane only), or `FIELD_WIDE_AUI` for the same field across both columns of the form grid. **Stacked in a dialog or a popup**: `aui={FIELD_DIALOG_AUI}` (size `sm`, no gap written, so the library's own 6 applies: every app and the released ADCCP do this in their dialogs; hs `ShellExtras.tsx:216`, pbs `WorkspaceTools.tsx:216`, adccp `ProjectInformationDialog.tsx:363-380`; and in their popups: hs `SettingsPanel.tsx:33,98`, fd `SettingsPopover.jsx:58`), or `FIELD_DIALOG_WIDE_AUI` across both columns. **Inline**, the label beside the control: `aui={FIELD_INLINE_AUI}` (size `sm`, a column with no gap written) holding exactly two children: a row, `<View aui={FIELD_INLINE_ROW_AUI}>` (no gap written, so the library's own 6 applies, as in the released ADCCP and the ADC prototype, `BasePlateSection.tsx:102-117`, `DesignField.tsx:93-111`), with the label and the control half the row each (`FIELD_INLINE_LABEL_AUI` and `FIELD_INLINE_CONTROL_AUI`), and the error text under that row (below). A row on the `Field` itself has no place for an error (adccp `BaseMaterialSection.tsx:293-318`, ace `EstimatorInputPanel.tsx:201-203`). Use inline for a short value in a narrow bar or a row of settings; use stacked in a form. `npm run check` fails a `Field` that does not take one of the five, and any other gap written by hand (AUI-09). It also knows where a `Field` is, one way only: the page look (`FIELD_AUI`, `FIELD_WIDE_AUI`) on a `Field` written inside a part of a `Dialog` or a `Popover` fails (`Dialog.Popup`, `Dialog.Body`, `Popover.Popup` and every other part but the root and `Trigger`, which stand on the page). A `Field` built apart from its dialog (in a variable, a helper or a component of its own) cannot be placed by the check, and the dialog look passes anywhere: there the look is held by a prop, as `FormField` does with `dialog`, not by the check. A number with a unit ends at the unit: `NUMBER_INPUT_AUI` on the input, `Field.NumberFieldUnit` after it.
- A row that mixes labelled fields and buttons (a filter row) is `FILTER_ROW_AUI`: the buttons line up with the field boxes, not the labels ([spacing](../spacing.md), pattern 5).
- Fields go in the form grid: two columns from 360 wide, one below, gap `'8'` (`src/recipes/shared/FieldGrid.tsx`). A long field spans both: `aui={FIELD_WIDE_AUI}`.
- The form recipe shows the stacked layouts (a page, and a dialog through `FormDialog`; `FormField` takes `dialog`) and builds the inline one for a field with `inline: true` (a `text`, `number` or `date`; tests in `src/recipes/form/FormPage.test.tsx` and `src/recipes/shared/shared-pieces.test.tsx`). The class-form pages show the page one; the inline layout has no class-form page yet (`GAPS.md`).
```tsx
<Field name="width" invalid={Boolean(error)} aui={FIELD_INLINE_AUI}>
  <View aui={FIELD_INLINE_ROW_AUI}>
    <Field.Label aui={FIELD_INLINE_LABEL_AUI}>Width</Field.Label>
    <Field.Control aui={FIELD_INLINE_CONTROL_AUI}>
      <Field.Input value={value} onChange={(event) => setValue(event.target.value)} />
    </Field.Control>
  </View>
  {error ? <Field.Error match role="alert" aui={FIELD_ERROR_AUI}>{error}</Field.Error> : null}
</Field>
```
- The select popup is as wide as its trigger: `matchTriggerWidth`.
- **Order in a button row: Cancel and the other actions first, the main action (Save, Submit, Done, ...) last, on the right. In page forms (`ActionRow`) and in dialogs (`Dialog.Actions`) alike, new screen or converted.** `npm run check` fails a row whose main action is not last, and in any row a Cancel, Discard, Close or Back after the main action (AUI-09).

## Cascade (what reaches the parts)
`scale`, `shape`, `elevation` set on `Field` flow to every part; `color` reaches only the control border and the description. `profile`, `paint` and `sx` are per part. Parts are stateless: no `aui.states`.

For compact independent multi-file queues, use a separate labelled `Field.Input type="file"` for each queue and keep each input's `multiple`, `accept` and change handler; a tall `FileUpload` drop zone is for a layout that has room for it.

## Mistakes
- A raw `<input>`, `<select>` or `<label>` (AUI-01).
- `Field.Textarea` inside `Field.Control`.
- Putting `invalid` on the input instead of on `Field`.
- Using `Select` (not `Field.Select`) inside a `Field`: label and validation are not wired.
- Colour on `Field` expecting the label to change: set `aui.color` on the part itself.
- A required marker or helper text the source screen does not have (AUI-07).

More: `src/vendor/atomic-aui/lib/field/field.tsx`, `lib/select/`.
