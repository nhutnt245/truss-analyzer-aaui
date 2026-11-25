# Popover

A small panel that opens under or beside a control and holds controls of its own: a list of switches, a short form. It stays open while you use it and closes on Escape or a click outside. Release 7.0.9.
Source: `src/vendor/atomic-aui/lib/popover/` (an unstyled seam over Base UI, so it paints nothing: the popup is a `View`). Working code: `src/recipes/shared/ColumnPicker.tsx` (hs `ColumnVisibility.tsx:101-138`, hcs `ColumnVisibility.tsx:120-158`).

## Use / do not use
| Need | Use |
|---|---|
| Controls in a panel that opens from a button | `Popover` |
| A list of actions | `Dropdown` (a menu) |
| A hint on hover | `Tooltip` |
| A blocking task or a form | `Dialog` |
| A pick from a list | `Field.Select` |

## Parts
| Part | Job |
|---|---|
| `Popover` | The root: `open`, `onOpenChange`, `defaultOpen`. It renders no box |
| `Popover.Trigger` | The button that opens it. `render={<IconButton … />}` makes your own button the trigger |
| `Popover.Portal`, `Popover.Positioner` | Lift the popup out of its parent and place it: `side="bottom" align="end" sideOffset={4}` |
| `Popover.Popup` | The panel. `render={<View aui={POPUP_AUI} />}` (from `@/recipes/shared/aui`) gives it its look; give it an `aria-label` |
The popover is not modal: the page behind stays usable. Keep it inside the app's identity provider (`App` does), or the portal has no theme.

## The kit look
`POPUP_AUI` (`@/recipes/shared/aui`) gives every popup the same look (AUI-09): a floating surface, `color: 'surface'`, `paint: 'solid'`, `profile: 'default'`, `shape: 'soft'`, `elevation: 4`, a column with gap 8 and a width token (320 in hs and hcs). Only a library popup floats: a styled piece never takes an elevation (`../aui-style-anything/SKILL.md`).
```tsx
import { PANE_ICON_AUI, POPUP_AUI } from '@/recipes/shared/aui';

<Popover>
  <Popover.Trigger render={<IconButton name="table-columns" aria-label="Configure columns" aui={PANE_ICON_AUI} />} />
  <Popover.Portal>
    <Popover.Positioner side="bottom" align="end" sideOffset={4}>
      <Popover.Popup aria-label="Configure columns" render={<View aui={POPUP_AUI} />}>…</Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover>
```

## Mistakes
- A popup look written by hand: use `POPUP_AUI`, so every popover has the same elevation, width and padding. `npm run check` fails a `Popover.Popup` without it, or with more after it than `sx: { ...POPUP_AUI.sx, … }` with `height`, `minHeight`, `maxHeight` or `overflow` (AUI-09).
- A plain `Button` as the trigger of an icon-only action: use `render={<IconButton aria-label="…" />}`.
- No `Popover.Positioner`: the popup lands at the corner of the page.
- Judging the placement or the dismissal in a unit test: look in a browser, light and dark, and check the popup is inside the window.
- A popover for a destructive confirmation: that is `AlertDialog`.
- Without React there is no behaviour record for it: the page's own script opens it (`GAPS.md`).

More: `src/vendor/atomic-aui/lib/popover/popover.tsx`.
