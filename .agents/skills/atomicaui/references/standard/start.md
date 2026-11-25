# Page setup without the React parts

Do this once per app, in the layout or in every page. A complete file to copy: `references/standard/page.html`.
It gives a page the AtomicAUI fonts, colours, light and dark. The parts themselves come from `references/standard/recipes/`.

Open your page from the folder `standard-copy` made, never from `references/standard/` itself: that folder has no `fonts/`, and the text would show in a serif face. `npm run check:standard` fails a page whose font did not load.
If you start a server to view it, stop it by the process ID your shell printed, or let it stop itself; never `pkill` by name.

## Four steps
1. Copy the folder your pages load: `node scripts/standard-copy.mjs <your static files folder>` (for example `wwwroot`). It writes `<folder>/aui/` with `aui.css`, `aui-setup.css`, `aui-theme.js`, `aui-behaviour.js`, `aui-px.css` and `fonts/`. Never edit these files (AUI-06). After a kit update, run it again.
2. Put the four identity attributes on `<html>`:
   ```html
   <html lang="en" data-aui-brand="atomic" data-aui-theme="light" data-aui-typeface="engineering" data-aui-typography="body">
   ```
3. Load the three files in `<head>`, in this order, with the address your app serves the folder at:
   ```html
   <link rel="stylesheet" href="aui/aui.css">
   <link rel="stylesheet" href="aui/aui-setup.css">
   <script src="aui/aui-theme.js"></script>
   <script src="aui/aui-behaviour.js"></script>
   ```
   The last line is for a page with a select, a dialog, tabs, a `table-scroll` table or panes. It needs no start-up call and no other file.
4. Icons: load the AtomicAUI Global Kit in Web Font mode (the `kit.fontawesome.com/c852ddbb54.js` line in `page.html`). Icons load only on domains the kit owner has allowed; without it every icon is blank, and nothing else changes.

## Light and dark (AUI-10)
- The theme is one attribute: `data-aui-theme="light"` or `"dark"` on `<html>`. Every colour follows it.
- `aui-theme.js` sets it before the page paints: `?theme=dark` in the address wins, then the user's stored choice, then the system setting.
- A switch is any element with the attribute `data-aui-theme-toggle`. Use a button recipe for it.
- Never a second stylesheet, never colours of your own for dark.

## What the setup does
| It gives | Why |
|---|---|
| The fonts Inter and JetBrains Mono, served from `aui/fonts/` | The library ships no font files |
| A 16 px root size | Every size in the stylesheet is in rem |
| `<body>` with no margin, the theme surface and text colour | The page around your parts follows the theme |

It does not reset your other CSS. AtomicAUI styles only elements that carry its classes, and a stylesheet of yours with element selectors (`button { ... }`) or `!important` leaks into them. The check's page comparison shows every such leak.

## Select, dialog, tabs, wide table
`aui-behaviour.js` gives the three their keyboard, focus, opening and closing, the same as the React parts step for step (`references/standard/behaviour/<part>.md`).
- Write each one closed, exactly as `references/standard/behaviour/reference.html` does: a select's list waits in its positioner with `aui-display-none`; a dialog's two layers wait in a plain `<div data-aui-dialog-layers hidden>`; every tab names its panel with `aria-controls`.
- A select posts its value through a hidden `<input>` in the same field. The button that opens a dialog carries `data-aui-dialog-open="<dialog id>"`.
- A dialog opened over a dialog must have its layers inside the first dialog's popup. Anywhere else it is shown and cannot be reached.
- Your code hears what happened through events that bubble: `aui-change` (select: `detail.value`; tabs: `detail.index`), `aui-open`, `aui-close`.
- Blazor: the component that holds one of them renders without prerender (`@rendermode @(new InteractiveServerRenderMode(prerender: false))`). With prerender the server's elements are swapped a moment after the page loads, and a key pressed or an option picked before that is lost.
- A table whose columns do not fit 390 px is the `table-scroll` recipe (`recipes/table-wide.md`), copied whole. The same script makes its body scroll sideways and keeps its header in step; the table scrolls inside its own frame and the page never does. No wrapper box, no overflow class, no pinned column unless the source pinned one (`table-pinned`).
- A page of panes is written for a wide window only. Below 768 px the same script puts the panes in one column, each full width and as high as what it holds, and the page scrolls, as the React `Panes` does; it adds the word `stacked` to each frame's `data-aui-panes` marker while it does. Above 768 px it puts everything back. Never write `stacked`, `aui-flex-wrap-wrap` or a width for a narrow window yourself.
- Check it: `node scripts/check-behaviour.mjs --url <address>`.

## An area inside a page you do not own
For markup of yours inside a host's document (a form or page whose `<html>` and stylesheet are not yours): put the four identity attributes on the element around your markup, load `aui/aui-px.css` in place of the two stylesheets, load `aui/aui-behaviour.js`, and do not load `aui-theme.js` (it sets the theme on the host's `<html>`). The pixel stylesheet does not depend on the host's root font size; the behaviour script also keeps the focus ring for the keyboard only. `references/samples/aras-standin/` shows it.

## First screen
Start `<body>` with the `view-stack` recipe as the page column, put a `view-toolbar` and a `view-panel` in it, and build inwards. `references/standard/example.html` is one small screen in one pane: the body card is padded, so the row of buttons and the stack in it add no padding of their own. A page of panes: `recipes/layout.md` (`view-pane`, then the arrangement that fits). A whole page of fields, a table of records or a page of cards: `pages/form.html`, `pages/table.html`, `pages/overview.html` (generated from the React page recipes and checked by `npm run check:standard`); copy one and change the texts and the data. `table.html` sorts every column but Quantity: sort buttons only on the columns the user or the spec sorts, every other header is the `table-display` header cell, and never a sort button or arrow built by hand. Each loads `../aui/`: keep it in a `pages/` folder beside `aui/`, or change `../aui/` to `aui/` when it sits beside `aui/`. A copied `overview.html` uses the `message-banner` recipe for messages (`references/components/banner.md`); its facts are plain text lines. Neither needs a styled-piece gap.

A page with a bar above its panes marks the frame `data-aui-panes="page under-bar"`: the panes sit 4 px under that bar. A page you restyle inside a layout you keep (a shared `_Layout.cshtml` with its own bar, container and footer) marks the frame `data-aui-panes="page in-layout"` (`../aui-style-anything/references/restyle.md`, step 1): the panes are then measured from the frame (8 px at the sides, 4 above and below) and the kept layout is not measured.

## Traps
- The `hidden` attribute does not hide an element that carries AtomicAUI classes. Add the layout class `aui-display-none`.
- A recipe's ids (`field-input-1`) must be unique on your page. Rename them, and keep each `for` and `aria-labelledby` pointing at its partner.
- A class list is one whole string. Code that picks a state chooses between two whole lists from the recipe; it never builds a list from pieces.
- Do not run the stylesheet through a tool that removes "unused" classes or renames them.
- Text takes `aui-margin-0` (the `type-heading` recipe): headings and paragraphs keep the browser's margins otherwise (AUI-05).
