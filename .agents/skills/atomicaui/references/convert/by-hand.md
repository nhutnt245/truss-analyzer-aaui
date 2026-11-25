# By hand: no assistant

For people. An assistant reads `references/paths/convert.md`; it does not need this page.
The five steps of `references/paths/convert.md`, as what to type and what to edit. It never repeats a component guide: it points to the heading. Read the path page once first. The map is `references/convert/map-react.md`; the record is `references/convert/tracker.md`.

Placeholders: `<old address>` where the old app runs, ending with `/`; `<Page>` the page's name; `<page>` its lower-case view name.

## Step 1: assess (once per app; the old app is read-only)
1. Make the record. This line copies the template and refuses when `CONVERSION.md` exists already (it then answers `EEXIST`), so a record is never copied over; a later page starts at step 3:
```
node -e "const fs = require('node:fs'); fs.copyFileSync('references/convert/tracker.md', 'CONVERSION.md', fs.constants.COPYFILE_EXCL)"
```
On its first line write the old app's folder relative to this one (`../old-app`); the record is committed with the app. Keep page addresses as they are (`references/paths/convert.md`, step 1). List every page and its states (empty, filled, a dialog open, an error) under "Pages". In each row, record its capture folder: `conversion/before/` or the sibling folder used for that page.
2. Write `conversion/before.views.json`, one view per page and state, every page in this one file. The sample's:
```json
[
  { "name": "work-orders", "url": "" },
  { "name": "work-orders-delete", "url": "", "click": ["WO-1003", "Delete"] }
]
```
`url` is only what follows `?` or `#` in the page's address (`""`, `"tab=open"`, `"#/orders"`). It is added to the address you give with `--url`, which must end with `/` (for the sample: `http://127.0.0.1:5173/`). `click` lists the names to click, in order, to reach a state (what a name matches: `references/token-check.md`).
A page with its own path (`/orders`) cannot go in `url`. Reach it with `click` on its link from the first page: `"click": ["Orders"]`. No link leads to it: give it its own views file and its own run, with the path in `--url` and a sibling `--out` folder, because a run empties its `--out` folder: `--url <old address>orders/ --views conversion/before-orders.views.json --out conversion/before-orders`. Keep separate output folders beside `conversion/before/`, named `conversion/before-<page>/`.
Use test or sample data, never live user records. Then, with the old app running:
```
node scripts/evidence.mjs --url <old address> --views conversion/before.views.json --out conversion/before
```
The pictures and measurements are ignored by git. The command writes a picture even when a `click` is not found. Open `conversion/before/measure.json`: `missedClicks` must be empty for every entry. Open every picture and confirm it shows the intended page and state. Check the `measure.json` in any separate output folder too.
3. "Behaviour to keep": one line per control, in the old page's words, from reading the code. Example: `- [ ] WorkOrders: Delete: disabled until a row is picked; asks "Delete work order WO-1003? This cannot be undone."` The old behaviour stays except where an AtomicAUI part adds standard behaviour, such as Escape closing a dialog. List each difference under "AtomicAUI behaviour differences" in `CONVERSION.md`.
4. The map: for each kind of element on the page, copy its row from `map-react.md` into "Map" with a count. No row, and no part fits: write "no part" and what the control does. List every "no part" control under "Gaps and open questions", and one line each in `GAPS.md`: this list is what can be built into the kit first.
5. Stop. Someone who owns the page reads the map and answers every "no part" row, in the order of `map-react.md` (last row of the elements table): the stop rule builds it; else the part is built into the kit first; otherwise the page improvises it within the AtomicAUI standard.

## Step 2: load AtomicAUI
```
npm install
npm run verify:fast
```
`verify:fast` must end without an error before any page moves: wait for its last line, and never end your turn while it runs. Set the app's name in `src/app/app.config.ts`. Copy the old `.js` and `.ts` logic files (data calls, helpers) into `src/data/legacy/` unchanged; put any needed declarations beside a JavaScript file in `<name>.d.ts`. Lint, KIT-02 and the AtomicAUI screen rules skip these files; typecheck counts errors inside them as ignored. Errors in app-owned adapters elsewhere in `src/data/` and in screens that import the logic still fail. Do not put `.jsx` or `.tsx` there: any UI moves into a screen under `src/screens/`, where the checks apply. Prove the copied logic's behaviour with the page's behaviour test (step 4). Install a library the copied logic imports, and leave its import unchanged. The old stylesheets are never copied.
Then commit the set-up, before the first page:
```
git add -A
git commit -m "Conversion set-up"
```
This commits the record and view definitions. Capture folders stay local. Only the app's owner may choose to commit captures made with test or sample data: `git add -f conversion/before`, and the same command with each existing sibling folder's exact name, before the commit.
If you get lost on the first page, the undo returns to this commit (`recover.md`, "Undo with git").

