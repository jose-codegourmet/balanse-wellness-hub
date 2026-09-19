import type { HTMLAttributes } from "react";

export interface TicketConfirmationCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  heading?: string;
  description?: string;
  ticketIdLabel?: string;
  ticketId?: string;
  amountLabel?: string;
  amount?: string;
  dateTimeLabel?: string;
  dateTime?: string;
  cardHolder?: string;
  last4Digits?: string;
  barcodeValue?: string;
  showBarcode?: boolean;
  showConfetti?: boolean;
}
