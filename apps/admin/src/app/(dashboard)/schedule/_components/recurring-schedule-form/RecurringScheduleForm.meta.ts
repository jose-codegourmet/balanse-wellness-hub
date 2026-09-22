export type RecurringScheduleFormProps = {
  sessionId: string;
};

export const recurringScheduleFormMeta = {
  purpose: "Turns an existing session into a weekly recurrence template over a bounded range.",
  useWhen: "One session should repeat on one or more weekdays with the same operational details.",
  avoidWhen: "An entire existing week or month should be copied; use DuplicateScheduleForm.",
} as const;
