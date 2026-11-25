# Sample: an old React page to convert

One page of an invented "maintenance desk" app, written the way old pages are: plain elements, a hand-kept stylesheet, classes switched by code. Use it to practise `references/paths/convert.md` before you convert a real page.

| File | What |
|---|---|
| `src/WorkOrders.jsx` | The page: a breadcrumb, a title with two buttons, a search form, a table with a row to pick, a line of text, a confirm before delete |
| `src/api.js` | Its data calls, with invented data. Logic: copy it, never change it |
| `src/legacy.css` | The old look. None of it comes along |
| `reference/src/screens/WorkOrders/WorkOrders.tsx` | The finished conversion to compare with your result; it is not routed in the starter app |
| `reference/src/data/legacy/api.js`, `api.d.ts` | An unchanged copy of the old data calls and its TypeScript declarations, where the guide puts copied logic (`src/data/legacy/`) |
| `reference/src/screens/WorkOrders/WorkOrders.behaviour.test.tsx` | A test to copy beside your converted screen: it must pass unedited. The screen it tests takes its logic from `src/data/legacy/`, not from its own folder. The kit also runs it against the reference; the packed skill leaves test files out |
| `reference/index.html`, `main.tsx`, `vite.config.js` | Only what runs the reference by itself (`npm run sample:reference`); they are not part of the conversion, so do not copy them |

Run the old page: `npm run sample:legacy`, and open the address it prints. Stop it with Ctrl+C.
Run the finished conversion: `npm run sample:reference` (same way). Both commands run on macOS and on Windows (they need only Node). On Windows, answer **Allow** when it asks whether Node.js may use the network (`references/convert/start.md`, "Not tested"). It shows the reference in the starter's top bar and theme, light and dark, with no change to your app: nothing is copied and no route is added.
The `src/` folder of the reference is laid out like an app, so each file has the address it would have in yours. The sample and reference are read-only like every kit file. Your converted page goes in `src/screens/WorkOrders/` and its copied logic in `src/data/legacy/`; the starter has no Work Orders route or sample data.
