# Path 4: update an AtomicAUI app

**For a request to move the kit itself to a new AtomicAUI release in the kit repository, read `MAINTAINING.md` and follow it.** For an app you build, the rest of this page applies.

**This page is only for moving an app to a newer kit release. It is not for adding to or changing a screen (a button, a pane, a tree): that is path 1, the task table in `AGENTS.md`. Do not stop for such a request: build it.**

**For an app: not written in this version. STOP: this is not a task to start.** Do not improvise this path. Do not convert, restyle or rewrite even one screen, link or control, and do not run a command from another page. Do only "What to do now" below. This page is a placeholder so that the entry step can route here. Never run `npm run aui:upgrade` for this: it is the kit maintainers' command and rewrites kit files.

## What to do now
1. Stop. Tell the user: "Path 4: update an AtomicAUI app is not in this kit version."
2. Offer what works today: path 1 (build with components) for any new React screen, and `npm run evidence -- --url <address of the app you started>` to record how a running app looks now.
3. Do not start the work from general knowledge. Ask who maintains the kit for the next version.
4. An app that changes its packages (`package.json`) or `public/fonts` by itself runs `npm run verify:kit` once after the change, beside its `npm run verify`. A plain `npm run verify` leaves out the nine browser test files that test the kit's own checks on this machine and with these packages, and the checks of the kit's own pages (the kit's CI runs them); `npm run verify:kit` runs those and nothing else (ten minutes or more), and ends with `verify:kit: ok` or `verify:kit: FAILED`.
