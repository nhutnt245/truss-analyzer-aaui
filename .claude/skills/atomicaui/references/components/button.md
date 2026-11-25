# Button and IconButton

`Button` is an action with a text label. `IconButton` is an action with only an icon. Release 7.0.9.
Source: `src/vendor/atomic-aui/lib/button/`, `lib/icon-button/`.

## Choose
| Need | Use |
|---|---|
| Labelled action (Save, Search, Cancel) | `Button` |
| Icon-only action (gear, close, previous page) | `IconButton` with `aria-label` |
| Button inside a dialog footer | `Dialog.Button` (see [dialog](dialog.md)) |
| Button inside the top bar | `Menubar.Button`, `Menubar.IconButton` |
| Closable tab, add tab | `Tabs.CloseButton`, `Tabs.AddButton` |
| Link that looks like a button | `Button` with Base UI `render` |
| On/off state | `Switch` / `Checkbox` / `Toggle` group, not Button |

## Look
Default is `surface-alt`, `solid`, `sm`, `default` profile, `soft` shape. Button has **no** `aui.states`; hover, press and focus are automatic.

| Role | `aui` |
|---|---|
| Main action of a toolbar or dialog: exactly one | `ACTION_AUI` = `{ color: 'secondary', paint: 'solid' }` |
| Ordinary / cancel | none |
| Quiet, in a list or menu | `{ paint: 'text' }` |
| Destructive, outside a button row (a toolbar or a list the spec marks) | `{ color: 'error', paint: 'tonal' }` |

**Order in a button row: Cancel and the other actions first, the main action (Save, Submit, Done, ...) last, on the right. In page forms (`ActionRow`) and in dialogs (`Dialog.Actions`) alike, new screen or converted.** `npm run check` fails a row whose main action is not last, and in any row a Cancel, Discard, Close or Back after the main action (AUI-09). A toolbar's main action (Search, Edit) is not a button row of this kind.
**In an `ActionRow` or `Dialog.Actions` only the main action takes a look (`ACTION_AUI`); every other button is a plain `Button` with no `aui`, Cancel, Discard and Delete alike.** A destructive action in a row is plain: no error colour, no tonal paint, unless the spec names a tone. When the destructive action is the one that completes the dialog (a "Delete" confirmation), it is the main action and takes `ACTION_AUI`, never `error`.
Team default: the main action is `secondary` solid, never `primary`; every other button keeps the default look. `primary` is for a selected state.
Which button is the main one is the kit's choice, not the screenshot's: the action that completes the job (Search, Edit, Done, Save in a dialog). A screenshot that shows all buttons alike does not make the main action plain.
Axes: `color` `primary secondary info success warning error surface surface-alt raised overlay`; `paint` `solid tonal text fixed`; `scale` `xs sm md lg xl`; `shape` `none soft smooth pill`.

## Examples (copy)
```tsx
import { ACTION_AUI } from '@/recipes/shared/aui';

<Button onClick={cancel}>Cancel</Button>
<Button aui={ACTION_AUI} onClick={save}>Save</Button>

// With an icon: compose Button.Icon as a child
<Button aui={ACTION_AUI}><Button.Icon name="floppy-disk" aria-hidden />Save</Button>

// Disabled is the native prop
<Button disabled>Promote</Button>

// Icon only: the name is required
<IconButton name="gear" aria-label="Settings" />

// Icon-only toggle (pressed look): IconButton has no states, so use View interactive with aui.states (AUI-04)
<View interactive selected={pinned} aria-label="Pin panel" onClick={togglePinned}
  aui={{ color: 'secondary', paint: 'text', scale: 'sm', profile: 'contained', shape: 'soft', states: { selected: { color: 'primary' } } }}>
  <Icon name="thumbtack" aria-hidden />
</View>
```
Icon names are Font Awesome names without the `fa-` prefix. One icon per action across the app (AUI-11). Icons render only when `VITE_ICON_KIT_ID` is set.

## Mistakes
- Save before Cancel: the main action goes last, on the right (AUI-09).
- A raw `<button>` with CSS (AUI-01).
- `<IconButton>` without `aria-label` (AUI-11; `npm run check` fails it).
- Passing a visible label as `IconButton` children.
- An icon button or clickable icon that is not square (AUI-11): keep the `square` profile, or `'square-compact'` in a compact row. Never `'default'`/`'compact'` (they are the text-button profiles), never raw px.
- `aui={{ states: ... }}` on Button: it has none; use `Button` props or a `View interactive`.
- `aui={{ paint: pinned ? 'tonal' : 'text' }}` for a toggle (AUI-04): use `View interactive selected` with `aui.states.selected`.
- Primary on every button, or two `ACTION_AUI` buttons in one bar. One main action per bar.
- A Delete, Remove or Discard that is not the main action given an error colour in an `ActionRow`: it stays a plain `Button`.
- A button row placed straight under a form with no gap: use `ActionRow` inside the form's `STACK_AUI` ([spacing](../spacing.md)).
- A different order or look for the same actions on another screen (AUI-09).

More: `src/vendor/atomic-aui/lib/button/button.tsx`.
