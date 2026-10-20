# Delta: FE customer screens

Base: `openspec/specs/fe-customer-screens.md`. Already merged into the base on 2026-10-20; kept here as the change history.

## ADDED Requirements

- The reschedule picker lists only sessions the customer can request now: published, reservable (not ended, full, cancelled, or past cutoff), starting after the page's render instant, within a rolling eight-week window from the start of today in Asia/Manila, grouped by studio day with the nearest first. Unavailable sessions are not rendered as disabled rows. A target that fills or passes cutoff before submit still surfaces the server error on the field. No same-class or price-difference filtering is applied (OQ-2; canonical rules 51 and 64).
