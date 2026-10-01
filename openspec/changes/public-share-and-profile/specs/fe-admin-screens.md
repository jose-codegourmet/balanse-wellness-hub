# Delta: FE admin screens

Base: `openspec/specs/fe-admin-screens.md` (requirements 1–20). Merge on archive; renumber if the base has grown.

## MODIFIED Requirements

2. Route inventory: **adds** `/marketing-insights`. All other routes are unchanged.
3. Admin nav: **adds** Marketing insights (`/marketing-insights`) in the Studio group after Reports, shown only with `reports.marketing.read`. Hiding the item is not authorization.

## ADDED Requirements

21. Share (#343). The schedule selected-session panel, the session roster header (`/sessions/[sessionId]/roster`) and event detail (`/events/[eventId]`) offer **Share** (event detail: **Share event**) and **Open public page**. Links are built from `NEXT_PUBLIC_WEB_SITE_URL` + the public path builders + `src=studio`; QR adds `via=qr`. Disabled reasons: session `DRAFT` → "Publish the session to share it"; event `DRAFT` → "Publish the event to share it"; `ARCHIVED` → "Archived events can't be shared". Cancelled → link and QR allowed, poster hidden. Any staff who can open the screen can share; no new permission.
22. Customer identity in admin. The session roster, customer list and detail, and Coach Students list and detail show `UserAvatar` (photo or initials) with the full name and the nickname as a muted subtitle. Customer and Coach Students search also match nickname.
23. Onboarding answers (goals, experience, interests, `*Other` texts, heard-from) appear on customer detail (**About** card) and the session roster (goals/experience chips) for actors with `customers.read`, and on Coach Students detail and the roster for a coach's own students only. The adapter (`apply-admin-authorization.ts`) omits them otherwise; components render what they receive.
24. Customer detail adds onboarding-status and "Hidden on public roster" badges and a **Referral** card ("Referred by <name>" + channel label, or "Not referred"; "Referred N people" with links), visible with `customers.read`. Coaches never see referral. The customer list adds an optional Onboarding filter (completed / skipped / not started).
25. The session roster marks attendees with `showOnPublicRoster = false` as "Hidden on public roster". Check-in, no-show and other actions are unchanged.
26. Staff cannot edit a customer's nickname, avatar or onboarding answers in this change.
27. Marketing insights (`/marketing-insights`) is gated on `reports.marketing.read` (Super Admin only by default; Front Desk does not have it). It shows aggregate counts only for a sign-up date range (default last 90 days, `Asia/Manila`): KPIs, heard-from, goals, experience, class interest and sign-ups by referral channel. No names, emails or ids, in the UI or the adapter response. See `docs/screen-specs/admin/22-marketing-insights.md`.
