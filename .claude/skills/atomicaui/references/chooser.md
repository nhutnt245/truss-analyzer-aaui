# Component chooser

Find the need, use the part. Imports come from `@/vendor/atomic-aui`. Guides exist for the parts marked **guide**; for the others read the part's source folder in `src/vendor/atomic-aui/lib/<part>/`.

## Spec words to parts
The words of a spec often name a part by its job. Look here first: if a word matches, use that part (never a `View` built to look like it), then find its row below or read `src/vendor/atomic-aui/lib/<part>/`.

| The spec says | Use |
|---|---|
| start-up screen, splash, boot screen | `SplashScreen` |
| initials badge, user picture, avatar | `Avatar` (`Avatar.Image`, `Avatar.Fallback` for the initials) |
| overlapping team pictures, people count | `AvatarGroup` ([guide](components/avatar-group.md)) |
| page through slides or cards, rail of cards, next / previous slide | `Carousel` (numbered pages: `Pagination`; table rows with page size: `PagingBar` from `@/recipes/shared/PagingBar`) |
| numbered pages, previous / next page, ellipses | `Pagination` ([guide](components/pagination.md)) |
| drag or use arrows to pick a value or range | `Slider` ([guide](components/slider.md)) |
| type to add, type to find, suggestions as you type | `Autocomplete` (one value from a long list: `Field.Combobox`) |
| stat card, info card, card with title, text, image or footer | `Card` (never a `View` made to look like one; cards to pick: `../aui-style-anything/references/examples/selection-cards.md`) |
| fold, show / hide one block, one control that folds text open and shut | `Collapsible` ([guide](components/collapsible.md); never a `Button` with `aria-expanded`; several sections under each other: `Sections`; a side pane: `Pane` with `collapsible`; both from `@/recipes/layout`) |
| bottom message, message that goes away | `Toast` |
| unit or math mark (inch, psi, °F, ∞) in text | `Symbol` |
| toggle buttons in a row, list or grid toggle | `ToggleGroup` (views with their own panels: `Tabs`) |
| several switches under a heading | `SwitchGroup` |
| small panel that opens on a button | `Popover` |
| upload a file, drop zone | `FileUpload` |
| short list of lines, lines of facts or notes | `List` (never one `Type` line per fact) |
| item page, part page: a form with tabs such as Relationships or Documents | `npm run screen:copy -- item`, with or without the Aras pack (the command turns it on): never built by hand from parts ([item page](packs/aras/item-page.md)) |

