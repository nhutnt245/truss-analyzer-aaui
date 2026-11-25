# Samples: select, dialog and tabs without React, on three stacks

Three small projects that show the same three parts, each wired the way that stack needs. Read the one for your stack; copy its part templates.
Every class list in them comes out of the class recipes: the part templates are generated (`npm run samples:build`), never typed.
Each sample passes the same three checks you run on your own app: files, look, behaviour (90 steps, each the same as the React part).
`legacy/react/` is another kind of sample: an old React page to practise a conversion on. Its own `README.md` says how. `legacy/html/` and `legacy/razor/` are old pages to practise a restyle on (`../aui-style-anything/references/restyle.md`); each has its own `README.md`, the expected map and a restyled reference.

| Sample | What it is | Its part templates |
|---|---|---|
| `razor/` | ASP.NET Core Razor Pages, .NET 10. The server draws the page; the select posts its value in a form | `Pages/Shared/_AuiSelect.cshtml`, `_AuiDialog.cshtml`, `_AuiTabs.cshtml` |
| `blazor/` | Blazor, interactive server, .NET 10. Components hold the value; a server event carries each change | `Components/Aui/AuiSelect.razor`, `AuiDialog.razor`, `AuiTabs.razor` |
| `aras-standin/` | A stand-in for an Aras client, with no Aras data and no sign-in: a page of ours in a frame, and our markup inside a host's own form | `framed.html`, `form.html` |

## Run one
1. Copy the folder the pages load. Razor: the sample ships without its `wwwroot` folder and the copy command stops when the folder is missing, so create it first if it is not there, `mkdir references/samples/razor/wwwroot`, then `node scripts/standard-copy.mjs references/samples/razor/wwwroot`. Blazor has its folder: `node scripts/standard-copy.mjs references/samples/blazor/wwwroot`. Do it before you build: Blazor lists the files it serves when it builds. Do it again after a kit update: the files check reports a copy that is older than the kit.
2. `dotnet run --project references/samples/razor` (or `blazor`), and open the address it prints. `Properties/launchSettings.json` makes this a development run on a port the system picks; without it Blazor cannot serve its own script.
3. The stand-in is plain files, but do not copy `aui/` into it here: the copy command also adds the icon script to every page it finds, and these pages are the kit's. Copy the `aras-standin` folder somewhere of your own first, run `node scripts/standard-copy.mjs <that folder>`, and serve it.

Windows: you need the .NET 10 SDK (`dotnet --version` prints 10.x). `winget install Microsoft.DotNet.SDK.10` waits for an administrator to approve it; without one, install the SDK for your user only: download `https://dot.net/v1/dotnet-install.ps1`, run `.\dotnet-install.ps1 -Channel 10.0 -InstallDir <a folder of yours>`, then put that folder first in `PATH` and set `DOTNET_ROOT` to it. Run on Windows 11 on ARM64 (Windows PowerShell 5.1, .NET SDK 10.0.404 installed this way): steps 1 and 2 and the three checks passed for Razor and Blazor.

Maintainers: `npm run samples:check` does all of this for the three, on ports the system picks, and stops what it started.

## What is the same on every stack
- One script, `aui/aui-behaviour.js`, loaded once. It needs no start-up call: it listens on the document and reads the state from the markup, so it works for markup the server or a component draws later.
- Keys and focus stay in the browser. Your code hears only the result, through events that bubble: `aui-change`, `aui-open`, `aui-close`.
- A state is a whole class list. Your template chooses between the whole lists the recipe shows; it never builds one from pieces.

