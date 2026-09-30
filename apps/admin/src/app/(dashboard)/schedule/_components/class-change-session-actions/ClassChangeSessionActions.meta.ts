export const classChangeSessionActionsMeta = {
  purpose:
    "Schedule panel block. Assigned coaches without cancel rights get Reschedule / Find a substitute / Request cancellation (or their pending request's status). Reviewers see a notice when the class has a request waiting.",
  whenToUse: "Use inside SelectedSessionPanel's session detail.",
  whenNotToUse: "Do not use as the approval UI — link to /schedule/requests.",
} as const;
