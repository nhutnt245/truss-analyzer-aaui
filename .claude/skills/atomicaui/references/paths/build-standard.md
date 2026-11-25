# Path 2: build with the standard only (no React parts)

For a new screen where the React parts cannot be used: .NET MVC and Razor, Blazor, plain HTML, other frameworks.
The result must look like AtomicAUI exactly as a React screen does: the same stylesheet, the same class lists, light and dark.
**This version: the look of the class recipes, and the behaviour of three parts (select, dialog, tabs), each with its check.** Behaviour of the other parts is not written yet: see "Not in this version".

**A form, grid or toolbar that a host or another application draws itself (the Aras host, or a form another application owns) is never restyled, edited or unlinked from its own stylesheet, and no attribute of ours goes on it.** Only the element that holds our markup takes the four identity attributes (`references/samples/README.md`). If the task asks for more, stop and ask.

How to work (think before coding, simplicity first, surgical changes, goal-driven): the four principles in `AGENTS.md`, "How to work: four principles"; in an installed skill, the same section of the atomicaui skill's SKILL.md.

## First step: icons (automatic)
Run `node scripts/icon-kit.mjs <app folder>`. It adds the AtomicAUI Global Kit script (`c852ddbb54`) to every page that lacks it and reports a page that names another kit. Icons load only on domains the kit owner has allowed.

## What you have
| Thing | Where |
|---|---|
| Stylesheet, page setup, theme switch, fonts | `references/standard/aui/`, copied into your app by `node scripts/standard-copy.mjs <static files folder>` |
| Page setup in one screen | `references/standard/start.md`, `references/standard/page.html` |
| Class recipes: the exact HTML and class list per part, variant and state | `references/standard/recipes/` |
| Every recipe on one page; one small example screen | `references/standard/gallery.html`, `references/standard/example.html` |
| The look check | `node scripts/check-standard.mjs <files or folders> --url <address>` |
| Behaviour of select, dialog and tabs: one script, no start-up call | `aui/aui-behaviour.js` (copied with the folder above) |
| What each of the three must do, step by step, recorded from the React part | `references/standard/behaviour/select.md`, `dialog.md`, `tabs.md` |
| The three written closed, to copy | `references/standard/behaviour/reference.html` |
| The behaviour check | `node scripts/check-behaviour.mjs --url <address>` |
| The token check: only AtomicAUI theme values, light and dark (how to read it: `references/token-check.md`) | `node scripts/check-conformance.mjs --url <address>` |
| An existing app or page to make follow AtomicAUI (the whole app, some pages or one element): inventory, four levels, comparison | `../aui-style-anything/references/restyle.md`; `node scripts/serve-folder.mjs <folder>` shows plain files |
| The same three in Razor Pages, in Blazor and inside a host document | `references/samples/` (read its `README.md` first) |

The recipes are generated from the real React parts and proved equal to them in a browser when the kit is built. Nobody writes one by hand, you included.
The behaviour pages are recorded the same way: the kit presses keys on the real React parts and writes down what happens. Nobody writes a step by hand either.
In an app that got the kit as a skill, the scripts are in the skill's folder: `node .agents/skills/atomicaui/scripts/standard-copy.mjs ...`. They need Node.js 20 or later and no package.

## Steps
1. Say "Path 2: build with the standard only", and which recipes you will use.
2. Copy the folder and set up the page: `references/standard/start.md`.
3. Build the screen from whole recipe blocks, wrapper included. Change the text, ids, names and values. Layout is the view recipes plus layout classes. Never style a bare `<table>`, `<input>`, `<select>` or `<textarea>` yourself: copy `table-display`, `field-input`, `field-select` or `field-textarea` whole. `check-standard` fails a bare one (AUI-01) and names the block to copy.
   For tabs in a pane header, copy `pane-tabs-header` from `recipes/tabs.md`: the 28 px header band pads the tab row 8 px at the sides (PN3) and the tabs fill it; the tab list sits in the tab row (`data-aui-tab-row`), where tabs that keep a width and do not fit scroll sideways while the page does not; each tab panel comes directly under the band as the row of the pane, padded 4 / 8, so its card sits 4 px under the header and 8 px inside the frame (PN6) and starts at the left edge of the tab row. A form, sections or text go inside that card, which pads them 4 / 8 as in every pane; the unpadded scroll area between the panel and the card scrolls what is taller than the pane. For a table, a tree or a drawing frame, copy `pane-tabs-header-fill` from `recipes/tabs-fill.md` instead: its card fills the panel as the panel's only child, with no scroll area around it. A table or a drawing frame scrolls inside its own frame; a tree does not scroll by itself, so it goes in the card as the whole `tree-scroll` block of `recipes/tree.md`. Never put a filling card (`aui-flex-fill`) inside the scroll area: it grows past the pane.
