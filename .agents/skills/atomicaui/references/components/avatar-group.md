# AvatarGroup

Overlapping avatars for a named group of people. Release 7.0.9. Source: `src/vendor/atomic-aui/lib/avatar-group/` and `src/vendor/atomic-aui/lib/avatar/`.

## Use / do not use
| Need | Use |
|---|---|
| Several people shown together, with a count for the rest | `AvatarGroup` |
| One person's picture or initials | `Avatar` |
| A selectable list of people | The source screen's list or table; `AvatarGroup` is display only |

## Anatomy
```tsx
<AvatarGroup aria-label="Reviewers" max={3} total={8}>
  <AvatarGroup.Item role="img" aria-label="Amelie Pierce"><Avatar.Fallback>AP</Avatar.Fallback></AvatarGroup.Item>
  <AvatarGroup.Item role="img" aria-label="Bao Nguyen"><Avatar.Fallback>BN</Avatar.Fallback></AvatarGroup.Item>
  <AvatarGroup.Item role="img" aria-label="Cora Lee"><Avatar.Fallback>CL</Avatar.Fallback></AvatarGroup.Item>
</AvatarGroup>
```
`max={3}` shows two avatars and a `+6` overflow avatar here: the overflow occupies one of the three slots. `total` is the number of people the app knows about, including people whose avatars were not supplied as children. Omit it when every person is rendered. The part supplies the count's accessible name; give the group and each person a meaningful name. The order and overlap work in RTL without reversing the children yourself.

## Rules
- Use `AvatarGroup.Item` for each person. `Avatar.Image` and `Avatar.Fallback` are the same parts used by a single `Avatar`.
- Name each person with `role="img"` and `aria-label` on the item, as the count does: the item is a plain `<span>`, and a screen reader does not read an `aria-label` on a span with no role.
- `max` is the total visible slot count, at least one. If there is overflow, the group reserves the last slot for `AvatarGroup.Count`; it creates that count itself unless you provide one for custom content.
- An `AvatarGroup` is a picture of membership, not a control. Keep selection, removal and navigation in the source screen's actual controls.
- Check the names and count in light, dark and RTL views. A missing person name is not repaired by initials alone.
- Limit at 7.0.9: at the default scale the library's overlap cuts the initials and the `+N` count of every avatar after the first ("BN" reads as "3N"); the names and the count are still right for a screen reader. Keep the example as it is and add no style against the overlap: it is the library's to change (`GAPS.md`).

More: `src/vendor/atomic-aui/lib/avatar-group/avatar-group.tsx`.
