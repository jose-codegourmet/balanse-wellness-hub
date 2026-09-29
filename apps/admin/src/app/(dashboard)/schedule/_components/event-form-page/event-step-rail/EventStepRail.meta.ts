export const eventStepRailMeta = {
  purpose:
    "Step navigation for the event composer: a vertical rail with per-step status on desktop, and a compact 'Step n of m' header with a segmented progress bar below lg.",
  whenToUse:
    "Use inside EventFormPage. The page decides each step's status (locked until reached on create, free on edit) and handles validation before moving.",
  whenNotToUse:
    "Do not use for class or session forms; those keep AdminWizard. Do not put form fields inside the rail.",
} as const;

export type EventStepStatus = "current" | "complete" | "error" | "upcoming" | "locked";

export type EventStepRailItem = {
  id: string;
  title: string;
  hint: string;
  status: EventStepStatus;
};

export type EventStepRailProps = {
  steps: readonly EventStepRailItem[];
  onSelect: (stepId: string) => void;
  className?: string;
};
