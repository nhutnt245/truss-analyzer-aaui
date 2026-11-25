# Tabs

Peer views of the same thing, or the open pages of an app. Release 7.0.9.
Source: `src/vendor/atomic-aui/lib/tabs/`. Working code: `src/packs/aras/shell/AppShell.tsx` (page tabs), `src/packs/aras/item/ItemPage.tsx` (relationship tabs).

## Use / do not use
| Need | Use |
|---|---|
| Switch between views of one item | `Tabs` |
| One tab per open page, closable | `Tabs` with `Tabs.CloseButton` |
| Fold sections that can all stay open | `Accordion` |
| Pick a value | `Field.Select` |

## Parts
`Tabs` (root, `value` / `defaultValue` / `onValueChange`), `Tabs.List`, `Tabs.Tab` (`value`), `Tabs.Panel` (`value`), `Tabs.Indicator` (underline, optional), `Tabs.Icon`, `Tabs.CloseButton`, `Tabs.AddButton`, `Tabs.PinButton`.
Default look: filled chips; the active tab is the darker chip. That is the standard: do not recolour the active tab and do not add an underline to match a screenshot.

## Basic (copy)
```tsx
<Tabs defaultValue="bom">
  <Tabs.List>
    <Tabs.Tab value="bom">BOM</Tabs.Tab>
    <Tabs.Tab value="documents">Documents</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="bom" aui={TAB_PANEL_AUI}>...</Tabs.Panel>
  <Tabs.Panel value="documents" aui={TAB_PANEL_AUI}>...</Tabs.Panel>
</Tabs>
```
Only the active panel is mounted, so a panel that fetches data fetches when its tab opens.

For an unavailable view, write `<Tabs.Tab value="changes" disabled>Changes</Tabs.Tab>` beside the enabled tabs. Its disabled colour and attributes come from the part; class-form pages copy the complete `tabs-disabled` block in `references/standard/recipes/tabs.md`.

When the pane header holds the tab row, keep one `Tabs` root around `Panes` (`aui={{ sx: { flex: 'fill', minHeight: '0' } }}`), pass the tab row to `Pane.tabs`, and write one panel per view directly in the `Pane`, in place of `PaneBody`. The panel is the row of the pane, as in the hs and fd prototypes: `Pane.tabs` puts the tab row 8 px inside the header, and the panel puts its card the same 8 px inside the frame and 4 px under the header, so the card starts at the left edge of the tab row.

| Content | Panel body |
|---|---|
| A form, sections or text | `<Tabs.Panel value="bom" aui={PANE_TAB_PANEL_AUI}><View.ScrollArea scrollAxis="vertical" scrollbarSize={8} aui={PANE_TAB_SCROLL_AUI}><View data-aui-pane-body="card" aui={BODY_CARD_AUI}>…</View></View.ScrollArea></Tabs.Panel>`: the unpadded scroll area scrolls content taller than the pane |
| A table, tree or drawing frame | `<Tabs.Panel value="bom" aui={PANE_TAB_PANEL_AUI}><PaneTabBody>…</PaneTabBody></Tabs.Panel>` (`PaneTabBody` from `@/recipes/layout`): the card is the panel's only child and fills it. A table (`TABLE_PROPS`) or a drawing frame scrolls inside its own frame; a tree does not scroll by itself, so it goes in `<View.ScrollArea scrollAxis="vertical" scrollbarSize={8} aui={PANE_TAB_SCROLL_AUI}>` inside the card. Below 768 px the card is as high as what it holds, 192 px at least, as in `PaneBody scroll="content"` |

Never put a card with `flex: 'fill'` inside the scroll area: it grows past the pane. `PANE_TAB_PANEL_AUI` is for this place only and takes nothing after it. Never put `PaneBody` or another padded box in the panel, and never put the panels inside a body card (a table in a panel would start 8 px to the right of the tab row). The class-form compositions: `pane-tabs-header` in `references/standard/recipes/tabs.md` for the first row, `pane-tabs-header-fill` in `references/standard/recipes/tabs-fill.md` for the second.

The tab row is `<View.ScrollArea data-aui-tab-row="" aui={TAB_ROW_AUI}><View.ScrollAreaViewport><Tabs.List aui={TAB_ROW_LIST_AUI}>…</Tabs.List></View.ScrollAreaViewport></View.ScrollArea>`. `TAB_ROW_LIST_AUI` makes the list as wide as its tabs, so a tab that keeps a width (a `width` or a `minWidth` in its `sx`) is never squeezed: the tabs that do not fit scroll sideways inside the row, and the page never does (AUI-10). A list that shrinks its tabs first (`overflow="shrink"`, the closable page tabs below) takes no `TAB_ROW_LIST_AUI`: its tabs scroll once they are at their floor. Composed with only its viewport the scroll area shows no bar, as in hs, agpd, fd and pfd. Never scroll a tab row with `overflowX` in `sx` or with app CSS.

