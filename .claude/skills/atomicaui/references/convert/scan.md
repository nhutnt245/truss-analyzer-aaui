# Scan an old app before you convert it

The scan reads the old app's source files and lists every control it writes: what the kit has for it, what it has no part for, and what the scan cannot tell. It needs no running app, no browser and no model. You or an assistant can use it.

This version reads **React apps** (`.tsx`, `.jsx`, `.ts`, `.js`). Plain HTML, Razor, Blazor and a scan of the running pages are not in it yet.

## Run it

Do this in the new app (the one built from this kit), once `npm install` has run there. The new app may sit inside the old repository (for example `old-app/aui/`): from there, use `--app ..`; the scan skips its own app folder and writes `conversion/` inside the new app.

```
npm run scan -- --app ../old-app
```

On Windows write the folder the way the system does: `--app ..\old-app` works too. The scan only reads the old app and refuses an `--out` folder inside it except inside the new app when it is nested there. It also refuses one typed in another letter case where the file system ignores case (macOS, Windows), or output files linked elsewhere. A linked `src/` outside the old app is refused; any other linked file or folder (and a linked `tsconfig.json` or `jsconfig.json`) is not followed and is listed under **Not read**.

| Option | Meaning |
|---|---|
| `--app <folder>` | The old app (needed). Its `src/` folder is read; without one, the folder itself |
| `--out <folder>` | Where the files go. Default `conversion` |
| `--strict` | Exit code 1 while any row is `unknown` (for an assistant that must loop until all are settled) |

It writes `conversion/scan.md` (tables for you), `conversion/scan.json` (the same rows for an assistant, every place listed) and, when it finds eligible static routes, `conversion/scan.views.json` (a first list of views). Run it twice: you get the same files. The last line is `scan: summary {...}`.

## Read `scan.md`

| Answer | Meaning |
|---|---|
| part, kit piece, plain box, styled piece | The kit has this. The `Mapped` table says which part, and which page to read |
| no part | Nothing in the library or the kit does this job |
| decide | Behaviour written by hand (a click on a `div`, a key handler, markup from a string). Someone says what it is |
| unknown | The scan cannot tell: a component of a library it has no table for, a custom element |

`date` inputs map to the kit's day picker. `datetime-local`, `month` and `week` inputs each get a `no part` row because their selection behaviour is different. DevExtreme DateBox `type="date"` also maps to the day picker; `datetime` and `time` have separate `no part` kinds in React and jQuery. A computed type on a native input or DateBox is `decide`, as is a `dx-datebox` class without a known type; only one static type literal settles precision. A chart is `decide` too: one whose source supplies the numbers becomes the overview recipe's `chart` block of the same kind (bar, line, area, pie or radar); a chart of another kind, a variant the block does not carry (100% stacked, horizontal bars, a donut), one with more than six series or slices, or one without numbers, keeps a labelled placeholder (`references/recipes/overview-page.md`).
The scan keeps that DateBox kind when the answers file disagrees and warns about its actual type. Grid props and feature elements set to `false`, `visible: false`, `enabled: false` or `mode: 'none'` do not add feature rows.

Drag handlers, a context-menu handler and markup from a string (`dangerouslySetInnerHTML`) each give a row of their own beside the element's kind: a draggable Bootstrap card is a `card` row and a `drag-and-drop` row.

**To settle before conversion** lists every `no part`, `unknown` and `decide` row, most pages first, with a first place to open (`file:line`) and an empty Decision column. Write one of the three allowed decisions in it: the stop rule builds it (`references/rules.md`); it is built into the kit first; the page improvises it within the AtomicAUI standard.

**The app's own components** lists the pieces the app made itself, what the scan found inside each, and a **Name says** hint (a component called `StatusBadge` may be a badge). The hint matches whole words of the name only: `DatePicker` and `DropDown` give a hint, `UpdateButton` does not say `date`. The hint never changes a kind, answer, row or summary: open the first place and look. A component exported through a wrapper call is listed, and counted on its pages, as the component it wraps, as in `memo(Orders)`, `withTranslation()(Orders)`, `withStyles(styles)(Orders)`, `compose(...)(Orders)`, `inject('store')(observer(Orders))` or `memo(BOM)` (the wrapped name is the call's first argument that starts with a capital letter, all capitals included, so `withAuth(Orders, ROLES)` and `withFallback(Orders, Spinner)` are `Orders`). So is a component that an index file or another file exports again: `export { default } from`, `export { X } from`, `export * from`, or an import exported again (`export default Orders`, `export { View as Orders }`); the scan follows them one file at a time and stops at a cycle.