## Parts by need
| Need | Use | Notes |
|---|---|---|
| A box, panel, row, toolbar, frame | `View` ([guide](components/view.md)) | Layout through `aui.sx`. `interactive` only for a clickable surface. |
| Blocks under each other, a button row under a form | `STACK_AUI`, `ActionRow` ([spacing](spacing.md)) | The stack owns the gap. |
| A scrolling region | `View.ScrollArea` | Never `overflow: auto` in CSS. |
| Text | `Type` | `role` picks the size: `h1`-`h6`, `p1`-`p3`, `l1`-`l7`. Always `aui={TEXT_AUI}`, or `as="span"` inside a row. |
| An action with a text label | `Button` ([guide](components/button.md)) | Main action: `ACTION_AUI`. |
| An action with only an icon | `IconButton` ([guide](components/button.md)) | `aria-label` is required. |
| A text link (in a table cell, a list, a sentence) | `Button` with `role="link"`, `nativeButton={false}` and `render={<a href="…" />}` ([table guide](components/table.md)) | A `Button` with only an `onClick` has role `button`: never for a link. Never plain underlined text, also when the address is unknown (`// OPEN:`). |
| A glyph | `Icon` | `aria-hidden` when decorative. |
| One line of text input | `Field` + `Field.Control` + `Field.Input` ([guide](components/field.md)) | Standalone `Input` only outside a form. |
| Several lines of text | `Field` + `Field.Textarea` | |
| Pick one of a list | `Field` + `Field.Select` ([guide](components/field.md)) | Under 8 options. More, or typing to search: `Field.Combobox`. |
| Type to find and add (type-ahead) | `Autocomplete` / `Combobox` | |
| A card with title, text, image, footer; a stat card | `Card` | Never a `View` styled as a card. Cards to pick: `../aui-style-anything/references/examples/selection-cards.md`. |
| A date | `Datepicker` | |
| A single value or range along a track | `Slider` ([guide](components/slider.md)) | Give every thumb an accessible name and take min, max and step from the product rules. |
| A number with steppers | `NumberField` | |
| On/off | `Switch` ([guide](components/switch.md)) | Takes effect at once, or is saved with its form or dialog where the source screen has a switch. `aui={SWITCH_AUI}`. |
| Tick one or many | `Checkbox`, `CheckboxGroup` | `aui={TOGGLE_AUI}` on every `Checkbox` (checked by AUI-09). |
| Pick one of a few, all visible | `RadioGroup` | `aui={TOGGLE_AUI}` on every `Radio` (checked by AUI-09). |
| Rows and columns of data | `Table` ([guide](components/table.md)) | Selection built in; sorting too, as its `sortable` option: off by default, on only where the user or the spec asks. Composed: `sortDirection` and `onSortToggle` only on the asked headers, and you order the rows. Data mode sorts the rows itself, and every column the spec does not sort takes `enableSorting: false`. Filter row and paging are composed. |
| Numbered pages of results | `Pagination` ([guide](components/pagination.md)) | For a table with range text and page size, use the kit's `PagingBar`. |
| A tree, one column (structure, folders) | `Tree` ([recipe](recipes/tree.md)) | The library's `TreeView`, through the kit recipe. Never built from `View`. |
| A tree with columns (multi-level BOM) | `Table` with `getSubRows` and `expandable` | |
| Switch between views of the same thing | `Tabs` ([guide](components/tabs.md)) | `aui={TAB_PANEL_AUI}` on every `Tabs.Panel`, `PANE_TAB_PANEL_AUI` under a pane header that holds the tab row (checked by AUI-09). Closable page tabs: `Tabs.CloseButton`. |
| Fold a section | `Accordion` | Several open at once: `openMultiple`. `SECTION_ITEM_AUI` on the first item, `SECTION_DIVIDER_AUI` on the others (checked by AUI-09). |
| Modal form or details | `Dialog` ([guide](components/dialog.md)) | |
| Confirm something destructive | `AlertDialog` | |
| Right-click menu | `ContextMenu` | |
| Menu under a button | `Dropdown` | In the top bar: `Menubar.Dropdown`. |
| A panel of controls under a button | `Popover` ([guide](components/popover.md)) | Not a menu: it holds switches or fields. |
| Top bar | `Menubar` | See the app shell recipe. |
| Side drawer (phone navigation) | `Drawer` | |
| Short message that goes away | `Toast` | |
| Hint on hover | `Tooltip` | |
| Small tag or state label | `Chip` | A status chip takes the tone the spec or source names; otherwise its usage context sets `success` for done, `warning` for in progress, `error` for failed, or `info` for informational; when the context is unclear, use the library Chip default `surface-alt` (`src/vendor/atomic-aui/lib/chip/use-recipe.ts:59`). |
| Overlapping people or avatars | `AvatarGroup` ([guide](components/avatar-group.md)) | `max` counts the overflow slot; use `total` for members the app has not rendered. |
| Progress or waiting | `Progress`, `Spinner` | |
| A list of simple rows | `List` | |
| A page area, a pane | `Pane` and `PaneBody` ([guide](components/panes.md)) | From `@/recipes/layout`. The pane is the kit's block: frame, 28 px header, body card. Never written from constants (AUI-09). |
| The top bar and the page under it | `AppFrame` ([recipe](recipes/app-frame.md)) | From `@/recipes/layout`. Change only the name, the logo and the menus. |
| Resizable split | `Panes` ([guide](components/panes.md)) | `Panels` is never written in a screen: `Panes`, `Pane`, `PaneGroup` wrap it. Layouts: [layouts](recipes/layouts.md). |

## Composed by the kit (import, do not rebuild)
| Need | Use |
|---|---|
| Paging bar | `PagingBar` from `@/recipes/shared/PagingBar` |
| Empty or failed-load message | `EmptyState` from `@/recipes/shared/EmptyState` |
| Button row under a form or table | `ActionRow` from `@/recipes/shared/ActionRow` |
| One-column tree | `Tree` from `@/recipes/shared/Tree` |
| A message that stays: passed, needs attention, failed | `MessageBanner` from `@/recipes/shared/MessageBanner` ([banner](components/banner.md)) |
| A labelled form field of any kind (text, number with unit, date, select, radio, checkbox, switch) | `FormField` from `@/recipes/form/FormField`; the grid is `FieldGrid` |
| "Configure columns" over a table | `ColumnPicker` from `@/recipes/shared/ColumnPicker` |
| Section cards on the pane colour, and the grid that holds them | `SectionCard`, `CardGrid` from `@/recipes/shared/` |
| Something is loading | `LoadingBlock` from `@/recipes/shared/LoadingBlock` |
| A whole page of fields; of rows to sort and search; of cards that sum up one thing | `npm run screen:copy -- form`, `-- table`, `-- overview` ([form](recipes/form-page.md), [table](recipes/data-table.md), [overview](recipes/overview-page.md)) |

