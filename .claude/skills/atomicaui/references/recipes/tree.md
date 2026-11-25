# Recipe 4: tree

A one-column tree: product structure, folders, categories. AtomicAUI 7.0.9 `TreeView` supplies the tree roles, selection and disclosure. The kit composes it as `Tree`.
Code: `src/recipes/shared/Tree.tsx`. Gallery: "Tree". Import it; do not copy it and never build a tree from `View` (AUI-01).

## Choose
| Need | Use |
|---|---|
| One column of nested rows (navigation, structure) | `Tree` from `@/recipes/shared/Tree` |
| Nested rows with several columns (a multi-level BOM with quantities) | `Table` with `getSubRows` and `expandable` ([table guide](../components/table.md)); in single selection a row with sub-rows only folds and cannot be picked |
| A flat list | `Table` or `List` |

## Use it (copy)
```tsx
import { Tree, type TreeNode } from '@/recipes/shared/Tree';

<View aui={STACK_AUI}>
  <Type role="l3" as="h2" aui={TEXT_AUI}>Product structure</Type>
  <Tree label="Product structure" nodes={nodes} onOpen={loadChildren} onPick={openPart} />
</View>
```
| Prop | Meaning |
|---|---|
| `label` | Accessible name. Required. |
| `nodes` | `{ id, label, children?, hasChildren? }[]`. `id` must be unique in the whole tree: when one item can appear in two places, use its path (`P-1008/P-1001`). |
| `defaultOpen` | Ids that start open. Each must already have its `children`: a row open from the start does not call `onOpen`, so never list a `hasChildren` row whose children are not loaded. |
| `onOpen(id)` | A row opened. Load its children through the data adapter and pass new `nodes`. Mark such a row `hasChildren: true`. |
| `onPick(id)` | The user picked a row. |
| `foldable` | Default `true`: levels fold. A parent row can be picked separately from its arrow. `false`: every level stays open, no arrow is drawn, and every row can be picked. No row opens, so `onOpen` is never called: pass the whole structure already loaded (a `hasChildren` node without `children` is drawn as a leaf). |

## What the library gives (do not rebuild)
`TreeView` supplies `role="tree"` and `treeitem`, level and position, one item in the Tab order, Up / Down / Home / End, Right opens, Left closes, and Enter or Space picks. The row picks; `TreeView.ItemArrow` only folds. `TreeView.ItemIcon` is optional. The recipe composes the library arrow and uses its selected-row look. Use `TreeView.ScrollArea` around a tree in a bounded scrolling pane when needed.

`Tree` keeps its existing import path and props. `defaultOpen` maps to `expandedValue`; `onPick` maps to `onValueChange`; opening a branch calls `onOpen`. `onOpen` fires only for a newly opened id: a row that stays open while its parent closes and opens again is not reported again, so a loader must keep the children already loaded under the row it loads. A `hasChildren` node whose `children` are left out has one empty, disabled child so TreeView can expose its fold arrow. Replace that pending child by passing the real `nodes` after loading; `children: []` means loaded with none, and the row becomes a leaf. With `foldable={false}` the recipe controls all branches open and draws no disclosure arrows. A single placeholder node with no children also has no arrow. TreeView's own spacing replaces the old table control-column inset. Without React: the `tree` recipe in `references/standard/recipes/tree.md`.

## Limits at 7.0.9
- No type-to-find or row virtualisation; very large structures are a risk.
- The default chevron needs the icon kit (`VITE_ICON_KIT_ID`) to show its glyph.
- With `foldable={false}`, TreeView still marks every parent `aria-expanded="true"`, and Left on a parent does not move focus to its parent: TreeView tries to close the branch and the recipe keeps it open. A library limit (`GAPS.md`); add no keyboard code around the tree.
- A long label wraps onto more lines instead of the old one-line ellipsis, so row heights can differ.

## Unknown behaviour
What a pick does (open the item, filter, nothing) comes from the source app or the spec. Unknown: ask, and mark it `// OPEN:` (AUI-08). Which items form the structure is data, and it comes from the source app or the spec (AUI-07). Never make up a structure, with or without an `// OPEN:` label.
1. The spec or source app lists it: use that list.
2. The app's data adapter has a call that returns this structure: get it through that call ([data adapter](../targets/data-adapter.md)), `onOpen` for the deeper levels, and use what it returns as it comes, the Aras pack's sample data included. The adapter cannot return it: never invent the structure to fill the gap, in a fixture or an adapter of your own.
3. Otherwise, with no list and no adapter call: build the pane and the Tree with one placeholder node whose label names the missing data, a `GAPS.md` line and `// OPEN:`. The placeholder tree takes `foldable={false}`: one node with no children has nothing to fold. Ask for the real structure (items, levels, which have children) in the final message; asking never replaces building.

Tests: `src/recipes/shared/Tree.test.tsx`.
