---
name: aui-style-anything
description: Style UI so that it looks and behaves like our AtomicAUI apps, in React or any other stack (.NET MVC, Razor, Blazor, plain HTML, pages shown inside Aras, other frameworks): a piece AtomicAUI has no part for (a card to pick, rows of labels and values), or an existing app or page that keeps its stack. Use when a screen needs something the component list lacks, when asked to make a hand-styled piece look like AtomicAUI, when the AtomicAUI rules say a part is missing, or to restyle an existing app (the whole app, some pages, one element) so it follows AtomicAUI. Gives a fixed procedure, role-to-token tables, copyable examples, a class-list helper, an evidence sheet, and for restyling an inventory of the app's pages, four levels (replace, re-class, compose, align), mapping pages and a before-and-after comparison. Not for a job a part does, nor a new popup, text entry, arrow keys, drag and drop or drawing: parts or a line in GAPS.md. A restyled page keeps its old ones, roles and behaviour.
license: Proprietary. Internal use only. Do not redistribute outside the organisation.
compatibility: Needs the atomicaui skill of the same version installed beside it, and an app that already loads AtomicAUI. Node.js 20 or later for the scripts. The page check needs a local Chrome, Edge or Chromium.
metadata:
  version: "7.0.9-kit.0.4.2"
  atomicaui-release: "7.0.9"
---

# AUI style anything

Paths are relative to this skill's folder; `../atomicaui/` is the AtomicAUI skill installed beside it. `npm run ...` and `src/` belong to the React starter; without React use the "Any other stack" column.

Give a look to one piece of UI that AtomicAUI has no part for. It must look and behave like our AtomicAUI apps, in React or in any other stack.
You pick roles. The tables turn roles into the tokens our apps use. You never pick a value.
An existing app or page you keep on its own stack and make follow AtomicAUI (the whole app, some pages or one element), not one new piece: `references/restyle.md`.
This guide needs the AtomicAUI kit beside it: its rules (`../atomicaui/references/rules.md`), page set-up and checks. Not there: stop, install the kit.
Internal use only.
How to work (think before coding, simplicity first, surgical changes, goal-driven): the four principles in `AGENTS.md`, "How to work: four principles"; in an installed skill, the same section of the atomicaui skill's SKILL.md.

## Step 1: stop or go. Say your answer.

| Question (stop at the first yes) | If yes |
|---|---|
| Is it a form, grid or toolbar that a host or another application draws itself (the Aras host, a form another application owns)? | Never restyled or edited: no CSS against its classes, no `!important`. Say native controls stay the host's, colours can be aligned by configuration, and ask. One line in `GAPS.md` (`references/align.md`). Stop. |
| Is the piece missing from the source screen or the spec? | Do not build it (AUI-07). Ask. |
| Has `../atomicaui/references/chooser.md` a part, or a piece the kit composed, for the job? | Use it. Stop. A small tag is `Chip`. |
| Is it a plain box, row, column or pane? | `../atomicaui/references/components/view.md`; without React `../atomicaui/references/standard/recipes/view.md`. Stop. |
| Does it open a popup, take typing, move with arrow keys, drag, or draw (chart, diagram)? | No new one is built here: the AtomicAUI part. None, on a page you restyle (a host's or another application's form, grid or toolbar: the first row applies): a drawing is aligned (`references/align.md`); anything else keeps its markup, roles and behaviour, and only its look is made by the steps below (`references/restyle.md`). Go on; what cannot be styled is one line in `GAPS.md`. None, on a new screen: the stop rule (`../atomicaui/references/rules.md`). |
| Does it only show things? | Kind A. Go on. |
| Is it one thing to click (a card, a tile)? | Kind B. Go on. |

Say: "Styled piece: <name>. No AtomicAUI part: checked <parts>. Kind A." (or B).

## Step 2: find the nearest example

