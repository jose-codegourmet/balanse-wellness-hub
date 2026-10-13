"use client";

import type { HttpBundleAcquisition, PolicyDocumentVersion } from "@balanse/domain";
import { Button } from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  PolicyAcceptance,
  usePolicyAcceptance,
} from "@/components/balanse/policy-acceptance/PolicyAcceptance";
import {
  useAcquisitionPaymentMethod,
  useSubmitAcquisitionProof,
} from "@/lib/query/mutations/packages";
import { useAcceptPolicies } from "@/lib/query/policies";
import { notify } from "@/modules/notifications/notify";
import { acquisitionPaymentFormDefaultValues } from "./AcquisitionPaymentForm.defaults";
import {
  type AcquisitionPaymentFormValues,
  acquisitionPaymentFormSchema,
} from "./AcquisitionPaymentForm.schema";

export function AcquisitionPaymentForm({
  customerId,
  acquisition,
  policies = [],
}: {
  customerId: string;
  acquisition: HttpBundleAcquisition;
  /** Current versions of the policies admin attached to payment proof upload. */
  policies?: PolicyDocumentVersion[];
}) {
  const router = useRouter();
  const form = useForm<AcquisitionPaymentFormValues>({
    resolver: zodResolver(acquisitionPaymentFormSchema),
    defaultValues: {
      ...acquisitionPaymentFormDefaultValues,
      method: acquisition.payment?.method ?? "GCASH",
    },
  });
  const method = form.watch("method");
  const setMethod = useAcquisitionPaymentMethod(customerId, acquisition.id);
  const submitProof = useSubmitAcquisitionProof(customerId, acquisition.id);
  const acceptPolicies = useAcceptPolicies(customerId);
  const policyAcceptance = usePolicyAcceptance(policies);
  const pending = setMethod.isPending || submitProof.isPending;

  return (
    <form
      className="mt-8 grid gap-5 rounded-[1.5rem] border border-border bg-card p-6"
      onSubmit={form.handleSubmit(async (values) => {
        if (values.method === "GCASH" && !policyAcceptance.check()) return;
        try {
          await setMethod.mutateAsync(values.method);
          if (values.method === "GCASH") {
            const proof = values.proof?.item(0);
            if (!proof) {
              form.setError("proof", { message: "Choose your payment proof." });
              return;
            }
            await submitProof.mutateAsync(proof);
            if (policies.length > 0) {
              await acceptPolicies.mutateAsync({
                form: "payment_proof",
                policyVersionIds: policies.map((p) => p.id),
                acquisitionId: acquisition.id,
              });
            }
          }
          notify.portal("payment.proof-submitted");
          router.push("/portal/packages");
        } catch {
          notify.portal("payment.proof-failed");
        }
      })}
    >
      <fieldset className="grid gap-3">
        <legend className="font-medium">How will you pay?</legend>
        <label className="flex gap-3 rounded-xl border border-border p-4">
          <input type="radio" value="GCASH" {...form.register("method")} />
          <span>
            <strong>GCash</strong>
            <span className="mt-1 block text-sm text-muted-foreground">
              Upload your transfer screenshot for studio review.
            </span>
          </span>
        </label>
        <label className="flex gap-3 rounded-xl border border-border p-4">
          <input type="radio" value="PAY_AT_COUNTER" {...form.register("method")} />
          <span>
            <strong>Pay at the counter</strong>
            <span className="mt-1 block text-sm text-muted-foreground">
              The studio will record payment before activating your sessions.
            </span>
          </span>
        </label>
      </fieldset>
      {method === "GCASH" ? (
        <PolicyAcceptance {...policyAcceptance.props} title="Accept before uploading" />
      ) : null}
      {method === "GCASH" ? (
        <label className="grid gap-2 text-sm font-medium">
          Payment proof
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            {...form.register("proof")}
          />
          {form.formState.errors.proof ? (
            <span className="text-destructive">{form.formState.errors.proof.message}</span>
          ) : null}
        </label>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : method === "GCASH" ? "Submit proof" : "Confirm payment method"}
      </Button>
    </form>
  );
}
