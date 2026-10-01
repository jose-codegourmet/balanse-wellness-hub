# Public — Event page (#349)

**Route:** `/events/<event-title-slug>/<YYYY-MM-DD>/<eventId>` (`apps/web`, `(public)` layout)  
**Audience:** Anyone. Attendee names need sign-in.

## Purpose

A shareable page for an event (a `SessionEvent` wrapping one session). It leads with the event's story and reuses the session page's facts, coaches and roster. This amends the earlier "no public event page" rule (#317 Q1).

## Rough layout

```text
┌──────────────────────────────────────────────────────────┐
│ [Event poster — fallback class hero]                     │
│ Pilates for a Cause                          [Published] │
│ A morning flow for a good cause                          │
│ Sat, Oct 18 · 8:00 AM · Balansé Cebu          [Share]    │
├──────────────────────────────────────────────────────────┤
│ ABOUT THIS EVENT      description                        │
│ GALLERY               (hidden when empty)                │
│ SUPPORTING            beneficiary (hidden when empty)    │
│ WHAT TO BRING         (hidden when empty)                │
├──────────────────────────────────────────────────────────┤
│ Session facts · Coaches · Who's going   (same as session)│
│ [View class →]                                           │
├──────────────────────────────────────────────────────────┤
│ [Book this session] or [Registration opens Oct 5, 9 AM]  │
└──────────────────────────────────────────────────────────┘
```

## URL

- Slug = `slugify(title)` at render time; no slug is stored. Date = the session's start date in `Asia/Manila`. The id is authoritative.
- A stale slug (title renamed) or date (session moved) → 301 to the canonical path, keeping the query string.
- Event `DRAFT`, `ARCHIVED` or unknown id → 404.

## Content

- Hero: poster (fallback class hero), title, summary, Manila date/time, venue name, status chip.
- About this event: `description`, rendered with the same rich-text handling as the admin event form.
- Gallery (`galleryImages`), Supporting (`beneficiary`), What to bring (`whatToBring`): each hidden when empty.
- Session facts, coaches and "Who's going" reuse the session page components and rules (`12-session-page.md`).
- "View class" → `/classes/[slug]`.
- Never rendered: `internalNotes`, `isPlaceholder`, venue notes.

## Booking button

| State | Button |
| --- | --- |
| Before `registrationOpensAt` | Disabled "Registration opens <Day, Mon D, h:mm A>", secondary "Share with friends" |
| After `registrationClosesAt` | Disabled "Registration closed" |
| Inside the window or no window | Session rules: book / join waitlist / past cutoff / view my booking |
| Event or session cancelled | None. Banner "This event was cancelled" |
| Past | None. Banner "This event has ended"; with a beneficiary, "Thank you for supporting <beneficiary>" |

The canonical booking cutoff always applies on top of the registration window.

## Share

- URL = canonical event URL + share params (customer `ref` + `src=customer`; guest none; QR `via=qr`).
- Poster: `/share/poster/events/[eventId]` with the same params. `fileSlug` = `<event-slug>-<date>`.
- Cancelled or past: link and QR only, no poster.

## Metadata

Title "<Event title> · <Mon D> | Balansé", description = summary, canonical URL, OG image from the poster, `noindex` when cancelled or past.

## States

Full content, minimal content, registration not yet open, registration closed, cancelled via event, cancelled via session, past with beneficiary, guest vs customer roster, stale-slug redirect, 404. Responsive at 360px with a sticky mobile booking bar.

Mock data: `getPublicEventPage(eventId)`, `getPublicRoster(sessionId, viewer)`. No `/api/*`. No public `/events` index in this phase.
