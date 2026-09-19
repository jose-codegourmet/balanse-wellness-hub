# 14 — Customer Flows

## Flow A — Guest browses classes

1. Guest opens Balanse.
2. Calendar is the primary experience.
3. Guest selects a date.
4. System shows scheduled classes.
5. Guest sees:
   - class,
   - time,
   - coach where applicable,
   - price,
   - remaining slots/status.
6. Guest selects a class.
7. If guest attempts to reserve, authentication is required.

---

## Flow B — New customer books an available class

1. Customer selects a session.
2. Customer signs up/signs in.
3. Customer profile is created/loaded.
4. Booking form uses profile details.
5. Customer accepts required waiver/policies.
6. Customer submits reservation.
7. System creates a temporary slot hold.
8. Customer selects payment method:
   - GCash, or
   - Pay at Counter.
9. Customer follows the relevant payment flow.
10. Admin confirms/rejects.
11. Customer sees final status in profile.

---

## Flow C — GCash payment

1. Customer holds a slot.
2. Customer chooses GCash.
3. System displays payment instructions/QR.
4. Customer pays externally.
5. Customer uploads proof.
6. Booking shows payment submitted/pending review.
7. Admin reviews.
8. If accepted:
   - booking becomes confirmed.
9. If rejected:
   - booking becomes rejected,
   - refund handling occurs manually if money was actually received.

---

## Flow D — Pay at Counter

1. Customer reserves.
2. Customer chooses Pay at Counter.
3. Slot is held under the same grace-period rule.
4. Customer arrives before hold expiry/class start.
5. Customer pays cash.
6. Admin records payment.
7. Admin confirms booking.
8. Admin may immediately check the customer in when appropriate.

---

## Flow E — Walk-in customer

1. Customer arrives physically without prior booking.
2. Customer scans QR code.
3. Customer opens Balanse.
4. Customer signs in/registers.
5. Customer finds the session.
6. If booking cutoff has not passed and a slot is available:
   - customer reserves through the same normal flow.
7. Customer may choose Pay at Counter.
8. Admin confirms after payment.
9. Admin checks in.

No separate paper booking should be created.

---

## Flow F — Session is full

1. Customer opens full session.
2. Customer joins waitlist.
3. Customer does not pay yet.
4. Customer waits in FIFO order.
5. A main slot becomes free.
6. If before promotion cutoff:
   - next customer is promoted.
7. Promoted customer receives a normal temporary slot hold.
8. Customer completes payment path.
9. If the customer fails to pay in time:
   - reservation expires,
   - next eligible waitlisted customer may be promoted.

---

## Flow G — Customer requests cancellation

1. Customer opens their booking.
2. Customer selects cancellation request.
3. Booking becomes `CANCELLATION_REQUESTED`.
4. Slot remains locked.
5. Admin reviews.
6. Admin completes cancellation.
7. Admin performs refund manually if applicable.
8. Refund state is recorded.
9. Slot may then be released/promoted.

---

## Flow H — Customer requests reschedule

1. Customer opens booking.
2. Customer selects reschedule request.
3. Customer indicates desired alternative.
4. Booking becomes `RESCHEDULE_REQUESTED`.
5. Admin reviews available capacity and schedule.
6. Admin approves/rejects.
7. If approved, booking moves while preserving history.

Exact price-difference and cutoff rules remain open.

---

## Flow I — Customer arrives for confirmed class

1. Customer opens confirmed booking in profile if proof is needed.
2. Staff/admin finds customer on roster.
3. Admin checks customer in.
4. After class, the record may be completed.

If customer does not attend, admin may mark `NO_SHOW`.
