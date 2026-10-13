# Admin React Query layer

Routes resolve a verified staff actor and prefetch typed API client queries. Client components read through `useQuery` / `useSuspenseQuery` and write through mutation hooks in this directory. Query factories own API calls and keys; components do not import mock fixtures or build API URLs.

Every key is rooted at `adminKeys` and `adminAuthScope(actor)`, a fingerprint of staff id, role, and permissions. Role or identity changes clear the query client before navigation so another staff member's cached data is inaccessible. Query defaults are a 30-second stale window, 5-minute garbage collection, no retries, and no focus refetch.

Mutations invalidate affected entity keys and related dashboard or queue keys. Booking, payment, cancellation, reschedule, and roster writes also invalidate the dashboard; credit-changing actions invalidate bundle metrics. Admin permission checks use `ADMIN_*_ACCESS` from `@balanse/domain` through the app authorization helpers.

Storybook aliases `@balanse/api-client/browser` to browser-local fetchers backed by `MockDataAdapter`; stories may pass entity-specific fetchers. Application routes and this query layer use the real API client.
