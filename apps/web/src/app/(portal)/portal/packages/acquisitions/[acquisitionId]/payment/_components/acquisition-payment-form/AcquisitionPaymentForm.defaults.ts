import type { AcquisitionPaymentFormValues } from "./AcquisitionPaymentForm.schema";

export const acquisitionPaymentFormDefaultValues: Pick<AcquisitionPaymentFormValues, "method"> = {
  method: "GCASH",
};
