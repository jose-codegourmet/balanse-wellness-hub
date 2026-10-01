# Admin Portal — Customer Management

```text
CUSTOMERS
[Search] [Filters] [Onboarding: completed / skipped / not started]
(avatar) Name / nickname | Contact | Upcoming | Last Visit | View

CUSTOMER DETAIL
(avatar xl) First Last · "Annie" · contact      [Onboarding: Skipped] [Hidden on public roster]
Profile
About              goals · experience · interests · other · heard from
Referral           Referred by <name> (Customer QR) · Referred 2 people
Upcoming / pending / history
Cancellation / reschedule history
Attendance / no-show history
Payment / refund history
Accepted policy versions
```

## Avatar, nickname, About and Referral (#343, #353)

- **List:** avatar column before the name; nickname as a muted subtitle; search also matches nickname; optional Onboarding filter.
- **Detail header:** `UserAvatar` (`xl`), first + last name, nickname, existing contact info. Badges: onboarding status, and "Hidden on public roster" when the customer opted out.
- **About** card (`customer-about-card`): goals, experience, interests (class names linking to admin class pages), `*Other` texts, heard-from. Empty state "Hasn't completed onboarding yet" with the status (skipped / not started).
- **Referral** card (`customer-referral-card`): "Referred by <name>" (link) + channel (Customer link / Customer QR / Studio link / Studio QR), or "Not referred"; "Referred N people" with links to their detail pages.
- About and Referral need `customers.read`. The adapter omits the data otherwise.
- Staff cannot edit a customer's nickname, avatar or onboarding answers.
