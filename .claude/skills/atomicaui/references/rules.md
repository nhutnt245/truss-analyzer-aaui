# The thirteen hard rules

Release: AtomicAUI 7.0.9. `npm run check` enforces the rules marked **check**. The rest are yours to keep and to tick off in [checklist.md](checklist.md).
Every part is imported from `@/vendor/atomic-aui`.

## AUI-01
**Every control is an AtomicAUI part. No other UI library, no plain HTML control.** (check)
```tsx
// do
<Button aui={ACTION_AUI}>Save</Button>
<View interactive onClick={open} aria-label="Open part">...</View>   // one clickable surface
// don't
<button className="btn">Save</button>     // plain control
<span onClick={open}>Open</span>          // plain element with a handler
<View onClick={open}>...</View>           // no `interactive`: no keyboard, no role, no focus ring
import { Button } from '@mui/material';   // other library
```
- A piece with no part that only shows things (rows of facts) or is one thing to click (a card to pick) is styled from `View`, `Type` and `Icon` by `../aui-style-anything/SKILL.md`: roles from its tables, never values by eye.
- Anything with its own keyboard pattern (tree, list box, menu, tabs, dialog) is the library part, never built from `View`. A tree is [recipes/tree.md](recipes/tree.md).
- Need a part that is not in [chooser.md](chooser.md)? The five steps of the stop rule below, in order.

## AUI-02
**Style through the `aui` prop only: `color`, `paint`, `scale`, `profile`, `shape`, `states`, `sx`. No raw colours, no pixel values, no inline `style`.** (check)
```tsx
// do
<View aui={{ color: 'surface-alt', shape: 'soft' }} />
// don't
<View style={{ background: '#eef' }} />
```

## AUI-03
**Build layout with `View`.** Plain elements and app CSS only for the outer page, and every CSS rule gets a `// why:` comment. App CSS never sets a look (colour, background, border, padding, margin, gap, font, radius, shadow, outline) outside `html`, `body`, `:root`, `#root` and `.app-root`, whatever its values. (check)
```tsx
// do
<View aui={{ paint: 'text', sx: { display: 'flex', gap: '8' } }}>...</View>
// don't
<div className="row">...</div>
```
A `View` is a filled surface by default. Inside a table cell or a toolbar row add `paint: 'text'` so it has no fill.

## AUI-04
**A different look per state goes in `aui.states`.** Never conditional props or class names.
```tsx
// do
<View interactive aui={{ states: { selected: { color: 'primary', paint: 'tonal' } } }} selected={on} />
// don't
<View className={on ? 'selected' : ''} />
```
`states` only works on stateful parts (`View` with `interactive`, `Tabs.Tab`, `Table.Row`, ...). Button has none.

## AUI-05
**Spacing comes from `profile`, tokens and the roles in [spacing.md](spacing.md). `sx` lengths are token strings** such as `'8'`, `'28'`, `'fill'`. (check, and `npm run check:layout` measures the page)
```tsx
// do
aui={{ profile: 'default', sx: { gap: '8', width: 'fill' } }}
<Type role="l3" as="h2" aui={TEXT_AUI}>Documents</Type>
// don't
aui={{ sx: { gap: 8, width: '100%' } }}
<Type as="h2">Documents</Type>            // keeps the browser's margins
```
Blocks under each other go in one `<View aui={STACK_AUI}>`; a button row under a form is `ActionRow`. Spacing is never copied from a screenshot or an old app.

**A control that appears or disappears (on scroll, hover, selection, loading, edit mode) never changes the height or width of its row or bar.** To make it fit, set the control's `aui.profile` to another profile AtomicAUI defines (for example `'compact'`) so its height matches the row (pattern 4 in [spacing.md](spacing.md)); or reserve its slot with a `View` of token `sx` sizes. Never raw px, CSS or a hand-made size. `npm run check:layout` measures the rows a view names in `evidence.views.json` (`"rows"`) before and after the click and fails on any change; in a view with a `click` it also measures every toolbar, group, menubar and tablist, named or not.

## AUI-06
**Never edit `src/vendor/atomic-aui`. Import only from `@/vendor/atomic-aui`.** (check)
Something missing is a gap, never a shim: add a line to `GAPS.md` (what you needed, which screen), leave a labelled placeholder on a new screen (on a page you restyle, the element is styled where it is: `../aui-style-anything/references/restyle.md`), carry on.
```tsx
// don't
import { Table } from '@/vendor/atomic-aui/lib/table';
```

## AUI-07
**Every visible element and text comes from the source screen or the written spec.** No helper lines, footers, counters or summaries that the source does not have.
Asked to add something the source lacks? Say so, cite this rule, ask.
The source decides **what** is on the screen: elements, order, words. The kit decides **how** it looks: spacing, density, colours, which button is the main action, the order of a button row (Cancel first, the main action last), how tabs and selected rows look. A screenshot that shows all buttons alike does not change that.

