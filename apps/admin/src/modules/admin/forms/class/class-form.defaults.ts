import type { ClassFormValues } from "./class-form.schema";

export const classFormDefaultValues: ClassFormValues = {
  name: "",
  shortDescription: "",
  defaultDurationMinutes: null,
  defaultPricePhp: null,
  active: true,
  associatedCoachIds: [],
};
