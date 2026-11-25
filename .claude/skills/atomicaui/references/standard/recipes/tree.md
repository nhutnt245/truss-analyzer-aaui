# Class recipes: TreeView: rows and fold arrows

Generated from the AtomicAUI 7.0.9 React parts by the kit's recipe build. Do not edit this page (AUI-13).
Copy a whole block, its wrapper included. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: no CSS of your own on it. Change the text, ids, names and values. On a layout box you may change layout classes (gap, display, width); never drop, add or swap any other class (AUI-09).
Hover, pressed, keyboard focus and disabled looks come from the stylesheet. `aui-theme.js` marks keyboard and mouse focus, so a click on a field shows no ring.

## tree
Use for: A one-column tree (locations, folders, product structure), drawn by AtomicAUI TreeView: rows with no border and no fill (paint text), a plain text-paint arrow to fold a parent, each level further in by the TreeView indent. Only the picked row is filled.
You add: Keep role="tree" and role="treeitem" with aria-level, aria-setsize, aria-posinset and one item with tabindex="0" (the picked one, else the first; the others -1). Keep the old tree's item identifiers (its data-key or id values) as they were; a restyle adds no data-key the old tree lacked. A parent item carries aria-expanded: a click on its arrow (aui-tree-view-chevron) opens or closes it, Right opens it, Left closes it (show or hide its role="group" of child items, and set aria-expanded and data-expanded); the arrow never picks. A tree that never folds (the React Tree with foldable={false}) is the same markup with every group open and each aui-tree-view-chevron empty, and no fold script. A click on a row (data-aui-tree-view-row), Enter or Space picks its item, a parent too; here North plant is picked. The picked item takes data-selected and aria-selected="true", and its row aui-color-solid-surface-alt in place of aui-color-text-surface; every other item keeps aria-selected="false" and its row aui-color-text-surface. Up, Down, Home and End move the focus between visible items. All of it is your own script: the class list has no state. Rows and arrows sit on the surface: never draw a row as a button, never a border or a tonal box (check-standard fails it). The indent is TreeView's: do not add padding.
```html
<div role="tree" aria-label="Locations" class="aui-tree-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0">
  <div role="treeitem" tabindex="-1" data-key="all" aria-level="1" aria-posinset="1" aria-setsize="1" aria-expanded="true" aria-selected="false" data-expanded class="aui-tree-view-item">
    <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tree-view-item-content aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0" data-aui-tree-view-row>
      <span aria-hidden="true" aria-label="Toggle All sites" class="aui-tree-view-chevron">
        <span aria-hidden="true" class="aui-contained-icon aui-bg-transparent aui-scale-contained-sm">
          <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-regular fa-caret-right" data-aui-icon-family="fa-7-pro" data-aui-icon-style="monotone"></i>
        </span>
      </span>
      <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-tree-view-item-text" data-aui-typeface="engineering" data-aui-typography="body">All sites</span>
    </div>
    <div role="group" class="aui-tree-view-group">
      <div role="treeitem" tabindex="0" data-key="north" aria-level="2" aria-posinset="1" aria-setsize="2" aria-expanded="true" aria-selected="true" data-expanded class="aui-tree-view-item" data-selected>
        <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tree-view-item-content aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface-alt aui-elevation-0" data-aui-tree-view-row>
          <span aria-hidden="true" aria-label="Toggle North plant" class="aui-tree-view-chevron">
            <span aria-hidden="true" class="aui-contained-icon aui-bg-transparent aui-scale-contained-sm">
              <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-regular fa-caret-right" data-aui-icon-family="fa-7-pro" data-aui-icon-style="monotone"></i>
            </span>
          </span>
          <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-tree-view-item-text" data-aui-typeface="engineering" data-aui-typography="body">North plant</span>
        </div>
        <div role="group" class="aui-tree-view-group">
          <div role="treeitem" tabindex="-1" data-key="north/1" aria-level="3" aria-posinset="1" aria-setsize="1" aria-selected="false" class="aui-tree-view-item">
            <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tree-view-item-content aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0" data-aui-tree-view-row>
              <span aria-hidden="true" aria-label="Toggle Line 1" data-aui-leaf class="aui-tree-view-chevron">
                <span aria-hidden="true" class="aui-contained-icon aui-bg-transparent aui-scale-contained-sm">
                  <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-regular fa-caret-right" data-aui-icon-family="fa-7-pro" data-aui-icon-style="monotone"></i>
                </span>
              </span>
              <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-tree-view-item-text" data-aui-typeface="engineering" data-aui-typography="body">Line 1</span>
            </div>
          </div>
        </div>
      </div>
      <div role="treeitem" tabindex="-1" data-key="south" aria-level="2" aria-posinset="2" aria-setsize="2" aria-selected="false" class="aui-tree-view-item">
        <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tree-view-item-content aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0" data-aui-tree-view-row>
          <span aria-hidden="true" aria-label="Toggle South plant" data-aui-leaf class="aui-tree-view-chevron">
            <span aria-hidden="true" class="aui-contained-icon aui-bg-transparent aui-scale-contained-sm">
              <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-regular fa-caret-right" data-aui-icon-family="fa-7-pro" data-aui-icon-style="monotone"></i>
            </span>
          </span>
          <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-tree-view-item-text" data-aui-typeface="engineering" data-aui-typography="body">South plant</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

## tree-scroll
Use for: A tree in the card that fills a tab panel (pane-tabs-header-fill, recipes/tabs-fill.md): the tree sits in an unpadded scroll area, which scrolls the rows below the pane.
You add: Everything the tree recipe says about the tree. Put the whole block in place of the table of pane-tabs-header-fill, as the only child of its card (data-aui-pane-body="fill"), and load aui/aui-behaviour.js: it scrolls the scroll area. The tree does not scroll by itself: without the scroll area the rows below the pane cannot be reached.
```html
<div role="presentation" class="aui-view-scroll-area aui-frame aui-scale-no-padding-sm aui-typography-typescale-default aui-shape-none aui-color-text-surface aui-elevation-0 aui-min-height-0 aui-flex-fill" style="--aui-scrollbar-size: var(--p-px-8)">
  <div role="presentation" tabindex="-1" class="aui-view-scroll-area-viewport">
    <div role="tree" aria-label="Locations" class="aui-tree-view aui-frame aui-scale-block-padding-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0">
      <div role="treeitem" tabindex="0" data-key="all" aria-level="1" aria-posinset="1" aria-setsize="1" aria-expanded="true" aria-selected="false" data-expanded class="aui-tree-view-item">
        <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tree-view-item-content aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0" data-aui-tree-view-row>
          <span aria-hidden="true" aria-label="Toggle All sites" class="aui-tree-view-chevron">
            <span aria-hidden="true" class="aui-contained-icon aui-bg-transparent aui-scale-contained-sm">
              <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-regular fa-caret-right" data-aui-icon-family="fa-7-pro" data-aui-icon-style="monotone"></i>
            </span>
          </span>
          <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-tree-view-item-text" data-aui-typeface="engineering" data-aui-typography="body">All sites</span>
        </div>
        <div role="group" class="aui-tree-view-group">
          <div role="treeitem" tabindex="-1" data-key="north" aria-level="2" aria-posinset="1" aria-setsize="2" aria-expanded="true" aria-selected="false" data-expanded class="aui-tree-view-item">
            <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tree-view-item-content aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0" data-aui-tree-view-row>
              <span aria-hidden="true" aria-label="Toggle North plant" class="aui-tree-view-chevron">
                <span aria-hidden="true" class="aui-contained-icon aui-bg-transparent aui-scale-contained-sm">
                  <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-regular fa-caret-right" data-aui-icon-family="fa-7-pro" data-aui-icon-style="monotone"></i>
                </span>
              </span>
              <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-tree-view-item-text" data-aui-typeface="engineering" data-aui-typography="body">North plant</span>
            </div>
            <div role="group" class="aui-tree-view-group">
              <div role="treeitem" tabindex="-1" data-key="north/1" aria-level="3" aria-posinset="1" aria-setsize="1" aria-selected="false" class="aui-tree-view-item">
                <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tree-view-item-content aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0" data-aui-tree-view-row>
                  <span aria-hidden="true" aria-label="Toggle Line 1" data-aui-leaf class="aui-tree-view-chevron">
                    <span aria-hidden="true" class="aui-contained-icon aui-bg-transparent aui-scale-contained-sm">
                      <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-regular fa-caret-right" data-aui-icon-family="fa-7-pro" data-aui-icon-style="monotone"></i>
                    </span>
                  </span>
                  <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-tree-view-item-text" data-aui-typeface="engineering" data-aui-typography="body">Line 1</span>
                </div>
              </div>
            </div>
          </div>
          <div role="treeitem" tabindex="-1" data-key="south" aria-level="2" aria-posinset="2" aria-setsize="2" aria-selected="false" class="aui-tree-view-item">
            <div class="aui-stateful aui-focus-color-info aui-focus-width-2 aui-tree-view-item-content aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-text-surface aui-elevation-0" data-aui-tree-view-row>
              <span aria-hidden="true" aria-label="Toggle South plant" data-aui-leaf class="aui-tree-view-chevron">
                <span aria-hidden="true" class="aui-contained-icon aui-bg-transparent aui-scale-contained-sm">
                  <i aria-hidden="true" class="aui-icon aui-icon-size-fallback-14 fa-regular fa-caret-right" data-aui-icon-family="fa-7-pro" data-aui-icon-style="monotone"></i>
                </span>
              </span>
              <span class="aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-tree-view-item-text" data-aui-typeface="engineering" data-aui-typography="body">South plant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```
