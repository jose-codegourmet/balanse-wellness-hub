# Web React Query layer

Routes resolve the signed-in customer from Supabase and prefetch typed API client queries where useful. Client components read through `useQuery` / `useSuspenseQuery` and write through mutation hooks in this directory. Query factories own keys and call typed `@balanse/api-client` functions; components do not build API URLs or import fixtures.

All keys are rooted at `webKeys` with the authenticated customer id or `guest`. Sign-out clears the query client so another customer cannot see cached data. `makeQueryClient()` uses a 30-second stale window, 5-minute garbage collection, no retries, and no focus refetch.

Storybook aliases `@balanse/api-client/browser` to an in-browser mock fetcher. Stories may use `getMockAdapter()` and `.stories-data.ts` companions; application routes and this query layer do not.

## Live updates (Supabase Realtime)

`modules/realtime/PortalRealtimeSync.tsx`, mounted in the portal layout, listens for changes to the
signed-in customer's own bookings, payments, cancellation requests, and reschedule requests (RLS,
plus `profileId` / `requesterId` filters). A change invalidates `webKeys.all(customerId)` and calls
`router.refresh()` (batched over 750 ms), so server-rendered portal pages re-read through `/api/*`.
It catches up when the tab returns after at least 15 seconds hidden, or the channel resubscribes.
