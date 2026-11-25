# Map: the default .NET template to levels and recipes

For `references/restyle.md`, step 3: ASP.NET Core MVC, Razor Pages and Blazor as the template leaves them (Bootstrap in `wwwroot/lib`). Read `references/maps/html.md` and `bootstrap.md` for the elements. This page names what the template adds.

## Where each thing lives, and what to do
| In the template | Level | Do |
|---|---|---|
| `_Layout.cshtml` / `MainLayout.razor` | 2 | The frame first, when every page that uses the layout is in scope (`references/restyle.md`; otherwise it stays as it is): four identity attributes on `<html>`, `aui/aui.css`, `aui/aui-setup.css`, the two scripts (`../atomicaui/references/standard/start.md`); the page frame and the bar around `@RenderBody()` / `@Body`. Remove the Bootstrap `<link>` here, last, and the `<script>` too unless a restyled widget still needs it (`bootstrap.md`: a `Kept widget script` line in `GAPS.md`). A layout that stays: the page frame in the page marks `data-aui-panes="page in-layout"` (`references/restyle.md`, step 1) |
| `wwwroot/lib/` (Bootstrap, jQuery, validation) | none | Never read by the check (`lib/` is skipped). Delete the Bootstrap files once nothing uses them. jQuery validation keeps its logic |
| `wwwroot/css/site.css`, `*.razor.css` | 2 | Deleted last, once no page outside the scope uses it (`references/restyle.md`); a page of the scope never links it, and no new stylesheet takes its place. One that stays as it is for a page outside the scope: `--keep site.css` on `restyle-done` and the line ``- Kept for pages outside the scope `site.css`: which pages`` in `GAPS.md` (one stylesheet only; `check-standard` skips it then, and no page of the scope links it: the layout that does stays outside the paths) |
| `navbar`, `NavMenu.razor` | 2 and 3 | A `view-toolbar` bar; `asp-page` links stay `<a>` with their tag helper, and `<a>` and `NavLink` take the whole link class list of `top-bar-links` (`../atomicaui/references/standard/recipes/top-bar.md`). Keep the focus ring and `aria-current`; the link has no underline (`check-standard` fails one without it; body-text links keep theirs). A side menu: `GAPS.md`. For each styled piece beyond the recipe, add ``- Styled piece `<name>`: what was missing, which screen, which file`` to `GAPS.md` |
| `footer` | 2 | Inside the bar: the panes sit 4 px above the window bottom |
| A page's `<h1>` and content | 2 | The pane title (`view-pane`) and the body card |

## Forms and validation
| In the template | Do |
|---|---|
| `asp-for`, `asp-action`, `asp-page`, `asp-route-*` | Keep. A tag helper is an attribute your template owns |
| `<span asp-validation-for>`, `text-danger`, `field-validation-error` | `field-error` recipe: the model state chooses between the whole class lists, with `aria-invalid="true"` on the input |
| `<div asp-validation-summary>` | `message-banner` in `error` |
| `<select asp-for asp-items>` | `select-open` closed through a partial that takes the options and the value (`../atomicaui/references/samples/razor/Pages/Shared/_AuiSelect.cshtml`); give it the select's old id: its hidden input carries it |
| Blazor `EditForm`, `InputText`, `InputSelect`, `InputCheckbox`, `ValidationMessage` | Keep the component and its binding; a component renders its own element, so wrap the recipe's list in a class chosen by an expression, one whole list per state |

## Rules that differ here (`../atomicaui/references/samples/README.md`)
- Razor: one element per state, chosen with `if` and `else`, or one element whose whole class list an expression chooses: `class="@(picked ? "..." : "...")"`. Never a list built from pieces.
- Blazor: one element per item, its class list chosen by an expression; a component that holds a part renders without prerender.
- A class list lives in a partial or component, once. A page passes texts, ids and state.
- A dialog's footer button that posts the form leaves the page: `check-behaviour` cannot follow it (see the html map).
- `node ../atomicaui/scripts/standard-copy.mjs wwwroot`, then `node ../atomicaui/scripts/icon-kit.mjs <app folder>` (`../atomicaui/references/paths/build-standard.md`).
- Checks by address: the app must run first (`dotnet run`); give the pages and their files: `node ../atomicaui/scripts/check-standard.mjs Pages wwwroot --url <address>` when the whole app is in scope. A narrower scope names its own files instead, with the copied `aui/` folder (`Pages/Index.cshtml wwwroot/css/index.css wwwroot/aui`, and `aui-align.css` when a widget is aligned), never a shared `_Layout.cshtml` or `site.css` that stays as it is (`references/restyle.md`).
