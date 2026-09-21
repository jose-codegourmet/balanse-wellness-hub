import type { PaymentQrCode } from "@balanse/domain";

export type PaymentQrPageProps = {
  empty?: boolean;
  items?: PaymentQrCode[];
};
