# Pagination

Numbered pages with previous, next and ellipses. Release 7.0.9. Source: `src/vendor/atomic-aui/lib/pagination/`. A table that shows a row range and page-size selector keeps `PagingBar` from `@/recipes/shared/PagingBar` (previous, range, next, results per page); use `Pagination` when the screen needs numbered pages.

## Use / do not use
| Need | Use |
|---|---|
| Numbered pages of records | `Pagination` |
| Table pages with row range and page size | `PagingBar` ([data table recipe](../recipes/data-table.md)) |
| Slides or cards in a rail | `Carousel` |

## Controlled pages
```tsx
<Pagination
  page={page}
  totalPages={totalPages}
  onPageChange={setPage}
  aria-label="Orders pages"
/>
```
`page` is 1-based. The app owns the page state and data query; `totalPages` is the number of pages, not rows. The part clamps the displayed page, but the app should keep its own state valid when filtering changes the total. For URL navigation, provide `getPageHref={(page) => `/orders?page=${page}`}` so the controls are links, and set `linkAui={{ sx: { textDecoration: 'none' } }}` on `Pagination` so its page and step links have no underline. Use `labels` to give previous, next, page and ellipsis names in the app's language.

## Composition
The generated form above creates `Pagination.List` and its items. When you supply custom children, write the list explicitly:
```tsx
<Pagination page={page} totalPages={totalPages} onPageChange={setPage}>
  <Pagination.List>
    <Pagination.Item><Pagination.Previous /></Pagination.Item>
    <Pagination.Item><Pagination.Link page={1} active={page === 1} /></Pagination.Item>
    <Pagination.Item><Pagination.Ellipsis /></Pagination.Item>
    <Pagination.Item><Pagination.Next /></Pagination.Item>
  </Pagination.List>
</Pagination>
```
Composed children render as supplied; `totalPages` does not generate missing links for them. Use the generated form unless the source screen actually needs different anatomy.

## Check
- The current page has `aria-current="page"` and is announced as the current page.
- Previous is disabled at page 1 and Next at the final page; keyboard activation cannot cross a boundary.
- An ellipsis explains omitted pages to a screen reader but is not in the Tab order.
- A URL-backed page is a link to the right address, with no underline. A state-backed page calls `onPageChange` with a 1-based number.

More: `src/vendor/atomic-aui/lib/pagination/pagination.tsx`.
