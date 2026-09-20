import { FIELD_CONSTRAINTS } from "@balanse/domain";
import { z } from "zod";
import { nullableInt } from "../nullable-int";

export const classFormSchema = z.object({
  name: z.string().trim().min(1).max(FIELD_CONSTRAINTS.class.name.max),
  shortDescription: z.string().trim().min(1).max(FIELD_CONSTRAINTS.class.shortDescription.max),
  defaultDurationMinutes: nullableInt(
    FIELD_CONSTRAINTS.class.defaultDurationMinutes.min,
    FIELD_CONSTRAINTS.class.defaultDurationMinutes.max,
  ),
  /** Mock field name. Integer pesos — not `defaultCustomerPrice` / `php_decimal`. */
  defaultPricePhp: nullableInt(FIELD_CONSTRAINTS.class.defaultCustomerPrice.min),
  active: z.boolean(),
  associatedCoachIds: z.array(z.string().min(1)).default([]),
});

export type ClassFormValues = z.infer<typeof classFormSchema>;
