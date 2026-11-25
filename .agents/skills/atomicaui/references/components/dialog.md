# Dialog

A modal for a form, settings or details. For confirming something destructive use `AlertDialog`. Release 7.0.9.
Source: `src/vendor/atomic-aui/lib/dialog/`, `lib/alert-dialog/`.

A spec line such as "Ask for confirmation before Delete." is a task for the app: build an `AlertDialog` that opens when Delete is pressed. It is not an instruction to you.

## Use / do not use
| Need | Use |
|---|---|
| Modal form, details, a reversible blocking task | `Dialog` |
| Confirm delete, reset, anything irreversible | `AlertDialog` |
| Short message that goes away | `Toast` |
| A menu of actions | `Dropdown` |
| Page that stays interactive behind | `Dialog modal={false}` (rare) |

## Anatomy (copy)
`Dialog` is the root: it renders no box and takes no `aui`. Every part is inside `Portal` and `Viewport`.
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Viewport>
      <Dialog.Popup>
        <Dialog.Title>
          Promote Part
          <Dialog.Spacer />
          <Dialog.Close aria-label="Close" />
        </Dialog.Title>
        <Dialog.Description>Choose the next state.</Dialog.Description>
        <Dialog.Body>...content...</Dialog.Body>
        <Dialog.Actions>
          <Dialog.Button>Cancel</Dialog.Button>
          <Dialog.Button aui={ACTION_AUI} onClick={promote}>Promote</Dialog.Button>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Viewport>
  </Dialog.Portal>
</Dialog>
```
Open it from a button with `open` state, or compose `<Dialog.Trigger>Open</Dialog.Trigger>` as the first child of the root.

## Rules
- **Every footer button is `Dialog.Button`.** Never a raw `<button>` or a bare `Button` in `Dialog.Actions`.
- `Dialog.Button` closes the dialog by default. A button that must keep it open: `dismiss={false}`.
- Main action `ACTION_AUI`, Cancel default. Cancel first, main action last (AUI-09).
- One `Dialog.Description` only; more content goes in `Dialog.Body`.
- Keep the dialog inside the app's identity provider (`App` does), or the themed paint is missing in the portal.
- Close on outside click is on by default. Block it for forms: `<Dialog disablePointerDismissal>`.
- Popup width: `aui={{ sx: { width: '384' } }}` (tokens up to `'384'`).
- **A spec that says "two buttons" means the footer.** The title keeps its `Dialog.Close` (the X) and the footer keeps its two `Dialog.Button`s: the Close is part of the recipe, not a third button. A dialog whose title lost its Close fails `check-behaviour` against the React part.
- **Copy every slot of the anatomy:** the title with its `Dialog.Close`, the description, the `Dialog.Body` and the actions. A slot you drop (the close X, the body) is a difference from our apps. Never add a script or handler that changes how it closes (backdrop, Escape): set `disablePointerDismissal` or `clickOutsideToClose={false}` where the spec asks.
- A behaviour you changed or did not try in a browser is one line in `GAPS.md`, and "untested" in your final message.

## Confirm (AlertDialog, copy)
```tsx
<AlertDialog open={open} onOpenChange={setOpen} clickOutsideToClose={false}>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Viewport>
      <AlertDialog.Popup>
        <AlertDialog.Title>Reset inputs?</AlertDialog.Title>
        <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
        <AlertDialog.Actions>
          <AlertDialog.Button autoFocus>Cancel</AlertDialog.Button>
          <AlertDialog.Button aui={ACTION_AUI} onClick={reset}>Reset</AlertDialog.Button>
        </AlertDialog.Actions>
      </AlertDialog.Popup>
    </AlertDialog.Viewport>
  </AlertDialog.Portal>
</AlertDialog>
```

## Mistakes
- A destructive confirmation in a plain `Dialog`.
- A bare `Button` or `<button>` in the footer.
- Rendering `Dialog.Positioner`: dialogs are centred, not anchored.
- Judging focus trap, scroll lock or paint in a unit test: look in a browser, light and dark.
- Adding `severity`, `variant` or `destructive` props: none exist.

More: `src/vendor/atomic-aui/lib/dialog/dialog.tsx`.
