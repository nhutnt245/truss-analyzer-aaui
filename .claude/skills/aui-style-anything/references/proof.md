# Proof: how a styled piece shows it looks like our apps

"It looks like AtomicAUI" is a claim. These four steps are the proof, in this order.

## 1. The gap line
A styled piece is a stand-in until the library has the part. Add one line to `GAPS.md` that starts "Styled piece" and has the name in backticks:
```
- Styled piece `label-value-rows`: no label-and-value part. Screen: Design check. File: src/screens/Design/LabelValueRows.tsx.
```
The checks fail a `data-aui-styled` name that `GAPS.md` does not mention.

## 2. The checks
| Stack | Command | It must end with |
|---|---|---|
| React, the kit starter | `npm run verify:page` (list the screen in `evidence.views.json` first) | `check:layout: ok`; its last step then writes the sheet of step 4 and fails until that is filled. The full `npm run verify` is the last run, once, after step 4 |
| Any other stack, app running | `node ../atomicaui/scripts/check-standard.mjs <folders with your pages, scripts and CSS> --url <address of each page>` (on a page you restyle: the files of `references/restyle.md`, step 5) | `check-standard: ok` |

What they prove about a styled piece, beyond the kit's rules for every screen:
| Checked | Rule |
|---|---|
| Every value is a token: the type check (React), the class list check (other stacks) | AUI-02, AUI-01 |
| Nothing overrides the library: each element against the same markup under the untouched stylesheet | AUI-06 |
| App CSS sets no look: colour, border, padding, margin, gap, font, radius, shadow, outline | AUI-03 |
| A click handler sits on a native `button` or `a` (pages without React), on a part or `View interactive` (React) | AUI-01 |
| A size written as a token came out as written: a line is a border, a slot fits its content | AUI-05 |
| No shadow on or inside the piece, no elevation above 0 | AUI-09 |
| A picked row or card keeps the kit's picked look | AUI-09 |
| The piece has its line in `GAPS.md` | AUI-12 |

The checks also list, without failing, every look and value of the piece that is not in the usage profile:
```
Not a look our apps use: sx gap=14 (line 12) in src/screens/Design/Verdict.tsx. Remove it, or give the reason on the evidence sheet.
```
The usage profile (`data/usage-profile.json`) holds the looks and values that at least two of our ten AtomicAUI apps use. A listed look is removed (take the nearest role), or it stays with one line of reason on the sheet: a size the piece really needs is the honest kind.

## 3. Look
Open the screenshots in `evidence/`: desktop and narrow, light and dark, on the surface the piece really sits on. A fill that equals the surface under it cannot be seen. Nothing overlaps, nothing jumps when a card is picked.

## 4. The evidence sheet
After the checks, from the app folder:
```
node scripts/styled-evidence.mjs <name> --check   # exits 1 until every "(you)" line is filled; without the starter it is the last run and must exit 0
```
It writes `evidence/styled-<name>.md` from what the checks measured, and you fill the lines marked "(you)". Run it again after a change: your lines are kept, also a line whose label you wrote without the mark (`Sheet: kind B; ...`): the run writes the label back whole. In the React starter `npm run verify:page` and `npm run verify` run it after the layout check and fail while a "(you)" line is not filled or the sheet says NOT MEASURED, STALE or NO LINE IN GAPS.md; the run names the lines still to fill. One NOT MEASURED passes: if no listed view can show a transient state (for example, a piece visible only while loading), fill `Not measured (you)` with why no listed view can show it; `--check` then accepts NOT MEASURED while the sheet still claims no look. Keep the marker and sheet; removing either is never the fix. The reason counts only against a current measurement: one that is empty, or older than the piece (STALE), still fails. A line that holds the words the script wrote is not filled, also when they hold your answer (`no clickable thing`; `none; or …`): write the answer in your own words. A filled sheet for a copy of the label-value-rows example; its two Measured lines are from a run on the gallery's own piece (`#/gallery`, tab "Banner and styled pieces"), so the sizes on your screen differ:
```
# Styled piece: label-value-rows
Source: src/screens/Design/LabelValueRows.tsx:27
Sheet (you): kind A; nearest example label-value-rows; roles: arranger (the group and each row), label, body text.
Rules: no problem in the source of this piece
Checks (you): check-standard: ok. 1 path(s) read, 4 views measured against the untouched stylesheet
Page check: 4 view(s) show this piece; 0 problem(s) in them.
Looks our apps do not use: none.
Reference in our apps (you): copied from the label-value-rows example.
Measured, desktop (light / dark): 1356 x 122; padding 0 0 0 0; radius 0; fill of the root none; text 14 / 18, weight 600, rgb(18, 18, 18) / rgb(248, 250, 252).
Measured, narrow: 306 x 182.
Clickable: none.
Shadow: none.
Sizes that must not move (you): none.
Focus (you): nothing in it takes focus: it only shows text.
Access (you): 1 yes, 2 yes, 3 yes, 4 yes, 5 yes, 6 yes, 7 yes, 8 yes, 9 yes, 10 not tried.
Screenshots: design-desktop-light.png, design-narrow-light.png, design-desktop-dark.png, design-narrow-dark.png
Not checked (you): screen reader.
GAPS.md: line 14.
```
A line that says NOT MEASURED, NOT FOUND or MISSING means the proof is not there: fix it, or say so in your report and claim no look. A NOT MEASURED piece that only a transient state shows also needs its reason on the `Not measured (you)` line (above).
A check that said SKIPPED measured nothing. No reference in any app: write "none in any app: a person must look"; the piece is not accepted before a person looked.

## The whole page: the token check
`node ../atomicaui/scripts/check-conformance.mjs --url <address>` proves that a running page, on any stack, uses only AtomicAUI's theme values, in light and dark. How to run it and read what it prints: `../atomicaui/references/token-check.md`.