An import is the app's own when it is relative, starts with `@/`, `~/`, `src/`, `components/` or `@components/`, or is a bare import that `baseUrl` or `paths` of the app's `tsconfig.json` (or else its `jsconfig.json`) turn into a file or folder of the app, such as `pages/Orders` with `"baseUrl": "src"`. Any other import is a package, also one that `paths` send into `node_modules`.
An icon imported from an icon library (Lucide, Heroicons, Phosphor, Tabler or React Icons) is one `icon` kind by its import source, rather than an unknown component for each glyph.

## Say what the scan could not tell

Write the answers in `conversion/scan-map.json` and run the scan again.

```json
{
  "components": { "StatusBadge": "badge", "ThemeProvider": null },
  "classes": { "status-pill": "badge" },
  "elements": { "app-file-explorer": "file-manager" },
  "kinds": { "spreadsheet": { "answer": "no part" } },
  "ignore": ["src/sheets/"]
}
```

- A value is a kind of `references/scan/kinds.json`, or `null` for "not a control, leave it out".
- A mapped component counts once at each place it is used; what is written inside its definition is left out.
- `kinds` adds a kind the kit does not know, always with the answer `no part` or `decide`. A kind can never become `part` here: only the kit decides that a part exists.
- When an answer disagrees with a control the kit already classifies, the kit keeps its answer and prints a warning.
- `ignore` is a list of folder paths to leave out of the scan.
- A name that matches nothing is printed as a warning, so a typo cannot silently change nothing.

## With an assistant

Running the scan needs no model. Settling the `unknown` rows is the one place where the strongest model available is worth it, because a wrong answer hides a missing part. Give it this:

```
Read conversion/scan.md and references/convert/scan.md.
For each row with the answer "unknown", and each of the app's own components that holds nothing or whose "Name says"
differs from what it holds: open the first place, read the code, and say which kind of references/scan/kinds.json it is,
or null when it is no control. If no kind fits, add one under "kinds" with the answer "no part" and one line on what it does.
Write your answers to conversion/scan-map.json. Do not edit the old app. Do not change an answer to "part".
Then run npm run scan again with the same arguments and show me the rows that changed and the rows still "unknown".
```

## Without an assistant

Open `conversion/scan.md`. Go down **To settle before conversion**; for each row open the first place and read the code. If it is an `unknown` row, add what it is to `scan-map.json`. Run the scan again until no row says `unknown`. Copy the rows into your notes for the conversion.

## What the scan does not see

- A class that comes from data or from another file, an element a script builds, markup the server sends.
- Text or marks the old CSS draws, and what a library draws inside itself beyond what its settings say.
- What a hand-built piece is for. The own components table, the name hint and the answers file are the way.
- Behaviour. "Dialog" in the list means a dialog was written, not that it traps focus.
- A route's page when the route cannot be found in JSX or an object list used by React Router: `scan.md` then says "No router found" and lists no pages. Routes are read from `react-router` and `react-router-dom` alike. JSX routes and providers also work through a React Router namespace import such as `RR.Route`. A route's component in the Pages table is the page it renders, not a component in one of its props, such as the `fallback` of a `Suspense`. Object lists are followed through same-file variables, including variables inside functions and child lists shared by parent routes, when passed to `createBrowserRouter`, `createHashRouter`, `createMemoryRouter` or `useRoutes`; `RouterProvider` supplies the router through its `router` prop. An absolute child path under its parent keeps that path in both JSX and object routes. Child pages count controls in their parent layouts, including pathless layouts. A route list (`<Routes>` or `useRoutes`) in a component that a splat route's own element renders, directly or through other components, lives under that route: `users` below `/admin/*` is `/admin/users`. A route list drawn by a parent layout of the splat route stays where it is. A plain list of objects with `path` fields is not counted as a router. A computed parent path marks its children as computed too; these paths are not included in `scan.views.json`. In `scan.views.json` a route of a hash router (`createHashRouter`, or a route rendered inside `<HashRouter>`) has a `#/` url, such as `#/orders`; every other route has a path url, such as `orders`.
- Counts are places written, evidence and not an estimate of work. A library with no table gives `unknown` rows, never silence.
