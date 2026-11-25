# Prompts to paste, one per step

For people. An assistant reads `references/paths/convert.md`; it does not need this page.

Placeholders in angle brackets: `<old folder>` the old app's folder, relative to the new app's folder (for example `../old-app`), never a path from your home folder: the record keeps it, and the record is committed; `<address>` where the old app runs; `<page>` the page's name; `<answers>` one line per "no part" row, or `none` (the three answers: `references/convert/map-react.md`, last row of the elements table); `<path>` a file the assistant should not have changed.
Each prompt names the path and the step. Without that, an assistant told only "convert this" may take a half-moved app for an update and stop.
Each section: the prompt, "a good answer", "a bad answer", "check yourself".

## Step 0: first contact (nothing changes)
```
Do not change any file yet. Read AGENTS.md and references/paths/convert.md.
Then tell me in a few lines: which path applies here, the five steps in your own words, and what you need from me before step 1.
```
- **Good:** says "Path 3: convert"; names assess, load, convert, prove, record; asks for the old app's folder and address.
- **Bad:** it starts editing, or says the path is not in this kit version. Then `recover.md`, row 1.
- **Check yourself:** nothing changed: `git status` is empty.

## Step 1: assess (once per app)
```
Step 1 of references/paths/convert.md, for every page of the old app.
The old app is in <old folder> and runs at <address>. Do not edit anything in the old app.
If CONVERSION.md exists already, never copy over it: add to it.
Use test or sample data for captures, never live user records. Keep the primary output in conversion/before/ and separate runs in sibling folders named conversion/before-<page>/ so one run cannot erase another; git ignores both.
Make CONVERSION.md, the pictures of the old pages in those capture folders, the "Behaviour to keep" list and the map. Record each page's capture folder in its CONVERSION.md row.
Then stop and show me the pages, the behaviour list, the map, and every row that says "no part".
```
- **Good:** it stops. Every page is listed. The list is in the old pages' own words. Every kind of control has a map row. Odd texts are listed, not fixed.
- **Bad:** it goes on to edit screens (`recover.md`, row 2), or the list says things the page does not do (prompt 4).
- **Check yourself:** a missed `click` still writes a picture. Open `conversion/before/measure.json` and require empty `missedClicks` for every entry; check separate output folders too. Open every before picture to confirm its page and state, then read the map against the old pages on your screen.

## Step 2: load (once per app)
```
Step 2 of references/paths/convert.md. Run npm run verify:fast (not the full verify) in the foreground, wait for its last line (never end your turn while it runs), and show me its last six lines before anything moves.
Then copy only the .js and .ts logic files the page <page> needs from <old folder> into src/data/legacy/, byte for byte, and tell me every library they import. Move any .jsx or .tsx UI into a screen under src/screens/ where the checks apply.
Typecheck counts errors inside copied legacy logic as ignored; errors in app-owned adapters and screens that import it still fail. Do not edit copied logic to clear those errors.
Install nothing before I say yes.
When step 2 is done, commit the set-up as its item 5 says, and show me what git show --stat prints.
```
- **Good:** it shows `verify` ending well first. A logic file is copied byte for byte; a JavaScript one gets its types in a `.d.ts` beside it. It ends with one commit of the set-up.
- **Bad:** it edits a copied file, or installs a package unasked (`recover.md`, row 2 and the last rows).
- **Check yourself:** `git status` is empty, because the assistant committed the set-up. `git log --oneline -1` shows that commit, and `git show --stat` names what is in it, and nothing else: `CONVERSION.md` and view definitions under `conversion/`, `GAPS.md` when a control has no part, copied logic under `src/data/legacy/`, changes under `src/app/` (the name, the top bar), and `package.json` with `package-lock.json` once you said yes to a library. Ignored pictures and measurements in primary and sibling capture folders are absent. If `git status` still lists these files, the assistant did not commit: do it yourself with `git add -A`, then `git commit -m "Conversion set-up"`. Only the app's owner may opt in to committing captures made with test or sample data, using `git add -f conversion/before` and the same command with each existing sibling folder's exact name before the commit. An undo on the first page returns to this commit.

