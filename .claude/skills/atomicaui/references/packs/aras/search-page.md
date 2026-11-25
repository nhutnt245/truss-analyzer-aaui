# Recipe 2: search page

The Aras search page: toolbar, results table with a filter row and row selection, paging bar, context menu, empty state.
Code: `src/packs/aras/search/SearchPage.tsx`, `src/recipes/shared/PagingBar.tsx`, `src/recipes/shared/EmptyState.tsx`. Seen live at `#/pack/aras/search/Part`.
Screen it mirrors: the Aras search page and search grid.

## Use it
1. **Step one: `npm run screen:copy -- search`** (the same as `aras/search`), then edit `src/screens/search/`. It works in an app that has not turned the pack on: it turns it on first (`npm run pack:use -- aras`) and says so. If a file you changed blocks the pack, it copies nothing and names the file to merge. Never copy the files by hand. `PagingBar` and `EmptyState` stay shared kit parts: import them, do not copy them. Pass `itemType` and `onOpenItem(itemType, id)`.
2. Columns, filterable properties and labels come from the item type definition (`useItemType`), so a second item type needs a definition, not a new page.
3. Data comes from `useData().search({ itemType, filters, page, pageSize })`.
4. A spec that draws a select-all box in the header, or the whole paging bar at the end edge, is two gaps, each one line in your `GAPS.md` and a sentence in your final message (see "Not here"). Do not leave either out without that line.
5. Every view the spec lists (the page, a search with rows picked, the empty state) is a line in `evidence.views.json`; run `npm run evidence` and look at each picture.

## What is where
| Region | Parts |
|---|---|
| Toolbar | `View role="group"` (a labelled row of actions; no `role="toolbar"`) with `Button` Search (`ACTION_AUI`, the one main action), `Button` Clear, optional New. It spreads `BAR_AUI`: no padding at the sides, so Search starts at the table's left edge and New ends at its right edge |
| Table | `Table selectionMode="multiple"`; header row, filter row of `Input`, body rows. The selected row look is the library's: do not restyle it |
| Context menu | `ContextMenu` around the table; `ContextMenu.Item` Open |
| Paging bar | `PagingBar`: `IconButton` previous and next, range text, results per page `Select`. Also `BAR_AUI`: it starts and ends with the table |
| Empty state | `EmptyState` when a search returns nothing |

## Behaviour
- Enter in a filter box, or Search, applies all filters. `*` is a wildcard. Clear empties them and returns to page 1.
- Double-click a row, or right-click then Open, opens the item.
- Changing results per page returns to page 1.
- Selection is cleared when the results change.

## Adapter errors
Catch every adapter rejection. A failed load shows `EmptyState` with `onRetry` (short plain message, Retry re-runs the load).

## Change only
The context menu items (`// CHANGE:`), the toolbar buttons the source screen has, the page sizes.

## Not here
Header select-all: a composed `Table` has none (`GAPS.md`), and the recipe leaves the header cell of the selection column empty. A spec that shows one: add one line to your own `GAPS.md` and name it in your final message; never drop it silently, never build a checkbox by hand (AUI-01). `PagingBar` keeps previous, range and next at the start and results per page at the end; import it, never copy it. A spec that draws the whole bar at the end edge is a gap: one `GAPS.md` line.
Search modes, query type, Layouts, Refine columns, Share: add them when the source screen has them. Claim and Promote need adapter methods that do not exist yet. Sorting: `Table sortable` plus `sortDirection` and `onSortToggle` on each header cell the spec sorts draws its sort button; the adapter has no `sort` field yet. Ask first (AUI-08).

Tests: `src/packs/aras/search/SearchPage.test.tsx`.
The copied test is yours: change its cases with the screen, delete a case your spec does not have, and run it alone with `npm run test -- src/screens/search`.
