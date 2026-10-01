/**
 * # CustomerListPage
 *
 * Staff customer directory at `/customers` (`customers.read`). Stat tiles
 * (total, with upcoming, active recently, never visited) filter the
 * `AdminDataTable` through URL state.
 *
 * Columns: Name (`UserAvatar` + full name, nickname as a muted subtitle, an
 * eye-off mark when the customer is hidden on the public roster), Email,
 * Phone, Upcoming, Onboarding (faceted filter: Completed / In progress /
 * Skipped / Not started), Last Visit. Search matches name, nickname, email
 * and phone (#353).
 *
 * Data: `adminCustomersQuery` through the admin query layer. Staff cannot
 * edit a customer's nickname, avatar, or answers here.
 *
 * ## When not to use
 *
 * - Coach-scoped student lists (`/students`).
 * - Aggregate sign-up reporting (`/marketing-insights`).
 */
export type CustomerListPageProps = {
  empty?: boolean;
  loading?: boolean;
  error?: boolean;
  focusCustomerId?: string;
};
