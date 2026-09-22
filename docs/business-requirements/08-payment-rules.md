# 08 — Payment Rules

## MVP payment model

Payment is manual.

There is no automated payment gateway in the initial release.

## Supported payment methods

### 1. GCash

Customer:

1. Reserves an available session.
2. Chooses GCash.
3. Uses the gym's provided GCash payment details/QR.
4. Pays outside the application.
5. Uploads proof of payment.
6. Waits for admin review.

Admin:

1. Reviews submitted proof.
2. Confirms or rejects the booking.

The uploaded image is evidence for review; it is not automatic payment verification.

### 2. Pay at Counter / Cash

Customer:

1. Reserves an available session.
2. Chooses Pay at Counter.
3. Receives the same reservation hold logic.
4. Arrives before the reservation expires/class starts.
5. Pays cash at the gym.

Admin:

1. Receives the cash.
2. Records payment/confirmation.
3. Confirms the booking.

No screenshot is required for cash payment.

## Shared grace-period rule

Both GCash and cash reservations use the same configurable reservation hold principle.

Default:

- 8 hours from reservation creation,
- capped by the class start time.

Example:

- Customer reserves at 1:00 AM.
- Class starts at 8:00 AM.
- Although default grace is 8 hours, the effective deadline is 8:00 AM.

## Payment on the waitlist

Customers should not be required to pay merely to remain on a waitlist.

Payment obligation begins once a customer is promoted to an actual slot.

## Manual verification

The app does not decide whether a GCash payment is genuine.

Admin verification is part of the business process.

## Refunds

Refund execution is manual and happens outside the application.

The application should record refund-related state/history.

## No store credit

**CONFIRMED:** cash refunds are refunds only.

Do not implement:

- wallet credit,
- store balance,
- vouchers as a replacement for a cash refund.

Session packages (#290) are a separate entitlement ledger. Cash is never refunded into package credits. Restoring a package redemption returns only the same session entitlement.

Paid packages follow the same manual-review principle as GCash: no automated gateway, and credits activate only after studio approval.

Session **packages** (BE-058) are not store credit. Cash/GCash booking payments are never converted into package credits. A restored redemption only returns the same previously reserved session credit. Paid package purchases use a dedicated acquisition payment, not a fake booking payment.

## Future

Automated payment gateway integration is explicitly future scope.