## AUI-08
**Behaviour comes from the source app or the spec.** When it is unknown, ask, and leave a clearly labelled placeholder (`// OPEN: ...`). Never guess a flow.

## AUI-09
**Same job, same component, same props, same recipe, on every screen.** A pane is `Pane`, a group of panes is `Panes` (`@/recipes/layout`): `Panels` and a pane written from its constants fail `npm run check`. Use the recipe in `src/recipes/` (`npm run screen:copy`) instead of re-deriving it. An example of a styled piece (`src/recipes/styled/`) is copied into your screen folder, never imported (check). One main action per bar or dialog: `ACTION_AUI` (secondary, solid); every other button keeps the default look. **In a row of buttons under a form or in a dialog footer, Cancel and the other actions come first and the main action (Save, Submit, ...) last, on the right** (check). **Shape is the part's default; set it only where a recipe does** (the shared constants in `src/recipes/shared/aui.ts`). A top bar or tab row at the window edges has no corners, while one with space around it stays soft; tabs with a gap keep soft corners, while tabs that touch have none (`references/recipes/app-frame.md`, `references/components/tabs.md`). A `shape` in the `aui` of a control (`Button`, `IconButton`, `Field.*`, `Tabs.Tab`) fails `npm run check`; a table spreads `TABLE_PROPS`, a select trigger takes `SELECT_TRIGGER_AUI`, a closable tab label takes `TAB_LABEL_AUI`, a `Checkbox` or `Radio` takes `TOGGLE_AUI` and nothing after it, a `Field` takes one of five constants: `FIELD_AUI` or `FIELD_WIDE_AUI` (label above the control, in a page), `FIELD_DIALOG_AUI` or `FIELD_DIALOG_WIDE_AUI` (the same in a dialog or a popup) or `FIELD_INLINE_AUI` (label beside it: the constant is the column, and the label and the control sit in a row inside it, `<View aui={FIELD_INLINE_ROW_AUI}>`). Its size is chosen with `aui.scale` next to the constant, written out: `{ ...FIELD_AUI, scale: 'md' }` (`xs`, `sm`, `md`, `lg` or `xl`; the constants are `sm`). After a spread of `FIELD_AUI` or `FIELD_INLINE_AUI` only that size and `sx: { ...FIELD_AUI.sx, … }` with layout keys; after a spread of `FIELD_DIALOG_AUI` only that size and `sx: { … }` with layout keys; after a spread of a wide one only that size; and no other gap by hand. The page look on a `Field` written inside a part of a `Dialog` or a `Popover` fails (`Dialog.Popup`, `Dialog.Body`, `Popover.Popup` and every other part but the root and `Trigger`); a `Field` built apart from its dialog (in a variable, a helper or a component of its own) is held by the `dialog` prop of `FormField`, not by the check. A `Switch` takes `SWITCH_AUI` and nothing after it, a `Popover.Popup` takes `render={<View aui={POPUP_AUI} />}` (after a spread of it only `sx: { ...POPUP_AUI.sx, … }` with height and overflow keys), an `Accordion.Item` takes `SECTION_ITEM_AUI` or `SECTION_DIVIDER_AUI` and nothing after it, a `Tabs.Panel` takes `TAB_PANEL_AUI` (after a spread of it only `sx` with layout keys), or `PANE_TAB_PANEL_AUI` as it is in a pane whose header holds the tab row, so what sits under the tabs starts at the tab row's left edge. **The picked look is the same on every screen:** a `Table.Row` takes no `aui` and no spread (the row look is in `TABLE_PROPS`; cells: `references/components/table.md`), and a card that can be picked takes `SELECTED_CARD_AUI`; after a spread of it only `sx` with layout keys. Asked to make a picked row or card stand out: it already does; too faint is a line in `GAPS.md`. **A table's first column is left and every other column is centred, header and cells alike** (`HEADER_START_AUI` and `CELL_START_AUI`, then `HEADER_CELL_AUI` and `CELL_CENTER_AUI`). A spec that says "centred column titles" means those other columns: the first title stays left over its left-aligned cells, and `npm run check:layout` fails a centred first title (AUI-09); say in your final message that the first column stayed left.

## AUI-10
**Every screen works in light and dark, always.** Desktop width comes first (1440 wide); at narrow width (390) the page must not scroll sideways. A real phone layout is built only when the spec asks for one. No overlap, clipping or layout jump. `npm run evidence` writes all four views of every screen: look at them.

## AUI-11
**Icons go through `Icon` and `IconButton`, and an icon-only control has an accessible name.** (check) One icon per action across the whole app: `gear`, `sun`/`moon`, `bars`, `angle-left`/`angle-right`, `thumbtack`.
```tsx
<IconButton name="gear" aria-label="Settings" />
```
**An icon button or clickable icon is always square** (equal width and height). Use the profile AtomicAUI defines for square icon controls: `IconButton` already has `square`; in a compact row use `'square-compact'`. When you change a profile to fit a row, pick the square variant of that size. Never raw px or CSS. (check; `npm run check:layout` measures every icon-only control)

