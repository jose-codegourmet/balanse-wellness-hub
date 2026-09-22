import { addCalendarDays } from "@balanse/domain";
import type { DuplicateScheduleFormValues } from "./DuplicateScheduleForm.schema";

export function duplicateScheduleFormDefaultValues(todayYmd: string): DuplicateScheduleFormValues {
  return {
    sourceStart: todayYmd,
    sourceEnd: addCalendarDays(todayYmd, 6),
    targetStart: addCalendarDays(todayYmd, 7),
    publish: false,
  };
}
