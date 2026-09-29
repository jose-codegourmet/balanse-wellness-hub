import { FIELD_CONSTRAINTS, VENUE_KINDS } from "@balanse/domain";
import { z } from "zod";

const limits = FIELD_CONSTRAINTS.venue;

export const venueFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name the venue.")
    .max(limits.name.max, `Use ${limits.name.max} characters or fewer.`),
  kind: z.enum(VENUE_KINDS),
  address: z
    .string()
    .trim()
    .max(limits.address.max, `Use ${limits.address.max} characters or fewer.`),
  notes: z.string().trim().max(limits.notes.max, `Use ${limits.notes.max} characters or fewer.`),
  active: z.boolean(),
});

export type VenueFormValues = z.infer<typeof venueFormSchema>;
