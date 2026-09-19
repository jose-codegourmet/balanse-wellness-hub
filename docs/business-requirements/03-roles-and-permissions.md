# 03 — Roles and Permissions

## 1. Guest

A guest is an unauthenticated visitor.

### Can

- Open the public booking/calendar experience.
- Browse dates.
- View scheduled classes.
- View basic session information.
- View whether slots are available.
- See remaining capacity.

### Cannot

- Reserve a slot.
- Join a waitlist.
- Upload payment proof.
- Request cancellation/reschedule.
- View another customer's booking information.

### Conversion point

When a guest attempts to reserve, the guest must authenticate or create an account.

---

## 2. Customer

A customer is an authenticated individual booking for themselves.

### Can

- Browse classes.
- Reserve eligible sessions.
- Join a waitlist when appropriate.
- Select supported payment method.
- Upload GCash payment proof.
- Select Pay at Counter.
- View their own booking statuses.
- View confirmed bookings.
- Submit cancellation requests.
- Submit reschedule requests.
- Book multiple sessions on the same day.
- Accept required waiver/policy documents.

### Cannot

- Book for another person.
- Override capacity.
- Confirm their own payment.
- Confirm their own booking.
- Process their own refund.
- Change coach schedules.
- Check themselves in through admin controls.
- Edit developer-controlled business settings.

---

## 3. Admin

Initial admins:

- Coach Rex
- Coach Rex's wife

### Can

- Manage coaches.
- Manage classes.
- Create/edit/cancel scheduled sessions.
- Assign coaches.
- Set session price.
- Set capacity.
- View all bookings.
- View customer information needed for operations.
- Review payment proof.
- Confirm/reject bookings.
- Handle cash payments at the counter.
- Review cancellation requests.
- Record manual refunds.
- Handle reschedule requests.
- Check customers in.
- Mark no-show.
- View attendance.
- Operate the booking calendar.

### Cannot in MVP

- Change developer-only grace-period configuration.
- Change developer-only booking cutoff configuration unless a future admin setting is intentionally added.

---

## 4. Coach

A coach is an operational resource assigned to one or more sessions.

### MVP behavior

- Coaches do not need a self-service account/portal.
- Coaches do not directly edit their schedules in the app.
- Schedule changes are communicated to Coach Rex/admin.
- Admin makes the schedule change in the system.

### Future

A coach-facing role may later gain:

- own schedule view,
- availability management,
- attendance support,
- cancellation requests,
- class roster access.

This is not part of the current MVP.
