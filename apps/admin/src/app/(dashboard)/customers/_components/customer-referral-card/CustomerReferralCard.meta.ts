/**
 * # CustomerReferralCard (#353, epic #343)
 *
 * Referral context on `/customers/[customerId]`:
 *
 * - "Referred by <name>" linking to that customer, with the channel label
 *   (Customer link / Customer QR / Studio link / Studio QR); a studio
 *   channel without a referrer reads "Joined through <channel>".
 * - "Not referred" when the customer arrived without a shared link.
 * - "Referred N people" with each name linking to their detail page.
 *
 * Requires `customers.read`; the adapter only returns `referral` on the
 * customer detail for staff who may read customers. Renders what it receives.
 *
 * ## When not to use
 *
 * - Coach Students (coaches never see referral data).
 * - Aggregate sharing numbers (`/marketing-insights`).
 */
import type { CustomerReferralSummary } from "@balanse/domain";

export type CustomerReferralCardProps = {
  referral: CustomerReferralSummary;
  /** Link target for a customer id. Default `/customers/:id`. */
  customerHref?: (customerId: string) => string;
  className?: string;
};
