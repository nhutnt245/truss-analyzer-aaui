# Reading the checks

For people. An assistant reads `references/paths/convert.md`; it does not need this page.
A check is a command that measures your work and names the fix. If you can read one message, you can finish a page.

## 1. The commands
`npm run verify` runs them in this order (the browser tests last) and stops at the first one that fails: read upwards from its last line. It prints how long each step took, just above its last line. `npm run verify:page` runs check, lint, typecheck, unit tests, layout and tokens, and the evidence sheets of styled pieces for your page (minutes). `npm run verify:fast` runs all but the browser tests.

| Command | Looks at | When it passes, it prints | When it fails |
|---|---|---|---|
| `npm run check` | Your source against the thirteen rules; whether you edited a kit file; then, when the rules hold, the tests of `src/app` and `src/screens` (seconds) | `check: ok. The rules hold and the tests of src/app and src/screens pass ...` | Problems, then `check: N problem(s). Fix them, then run \`npm run check\` again.`; or, when a test fails, `check: N problem(s): the tests of src/app and src/screens fail: <each failing test>` |
| `npm run lint` | Code style | No output | The lines it names. It skips copied `.js` and `.ts` logic under `src/data/legacy/` only |
| `npm run typecheck` | Types | `typecheck: ok (N known error(s) inside the read-only vendored library or copied legacy logic were ignored).` The fresh starter has 6 known vendor errors; copied `.ts` logic may add to the count | Errors in app-owned adapters and screens that import copied logic still fail. A JavaScript screen may need types on its copied lines (`by-hand.md`, step 3) |
| `npm run test` | The unit tests under `src/` (your screens and data, the recipes and the pack) and the one script test that reads your `evidence.views.json`. The kit's own script tests are not among them: the kit's CI runs those | `Tests N passed` | The failing test |
| `npm run build` | That the app builds | The build summary | The build error |
| `npm run check:layout` (in the page-only run and the full verify: `npm run check:layout -- --tokens`) | Spacing and layout on the running page: desktop and narrow, light and dark. In both verify runs the same pass also reads the theme tokens | `check:layout: ok. N views measured ...`, and with `--tokens` also `check-conformance: summary` with zero problems | `check:layout: N problem(s) in M views.`, or token problems; see `references/token-check.md` |
| `node ../aui-style-anything/scripts/styled-evidence.mjs --check` | The evidence sheet of each styled piece, `evidence/styled-<name>.md` (`../aui-style-anything/references/proof.md`) | `styled-evidence: ok. No styled piece ...`, or for each sheet `... 0 line(s) marked (you) to fill.` | `styled-evidence: not done. ...`: fill the lines it names, fix what the sheet says |
| Second `check:layout` run | Aras pack views, if the app imports its demo | A measurement summary, or `skipped` when the app has no demo route | Layout problems in the Aras views |
| `npm run check:conformance` | Theme tokens and layout in the app's views, alone (the full verify does not run it separately) | `check-conformance: summary` with zero problems | Token or layout problems; see `references/token-check.md` |
| `npm run check:standard`, `check:behaviour` | The kit's own example pages. `npm run verify` does not run them: the kit's CI does, and `npm run verify:kit` after you change the app's packages or `public/fonts` | `check-standard: ok`, `check-behaviour: ok` | Not about your page: tell the maintainer |
| `npm run test:browser` | The tests that start a browser and read your app, one file at a time. The kit's own nine test files are not among them: the kit's CI runs those, and `npm run verify:kit` | `Tests N passed` | The failing test |

Browser checks may print `SKIPPED`: no browser was found, so **nothing was measured**. Install a browser (or set `AUI_BROWSER`) and run them again; never say the page looks right. The Aras layout run also skips when the app has no Aras demo route.

## 2. One problem, taken apart
```
AUI-01: Hand-built <button>. src/screens/MyPage/MyPage.tsx:42
    Fix: Use the AtomicAUI part from the component chooser (references/chooser.md). See references/rules.md#aui-01.
```
Rule number and what is wrong; the file and line; the fix; the page that explains. Open the file at that line, do what Fix says, run the command again.

