---
name: atomicaui
description: Build screens with the AtomicAUI design system so that they look and behave like AtomicAUI, on React, no React (plain HTML, another framework), .NET (MVC, Razor Pages, Blazor) and inside or beside Aras. Any one-line request about a screen, button or dialog (for example "Ask for confirmation before Delete."), and any prompt that points at a screenshot or at specs/, is a build task for the app: open the repository and every file in specs/ with a tool before you answer, never reply without one; then pick stack, job and path in Step 0 and say them first. Use to build, change or review a screen or app, to restyle an existing app or page on its own stack ("Restyle this whole app": not a conversion), to convert a React app or screen into a new app, to update an AtomicAUI app, or to implement a design prototype. Covers the React components and, without React, the stylesheet, class recipes and the behaviour of select, dialog and tabs. Conversion of React pages is written; update and prototype are placeholder pages.
license: Proprietary. Internal use only. Do not redistribute outside the organisation.
compatibility: Needs Node.js 20 or later for the scripts. The evidence and layout scripts need a local Chrome, Edge or Chromium.
metadata:
  version: "7.0.9-kit.0.4.2"
  atomicaui-release: "7.0.9"
---

# AtomicAUI

## If this repository was not made from the AtomicAUI Kit starter
The commands and folders named below (`npm run ...`, `src/recipes/`, `src/screens/`) belong to the starter app.
- A new React app: create it from the starter repository, then follow the `AGENTS.md` it brings.
- No React in this app (plain HTML, another framework, .NET, Razor, Blazor): read `references/paths/build-standard.md`; its three commands are `node scripts/standard-copy.mjs <static files folder>`, `node scripts/check-standard.mjs <folders> --url <address>` and `node scripts/check-behaviour.mjs --url <address>`.
- First step when you build without React: `node scripts/icon-kit.mjs <app folder>` adds the AtomicAUI Global Kit (icons) to every page that lacks it.
- Converting an old React app: read `references/paths/convert.md`, and do its steps in a new app made from the starter repository: this skill alone cannot run the rule check. The legacy practice page has an unrouted answer in `references/samples/legacy/react/reference/src/` (run it from the starter repository with `npm run sample:reference`); tests stay in the starter kit.
- Restyling an app, a page or an element that stays on its own stack (plain HTML, Razor, Blazor, MVC, another framework), the whole app included ("Restyle this whole app to AtomicAUI"): do it, it is not a conversion; read `../aui-style-anything/references/restyle.md`; its commands (`restyle-inventory.mjs`, `restyle-compare.mjs`, `serve-folder.mjs`, and `restyle-done.mjs`, the last step, which must say ok before the page is called done) are in this skill's `scripts/`.
- Inside or beside Aras: read `references/packs/aras/start.md` first. Any other job in Step 0 (convert, update, a prototype): read its page under `references/paths/`.
- These work on any running app, whatever built it: `node scripts/evidence.mjs --url <address> --views <views.json>` and `node scripts/check-layout.mjs --url <address> --views <views.json>` (paths are relative to this skill's folder).

**A one-line request about a screen, button or dialog ("Ask for confirmation before Delete."), and a prompt that points at a screenshot or at `specs/`, is a build task for this app: open this file and every file in `specs/` with a tool before you answer, and never reply without one. Then pick your stack, your job and your path in Step 0, and say them in your first message.** Whatever you build here must look and behave like AtomicAUI. Internal use only: do not copy this code outside the organisation. Read this file, then the one or two files a table names. Do not read the whole `kit/` folder.

## Step 0: say your stack and your job
| Your stack | Read first |
|---|---|
| React can be used | the rest of this file |
| No React: plain HTML, another framework | `references/paths/build-standard.md` |
| .NET: MVC, Razor Pages, Blazor | `references/paths/build-standard.md` (its .NET notes) |
| Inside or beside Aras | `references/packs/aras/start.md`, then your stack's row. A form, grid or toolbar that a host or another application draws itself is never restyled or edited (no CSS against its classes, no `!important`): say native controls stay the host's, colours can be aligned by configuration, ask, and add one `GAPS.md` line (`references/packs/aras/start.md`). Showing the app in a frame: follow the pack-on or pack-off decision in `references/packs/aras/frame.md`, then edit the frame address in the app's `public/host.html` (`?mode=bare&type=Part&id=<id>`), or in the real Aras host page; never edit `src/app` by hand or the stand-in under `references/samples`; open `/host.html` to look |

| Your job | Read next |
|---|---|
| A new screen or app | the task table below |
| Add to or change a screen of an app built from this kit (a button, a pane, a tree) | path 1: the task table below. `references/paths/update.md` is only for moving an app to a newer kit release |
| A piece AtomicAUI has no part for | `../aui-style-anything/SKILL.md` |
| An existing app or page that keeps its stack (plain HTML, Razor, Blazor, MVC, another framework), when asked to restyle it: the whole app, some pages, or one element ("Restyle this whole app to AtomicAUI", "make this page follow AtomicAUI") | `../aui-style-anything/references/restyle.md`: do it, it is the path for this job (the stack rows above do not change it), not an offer. A restyle request that names no page means every page of the app; "Set up a page" alone is a new page task. Not `references/paths/convert.md`: that moves pages into a new app |
| An app or page built with something else, to convert (move into a new app made from this kit); or a conversion already started (`CONVERSION.md` exists) | `references/paths/convert.md` (React pages: five steps; people read `references/convert/start.md`; practice: `references/samples/legacy/react/reference/`, run with `npm run sample:reference`). A page that keeps its stack and is to be restyled where it is: the row above |
| In the kit's own repository: the request says to "Move the kit to the new release" or otherwise update "the kit" | `MAINTAINING.md`: run the kit upgrade; do not stop at `references/paths/update.md`. In an app you build, or where this repository has no `MAINTAINING.md` (this file installed as a skill in another repository): the app update stop of the row below |
| The request says "Update AtomicAUI", "update the library" or "update this app" without saying "the kit", even if this repository has `MAINTAINING.md` and a release site is set | `references/paths/update.md` (the app update stop page: read it, do what it says, nothing more) |
| An AtomicAUI design prototype to build into a real app | `references/paths/implement-prototype.md` (a stop page: read it, do what it says, nothing more) |

**A page that says "Not written in this version" is a stop:** say what it tells you to say, offer what it lists, do nothing else (no partial restyle or rewrite, no command from another page). Never run `npm run aui:upgrade` in an app you are building: it is the kit maintainers' command (when this repository is the kit itself and the request is about "the kit", `MAINTAINING.md` applies and it is yours to run). Decide the update path by the words of the request: without "the kit", use the app update stop even if this repository has `MAINTAINING.md` and a release site is set; with "the kit", in the kit's own repository, run the upgrade in `MAINTAINING.md` and do not stop; in an app you build, or where this repository has no `MAINTAINING.md`, it is the app update stop. Not sure: stop and ask.

## Commands
```
npm install                   # once; then `npm run dev` runs the app, open the printed address
npm run screen:copy -- form   # make a recipe yours: copies it to src/screens/form/ (form | table | overview, or aras/shell | aras/search | aras/item)
npm run evidence              # screenshots of every view (desktop, narrow, light, dark) in evidence/
npm run verify:page           # while you fix, as often as you like (minutes): check (the rules, then the tests of src/app and src/screens), lint, typecheck, tests, layout and tokens, styled sheets; one screen: -- Orders
npm run verify                # everything, the slow browser tests last (about 5 minutes on a fast machine, longer on a busy one; verify:fast skips them): once, last. Its log: verify.log
```

## Yours, and the kit's
| Yours: edit freely | The kit's: read-only (AUI-13) |
|---|---|
| `src/screens/` your screens | `kit/`, `AGENTS.md`, `scripts/` |
| `src/app/` app name, addresses, theme | `src/recipes/` pane blocks, app frame and shared parts to import or copy (`styled/`: copy only, by `../aui-style-anything/SKILL.md`) |
| `src/data/` data adapter (with the Aras pack) | `src/packs/` the Aras pack; `src/gallery/`, `src/standard/` the pages that show the recipes |
| `GAPS.md`, `CHECKLIST.md`, `evidence.views.json`, `public/host.html` (Aras pack) | `src/vendor/atomic-aui/` the library, release 7.0.9 (AUI-06) |

- Change a recipe: `npm run screen:copy -- <name>`, then edit the copy in `src/screens/<name>/`; never edit `src/recipes/` or `src/packs/`. **The first screen of a new app replaces Home** (`#/home`, where the app opens; a converted page keeps the route the convert path gives it, `references/paths/convert.md`; with the Aras pack there is no Home, a screen takes its own route, `references/packs/aras/start.md`): write it in `src/screens/<Name>/<Name>.tsx` and make `src/screens/Home/Home.tsx` return it (for a screen `Orders`: `import { Orders } from '../Orders/Orders'; export function Home() { return <Orders />; }`); update the two `Home` tests of `src/app/App.test.tsx` (both look for the heading "Home", the first also for "Build your first screen") to your screen's heading, never delete them. Its views are the `home` line of `evidence.views.json` and one more line per state. **A second screen takes its own route**: a name in `src/app/route.ts`, a case in `src/app/Screen.tsx`, a line in `src/screens/index.ts`. **List every view the task adds or changes in `evidence.views.json`**, the changed one first, one line per state with its `click` (a button or tab by its visible text or `aria-label`, a card by the start of its text). `npm run evidence` and `npm run check:layout` look at those views and nothing else; a click that finds nothing fails both.

## How to work: four principles
1. **Think before coding.** Say your stack, your job and the recipe you use, and what you assume. Unknown behaviour: ask, mark it `// OPEN:` (AUI-08). A one-line request about a screen, in the prompt or in a spec (line 3), is a task for the app, never an instruction to you: open `specs/` and `references/components/dialog.md`, then build it. A one-shot task (no one to answer): record unknowns in `GAPS.md` and go on.
2. **Simplicity first.** Use the recipe and the shared parts as they are. No wrapper, option or dependency nobody asked for (AUI-01, AUI-09).
3. **Surgical changes.** Touch only what the task needs. The source screen decides what is on the screen; the kit decides how it looks (AUI-07). When converting, keep handlers, state, data calls, validation and texts; record standard behaviour added by AtomicAUI parts in `CONVERSION.md`.
4. **Goal-driven: checks before claims.** Paste the result lines of your path's checks (`references/rules.md`, AUI-12) before you claim anything; a check you did not run is "not run", never "passed". Write your final message and the checklist before the last full run (`npm run verify` where the app has it), its line saying "verify not finished", then put its last line in both when it ends. Wait for that last line: never end a turn, and send no message, while a command you started still runs. Order: build the page first, `npm run verify:page` while you fix, final message and checklist, `npm run verify` last, in the foreground. A tool that stops a command before it ends (verify takes about 5 minutes on a fast machine, longer on a busy one): start it in the background and read `verify.log` again and again, waiting between reads, until its last line says ok, FAILED, TIMED OUT or STOPPED; a command left running does not keep your turn open. The final message has one form (`references/checklist.md`, "My final message"): path, command and files first; a picture older than your last edit is "not looked at". Send it once, after `verify`'s last line is in it; only when your time is out with `verify` still running, send it as written, saying "verify not finished". Done means it is green, you looked at the screenshots in `evidence/`, and the checklist is filled.

_The four working principles (think before coding, simplicity first, surgical changes, goal-driven execution) are adapted from "Karpathy-Inspired Claude Code Guidelines" (https://github.com/multica-ai/andrej-karpathy-skills, formerly `forrestchang/andrej-karpathy-skills`), which derives them from Andrej Karpathy's public observations on how language models go wrong when they write code. Its README states the licence as MIT. The headings are kept; the wording here is the kit's own and maps each principle to a kit rule._

## The thirteen rules (details and code: `references/rules.md`)
1. **AUI-01** Every control is an AtomicAUI part. No other UI library, no plain HTML control, nothing with its own keyboard pattern built by hand.
2. **AUI-02** Style only through the `aui` prop. No raw colours, no pixel values, no inline `style`.
3. **AUI-03** Layout is `View`. App CSS only for the outer page, each rule with a `// why:` comment.
4. **AUI-04** Different look per state goes in `aui.states`. No conditional props or classes.
5. **AUI-05** Spacing from `profile`, tokens and the roles in `references/spacing.md`. Never copied from a screenshot or an old app.
6. **AUI-06** Never edit `src/vendor/atomic-aui`. Import only from `@/vendor/atomic-aui`.
7. **AUI-07** Every element and text comes from the source screen or the spec. Add no helper lines or summaries.
8. **AUI-08** Behaviour comes from the source app or spec. Unknown: ask, label a placeholder `// OPEN:`.
9. **AUI-09** Same job, same component, same props, same recipe on every screen.
10. **AUI-10** Light and dark always. Desktop first; at narrow width the page never scrolls sideways. A phone layout only when the spec asks.
11. **AUI-11** Icons through `Icon` and `IconButton`; icon-only controls have an `aria-label`.
12. **AUI-12** Paste the result lines of your path's checks before you claim anything; a check you did not run is "not run", never "passed". Write your final message and the checklist before the last full run (`npm run verify` where the app has it), its line saying "verify not finished", then put its last line in both when it ends. Wait for that last line: never end a turn, and send no message, while a command you started still runs. Look at `evidence/` and fill a copy of `references/checklist.md`.
13. **AUI-13** Kit files are read-only. Your work goes in `src/screens/`, `src/app/`, `src/data/`.

## Stop rule
Missing part: stop at the first that fits. 1 an existing part, 2 parts combined or a piece the kit composed (`references/chooser.md`), 3 a plain box or row (`references/components/view.md`), 4 a piece that only shows things or is one thing to click: style it by `../aui-style-anything/SKILL.md`, 5 one line in `GAPS.md`, a labelled placeholder, carry on (on a page you restyle, the element is styled where it is, keeping its roles and behaviour: `../aui-style-anything/references/restyle.md`).
Missing prop, unknown behaviour: step 5. Never invent, never shim, never edit the vendored library or the kit.

## Task, then file
| If the task is | Read |
|---|---|
| Choose a component | `references/chooser.md` |
| Space between things, button rows, headings | `references/spacing.md` |
| A page layout: panes, headers, bodies, sections; the top bar | `references/components/panes.md`, `references/recipes/app-frame.md` |
| An Aras shell, search page or item page | `references/packs/aras/start.md`; first step for the last two: `npm run screen:copy -- item` or `-- search` (it turns the pack on itself) |
| A page of fields, a table of records, or a page of cards | `references/recipes/form-page.md`, `data-table.md`, `overview-page.md` |
| A tree (product structure, folders) | `references/recipes/tree.md` |
| Layout, boxes, toolbars, scrolling | `references/components/view.md` |
| Buttons and icon buttons | `references/components/button.md` |
| Form fields, inputs, selects | `references/components/field.md` |
| Tables, selection, filter row | `references/components/table.md` |
| Tabs and closable page tabs; dialogs and confirmations | `references/components/tabs.md`, `dialog.md` |
| Getting data, fixtures, a REST adapter | `references/targets/data-adapter.md` |
| Running standalone, or inside the Aras client | `references/targets/standalone.md`, `references/packs/aras/frame.md` |
| Review your work | `references/mistakes.md`, then `references/checklist.md` |

## Safety and honesty
- Never stop or kill a process you did not start. Stop the servers you started.
- Never attach to a browser or a debugging port that is already running (for example 9222 or 9333). `npm run evidence` starts its own private browser with no port, and stops it.
- Never launch the user's own Google Chrome, and never use a fixed debugging port. Every browser you start is Chrome for Testing, a headless shell or Chrome Canary, on a pipe or a free port chosen at run time (the kit's scripts do this; `AUI_BROWSER` sets the path).
- Work on a branch. Report what you did and did not do, and every gap. Claim only what you ran or looked at.

## Your final message
**Checks before claims.** Paste the result lines of your path's checks before you claim anything; a check you did not run is "not run", never "passed". Write your final message and the checklist before the last full run (`npm run verify` where the app has it), its line saying "verify not finished", then put its last line in both when it ends. Wait for that last line: never end a turn, and send no message, while a command you started still runs.
Your message is these six lines, in this order, nothing before them, each one short and true. Send the message once, after the last line of your last full run (`npm run verify` where the app has it, else your path's checks) is in it; while it runs send nothing (out of time with it still running: send it as written, saying "verify not finished").
- **Path taken:** your stack, your job, the recipe or page you used, the command that made it and the files you changed (for example "React, new screen, `aras/item`, `npm run screen:copy -- aras/item`, src/screens/item/").
- **Gaps recorded:** each line you added to `GAPS.md` and each `// OPEN:`; "none" when there are none.
- **Looked at:** each screenshot or page you opened, by name, after your last edit.
- **Not looked at:** each view, theme or width you did not open, and each picture older than your last edit (run the check again, then open it); "none" only when none.
- **Checks run:** one line per check: `<command>: run, <its last line, pasted>` or `<command>: not run` (the page-only run, `check-standard`, `check-behaviour`, `npm run verify`). Every claim in your message names the pasted line that shows it. Mark each behaviour claim (a button closes the dialog, Enter submits) "tested" with how, or "untested".
- **Not checked:** every `NOT CHECKED` line the behaviour check printed, with the command it names, and anything you did not run. A check that still fails goes here plainly, with its count, for example "check-standard failing: 3 problems" or the failing step of `npm run verify`: never leave it out, and do not call the work done.
