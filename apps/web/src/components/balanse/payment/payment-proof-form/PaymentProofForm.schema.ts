import { SIGNED_UPLOAD } from "@balanse/domain";
import { z } from "zod";

/** Matches the booking and package payment-proof endpoints (jpeg/png/webp/heic, 5 MiB). */
export const PAYMENT_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"] as const;
export const PAYMENT_PROOF_ACCEPT = PAYMENT_PROOF_TYPES.join(",");
export const PAYMENT_PROOF_MAX_BYTES = SIGNED_UPLOAD.maxBytes;

const isFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

export const paymentProofFormSchema = z.object({
  proof: z
    .custom<File | null>((value) => value === null || isFile(value))
    .refine((value): value is File => isFile(value), "Add a screenshot of your GCash receipt.")
    .refine(
      (value) => !isFile(value) || (PAYMENT_PROOF_TYPES as readonly string[]).includes(value.type),
      "Use a JPG, PNG, WEBP, or HEIC image.",
    )
    .refine(
      (value) => !isFile(value) || value.size <= PAYMENT_PROOF_MAX_BYTES,
      "That image is over 5 MB. Try a smaller screenshot.",
    ),
});

export type PaymentProofFormValues = z.input<typeof paymentProofFormSchema>;
