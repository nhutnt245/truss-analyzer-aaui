# Pack: Aras

An optional set of screens for an app that works like the Aras client: a shell with a navigation panel and page tabs, a search page and an item page, all on a data adapter. The general starter does not need it. A fresh clone shows it only as a demo at `#/pack/aras/search/Part`.

## Turn it on
```
npm run pack:use -- aras
npm run verify:fast
```
It replaces the starter's `src/app/route.ts`, `Screen.tsx`, `App.tsx` (and their tests), `src/screens/index.ts`, `src/main.tsx` and `evidence.views.json` with the pack's versions (`src/packs/aras/seed/*.seed`), and adds `src/data/index.ts` and the app's own host page, `public/host.html` (yours, [frame](frame.md)). It overwrites a file only while it is still the starter's. A file you changed is listed ("merge by hand: the Aras version is ...") and nothing is written: merge each by hand, then run the command it prints (`npm run pack:use -- aras --accept <file> ...`), which keeps those files as they are and writes the rest. The pack is then recorded in `src/app/packs.json` (yours), and a second run says "already in use" and changes nothing but a missing `public/host.html` (a host page that is there is never overwritten).

## What the pack holds
| Recipe | Page | Code |
|---|---|---|
| App shell: top bar, navigation panel, page tabs | [app-shell](app-shell.md) | `src/packs/aras/shell/` |
| Search page | [search-page](search-page.md) | `src/packs/aras/search/` |
| Item page | [item-page](item-page.md) | `src/packs/aras/item/` |

Make one yours with `npm run screen:copy -- aras/item` (or `aras/shell`, `aras/search`). The copy goes to `src/screens/<name>/`.

## Two modes
Shell mode (the whole shell) and bare mode (only the routed screen, for a frame inside the Aras client): [frame](frame.md). Both are `ArasStarter` (`src/packs/aras/Starter.tsx`), the same component the demo shows. After `pack:use` your `src/app/App.tsx` and `Screen.tsx` hand it the shell and the pages from `src/screens/index.ts`, so a copy made with `screen:copy` is what the app shows. A screen of your own inside the shell: its route in `src/app/route.ts` (your `Route` is the pack's or yours), its case in `Screen.tsx` before the pack's, and its page tab: `App.tsx` passes `ArasStarter` a `pageFor` that returns that tab, then the pack's `pageFor`.

## Data
All data comes from the `DataAdapter` in `src/packs/aras/data/`, on invented sample data. The one line that picks the implementation is `createDataAdapter()` in your `src/data/index.ts` ([data adapter](../../targets/data-adapter.md)).

## An app made from kit 0.3.x
It typechecks and builds after an update: `src/recipes/shell`, `search` and `item`, and every file that was in them (`FieldGrid`, `FormField` included), forward to their new place for one version (removed in 0.5.0). Its own `src/data/` keeps its own data context, which the pack's screens and their copies do not see, so `npm run check` names the one migration step (AUI-13), to use the pack's: copy `src/packs/aras/seed/data/index.ts.seed` over `src/data/index.ts` (keep your own `createDataAdapter()`), delete the other files of `src/data/`, and point imports of `@/data/testing` at `@/packs/aras/data/testing` and `src/test-utils.tsx` at `src/packs/aras/testing.tsx`.

## Native Aras screens
A form, grid or toolbar that Aras, or another application, draws itself is never restyled: no CSS against the host's classes, no `!important`, no attribute of ours on it. "Make the grid on this page look like ours" is answered with: native controls stay the host's, colours can be aligned by configuration, and ask what is wanted. **On this stop, add one line to `GAPS.md`** (an app that has none: create it): `- Host-owned grid on <page>: native controls stay the host's; not restyled, not hidden, not replaced; asked: <what is wanted>.` Never hide or replace the host's grid, and offer no such option.
