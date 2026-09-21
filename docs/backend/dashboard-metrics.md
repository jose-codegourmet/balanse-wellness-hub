# Admin dashboard metrics (BE-054)

The dashboard is a **narrow operational endpoint**, not the reports query surface.

- `GET /api/admin/dashboard` — today’s scalars + 14-day series + comparison object.
- `GET /api/admin/dashboard/metrics` — series only.
- `/api/admin/reports/*` stays the filtered analysis API (BE-041 / BE-022).

`AdminDashboardSnapshot` series are **optional extras** on this HTTP payload. The mock may add the same optional fields; FE-ADM-022 should not invent charts.

## Series

Grain: one **Asia/Manila** calendar day (`YYYY-MM-DD`). Window: trailing **14** days including today. Shape: `MetricSeries` in `@balanse/domain`.

| metric | Definition |
| --- | --- |
| `gross_sales` | Sum of `payments.amount` where status is `VERIFIED` or `CASH_RECEIVED` and booking is not `WAITLISTED` / `HELD_AWAITING_PAYMENT` — same as `countsTowardGrossSales()`. |
| `occupancy` | `CONFIRMED` + `CHECKED_IN` / session capacity that day (published sessions). |
| `session_count` | Sessions starting that Manila day with status `PUBLISHED` or `CANCELLED`. |
| `coach_cost` | Sum of all assignment snapshot costs (hourly rates multiplied by duration; never current `coaches.defaultRate`). **Admin-only field** — omit the key entirely for a non-admin principal. |

Labels stay in `REPORT_TERMS`. No field named `profit`.

## Comparisons / trends

| Headline | Prior |
| --- | --- |
| `todaysSalesPhp`, `todaysOccupancy`, `coachCostTodayPhp` | Previous Manila day (`priorWindow: "previous_manila_day"`). |
| `pendingPayments`, `cancellations`, `reschedules`, `waitlisted` | **`prior: null`** — queue depth history is not derivable without a new snapshot table. FE-ADM-022 must show the count with no trend arrow. |

## Cost

Computed at request time with existing `sessions(startsAt)` / payment / booking indexes. No materialized view for MVP. Revisit past ~100k booking rows (add a nightly rollup then). Timezone bucketing: `(startsAt AT TIME ZONE 'Asia/Manila')::date`.