4. Behaviour: the native element first (`button`, `input`, `form`, `a`). For a select, a dialog or tabs: load `aui/aui-behaviour.js` and write the part closed, as `references/standard/behaviour/reference.html` does. For the rest, only what the recipe's "You add" line says, written in your own technology. Anything else is unknown behaviour: ask, label it `OPEN:` (AUI-08).
   Blazor: a component that holds an AtomicAUI part renders without prerender, and writes each option, tab and panel as one element whose class list an expression chooses. Both rules and their reasons: `references/samples/README.md`.
5. Check, with your app running: `node scripts/check-standard.mjs <folders with your pages, scripts and CSS> --url <address of each page>`, then `node scripts/check-behaviour.mjs --url <address of each page>`, then `node scripts/check-conformance.mjs --url <address>` (one page; many: `--views file.json`, each named by its path, as `references/token-check.md` shows). A state behind a click (an open dialog, an open select, a second tab) is a view with `click` steps in a views file. `check-standard` then takes one `--url` (the address the views open under) and `--views file.json` in place of an address for each page: the file lists every page once as it opens, and each clicked state as one more view (`references/token-check.md`).
   Razor: stop the server you started by the process ID your shell printed, or let it stop itself; never `pkill` by name.
6. Open `evidence/standard-*.png`, including the clicked views' pictures, and look, light and dark. Read every `NOT CHECKED` line the behaviour check prints and put it in your report. Fill a copy of `references/checklist.md`.
7. **Checks before claims.** Paste the result lines of the three checks of step 5 (`check-standard`, `check-behaviour`, `check-conformance`) before you claim anything; a check you did not run is "not run", never "passed". Write your final message and the checklist before the last full run (`npm run verify` where the app has it), its line saying "verify not finished", then put its last line in both when it ends. Wait for that last line: never end a turn, and send no message, while a command you started still runs. Without the starter there is no `npm run verify`: the three checks of step 5 are the last run (with a styled piece: `node ../aui-style-anything/scripts/styled-evidence.mjs <name> --check` after them, `../aui-style-anything/SKILL.md`, step 7), and their last lines go into your message and the checklist.

