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
- Coach cost = **session snapshot** `coachRate`, never `coaches.defaultRate`.
- Occupancy = confirmed / capacity; attendance utilisation = checked_in / capacity.
- No field named `profit`.