## 3. The messages a conversion meets
| It says | Do |
|---|---|
| `UI files are not allowed in src/data/legacy/` (KIT-04) | Move `.jsx` and `.tsx` UI into a screen under `src/screens/`, where AtomicAUI checks apply. Keep only `.js` and `.ts` logic in `src/data/legacy/` |
| `Hand-built <button>` (or `<input>`, `<select>`, `<label>`) | Use the part from the map (`references/convert/map-react.md`) |
| `<Field> without the kit field look` | Add `aui={FIELD_AUI}` (from `@/recipes/shared/aui`): the label goes above the control. In a dialog: `FIELD_DIALOG_AUI`. The label must stay beside the control: `FIELD_INLINE_AUI` with its row (`references/components/field.md`, "Layout") |
| `<Field> changes the kit field look after the shared constant` | Something follows the constant that may not (a gap, a row, a colour): delete it. The message names what may follow |
| `Plain <div> used for layout` | `View` with `aui.sx` |
| `Inline style on <h1>` | Delete it. The look comes from the part and the `aui` prop |
| `App CSS sets a look` | Delete the rule. Old CSS never comes along |
| `Import of "...": another UI or utility library` | Routing, fetching and dates are the app's logic: ask the app's owner, then add `// check-allow: AUI-01 <why>` on that import line only. A UI library: never |
| `<Type> renders a block tag that keeps the browser margins` | Add `aui={TEXT_AUI}` (from `@/recipes/shared/aui`), or `as="span"` inside a row |
| `Browser-default margin ... on ul` | A list or heading with a margin: use `View` and `Type` with the constants |
| `Spacing 15, 15 px on ... is not a token step` | An old pixel value is still in: remove it; space comes from the parent's gap (`references/spacing.md`) |
| `... the first item of the bar ... starts 8 px to the right of the blocks beside the bar` | The bar needs the bar constant: `aui={{ ...BAR_AUI }}` beside a block that fills the card, or `BAR_PADDED_AUI` beside padded blocks. The message names the constant |
| `The page frame is padded 4 / 8 ... [PN1]` | Look for a dialog or another element inside `Panes`: a child of `Panes` becomes a pane. Put the dialog beside `Panes` |
| `A pane header is one 28 px band ... [PN3]` | Buttons beside the title belong in a toolbar bar at the top of the body, not in the pane header |
| `Browser console: ...` | Read the text. A link through `Button` needs `nativeButton={false}` |
| `The page scrolls sideways at 390 px wide` | A wide table: `minInlineSize` on `Table`, so the table scrolls in its frame |
| `Looks like a home path` (KIT-02) | The file it names holds a path from a home folder: remove it, or write it relative (`../old-app`). `CONVERSION.md`, the `conversion/` folder and copied logic under `src/data/legacy/` are not read by this rule. The line is an old page address that starts with `/home/` (in `evidence.views.json`, `src/app/route.ts`): it is not a private path, but the rule cannot tell. Keep the address, stop and tell the maintainer |
| `AUI-13` or `AUI-06`: a kit file was edited | Put it back: `git checkout -- <file>`. Solve the problem in `src/screens/` |

## 4. What no check sees
A green `verify` can still be a wrong page. In the kit's own trial the checks were green and the pictures showed:
- A select that displayed `0` instead of "All states": a select whose value is not its label needs `items={[{ value, label }]}`.
- Labels cut off by their own controls ("Searc", "Stat"): the label and the control were a row written on the `Field` by hand. `npm run check` now refuses that row (section 3); with `aui={FIELD_AUI}` the label stands above the control. A label kept beside its control (`FIELD_INLINE_AUI`) that ends in "...": put it above.
- A table squeezed into a narrow window, a badge overflowing its cell: `npm run check:layout` now fails text that runs outside its own table cell (AUI-10); a squeezed table whose text still wraps, or a badge whose box leaves the cell, is yours to see.
- A mark that old CSS drew (a "/" between breadcrumb items) that nobody carried over.

So you open this page's pictures in `evidence/` beside the old pictures in its capture folder recorded in `CONVERSION.md`: desktop and narrow, light and dark. Look for: the same regions and words; the pane title before its body, even if the old breadcrumb came first; every label readable in full; a select that shows its label, not a number; nothing overlapping or cut off.
And you test this page's behaviour: what each button does, what Enter does, what is disabled until when, and each recorded AtomicAUI behaviour difference for this page such as Escape closing a dialog. No check does that. Either try each line for this page under "Behaviour to keep" and each difference for this page, or run a test that finds things by role and name (the sample has one in `references/samples/legacy/react/reference/`).