## Which recipe
| Need | Recipe | What works without React |
|---|---|---|
| Page column, panel, row, toolbar | `recipes/view.md` | Everything |
| Page layout: panes, header, body, cards | `recipes/layout.md` | Everything. Make `html` and `body` fill the window (`height: 100%`, the body a flex column) so the panes keep 4 px above and below. Load `aui/aui-behaviour.js`: below 768 px it stacks the panes in one column and the page scrolls. Write the wide layout only |
| Top bar | `recipes/top-bar.md`: `top-bar-edge` or `top-bar-inset`; `top-bar-links` for a bar with page links | The edge-to-edge bar has square corners while its buttons stay soft; an inset bar keeps soft corners (AUI-09). Its buttons are native controls |
| Heading, text | `recipes/view.md`: `type-heading`, the `span` in any view recipe | Everything |
| Button, main action, quiet action, disabled, icon button | `recipes/button.md` | Everything: it is a native `button` |
| Text field, read-only field | `recipes/field.md`: `field-input`, `field-input-readonly` | Everything: it is a native `input` with its label |
| Pick one of a list | `recipes/field.md`: `select-open` | Everything in `behaviour/select.md`, with `aui/aui-behaviour.js` |
| Table of data | `recipes/table.md`: `table-display` | Everything. Column widths: `recipes/table.md` says how; never a `width` attribute |
| A picture placeholder in a table cell (the spec's grey square, no picture file) | `recipes/picture-tile.md`: `table-picture-tile` | A plain 32 by 32 surface-alt tile with a soft corner, hidden from assistive technology. A real picture is the app's, and one line in `GAPS.md` |
| Table whose columns do not fit 390 px | `recipes/table-wide.md`: `table-scroll` | Everything, with `aui/aui-behaviour.js` (the body scrolls sideways inside the table, the header follows). No wrapper box, no pinned column unless the source had one |
| Paging bar under a table (previous, range, next, results per page) | `recipes/paging.md`: `table-paging` | The look, whole, with its closed page-size select; your own script sets the range text and the disabled marks |
| Table with a row to pick | `recipes/table.md`: `table-row-selected` (by a click on the row), `table-row-radio` (by a radio in a column of its own; the checkbox recipe of `recipes/field.md` in the same column when the source picks one row by a checkbox) | The look; you add the click. Picking by keyboard is a line in `GAPS.md` |
| Tabs | `recipes/tabs.md`: `tabs`, `tabs-gapless`, `tabs-disabled`, `pane-tabs-header`; `recipes/tabs-edge.md`: `tabs-edge` (a tab row from edge to edge of the window); `recipes/tabs-fill.md`: `pane-tabs-header-fill` (tabs in a pane header over a table, tree or drawing frame) | Enabled tabs: everything in `behaviour/tabs.md`, with `aui/aui-behaviour.js`. Disabled tabs and tabs with close buttons: the look only, a line in `GAPS.md` |
| Dialog | `recipes/dialog.md` | Everything in `behaviour/dialog.md`, with `aui/aui-behaviour.js`, for a dialog of text fields and footer buttons |
| A date | `recipes/field.md`: `field-date` | Everything: it is the browser's own date field. Its input is 2 px taller than a text input |
| Tick box; sections that fold | `recipes/field.md`: `checkbox`; `recipes/view.md`: `accordion-sections` | The look; you add the toggle, as the "You add" line says |
| Small tag or state label; the cells of a status or State column in a table | `recipes/chip.md`: `chip-status` | Everything: it only shows things. A status column uses the chip recipe in every cell, never plain text; on a page you restyle, a status that was plain text stays text (`../aui-style-anything/references/restyle.md`) |
| A message: passed, needs attention, failed | `recipes/view.md`: `message-banner`; with an icon, `message-banner-with-icon` | Everything: it only shows things. Copy the block of the result you show |
| A piece with no part that only shows things or is one thing to click (cards to pick, rows of labels and values) | `../aui-style-anything/SKILL.md` and its examples | Everything in the examples; for cards you add the class swap |
| A number with a unit, a field with an error, radio, switch, a textarea | `recipes/form.md` | The look; you show the error and set aria-invalid. A radio and a switch: you add the toggle, as the "You add" line says |
| Cards on the pane colour, the grid of them, a loading block | `recipes/cards.md` | Layout and look; you choose the column class (`auto-fit` fits the width) |
| A pane header with "Configure columns" and buttons, a sorted table, notes, a pinned column; a search bar above a table | `recipes/page.md`; `recipes/table.md`: `table-search-bar` | The look; you order the rows, move the sort mark and filter the rows. Sort buttons only on the columns the user or the spec sorts, every other header is the `table-display` header cell |
| A whole page of fields, of records to sort and search, or of cards | `references/standard/pages/form.html`, `table.html`, `overview.html`: copy the page, change the texts and data. It loads `../aui/`: keep it in a `pages/` folder beside `aui/`, or change `../aui/` to `aui/` when it sits beside `aui/` | The look. The select on the form page is the closed look (use `select-open` for a working one); "Configure columns" needs your own script; the card grid is `auto-fit`. `overview.html` uses the Banner recipe for messages. `table.html` sorts every column but Quantity: sort buttons only on the columns the user or the spec sorts, every other header is the `table-display` header cell |
| A tree (locations, folders) | `recipes/tree.md`: `tree`; `tree-scroll` in the card of `pane-tabs-header-fill` | The look and the roles; you add the fold, the keys and the pick, as its "You add" line says. Rows and chevrons sit on the surface: never buttons, never bordered or tonal boxes |
| Anything else: menu, toast, a drawing, a new chart | none | One line in `GAPS.md`, a labelled placeholder, carry on. An existing third-party chart on a page you restyle keeps its markup, roles and behaviour and is aligned where it is (`../aui-style-anything/references/restyle.md`). Never invent chart values or build a chart from memory. |

A copied `overview.html` uses the `message-banner` recipe for messages (`references/components/banner.md`); its facts are plain text lines. Neither needs a styled-piece gap.

## The rules in class form
The thirteen rules of `references/rules.md` hold. These read differently without React:

| Rule | Here |
|---|---|
| AUI-01 | Every control is a class recipe, on the recipe's own element. No other UI library. No class list written from memory |
| AUI-02 | Style only with AtomicAUI classes. No raw colours, no pixel values, no inline `style` |
| AUI-03 | Layout is the view recipes plus layout classes (`aui-display-flex`, `aui-gap-8`, `aui-width-fill`; the full list is `layout` in `references/standard/classes.json`). CSS of your own only for the outer page, each rule under a `/* why: */` comment, values from `var(--p-px-8)` and `var(--theme-surface)` |
| AUI-04 | A state changes the look only by switching to the whole class list the recipe shows for that state, with its attributes. Hover, pressed, focus and disabled come from the stylesheet |
| AUI-05 | One owner per space, as in `references/spacing.md`: the gap class of the box around. Text takes `aui-margin-0` |
| AUI-06 | Never edit, restyle or redefine the stylesheet, its classes or its variables. Load `aui/` as copied |
| AUI-09 | Same job, same recipe, the whole class list, on every screen |
| AUI-10 | Light and dark always, through `data-aui-theme` on `<html>` only |
| AUI-11 | Icons as the recipes write them; an icon-only button has an `aria-label` |

## What the check does
- Folders named `lib` and `vendor` hold other people's code and are not read. `aui-align.css` is read by its own rules (`../aui-style-anything/references/align.md`). `--baseline <file> --record` records the findings of an old app; later runs fail only on a new one (`../aui-style-anything/references/restyle.md`).
- Files: unknown AtomicAUI classes, class lists that are not a recipe, a switch whose colour class disagrees with its `aria-checked`, `data-checked` / `data-unchecked` or `data-filled` (its thumb's too; also on a page), plain controls, a click handler on an element that is not a native `button` or `a`, a navigation link (in a bar, `<nav>`, list of tabs or menu, or marking the current page) without `aui-text-decoration-none`, `aui-text-decoration-underline` on a tab or bar item, inline styles, a width attribute on `col`, `td` or `th`, markup and style that a script writes (in every `.js` file under the paths you give and in the `<script>` blocks of a page: a `style` attribute, `align`, `bgcolor`, `border`, `cellpadding`, a `width` or `height` on a cell, `<font>` or `<center>` in an HTML string, a table or control with no AtomicAUI class in an HTML string, and `element.style` set to a colour, background, border, padding, margin or font; not read: `*.min.js`, `*.bundle.js`, a library by its exact name with at most a version (`jquery-3.6.0.js`, `bootstrap.js`), and the folders `lib/` and `vendor/`), raw colours and pixel values, a look set in your CSS, CSS that restyles the library, page setup, an edited `aui/` folder, a styled piece with no line in `GAPS.md` or with an elevation.
- Pages (`--url`, a private browser with no debugging port): every class list as rendered; every element against the same markup under the untouched stylesheet, so anything that overrides the library shows; the spacing rules; a size that came out larger than its class asks; a shadow on a styled piece; sideways scroll at 390 px; light and dark.
- It cannot judge made-up UI or whether the right recipe was chosen. The checklist covers those.

## What the behaviour check does
- It finds every select, dialog and tabs part on the page by its role, presses real keys and clicks in the same private browser, and after each step compares focus, roles, names, states, class lists, the open layer and the page behind it with the record of the React part.
- A tab set of 2 to 5 tabs is compared with the record of its own size, whatever the tabs are called, on any page. The panel holds the content of its tab: focus on a link or field in the shown panel counts where the record has the panel, or the page after it. Tabs of another size, a select with other options and a dialog with other fields or buttons are compared with the real component given the same contents. That needs the kit starter; elsewhere the part is `NOT CHECKED`.
- A part `NOT CHECKED` because its shape is not the recorded one (or the record does not cover it) **fails the check** (AUI-12), with the line to add. Show the part with a recorded shape, or run the check in a copy of the kit starter. When that cannot be done, add one line to `GAPS.md`: ``- Behaviour not checked `<page> <part> <n>`: <why, and what you did by hand>``; the part is then printed as `NOT CHECKED` and the run goes on. A disabled select or opener and a select with no list (the closed look alone) are `NOT CHECKED` without a failing line. A run where no part could be checked exits 1.
- It fails with the part, the step, what the page gave and what the React part gives.
- It does not hear a screen reader speak, and it does not judge touch. It runs in Chrome only.

## Not in this version
- Panes that can be resized or collapsed: without React a pane is a static box (the recipes in `recipes/layout.md`). A rail, a handle or a collapse button is a line in `GAPS.md`.
- Panes that stay in a row below 768 px: a line in `GAPS.md`.
- Panes in a part of a page: a page of panes fills the window. Panes inside a part of a host page are not supported.
- Behaviour of the other parts (menu, checkbox, radio, tooltip, toast, table row picking by keyboard, dates and the rest): a line in `GAPS.md`.
- Inside the three parts: tabs with close buttons, a disabled tab, and a dialog that holds anything but text fields and footer buttons are `NOT CHECKED` and need the `GAPS.md` line above. So are a disabled select or dialog opener, and a select with no list (the `field-select` look alone), which need none.
- Pages inside a real Aras client: `references/samples/aras-standin/` is a stand-in with no Aras data.
- A check that reads class lists a template builds at run time from pieces: only the page check sees those. A list chosen whole by one expression (`class="@(picked ? "..." : "...")"`) is read.
