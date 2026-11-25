# Banner

Use AtomicAUI `Banner` for a persistent result, warning or failure. A short message that goes away is `Toast`. A message that stays is the shared `MessageBanner` wrapper, built from `Banner`, with `level` and `text` props (and `icon` for a source with an icon, below); the form and overview recipes import it. Use it for every such message (AUI-09: same job, same part, same props).

```tsx
import { MessageBanner } from '@/recipes/shared/MessageBanner';

<MessageBanner level="success" text="Saved" />
```

`level` is `success`, `warning` or `error`: `error` takes `role="alert"`, the others `role="status"`. The words must state the result; colour does not carry it alone. With only `Banner.Description`, the library grid keeps its empty icon and title tracks: the text sits 14 px from the start and about 8 px from the top, and the banner is about 30 px tall, not the old styled banner's 26 px (`GAPS.md`).

A banner the user can dismiss is `Banner` itself: add `Banner.Close` and use `onOpenChange`. Give it the look and the name of `MessageBanner`, all of them: `Banner` alone draws at `scale: 'md'` with a shadow (`elevation: 2`) and is named "Announcement".

```tsx
import { Banner } from '@/vendor/atomic-aui';

<Banner role="status" aria-label="Saved" aui={{ color: 'success', paint: 'solid', shape: 'soft', scale: 'sm', elevation: 0 }}>
  <Banner.Description as="div" role="l4">Saved</Banner.Description>
</Banner>
```

Set the tone in `aui.color`: `success`, `warning` or `error`. A softer warning is a warning `Banner` with `paint: 'tonal'` in place of `'solid'` and the rest of that look, `role="status"` and its `aria-label` (two of our apps have it: `warning tonal soft default` in `../aui-style-anything/data/usage-profile.json`). `Banner` is the root (there is no `Banner.Root`). Its look comes from `aui`; it has no `tone`, `width`, `size` or `placement` props.

A message box whose source has an icon takes `icon`, a Font Awesome name: `<MessageBanner level="error" icon="circle-exclamation" text="..." />`. It is the library icon slot (`Banner.Icon`), beside the text.

Without React, copy the `message-banner` block in `references/standard/recipes/view.md` (with an icon: the `message-banner-with-icon` block, its `aui-banner-icon` span whole, only the `fa-` name of its `<i>` changed) and load the kit stylesheet. It is an AtomicAUI part, so do not add a `Styled piece` line to `GAPS.md` or a styled evidence sheet.
