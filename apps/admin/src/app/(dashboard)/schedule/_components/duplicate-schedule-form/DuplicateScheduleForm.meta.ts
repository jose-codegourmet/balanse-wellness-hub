export type DuplicateScheduleFormProps = {
  sourceStart?: string;
  sourceEnd?: string;
};

export const duplicateScheduleFormMeta = {
  purpose: "Copies non-cancelled sessions from one inclusive date range to a new start date.",
  useWhen: "An admin wants to reuse an existing week or month without re-entering sessions.",
  avoidWhen: "A single session should repeat on selected weekdays; use RecurringScheduleForm.",
} as const;
