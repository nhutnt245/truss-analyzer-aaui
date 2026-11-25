# Switch

An option that is on or off: a setting that takes effect at once, or a choice saved with its form or dialog by its own Save, Send or Apply button (ace `SaveAsTemplateDialog.tsx:99`, `FeedbackDialog.tsx:150`; adm `BasePlateModal.tsx:150`, `LoadConditionsFields.tsx:78`). Keep the switch where the source screen has one; a choice the source shows as a checkbox stays a `Checkbox`. Release 7.0.9.
Source: `src/vendor/atomic-aui/lib/switch/`. Working code: `src/recipes/form/FormField.tsx` (kind `switch`), `src/recipes/shared/ColumnPicker.tsx` (hs `ColumnVisibility.tsx:15-17`, pbs `ResultsSection.tsx`).

## Use / do not use
| Need | Use |
|---|---|
| On or off, effective now (show a column, turn a mode on) | `Switch` |
| On or off, saved with a form or dialog, where the source screen has a switch | `Switch` (the form recipe's `switch` kind) |
| Tick one or many, where the source screen has a checkbox | `Checkbox` with `TOGGLE_AUI` |
| Pick one of a few | `RadioGroup` |
| Several switches that belong together | `SwitchGroup` |

## Parts and props
| Part | Job |
|---|---|
| `Switch` | The track and the thumb. `selected`, `onSelectedChange(selected)`, `disabled`, `readOnly`, `aria-label` |
| `Switch.Label` | The text beside it; clicking the text toggles. Plain text inside `Switch` is ignored |
| `Switch.Thumb` | The knob; you never write it |

## The kit look
`aui={SWITCH_AUI}` (`@/recipes/shared/aui`): solid primary when on. The library default is faint when on. Write the constant and nothing after it.
```tsx
<Switch aui={SWITCH_AUI} selected={on} onSelectedChange={setOn}>
  <Switch.Label>Notify the owner</Switch.Label>
</Switch>
```
A switch with no visible label takes `aria-label`.

## Mistakes
- A switch swapped for a checkbox, or a checkbox for a switch: keep the control the source screen has (AUI-07).
- A label that is only a colour or a position: the label is text.
- Text inside `<Switch>` without `Switch.Label`: it does not show.
- Judging the thumb travel in a unit test: look in a browser, light and dark.

More: `src/vendor/atomic-aui/lib/switch/switch.tsx`.
