# One look, two forms

The look of AtomicAUI is a stylesheet of classes; the React parts write those classes onto ordinary elements.
So a styled piece has one look and two ways to write it. The class form is a mechanical rewrite of the React form.

## The rewrite
| React `aui` | Class |
|---|---|
| `View` | `aui-view aui-frame` |
| `profile` and `scale` | `aui-scale-<profile>-<scale>`: `aui-scale-default-sm`, `aui-scale-no-padding-sm` |
| always | `aui-typography-typescale-default` |
| `shape` | `aui-shape-<shape>`: `aui-shape-soft`, `aui-shape-none` |
| `color` and `paint` | `aui-color-<paint>-<color>`: `aui-color-solid-surface`; with `tonal` or `fixed` also `aui-frame--inset` |
| elevation | `aui-elevation-0` |
| each `sx` key | `aui-<key with dashes>-<value>`: `aui-gap-8`, `aui-display-flex`, `aui-flex-direction-column`, `aui-min-width-0`, `aui-border-color-outlined`. `background` is `aui-bg-surface`, `foreground` is `aui-fg-on-surface` |
| `interactive` | `aui-stateful aui-focus-color-info aui-focus-width-2`, on a native `button` or `a` |
| `Type` with `role`, `weight`, `color` | `aui-frame aui-scale-no-padding-sm aui-bg-transparent`, then `aui-typography-typescale-l4`, `aui-typography-style-semi-bold`, `aui-fg-muted`, and the two text attributes |

Nobody types a class list from memory. An example carries it ready. For any other look the helper prints it, refuses a class that is not in the stylesheet, and says when a look is not one our apps use:
```
node scripts/aui-class.mjs view '{"color":"surface","paint":"solid","shape":"soft","profile":"default","sx":{"display":"flex","flexDirection":"column","gap":"8"}}'
aui-view aui-frame aui-scale-default-sm aui-typography-typescale-default aui-shape-soft aui-color-solid-surface aui-elevation-0 aui-display-flex aui-flex-direction-column aui-gap-8

node scripts/aui-class.mjs text '{"role":"l4","weight":"semi-bold"}'
aui-frame aui-scale-no-padding-sm aui-bg-transparent aui-typography-style-semi-bold aui-typography-typescale-l4
attributes: data-aui-typeface="engineering" data-aui-typography="body"
```
The look is the object React takes in `aui`, as JSON. With `"states"` it prints one list per state; with `"interactive": true` it adds the state layer.

## How each stack writes the piece
| | React | Any other stack |
|---|---|---|
| Boxes | `View` | an element with a View class list |
| Text | `Type` | an element with a text class list |
| Existing parts inside | imported from `@/vendor/atomic-aui` | their class recipe, whole (`../atomicaui/references/standard/recipes/`) |
| Looks | named constants, `as const`, above the component; no look inside the markup | one string constant per look; a class list is one whole string, never built from pieces |
| Same piece twice | one component, data as props; no `aui`, `className` or `style` prop | one partial or component; plain HTML copies the block whole |
| Marker | `data-aui-styled="<name>"` on the root `View` | the same attribute on the root element |
| Forbidden | `className`, `style`, a CSS rule, a plain element | `style`, a CSS rule for the look, a class of your own on the piece |

## Where the piece lives
| Stack | Where | Proof |
|---|---|---|
| React, the kit starter | one file per piece in `src/screens/`; its screen listed in `evidence.views.json` | `npm run verify:page` |
| ASP.NET MVC, Razor Pages | one partial view per piece; a state picks between two whole constants: `@(picked ? On : Off)` | `node ../atomicaui/scripts/check-standard.mjs <folders> --url <page>` |
| Blazor | one component per piece; parameters are data; `@onclick` only on a native `button` or `a` | the same |
| Plain HTML | a block in the page | the same |
| Angular, Vue, Svelte, JSP and other templates | one component or partial per piece; class lists as whole strings | the same |
| A page shown inside Aras that we own | as React or as plain HTML | the same |
| Our HTML inside an Aras form | kind A only, and only after the stylesheet is proved to load there | not proven on a real instance: say so |
| Forms, grids, toolbars that a host or another application draws itself (Aras, or a form another application owns) | never restyled: colours by configuration only, one `GAPS.md` line (`references/align.md`) | none |

On every stack the page must already load AtomicAUI: the React library, or the `aui/` folder (`../atomicaui/references/standard/start.md`). Setting that up is not this guide's job.

## Notes per stack
- Templates: the file check cannot read a class list built at run time, so the page check (`--url`) is required.
- Blazor: no `class="@($"...")"` built from pieces.
- Plain HTML: the `hidden` attribute does not hide an element with AtomicAUI classes; use `aui-display-none`.
- React: `View as="button"` renders a button with no `type`. Inside a form use `View interactive` without `as`. The generated HTML form carries `type="button"`.
- Aras: the root font size must be 16 px, or every size is wrong.
- Kind B anywhere but React: a native `button type="button"` or an `a`, never a `div` with a click handler. The checks fail a click handler on any other element.
