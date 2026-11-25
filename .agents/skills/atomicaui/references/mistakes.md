# Mistakes that keep happening

Check your work against this list before you run the checks. Rule ids point to [rules.md](rules.md).

| Mistake | Instead |
|---|---|
| `div` plus CSS where `View` does the job (AUI-03) | `View` with `aui.sx`. |
| Numbers or `px` / `%` in `aui.sx` (AUI-05) | Token strings: `'8'`, `'28'`, `'fill'`. |
| Hand-set padding where a `profile` already gives it (AUI-05) | `profile: 'compact'` / `'default'` / `'no-padding'`. |
| Selected card filled with the primary colour (AUI-04) | `SELECTED_CARD_AUI`: grey outlined card, 2 px primary outline when picked. |
| A checkbox left on the library default (pale, no border) | `aui={TOGGLE_AUI}`. |
| A `Field` with no `aui`, or with a gap written by hand (AUI-09) | `aui={FIELD_AUI}` (label above the control), `FIELD_WIDE_AUI` across both columns of the grid, `FIELD_DIALOG_AUI` or `FIELD_DIALOG_WIDE_AUI` in a dialog or a popup, or `FIELD_INLINE_AUI` (label beside the control: the constant is the column, and the label and the control sit in a row inside it, `<View aui={FIELD_INLINE_ROW_AUI}>`). The size is `aui.scale` next to the constant: `{ ...FIELD_AUI, scale: 'md' }` (`xs`, `sm`, `md`, `lg` or `xl`). |
| Accordion sections with the library's soft items | `SECTION_ITEM_AUI` and `SECTION_DIVIDER_AUI`. |
| A table or card 8 px inside the tab row above it: a `Tabs.Panel` on the library default (AUI-09, AUI-05) | `aui={TAB_PANEL_AUI}` on every `Tabs.Panel`; no padded `View` inside it. Under a pane header that holds the tab row: `PANE_TAB_PANEL_AUI`. |
| Rounded corners on a top bar at the window edges, or on tabs that touch each other (AUI-09) | `sx: { radius: 'none' }` on the `Menubar` (not `shape`: the buttons stay soft); `shape: 'none'` once on `Tabs`. Soft corners only with space around the bar or between the tabs. |
| A toolbar, title bar or paging bar whose first button sits 4 px off the table, form or tabs beside it: a bar on `profile: 'compact'` (AUI-05) | `BAR_AUI` beside a table that fills the card, `BAR_PADDED_AUI` beside padded blocks such as form sections. |
| A table or select look changed after the shared constant (AUI-09) | Delete the extra props; the look is the same on every screen. |
| "Make the selected row or card stand out": an `aui` on `Table.Row`, or a picked card with a look of its own (AUI-09) | It already stands out: the row through `SELECTED_ROW_AUI` in `TABLE_PROPS`, the card through `SELECTED_CARD_AUI`. Too faint is a line in `GAPS.md`, not a screen change. `npm run check` fails the override. |
| A look written after `TOGGLE_AUI` or a section constant in the same object (AUI-09) | The bare constant: `aui={TOGGLE_AUI}`. |
| `View` with `selected` or `states` but no `interactive` (AUI-04) | Add `interactive`. Without it states do nothing. |
| `states` on a part that has none (Button, Field parts) | Put the look on the part, or use `View interactive`. |
| White slab behind a `View` inside a table cell or toolbar (AUI-03) | `paint: 'text'` on that `View`. |
| Table header cells shift one column right (AUI-01) | `data-aui-header-row selectable={false} expandable={false}` on header rows, plus an empty first `Table.HeaderCell` when selectable. |
| The first column's header centred over its left-aligned cells (AUI-09) | `HEADER_START_AUI` on the first column's `Table.HeaderCell`, `HEADER_CELL_AUI` on the others. |
| A filter input that runs over the next column when the column is narrow (AUI-05) | `aui={CELL_INPUT_AUI}` on a text field in a table cell. |
| Expecting `Table` to page or filter by itself, or a composed `Table` to sort | Compose: filter row of `Input`s, `PagingBar`, adapter query; a composed header sort button needs `sortable`, `sortDirection`, `onSortToggle` and your own ordering. Data mode sorts by itself: `enableSorting: false` on every column the spec does not sort. |
| Icon-only control with no name (AUI-11) | `aria-label` on `IconButton`, `Tabs.CloseButton`, `Tabs.AddButton`. |
| Icons missing on the page | The page lacks the Global Kit script: `node scripts/icon-kit.mjs <app folder>` adds it. Icons also need the page's domain to be allowed by the kit owner. |
| Bare `Button` or `<button>` in a dialog footer (AUI-01) | `Dialog.Button`. |
| Destructive confirm in `Dialog` | `AlertDialog`. |
| Select inside a `Field` without `Field.Select` | `Field.Select` and the `Field.Select*` parts. |
| Text, helper lines, counts or footers the source screen lacks (AUI-07) | Remove them. Ask. |
| Guessing a behaviour (what "Done" does, what a button opens) (AUI-08) | Ask; label the placeholder `// OPEN:`. |
| Building a tree from `View`, or from hand-indented table rows (AUI-01) | `Tree` ([recipe](recipes/tree.md)): the library has `TreeView`. |
| Building a missing part with its own keyboard pattern by hand (menu, list box, diagram) (AUI-01) | The library part, or `GAPS.md` plus a placeholder. |
| A piece with no part styled by eye: a `div` with CSS, a card built in app CSS from token variables (AUI-03) | `../aui-style-anything/SKILL.md`: roles, not values. App CSS never sets a look. |
| A styled piece with a shadow, rounder corners, a large number or a tonal status: valid tokens, but looks no app of ours has (AUI-09) | The role tables in `../aui-style-anything/references/roles.md`: elevation 0, `soft`, `l4` values, solid tones. The check lists what our apps do not use. |
| A status tag built as a pill from `View`; a chart drawn from boxes or SVG by hand | The tag is `Chip`. A chart with source values uses the overview recipe's AtomicAUI `chart` block, of the kind the source draws (bar, line, area, pie or radar); a kind with no chart part, a variant the block does not carry (100% stacked, horizontal bars, a donut), a chart with more than six series or slices, or a chart without values, uses a labelled `drawing` placeholder, `// OPEN:`, and a line in `GAPS.md`. |
| A styled piece without its marker, its line in `GAPS.md` or its evidence sheet (AUI-12) | `data-aui-styled="<name>"` on the root, one line in `GAPS.md`, `node ../aui-style-anything/scripts/styled-evidence.mjs <name> --check` (it exits 1, and `npm run verify:page`, which runs it, fails, while a sheet has an unfilled "(you)" line or says NOT MEASURED; the one NOT MEASURED that passes is a state no listed view can show, with the reason on its `Not measured (you)` line and a current measurement, `../aui-style-anything/references/proof.md`). Removing the marker or the sheet is never the fix. |
| A plain element with `onClick`, or a `View` with `onClick` and no `interactive` (AUI-01) | `Button`, or `View interactive`. |
| Editing a recipe in `src/recipes/` or `src/packs/`, or a guide in `kit/` (AUI-13) | `npm run screen:copy -- <name>` and edit the copy; guides are never edited. |
| Filling in `references/checklist.md` itself (AUI-13) | `node -e "require('node:fs').copyFileSync('references/checklist.md', 'CHECKLIST.md')"`, fill the copy. |
| A button row or a second block placed straight under a form: the two touch (AUI-05) | Both in one `STACK_AUI`; the row is `ActionRow` ([spacing](spacing.md)). |
| `Type` without `aui`: browser margins above and below (AUI-05) | `aui={TEXT_AUI}`, or `as="span"`. |
| Two main-action buttons in one bar, or a main action made plain because the screenshot shows it plain (AUI-09) | One `ACTION_AUI` per bar; the kit decides emphasis, not the screenshot. |
| An active tab recoloured, or an underline added to match a screenshot | Leave tabs as they are: the filled chip is the standard. |
| A link in the top bar, a breadcrumb, a menu or a list of tabs, or a tab that is an `<a>`, with the browser underline (AUI-09) | `aui={NAV_LINK_AUI}` on a text `Button`, `Menubar.Button` or `Menubar.DropdownLinkItem` (React; a `Tabs.Tab`, or a `Button` that keeps a filled look, adds `sx: { textDecoration: 'none' }` to its own `aui` to keep its chip or fill), or the class `aui-text-decoration-none`; the focus ring and `aria-current` stay. A link in running text keeps its underline. |
| Copying a pattern the vendored release does not ship | Look in `src/vendor/atomic-aui/lib/` first. |
| New dependency for something the library does | Don't. Another UI library fails `npm run check` (AUI-01). |
| Editing `src/vendor/atomic-aui` to "fix" a look (AUI-06) | Never. Use `aui`, or `GAPS.md`. |
| A control that shows on scroll, hover, selection or edit mode makes its row or bar taller or wider (AUI-05) | Set its `aui.profile` to a defined value such as `'compact'`, or reserve its slot ([spacing.md](spacing.md) pattern 4); name the row in `evidence.views.json` `"rows"` so `check:layout` measures it. |
| An icon button or clickable icon wider than it is tall, or sized with px (AUI-11) | Use the square profile AtomicAUI defines: `'square'`, or `'square-compact'` in a compact row. |
| A pane written by hand from `PANE_AUI`, its header and body constants, or `Panels` in a screen (AUI-09) | `Panes`, `Pane`, `PaneBody` from `@/recipes/layout` ([panes](components/panes.md)). A pane written by hand passes no pane check. |
| A different look for the same job on another screen (AUI-09) | Reuse the recipe and `ACTION_AUI`. |
| One mode checked only (AUI-10) | Look at light, dark, desktop and narrow. |
| "Tests are green, so it looks right" (AUI-12) | Tests prove behaviour, not paint or geometry. Open the page. |
| An adapter call with no `.catch`: a blank or frozen screen when the network fails | Load failure: `EmptyState` with `onRetry`. Action failure: keep the edits, show a `Toast`. |
| Screens that call `fetch` or import `fixtures.ts` | Screens use `useData()` only ([data adapter](targets/data-adapter.md)). |
| Without the React parts: a class list shortened, mixed or written from memory (AUI-09) | Copy the whole block from `references/standard/recipes/`. A look that is not there is a line in `GAPS.md`. |
| Without the React parts: CSS of your own on `.aui-...`, a redefined `--theme-...` variable, an edited `aui/aui.css` (AUI-06) | Delete it. `node scripts/check-standard.mjs` names the property that was overridden. |
| Without the React parts: a `div` with a click handler (AUI-01) | A native `button type="button"` or `a` that carries a class recipe. |
| Without the React parts: a select, dialog, tabs or other heavy part rebuilt by hand | Select, dialog and tabs: load `aui/aui-behaviour.js` and write the part closed, as `references/standard/behaviour/reference.html` does. Any other heavy part is not in this version: one line in `GAPS.md` and a labelled placeholder ([path 2](paths/build-standard.md)). On a page you restyle, an old one keeps its markup, roles and behaviour and is styled where it is (`../aui-style-anything/references/restyle.md`). |
