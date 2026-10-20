# Customer Portal — Reschedule Request

```text
REQUEST A RESCHEDULE
Current booking summary

SELECT PREFERRED NEW SESSION
Step 1 — Choose one · Ended, full, and past-cutoff sessions are not listed.
Sessions grouped by studio day, nearest first — only sessions the customer can request now.
Empty: "No alternative sessions" when nothing is requestable in the next eight weeks.

REVIEW YOUR REQUEST
Current session → preferred new session
[Back to booking] [Submit reschedule request]
```

## Picker rules (#379)

- The list covers a rolling eight-week window from the start of today in Asia/Manila (`rescheduleRange(nowIso)` in `apps/web/src/modules/schedule/`), not the showcase calendar year.
- Only published, reservable sessions that start after the page's `nowIso` are shown, excluding the booking's own session. `PublicSession.reservable` already encodes ended, full, cancelled, and past-cutoff sessions, so no dead rows are rendered and nothing in the picker is disabled.
- The empty state keeps the current slot held and offers Back to booking.
- A target that fills or passes cutoff between load and submit still returns the server error on the field ("That session just filled…"), so the race is handled without listing unavailable rows.
- No same-class or price-difference filtering (canonical rules 51 and 64; OQ-2 stays open).

Submitting records a preference; it does not change the current booking until the studio resolves
the request. Open business rules: same-class restriction, price differences, cutoff, max
reschedules, full target session behavior.
