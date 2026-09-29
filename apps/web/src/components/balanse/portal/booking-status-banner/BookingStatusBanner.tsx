import { type BookingStatus, bookingStatusLabel, refundStatusLabel } from "@balanse/domain";
import {
  Ban,
  Check,
  CircleCheck,
  Clock3,
  Hourglass,
  RefreshCw,
  Undo2,
  UserCheck,
  Wallet,
  X,
} from "lucide-react";
import type { BookingStatusBannerProps } from "./BookingStatusBanner.meta";
import "./booking-status-banner.css";

const PRESENTATION = {
  CONFIRMED: {
    tone: "confirmed",
    icon: Check,
    message: "Your place is confirmed. Show your booking reference at the front desk.",
  },
  CHECKED_IN: {
    tone: "confirmed",
    icon: UserCheck,
    message: "You’re checked in. Enjoy your class.",
  },
  COMPLETED: {
    tone: "history",
    icon: CircleCheck,
    message: "This class is complete. Thanks for moving with us.",
  },
  CANCELLED: {
    tone: "cancelled",
    icon: X,
    message: "This booking is cancelled. It cannot be used to attend the class.",
  },
  REJECTED: {
    tone: "cancelled",
    icon: Ban,
    message: "The studio did not confirm this booking. You do not have a confirmed place.",
  },
  EXPIRED: {
    tone: "cancelled",
    icon: Clock3,
    message: "Your reservation has expired. Book again to reserve a place.",
  },
  NO_SHOW: { tone: "history", icon: Ban, message: "This booking was marked as a no-show." },
  HELD_AWAITING_PAYMENT: {
    tone: "pending",
    icon: Wallet,
    message: "Your place is reserved, but not confirmed. Complete payment before the hold expires.",
  },
  PAYMENT_SUBMITTED: {
    tone: "pending",
    icon: Hourglass,
    message: "Your payment is being reviewed. Your booking is not confirmed yet.",
  },
  WAITLISTED: {
    tone: "waiting",
    icon: Clock3,
    message: "You’re waiting for a place. No spot is held and no payment is due.",
  },
  CANCELLATION_REQUESTED: {
    tone: "pending",
    icon: Undo2,
    message: "Not cancelled yet. Your slot stays held while the studio reviews your request.",
  },
  RESCHEDULE_REQUESTED: {
    tone: "pending",
    icon: RefreshCw,
    message: "Your time has not changed yet. The original slot stays held during review.",
  },
} satisfies Record<BookingStatus, { tone: string; icon: typeof Check; message: string }>;

export function BookingStatusBanner({ booking, compact = false }: BookingStatusBannerProps) {
  const state = PRESENTATION[booking.status];
  const Icon = state.icon;
  const refund = booking.refundStatus ? refundStatusLabel(booking.refundStatus) : "";
  return (
    <div
      className="booking-status-banner"
      data-tone={state.tone}
      data-compact={compact || undefined}
    >
      <span className="booking-status-symbol" aria-hidden="true">
        <Icon strokeWidth={1.5} />
      </span>
      <div className="booking-status-copy">
        {!compact && <p className="booking-status-eyebrow">Booking status</p>}
        <p className="booking-status-label">{bookingStatusLabel(booking.status)}</p>
        <p className="booking-status-message">{state.message}</p>
        {refund && <p className="booking-status-refund">{refund}</p>}
      </div>
    </div>
  );
}
