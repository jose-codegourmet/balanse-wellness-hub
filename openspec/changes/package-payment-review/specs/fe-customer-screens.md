# Delta: FE customer screens

Base: `openspec/specs/fe-customer-screens.md`. Merge on archive.

## ADDED Requirements

- Package payment screens at `/portal/packages/acquisitions/[acquisitionId]/payment` and `/gcash` match the booking payment screens in structure and share `PaymentMethodForm`, `PaymentProofForm`, `GcashPayStep` and `PaymentStepper` from `src/components/balanse/payment/`. Copy never mentions a hold or deadline for packages and always states that the studio activates the sessions after review.
- A held booking covered by a package credit shows "Reserved — Package Applied" with a no-payment explanation; it remains unconfirmed until the front desk confirms.
