# Admin React Query layer (FE-ADM-015)

Wave 2 pages should be thin. Data goes through this directory only.

## Recipe

1. **Prefetch in the route.** `page.tsx` is a server component. Read the mock principal the same way `app/layout.tsx` does (`cookies()` + `parseMockPrincipal`), then:

   ```tsx
   return prefetchAdmin([adminDashboardQuery(principal)], <DashboardPage />);
   ```

   Keep the existing `Metadata` export. `prefetchAdmin(options, children)` is the stable signature for FE-ADM-018 (#208).

2. **Read in the module** with `useQuery` / `useSuspenseQuery` and the matching `*Query` factory from `queries.ts`. Pass the full `principal` from `useMockPrincipal()` — factories bind the adapter actor and key by `adminAuthScope(principal)`.

3. **Write through `mutations.ts`.** Each hook invalidates the keys in the table below. Do not hand-roll a `refresh()` that re-fetches the page.

4. **Never call `getMockAdapter()` from a component** once that screen’s Wave 2 ticket lands. This directory is the only place in `apps/admin` that may call it.

## Query keys

All keys are built by `adminKeys` in `keys.ts`. No string literals at call sites.

Every key is rooted at `["admin", adminAuthScope(principal)]`. The scope is a
staff authorization fingerprint (staff id + role/permission revision), not the
coarse `guest | customer | admin` shell role. Super Admin → Coach must not
reuse cached rates, reports, or other-staff rosters.

Hierarchical prefixes work with `invalidateQueries`:

```ts
queryClient.invalidateQueries({ queryKey: adminKeys.bookings.all(scope) });
```

`adminKeys.queues` holds infinite queue keys (`payments(tab)`, `cancellations`, `reschedules`). Factories: `adminPaymentsQueueInfiniteQuery`, `adminCancellationsInfiniteQuery`, `adminReschedulesInfiniteQuery`.

## Invalidation map

| Mutation | Invalidates |
| --- | --- |
| `confirmAdminBooking`, `rejectAdminBooking` | `bookings.all`, `payments.all`, `dashboard`, `queues.all` |
| `recordCash`, `markRefundPending`, `markRefunded` | `payments.all`, `bookings.all`, `dashboard`, `queues.all` |
| `completeAdminCancellation`, `rejectAdminCancellation` | `cancellations.all`, `bookings.all`, `dashboard`, `queues.all` |
| `approveAdminReschedule`, `rejectAdminReschedule` | `reschedules.all`, `bookings.all`, `sessions.all`, `dashboard`, `queues.all` |
| `checkIn`, `markNoShow` | `bookings.all`, `roster` (prefix), `dashboard`, `reports.all` |
| `upsertAdminClass` | `classes.all` |
| `upsertAdminBundle`, `setAdminBundleStatus`, grant/revoke/review | `bundles.all`, `customers.all` |
| `upsertAdminCoach` | `coaches.all` |
| `upsertAdminSession`, `cancelAdminSession` | `sessions.all`, `dashboard`, `reports.all`, `bookings.all`, `roster` (prefix) |
| `upsertAdminStaff`, `disableAdminStaff` | `staff.all` |
| `updateAdminSettings`, `promotePolicyVersion` | `settings.all` |

`approveAdminReschedule` decrements `remainingSlots` on the target session, which is why it invalidates `sessions.all`.

## QueryClient defaults

`makeQueryClient()` (`client.ts`) is shared by `Providers` and `prefetchAdmin`:

- `staleTime: 30_000` — the mock is in-memory; a non-zero value is what proves caching.
- `gcTime: 300_000`
- `retry: 0` — `failNext` is one-shot; retry would swallow the harness failure.
- `refetchOnWindowFocus: false`

`Providers` accepts an optional `queryClient` so a story can inject a seeded client. `apps/admin/.storybook/preview.tsx` (FE-ADM-021) wraps stories in `Providers` and keys that tree by principal + `mockRuntime` so toolbar / parameter changes get a fresh `makeQueryClient()`.

## Cache + mock principal

Identity switches go through `useSwitchAuthorizedIdentity`, which calls `removeAuthorizedAdminCache` (remove `["admin"]` + `clear`) and navigates with a consumer-supplied allowed-route function (`firstPermittedAdminRoute` by default). Clear, do not invalidate — another staff principal’s data must not stay reachable even briefly.

`AdminSidebar` still calls `getAdminDashboard()` directly. FE-ADM-016 (#205) should adopt `adminDashboardQuery` so `/dashboard` and the sidebar share one key.

## Server vs browser adapter instances

`getMockAdapter()` is a module singleton. The server’s instance and the browser’s instance are **different objects**. Server prefetch always dehydrates pristine fixtures; client mutations only mutate the browser copy.

React Query `hydrate` will not clobber a client entry whose `dataUpdatedAt` is newer. That only helps after a write goes through `mutations.ts` (which invalidates `dashboard`). `/payments` still calls the adapter directly, so a payment action will not update the dashboard snapshot until that screen adopts the mutation hooks.

Runtime knobs (`latencyMs`, `failNext`, `emptyAdminQueues`, …) live in the **browser** module. After changing a knob the harness clears the cache so mounted client queries refetch against that module. It does **not** `router.refresh()` on runtime changes — a server prefetch would dehydrate pristine fixtures and hide the knob. A later full navigation can still hydrate pristine data if the server module never saw the knob.

## Deferred

Optimistic updates are out of scope. `checkIn` and `markNoShow` are the two writes where optimistic UI would help (roster check-in is a rapid repeated action). Invalidate-on-success is enough for the mock.
