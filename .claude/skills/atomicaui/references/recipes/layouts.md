# Page layouts

Five arrangements, each a working screen in `src/gallery/layouts/`. Open one at `#/layout/<name>` (`one`, `two`, `side-pair`, `three`, `above`). They are whole pages under the top bar of the [app frame](app-frame.md); your own screens are written the same way. Inside the Aras pack's shell a screen is drawn inside the shell's page pane: it brings its own card and never writes `Panes` or `Pane` (PN7). The blocks and their rules: [panes](../components/panes.md).

| Arrangement | Address | File |
|---|---|---|
| One pane | `#/layout/one` | `OnePane.tsx` |
| Two side by side | `#/layout/two` | `TwoPanes.tsx` |
| A side pane and a nested pair | `#/layout/side-pair` | `SideAndPair.tsx` |
| Three in a row | `#/layout/three` | `ThreeInARow.tsx` |
| One above two | `#/layout/above` | `OneAboveTwo.tsx` |

## One pane
```tsx
<Panes label="Overview">
  <Pane id="overview" title="Overview" size="main">
    <PaneBody><Sections sections={sections} /></PaneBody>
  </Pane>
</Panes>
```

## Two side by side
```tsx
<Panes label="List and details">
  <Pane id="list" title="Work orders" size="narrow" actions={<IconButton name="gear" aria-label="List settings" aui={PANE_ICON_AUI} />}>
    <PaneBody>…</PaneBody>
  </Pane>
  <Pane id="details" title="Details" size="main" labelled actions={<><Button>Cancel</Button><Button aui={ACTION_AUI}>Save</Button></>}>
    <PaneBody>…</PaneBody>
  </Pane>
</Panes>
```

## A side pane and a nested pair
```tsx
<Panes label="Filters and work area">
  <Pane id="filters" title="Filters" size="narrow" collapsible="start">
    <PaneBody><Sections sections={filters} /></PaneBody>
  </Pane>
  <PaneGroup id="work" size="main">
    <Panes orientation="vertical" nested label="Overview and orders">
      <Pane id="overview" title="Overview" size="upper"><PaneBody surface="cards">…</PaneBody></Pane>
      <Pane id="orders" title="Orders" size="lower" labelled actions={…}><PaneBody scroll="content">…</PaneBody></Pane>
    </Panes>
  </PaneGroup>
</Panes>
```

## Three in a row
```tsx
<Panes label="Folders, items and properties">
  <Pane id="folders" title="Folders" size="narrow"><PaneBody>…</PaneBody></Pane>
  <Pane id="items" title="Items" size="main"><PaneBody>…</PaneBody></Pane>
  <Pane id="properties" title="Properties" size="narrow"><PaneBody>…</PaneBody></Pane>
</Panes>
```

## One above two
```tsx
<Panes orientation="vertical" label="Summary and the two lists">
  <Pane id="summary" title="Summary" size="upper"><PaneBody>…</PaneBody></Pane>
  <PaneGroup id="lists" size="lower">
    <Panes nested label="Open and closed">
      <Pane id="open" title="Open" size="half"><PaneBody>…</PaneBody></Pane>
      <Pane id="closed" title="Closed" size="half"><PaneBody>…</PaneBody></Pane>
    </Panes>
  </PaneGroup>
</Panes>
```

## Notes
- An app need not have three panes. Say your own layout as a tree; the layout is yours, the look of each pane is the kit's.
- A navigation list is a pane (`size="narrow"`, a `Sections` or a `Tree` in its body).
- Below 768 px the group is one column and the page scrolls; a resizable row is one column too while the window cannot hold its panes at their minimum sizes. No phone layout is designed unless the spec asks.
