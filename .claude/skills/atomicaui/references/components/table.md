# Table

A real `<table>` for data users scan, compare and select. Release 7.0.9.
Source: `src/vendor/atomic-aui/lib/table/` (built on TanStack Table). Working code: `src/packs/aras/search/SearchPage.tsx`, `src/packs/aras/item/RelationshipTab.tsx`.

## Use / do not use
| Need | Use |
|---|---|
| Dense rows and columns, selectable | `Table` |
| Parent rows that fold open, several columns (multi-level BOM) | `Table` with `getSubRows` and `expandable` |
| A one-column tree (structure, folders, navigation) | `Tree` ([recipe](../recipes/tree.md)) |
| Layout in columns | `View` grid, never `Table` |
| Pick one from a popup | `Field.Select` |
| Switch views | `Tabs` |

## What it does and does not do
- Does: row and cell selection, expansion, sticky header with self-scroll, borders, density.
- Does **not** page, filter or resize by itself, and a composed table does not sort by itself. Compose them: filter row = a second header row of `Input`s, paging = `PagingBar`, data = the adapter.
- A whole page of this, with the search, "Configure columns", notes and paging: [data table page](../recipes/data-table.md).
- Sorting: `Table sortable`, off by default, on only where the user or the spec asks. Composed: a header becomes a sort button when you pass `sortDirection` (`'asc' | 'desc' | false`) and `onSortToggle` to that `Table.HeaderCell`; pass them only on the asked headers, and you order the rows yourself (ask the adapter). Data mode: every column becomes a sort button and the table sorts the rows itself, so every column the spec does not sort takes `enableSorting: false` in its column definition.

