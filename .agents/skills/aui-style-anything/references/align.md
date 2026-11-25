# Level 4: align a widget you cannot replace

A third-party chart, grid or scheduler keeps its own markup, states and behaviour. **A grid, form or toolbar that a host or another application draws (the Aras host, or a form another application owns, whatever its data) is never aligned here, in CSS or with an attribute: stop (`../atomicaui/references/paths/build-standard.md`, line 7; `../atomicaui/references/packs/aras/start.md`, "Native Aras screens"). The only option you offer is colours by configuration, never a replacement or an edit of its stylesheet; always leave one `GAPS.md` line and change nothing else.** Alignment gives it AtomicAUI's colours, font, corners and space, in light and dark. It does not make it AtomicAUI. Use it only after levels 1 to 3 failed (`references/restyle.md`).

## Two ways, in this order
| Way | Do |
|---|---|
| 1 The widget's own settings | Hand it values from the theme: `{ bar: 'var(--theme-primary)', text: 'var(--theme-on-surface)', background: 'var(--theme-surface)' }`. A widget that needs a literal colour reads it once with `getComputedStyle(document.documentElement).getPropertyValue('--theme-primary')`; read it again when the theme switches |
| 2 One stylesheet, `aui-align.css` | For what the settings cannot reach: fixed greys, a font, a corner. Load it after the widget's own stylesheet |

## The marker and the line
- The widget's root element carries `data-aui-aligned="<name>"` (lower case, dashes). Nothing else of the widget changes.
- One line in `GAPS.md`: ``- Aligned widget `<name>`: what it is, which page, what alignment cannot give.``
- The widget keeps its own stylesheet, never edited. `check-standard` and `restyle-done` leave it alone in `lib/`, `vendor/` or `node_modules/`; anywhere else (`css/select2.min.css`) it needs one more line, by file name and widget: ``- Aligned widget stylesheet `select2.min.css` of `select2`: which pages.`` It counts only beside the widget's own ``Aligned widget `select2` `` line and a page that marks the widget's root `data-aui-aligned="select2"`: a stylesheet line for no marked widget counts for nothing, and the stylesheet is checked as your own CSS. With all three both skip it, so it is never your own CSS: no rule of yours goes in it.

## `aui-align.css`: the one stylesheet allowed to set a look
```css
/* why: the widget draws its axes in a fixed grey that its settings cannot reach */
[data-aui-aligned="tinychart"] .tc-grid { border-color: var(--theme-outlined); }
```
| Rule | Fails |
|---|---|
| Every selector starts with `[data-aui-aligned="<name>"]`, then the widget's own parts | `.tc-grid { ... }` on its own (AUI-03); a selector on `.aui-` or `[data-aui-...]` (AUI-06) |
| A `/* why: ... */` comment above every rule | A rule with none (AUI-03) |
| Only a look: colour, border and corner, font, line height, space, shadow, opacity | `display`, `position`, `width`, `content` (AUI-03) |
| Every value is `var(--theme-...)`, `var(--p-...)` or `var(--typography-...)`, a plain keyword (`none`, `solid`, `transparent`, `bold`, `italic`, `uppercase`, `underline`) or `0` | A hex colour, `13px`, `Georgia`, `red`, `var(--my-grey)`, a number other than 0 (`600`, `1.5`) (AUI-02) |
| No `!important`, no variable defined | Either (AUI-06) |
`node ../atomicaui/scripts/check-standard.mjs <folders with your pages and aui-align.css>` reads it. Never put the widget's own stylesheet or its folder in that list (`lib/`, `vendor/` and `node_modules/` are skipped, and so is a stylesheet with its ``Aligned widget stylesheet `<file>` of `<name>` `` line, the widget's own line and a marked root). A name with rules and no marked element fails: the rules would reach nothing.
Pick the role by meaning: line or frame `--theme-outlined`, quiet text `--theme-muted`, text `--theme-on-surface`, accent `--theme-primary`, ground `--theme-surface`, corner `--p-px-4` (the soft step). Font: `--typography-typeface-family`; size and line `--typography-typescale-p3-font-size` and `-line-height` (14 / 20); weight `--p-weight-semi-bold` or `--p-weight-regular`.

## What alignment cannot give, and the check cannot see
- Anatomy, hover, focus and disabled looks, keyboard patterns and behaviour stay the widget's. Say so in the `GAPS.md` line.
- Dark mode works only when the widget reads variables or its colours are in `aui-align.css`. Open the page in dark and look.
- `node ../atomicaui/scripts/check-conformance.mjs` proves the values, never that the role is right: a muted grey on a title passes.
- A third-party widget that carries logic is aligned, never swapped, unless the app's owner asks.
- A widget drawn into a canvas, an image or a frame is not read by the check (`../atomicaui/references/token-check.md`): say what you could not prove.
