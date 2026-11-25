# The map: what an old React page becomes

One row per kind of thing. Copy the rows your page uses into `CONVERSION.md`, with the count. Parts come from `@/vendor/atomic-aui`, constants from `@/recipes/shared/aui`, blocks from `@/recipes/layout`. Release 7.0.9.
"Drop" is what does not come along. "Watch" is old behaviour that must still work and standard behaviour an AtomicAUI part adds. Record each difference in `CONVERSION.md`.
Keep old `.js` and `.ts` data calls and helpers unchanged under `src/data/legacy/`; typecheck errors inside copied logic are ignored. Move `.jsx` and `.tsx` UI into a checked screen under `src/screens/`. Write new app-owned adapters elsewhere in `src/data/`; errors there and in importing screens still fail.

## Elements
| Old | Becomes | Drop | Watch |
|---|---|---|---|
| Page wrapper, container, grid of regions | `Panes` > `Pane` > `PaneBody` (`references/components/panes.md`) | width, margin, padding | a table or tree: `<PaneBody scroll="content">` |
| Page title (`h1`) | the `title` of the `Pane` | the heading element, its size | same words; the pane header comes before body content, even if the old title followed a breadcrumb |
| Other heading | `<Type role="l3" as="h2" weight="semi-bold" aui={TEXT_AUI}>` | margins | |
| Paragraph, helper text | `<Type role="p3" aui={TEXT_AUI}>`; secondary: `color="muted"` | margins, colour | same words; inside a card give it a bar: `<View aui={BAR_AUI}>` |
| `div` used for layout | `View` with `aui.sx` (`references/components/view.md`); a column of blocks: `STACK_AUI` | every class | no fill wanted: `paint: 'text'` |
| Toolbar, row of buttons | `<View role="toolbar" aria-label="..." aui={{ ...BAR_AUI, color: 'surface-alt' }}>` | floats, margins | beside padded blocks: `BAR_PADDED_AUI` |
| `button` | `Button`; the one main action of the bar: `aui={ACTION_AUI}` | every class and colour | `onClick`, `disabled`, `type="submit"` stay |
| A delete or danger button | `Button`, its look by `references/components/button.md`: plain in a button row (`ActionRow`, `Dialog.Actions`), the "Destructive" look outside one; the button that confirms inside `AlertDialog` is the main action | the red fill | still disabled until its condition holds |
| Icon-only button | `IconButton name="..." aria-label="..."` | the icon markup | the name must exist |
| `a` in a bar or a breadcrumb | `<Button role="link" aui={NAV_LINK_AUI} nativeButton={false} render={<a href="..." />}>` (`@/recipes/shared/aui`; in the top bar a `Menubar.Button`, `references/recipes/app-frame.md`) | its underline: the browser underlines every `<a>` otherwise | same address; `aria-current` stays |
| `a` that is a tab | `<Tabs.Tab value="..." nativeButton={false} render={<a href="..." />} aui={{ sx: { textDecoration: 'none' } }}>` in `Tabs` (`references/components/tabs.md`); never `NAV_LINK_AUI`: its text paint drops the chip | its underline | same address; the chip shows the open tab |
| `a` in a menu | `<Menubar.DropdownLinkItem aui={NAV_LINK_AUI} href="...">` (`Dropdown.LinkItem` is the same part; `references/recipes/app-frame.md`) | its underline | same address; `aria-current` stays |
| `a` inside running text | `<Button role="link" aui={{ paint: 'text' }} nativeButton={false} render={<a href="..." />}>` | | same address; it keeps its underline |
| `form` | `<View as="form" onSubmit={...} aui={{ ...BAR_AUI, color: 'surface-alt' }}>` | | Enter still submits |
| `label` + `input` | `<Field aui={FIELD_AUI}>` > `Field.Label` + `Field.Control` > `Field.Input` (`references/components/field.md`): the label goes above the control. In a dialog: `FIELD_DIALOG_AUI`. The label must stay beside the control: `FIELD_INLINE_AUI` with its row ("Layout" there) | group margins; a row or a gap written on the `Field` | `value`, `onChange`, `placeholder`, `required` stay |
| `select` + `option` | `Field.Select` with its parts, in a `Field` as in the row above; trigger `aui={SELECT_TRIGGER_AUI}` | | value type; `items` when value and label differ; `onValueChange` gives the value, not an event |
| `textarea` | `Field.Textarea` (not inside `Field.Control`) | | |
| Checkbox, radio | `Checkbox`, `RadioGroup` + `Radio`, each `aui={TOGGLE_AUI}` | | `onCheckedChange`, `onValueChange` |
| `table` | `<Table aria-label="..." {...TABLE_PROPS}>` with `Table.Head`, `Table.Body`, `Table.Row`, `Table.HeaderCell`, `Table.Cell` (`references/components/table.md`) | stripes, borders, cell padding | header row: `data-aui-header-row selectable={false} expandable={false}`; first column `HEADER_START_AUI` and `CELL_START_AUI`, the others `HEADER_CELL_AUI` and `CELL_CENTER_AUI` |
| A row that is picked by a click and a class | `selectionMode="single" indicatorColumn={false}` on `Table`; `selected` and `onSelectedChange` on `Table.Row` | the class, the highlight colour | the same state variable |
| Badge, pill, status label | `<Chip aui={...}><Chip.Label>` | colours | one named look per value (below) |
| Modal with a form or details | `Dialog` (`references/components/dialog.md`) | backdrop, close script | footer buttons are `Dialog.Button` |
| Confirm before delete | `AlertDialog`; Cancel first with `autoFocus`, the action last with `ACTION_AUI` | | same question and button words; Escape closes the dialog even if the old one stayed open: record the difference |
| Tabs | `Tabs` (`references/components/tabs.md`), each panel `aui={TAB_PANEL_AUI}` | the active class and its script | which tab is open |
| Alert, message band | `MessageBanner` (`@/recipes/shared/MessageBanner`, `level` and `text`); one that the user dismisses: `Banner` with the same look (`references/components/banner.md`) | | whether it goes away |
| Card with title and text | `Card`; cards to pick: `../aui-style-anything/references/examples/selection-cards.md` | padding, shadow | |
| Chart | With source values: the `chart` block of the overview recipe (`references/recipes/overview-page.md`), its `type` the kind the old chart draws: `bar`, `line`, `area`, `pie` or `radar` | | Map the source values and series into the `chart` block; never redraw one kind as another, and set `layout: 'stack'` only when the old bar or area chart stacks its series. A chart of a kind with no chart part (a scatter plot, a gauge), one with more than six series or slices, or one without supplied numeric values, stays a labelled `drawing` placeholder, `// OPEN:`, and a `GAPS.md` line; never invent data. A variant the `chart` block does not carry (100% stacked, horizontal bars, a donut, and the like) is never drawn as the plain kind: it stays a labelled `drawing` placeholder, `// OPEN:`, and a line in `GAPS.md` that names the variant. |
| Breadcrumb, stepper, diagram, drag and drop | no part | | write "no part" in the map and answer it by step 1.6 (asked to convert, you answer; asked for the assessment alone, a person does). Step 1 lists every such control (`CONVERSION.md`, a line in `GAPS.md`), so that it can be built into the kit first. The answers, in this order: 1 the stop rule builds it (`references/rules.md`, steps 1 to 4), for example a breadcrumb from links through `Button`, `Type` for the current page and the "/" as text, first in `PaneBody` after the pane title; 2 else the part is built into the kit first and the page uses it (only a person can answer this); 3 otherwise the page improvises it, as long as it follows the AtomicAUI standard: only AtomicAUI parts, `View` and `Type`, and the checks must pass. Record the provisional order change in `CONVERSION.md` when the old breadcrumb preceded the title |

