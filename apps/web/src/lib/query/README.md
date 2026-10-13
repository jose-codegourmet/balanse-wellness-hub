# Web React Query layer

Routes resolve the signed-in customer from Supabase and prefetch typed API client queries where useful. Client components read through `useQuery` / `useSuspenseQuery` and write through mutation hooks in this directory. Query factories own keys and call typed `@balanse/api-client` functions; components do not build API URLs or import fixtures.

All keys are rooted at `webKeys` with the authenticated customer id or `guest`. Sign-out clears the query client so another customer cannot see cached data. `makeQueryClient()` uses a 30-second stale window, 5-minute garbage collection, no retries, and no focus refetch.

Storybook aliases `@balanse/api-client/browser` to an in-browser mock fetcher. Stories may use `getMockAdapter()` and `.stories-data.ts` companions; application routes and this query layer do not.
