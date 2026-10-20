# Delta: Catalogue and scheduling

Base: `openspec/specs/catalogue-and-scheduling.md` (requirements 1–10). Already merged into the base on 2026-10-20; kept here as history.

## MODIFIED Requirements

4. Creating a session captures its customer price and each assigned coach's compensation as historical snapshots. Later changes to a class price or coach default rate do not rewrite existing bookings, session cost or reports. A duration-based coach cost uses the scheduled duration. **A session's customer price (and a class default price) is at least ₱1; once any customer has paid or submitted payment for the session, its price is locked and the editor shows why.**

## ADDED Scenarios

- **Locked price:** Given a session with a confirmed or payment-submitted booking, when admin edits the session, the price field is read-only and the API rejects a different price (`price_locked`); other fields still save.
- **Zero price:** Given a new or unpaid session, when admin enters ₱0, the form and the API reject it (minimum ₱1).
