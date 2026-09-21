import { coachPhotoKey } from "@balanse/domain";
import type { CoachOptionCoach, CoachOptionProps } from "./CoachOption.meta";

export const coachOptionRex: CoachOptionCoach = {
  id: "coach-rex",
  name: "Rex Francis Regis",
  photoKey: coachPhotoKey("rex-francis-regis"),
  specialties: ["Calisthenics", "Mat Pilates", "Caliyoga"],
  active: true,
};

export const coachOptionAlec: CoachOptionCoach = {
  id: "coach-alec",
  name: "Alec James Co",
  photoKey: null,
  specialties: ["Calisthenics", "Circuit Training"],
  active: true,
};

export const coachOptionSofia: CoachOptionCoach = {
  id: "coach-sofia",
  name: "Sofia Ocampo",
  photoKey: null,
  specialties: ["Mat Pilates"],
  active: true,
};

export const coachOptionKate: CoachOptionCoach = {
  id: "coach-kate",
  name: "Kate Go",
  photoKey: null,
  specialties: ["Yoga"],
  active: true,
};

export const coachOptionInactive: CoachOptionCoach = {
  id: "coach-inactive",
  name: "Guest Faculty",
  photoKey: coachPhotoKey("wolf"),
  specialties: ["Yoga"],
  active: false,
};

export const coachOptionDefaultValues: CoachOptionProps = {
  coach: coachOptionRex,
  layout: "avatar",
};