## AUI-12
**Checks before claims.** Paste the result lines of your path's checks (below) before you claim anything; a check you did not run is "not run", never "passed". Write your final message and the checklist before the last full run (`npm run verify` where the app has it), its line saying "verify not finished", then put its last line in both when it ends. Wait for that last line: never end a turn, and send no message, while a command you started still runs. Until it ends, its line says "not finished". If it fails, fix what it names with your path's checks, run it again, and correct the message and the checklist before the commit: a failed run is never left as "Passed".
Your path's checks, one at a time, stopping at the first that fails:
- A React screen (paths 1 and 3), the page-only run, as often as you need while you fix: the full `npm run verify` takes about 5 minutes on a fast machine, longer on a busy one, so never debug with it. `<Screen>` is your folder under `src/screens/`. Build the page first: a run before any page exists measures nothing.
  ```
  npm run verify:page -- <Screen>
  ```
  It runs these, one at a time, and stops at the first that fails (run them by hand to see one alone): `npm run check`, `npx eslint --no-error-on-unmatched-pattern src/screens/<Screen> src/screens/index.ts src/app src/data`, `npm run typecheck`, `npm run test -- --passWithNoTests src/screens/<Screen>`, `npm run check:layout -- --tokens` (spacing and the token check in one pass, the same step as in the full run), `node ../aui-style-anything/scripts/styled-evidence.mjs --check` (the evidence sheets of your styled pieces, `../aui-style-anything/references/proof.md`; no styled piece: it passes).
- The last full run: `npm run verify`. Order: page, page-only run, final message and checklist, then it, last. It prints a line before each step and one every minute, so a quiet step is not a stalled one: never stop it. Run it in the foreground. A tool that ends a command before it finishes (this one takes about 5 minutes on a fast machine, longer on a busy one): start it in the background, then read `verify.log` again and again, waiting between reads, never ending your turn while it runs; its last line says `verify: ok`, `verify: FAILED at step N`, `verify: TIMED OUT at step N` (exit 124: a step ran past 30 minutes; it did not finish: read what it printed above, then run that step alone or `npm run verify -- --limit 60`, and say "not finished", never "passed") or `verify: STOPPED` (a signal ended it). A step that hit a load timeout of the machine is run again by itself. A failed line names what to fix with: the page-only run, or that step alone. Send no final message while it runs. Only when your time is out first: send the message you wrote, which already says "not finished". `npm run verify:fast` leaves out the browser tests: it is not the full verify, and it says so.
- Without React (path 2, a page you restyle): `node scripts/check-standard.mjs <my folders> --url <each page>`, then `node scripts/check-behaviour.mjs --url <each page>`, then `node scripts/check-conformance.mjs --url <a page>` ([paths/build-standard.md](paths/build-standard.md), step 5). An app without the starter has no `npm run verify`: these are the last run, and their last lines go into your message and the checklist. A page you restyle ends with `node scripts/restyle-done.mjs` (`../aui-style-anything/references/restyle.md`, step 6), which must say ok.
- A styled piece alone (`../aui-style-anything/SKILL.md`): `check-standard` on the page that holds it.

Then open the screenshots in `evidence/`, and fill in a **copy** of [checklist.md](checklist.md) (`CHECKLIST.md`, or your final message) with what you saw. A green unit test does not prove how a page looks. No browser on the machine: a check says SKIPPED; say so, do not claim a look.

## AUI-13
**Kit files are read-only: `kit/`, `AGENTS.md`, `scripts/`, `src/recipes/`, `src/packs/`, `src/gallery/`.** (check)
Your work goes in `src/screens/` (screens), `src/app/` (app name, addresses), `src/data/` (adapter, sample data), `GAPS.md`, and with the Aras pack `public/host.html` (the frame address).
```
npm run screen:copy -- form         # copies the form page recipe to src/screens/form/; then import it from '@/screens' instead of '@/recipes/form', and edit the copy
```
The guides describe the kit, not your app: never edit a guide to match what you built. A shared part that does not fit, or a fault in a guide: one line in `GAPS.md`.

## Stop rule
Missing part: take the first step that fits, and no later one.
1. An existing part ([chooser.md](chooser.md)).
2. Existing parts combined, or a piece the kit composed (paging bar, empty state, button row, tree).
3. A plain box, row, column or pane ([components/view.md](components/view.md)).
4. A piece that only shows things, or is one thing to click: style it by `../aui-style-anything/SKILL.md`. It carries `data-aui-styled="<name>"`, a line in `GAPS.md` and an evidence sheet.
5. Anything else (a popup, text entry, arrow keys, drag, a drawing): on a new screen, one line in `GAPS.md`, a labelled placeholder, continue with the rest. On a page you restyle, the element is styled where it is, keeping its markup, roles and behaviour (`../aui-style-anything/references/restyle.md`); what cannot be styled is one line in `GAPS.md`.

Missing prop, unknown behaviour or unknown source: step 5. Never invent, never edit the kit.
