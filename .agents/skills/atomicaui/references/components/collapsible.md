# Collapsible

One block of content that folds open and shut from one control: a details line under a card title, "Show more", a long note. Two or more sibling sections that fold are not several `Collapsible`s: they are an `Accordion` (`Sections` from `@/recipes/layout`). Release 7.0.9.
Source: `src/vendor/atomic-aui/lib/collapsible/`. Tested anatomy: `src/recipes/shared/collapsible.test.tsx`.

## Use / do not use
| Need | Use |
|---|---|
| One block that folds open and shut | `Collapsible` (never `useState(false)` and a `Button` with `aria-expanded`: that is a part with its own keyboard and a11y pattern, AUI-01) |
| Several sections under each other, each folding | `Sections` from `@/recipes/layout` (`Accordion` underneath) |
| A side pane that collapses to a rail | `Pane` with `collapsible` (`@/recipes/layout`) |
| A short list of lines | `List`, shown open: it needs no fold |

## Anatomy (copy)
```tsx
<Collapsible defaultOpen={false} aui={{ paint: 'text' }}>
  <Collapsible.Header>
    <Collapsible.Trigger>
      Show the details
      <Collapsible.Chevron />
    </Collapsible.Trigger>
  </Collapsible.Header>
  <Collapsible.Panel>
    <Type as="p" aui={TEXT_AUI}>Dimensions are in millimetres.</Type>
  </Collapsible.Panel>
</Collapsible>
```
The trigger is the one button; its text is the name a screen reader says (`aria-expanded` and `aria-controls` come from the part). The panel is not in the page while it is shut.

## Rules
- **The root is a filled section card by default.** Inside a card, a pane body or a table cell write `aui={{ paint: 'text' }}` on the root, as above, so the fold does not draw a card inside a card. A fold that is the card itself (a section on the pane colour) is a `SectionCard` of the overview recipe or a `Sections` item, not a `Collapsible`.
- Closed at the start unless the spec says open: `defaultOpen`. To keep the state in your component use `open` and `onOpenChange`; there is nothing to toggle by hand.
- The trigger is a words-and-chevron row. Never a second button that also toggles it.
- `Collapsible.Chevron` is composed, never drawn: write it and the part rotates it.
- One block per `Collapsible`. Two blocks that fold are two of them, each with its own trigger text.
- Any text in the panel is `Type` with `aui={TEXT_AUI}` (AUI-05), as every other block text.

## Mistakes
- A `Button` with `aria-expanded` and a `useState`: it has no `aria-controls`, no keyboard help and no motion. Use the part.
- A `Collapsible` inside a `SectionCard` that draws its own filled card: add `aui={{ paint: 'text' }}`.
- A fold for a short list that fits: show it.
- Judging the open motion in a unit test: look at it in a browser, light and dark.
