# Target: inside the Aras client (bare mode)

The same build, shown in a frame from an Aras page. Aras already provides the shell, so bare mode renders **only the routed screen**.

## Address (query string)
| Part | Meaning |
|---|---|
| `mode=bare` | Switch off the shell |
| `type=Part` | Item type (default `Part`) |
| `id=P-1001` | Item id. With an id: item page. Without: search page. |
| `screen=search` or `screen=item` | Optional override |
| `theme=light` or `theme=dark` | Optional: start in that theme (works in shell mode too) |

Example: `index.html?mode=bare&type=Part&id=P-1001`.
Inside the frame, opening an item from search changes the same query string. The Aras frame control can pass the current item's id and item type in the address; map them to `id` and `type`.

## Show the app in a frame: the one edit is the host's address
First check `src/app/packs.json`. If it exists, the Aras pack is on: edit only the frame address in `public/host.html` (or the real Aras host page). If it does not exist, the pack is off and bare mode still shows the top bar and Home: run `npm run pack:use -- aras` once, say that it wrote `src/app`, then edit the frame address.
**Run no `screen:copy`, change nothing in `src/app` by hand, and copy no page.** List the frame's own address in `evidence.views.json`, for example `{ "name": "part-bare", "url": "?mode=bare&type=Part&id=<id>" }` (replace `<id>` with the item's id). Never list `/host.html` there: the layout check measures the host's fixed frame at 390 px, rather than the app in bare mode, and fails AUI-10. To picture the host page itself, put `{ "name": "host", "url": "/host.html" }` in a separate views file and run `npm run evidence -- --views <file> --out evidence/host`.
The frame is drawn by the host page: in Aras, the page that holds the frame; without Aras, the app's own `public/host.html` (yours), which `npm run pack:use -- aras` copies from the kit's stand-in when it is missing (`npm run screen:copy -- item` or `-- search` does it too when it turns the pack on). To show an item page without our top bar and navigation, change only the address of that frame to `<app address>/?mode=bare&type=Part&id=<id>` (in `public/host.html` the app address is `./`). Never edit the stand-in, `references/samples/aras-standin/host.html`: it is a kit file (AUI-13). No hand edit in `src/app`, no CSS that hides the shell, no second copy of the page: the shell is already switched off by `mode=bare`. Check it by opening the host page (`/host.html` while `npm run dev` runs), not the app's own address, and look at the frame at its own size (no sideways scroll). Say what stays unknown without a real Aras instance (the session, the real frame control). When the frame cannot be shown here (no browser, no host page), add one `GAPS.md` line saying so and claim no look.

## What the starter does and does not do
- Does: read type and id from the address, render the screen, same theme and rules.
- Does not: sign in to Aras, read the Aras session, call Aras. Data is the fixtures adapter until a REST adapter replaces it ([data adapter](../../targets/data-adapter.md)).
- Unknown until tried against a real instance: whether the frame can reuse the client's session. Do not guess (AUI-08): ask.

## Try it without Aras
Open `http://127.0.0.1:<port>/?mode=bare&type=Document&id=D-2002` while `npm run dev` runs, in an app with the pack on ([start](start.md)). Before `pack:use`, the kit's demo shows it at the same address followed by `#/pack/aras`.