## Not in the library
| Missing | Do |
|---|---|
| A piece that only shows things, or is one thing to click: cards to pick one of a few, rows of labels and values, another display piece | Style it by `../aui-style-anything/SKILL.md`: two examples to copy, role tables, proof. Never by eye |
| A chart with numeric values supplied by the spec or source | React: the `chart` block in the copied overview recipe (`references/recipes/overview-page.md`), with the `type` the spec or source draws: `bar`, `line`, `area`, `pie` or `radar` (AtomicAUI `BarChart`, `LineChart`, `AreaChart`, `PieChart`, `RadarChart`); never redraw one kind as another. A kind with no chart part (a scatter plot, a gauge), or more than six series or slices: a labelled `drawing` placeholder, `// OPEN:`, and a line in `GAPS.md`. A variant the `chart` block does not carry (100% stacked, horizontal bars, a donut, and the like) is never drawn as the plain kind: it stays a labelled `drawing` placeholder, `// OPEN:`, and a line in `GAPS.md` that names the variant. Without React, align an existing third-party chart; a new chart is a labelled placeholder (`references/paths/build-standard.md`). No values: a labelled `drawing` placeholder, `// OPEN:`, and a line in `GAPS.md`. |
| A diagram or graph view; very long lists; anything with a popup, text entry, arrow keys or drag | One line in `GAPS.md`, a labelled placeholder (stop rule). On a page you restyle, an old one keeps its markup, roles and behaviour and is styled where it is (`../aui-style-anything/references/restyle.md`) |

## Colour and paint
| Meaning | `aui` |
|---|---|
| Ordinary surface | default (`surface`, `solid`) |
| Toolbar, title bar or paging bar band | `{ ...BAR_AUI, color: 'surface-alt' }` beside a table that fills the card; `BAR_PADDED_AUI` beside padded blocks ([view](components/view.md)) |
| Main action | `color: 'secondary', paint: 'solid'` |
| Quiet action | `paint: 'text'` |
| Selected table row | `TABLE_PROPS` carries it (`SELECTED_ROW_AUI`: surface fill, 4 px secondary edge at the start). Do not restyle it: a `Table.Row` takes no `aui` (checked by AUI-09) |
| Selected card | Cards to pick, one route: copy the styled piece `../aui-style-anything/references/examples/selection-cards.md`; it already carries `SELECTED_CARD_AUI` (grey outlined card; picked: 2 px primary outline, neutral fill and text; checked by AUI-09), so write no `aui` of your own, and add its gap line (`GAPS.md`). `npm run check` fails a hand-built `<View selected>` (AUI-09). Never `CardGroup`: its picked card differs from our apps (`GAPS.md`). A card of a title and text: `description` on its option. Put it in a card (a `SectionCard` block or the default `PaneBody` body card), never as the direct children of `PaneBody surface="cards"` (`references/recipes/overview-page.md`) |
| Checkbox, radio | `aui={TOGGLE_AUI}` (1 px outlined box; ticked: solid primary). The table's own checkboxes get it from `TABLE_PROPS` |
| Warning, error, success | `MessageBanner` (`@/recipes/shared/MessageBanner`) with `level` `warning`, `error` or `success`; it is `Banner` with the kit look and takes `role="alert"` for errors, `role="status"` otherwise. A softer warning is a warning `Banner` with `paint: 'tonal'`; a banner to dismiss: `references/components/banner.md` |
| Accordion sections | `Sections` (it picks `SECTION_ITEM_AUI` for the first, `SECTION_DIVIDER_AUI` for the others: no corners, a divider above) |
| Pane title | `Pane` writes it (an `h2`, 16 / 20, semi-bold) |
| Panes, page frame, sections that fold | `Panes`, `Pane`, `PaneGroup`, `PaneBody`, `PaneTabBody`, `Sections` (`@/recipes/layout`, [panes](components/panes.md), [tabs](components/tabs.md)) |

Sizes: `scale` is `xs sm md lg xl`. Spacing: `profile` is `default`, `compact`, `square`, `no-padding`.
