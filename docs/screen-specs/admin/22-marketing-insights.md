# Admin Portal — Marketing insights (#354)

**Route:** `/marketing-insights`  
**Audience:** Staff with `reports.marketing.read` (Super Admin only by default; Front Desk does not have it). Without it → the existing admin "no access" state. The nav item sits in Studio after Reports and is hidden as UX only.

## Purpose

An aggregate view of who signs up and why: where people heard about us, what they want, which classes interest them, and how much sharing drives sign-ups. **Counts only.**

## Rough layout

```text
┌────────────────────────────────────────────────────────────┐
│ MARKETING INSIGHTS                 [Date range: last 90 d] │
├────────────────────────────────────────────────────────────┤
│ [Sign-ups] [Onboarding completed %] [Skipped %]            │
│ [Not started %] [From shared links  n · %]                 │
├────────────────────────────────────────────────────────────┤
│ HOW THEY HEARD ABOUT US      horizontal bars  [Other ▸]    │
│ GOALS                        bars (% of respondents)       │
│ EXPERIENCE LEVEL             bars / segmented bar          │
│ CLASS INTEREST               bars by class ("(inactive)")  │
│ SHARING                      Customer link · Customer QR · │
│                              Studio link · Studio QR · None│
└────────────────────────────────────────────────────────────┘
```

## Rules

- Date range filters on sign-up date (shared `DateRangePicker`), default last 90 days, `Asia/Manila`.
- KPIs: sign-ups; onboarding completed % (completed / sign-ups); skipped %; not started %; sign-ups from shared links (count and %).
- Heard-from "Other" expands to a de-duplicated, lowercased word list of free-text answers (top 20, counts only).
- Goals are multi-select: percentages are of respondents and don't sum to 100%. Say so in a caption.
- Inactive classes are labelled "(inactive)".
- Sharing shows sign-ups by referral channel plus the share from customer referrals vs studio marketing.
- No customer names, emails or ids anywhere. The adapter returns none. No top-referrer list.
- Every chart has an empty state ("No sign-ups in this range") and an accessible table fallback.
- Use the existing chart components and palette (as on `/sales`). No new chart library.

## States

Populated, empty range, no permission, loading.

Mock data: `getAdminMarketingInsights({ from, to })` through the admin query layer. Out of scope: CSV export, leaderboards, scan/click analytics, cohorts.
