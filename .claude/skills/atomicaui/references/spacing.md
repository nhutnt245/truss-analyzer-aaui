# Spacing

Spacing is where screens go wrong most. Do not judge it by eye and do not copy it from a screenshot or an old app: the kit's standard wins. Release 7.0.9.

## The rules
| # | Rule |
|---|---|
| S1 | Space **inside** a part (button, input, cell, tab, panel) is its `profile`. Never add padding to a part that has one. |
| S2 | Space **between** neighbours is one `gap` on their parent `View`. No margin, no spacer element (a `flex: 'fill'` push is the one exception). |
| S3 | The gap value comes from the roles table below, by the job the space does. |
| S4 | One owner per space: the parent's gap or the container's profile, never both for the same space. |
| S5 | Write `gap`. Do not write `rowGap` or `columnGap`: everything inside inherits them and inner gaps turn to 0. |
| S6 | A value with no token step (5 or 7 px from an old screen) is not written anyway: pick the role, or ask. |
| S7 | `npm run check:layout` measures the running page. A green unit test does not prove spacing. |
| S8 | A control that appears or disappears (scroll, hover, selection, loading, edit mode) never changes the size of its row or bar: set its `aui.profile` to a defined value (for example `'compact'`) so it fits, or reserve its slot (pattern 4). |

## Roles: which token for which space
| The space | Who owns it | Write |
|---|---|---|
| Inside a control, a table cell, a tab, an accordion panel | the part | nothing |
| Label to its control | `Field` | one of the five field constants, never a gap by hand: `aui={FIELD_AUI}` in a page, `FIELD_DIALOG_AUI` in a dialog or popup (`references/components/field.md`) |
| Regions of a screen stacked top to bottom (title bar, toolbar, body, paging bar) | the screen's column `View` | nothing: a `View` column already has the standard gap (6) |
| Blocks in a panel body (field group, table, heading with its content, button row) | `STACK_AUI` | `<View aui={STACK_AUI}>` (gap `'8'`) |
| Buttons in a toolbar or a button row | the row | `gap: '8'`; under a form or table use `ActionRow` |
| Fields in a form grid, both directions | `FieldGrid` | nothing (`'8'` inside) |
| An icon and its text | the row | `gap: '4'` (in an alert, `'12'`) |
| Header actions in a pane header | the group | `gap: '6'` (`PANE_ACTIONS_AUI`) |
| A label column and its value | the row | `gap: '12'` |
| Very tight pairs (a label over its value) | the pair | `gap: '3'` |
| Entries in a navigation list | the list column | `gap: '2'` |
| Far-apart groups on a long page | the page column | `gap: '16'` |
| A tab panel | nobody: what it holds starts at the tab row's left edge | `<Tabs.Panel aui={TAB_PANEL_AUI}>` (no padding) |
| A tab panel of a pane whose header holds the tab row | the panel: it is the row of the pane, 4 / 8 px, as the header pads the tab row 8 px | `<Tabs.Panel aui={PANE_TAB_PANEL_AUI}>`; for a filling card, put `<PaneTabBody>` directly inside it ([tabs](components/tabs.md)) |
| A toolbar, title bar or paging bar | nobody at the sides: its first control starts at the left edge of the blocks beside it | `BAR_AUI` beside a table that fills the card (4 px above and below, nothing at the sides); `BAR_PADDED_AUI` beside padded blocks such as form sections (4 / 8). Never `'compact'` on a bar |
| Padding of a panel, band or card | its `profile` | `'default'` (4 / 8), frames `'no-padding'` |

Text: body `role="p3"` (`p2` for a larger paragraph), secondary `p3` with `color="muted"`, label `l4`, headings `l3` with `weight="semi-bold"`.

`STACK_AUI`, `TEXT_AUI`, `ACTION_AUI`, `TAB_PANEL_AUI`, `PANE_TAB_PANEL_AUI` and `SELECTED_CARD_AUI` come from `@/recipes/shared/aui`. `ActionRow` comes from `@/recipes/shared/ActionRow`.

