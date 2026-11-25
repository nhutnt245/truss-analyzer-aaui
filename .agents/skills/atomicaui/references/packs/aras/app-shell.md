# Recipe 1: app shell

The frame of an Aras-style app: company top bar, pinnable navigation panel, page tabs with close buttons, theme toggle.
Code: `src/packs/aras/shell/AppShell.tsx` and `use-pages.ts`. Seen live at `#/pack/aras/search/Part`.
Screen it mirrors: the Aras main window (navigation panel, page tabs).

## Use it
1. The app already uses it through `src/screens/index.ts`. To change it: `npm run screen:copy -- aras/shell`, then edit `src/screens/shell/`. Never edit `src/packs/aras/shell/`.
2. `ArasStarter` (`src/packs/aras/Starter.tsx`) holds the open pages in `useOpenPages`: `open(page)`, `close(key)` (returns the page that became active; navigate to it), `activate(key)`. A page is `{ key, title, route }`; `pageFor` gives the tab of a route, and a screen of your own gets its tab from the `pageFor` your `App.tsx` passes ([start](start.md)).
3. It renders the active page as the shell's `children`. The shell does not know about routes or data.
4. Replace `src/assets/logo.svg` with the company mark. Keep the 40 x 24 rail.

## What is where
| Region | Parts |
|---|---|
| Top bar | `Menubar`, `Menubar.IconButton` (navigation toggle, theme toggle), `Menubar.Spacer`, logo in a `View`, app name in `Type` |
| Top bar corners | The bar reaches the window edges, so `sx: { radius: 'none' }` squares only the bar; its buttons keep their soft corners ([app frame](../../recipes/app-frame.md)) |
| Page frame, panes | `<Panes resizable={false} stack={false}>` holding two `Pane`s: navigation (`size="nav"`, 224) and the page body (`tabs` in its header) from `src/recipes/layout/` ([panes](../../components/panes.md), S9 in `references/spacing.md`) |
| Navigation panel | `Pane` with `PaneBody scroll="content"`, pin toggle in the header (`View interactive selected` with `aui.states.selected`, 20 x 20 like every header icon control), `Accordion` of categories (`SECTION_ITEM_AUI` first, `SECTION_DIVIDER_AUI` after), `Button paint: 'text'` per entry |
| Page tabs | `Tabs`, `Tabs.Tab` per page: label in `<View as="span" aui={TAB_LABEL_AUI}>`, then `Tabs.CloseButton` at the far right. The `Tabs` sits in the tab row (`<View.ScrollArea data-aui-tab-row="" aui={TAB_ROW_AUI}>` with only its viewport): the tabs shrink to their floor first, and those that still do not fit scroll sideways inside the row ([tabs](../../components/tabs.md)). The row scrolls to the tab of a page that opens or is picked, so the active tab is always shown |
| Screen area | `View.ScrollArea` |

## Behaviour
- Pinned: the panel stays beside the page. Unpinned: it hides on an outside click and after picking an entry.
- On a narrow window (under 768 wide) the panel starts hidden and unpinned.
- Opening a page that is already open only activates it. Closing the active tab activates its left neighbour.
- Theme: `useTheme()` in `src/app/theme.ts` stores light or dark; the shell only shows the toggle.

## Change only
Lines marked `// CHANGE:`, the `appName`, the navigation categories (from the item types), the logo.

## Not here
Split screens, favourites, a search field in the panel. Add them only when the source screen has them (AUI-07).

Tests: `src/packs/aras/shell/AppShell.test.tsx`.
