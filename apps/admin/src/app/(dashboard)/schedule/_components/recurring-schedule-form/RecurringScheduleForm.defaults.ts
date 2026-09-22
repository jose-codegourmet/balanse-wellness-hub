import { type AdminSession, addCalendarDays, manilaYmd, weekdayForYmd } from "@balanse/domain";
import type { RecurringScheduleFormValues } from "./RecurringScheduleForm.schema";

export function recurringScheduleFormDefaultValues(
  session: AdminSession,
): RecurringScheduleFormValues {
  const startsOn = manilaYmd(session.startsAt);
  return {
    startsOn,
    endsOn: addCalendarDays(startsOn, 28),
    weekdays: [String(weekdayForYmd(startsOn))],
    publish: false,
  };
}
