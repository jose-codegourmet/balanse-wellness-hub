# Delta: Session bundles (packages)

Base: `openspec/specs/session-bundles.md` (requirements 1–9). Merge on archive.

## MODIFIED Requirements

4. Customers browse `/packages` and `/packages/[slug]`. Signed-in customers claim free packages or request paid ones. **A paid request continues at `/portal/packages/acquisitions/[acquisitionId]/payment`, where the customer chooses GCash (then `/gcash`: send, upload receipt, studio review) or Pay at Counter. Neither choice, a receipt upload, nor a cash record activates the package; only staff approval does. A request has no hold or deadline. Approved requests show an end state linking to the new package; rejected or cancelled ones show a closed state.** Paid entitlements activate only after admin approval. Acquisition is idempotent. Limits are enforced; admin grants from customer detail may override with an audit note.

## ADDED Requirements

10. Staff review paid requests on `/payments?tab=packages` (`bundles.read` / `bundles.manage` to see; `bundles.manage` to act). The queue holds `CUSTOMER_PAID` acquisitions in `PENDING_REVIEW` (receipt submitted) and `PENDING_PAYMENT` with method `PAY_AT_COUNTER`, receipts first then oldest first, searchable by customer name, email or package name. Actions are Approve payment, Reject receipt (with reason) and Cash received. `/bundles` shows only the pending count and a link to that tab.
11. Package receipts live in the private `payment-proofs` bucket and are read through `GET /api/admin/package-acquisitions/{id}/proof-signed-url` (short-lived, audited per view). The admin acquisition list carries the customer's name and email and the package name so reviewers never see a bare profile id. The dashboard and inbox count `PENDING_REVIEW` requests as `packagePayments`; realtime changes on `bundle_acquisitions` / `bundle_acquisition_payments` refresh the queue, the catalogue counts and the dashboard.
12. A held booking that holds a package credit shows "Reserved — Package Applied" and a no-payment message; the customer booking payload exposes the covering entitlement, package name, intended entitlement for waitlist promotion and whether promotion was blocked.

## Routes

- adds `/portal/packages/acquisitions/[acquisitionId]/payment`, `/portal/packages/acquisitions/[acquisitionId]/payment/gcash`
- adds `GET /api/admin/package-acquisitions/{id}/proof-signed-url`