## Use the shipped part, never the recipe markup
- **A part goes in a box of its own.** `Pages/Index.cshtml` and `Components/Pages/Home.razor` write each part inside one `div` (the `view-stack` look, `aui-width-256`). A select, a dialog opener or a tab set in a row of fields or buttons (a filter row, a form row) is wrapped the same way; never put the partial's field straight into the row.
- **Blazor tabs are `<AuiTabs>`.** `<AuiTabs Id="tabs-1" Tabs="Tabs" @bind-Selected="tab"><Panel Context="index">…</Panel></AuiTabs>`: the content of each panel is the `Panel` template. Never copy the `role="tablist"` markup of the class recipe into a page: it loses the component's state, and `check-behaviour` fails it. The same for `<AuiDialog>` (`OnAction` tells which footer button; each footer button also carries `data-aui-action`, as in Razor) and `<AuiSelect>`.
- **Razor dialogs are `_AuiDialog`.** Its footer buttons are `type="button"`: they never submit and never reload the page. Each carries `data-aui-action="<its text>"`, so one page script can hear the click: `document.addEventListener('click', (event) => { const action = event.target.closest('[data-aui-action]'); … })`, then `fetch` the delete, or set a hidden input and call `form.requestSubmit()`. A confirmation (Delete, Reset) is the same partial with an empty `Fields` list: title, description and actions, no body. Never write a dialog by hand beside the partial: without its title Close, `check-behaviour` fails it.

## The one rule that differs: who draws the page again
| The stack | Write each item (option, tab, panel) as | Why |
|---|---|---|
| draws once on the server (Razor Pages, MVC, plain HTML) | one element per state, chosen with `if` and `else` | Nothing draws the markup again in the browser. The class lists stay plain text, so the file check reads them whole |
| draws again in the browser (Blazor) | **one element per item**, its class list and state attributes chosen by an expression: `class="@(picked ? "..." : "...")"` | The script moves the picked state at once; the component then draws again. With `if` and `else` the framework reuses elements between items, and two options end up picked |

This was measured, not assumed. With `if` and `else` in the Blazor components, one pick left two options marked as picked, and two tabs marked as picked with focus on the wrong one; adding `@key` took the picked option out of the list. With one element per item every element stays the same element and exactly one is picked.

## Blazor: no prerender for a component that holds a part
**Rule: a Blazor component that holds an AtomicAUI part renders without prerender.** Write `@rendermode @(new InteractiveServerRenderMode(prerender: false))` on it, as `Components/Pages/Home.razor` does. The WebAssembly and Auto render modes take the same `prerender: false`; only interactive server was run here. Why, measured on this sample:

| | Parts in the page at load | Later |
|---|---|---|
| prerender on | there at once | every element is swapped for a new one about 0.2 s after load: a key pressed or an option picked before that is lost |
| prerender off | not yet | they appear about 0.1 s after load and are never swapped |

Both pass the three checks: the check starts after the swap and cannot see it. The times are for one machine with no network between browser and server; a real connection makes both longer. The price of no prerender is that the server sends no markup for that component.
The component's value changes only after the browser has told the server (`wwwroot/AuiBlazor.lib.module.js` hands `aui-change` to Blazor; a component writes `@onauichange`).

## The Aras stand-in: two settings
| Setting | File | What was checked |
|---|---|---|
| Our page in a frame | `host.html` shows `framed.html` in a frame of 720 x 420 | `framed.html` at the frame's own size: files, look, behaviour. A list or a dialog cannot leave the frame |
| Our markup inside the host's document | `form.html`: a host form with its own old stylesheet, a 12 px root, element rules and `!important`; our area is one `div` | Behaviour: the same 90 steps. Look of our area: the same as the untouched stylesheet |

In the host's document:
- Only the element around our markup carries the four identity attributes. The host's `<html>` is left alone.
- `form-onload.js` stands for a client method run when the form loads. It adds three things to the host's document: `aui/aui-px.css`, `aui/aui-behaviour.js` and the icon kit (the AtomicAUI Global Kit script, loaded from `kit.fontawesome.com`). It does not add `aui-setup.css` or `aui-theme.js`.
- `aui-px.css` is the stylesheet in pixels. With the ordinary stylesheet under the host's 12 px root, every size came out at three quarters; the look check reported it.
- A host rule with `!important` that reaches our controls changes them, and the look check reports it. A host element rule without `!important` (`button { color: ... }`) did not change them.
- While our dialog is open, the script makes the rest of the document inert, the host's own fields and buttons included.

## What these samples do not show
- A real Aras client: its stylesheet, its layers, its own dialogs, its form events. Nothing here was run inside one.
- Blazor WebAssembly, Blazor over a slow connection, MVC views, tag helpers.
- Any browser but Chrome. A real screen reader.
- More than the three parts, and inside them: tabs with close buttons, a disabled tab, a dialog with anything but text fields and footer buttons.
