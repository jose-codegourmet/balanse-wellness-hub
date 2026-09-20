import type { SessionFormValues } from "./session-form.schema";

export const sessionFormDefaultValues: SessionFormValues = {
  classId: "",
  coachId: "",
  startsAt: "",
  endsAt: "",
  pricePhp: 0,
  capacity: 1,
  bookable: true,
  status: "DRAFT",
  coachRatePhp: 0,
  coachRateType: "PER_SESSION",
};