| Piece like | Read |
|---|---|
| Pick one of a few, as cards | `references/examples/selection-cards.md` |
| Facts about one thing, in rows | `references/examples/label-value-rows.md` |

Same job: copy the whole example for your stack, change texts and data, go to step 6.
Other job: keep the nearest example open as your pattern.
No example is near: go on, and write "none in any app: a person must look" on the evidence sheet.

## Step 3: name the roles
Write the piece as boxes and texts, three levels deep at most.
Give each one a role from `references/roles.md`: surface, text, border, shape, spacing, state, icon.
Elevation is always 0. A styled piece never animates.
Write the piece sheet as a comment above the piece (its form is in `references/roles.md`).

## Step 4: turn roles into tokens
One table row per role. A value that is in no row is not written: take the nearest role, or ask.

## Step 5: write it in your stack (`references/forms.md`)

| | React | Any other stack |
|---|---|---|
| Boxes and text | `View`, `Type`, `Icon`, existing parts | elements with class lists |
| Looks | named constants in `aui` | whole class lists: from the example, or printed by `node scripts/aui-class.mjs` |
| Root | `data-aui-styled="<name>"` | `data-aui-styled="<name>"` |

One file per piece. Data comes in; no look comes in.

## Step 6: states, sizes, access
- Hover, pressed, focus, disabled: never written.
- Picked: `selected` with `SELECTED_CARD_AUI`; or swap the whole class list and `aria-pressed`.
- A look that follows data: one named look per value, picked from a table. Never a condition inside a look.
- A row keeps its size when a control comes or goes. An icon control is square: `square`, `square-compact`, `contained`.
- A line is a border. Picking a card moves nothing.
- Answer the ten lines of `references/access.md`.

## Step 7: prove it (`references/proof.md`)
1. Add one line to `GAPS.md`: - Styled piece `<name>`: what was missing, which screen, which file.
2. Run the kit's checks: `npm run verify:page`, or `node ../atomicaui/scripts/check-standard.mjs <folders> --url <page>` (on a page you restyle: the files of `references/restyle.md`, step 5, and its step 6, `node ../atomicaui/scripts/restyle-done.mjs`, which must say ok before you say the page is restyled). **Checks before claims.** Paste the result lines of these checks before you claim anything; a check you did not run is "not run", never "passed". Write your final message and the checklist before the last full run (`npm run verify` where the app has it), its line saying "verify not finished", then put its last line in both when it ends. Wait for that last line: never end a turn, and send no message, while a command you started still runs.
3. Open the screenshots: light and dark, desktop and narrow, on the surface the piece sits on.
4. `node scripts/styled-evidence.mjs <name>` writes `evidence/styled-<name>.md`. Fill the lines marked "(you)". In the React starter `npm run verify:page` writes it too, and fails until every "(you)" line is filled and the sheet no longer says NOT MEASURED. Without the starter, run `node scripts/styled-evidence.mjs <name> --check` last; it must exit 0. One NOT MEASURED passes: if a piece appears only in a state no listed view can show (for example, while loading), fill its `Not measured (you)` line with why; the check accepts that reason against a current measurement, but it proves no look. Keep the marker and sheet; removing either is never the fix.
5. Stop your own server by the process id you started, never by name.

A check that says SKIPPED measured nothing: say so, claim no look. In the React starter the sheet then says NOT MEASURED and `npm run verify:page` fails until a browser is found (set `AUI_BROWSER` to its full path). A reason on the `Not measured (you)` line does not change that: an empty measurement, or one older than the piece, still fails.

## Never
- A raw colour, a pixel value, an inline style, a CSS rule or a class of your own for the look.
- Another UI library. An edit to the library, the kit or this guide.
- A piece, a text or a helper line the source does not have.
- A keyboard pattern, a popup, an input or a drawing built by hand.
- A part rebuilt that AtomicAUI already has. A picked row or card restyled.
- A look our apps do not use, without one line that says why.
- Elevation, a shape on a control, a hover or focus look.
