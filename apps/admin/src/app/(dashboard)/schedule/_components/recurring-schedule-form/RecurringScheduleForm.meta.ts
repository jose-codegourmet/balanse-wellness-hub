export type RecurringScheduleFormProps = {
  sessionId: string;
};

export const recurringScheduleFormMeta = {
  purpose:
    "Repeats an existing session weekly over a bounded range, with a calendar preview of every date, skipped duplicates, and coach or venue clashes.",
  useWhen:
    "An existing one-off session should become a weekly slot. New sessions can repeat straight from the session form instead.",
  avoidWhen: "An entire existing week or month should be copied; use DuplicateScheduleForm.",
} as const;