## Step 3: convert one page (every later page starts here)
```
Step 3 of references/paths/convert.md, for the page <page> only. The map is approved. My answers on the "no part" rows: <answers>.
If the page needs a .js or .ts logic file that is not in src/data/legacy/ yet, copy it there from <old folder> byte for byte, and tell me every library it imports. Move any .jsx or .tsx UI into a screen under src/screens/ where the checks apply. Install nothing before I say yes.
Typecheck counts errors inside copied legacy logic as ignored; errors in app-owned adapters and screens that import it still fail. Do not edit copied logic to clear those errors.
Keep every handler, state, data call and text exactly as in the old page. Use standard AtomicAUI part behaviour and record each difference from the old page in CONVERSION.md.
Run npm run check until it passes. If the same problem fails three times, stop and tell me what it says and what you tried.
```
- **Good:** it ends with `check: ok`. No `check-allow` except on a library import you approved.
- **Bad:** `check-allow` to make it pass (prompt 2), a changed text (prompt 3), an added line or icon (prompt 4).
- **Check yourself:** `npm run check` ends with `check: ok`.

## Step 4: prove
```
Step 4 of references/paths/convert.md for <page>. Run the page-only run of that step (it takes minutes; the full npm run verify takes about 5 minutes on a fast machine, longer on a busy one, and comes last, in step 5) and paste its last six lines unchanged.
Open the four pictures of each view of <page> in evidence/ and the old ones in this page's capture folder recorded in CONVERSION.md. Tell me every difference in regions, order and words, including the pane title before an old breadcrumb, and anything cut off, overlapping or unreadable.
Try each line for <page> under "Behaviour to keep" and each recorded AtomicAUI behaviour difference for <page> (including Escape closing a dialog, if it applies); tell me which you tried, how, and which you could not try.
```
- **Good:** the six lines are shown unchanged; it names each picture it opened; it says what it did not try.
- **Bad:** "done" with no check output (prompt 5).
- **Check yourself:** run the page-only run of step 4 yourself; open this page's pictures; try every behaviour line for this page and every recorded AtomicAUI behaviour difference for this page in the running app (`npm run dev`), or see the test that covers it.

## Step 5: record
```
Step 5 of references/paths/convert.md for <page>. Update CONVERSION.md and GAPS.md. Write your final message and fill CHECKLIST.md first (its npm run verify line left as not finished), then run npm run verify once, last, in the foreground (never end your turn while it runs), and put its last lines into that line before the commit. If it fails, fix it, run it again, and correct the message, the checklist and the page's row in CONVERSION.md before the commit. Do not start another page.
End with: what moved, what remains, every open question, and what you did not check (the full verify too, if it did not finish).
```
- **Good:** the page's row says moved and proved with a date; oddities and open questions are listed.
- **Check yourself:** read `CONVERSION.md`. `git status` is empty when the assistant committed, and `git show --stat` then names the page and the record in one commit. If `git status` still lists them, commit the page and the record together yourself.

## Pick up in a new conversation
```
A conversion is in progress here. Read AGENTS.md, references/paths/convert.md and CONVERSION.md. Change nothing.
Tell me which pages are proved, which page is next, and what is still open.
```
Then the step 3 prompt with the next page. Steps 1 and 2 are done once per app: the step 1 prompt is not pasted again.

## Recovery prompts
Numbered as in `references/convert/recover.md`.

Prompt 1: a kit file was changed.
```
1. You changed a kit file (<path>). Kit files are read-only (AUI-13). Put it back exactly as it was and solve the problem in src/screens/ instead. If the kit is wrong, add one line to GAPS.md.
```
Prompt 2: `check-allow` appeared.
```
2. Remove every check-allow you added, except those on library imports I approved. Fix the cause the check names.
```
Prompt 3: a text, a handler or a test changed.
```
3. Compare src/screens/<page>/ with the old page in <old folder>. List every handler, condition, data call and visible text that differs. Put each back as the old page has it.
```
Prompt 4: something was added.
```
4. List every visible text and control of the new page that the old page does not have. Remove them.
```
Prompt 5: "done" without proof.
```
5. Run npm run verify now and paste its last six lines unchanged.
```
