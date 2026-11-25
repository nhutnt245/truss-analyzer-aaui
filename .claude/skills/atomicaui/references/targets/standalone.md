# Target: standalone

The default. The app runs on its own and shows the top bar ([app frame](../recipes/app-frame.md)) with your screen under it.

## Run
```
npm install
npm run dev        # the app at the printed address
```

## Addresses (hash routes)
| Address | Screen |
|---|---|
| `#/home` | The first screen (`src/screens/Home/Home.tsx`): the first screen of a new app replaces it (`AGENTS.md`, "Yours, and the kit's"); every later screen, and a converted page, takes its own address |
| `#/gallery` | The recipe gallery |
| `#/layout/two` | An arrangement of panes (`one`, `two`, `side-pair`, `three`, `above`) |
| `#/pack/aras/search/Part` | The kit's demo of the Aras pack ([start](../packs/aras/start.md)) |

The address is parsed in one place: `src/app/route.ts`; the screen for a route is chosen in `src/app/Screen.tsx`. Add yours there (with the Aras pack on, also its page tab: [start](../packs/aras/start.md)).

## Build and host
`npm run build` writes `dist/`. The build uses relative paths, so any static host or sub-path works.

## Icons
No setup: the starter loads the AtomicAUI Global Kit (`c852ddbb54`); `VITE_ICON_KIT_ID` overrides it. Icons load only on domains the kit owner has allowed; elsewhere they stay blank and the app shows a banner. In an app that is not the starter, `node scripts/icon-kit.mjs <app folder>` adds the kit to every page that lacks it.
