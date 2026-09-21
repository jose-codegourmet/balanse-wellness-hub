> Part of the [Component Usage Guide](../../../../../../../docs/component-guide.md).

# AdminQueueCard — Use Cases

## Purpose

Shared chrome for one admin queue item: who / what / when, a `StatusBadge` (`surface="admin"`), a definition-list body, an optional GCash proof media slot, and footer actions. Unread / needs-action emphasis is a variant, not a per-page restyle.

## When to use

- `/payments`, `/cancellations`, and `/reschedules` card renderers (`FE-ADM-023` / `024` / `025`).
- Any future inbox-style admin list that already has a `CustomerStatusKey`.

## When NOT to use

- Tabular admin lists — those stay on `AdminDataTable` (`FE-ADM-017` / `#207`). Tables page; queues virtualize.
- Staff or session status chips that are not `CustomerStatusKey` values.

## Examples

```tsx
<AdminQueueCard
  who={booking.customerName}
  what={`${booking.session.className} · ${when}`}
  when={requestedAt}
  status={booking.status}
  emphasis
  body={<dl>…</dl>}
  media={proof ? <img src={proof} alt="GCash payment proof" /> : null}
  actions={<Button>Confirm payment</Button>}
/>
```

## Gotchas

- Booking statuses are `CustomerStatusKey`. Refund-only rows can pass `REFUND_PENDING` / `REFUNDED` — those keys are on the badge map.
- The BE field is `requestedAt`; the mock booking field is `requestCreatedAt`. Map it in the Wave 2 page, do not rename the mock.
- Do not restyle with a bespoke `rounded-xl border p-4` block — this card is `@balanse/ui` `Card`.
