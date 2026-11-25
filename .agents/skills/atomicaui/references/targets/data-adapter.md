# Data adapter

Screens get all data from one interface. Nothing else touches data. The general starter has no data yet; the interface below ships with the [Aras pack](../packs/aras/start.md) and any screen can use it.

## Files
| File | Job |
|---|---|
| `src/packs/aras/data/adapter.ts` | The `DataAdapter` interface (`listItemTypes`, `search`, `getItem`, `getRelationship`, `saveItem`) |
| `src/packs/aras/data/types.ts` | Item type definitions (columns, form fields, relationships) and item shapes |
| `src/packs/aras/data/fixtures.ts` | Fixtures implementation: neutral sample parts and documents, in memory |
| `src/packs/aras/data/DataContext.tsx` | `DataProvider`, `useData()`, `useItemType()` |
| `src/data/index.ts` | Yours, written by `npm run pack:use -- aras`: re-exports the pack's data and holds `createDataAdapter()`, the one line that picks the implementation |

## Rules
- Screens call `useData()`. They never import `fixtures.ts` and never call `fetch`.
- Sample data is invented and generic. Never copy real company data into fixtures.
- A new screen that needs data the interface lacks: the pack is read-only, so never add the method to its `DataAdapter` or fixtures. Write a line in `GAPS.md`, or give your screen its own adapter type in `src/data/`.

## Adding a REST implementation later
1. Create `src/data/rest.ts` exporting `createRestAdapter(): DataAdapter`.
2. `listItemTypes` returns the same definitions (they are the app's own, not fetched).
3. `search` maps `filters` and paging to the REST query and returns `{ items, total }`.
4. `getItem`, `getRelationship` and `saveItem` map to item reads and updates; throw `NotFoundError` for a missing item.
5. Switch `createDataAdapter()` in `src/data/index.ts`. No screen changes.
Sign-in and access to a real instance are not part of this version.
