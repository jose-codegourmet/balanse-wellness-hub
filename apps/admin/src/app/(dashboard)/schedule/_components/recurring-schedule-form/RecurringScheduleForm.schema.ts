import { calendarDayDistance, isManilaYmd, WEEKDAYS } from "@balanse/domain";
import { z } from "zod";

const weekdayValues = WEEKDAYS.map((day) => String(day.value)) as [string, ...string[]];

export const recurringScheduleFormSchema = z
  .object({
    startsOn: z.string().refine(isManilaYmd, "Choose a valid start date."),
    endsOn: z.string().refine(isManilaYmd, "Choose a valid end date."),
    weekdays: z.array(z.enum(weekdayValues)).min(1, "Choose at least one weekday."),
    publish: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!isManilaYmd(values.startsOn) || !isManilaYmd(values.endsOn)) return;
    const days = calendarDayDistance(values.startsOn, values.endsOn);
    if (days < 0) {
      ctx.addIssue({ code: "custom", path: ["endsOn"], message: "End must be on or after start." });
    } else if (days > 366) {
      ctx.addIssue({
        code: "custom",
        path: ["endsOn"],
        message: "Create at most one year at a time.",
      });
    }
  });

export type RecurringScheduleFormValues = z.infer<typeof recurringScheduleFormSchema>;
