# Reporting queries (BE-022)

Parameterised SQL functions (half-open window: `startsAt >= p_from AND startsAt < p_to`):

| Function | Spec block |
| --- | --- |
| `report_sales_overview` | Gross Sales, Refunds, Net Sales, Paid Bookings |
| `report_class_performance_v2` | Class / Sessions / Revenue / Occupancy / No-shows |
| `report_coach_costs` | Coach / Sessions / Coach Cost / Related Revenue |
| `report_session_performance` | Date-time / Class / Capacity / Confirmed / Revenue / Cost |
| `report_session_drilldown` | Session inventory + Gross Contribution |

Definitions:

- Gross sales = `customerPrice` of `CONFIRMED` + `CHECKED_IN` (not held, not waitlisted).
- Refunds = `refunds.amount` where `status = REFUNDED`.
- Coach cost = sum of **assignment snapshots** `session_coaches.coachRate`, never current `coaches.defaultRate`. `PER_HOUR` rates multiply session duration in hours; each cost rounds to two decimal places.
- Coach filters match any assigned coach without duplicating class/session revenue. Coach-cost rows show only the selected coach when filtered.
- Related revenue is the full session revenue for each assigned coach and is **not additive across coaches**.
- Occupancy = confirmed / capacity; attendance utilisation = checked_in / capacity.
- No field named `profit`.

Dashboard tiles (BE-054) are a separate narrow read — see [dashboard-metrics.md](./dashboard-metrics.md). Gross-sales series uses payment `VERIFIED` / `CASH_RECEIVED` to match `countsTowardGrossSales()`.

#298: these functions stay revoked from `anon` / `authenticated`. A JWT caller must hold `reports.sales.read`, `reports.capacity.read` (`report_class_performance_v2`), `reports.coach_costs.read`, or `reports.session.read`. Service-role / Prisma (`auth.uid()` null) is not a Data API grant — #292 still authorizes before invoke. #293 zeros sales/cost columns on class/session RPCs for JWT callers who lack `reports.sales.read` / `reports.coach_costs.read`.
