# Admin Portal — Session Roster / Check-In

```text
YOGA — SEP 20 — 8:00 AM
Coach ___
9 confirmed • 2 held • 1 waitlisted

CONFIRMED
Name | Payment | Attendance | [Check In]

HELD / PENDING
WAITLIST (FIFO)
```

Actions: check in, mark no-show, inspect booking/payment, inspect waitlist order. No-show = no refund.

## Inventory / utilization metrics

The session roster can also expose operational inventory metrics:

```text
Capacity
Confirmed
Held
Available
Waitlisted
Checked In
No-show
```

Suggested utilization measures:

```text
Occupancy = Confirmed / Capacity
Attendance Utilization = Checked In / Capacity
```

Keep these as separate metrics.

## Current screen (mock, #334)

- Header (`AdminPageShell`): session name, date, time range, breadcrumb back to Schedule. Stats: **Checked in / confirmed** (emphasised), places left, held, waitlist, and a capacity bar (checked in / to check in / held against capacity) with the capacity and any no-show count beneath. Occupancy and attendance percentages are not shown here; they belong to Reports.
- **Coaches**: the session's coaches as photo circles with a shield mark; each links to the coach profile when the actor may open Coaches.
- **Participants**: one avatar grid for everyone on the session — confirmed, checked in, completed, no-show, held / pending, and waitlisted — with search by name and count chips: All, To check in, Checked in, Held, Waitlist, No-show. Each face shows the guest's name and a short status; checked-in faces carry a check mark, no-shows a cross (struck through), held guests an hourglass, and waitlisted guests their FIFO position. Order: to check in, checked in, held, waitlist, no-show. The grid fills its container (`auto-fill`), so it follows the sidebar, not the viewport.
- **Guest sheet**: tapping a face opens a bottom sheet with the full status badge, payment (when the actor may read payments), and links to the booking and customer profile (when permitted). CONFIRMED guests with the attendance action get **Check in** (one tap, toast, sheet closes) and **No-show** (confirm dialog, no refund). Held and waitlisted guests have no attendance actions.
- Empty states: "Nobody has booked this session yet." and "No guests match this search or filter."
- Mock example with attendees: `/sessions/session-wed-cutoff/roster` (Calisthenics, past cutoff) — 2 checked in, 3 to check in, 1 held paying at the counter. `/sessions/session-wed-open/roster` covers every booking status.

## Avatar, nickname, onboarding answers and share (#343)

- Each face uses `UserAvatar` (photo or initials) with the full name; the nickname shows as a muted subtitle when set ("Ana Reyes · Annie"). This applies to every group (to check in, checked in, held / pending, waitlist, no-show). Search also matches nickname.
- For actors who may see answers (`customers.read`, or a coach assigned to the session), the guest sheet and row show a compact goals / experience chip row (for example `Strength` `Flexibility` · `New`) with an expandable Interests / Other. Others do not receive the data from the adapter.
- A customer with `showOnPublicRoster = false` carries a small "Hidden on public roster" indicator, so the front desk doesn't promise public visibility.
- The header gains **Share** (studio link with `src=studio`, QR adds `via=qr`) and **Open public page**. Draft sessions show "Publish the session to share it". Cancelled sessions share the link and QR without a poster.
- Check-in, no-show and the other actions above are unchanged.
