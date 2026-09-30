# Admin Portal — Coach My Students

```text
MY STUDENTS
[Upcoming] [Existing]

Student             Next / last class       Attended  Contribution
Ana Reyes           Flow · 16 Sep, 9:30am   4         ₱2,400

STUDENT DETAIL
Sessions attended   Contribution             Next booking
4                   ₱2,400                  Flow · 16 Sep, 9:30am

Upcoming classes
Attendance history
```

Routes: `/students` and `/students/[customerId]`.

This is a built-in **Coach** role workspace, shown in the Operations navigation
after Schedule. It is unavailable to Super Admin, Front Desk, and custom roles
even if a staff record has a linked coach profile. The data path always derives
the signed-in Coach's linked coach id at the mock adapter boundary; client code
does not supply an arbitrary coach id.

The list has two segments:

- **Upcoming** — each student with at least one future, active booking in the
  signed-in coach's sessions.
- **Existing** — each student with a recorded `CHECKED_IN` or `COMPLETED`
  booking in those sessions.

Student detail exposes only the coach's own session records. **Contribution**
is a mock attribution of verified/cash bookings and consumed-package class
value in those sessions. It must not be called studio sales, coach pay, or
profit. This phase is React Query + `MockDataAdapter` only; no API or database
aggregate is wired.
