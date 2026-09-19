import type { OrderConfirmationCardProps } from "./OrderConfirmationCard.types";

export const orderConfirmationCardMocks = {
  default: {
    title: "Your order has been successfully submitted",
    orderId: "57625869",
    paymentMethod: "Apple Pay",
    dateTime: "01/02/24 23:46",
    totalAmount: "$ 129",
    orderIdLabel: "Order ID",
    paymentMethodLabel: "Payment Method",
    dateTimeLabel: "Date & Time",
    totalLabel: "Total",
    buttonText: "Go to my account",
    accountHref: "#account",
  },
  alternate: {
    title: "Your order has been successfully submitted",
    orderId: "88241017",
    paymentMethod: "Visa 4418",
    dateTime: "15/09/26 18:12",
    totalAmount: "$ 594",
    orderIdLabel: "Order ID",
    paymentMethodLabel: "Payment Method",
    dateTimeLabel: "Date & Time",
    totalLabel: "Total",
    buttonText: "Go to my account",
    accountHref: "#account",
  },
} satisfies Record<"default" | "alternate", OrderConfirmationCardProps>;
