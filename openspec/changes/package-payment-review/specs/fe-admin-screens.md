# Delta: FE admin screens

Base: `openspec/specs/fe-admin-screens.md` (requirements 1–21). Merge on archive; renumber if the base has grown.

## MODIFIED Requirements

10. Bundle catalogue and grant live under `/bundles/**` and `/customers/[customerId]`. **Paid-acquisition review lives on `/payments` (Packages tab); `/bundles` shows the pending count and links there.** They use the package API/query layer; entitlement and ledger rules are in `openspec/specs/session-bundles.md`.

## ADDED Requirements

22. `/payments` has four tabs: GCash Pending, Pay at Counter, Packages, Refunds. Packages is visible with `bundles.read` or `bundles.manage`, searches by customer name, email or package name, and uses `AdminQueueCard` with a package badge instead of a booking status. Receipt thumbnails open the shared `PaymentProofDialog`. The dashboard attention row and the notification inbox include a Package payments count linking to `/payments?tab=packages`.