## Classes and values
| Old | Becomes |
|---|---|
| Any margin (`mt-3`, `margin-bottom`) | nothing: the gap of the parent makes the space (`references/spacing.md`) |
| Padding on a control | nothing: the part's profile |
| Padding on a box | its `profile`: `'default'` (4 / 8) or `'no-padding'` |
| A grid of 12 columns | a flex row, or `gridTemplateColumns` `'2'`, `'3'`, `'auto-fit'`; another split: ask |
| A raw colour | the meaning, from "Colour and paint" in `references/chooser.md`; never the nearest hex |
| A status colour | the tone the spec or source names; otherwise its usage context sets `success` for done, `warning` for in progress, `error` for failed, or `info` for informational; when the context is unclear, `surface-alt`, the library Chip default |
| A pixel size of a dialog or a column | a width token (`'384'`), or nothing |
| Font family, font size, line height | nothing: `Type` roles |
| Shadow, radius | nothing |
| `!important`, a global element rule | nothing |
| `float`, `clearfix`, `pull-right` | a flex row; push to the end with `<View aui={{ paint: 'text', profile: 'no-padding', sx: { flex: 'fill' } }} />` |

## A look that follows data (copy)
```tsx
// One named look per value, picked from a table. Never a condition inside a look (AUI-04).
// The table says what its key is: here the data's id, a number. `ChipAui` is a type from `@/vendor/atomic-aui`.
const STATE_CHIP_AUI: Record<number, ChipAui> = {
  1: { scale: 'sm', color: 'info', paint: 'solid' },
  2: { scale: 'sm', color: 'warning', paint: 'solid' },
  3: { scale: 'sm', color: 'success', paint: 'solid' },
};
<Chip aui={STATE_CHIP_AUI[row.stateId]}><Chip.Label>{label}</Chip.Label></Chip>
```

## A select whose value is a number (copy)
```tsx
const items = [{ value: 0, label: 'All states' }, ...states.map((state) => ({ value: state.id, label: state.label }))];
<Field name="state" aui={FIELD_AUI}>
  <Field.Label>State</Field.Label>
  <Field.Select items={items} value={stateId} onValueChange={(next) => next !== null && setStateId(Number(next))}>
    <Field.SelectTrigger aui={SELECT_TRIGGER_AUI}><Field.SelectChevron /></Field.SelectTrigger>
    <Field.SelectPortal><Field.SelectPositioner sideOffset={4}><Field.SelectPopup matchTriggerWidth><Field.SelectList>
      {items.map((item) => <Field.SelectItem key={item.value} value={item.value}>{item.label}</Field.SelectItem>)}
    </Field.SelectList></Field.SelectPopup></Field.SelectPositioner></Field.SelectPortal>
  </Field.Select>
</Field>
```

## What the map never does
- It never keeps an old class name, an old colour or an old length.
- It never fixes a text. "Asignee" stays "Asignee" and is listed under "Oddities kept".
- It never turns a "no part" row into a control with the old CSS or with `check-allow`: only the answers of the last elements row.