## The four patterns (copy)
```tsx
// 1. Blocks under each other in a panel: one stack owns the gap.
<Accordion.Panel>
  <View aui={STACK_AUI}>
    <FieldGrid label="General">...</FieldGrid>
    <ActionRow label="Form actions">
      <Button onClick={cancel}>Cancel</Button>
      <Button aui={ACTION_AUI} onClick={save}>Save</Button>
    </ActionRow>
  </View>
</Accordion.Panel>

// 2. A heading with its content: Type has no margin, the stack makes the space.
<View aui={STACK_AUI}>
  <Type role="l3" as="h2" weight="semi-bold" aui={TEXT_AUI}>Product structure</Type>
  <Tree label="Product structure" nodes={nodes} />
</View>

// 3. A row of things: one gap, centred. Buttons and icons only: a row with labelled fields is pattern 5.
<View aui={{ paint: 'text', profile: 'no-padding', sx: { display: 'flex', alignItems: 'center', gap: '8' } }}>...</View>

// 4. A control that comes and goes: the row never changes size. Fit it with a defined profile.
<View role="group" aria-label="Part actions" aui={{ paint: 'text', profile: 'no-padding', sx: { display: 'flex', alignItems: 'center', gap: '8' } }}>
  <Button>Refresh</Button>
  {showTop ? <Button aui={{ scale: 'md', profile: 'compact' }} onClick={toTop}>Back to top</Button> : null}
</View>
// Without profile 'compact' this md button makes the 32 px bar 36 px. Still too tall or wide? Reserve a slot: a View with sx { width: '72', height: '28' } around it.

// 5. A filter or toolbar row of labelled fields and buttons: aligned to the end, so each button shares its bottom edge with the field box, not the middle of the row.
<View role="group" aria-label="Equipment filters" aui={FILTER_ROW_AUI}>
  <Field name="name" aui={FIELD_AUI}><Field.Label>Name contains</Field.Label><Field.Control><Field.Input /></Field.Control></Field>
  <Field name="status" aui={FIELD_AUI}><Field.Label>Status</Field.Label><Field.Control><Field.Input /></Field.Control></Field>
  <Button>Reset</Button>
  <Button aui={ACTION_AUI}>Apply</Button>
</View>
// FILTER_ROW_AUI is in @/recipes/shared/aui: alignItems 'end', wraps. Never alignItems 'center' here: it centres the buttons on the labels too. Class form: `view-filter-row` in references/standard/recipes/view.md. `npm run check:layout` fails a button more than 0.5 px off the bottom edge of the field box beside it.
```
Name the row in `evidence.views.json` (`"rows": ["Part actions"]`, plus the `click` that shows the control): `npm run check:layout` fails if its size differs. A profile is always a value AtomicAUI defines; never raw px or CSS.

## Traps (each one has happened)
| Trap | What you see | Do |
|---|---|---|
| A block placed straight after another inside a panel | the two touch (0 px) | Put both in one `STACK_AUI` |
| A `Tabs.Panel` without `aui`, or a padded `View` inside it | the table or card under the tabs sits 8 px inside the tab row | `aui={TAB_PANEL_AUI}` on every `Tabs.Panel`; `PANE_TAB_PANEL_AUI` on the panel of a pane whose header holds the tab row (references/components/tabs.md) |
| `Type` without `aui` (it renders `p`, or the `h1`-`h6` you ask for) | 10 to 16 px of browser margin above and below | `aui={TEXT_AUI}`, or `as="span"` inside a row |
| `rowGap` / `columnGap` on a container | gaps inside its children become 0 | `gap` |
| A bare `View` used as a frame | a white slab | `paint: 'text'` and `profile: 'no-padding'` |
| A margin wanted | `sx.margin` only takes `'0'` and `'auto'` | Move the space to the parent's `gap` |
| A thin line drawn as `height: '1'` | 10 px thick: a `View` is never smaller than 10 px | A border: `borderBlockStartWidth: '1'`, `borderColor: 'outlined'` |
| Padding of 7 measured on an outlined part | correct: 8 minus its 1 px border | Nothing |
| Spacing or button emphasis copied from the screenshot | the screen stops looking like the others | The screenshot says what is there; the kit says how it looks |

Allowed steps for `gap` and padding: `0 1 2 3 4 6 8 9 10 12 14 16 18 20 24 28 32 36 40 44 48 56 64 72 80 96 128 160 192`. The type check rejects any other string.

## Panes: the page frame (S9)
The page is a padded frame (4 px above and below, 8 px left and right) that holds framed panes (soft, outlined, 4 px padding), each with a 28 px header and a body card 8 px inside the frame. `Panes`, `Pane` and `PaneBody` write all of it: [panes](components/panes.md). Text and controls are never closer than 8 px to the window edge, except the top bar and the tabs of a tab row that runs from edge to edge of the window ([tabs](components/tabs.md)). A card against the frame fails the layout check, and so does a pane that is not the kit's block (rules PN1 to PN11). Class form: the `view-pane` recipe in `references/standard/recipes/layout.md`.
