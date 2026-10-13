export const cancellationQueuePageMeta = {
  purpose:
    "Review customer cancellation requests and record manual refund status in the admin operations queue.",
  whenToUse:
    "Use on /cancellations. Each row is a cancellation request with its own id, booking reference, and optional payment/refund ids.",
  whenNotToUse: "Do not use for class cancellation requests or the customer's booking history.",
  data: "The admin cancellation API supplies queue rows; Storybook projects mock bookings into the same response shape.",
} as const;
