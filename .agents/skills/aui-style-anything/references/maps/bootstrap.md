# Map: Bootstrap to levels and recipes

For `references/restyle.md`, step 3. Read `references/maps/html.md` first: it holds the element rows. This page names what is Bootstrap's own. A Bootstrap class is never kept next to an AtomicAUI one: when the recipe is in, the class goes (except a class a kept widget script needs: below), and the Bootstrap stylesheet and script go last (a `<link>` or `<script>` that names it fails `check-standard`, AUI-01; a shared one that a page outside the scope still uses stays (`references/restyle.md`)). The script stays while a restyled `dropdown`, `collapse`, `tooltip`, `popover` or `offcanvas` still needs it for its behaviour: one `GAPS.md` line, ``- Kept widget script `bootstrap.bundle.min.js`: which widgets, which page``, and `check-standard` accepts that script. The classes the script finds or toggles stay on their elements (`dropdown`, `dropdown-toggle`, `dropdown-menu`, `collapse`, `show`, `offcanvas`): the AtomicAUI classes beside them replace their look. The stylesheet goes all the same: copy into your own stylesheet only the show and hide rules those widgets need (for example `.collapse:not(.show) { display: none; }`), each with its `/* why: */` comment, in one small stylesheet named with `--keep` on `restyle-done` and the line ``- Kept stylesheet `<name>`: which widgets, which page`` in `GAPS.md` (one stylesheet only).

| Bootstrap | Level | Becomes | Watch |
|---|---|---|---|
| `btn btn-primary` | 2 | `button-main` | Only one main action per bar or dialog: the others are `button-default` |
| `btn btn-secondary`, `btn-light`, `btn-outline-*` | 2 | `button-default` | |
| `btn-link`, `btn-sm` | 2 | `button-quiet`; size is the recipe's | |
| `btn-danger`, `btn-success`, `btn-warning` | 2 | `button-main` or `button-default` (provisional) | The kit has no red or green button: the colour of a button never carries the meaning, its text does |
| `btn:disabled`, `.disabled` | 2 | `button-disabled` | |
| `form-control` | 2 | `field-input` (`field-textarea` on a textarea) | |
| `form-select` | 1 | `select-open` written closed | Value and label: see html map |
| `form-check`, `form-check-input` | 1 | `checkbox`, `field-radio`; `form-switch`: `field-switch` | |
| `form-group`, `mb-3`, `row g-3` | 2 | `view-stack`; side by side: `view-row` | Delete the margin classes |
| `invalid-feedback`, `is-invalid` | 2 | `field-error` | Show the text while the field is invalid |
| `input-group` | 2 | A `view-row` of field and button | |
| `table`, `table-striped`, `table-hover` | 2 | `table-display`, or `table-scroll` when its columns do not fit 390 px | No stripes: the table has its own hover. Sortable header: `table-sortable`. `table-responsive` (the wrapper box) goes: `table-scroll` scrolls inside the table |
| `badge`, `label label-*`, `badge text-bg-*` | 1 | `chip-status` | The tone the source names; otherwise its usage context sets `success` for done, `warning` for in progress, `error` for failed, or `info` for informational; when the context is unclear, `surface-alt`, the library Chip default. The text says the state |
| `alert alert-success`, `alert-warning`, `alert-danger` | 1 | `message-banner` in `success`, `warning`, `error`; with an icon, `message-banner-with-icon` | `alert-info` has no tone: take `warning` if it asks for attention, otherwise `success` (provisional). An icon in it: the whole icon slot of `message-banner-with-icon` (the `aui-banner-icon` span with its `<i>`), only the `fa-` name changed; never a copied `<svg>` or `<img>` |
| `modal`, `modal-dialog`, `modal-content` | 1 | `dialog` closed in its layers | Delete the toggle script; footer buttons close it |
| `nav-tabs`, `nav-pills` | 1 | `tabs` | Keep your panels; name each with `aria-controls` |
| `card`, `card-body`, `list-group` | 2 | `view-panel`, `section-card`; a picked card: `references/examples/selection-cards.md` | |
| `navbar`, `navbar-brand`, `nav-link` | 2 and 3 | `view-toolbar`; links use `top-bar-links` | The bar keeps its element; copy each link's whole class list from `top-bar-links` (the top-bar blocks are for a new page, on a `<div>`). Add ``- Styled piece `<name>`: what was missing, which screen, which file`` to `GAPS.md` for a piece the recipes do not cover. A nav link or tab has no underline: keep `aui-text-decoration-none` on each `<a>` |
| `dropdown`, `tooltip`, `popover`, `offcanvas`, `collapse` | gap | None in class form | Restyled where it is: its markup, roles and behaviour stay, its look comes from the tokens and the nearest part (`SKILL.md`), and Bootstrap's script stays for it, with the classes it finds or toggles (above); for a styled piece add ``- Styled piece `<name>`: what was missing, which screen, which file`` to `GAPS.md`; what cannot be styled is one line in `GAPS.md`. A `collapse` of sections: the next row |
| `accordion`, `panel-group` and the `collapse` of each section | 1 | `accordion-sections` (view) | A section's `collapse` is part of it: `accordion-collapse` (Bootstrap 5), `panel-collapse` (3), a `collapse` inside `div.accordion` (4) |
| `breadcrumb`, `pagination` | 3 | Composed from `button-quiet` and text | Add ``- Styled piece `<name>`: what was missing, which screen, which file`` to `GAPS.md` |
| `container`, `row`, `col-*`, `d-flex`, `gap-*` | 2 | `view-stack`, `view-row`; columns of cards: `card-grid` (cards) | Layout classes of the box: `aui-gap-8`, `aui-width-fill` |
| `text-muted`, `fw-bold`, `fs-*`, `m*-*`, `p*-*` | 2 | Nothing: the recipe's text class | Delete |
| `spinner-border`, `spinner-grow`, `progress`, `progress-bar` | gap | `loading-block` (cards) for a spinner | |
| Bootstrap icons, Font Awesome | 2 | The icons of the recipes (the icon kit, `../atomicaui/references/paths/build-standard.md`) | Icon-only: `aria-label` |
| jQuery plugins and `data-bs-*` | 4 | They keep their logic; the markup they draw is aligned | `references/align.md` |
