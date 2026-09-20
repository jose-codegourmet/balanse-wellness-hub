# Admin React Query layer (FE-ADM-015)

Wave 2 pages should be thin. Data goes through this directory only.

## Recipe

1. **Prefetch in the route.** `page.tsx` is a server component. Read the mock principal the same way `app/layout.tsx` does (`cookies()` + `parseMockPrincipal`), then:

   ```tsx
   return prefetchAdmin([adminDashboardQuery(principal.role)], <DashboardPage />);
   ```

   Keep the existing `Metadata` export. `prefetchAdmin(options, children)` is the stable signature for FE-ADM-018 (#208).

2. **Read in the module** with `useQuery` / `useSuspenseQuery` and the matching `*Query` factory from `queries.ts`. Pass `principal.role` from `useMockPrincipal()`.

3. **Write through `mutations.ts`.** Each hook invalidates the keys in the table below. Do not hand-roll a `refresh()` that re-fetches the page.

4. **Never call `getMockAdapter()` from a component** once that screen’s Wave 2 ticket lands. This directory is the only place in `apps/admin` that may call it. (`ClassFormPage` and other unmigrated modules still do until their tickets.)

## Query keys

All keys are built by `adminKeys` in `keys.ts`. No string literals at call sites.

Every key is rooted at `["admin", role]` so switching `admin → customer/guest` in the harness cannot serve another role’s cache (coach rates in particular). There is no staff id on `MockPrincipal`; partition by `role` only.

Hierarchical prefixes work with `invalidateQueries`:

```ts
queryClient.invalidateQueries({ queryKey: adminKeys.bookings.all(role) });
```

`adminKeys.queues` is reserved for FE-ADM-020 (#210) infinite queue keys. Reserved query factory names (do not take them): `adminPaymentsQueueInfiniteQuery`, `adminCancellationsInfiniteQuery`, `adminReschedulesInfiniteQuery`.

## Invalidation map

| Mutation | Invalidates |
| --- | --- |
| `confirmAdminBooking`, `rejectAdminBooking` | `bookings.all`, `payments.all`, `dashboard` |
| `recordCash`, `markRefundPending`, `markRefunded` | `payments.all`, `bookings.all`, `dashboard` |
| `completeAdminCancellation`, `rejectAdminCancellation` | `cancellations.all`, `bookings.all`, `dashboard` |
| `approveAdminReschedule`, `rejectAdminReschedule` | `reschedules.all`, `bookings.all`, `sessions.all`, `dashboard` |
| `checkIn`, `markNoShow` | `bookings.all`, `roster` (prefix), `dashboard`, `reports.all` |
| `upsertAdminClass` | `classes.all` |
| `upsertAdminCoach` | `coaches.all` |
| `upsertAdminSession`, `cancelAdminSession` | `sessions.all`, `dashboard`, `reports.all` |
| `upsertAdminStaff`, `disableAdminStaff` | `staff.all` |
| `updateAdminSettings`, `promotePolicyVersion` | `settings.all` |

`approveAdminReschedule` decrements `remainingSlots` on the target session, which is why it invalidates `sessions.all`.

## QueryClient defaults

`makeQueryClient()` (`client.ts`) is shared by `Providers` and `prefetchAdmin`:

- `staleTime: 30_000` — the mock is in-memory; a non-zero value is what proves caching.
- `gcTime: 300_000`
- `retry: 0` — `failNext` is one-shot; retry would swallow the harness failure.
- `refetchOnWindowFocus: false`

`Providers` accepts an optional `queryClient` so a story can inject a seeded client. Storybook already wraps stories in `Providers` (#211 owns `.storybook/**`).

## Cache + mock principal

`MockSessionHarness` calls `queryClient.clear()` on every principal change and every `setMockRuntime(...)`. Clear, do not invalidate — another role’s data must not stay reachable even briefly.

`AdminSidebar` still calls `getAdminDashboard()` directly. FE-ADM-016 (#205) should adopt `adminDashboardQuery` so `/dashboard` and the sidebar share one key.

## Server vs browser adapter instances

`getMockAdapter()` is a module singleton. The server’s instance and the browser’s instance are **different objects**. Server prefetch always dehydrates pristine fixtures; client mutations only mutate the browser copy.

React Query `hydrate` will not clobber a client entry whose `dataUpdatedAt` is newer, so a mutation on `/payments` followed by a return to `/dashboard` should keep the mutated counts.

Runtime knobs (`latencyMs`, `failNext`, `emptyAdminQueues`, …) live in the **browser** module. After changing a knob the harness clears the cache and refetches **client** queries so those knobs are visible. A server prefetch after a full navigation can still dehydrate pristine data if the server module never saw the knob.

## Deferred

Optimistic updates are out of scope. `checkIn` and `markNoShow` are the two writes where optimistic UI would help (roster check-in is a rapid repeated action). Invalidate-on-success is enough for the mock.
