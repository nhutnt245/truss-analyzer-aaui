# Roles: what each box and text is

You name a role; its row gives the look. Every row is a look our AtomicAUI apps use (release 7.0.9, size tier `sm`).
"React" goes in the `aui` prop of a `View`. "Classes" lists only what differs: every box class list starts `aui-view aui-frame`, and carries `aui-typography-typescale-default` and `aui-elevation-0`.
Never type a class list: copy it from an example, or print it with `node scripts/aui-class.mjs` ([forms](forms.md)).

## The piece sheet
A comment above the piece, the same in every stack. Fill it before you write the piece.
```
STYLED PIECE: part facts. AtomicAUI 7.0.9 has no part for it (GAPS.md). Kind A, display only.
Nearest example: label-value-rows.
root : arranger        (a named group, a column)
  row  : arranger      (a divider under every row but the last)
    label: label       (l4 semi-bold) in a label column of 160
    value: body text   (p3)
States: none. Sizes: the label column is 160 wide. Icons: none.
```

## Surface: what the box is
| Role | When | React | Classes that differ |
|---|---|---|---|
| Arranger | A row or column that only places things | `paint: 'text', profile: 'no-padding'` | `aui-scale-no-padding-sm aui-shape-none aui-color-text-surface` |
| Content card | A block of content on a pane | `color: 'surface', paint: 'solid', shape: 'soft', profile: 'default'` | `aui-scale-default-sm aui-shape-soft aui-color-solid-surface` |
| Quiet band | A small box that sets a value apart, on a white card | `color: 'surface-alt', paint: 'solid', shape: 'soft', profile: 'default'` | `aui-scale-default-sm aui-shape-soft aui-color-solid-surface-alt` |
| Outlined box | A box that needs a grey frame | an arranger or a content card, with `borderColor: 'outlined'` and the four border widths `'1'` | `aui-border-color-outlined` and the four width classes of the divider rows below |
| Selection card | Kind B that can be picked | `SELECTED_CARD_AUI` on `View as="button" interactive selected` | the two whole class lists of `references/examples/selection-cards.md` |
| Status tag | The kind or state of a thing | not a styled piece: the `Chip` part, `scale: 'sm'`, `paint: 'solid'`, colour by data | `../atomicaui/references/standard/recipes/chip.md` |
| Pane, body card | The area a screen sits in | not a styled piece: `Pane`, `PaneBody` (`../atomicaui/references/components/panes.md`) | `view-pane` in `../atomicaui/references/standard/recipes/layout.md` |

Tones, by meaning and never by taste: `success` passed, `warning` needs attention, `error` failed. `primary` is for the picked thing and for one accent icon, nothing else.
A fill only shows on a different surface: a quiet band goes on a white card, never straight on the tinted pane.

## Text: what the words are
`Type`, never `fontSize` or `lineHeight` in `sx`. The class list of text is always `aui-frame aui-scale-no-padding-sm aui-bg-transparent` plus the row, with the attributes `data-aui-typeface="engineering" data-aui-typography="body"`.
| Role | React | Classes added |
|---|---|---|
| Title of a piece | `as="h2"` or `as="h3"`, `role="l3" weight="semi-bold"` | `aui-typography-style-semi-bold aui-typography-typescale-l3` |
| Label, sub-heading | `role="l4" weight="semi-bold"` | `aui-typography-style-semi-bold aui-typography-typescale-l4` |
| Body text | `role="p3"` | `aui-typography-typescale-p3` |
| Secondary text | `role="p3" color="muted"` | `aui-fg-muted aui-typography-typescale-p3` |
| Small caption, count | `role="l6" color="muted"` | `aui-fg-muted aui-typography-typescale-l6` |
| Strong line | `as="strong" role="l3" weight="bold"` | `aui-typography-style-bold aui-typography-typescale-l3` |

A tag with a browser margin (`p`, `h1` to `h6`) also takes margin 0: `aui={TEXT_AUI}`, or the class `aui-margin-0`.

## Border and line
| Role | React `sx` | Classes |
|---|---|---|
| Divider under a row or a header | `borderColor: 'outlined', borderBlockEndWidth: '1'`; `'0'` on the last row | `aui-border-color-outlined aui-border-block-end-width-1` |
| Divider above a section | `borderColor: 'outlined', borderStyle: 'solid', borderBlockStartWidth: '1'` | `aui-border-color-outlined aui-border-style-solid aui-border-block-start-width-1` |
| The other two sides of an outlined box | `borderInlineStartWidth: '1', borderInlineEndWidth: '1'` | `aui-border-inline-start-width-1 aui-border-inline-end-width-1` |
| Picked edge of a table row | not written: `TABLE_PROPS` carries it | `table-row-selected` in `../atomicaui/references/standard/recipes/table.md` |

A box is never smaller than 10 px by 10 px, so `height: '1'` draws a 10 px bar. A line is always a border; the page check fails a size that came out larger than asked.

## Shape
| Role | Value |
|---|---|
| Content card, band, banner, selection card | `soft` (4 px) |
| Arranger | none |
| A control (`Button`, `IconButton`, a field) | never set: the part's default is already soft |
| `pill`, `smooth` | not offered: our apps use `pill` only inside the slider |

## Spacing
The kit's spacing rules hold (`../atomicaui/references/spacing.md`): one owner per space, `gap` only, no margin.
| The space | Write |
|---|---|
| Inside a box | its profile: `default` is 4 and 8, `no-padding` is 0 |
| An icon and its text; cards in a group; a caption over its value | `gap: '4'` |
| Things in a row; blocks in a piece | `gap: '8'` |
| A label column and its value; an icon and the text of a message | `gap: '12'` |
| Groups, sections | `gap: '16'` |
| A row of a list | `paddingBlockStart: '8', paddingBlockEnd: '8'` |
| A label column | `width: '160', flex: 'none'` |
| A flex child that holds long text | `flex: 'fill', minWidth: '0'` |

## State
| State | You write it? | How |
|---|---|---|
| Hover, pressed, keyboard focus, disabled | Never | automatic on kind B |
| Picked | Yes | React: `selected` with `SELECTED_CARD_AUI`. Other stacks: swap the whole class list and `aria-pressed` |
| A look that follows data (passed, failed) | Yes, as a table | one named constant, or one whole class list, per value; never a condition inside a look |

## Elevation, motion, icon
| Axis | Rule |
|---|---|
| Elevation | Always 0 on a styled piece. Only a library popup floats. The checks fail a shadow |
| Motion | A styled piece does not animate. Waiting is the `Spinner` part |
| Icon, decorative | `<Icon name="..." aui={{ scale: 'sm' }} aria-hidden />`; one accent icon may take `color: 'primary'` |
| Icon, clickable | `IconButton` with an `aria-label`, always square: `square`, `square-compact`, or `contained` in a 28 px header |
