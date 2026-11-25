# Sample: an old plain HTML page to restyle

One page of an invented "loans desk", written the old way: a hand-kept stylesheet, a Bootstrap-style class list, a modal shown by `style.display`, and a third-party chart widget. Use it to practise `../aui-style-anything/references/restyle.md` before you restyle a real page.

| File | What |
|---|---|
| `index.html`, `app.js`, `legacy.css` | The page, its logic and its old look. Logic stays; the look does not come along |
| `vendor/tinychart/` | A stand-in for a third-party chart (script and stylesheet). Read-only: level 4, aligned and never edited |
| `views.json` | The two views to record: the page, and the page with the dialog open |
| `expected/restyle-map.md` | The map `restyle-inventory` writes for this page (test-checked) |
| `reference/` | The finished restyle: `index.html`, `app.js`, `aui-align.css`, and the same `vendor/`, untouched |

## Practise (Node 20 or later; the same on Windows and macOS)
1. Copy this folder out of the kit, for example to `my-loans`. Do not work in `kit/`.
2. `node scripts/serve-folder.mjs my-loans` prints an address. In another terminal:
   `node scripts/restyle-inventory.mjs --url <address>/index.html --views my-loans/views.json`
   Open `restyle/restyle-map.md` and the pictures in `restyle/before/`. Compare the map with `expected/restyle-map.md`.
3. Restyle by `../aui-style-anything/references/restyle.md`: `node scripts/standard-copy.mjs my-loans` first, then the frame, the controls, the dialog, the chart. Stop and restart the server when you add the folder.
4. Prove it, with the page running:
   `node scripts/check-standard.mjs my-loans/index.html my-loans/aui-align.css my-loans/aui --url <address>/index.html` (given these paths it reads markup and stylesheets; give it `my-loans/app.js` too and it reads the markup and style that script writes, `../aui-style-anything/references/restyle.md`; the class lists `app.js` writes are checked through `--url`), `node scripts/check-conformance.mjs --url <address>/index.html`, `node scripts/check-behaviour.mjs --url <address>/index.html` and `node scripts/restyle-compare.mjs --url <address>/index.html`.
   `check-standard` needs these lines in a `GAPS.md` in the folder you run it from:
   ```
   - Aligned widget `tinychart`: a third-party chart. The loans page. Anatomy, states and behaviour stay the widget's.
   ```
   Then step 6 of `../aui-style-anything/references/restyle.md`, with the same paths and the same `GAPS.md`: `node scripts/restyle-done.mjs my-loans/index.html my-loans/aui-align.css my-loans/aui --url <address>/index.html` must end with `restyle-done: ok`. Fill "Level used" in every row of `restyle/restyle-map.md` first (the table below gives the levels): it fails a row that says none. It also runs `check-behaviour` and fails on a select, dialog or tabs that does not pass it; a dialog that differs only in where its focus starts or the order of its buttons is said and passes. Every other `.html` page in `my-loans/` that still loads an app stylesheet fails unless it is listed under "Not done" at the end of `restyle/restyle-map.md` (the answer in `reference/` loads none).
5. The untouched page fails the token check at once (`C0`: the page does not load AtomicAUI). With step 1 done and the old look still in, it reports hundreds of values; the finished page reports none.

## What the reference shows
| Kind of element | Level | Recipe |
|---|---|---|
| Buttons, the search field | 2 | `button-main`, `button-default`, `button-disabled`; `field-input` |
| The status select, the dialog, the status labels | 1 | `select-open`, `dialog`, `chip-status` |
| The table with a row to pick | 2 | `table-row-selected` with header cells of `table-display` |
| The overdue notice | 1 | `message-banner` |
| The chart | 4 | its own settings take the theme's colours; `aui-align.css` does the rest |
| The nav bar | 2 | `view-toolbar` (the top-bar recipes are for a new page) |
Every id, name and value stays. The select's hidden input keeps `id="status"` and `name="status"`, so `getElementById('status').value` still reads the status; its label points at the select's trigger, because a hidden input takes no label. The table root keeps `id="loans"`, the dialog title `id="return-title"`. The parts add ids of their own: `q-label`, `status-label`, `status-trigger`, `status-list`, `return-dialog-description`. What changed in the logic: the dialog's opening and closing is the part's (`data-aui-dialog-open`, the footer buttons), so the old show and hide handlers are gone; the markup `app.js` writes is the recipes' whole class lists, chosen by state. The part adds a close button the old modal lacked. The select's option values equal their labels, because the behaviour check compares with the React part on that basis. Run the reference: copy `reference/` out of the kit (it holds its own `vendor/`), then add `aui/` with `node scripts/standard-copy.mjs <that folder>`.
