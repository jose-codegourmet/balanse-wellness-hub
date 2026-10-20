import { z } from "zod";

/** Submission fields only; policy acknowledgements remain rendered as their legal documents. */
export const bookingFormSchema = z.object({
  entitlementId: z.string(),
  /** #380 — required only when the session refuses cancellation or reschedule requests. */
  acknowledgeChangeRules: z.boolean(),
});
export type BookingFormValues = z.infer<typeof bookingFormSchema>;

/** The acknowledgement is mandatory when a change rule is off; otherwise the box is not shown. */
export function makeBookingFormSchema(options: { requireChangeAcknowledgement: boolean }) {
  return bookingFormSchema.superRefine((values, ctx) => {
    if (options.requireChangeAcknowledgement && !values.acknowledgeChangeRules) {
      ctx.addIssue({
        code: "custom",
        path: ["acknowledgeChangeRules"],
        message: "Confirm that you understand this session's change rules.",
      });
    }
  });
}
