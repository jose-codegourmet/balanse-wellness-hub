import type { CoachFormValues, CoachPublicFormValues } from "./coach-form.schema";

/**
 * `defaultRatePhp` is 0 on create.
 * Do not resurrect the hardcoded 650 that used to live in CoachFormPage.
 */
export const coachFormDefaultValues: CoachFormValues = {
  name: "",
  specialties: [],
  shortBio: "",
  photoKey: null,
  active: true,
  defaultRatePhp: 0,
  rateType: "PER_SESSION",
};

export const coachPublicFormDefaultValues: CoachPublicFormValues = {
  name: "",
  specialties: [],
  shortBio: "",
  photoKey: null,
  active: true,
};
