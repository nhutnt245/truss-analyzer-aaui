# When it goes wrong

For people. An assistant reads `references/paths/convert.md`; it does not need this page.

Find what you see in the left column. The prompts are in `references/convert/prompts.md`, under "Recovery prompts". To read what a check printed: `references/convert/checks.md`.

| You see | Do |
|---|---|
| The assistant says "Path 3 ... is not in this kit version" | Your copy of the kit is older than this guide: update it (pull this repository again). For a page without React the answer is right |
| It starts editing at step 1, or converts two pages | Stop it (Esc). Undo: `/rewind`, or "Undo with git" below. Paste the step's prompt again |
| It changed a file under `kit/`, `scripts/`, `src/recipes/` or `src/vendor/` (`npm run check` says AUI-13 or AUI-06) | Recovery prompt 1 |
| `check-allow` appeared where you did not approve it | Recovery prompt 2 |
| A text changed ("Asignee" became "Assignee"), a handler changed, a test was edited | Recovery prompt 3 |
| The new page has a line, a counter, an icon or a tooltip the old one lacks | Recovery prompt 4 |
| It says "done" and shows no check output | Recovery prompt 5, and run `npm run verify` yourself |
| The same problem a third time | Stop. Switch the model up for this one problem (`guided.md`, section 4), or do this piece by hand (`by-hand.md`, `checks.md`) |
| It says a part is missing | Look in `references/chooser.md` yourself. Missing indeed: one line in `GAPS.md`, and your answer on the "no part" row, in this order: the stop rule builds it (`references/rules.md`, steps 1 to 4); else the part is built into the kit first; otherwise the page improvises it, as long as it follows the AtomicAUI standard: the checks must pass. Record the answer in `CONVERSION.md` (`references/convert/map-react.md`, last row of the elements table) |
| The conversation is long and slow, or it forgets | Finish the page, commit, `/clear`, then the pick-up prompt |
| A usage limit | Use another model. The state is in `CONVERSION.md`: nothing is lost |
| It wants to run `npm run aui:upgrade`, stop a process it did not start, or use a browser that is already open | No. The kit forbids each (`AGENTS.md`, "Safety and honesty") |
| By hand: you are lost | "Undo with git" below returns to your last commit: the last proved page, or on the first page the set-up commit made after step 2. Start the page again from step 3 |

## Undo with git
1. `git status` lists what changed, and the new files under "Untracked files".
2. `git restore --staged .`, then `git restore .`: the files git already knows are as they were at your last commit. That commit is the last proved page; on the first page it is the set-up commit made after step 2. New files stay.
3. The page's new files, for example `src/screens/<Page>` and a logic file copied for it into `src/data/legacy/`: `git clean -n -- <the page's new paths>` shows what would be removed, then `git clean -fd -- <those paths>` removes it.

Never `git clean` without paths: it would also remove `CONVERSION.md` and `conversion/` while they are not committed.

## Before you give up
1. Run `npm run verify` and read upwards from its last line: it stops at the first step that fails.
2. Look at the pictures in `evidence/`. A green check can still hide a wrong page (`checks.md`, section 4).
3. Read `CONVERSION.md`: what it says moved, and what waits.
4. Still stuck: write down the command, what it printed, and the page. Ask whoever maintains the kit.
