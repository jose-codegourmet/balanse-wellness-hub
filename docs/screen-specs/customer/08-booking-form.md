# Customer Portal — Booking Form

```text
RESERVE YOUR SPOT
Session summary: class | date | time | coaches | price

YOUR DETAILS
Name (prefilled)
Email (prefilled)
Contact (prefilled)

WAIVERS / POLICIES
[ ] Waiver vX
[ ] Gym Policy vX

[Continue to Payment]
```

Customer books only for themselves. Required policy acceptance must be versioned and recorded.

The customer reserves the scheduled class session, not an individual coach. Show every assigned coach; compensation remains admin-only.

When the customer has an eligible package for this session, offer “Use a package” (sessions remaining, never a peso balance). Require an explicit choice if more than one entitlement qualifies. One credit and one slot reserve together.

## Change rules (#380)

When the session refuses cancellation or reschedule requests, the hero shows a “Changes” fact (“No cancellations”, “No reschedules”, or both) and a section above “Waivers and policies” explains that bookings on this session cannot be cancelled / rescheduled by request. A required checkbox (“I understand this reservation cannot be cancelled or rescheduled.”) sits in the form schema; the reserve (or join waitlist) button stays disabled until it is ticked. Sessions that accept both requests show nothing extra.
