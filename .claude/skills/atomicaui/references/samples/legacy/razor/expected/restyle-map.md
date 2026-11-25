# Restyle map

Made by `node scripts/restyle-inventory.mjs`. The "Suggested" column is a first guess from the kit's tables; "Level used" and "What stays" are yours to fill. Levels: 1 Replace, 2 Re-class, 3 Compose, 4 Align (`../aui-style-anything/references/restyle.md`).

## View: page

Title: Equipment loans - Loans desk. Elements that draw: 82. Plain boxes with no class and no style: 28. Elements with a style attribute: 6.

Stylesheets the page loads: `/css/site.css`, `/lib/tinychart/tinychart.css`. The old stylesheet is deleted from every page of the scope, never re-tokened, and no new app stylesheet is written: only the `aui/` files, `aui-align.css` and the stylesheet of a widget you align (level 4) stay linked (`node scripts/restyle-done.mjs` fails any other).

| Suggested | Kind | What | Count | Example | Recipe or part | Recipe file | Level used | What stays |
|---|---|---|---|---|---|---|---|---|
| 1 Replace | badge | `span.badge` | 5 | `#loans > tbody > tr:nth-of-type(1) > td:nth-of-type(4) > span` "Open" | `chip-status` | references/standard/recipes/chip.md | | |
| 1 Replace | banner | `div[role=alert]` | 1 | `div > main > div:nth-of-type(2)` "Two loans are overdue." | `message-banner` | references/standard/recipes/view.md | | |
| 1 Replace | select | `select` | 1 | `#status` | `select-open`, `field-select` | references/standard/recipes/field.md | | |
| 2 Re-class | row-click | `tr` | 5 | `#loans > tbody > tr:nth-of-type(1)` | `table-row-selected` | references/standard/recipes/table.md | | |
| 2 Re-class | box | `div.container` | 3 | `header > nav > div` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | button | `button` | 3 | `#new-loan` "New loan" | `button-default`, `button-main`, `button-quiet`, `button-disabled` | references/standard/recipes/button.md | | |
| 2 Re-class | box | `div.form-group` | 2 | `#search-form > div:nth-of-type(1)` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `li.nav-item` | 2 | `header > nav > div > ul > li:nth-of-type(1)` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | label | `label` | 2 | `#search-form > div:nth-of-type(1) > label` "Search" | `field-input` | references/standard/recipes/field.md | | |
| 2 Re-class | box | `div.page-header` | 1 | `div > main > div:nth-of-type(1)` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `footer.border-top.footer.text-muted` | 1 | `footer` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `main.pb-3` | 1 | `div > main` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | form | `form` | 1 | `#search-form` | `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | heading | `h1` | 1 | `div > main > div:nth-of-type(1) > h1` "Equipment loans" | `type-heading` | references/standard/recipes/view.md | | |
| 2 Re-class | heading | `h2` | 1 | `div > main > h2` "Loans per week" | `type-heading` | references/standard/recipes/view.md | | |
| 2 Re-class | list | `ul` | 1 | `header > nav > div > ul` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | menubar | `nav.navbar` | 1 | `header > nav` | `view-toolbar` | references/standard/recipes/view.md | | |
| 2 Re-class | table | `table` | 1 | `#loans` | `table-display`, `table-row-selected`, `table-sortable` | references/standard/recipes/table.md | | |
| 2 Re-class | text | `p` | 1 | `#count` "Showing 5 of 5 loans" | `type-heading` | references/standard/recipes/view.md | | |
| 2 Re-class | text-input | `input[type=text]` | 1 | `#q` | `field-input`, `field-input-readonly` | references/standard/recipes/field.md | | |
| 2 Re-class | toolbar | `div.btn-toolbar` | 1 | `div > main > div:nth-of-type(1) > div` | `view-toolbar` | references/standard/recipes/view.md | | |
| 3 Compose | link | `a` | 3 | `header > nav > div > a` "Loans desk" | no recipe: it only shows things or is one thing to click | ../aui-style-anything/SKILL.md | | |
| 4 Align | widget | `tc-*` | 15 | `#chart` | a third-party widget: align it, never edit its markup | ../aui-style-anything/references/align.md | | |

## View: return-dialog

Title: Equipment loans - Loans desk. Elements that draw: 92. Plain boxes with no class and no style: 28. Elements with a style attribute: 7.

Stylesheets the page loads: `/css/site.css`, `/lib/tinychart/tinychart.css`. The old stylesheet is deleted from every page of the scope, never re-tokened, and no new app stylesheet is written: only the `aui/` files, `aui-align.css` and the stylesheet of a widget you align (level 4) stay linked (`node scripts/restyle-done.mjs` fails any other).

