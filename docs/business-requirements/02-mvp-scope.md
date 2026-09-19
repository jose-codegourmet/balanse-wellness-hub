# 02 — MVP Scope

## In scope

### Customer-facing

- Calendar-first class discovery
- Daily class list
- Class details
- Visible remaining capacity
- Customer registration/sign-in
- Google authentication through Supabase if practical
- Email/password authentication as supported fallback
- Customer profile
- Own-booking-only rule
- Booking form
- Required waiver/policy acceptance
- Per-session pricing
- Multiple class bookings on the same day
- GCash payment flow
- Proof-of-payment upload
- Cash / Pay at Counter flow
- Reservation grace period
- Customer booking status/history
- Customer cancellation request
- Customer reschedule request
- Waitlist
- Confirmed booking view that can be shown to staff

### Admin-facing

- Manage coaches
- Manage class definitions
- Create/manage schedules
- Assign coaches
- Set class/session capacity
- See calendar
- See attendees per session
- See pending payment/approval items
- Review GCash proof of payment
- Confirm/reject bookings
- Receive/manage cancellation requests
- Process manual refunds outside the application
- Handle reschedule requests
- Manual customer check-in
- Mark no-show
- See customer booking records

## Explicitly out of scope for the lean MVP

- PayMongo
- Maya payment gateway
- Stripe
- Automated GCash verification
- Automated refunds
- Store credit
- Wallet/balance
- Membership packages
- Bundled class passes
- Coach self-service schedule management
- Full coach portal
- Automated recurring-class generation
- Complex recurring schedule rules
- Automated tax/official receipt issuance
- Customer booking on behalf of another person
- Admin-configurable grace-period/cutoff settings
- Fully automated cancellation/refund decisions

## Important product boundary

Balanse is not attempting to become a full gym ERP in this phase.

The MVP centers on:

> availability → account → reserve → payment intent/evidence → admin approval → check-in

Anything not necessary to validate that loop should be considered carefully before inclusion.

## Added MVP scope — financial and inventory reporting

The MVP should also support:

- storing internal coach compensation/rate information,
- snapshotting coach rate and customer session price onto scheduled sessions,
- basic gross sales reporting,
- refund and net-sales visibility,
- coach-cost reporting,
- class/session capacity and occupancy reporting.

Advanced accounting, payroll, tax reporting, forecasting, and formal financial statements remain out of scope.
