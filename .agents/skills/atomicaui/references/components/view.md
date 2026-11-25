# View

The frame for everything: a box, a row, a toolbar, a panel, a scroll area. Layout goes through `aui.sx`, never through CSS (AUI-03).
Source of truth: `src/vendor/atomic-aui/lib/view/`. Release 7.0.9.

## When to use
| Need | Use |
|---|---|
| A group, panel, row, column | `View` |
| A clickable surface | `View interactive` |
| A scrolling region | `View.ScrollArea` |
| A text node | `Type` (not View). A superscript or subscript inside a line (m², x₁): `<Type as="sup" role="l7" aui={TEXT_AUI}>2</Type>` (`as="sub"` the same). A `sup` is a block tag for `npm run check` (AUI-05), so it takes `TEXT_AUI` like a heading; with that and a role it passes the token check too (`check-conformance`) |
| An action | `Button` (not View) |
| A labelled form group | `Field` / `Fieldset` |

## Defaults
`View` is `surface` colour, `solid` paint, `sm` scale, `no-padding` profile, no rounding. It paints a filled box.
Inside a table cell, a toolbar row or any tinted area add `paint: 'text'` or it shows as a white slab.

## The one fact that matters: `interactive`
- `interactive={false}` (default): an inert frame. `selected`, `disabled` and `aui.states` do **nothing**.
- `interactive`: a stateful surface. Hover, press, focus ring, `selected`, `aui.states`, keyboard (Enter/Space) and `role="button"` all work.
Give an interactive `View` a visible label or `aria-label`.

## Layout recipes (copy)
```tsx
// Row with a gap, vertically centred. Buttons and icons only: a row of labelled fields and buttons is FILTER_ROW_AUI (references/spacing.md, pattern 5)
<View aui={{ paint: 'text', profile: 'no-padding', sx: { display: 'flex', alignItems: 'center', gap: '8' } }}>...</View>

// Column that fills its parent
<View aui={{ profile: 'no-padding', shape: 'none', sx: { display: 'flex', flexDirection: 'column', width: 'fill', height: 'fill' } }}>...</View>

// Push the next item to the far end
<View aui={{ paint: 'text', profile: 'no-padding', sx: { flex: 'fill' } }} />

// Two-column grid (the form grid recipe wraps this)
<View aui={{ paint: 'text', sx: { display: 'grid', gridTemplateColumns: '2', gap: '8' } }}>...</View>

// Blocks under each other: the stack owns the gap (STACK_AUI from @/recipes/shared/aui)
<View aui={STACK_AUI}>...</View>
```
Which gap for which job: [spacing](../spacing.md). Write `gap`, never `rowGap` or `columnGap`.
`sx` values are token strings: gaps `'0'`..`'192'`, `width`/`height` also `'fill'`, `flex` is `'none' | 'auto' | 'initial' | 'fill'`, `justifyContent` is `'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'`.

## Selected card (AUI-04)
Cards to pick one of a few have one route: copy the styled piece (`../aui-style-anything/references/examples/selection-cards.md`) and add its gap line to `GAPS.md`.
```
cp src/recipes/styled/SelectionCards.tsx src/screens/<Name>/SelectionCards.tsx
```
```tsx
<SelectionCards label="Region" options={regions} value={region} onChange={setRegion} />
```
The piece carries `SELECTED_CARD_AUI`: a grey outlined card; picked, a 2 px primary outline with the same neutral fill and text (same height in both states). Do not fill a selected card with the primary colour: in dark the text cannot be read.
`npm run check` fails a hand-built `<View selected>` in a file with no `data-aui-styled` marker (AUI-09). It also fails a look that is not `SELECTED_CARD_AUI`; after a spread of it only `sx` with layout keys may follow.
This is for cards. A selected **table row** is styled by `TABLE_PROPS`: see [table](table.md).

## Messages and empty state
A failure, warning or verdict uses `MessageBanner` (`@/recipes/shared/MessageBanner`, `level` and `text`; `references/components/banner.md`), built from `Banner`: `role="alert"` for a failure and `role="status"` otherwise. An empty result is `EmptyState` (`@/recipes/shared/EmptyState`): a small icon over a bold `l3` line, gap 4.
A row of actions is a labelled `role="group"`, not `role="toolbar"`.

## Toolbar, title bar, paging bar
A bar starts at the left edge of the blocks beside it, like the toolbar over a table in the prototypes. Spread one of two constants (`@/recipes/shared/aui`) and add the band colour beside it:
```tsx
// Beside a table that fills the card (search page): 4 px above and below, nothing at the sides.
<View role="group" aria-label="Part search" aui={{ ...BAR_AUI, color: 'surface-alt' }}>...</View>
// Beside padded blocks, such as the sections of a form (item page): 4 / 8, the padding those blocks have.
<View role="group" aria-label="Part actions" aui={BAR_PADDED_AUI}>...</View>
```
Never `profile: 'compact'` on a bar: its first button then sits 4 px off the table, form or tabs around it, and `check:layout` fails it (AUI-05).

## Scroll area
```tsx
<View.ScrollArea scrollAxis="vertical" aui={{ sx: { height: '192' } }}>{rows}</View.ScrollArea>
```
It is padded by default so the scrollbar does not cover content. Give it a bounded height or a flex parent.

## Mistakes
- `div` plus CSS instead of `View`.
- `interactive={false}` with `selected` or `states`: no effect.
- `sx: { gap: 8 }` or `'8px'`: use `'8'`.
- A `View` with default paint inside a coloured row or cell.
- Hand-set padding where a `profile` already gives it.
- `onClick` without `interactive` (`npm run check` fails it).
- A piece AtomicAUI has no part for, styled by eye. Use `../aui-style-anything/SKILL.md`: roles from its tables, never values.

More: `src/vendor/atomic-aui/lib/view/view.tsx`, `scroll-area.tsx`.