- **A display-only sort arrow** (the spec shows a column as sorted, and nothing sorts): the library draws the arrow only on a sort button, and `sortDirection` alone draws nothing. Put the arrow in the header cell as an icon, no button and no click: `<Table.HeaderCell aui={HEADER_START_AUI}>Name <Icon name="arrow-up" aria-hidden /></Table.HeaderCell>` (the name the spec's arrow has: `arrow-up`, `arrow-down`; `angle-` and `chevron-` icons are for folding). Add no `Table sortable`, no `onSortToggle` (a dead sort button that hovers like a real one is wrong). The part sets `aria-sort` only on a sort button, so this header carries none: one line in `GAPS.md`. Measured: passes `check:layout`. Only a header the user or the spec sorts takes `sortDirection` and `onSortToggle`.
- **A picture placeholder in a cell** (the spec's grey square, no picture file): a plain `View` tile, `<View aria-hidden aui={{ color: 'surface-alt', shape: 'soft', profile: 'no-padding', sx: { width: '32', height: '32' } }} />` (`references/components/view.md`; measured: passes `check:layout`). It is a placeholder: a real picture is the app's, and one line in `GAPS.md`.
- **A text link in a cell** keeps its link role: `<Button role="link" aui={CELL_LINK_AUI} nativeButton={false} render={<a href="…" />}>Bracket</Button>`. `CELL_LINK_AUI` (`@/recipes/shared/aui`) gives it text paint, bold underlined text and no fill. Without `role="link"` the part writes `role="button"` on the `<a>` (measured). A link with an unknown address keeps the link and an `// OPEN:` label on its `href`, never underlined plain text.
- **A superscript in a cell** uses `Type` so its text has a named typescale: `<Type as="sup" role="l7" aui={TEXT_AUI}>1</Type>` beside the value. Do not put a raw `<sup>` in the cell; the token check measures its unstyled text as AUI-02.
- **A narrow table** scrolls inside its frame, not the page: `minInlineSize={n}` on `Table`, `n` a number of pixels (`720`). It is not `sx.minWidth`: that takes only the token steps as strings, `'0'` `'1'` `'2'` `'3'` `'4'` `'6'` `'8'` `'9'` `'10'` `'12'` `'14'` `'16'` `'18'` `'20'` `'24'` `'28'` `'32'` `'36'` `'40'` `'44'` `'48'` `'56'` `'64'` `'72'` `'80'` `'96'` `'128'` `'160'` `'192'` `'224'` `'256'` `'288'` `'320'` `'352'` `'384'` (`"512"` is a type error: use `minInlineSize`).
- **A column holding one icon button** takes its width on the empty, action-labelled header cell only (a header width, as in `src/recipes/table/DataTablePage.tsx`), and its cells take `CELL_CENTER_AUI` and nothing else (`npm run check` fails any other cell look, AUI-09). The 48 px width and centred cells are measured kit values from `pane-tabs-header-fill` (`src/standard/cases.tsx`), desktop and narrow, light and dark: `<Table.HeaderCell aria-label="Edit" aui={{ ...HEADER_CELL_AUI, sx: { ...HEADER_CELL_AUI.sx, width: '48' } }} />` and `<Table.Cell aui={CELL_CENTER_AUI}><IconButton name="pen" aria-label="Edit P-1001" /></Table.Cell>`. The class form, `references/standard/recipes/tabs-fill.md`, has no column lock, so it puts `aui-width-48` on every cell of the column too.

## Two ways to build it
- **User-composed** (the recipes use this): write `Table.Head`, `Table.Body`, `Table.Row`, `Table.HeaderCell`, `Table.Cell` yourself.
- **Data mode**: `<Table data={rows} columns={columns} />` with no children renders header and body from TanStack column definitions. Do not mix the two.

## Display-only table (copy)
Every table spreads `TABLE_PROPS` (`@/recipes/shared/aui`): the prototypes' Output table, with a soft outlined frame, a divider on every cell, a raised header, and a table that scrolls inside its own frame (`scroll="self"`: the toolbar and paging bar stay put). The first column is left, the others centred, header and cells alike: header cells `HEADER_START_AUI` then `HEADER_CELL_AUI`, body cells `CELL_START_AUI` then `CELL_CENTER_AUI`, so the first header and its cells start at one edge (`check:layout` fails a centred header over a left first column, AUI-09). The props also carry the checkbox look (`selectionToggleAui`: 1 px outlined box, solid primary when ticked) and the picked-row look (`rowAui`: surface fill, 4 px secondary edge). Never write `scroll`, `fit`, `bodyFit`, `border`, `borderStyle`, `headerCellAui`, `cellAui`, `aui`, `selectionToggleAui`, `expandTriggerAui` or `rowAui` beside the spread, and put no second spread after it: `npm run check` fails it (AUI-09), and `check:layout` fails a table that a parent cuts off.
```tsx
<Table aria-label="BOM" {...TABLE_PROPS}>
  <Table.Head>
    <Table.Row data-aui-header-row selectable={false} expandable={false}>
      {columns.map((c, i) => <Table.HeaderCell key={c.name} aui={i === 0 ? HEADER_START_AUI : HEADER_CELL_AUI}>{c.label}</Table.HeaderCell>)}
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {rows.map((row) => (
      <Table.Row key={row.id}>
        {columns.map((c) => <Table.Cell key={c.name}>{row[c.name]}</Table.Cell>)}
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```

## Selectable table with a filter row
`selectionMode="multiple"` adds a leading checkbox column. `selectionMode="single"` can use a radio column, a checkbox column that holds one row, or no control column; see [Picking rows](../recipes/data-table.md#picking-rows). Then:
- Every header row needs `data-aui-header-row selectable={false} expandable={false}`. With a control column, add **one extra empty `<Table.HeaderCell />` first**, so labels line up.
- Control each row with `selected` and `onSelectedChange`.
- Filter row: a second header row whose cells hold `<Input aria-label="Filter Name" aui={CELL_INPUT_AUI} />`. The constant makes the input fill its cell and shrink with it; without it the input keeps the browser's width and runs over the next column when the column is narrower (`check:layout` fails it, AUI-05).
```tsx
<Table selectionMode="multiple" {...TABLE_PROPS} hoverable aria-label="Parts">
  ...
  <Table.Row key={id} selected={ids.has(id)} onSelectedChange={(on) => toggle(id, on)} selectionLabel={`Select ${id}`}>
```
One row to pick, by a click on the row, no control column: `selectionMode="single" indicatorColumn={false}`. With a radio column: `selectionMode="single" indicatorType="radio"` (left out, the column holds checkboxes: with `selectionMode="single"` a checkbox column holds one row, the controlled `selected` ticks only the picked row). Which one to choose: [data table page](../recipes/data-table.md), "Picking rows".

## Props that matter
| Prop | Values |
|---|---|
| `selectionMode` | `none` (default), `single`, `multiple` |
| `border` | `none`, `between-rows`, `all-cells` |
| `hoverable`, `striped` | booleans |
| `scroll` | `parent` (default, page scrolls) or `self` (only the body scrolls; needs a bounded height) |
| `fit` | `contained` or `fill` |
| `aui` | density: `scale` (`xs`..`xl`) and `profile`; default `sm` + `default`. No invented profiles. |
| `headerCellAui`, `cellAui`, `rowAui` | default appearance for header cells, cells, rows. A cell's own `aui` replaces it. |
| `selectionToggleAui` | look of the checkbox or radio column |

Row selected look: leave it. `TABLE_PROPS` carries it (`SELECTED_ROW_AUI`: surface fill and a 4 px secondary edge at the start), the same on every screen. Never put `aui` or a spread on a `Table.Row`, never write `rowAui` or `cellAui`, and give a `Table.Cell` only `CELL_START_AUI` or `CELL_CENTER_AUI` (a cell fill paints over the picked row): `npm run check` fails each (AUI-09). Asked to make the picked row stand out: it already does. Too faint for your screen is one line in `GAPS.md`, not a screen change (`primary` tonal is near invisible on a row and `primary` solid cannot be read in dark).

## Mistakes
- Header row without `data-aui-header-row`: it gets a control cell and every label shifts one column.
- Forgetting the empty first header cell when the table has a control column.
- `View` with default paint inside a cell: white slab on a tinted row. Use `paint: 'text'`.
- A centred header over the left first column: the first column's `Table.HeaderCell` takes `HEADER_START_AUI`, the others `HEADER_CELL_AUI`. A spec's "centred column titles" is the others; the first stays left (`references/rules.md`, AUI-09).
- Passing `data` and hand-written rows together.
- Expecting paging, or sorting in a composed table, to happen by itself: the table only draws the controls.
- `sortable` in data mode with no `enableSorting: false` on the columns the spec does not sort: every header becomes a sort button.
- The spec shows a select-all box in the header and you drop it without a word: a composed `Table` has none (`GAPS.md`). Leave the header cell empty, never build a checkbox by hand (AUI-01), add one line to your `GAPS.md` and name it in your final message.
- Recording that gap for a table in data mode: there the library draws the header select-all itself (`data` and `columns` given, `selectionMode="multiple"`, `selectAll={{ header: true }}`; `src/vendor/atomic-aui/lib/table/table.tsx`, `table-selection.tsx`). Record the gap only for a composed table.
- A copy of `PagingBar`, or a layout of your own around it, to move its controls: import it as it is. It keeps previous, range and next at the start and results per page at the end. A spec that draws the whole bar at the end edge is a gap: one `GAPS.md` line, and say so.
- Nested rows that do not fold with the arrow keys: the root needs `expandable`.
- Expecting a parent of nested rows to be picked: in single selection a row that has sub-rows only folds and is never picked (`src/vendor/atomic-aui/lib/table/table-row.tsx:105`); in multiple selection its box picks all the rows under it.
- Importing `ColumnDef` from another package (the check rejects it): write the column objects without that type.
- Judging `scroll="self"` or `fit="fill"` in a unit test: jsdom cannot; look in a browser.

More: `src/vendor/atomic-aui/lib/table/table.tsx`.
