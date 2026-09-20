import type { CoachFormValues } from "./coach-form.schema";

/** `defaultRatePhp` is 0 — do not resurrect the hardcoded 650 from CoachFormPage. */
export const coachFormDefaultValues: CoachFormValues = {
  name: "",
  specialties: [],
  shortBio: "",
  photoKey: null,
  active: true,
  defaultRatePhp: 0,
  rateType: "PER_SESSION",
};
