# Fast way: one prompt to assess, one prompt per page

For people who use a coding assistant every week. An assistant reads `references/paths/convert.md`; it does not need this page.
Copy only `.js` and `.ts` logic unchanged into `src/data/legacy/`; lint, KIT-02 and screen rules skip it, and typecheck counts its internal errors as ignored. Move `.jsx` and `.tsx` UI into a checked screen under `src/screens/`; errors in app-owned adapters and importing screens still fail.

Placeholders in angle brackets, used below:
- `<old folder>`: the old app's folder, relative to the new app's folder (for example `../old-app`). Never a path from your home folder: the record keeps it, and the record is committed.
- `<address>`: where the old app runs (it must be running).
- `<page>`: the name of the page to convert.
- `<steps>`: `2 to 5` for the first page, `3 to 5` for every later page. Steps 1 and 2 are done once per app. Step 2 ends with a commit of the set-up, before the first page: an undo on the first page returns to it.
- `<answers>`: one line per row the assistant marked "no part", or `none`.
- `<this repository's address>` and `<new app folder>`: where you got this kit from, and the folder the new app goes in.

## Set up (once)
```
git clone <this repository's address> <new app folder>
cd <new app folder>
npm install
npm run verify:fast
```
`verify:fast` runs in the foreground and must end without an error: wait for its last line, and never end your turn while it runs. Then start the old app in its own folder and note its address.

## Part 1: assess (once per app)
Paste into your assistant, started in the new app's folder:
```
Path 3 of this kit: convert an app, page by page. Read AGENTS.md, then references/paths/convert.md, and follow its five steps.
Old app: <old folder>. It runs at <address>; I started it.
Do step 1 for every page and stop. If CONVERSION.md exists already, never copy over it: add to it.
Capture with test or sample data, never live user records. Keep the primary output in conversion/before/ and separate runs in sibling folders named conversion/before-<page>/ so one run cannot erase another; git ignores both.
Record each page's capture folder in its CONVERSION.md row.
Show me the pages, the "Behaviour to keep" list, the map, and every row that says "no part". Change nothing in the old app.
```
Read the list and the map. A missed `click` still writes a picture: open `conversion/before/measure.json`, require empty `missedClicks` for every entry, and open every before picture to confirm its page and state. Check sibling output folders too. A row that says "no part" is a control AtomicAUI has no part for: decide what happens to it and put your decision in `<answers>`. Step 1 lists every such control, so that it can be built into the kit first. The answers, in this order: the stop rule builds it (`references/rules.md`, steps 1 to 4); else the part is built into the kit first and the page uses it; otherwise the page improvises it, as long as it follows the AtomicAUI standard: the checks must pass. The answer is recorded in `CONVERSION.md` (`references/convert/map-react.md`, last row of the elements table).

## Part 2: convert and prove (each page)
Paste after you read the map:
```
Map read. Page to convert: <page>. Answers: <answers>.
Go on with steps <steps> of references/paths/convert.md for this page only. Keep every handler, data call and text as it is. Record each standard behaviour an AtomicAUI part adds in CONVERSION.md.
If step 2 is among them, commit the set-up when step 2 is done, before step 3.
Use the page-only run of step 4 of references/paths/convert.md while you fix, write your final message and fill the checklist (its npm run verify line left as not finished), then run npm run verify once, last, in the foreground (never end your turn while it runs), and put its last lines into that line before the commit. If it fails, fix it, run it again, and correct the message, the checklist and the page's row in CONVERSION.md before the commit. Stop when it passes and you have looked at the pictures, or when the same problem has failed three times: then tell me what fails and what you tried.
End with: the files you changed, what you did not check, and the last six lines of npm run verify.
```

## What you check yourself
1. Run the page-only run of step 4 of `references/paths/convert.md` on your own screen, and `npm run verify` last. Its last lines must show no failure.
2. Open this page's pictures in `evidence/` beside the old ones in this page's capture folder recorded in `CONVERSION.md`: same regions and words, pane order as in `references/paths/convert.md`, nothing cut off.
3. Try each line for this page under "Behaviour to keep" and each AtomicAUI behaviour difference for this page in `CONVERSION.md`, or see the test that covers it.
4. The changes are only under `src/screens/`, `src/app/`, `src/data/` and `conversion/`, plus the files `CONVERSION.md`, `GAPS.md`, `CHECKLIST.md` and `evidence.views.json`, and `package.json` with `package-lock.json` when you approved a library. `git status` lists committed view definitions, but not ignored primary or sibling capture output; when the assistant has committed, `git status` is empty and `git show --stat` lists the committed files (on the first page also `git show --stat HEAD~1`, the set-up commit). Only the app's owner may opt in to committing captures made with test or sample data, using `git add -f conversion/before` and the same command with each existing sibling folder's exact name.
5. No `check-allow` that you did not approve: `git grep check-allow src`.

Something is off: `recover.md`.

## Next page
Commit the page, if `git status` is not empty. Start a new conversation. Paste:
```
A conversion is in progress here. Read AGENTS.md, references/paths/convert.md and CONVERSION.md. Change nothing.
Tell me which pages are proved, which page is next, and what is still open.
```
Then paste part 2 with the next page and `<steps>` as `3 to 5`. Part 1 is not done again.