| Suggested | Kind | What | Count | Example | Recipe or part | Recipe file | Level used | What stays |
|---|---|---|---|---|---|---|---|---|
| 1 Replace | badge | `span.badge` | 5 | `#loans > tbody > tr:nth-of-type(1) > td:nth-of-type(4) > span` "Open" | `chip-status` | references/standard/recipes/chip.md | | |
| 1 Replace | banner | `div[role=alert]` | 1 | `div > main > div:nth-of-type(2)` "Two loans are overdue." | `message-banner` | references/standard/recipes/view.md | | |
| 1 Replace | dialog | `div.modal-dialog` | 1 | `#return-dialog > div` | `dialog` | references/standard/recipes/dialog.md | | |
| 1 Replace | dialog | `div[role=dialog]` | 1 | `#return-dialog` | `dialog` | references/standard/recipes/dialog.md | | |
| 1 Replace | select | `select` | 1 | `#status` | `select-open`, `field-select` | references/standard/recipes/field.md | | |
| 2 Re-class | button | `button` | 5 | `#new-loan` "New loan" | `button-default`, `button-main`, `button-quiet`, `button-disabled` | references/standard/recipes/button.md | | |
| 2 Re-class | row-click | `tr` | 5 | `#loans > tbody > tr:nth-of-type(1)` | `table-row-selected` | references/standard/recipes/table.md | | |
| 2 Re-class | box | `div.container` | 3 | `header > nav > div` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `div.form-group` | 2 | `#search-form > div:nth-of-type(1)` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `li.nav-item` | 2 | `header > nav > div > ul > li:nth-of-type(1)` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | label | `label` | 2 | `#search-form > div:nth-of-type(1) > label` "Search" | `field-input` | references/standard/recipes/field.md | | |
| 2 Re-class | text | `p` | 2 | `#count` "Showing 5 of 5 loans" | `type-heading` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `div.modal-body` | 1 | `#return-dialog > div > div > div:nth-of-type(2)` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `div.modal-content` | 1 | `#return-dialog > div > div` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `div.modal-footer` | 1 | `#return-dialog > div > div > div:nth-of-type(3)` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `div.modal-header` | 1 | `#return-dialog > div > div > div:nth-of-type(1)` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `div.page-header` | 1 | `div > main > div:nth-of-type(1)` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `footer.border-top.footer.text-muted` | 1 | `footer` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `main.pb-3` | 1 | `div > main` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | form | `form` | 1 | `#search-form` | `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | heading | `h1` | 1 | `div > main > div:nth-of-type(1) > h1` "Equipment loans" | `type-heading` | references/standard/recipes/view.md | | |
| 2 Re-class | heading | `h2` | 1 | `div > main > h2` "Loans per week" | `type-heading` | references/standard/recipes/view.md | | |
| 2 Re-class | heading | `h4` | 1 | `#return-title` "Return this item?" | `type-heading` | references/standard/recipes/view.md | | |
| 2 Re-class | list | `ul` | 1 | `header > nav > div > ul` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | menubar | `nav.navbar` | 1 | `header > nav` | `view-toolbar` | references/standard/recipes/view.md | | |
| 2 Re-class | table | `table` | 1 | `#loans` | `table-display`, `table-row-selected`, `table-sortable` | references/standard/recipes/table.md | | |
| 2 Re-class | text-input | `input[type=text]` | 1 | `#q` | `field-input`, `field-input-readonly` | references/standard/recipes/field.md | | |
| 2 Re-class | toolbar | `div.btn-toolbar` | 1 | `div > main > div:nth-of-type(1) > div` | `view-toolbar` | references/standard/recipes/view.md | | |
| 3 Compose | link | `a` | 3 | `header > nav > div > a` "Loans desk" | no recipe: it only shows things or is one thing to click | ../aui-style-anything/SKILL.md | | |
| 4 Align | widget | `tc-*` | 15 | `#chart` | a third-party widget: align it, never edit its markup | ../aui-style-anything/references/align.md | | |

## View: privacy (Privacy)

Title: Privacy - Loans desk. Elements that draw: 15. Plain boxes with no class and no style: 1. Elements with a style attribute: 0.

Stylesheets the page loads: `/css/site.css`, `/lib/tinychart/tinychart.css`. The old stylesheet is deleted from every page of the scope, never re-tokened, and no new app stylesheet is written: only the `aui/` files, `aui-align.css` and the stylesheet of a widget you align (level 4) stay linked (`node scripts/restyle-done.mjs` fails any other).

| Suggested | Kind | What | Count | Example | Recipe or part | Recipe file | Level used | What stays |
|---|---|---|---|---|---|---|---|---|
| 2 Re-class | box | `div.container` | 3 | `header > nav > div` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `li.nav-item` | 2 | `header > nav > div > ul > li:nth-of-type(1)` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `footer.border-top.footer.text-muted` | 1 | `footer` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | box | `main.pb-3` | 1 | `div > main` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | heading | `h1` | 1 | `div > main > h1` "Privacy" | `type-heading` | references/standard/recipes/view.md | | |
| 2 Re-class | list | `ul` | 1 | `header > nav > div > ul` | `view-panel`, `view-row`, `view-stack` | references/standard/recipes/view.md | | |
| 2 Re-class | menubar | `nav.navbar` | 1 | `header > nav` | `view-toolbar` | references/standard/recipes/view.md | | |
| 2 Re-class | text | `p` | 1 | `div > main > p` "The loans desk keeps the names of borrow" | `type-heading` | references/standard/recipes/view.md | | |
| 3 Compose | link | `a` | 3 | `header > nav > div > a` "Loans desk" | no recipe: it only shows things or is one thing to click | ../aui-style-anything/SKILL.md | | |

Say for each row which level you used. A row marked `ask` or `gap`: write what you decided and why (`references/rules.md`, the stop rule). Copy the class list of the recipe whole from the file in "Recipe file"; a kind with no recipe file is level 3 or the stop rule, never a stylesheet of your own. Recipes are in `references/standard/recipes/`.
