# Public — Session page (#348)

**Route:** `/sessions/<class-slug>/<YYYY-MM-DD>/<sessionId>` (`apps/web`, `(public)` layout)  
**Audience:** Anyone. Attendee names need sign-in.

## Purpose

A shareable page for one session: what it is, when and where, who teaches it, and who is going. It works as social proof and leads to booking.

## Rough layout

```text
┌──────────────────────────────────────────────────────────┐
│ [Class hero image]                                       │
│ Reformer Pilates                         [Open · 4 left] │
│ Sat, Oct 4 · 9:00–9:50 AM (50 min)            [Share]    │
├──────────────────────────────────────────────────────────┤
│ Part of  Pilates for a Cause →        (only with event)  │
├──────────────────────────────────────────────────────────┤
│ WHEN      Sat, Oct 4 · 9:00–9:50 AM                      │
│ WHERE     Balansé Cebu · <address>                       │
│ PRICE     ₱___                                           │
│ SPOTS     4 of 12 left                                   │
├──────────────────────────────────────────────────────────┤
│ COACHES   (photo) Rex · Strength, Mobility   [Coaches →] │
├──────────────────────────────────────────────────────────┤
│ WHO'S GOING                                              │
│ Guest:     ○○○○  8 going · 4 spots left                  │
│            [Sign in to see who's going] [Create account] │
│ Customer:  Who's going (8)                               │
│            (You) Ana · You   (MR) Mia   (J) Jo ...       │
│            [+2 others]                                   │
├──────────────────────────────────────────────────────────┤
│ ABOUT THE CLASS  short blurb   [View class →]            │
├──────────────────────────────────────────────────────────┤
│ [Book this session]                         [Share]      │
└──────────────────────────────────────────────────────────┘
Mobile: sticky bottom bar with the booking button.
```

## URL

- Date = session start date in `Asia/Manila`. Class slug = `GymClass.slug`. The id is authoritative.
- A stale slug or date → 301 to the canonical path, keeping the query string (`ref`, `src`, `via`).
- Session `DRAFT` or unknown id → 404.

## Content

- Hero: class hero image, occurrence title or class name, availability chip from the shared status language.
- Facts: date and time range with duration (Manila), venue name and address (never venue notes), price (fixture prices are OQ-PRICE placeholders), capacity and spots left.
- "Part of <event title>" → public event page, shown when the session has a published or cancelled event.
- Coaches: photo, name, specialties, link to `/coaches`. Visible to everyone.
- Class blurb with a link to `/classes/[slug]`.

## Who's going

- Attendees are `CONFIRMED` and `CHECKED_IN` bookings. Held, payment-submitted and waitlisted bookings are not listed.
- **Guest:** "X going · Y spots left", neutral placeholder circles (no initials, no images), **Sign in to see who's going** → `/login?returnTo=<path + query>`, secondary **Create an account** → `/sign-up?returnTo=…`.
- **Signed-in customer** (booked or not): "Who's going (X)", `UserAvatar` + display name (nickname, else first name). The viewer's row is first with a **You** badge. Opted-out attendees are counted and shown as one **+N others** chip.
- **Viewer opted out:** own row also says "Only you can see this — you're hidden from others" with a link to `/portal/profile`.
- Empty: "No one's booked yet — be the first." Cancelled: muted roster, "This session was cancelled."
- Attendees are not links and have no hover cards. Copy says "going", never "bookings" or "applicants".
- Never shown: last name, email, contact number, ids, booking or payment status, booking time.

## Booking button

| State | Button |
| --- | --- |
| Open / nearly full | **Book this session** → `/portal/book/[sessionId]` (guests go through login) |
| Full with waitlist | **Join waitlist** |
| Past cutoff | Disabled, existing copy |
| Viewer already booked | **View my booking** → `/portal/bookings/[bookingId]` |
| Cancelled | None. Banner "This session was cancelled" |
| Past | None. Banner "This session has ended" + "See upcoming <class> sessions" → `/book/calendar?classId=` |

## Share

- **Share** in the hero and at the bottom (`ShareDialog`).
- URL = canonical absolute URL. Signed-in customer adds `ref=<referralCode>&src=customer`; guest adds nothing. QR adds `via=qr`.
- Poster: `/share/poster/sessions/[sessionId]` with the same params. `fileSlug` = `<class-slug>-<date>`.
- Cancelled or past: link and QR only, no poster.

## Metadata

Title "<Class> · <Day, Mon D, h:mm A> | Balansé", description = venue + coaches, canonical URL, OG image from the shared renderer, `noindex` when cancelled or past.

## States

Loading skeleton, error, 404, published, nearly full, full + waitlist, past cutoff, already booked, cancelled, past, guest vs customer roster, viewer opted out, empty roster. Responsive at 360px with no horizontal scroll.

Mock data: `getPublicSessionPage(sessionId)`, `getPublicRoster(sessionId, viewer)`. No `/api/*`.
