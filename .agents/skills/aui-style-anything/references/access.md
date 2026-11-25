# Access checklist for a styled piece

Ten lines, the same for every stack. Answer each with yes or no on the evidence sheet. All yes, or the piece is not done.
On a page you restyle, an old element keeps the roles, clicks and keys it already had, a tree its `tree` and `treeitem` (`references/restyle.md`): for it, lines 2, 9 and 10 ask only that you add none and remove none.

1. The root has a role and a name where it is a group: `role="group"` with `aria-label`. A message is `role="alert"` when it reports a failure and `role="status"` otherwise. An empty state is `role="status"`.
2. Everything clickable is an AtomicAUI button part, a `View interactive`, or a native `button` or `a`.
3. Every clickable thing has visible text or an `aria-label`.
4. No control sits inside another control.
5. Picked is told to screen readers: `aria-pressed` (`View interactive selected` writes it; other stacks write it with the class list).
6. A status is never shown by colour alone: the text says it.
7. Decorative icons are `aria-hidden`.
8. A placeholder for a drawing is `role="img"` with an `aria-label` that says what the drawing will show. A loading box has `aria-busy` and a named `Spinner`.
9. No role that needs arrow keys: `tree`, `treeitem`, `listbox`, `option`, `menu`, `menuitem`, `tablist`, `tab`, `grid`, `combobox`, `slider`, `dialog`. Those are AtomicAUI parts.
10. With the keyboard only: Tab reaches every clickable thing, the ring shows, Enter and Space act. A mouse click shows no ring. Not tried: say so.

Not covered by any script in this version: lines 3, 4, 6, 7, 9 and 10. You answer them by reading the piece and by trying it.
