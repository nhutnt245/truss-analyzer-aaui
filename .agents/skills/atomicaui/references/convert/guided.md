# Guided way: with an AI assistant, step by step

For people who have an assistant but are new to it, or unsure. An assistant reads `references/paths/convert.md`; it does not need this page. Pick the assistant you prefer among those allowed on this code: the five steps and the prompts are the same for every one. This page shows Claude Code as the worked example. Another tool: the table at the end says what changes.
Copy only `.js` and `.ts` logic unchanged into `src/data/legacy/`; lint, KIT-02 and screen rules skip it, and typecheck counts its internal errors as ignored. Move `.jsx` and `.tsx` UI into a checked screen under `src/screens/`; errors in app-owned adapters and importing screens still fail.

## 1. Before anything
Is an assistant allowed on this code? The notice at the top of `README.md` says to check which tools are approved. If you do not know, ask. If the answer is no, or you cannot find out, use `references/convert/by-hand.md`: it needs no assistant.

## 2. Install the tool
Sections 2 to 4, and the keys and commands in sections 5 and 7, are Claude Code's. With another assistant, use its own install, sign-in, model settings and undo, and go on at section 5.
Install, from the tool's own page `code.claude.com/docs/en/setup`:

| Your system | Type this in a terminal |
|---|---|
| macOS, Linux | `curl -fsSL https://claude.ai/install.sh \| bash` |
| Windows PowerShell | `irm https://claude.ai/install.ps1 \| iex` |

No Node.js is needed for it. Open a new terminal and type `claude --version`: it prints a version number. If your shell says `claude` is not found, see the troubleshooting page named on the setup page. There is also a desktop app and a VS Code extension; the steps below are the same.

## 3. Sign in
Open a terminal in the new app's folder and type `claude`. A browser opens: sign in. You need a paid plan or a Console account. Inside the tool, `/status` shows your account and the model.

## 4. Model and effort
A **model** is the brain behind the assistant: a bigger one is slower and better at hard problems. **Effort** is how long it thinks before it answers.

| Step | Model | Effort | Why |
|---|---|---|---|
| 1 Assess, the map | The strongest you have: `/model fable`, else `/model opus` | `/effort high` | It reads a lot and writes little. A wrong map row is repeated on every page |
| 2 Load | Any | The default | Two commands |
| 3 Convert a page | `/model sonnet` | The default | Many small edits against a check that names each mistake. The check holds the rules, not the model |
| 4 Prove | The same as step 3 | The default | You look at the pictures too |
| The same problem failed three times | `/model fable` | `/effort high` | For that one problem; then go back |
| You do not want to choose | `/model fable` | `/effort high`, for everything | Slower, and it may reach a usage limit: then `/model opus` |

This advice rests on few runs. If a step goes badly, switch the model up and try once more.

## 5. How a session goes
The assistant reads the kit's instructions by itself. It asks before each edit and each command.

| Say yes to | Say no to |
|---|---|
| Reading any file | Edits under `kit/`, `scripts/`, `src/vendor/`, `src/recipes/`, `src/packs/` |
| `npm run ...` and `node scripts/...`; `git add` and `git commit` after step 2 (the set-up) and after step 5 (a proved page) | Any edit in the old app's folder |
| Edits under `src/screens/`, `src/app/`, `src/data/`, `conversion/`, and `CONVERSION.md`, `GAPS.md`, `CHECKLIST.md`, `evidence.views.json` | `git push`; installing a package you did not expect |

Old-page pictures and measurements in `conversion/before/` and sibling `conversion/before-<page>/` folders stay local when the set-up is committed. Only the app's owner may opt in to committing captures made with test or sample data, using `git add -f` with each folder's exact name.

- **Stop a running action:** press Esc. It keeps the work done so far.
- **Plan mode** (Shift+Tab until it says so): it reads and proposes and edits nothing. Good for step 1.
- **Undo:** `/rewind`, or press Esc twice with an empty prompt. It restores the files it edited, not what a shell command changed. Or with git: `git restore .` puts back changed files, and the page's new files are removed as `references/convert/recover.md` says ("Undo with git").

## 6. The loop, for each step
1. Paste the step's prompt from `references/convert/prompts.md`.
2. Compare the answer with "a good answer looks like".
3. Do the "check yourself" line.
4. Good: go on. Not good: open `references/convert/recover.md`.

To read what a check printed: `references/convert/checks.md`.

## 7. Between pages
Finish the page; it is committed when `git status` is empty, else commit it yourself. Type `/clear` to start fresh. Paste the "pick up" prompt from `references/convert/prompts.md`, then the step 3 prompt with the next page: steps 1 and 2 are done once per app. To continue a closed session instead: `claude --continue`.

## 8. Safety
- Never let the assistant stop a process it did not start, or attach to a browser that is already running. The kit's own rules say so (`AGENTS.md`, "Safety and honesty").
- Do not use the tool's feedback or share commands on this code.
- Team, Enterprise and API accounts are not used for training by default; personal plans follow your privacy setting (`code.claude.com/docs/en/data-usage`).

## Other tools
| Tool | What changes |
|---|---|
| Codex | It reads `AGENTS.md` and the installed skills by itself, and ran the kit's commands as written. The prompts are the same. Sign-in, model and effort are that tool's own |
| Any other | Open the repository in it and tell it to read `AGENTS.md` first. Paste the same prompts |
