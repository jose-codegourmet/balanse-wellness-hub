export type CoachOptionCoach = {
  id: string;
  name: string;
  photoKey: string | null;
  specialties?: readonly string[];
  active?: boolean;
};

export type CoachOptionLayout = "avatar" | "row";

export type CoachOptionProps = {
  coach: CoachOptionCoach;
  /** `avatar` is the `leading` node for rich options. `row` is the selected-state / panel line. */
  layout?: CoachOptionLayout;
  className?: string;
};