## Step 3: convert one page
Order of writing, each with where to copy from:
1. The frame: `src/screens/<Page>/<Page>.tsx`, `Panes` > `Pane` > `PaneBody` (`references/components/panes.md`, "Say your layout as a tree"). The old title is the `Pane` title. The pane header comes before its body, even when the old breadcrumb came before the title.
2. The bars at the top of the body: buttons, then the search form (`references/components/view.md`, toolbar; `map-react.md`, rows "Toolbar" and "form").
3. The fields (`references/components/field.md`, "Text field" and "Select field"; for a select with number values, `map-react.md`, "A select whose value is a number").
4. The table (`references/components/table.md`; `map-react.md`, rows "table" and "A row that is picked").
5. The dialog beside `Panes`, never inside (`references/components/dialog.md`). `AlertDialog` closes on Escape even when the old dialog did not; record that standard behaviour difference.
6. A "no part" row: what its owner answered. Built or improvised, it uses only AtomicAUI parts, `View` and `Type`, and the checks must pass. The sample's breadcrumb goes first in `PaneBody`, after the pane title: the link through `Button` with `aui={NAV_LINK_AUI}` (`map-react.md`, row "`a` in a bar or a breadcrumb"), the current page as `Type`, and the "/" the old CSS drew written as text. Record this provisional order change.

Then: a line in `src/screens/index.ts`, its address in `src/app/route.ts` and `src/app/Screen.tsx`, and its views in `evidence.views.json` (the sample's: `{ "name": "work-orders", "url": "#/work-orders" }`, and one with `"click": ["WO-1003", "Delete"]`).
Keep the old component's logic lines as they are (state, handlers, effects, data calls). Rewrite only what it returns.
The screen was JavaScript and is now `.tsx`, so the type check (step 4) asks for types on those lines. Add the type and change nothing else in the line: a type adds no behaviour. In the sample: `const search = (event: FormEvent) =>` (`FormEvent` is a type from `react`), `useState<string | null>(null)` for the picked row, and a `!` after a value the old code trusts to be there: `states.find(...)!.label`.
Before and after, from the sample's search form:
```jsx
<form className="form-inline well" onSubmit={search}>
  <div className="form-group">
    <label htmlFor="q">Search</label>
    <input id="q" className="form-control" value={text} onChange={(event) => setText(event.target.value)} placeholder="Number, title or asset" />
  </div>
  ...
</form>
```
```tsx
<View as="form" onSubmit={search} role="search" aria-label="Find work orders" aui={{ ...BAR_AUI, color: 'surface-alt' }}>
  <Field name="q" aui={FIELD_AUI}>
    <Field.Label>Search</Field.Label>
    <Field.Control>
      <Field.Input value={text} onChange={(event) => setText(event.target.value)} placeholder="Number, title or asset" />
    </Field.Control>
  </Field>
  ...
</View>
```
The handler, the state and the placeholder text are the same. The classes, the `id` pairing and the margins are gone. The label now stands above its control: `FIELD_AUI` is the kit's look for a field in a page, and a row or a gap written on the `Field` by hand fails the check. Then `npm run check` until it says `check: ok`; fix what each message says (`checks.md`, section 3).

## Step 4: prove
1. The page-only run, as often as you need while you fix (`npm run verify` takes about 5 minutes on a fast machine, longer on a busy one, and comes last, in step 5). Add the page's views to `evidence.views.json` first, or nothing is looked at. Then run these one at a time, in this order, and stop at the first that fails:
   ```
   npm run check
   npx eslint --no-error-on-unmatched-pattern src/screens/<Page> src/screens/index.ts src/app src/data
   npm run typecheck
   npm run test -- --passWithNoTests src/screens/<Page>
   npm run check:layout -- --tokens
   node ../aui-style-anything/scripts/styled-evidence.mjs --check
   ```
2. Open the four pictures of each view of this page in `evidence/` beside the old ones in this page's capture folder from `CONVERSION.md`. Compare six things: regions and pane order (step 3); words; every label readable in full; a select shows its label; nothing overlaps or is cut off; light and dark, 1440 and 390 wide. For the practice page, also compare with the finished conversion: `npm run sample:reference` runs it at its own address (Ctrl+C stops it).
3. Behaviour: try each line for this page under "Behaviour to keep" and each recorded AtomicAUI behaviour difference for this page in the running app (`npm run dev`), or run a test. For the practice page, copy `WorkOrders.behaviour.test.tsx` from `references/samples/legacy/react/reference/src/screens/WorkOrders/` beside your new `src/screens/WorkOrders/WorkOrders.tsx` and run it unedited; it checks Escape dismissal. The kit runs the test against its reference conversion; the packed skill leaves test files out.
4. `node -e "require('node:fs').copyFileSync('references/checklist.md', 'CHECKLIST.md')"` and fill the copy. Its `npm run verify` line waits for step 5.

## Step 5: record
In `CONVERSION.md`: the page's row (screen folder, moved yes, proved with today's date), every kept oddity ("Asignee"), every "no part" control and what was decided, each AtomicAUI behaviour difference, open questions, and what you did not check. Add what AtomicAUI lacks to `GAPS.md`. Write your final message and fill the checklist now, its `npm run verify` line left unticked as "not finished", then run `npm run verify` once, last: every step must pass. When it ends, put its last lines into that checklist line, before the commit. If it fails, fix what it names with the command its last line gives (the page-only run, or the failed step alone), run `npm run verify` again, and correct the message, the checklist line and the page's row before the commit. Commit the page and the record together. Do not start the next page today; it starts at step 3, with any logic file it still needs copied as in step 2.
