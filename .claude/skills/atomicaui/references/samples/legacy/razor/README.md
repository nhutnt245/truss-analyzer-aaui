# Sample: an old Razor Pages app to restyle

The "loans desk" of `../html/` as an ASP.NET Core Razor Pages app, the way the default .NET template leaves it: a layout with a navbar and a footer, Bootstrap-style class names, a stylesheet and a script of its own, tag helpers, and a third-party chart widget in `wwwroot/lib/`. Use it to practise `../aui-style-anything/references/restyle.md` and `../aui-style-anything/references/maps/dotnet-default.md`. It needs the .NET SDK (10).

| File | What |
|---|---|
| `Pages/Index.cshtml` (+ `.cs`), `Pages/Privacy.cshtml`, `Pages/Shared/_Layout.cshtml` | The pages and the layout. The search is a form that gets the same page with a query; the model filters on the server |
| `wwwroot/css/site.css`, `wwwroot/js/site.js` | The old look (a stand-in for the Bootstrap 5 theme, not Bootstrap) and the old script |
| `wwwroot/lib/tinychart/` | The third-party chart. Read-only: level 4 |
| `views.json`, `expected/restyle-map.md` | The three views (the page, its dialog, the Privacy page) and the map `restyle-inventory` writes for them |
| `reference/` | The restyled files, laid out as they sit in the project: copy them over it |

The sample keeps no data: the list is fixed, and a loan returned in the dialog is marked in the page only.

## Practise (macOS or Windows)
1. Copy this folder out of the kit, for example to `my-loans`. `dotnet run --project my-loans` prints an address (the port is chosen by the system).
2. `node scripts/restyle-inventory.mjs --url <address>/ --views my-loans/views.json`. Compare `restyle/restyle-map.md` with `expected/restyle-map.md`.
3. Restyle by the guide: `node scripts/standard-copy.mjs my-loans/wwwroot`, the layout first, then the partial for the select, then the page.
4. Run the four commands of `../aui-style-anything/references/restyle.md`, step 5, giving `my-loans/Pages my-loans/wwwroot` to `check-standard`, then its step 6 with the same paths (`restyle-done` must say ok; fill "Level used" in every row of `restyle/restyle-map.md` first: it fails a row that says none). Both need these lines in a `GAPS.md` in the folder you run them from:
   ```
   - Aligned widget `tinychart`: a third-party chart. The loans page. Anatomy, states and behaviour stay the widget's.
   ```

## The reference
Copy `reference/` over a copy of the project, then delete `wwwroot/css/site.css`, and run `node scripts/standard-copy.mjs <project>/wwwroot`. It changes the layout (identity attributes, the bar, the page frame), the page (`Index.cshtml`, `Privacy.cshtml`), the select (the kit's `_AuiSelect.cshtml` partial and its model in `Models/AuiParts.cs`) and the script. The layout loads the script on every page, and the old one stopped on the Privacy page at its first missing element; the answer's leaves a page without the loans table alone, because `check-standard` fails a page whose console shows an error and `restyle-done` would not say ok. The footer text moved into the bar: the panes must sit 4 px above the window bottom. The navbar links keep their element and take the link class list of `top-bar-links` (`references/standard/recipes/top-bar.md`); `tag helpers` stay. The server round trip (the search) stays: the select's hidden input posts `Status` in the query. Every id, name and value stays: the hidden input keeps `id="status"` (the kit's partial puts the id it is given on its hidden input), the table `id="loans"`, the dialog title `id="return-title"`. The parts add ids of their own: `q-label`, `status-label`, `status-trigger`, `status-list`, `return-dialog-description`.
