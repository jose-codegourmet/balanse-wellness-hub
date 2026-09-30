import {
  CLASS_CHANGE_REASON_MAX,
  CLASS_CHANGE_REASON_MIN,
  CLASS_CHANGE_REQUEST_KINDS,
  isManilaYmd,
} from "@balanse/domain";
import { z } from "zod";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Coach class change request (#337). Reschedule needs a new date + start time;
 * substitute needs a coach. Cancel needs only the reason.
 */
export const classChangeFormSchema = z
  .object({
    kind: z.enum(CLASS_CHANGE_REQUEST_KINDS),
    reason: z
      .string()
      .trim()
      .min(CLASS_CHANGE_REASON_MIN, "Tell the studio a little more about why.")
      .max(CLASS_CHANGE_REASON_MAX),
    proposedDate: z.string(),
    proposedTime: z.string(),
    substituteCoachId: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.kind === "RESCHEDULE") {
      if (!isManilaYmd(values.proposedDate))
        ctx.addIssue({ code: "custom", path: ["proposedDate"], message: "Choose the new date." });
      if (!HHMM.test(values.proposedTime))
        ctx.addIssue({
          code: "custom",
          path: ["proposedTime"],
          message: "Choose the new start time.",
        });
    }
    if (values.kind === "SUBSTITUTE" && !values.substituteCoachId)
      ctx.addIssue({
        code: "custom",
        path: ["substituteCoachId"],
        message: "Choose the coach who will teach instead.",
      });
  });

export type ClassChangeFormValues = z.infer<typeof classChangeFormSchema>;
