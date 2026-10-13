import { z } from "zod";

/** Submission fields only; policy acknowledgements remain rendered as their legal documents. */
export const bookingFormSchema = z.object({ entitlementId: z.string() });
export type BookingFormValues = z.infer<typeof bookingFormSchema>;
