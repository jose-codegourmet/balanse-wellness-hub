import type { HTMLAttributes, ReactNode } from "react";

export interface OrderConfirmationDetail {
  label: string;
  value: string;
  emphasize?: boolean;
}

export interface OrderConfirmationCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: string;
  orderId?: string;
  paymentMethod?: string;
  dateTime?: string;
  totalAmount?: string;
  orderIdLabel?: string;
  paymentMethodLabel?: string;
  dateTimeLabel?: string;
  totalLabel?: string;
  details?: OrderConfirmationDetail[];
  buttonText?: string;
  accountHref?: string;
  onGoToAccount?: () => void;
  icon?: ReactNode;
}
