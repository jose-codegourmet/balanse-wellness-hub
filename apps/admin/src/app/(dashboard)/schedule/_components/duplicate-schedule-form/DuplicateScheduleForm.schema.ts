import { calendarDayDistance, isManilaYmd } from "@balanse/domain";
import { z } from "zod";

export const duplicateScheduleFormSchema = z
  .object({
    sourceStart: z.string().refine(isManilaYmd, "Choose a valid start date."),
    sourceEnd: z.string().refine(isManilaYmd, "Choose a valid end date."),
    targetStart: z.string().refine(isManilaYmd, "Choose a valid target date."),
    publish: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!isManilaYmd(values.sourceStart) || !isManilaYmd(values.sourceEnd)) return;
    const sourceDays = calendarDayDistance(values.sourceStart, values.sourceEnd);
    if (sourceDays < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceEnd"],
        message: "End must be on or after start.",
      });
    } else if (sourceDays > 62) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceEnd"],
        message: "Copy at most 63 days at a time.",
      });
    }
  });

export type DuplicateScheduleFormValues = z.infer<typeof duplicateScheduleFormSchema>;
