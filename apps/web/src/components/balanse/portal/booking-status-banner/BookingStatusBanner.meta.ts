import type { CustomerBooking } from "@balanse/domain";

/** High-visibility booking state for tickets, list cards, and booking summaries.
 * Always leads with the booking state; refund state is secondary, never a replacement.
 * Compact fits list/summary cards. Full size is the confirmation ticket's top band.
 * Uses brand-only champagne, cream, and muted-brown surfaces with serif status type.
 * Confirmed has a double-ring seal; closed has a square seal; pending has a dashed seal.
 * Labels are canonical domain copy; color, icon, and explanation reinforce the label.
 * This displays state only and must not infer confirmation from payment or requests.
 */
export type BookingStatusBannerProps = {
  booking: CustomerBooking;
  compact?: boolean;
};
