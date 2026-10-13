/**
 * Admin schedule workspace: month/week/day calendar and selected-day details.
 * Reads staff-scoped sessions through the admin query layer; permissions govern
 * schedule actions and all/mine scope. Not a customer booking calendar.
 *
 * Initial navigation uses the real Asia/Manila day. Today reads the clock again
 * when clicked, including after a tab was left open overnight. Storybook alone
 * substitutes the frozen mock clock. selectedDay/view props are preview controls;
 * navigation does not automatically open or change the detail panel. A day click
 * opens its timeline; a session click opens only that session’s details.
 */
export const scheduleListPageMeta = {
  purpose: "Staff schedule navigation and session management.",
} as const;
