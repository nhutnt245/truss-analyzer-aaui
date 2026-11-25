# Convert an existing app: start here

For people. An assistant reads `references/paths/convert.md`; it does not need this page.

## What this is
You have an app that works. After the conversion it looks and behaves like AtomicAUI. It keeps the old behaviour except where an AtomicAUI part adds standard behaviour, such as Escape closing a dialog; each difference goes in `CONVERSION.md`. You move it one page at a time, and every page is checked before the next one starts.

## What this version covers
- **Where the new pages go is your choice:** a new app made from this kit, or inside the old app.
- **Written:** a new app made from this kit. React pages move into it one at a time.
- **Not written yet:** converting inside the old app, with old and new on one page. If you prefer it, tell whoever maintains the kit; today this guide cannot take you there.
- **Not yet:** moving pages without React into a new app. For them, assess and record with steps 1 and 5 only (`references/paths/convert.md`). To make such an app or page follow AtomicAUI where it is (the whole app, some pages or one element), with or without an assistant, read `../aui-style-anything/references/restyle.md`. For new pages without React, see `references/paths/build-standard.md`.
- More under "Not tested" at the end.

## What you need
| Need | Detail |
|---|---|
| Node.js | Version 20 or later. `node --version` prints it |
| git | `git --version` prints it |
| A browser | Chrome for Testing, Chromium or Edge. The kit starts its own private copy and never touches your open browser. `AUI_BROWSER` names another one |
| This repository | It becomes the new app. Its first page is the working start |
| The old app | Its source, and a way to run it |
| Time | About two hours for the first page |
| Optional | An AI assistant of your choice that your organisation allows on this code |

## The five steps
| Step | You make | You hold afterwards |
|---|---|---|
| 1 Assess | `CONVERSION.md`, pictures of each old page, a list of what each page must still do, the map | A map that a person has read |
| 2 Load AtomicAUI | The new app, made from this kit | `npm run verify:fast` passes before any page moves, and the set-up is in one commit |
| 3 Convert one page | `src/screens/<Page>/` | `npm run check` passes |
| 4 Prove that page | Pictures, behaviour, a filled checklist | The page-only run passes and you looked |
| 5 Record | `CONVERSION.md` says what moved and what remains, with the final message and the filled checklist | The last full `npm run verify` passes and its last lines are in the checklist, then the page and the record in one commit |

Steps 3 to 5 repeat for each page. You can stop after any step 5 and carry on another day: `CONVERSION.md` is the memory.

## Pick your way
| Way | For you if | Pages |
|---|---|---|
| Fast | You use a coding assistant every week | `fast.md` |
| Guided | You have an assistant but are new to it, or unsure | `guided.md`, `prompts.md`, `checks.md`, `recover.md` |
| By hand | No assistant, none allowed on this code, or you prefer it | `by-hand.md`, `map-react.md`, `checks.md` |

You can switch at any step: every way writes the same files. Not sure? Start with the guided way, and do the practice page first.

## Practise first
1. `npm install`, then `npm run sample:legacy`. It prints an address; open it. Stop it with Ctrl+C.
2. The page is an invented "maintenance desk" (`references/samples/legacy/react/README.md`). Convert it your way, then compare with the reference: `npm run sample:reference` runs the finished conversion at its own address (Ctrl+C stops it), and its files are in `references/samples/legacy/react/reference/src/`, laid out as an app (`src/screens/WorkOrders/`, `src/data/legacy/`). The starter itself does not route the converted page. Expect 30 to 90 minutes.
3. When it works, the same steps apply to a real page.

## Four promises
- Handlers, data calls, validation and every text stay as they are. An odd text is kept and listed. Standard behaviour added by an AtomicAUI part is recorded in `CONVERSION.md`.
- Nothing is added and nothing is lost: the same regions and words. Where the old order differs from the AtomicAUI pane, the pane's order wins; record that provisional choice.
- The kit decides the look. Old spacing, colours and class names are not carried over.
- The old app is only read. It keeps running until its last page has moved.

## When it goes wrong
- A check printed something you do not understand: `checks.md`.
- Anything else, with or without an assistant: `recover.md`.

## Eight words
- **Assistant:** a program you talk to that can read and change your files.
- **Prompt:** the text you give an assistant.
- **Model:** the brain behind the assistant. A bigger one is slower and better at hard problems.
- **Effort:** how long the model thinks before it answers.
- **The kit:** this repository: rules, parts, checks.
- **A part:** a ready-made piece of screen, such as a button or a table.
- **A token:** a named size or colour. The parts use tokens, so you never write a pixel or a colour.
- **A check:** a command that measures your work and says what to fix.

## Not tested
- Linux, and what Windows did not cover. The commands in these pages run on Windows (Windows PowerShell 5.1) and on macOS alike. They were run on a Windows 11 machine and on a Windows runner of the repository's CI (`.github/workflows/windows.yml`): `npm install`, `npm run check`, `npm run verify`, `npm run evidence`, `npm run screen:copy -- form`, `npm run scan`, `npm run dev`, `npm run sample:legacy`, `npm run sample:reference`, `node install.mjs <app> --claude` and the skill's `standard-copy.mjs`. The .NET samples were run there too (Windows 11 on ARM, .NET SDK 10.0.404): Razor and Blazor each with the three checks of `references/samples/README.md` (files, look, behaviour: 90 steps), `npm run samples:check` and `npm run verify` with the SDK installed (its legacy Razor test ran). `npm run aui:upgrade` (a command of the kit's maintainers) was run there: it refuses without its flag; a dry run against the real release site downloaded and checked the current release; against a fake newer release a dry run and the whole upgrade (every step green) ran. The CI job runs the samples check. Not run on Windows: an upgrade to a real newer release (none exists yet) and the assistant itself.
- **The first time a server starts on Windows** (`npm run dev`, the two samples, a check that serves a page), Windows may ask whether Node.js may use the network. Choose **Allow**: the server listens on your own machine only. Left unanswered, the prompt stalls the command that started the server.
- If something fails on your system, write down the command and what it printed, and report it.
- The advice on which model to pick rests on few runs.
- How users reach moved pages while two apps run is the app owner's decision. This guide does not design it.
