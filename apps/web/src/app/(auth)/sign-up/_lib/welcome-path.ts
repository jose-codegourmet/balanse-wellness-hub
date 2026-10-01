/** Onboarding runs right after sign-up and then returns to `returnTo` (#352). */
export function welcomePathFor(returnTo: string): string {
  return `/portal/welcome?returnTo=${encodeURIComponent(returnTo)}`;
}
