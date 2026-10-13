import { AcquisitionPaymentForm } from "./AcquisitionPaymentForm";

export default {
  title: "Portal/Packages/AcquisitionPaymentForm",
  component: AcquisitionPaymentForm,
};

export const Default = {
  args: {
    customerId: "story-customer",
    acquisition: {
      id: "acq",
      bundleId: "bundle",
      profileId: "story-customer",
      kind: "CUSTOMER_PAID",
      status: "PENDING_PAYMENT",
      idempotencyKey: "key",
      overrideLimit: false,
      overrideReason: null,
      adminNote: null,
      rejectionNote: null,
      createdAt: "2026-10-03T00:00:00.000Z",
      reviewedAt: null,
      payment: null,
      entitlementId: null,
    },
  },
};
