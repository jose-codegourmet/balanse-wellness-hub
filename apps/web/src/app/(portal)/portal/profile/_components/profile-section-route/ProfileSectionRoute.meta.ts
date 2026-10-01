/** Deep-linked profile route loader contract. */
export const profileSectionRouteMeta = {
  purpose:
    "Load the selected mock customer (plus onboarding answers for About you) and render the active profile section with the self-service server actions.",
  whenToUse: "Use for the portal profile route pages.",
  whenNotToUse: "Do not use for reusable profile panels.",
} as const;
