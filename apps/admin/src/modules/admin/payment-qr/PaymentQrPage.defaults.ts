import type { PaymentQrCode } from "@balanse/domain";
import type { PaymentQrPageProps } from "./PaymentQrPage.schema";

export const paymentQrPageDefaultValues: PaymentQrPageProps = {
  empty: false,
};

export const paymentQrOneDemo: PaymentQrCode[] = [
  {
    id: "pqr-main",
    label: "GCash — main",
    imageKey: "pending:gcash-main",
    isActive: true,
    createdAt: "2026-09-16T02:50:00.000Z",
    updatedAt: "2026-09-16T02:50:00.000Z",
    archivedAt: null,
  },
];

export const paymentQrMultiDemo: PaymentQrCode[] = [
  ...paymentQrOneDemo,
  {
    id: "pqr-bank",
    label: "InstaPay — studio",
    imageKey: "pending:instapay",
    isActive: false,
    createdAt: "2026-09-16T02:50:00.000Z",
    updatedAt: "2026-09-16T02:50:00.000Z",
    archivedAt: null,
  },
];
