> Part of the [Component Usage Guide](../../../../../../docs/component-guide.md).

# AdminQueueList — Use Cases

## Purpose

Generic, data-source-agnostic virtualized queue. Pages supply `items` + `renderItem` (usually `AdminQueueCard`). Cursor pages come from `useInfiniteQuery` in `apps/admin/src/lib/query/queries.ts`.

## When to use

- Admin notification-style queues: payments, cancellations, reschedules.
- Any long, variable-height card list that pages with `CursorPage` (`items`, `nextCursor`, `totalCount`).

## When NOT to use

- Admin tables. `AdminDataTable` stays **paginated** (`FE-ADM-017` / `#207`). Do not virtualize table rows here and do not turn a queue into a table.
- Short static lists that never page.

## Examples

```tsx
<AdminQueueList
  label="Cancellation requests"
  items={rows}
  totalCount={totalCount}
  getItemKey={(row) => row.id}
  renderItem={(row) => <AdminQueueCard … />}
  hasNextPage={Boolean(query.hasNextPage)}
  isFetchingNextPage={query.isFetchingNextPage}
  fetchNextPage={() => query.fetchNextPage()}
  loading={query.isPending}
  nextPageError={query.isFetchNextPageError ? <Retry /> : null}
/>
```

## Gotchas

- Below `virtualizeThreshold` (default 30) the virtualizer is bypassed so `Cmd+F` and normal document flow still work.
- Virtualization **removes off-screen items from the DOM**. Tab cannot reach them. The scroll region is focusable so keyboard users can scroll the windowed list; on-screen actions stay in visual Tab order.
- First-page errors use the `error` slot. A **second-page** failure must use `nextPageError` so already-loaded cards stay mounted. `CardListSkeleton` is the `loading` slot so the route-level skeleton (`FE-ADM-018`) does not swap chrome.
- `totalCount` is the exact filtered count from `CursorPage` and drives `aria-setsize`.
- Sort ids and cursor payloads must match `packages/api/src/cursor.ts`. The mock maps BE `requestedAt` → `requestCreatedAt`.
- `prefers-reduced-motion` lowers overscan; the list never scroll-jacks. Scroll position is restored from `sessionStorage` when the same labelled region remounts (browser back).
