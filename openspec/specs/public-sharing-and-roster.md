# Spec: Public sharing and roster privacy

The detailed change contract lives in [`public-share-and-profile`](../changes/public-share-and-profile/proposal.md) and its `specs/` deltas. This base capability records the feature boundary so readers can find it from the repository feature map.

## Requirements

1. A published session has a canonical public URL `/sessions/<class-slug>/<YYYY-MM-DD>/<sessionId>`. A published event has `/events/<event-title-slug>/<YYYY-MM-DD>/<eventId>`. The id selects the record; the date is its Manila start date, and stale date/slug paths redirect to the canonical path while retaining the query string. Draft records are not public; archived events are not public.
2. Public pages show session facts, venue, coaches and booking availability without staff-only venue notes, event internal notes, rates or customer identity fields. Cancelled and past pages show status without a booking button. Event registration windows gate the event booking button in addition to the session cutoff.
3. The public roster counts `CONFIRMED` and `CHECKED_IN` bookings only. Guests see counts. Authenticated customers see opted-in attendees by nickname or first name and avatar; an opted-out attendee remains counted but hidden from other customers and can still see their own row. Last names, profile ids, booking ids, contact details, payment states and booking times never enter the public roster DTO.
4. Share controls can copy a link, invoke native share where available, show/download a QR and open a poster preview. Customer links may carry their referral code; studio links identify the studio source. A QR adds `via=qr`. Cancelled or past pages may share a link/QR while poster availability follows the change contract.
5. Public poster and OG artwork use the same brand data and renderer, with no private fields. Cancelled or past metadata follows the change contract's indexing rules. Referral attribution is described in [identity and onboarding](identity-and-onboarding.md).

## Scenarios

- **Opt-out:** Given an attendee with roster visibility off, when another customer opens the session page, the total going count includes that booking but the attendee's identity is absent.
- **Moved session:** Given a previously shared path with the old date, when the session moves, opening it redirects to the canonical new-date path and keeps the share query string.

## Surfaces and sources

- Public pages and posters: `/sessions/**`, `/events/**`, `/share/poster/**`; `/api/public/sessions/{id}`, `/api/public/events/{id}`, `/api/public/sessions/{id}/roster`.
- Detail: `openspec/changes/public-share-and-profile/`, `docs/screen-specs/public/12-session-page.md`, `docs/screen-specs/public/13-event-page.md`, `docs/backend/api-contracts.md`.
