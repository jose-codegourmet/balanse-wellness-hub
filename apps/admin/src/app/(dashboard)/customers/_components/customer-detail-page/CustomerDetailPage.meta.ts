/**
 * # CustomerDetailPage
 *
 * Staff record for one customer at `/customers/[customerId]`.
 *
 * - Header: `UserAvatar` (`xl`), full name, "Goes by <nickname>", an
 *   onboarding status badge, and "Hidden on public roster" when the customer
 *   opted out (#353). Stats: upcoming, pending, total bookings, last visit.
 * - Activity tabs: upcoming, pending, history, requests, attendance, payments.
 * - Aside: Profile (contact), About (`CustomerAboutCard` — goals, experience,
 *   interests linked to admin class pages, Other texts, heard-from; empty
 *   state "Hasn't completed onboarding yet"), Referral
 *   (`CustomerReferralCard`), Packages (with `/bundles` access), and
 *   accepted policies.
 *
 * Data: `adminCustomerDetailQuery`. The adapter returns `onboarding` and
 * `referral` only for `customers.read`; components render what they get.
 * Staff cannot edit nickname, avatar, or answers.
 */
export type CustomerDetailPageProps = {
  customerId: string;
};