## What sits under the tabs lines up with them
Every `Tabs.Panel` takes `aui={TAB_PANEL_AUI}` (`@/recipes/shared/aui`), except the panel of a pane whose header holds the tab row (above): the panel paints nothing and has no padding of its own. The table, card or form in it then starts at the left edge of the tab row and ends at its right edge, 6 px under the tabs (the gap of `Tabs`), as in the prototypes, where the tab and the card or frame under it share one left edge. The library default pads the panel 4 / 8, which puts a table 8 px inside the tab row.
- Put no padded `View` between the panel and what it holds.
- After the constant only `sx` with layout keys, for a panel that fills its pane: `aui={{ ...TAB_PANEL_AUI, sx: { display: 'flex', flexDirection: 'column', flex: 'fill', minHeight: '0' } }}`.
- `npm run check` fails a panel without one of the two constants (AUI-09); `npm run check:layout` measures the tab row against what is under it (AUI-05).

## Closable page tabs (copy)
Tabs render as non-buttons so the close button can sit inside. The list shrinks its tabs first (`overflow="shrink"`), down to their floor; the tabs that still do not fit scroll sideways inside the tab row.
```tsx
<View.ScrollArea data-aui-tab-row="" aui={TAB_ROW_AUI}>
  <View.ScrollAreaViewport>
    <Tabs value={activeKey} onValueChange={(value) => activate(String(value))}>
      <Tabs.List overflow="shrink">
        {pages.map((page) => (
          <Tabs.Tab key={page.key} value={page.key} nativeButton={false} render={<div />}>
            <View as="span" aui={TAB_LABEL_AUI}>{page.title}</View>
            <Tabs.CloseButton aria-label={`Close ${page.title}`} onClick={() => close(page.key)} />
          </Tabs.Tab>
        ))}
        <Tabs.AddButton name="plus" aria-label="New page" onClick={addPage} />
      </Tabs.List>
    </Tabs>
  </View.ScrollAreaViewport>
</View.ScrollArea>
```
The close and add buttons follow the tab colours; give them no `aui`. Here the page content lives outside `Tabs` (no `Tabs.Panel`), which is fine when the app owns what is shown.

## Looks
- Per-state tab look: only when the spec names one. It goes in `Tabs.Tab aui.states` (AUI-04), never in a conditional prop.
- Colour, scale and shape set once on `Tabs` flow to every part.
- Vertical: `<Tabs orientation="vertical">`.
- Leading icon: `<Tabs.Icon name="gauge" aria-hidden />` before the label.

## Corners follow the gap
- Tabs with a gap between them (the default, 6 px): each tab keeps its soft corners. Set no shape.
- Tabs with no gap (`<Tabs.List aui={{ sx: { gap: '0' } }}>`): no corners. Set `shape: 'none'` once on `Tabs`; never on a `Tabs.Tab`.
- The tab row is like the top bar: from edge to edge of the window, no corners (`{ ...TAB_ROW_AUI, shape: 'none' }`); with space around it, as in a pane header, soft (`TAB_ROW_AUI`). In an inset row of touching tabs, keep the row and list soft while the tabs stay square: copy `tabs-gapless` from `references/standard/recipes/tabs.md`.
- The tabs of an edge-to-edge row start at the window edge: `npm run check:layout` allows that for this row, as for the top bar, and for nothing else (AUI-05). What the panel holds starts there too, so use this row over what spans the window (a table); a page of panes takes its tabs in a pane header (above). The class form is `tabs-edge` in `references/standard/recipes/tabs-edge.md`.

## Closable tabs
The label sits in `<View as="span" aui={TAB_LABEL_AUI}>` (it takes the free width), so the close button is always at the far right edge of the tab, as in the ADC prototype. Never put the label bare beside the button. The close button is square (`Tabs.CloseButton`, AUI-11).

## Mistakes
- Hand-built tabs from `View` and state in your own code.
- A `variant`, `kind` or `pill` prop: none exists.
- `Tabs.Indicator` under the default chips: at 7.0.9 it draws a 2 px bar in the surface colour, so nothing shows. Leave it out.
- `Tabs.CloseButton` or `Tabs.AddButton` without `aria-label` (AUI-11).
- A close button inside a tab that is a native button (use `nativeButton={false} render={<div />}`; the `<div />` needs a `check-allow: AUI-03` comment).
- A tab drawn as an `<a>` (`render={<a href="..." />}`) with the browser underline: `aui={{ sx: { textDecoration: 'none' } }}` on that `Tabs.Tab` (not `NAV_LINK_AUI`: its text paint would drop the chip). `npm run check:layout` fails an underlined tab or tab link.
- Tabs for things that are not peers of one item.
- A `Tabs.Panel` left on the library default, or a padded `View` inside it: the table sits 8 px inside the tab row. `aui={TAB_PANEL_AUI}`; under a pane header that holds the tab row, `aui={PANE_TAB_PANEL_AUI}`.

More: `src/vendor/atomic-aui/lib/tabs/tabs.tsx`.
