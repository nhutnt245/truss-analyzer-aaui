# Recipe: app frame

The top bar and the page under it. The general starter's `App` wraps the routed screen in it, so every screen sits under a 36 px bar and writes `Panes` for its layout.
Code: `src/recipes/layout/AppFrame.tsx`. Seen live at `#/home` and `#/layout/two`. Import it; the bar is the same in every app.

## Use it (copy)
```tsx
import { AppFrame } from '@/recipes/layout';

<AppFrame appName={APP_NAME} theme={theme} onToggleTheme={toggleTheme}>
  <Screen route={route} />
</AppFrame>
```

## Navigation links in the bar (copy)
Two or more links to pages of the app go in the bar's `menus` prop: one `<nav>` of `Menubar.Button` links, the kit's link (`nativeButton={false} render={<a href="..." />}`, `references/convert/map-react.md`) in the bar's button. Each is a real link (an `href`, `role="link"` on the `<a>`, no click handler) and the current page carries `aria-current="page"`. At 7.0.9 a `Button` has no selected look, so the current link looks like the others (`GAPS.md`); never mark it with a conditional `aui` or class (AUI-04). A bar link has no underline at any width: `aui={NAV_LINK_AUI}` (`@/recipes/shared/aui`: text paint, `textDecoration: 'none'`; the browser underlines every `<a>` otherwise) on each `Menubar.Button` of the row and each `Menubar.DropdownLinkItem` of the folded menu, and `npm run check:layout` fails an underlined link in a bar, a navigation, a list of tabs or an open menu, a link that marks the current page, and an underlined tab; the focus ring stays. The same holds for a link anywhere else that acts as navigation: a text `Button` rendered as an `<a>` (a breadcrumb link) takes `aui={NAV_LINK_AUI}`; a `Tabs.Tab`, or a `Button` that keeps a filled look, rendered as an `<a>` adds `sx: { textDecoration: 'none' }` to its own `aui` (the text paint of `NAV_LINK_AUI` would drop its chip or fill, `references/components/tabs.md`). A link inside running text keeps its underline. The bar stays 36 px high (PN11). A window under 768 px has no room for the row: the links fold into one `Menubar.Dropdown` "Menu" whose items are `Menubar.DropdownLinkItem`, the same links, and unfold when the window widens again. Keep the theme toggle where the frame puts it; add no button of your own to the bar.
```tsx
import { useSyncExternalStore } from 'react';
import { Menubar, View } from '@/vendor/atomic-aui';
import { NAV_LINK_AUI } from '@/recipes/shared/aui';

// your pages: the address and the label of each
const LINKS = [{ href: '#/orders', label: 'Orders' }, { href: '#/customers', label: 'Customers' }];
const NAV_AUI = { paint: 'text', profile: 'no-padding', sx: { display: 'flex', alignItems: 'center', gap: '4', flex: 'none' } } as const;
const followWidth = (onChange: () => void) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};

export function NavLinks({ current }: { current: string }) {
  const narrow = useSyncExternalStore(followWidth, () => window.innerWidth < 768);
  if (narrow) {
    return (
      <Menubar.Dropdown>
        <Menubar.DropdownTrigger>Menu<Menubar.Chevron /></Menubar.DropdownTrigger>
        <Menubar.DropdownPortal>
          <Menubar.DropdownPositioner>
            <Menubar.DropdownPopup>
              {LINKS.map((link) => (
                <Menubar.DropdownLinkItem key={link.href} aui={NAV_LINK_AUI} href={link.href} aria-current={link.href === current ? 'page' : undefined}>{link.label}</Menubar.DropdownLinkItem>
              ))}
            </Menubar.DropdownPopup>
          </Menubar.DropdownPositioner>
        </Menubar.DropdownPortal>
      </Menubar.Dropdown>
    );
  }
  return (
    <View as="nav" aria-label="Main" aui={NAV_AUI}>
      {LINKS.map((link) => (
        <Menubar.Button key={link.href} aui={NAV_LINK_AUI} nativeButton={false} render={<a href={link.href} role="link" />} aria-current={link.href === current ? 'page' : undefined}>{link.label}</Menubar.Button>
      ))}
    </View>
  );
}

// NAV_LINK_AUI is the whole look of a bar link: add no other style to it.
// In your screen or App: <AppFrame ... menus={<NavLinks current={window.location.hash} />}> (AppFrame from '@/recipes/layout')
```
Measured in a real browser on this block at 1440 and 390 px: the bar is 36 px high at both and the page does not scroll sideways; at 1440 the row holds two links with role `link` and one `aria-current="page"`; at 390 it is the "Menu" trigger, whose menu holds the same two links as `Menubar.DropdownLinkItem` entries (`href` and the one `aria-current`); a window resized from 1440 to 390 and back folds and unfolds the row. List the page in `evidence.views.json` at both widths; for the folded menu add a view that clicks `Menu`.

## What is where
| Part | Where |
|---|---|
| Logo rail, 40 x 24 | `src/assets/logo.svg` |
| App name | `src/app/app.config.ts` (`APP_NAME`) |
| Menus (optional) | the `menus` prop: children of the bar, after the name |
| Theme toggle | always in the bar, so the bar is always 36 px (PN11) |
| Corners | An edge-to-edge bar takes `sx: { radius: 'none' }`: only its own corners are square and its buttons stay soft. A bar with space around it keeps the default soft corners. For class form, copy `top-bar-edge` or `top-bar-inset` from `references/standard/recipes/top-bar.md`, or `top-bar-links` for a bar with page links |
| The page under the bar | `children`; it fills the rest of the window |

## Change only
The app name, the logo file and the menus. Nothing else, and not the bar's height.

## Not here
- A navigation panel and page tabs: the Aras pack's shell ([start](../packs/aras/start.md)). Links in the bar: the recipe above.
- A navigation list in a general app is a pane (`size="nav"`) in your screen: see [layouts](layouts.md).
- Screens inside the Aras shell: they never write `Panes` (PN7); see [panes](../components/panes.md).

## Tests
`src/recipes/layout/AppFrame.test.tsx`.
