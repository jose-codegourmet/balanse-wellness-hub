"use client";

import type { PolicyDocumentVersion } from "@balanse/domain";
import { Button } from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import {
  PolicyAcceptance,
  usePolicyAcceptance,
} from "@/components/balanse/policy-acceptance/PolicyAcceptance";
import { useClaimPackage, useRequestPackage } from "@/lib/query/mutations/packages";
import { formPoliciesQuery, useAcceptPolicies } from "@/lib/query/policies";
import { notify } from "@/modules/notifications/notify";
import { packageRequestFormDefaultValues } from "./PackageRequestForm.defaults";
import {
  type PackageRequestFormValues,
  packageRequestFormSchema,
} from "./PackageRequestForm.schema";

export function PackageRequestForm({
  customerId,
  bundleId,
  free,
  actionLabel,
}: {
  customerId: string;
  bundleId: string;
  free: boolean;
  actionLabel: string;
}) {
  const router = useRouter();
  const form = useForm<PackageRequestFormValues>({
    resolver: zodResolver(packageRequestFormSchema),
    defaultValues: packageRequestFormDefaultValues,
  });
  const idempotencyKey = useRef(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${bundleId}:${Date.now()}`,
  );
  const claim = useClaimPackage(customerId);
  const request = useRequestPackage(customerId);
  const acceptPolicies = useAcceptPolicies(customerId);
  const policiesQuery = useQuery(formPoliciesQuery("package_request"));
  const policies: PolicyDocumentVersion[] = (policiesQuery.data ?? []).map((item) => ({
    id: item.id,
    documentName: item.documentName,
    version: item.version,
    promotedAt: "",
    current: true,
    body: item.body,
  }));
  const policyAcceptance = usePolicyAcceptance(policies);
  const pending = claim.isPending || request.isPending;

  return (
    <form
      className="mt-7"
      onSubmit={form.handleSubmit(async () => {
        if (!policyAcceptance.check()) return;
        try {
          const result = free
            ? await claim.mutateAsync({ bundleId, idempotencyKey: idempotencyKey.current })
            : await request.mutateAsync({ bundleId, idempotencyKey: idempotencyKey.current });
          notify.portal(free ? "package.claimed" : "package.requested");
          const acquisition = "acquisition" in result ? result.acquisition : null;
          if (policies.length > 0) {
            await acceptPolicies.mutateAsync({
              form: "package_request",
              policyVersionIds: policies.map((p) => p.id),
              acquisitionId: acquisition?.id,
            });
          }
          router.push(
            free || !acquisition
              ? "/portal/packages"
              : `/portal/packages/acquisitions/${acquisition.id}/payment`,
          );
        } catch {
          notify.portal("package.action-failed");
        }
      })}
    >
      <label className="flex gap-2 text-xs leading-5 text-primary-foreground/76">
        <input type="checkbox" className="mt-1" {...form.register("acknowledge")} />I understand
        that package sessions remain subject to class availability and studio confirmation.
      </label>
      {form.formState.errors.acknowledge ? (
        <p className="mt-2 text-xs text-red-200">{form.formState.errors.acknowledge.message}</p>
      ) : null}
      <PolicyAcceptance {...policyAcceptance.props} tone="inverse" />
      <Button variant="accent" size="lg" className="mt-4 w-full" disabled={pending} type="submit">
        {pending ? "Preparing your package" : actionLabel}
        <ArrowUpRight aria-hidden className="size-4" />
      </Button>
    </form>
  );
}
