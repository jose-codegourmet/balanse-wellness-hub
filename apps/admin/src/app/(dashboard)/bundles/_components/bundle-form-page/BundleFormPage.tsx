"use client";

import { BUNDLE_STATUSES, bundleStatusLabel } from "@balanse/domain";
import { FormPageSkeleton } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useUpsertAdminBundle } from "@/lib/query/mutations";
import { adminBundlesQuery, adminClassesQuery } from "@/lib/query/queries";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
} from "@/modules/admin/forms/admin-form/AdminForm";
import {
  CheckboxGroupBinding,
  ChoiceBinding,
  RichTextBinding,
  TextareaBinding,
  TextBinding,
} from "@/modules/admin/forms/bindings";
import {
  bundleFormDefaultValues,
  bundleFormValuesFrom,
} from "@/modules/admin/forms/bundle/bundle-form.defaults";
import {
  type BundleFormValues,
  bundleFormSchema,
} from "@/modules/admin/forms/bundle/bundle-form.schema";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export function BundleFormPage({ bundleId }: { bundleId: string }) {
  const isNew = bundleId === "new";
  const router = useRouter();
  const { principal } = useMockPrincipal();
  const bundlesQuery = useSuspenseQuery(adminBundlesQuery(principal));
  const classesQuery = useSuspenseQuery(adminClassesQuery(principal));
  const upsert = useUpsertAdminBundle();
  const existing = bundlesQuery.data.find((row) => row.id === bundleId);

  if (!isNew && !existing) {
    return (
      <AdminPageShell
        title="Package unavailable"
        breadcrumb={[{ label: "Bundles", href: "/bundles" }]}
      >
        <p className="text-sm text-muted-foreground">That package is not in this mock.</p>
      </AdminPageShell>
    );
  }

  const defaultValues = existing ? bundleFormValuesFrom(existing) : bundleFormDefaultValues;
  const classOptions = classesQuery.data
    .filter((row) => row.active)
    .map((row) => ({ value: row.id, label: row.name }));

  return (
    <AdminPageShell
      title={isNew ? "New package" : (existing?.name ?? "Package")}
      breadcrumb={[
        { label: "Bundles", href: "/bundles" },
        { label: isNew ? "New" : (existing?.name ?? "Package") },
      ]}
    >
      {upsert.isPending ? (
        <FormPageSkeleton label="Saving package" sections={3} fields={6} />
      ) : null}
      <AdminForm
        key={existing?.id ?? "new"}
        id="bundle-form"
        className="mt-6"
        schema={bundleFormSchema}
        defaultValues={defaultValues}
        onSubmit={async (values: BundleFormValues) => {
          try {
            await upsert.mutateAsync({
              id: isNew ? undefined : bundleId,
              name: values.name,
              slug: values.slug,
              summary: values.summary,
              description: values.description,
              sessionCredits: Number(values.sessionCredits),
              pricePhp: Number(values.pricePhp),
              allActiveClasses: values.applicabilityMode === "all",
              classIds: values.classIds,
              validityDays: values.validityDays,
              perCustomerLimit: values.perCustomerLimit,
              status: values.status,
            });
            notify.admin("bundle.saved");
            router.push("/bundles");
          } catch (error) {
            notify.admin("bundle.save-failed");
            throw error;
          }
        }}
      >
        <FormSection title="Customer copy" surface="card">
          <FormField name="name" label="Name" required>
            {(field) => <TextBinding {...field} />}
          </FormField>
          <FormField
            name="slug"
            label="Unique URL"
            required
            description="Used on /packages/[slug]."
          >
            {(field) => <TextBinding {...field} />}
          </FormField>
          <FormField name="summary" label="Short summary" required>
            {(field) => <TextareaBinding {...field} rows={2} />}
          </FormField>
          <FormField name="description" label="Description" required>
            {(field) => <RichTextBinding {...field} />}
          </FormField>
        </FormSection>
        <FormSection title="Sessions and price" surface="card">
          <FormField
            name="sessionCredits"
            label="Session credits"
            required
            description="How many scheduled sessions this package can redeem. Not a cash balance."
          >
            {(field) => <TextBinding {...field} type="number" min={1} />}
          </FormField>
          <FormField
            name="pricePhp"
            label="Price (₱)"
            required
            description="Zero is a free package. Paid packages need manual review."
          >
            {(field) => <TextBinding {...field} type="number" min={0} />}
          </FormField>
        </FormSection>
        <FormSection title="Eligibility" surface="card">
          <FormField name="applicabilityMode" label="Eligible classes" required>
            {(field) => (
              <ChoiceBinding
                {...field}
                as="radio"
                options={[
                  { value: "all", label: "All active classes" },
                  { value: "selected", label: "Selected classes" },
                ]}
              />
            )}
          </FormField>
          <FormField
            name="classIds"
            label="Class set"
            description="Required when the package is limited to selected classes."
          >
            {(field) => <CheckboxGroupBinding {...field} options={classOptions} />}
          </FormField>
          <FormField
            name="validityDays"
            label="Validity (days)"
            description="Optional. Credits cannot book a session that starts after expiry."
          >
            {(field) => <TextBinding {...field} type="number" min={1} />}
          </FormField>
          <FormField
            name="perCustomerLimit"
            label="Per-customer limit"
            description="Optional. Admin grants can override this with an audit note."
          >
            {(field) => <TextBinding {...field} type="number" min={1} />}
          </FormField>
        </FormSection>
        <FormSection title="Publication" surface="card">
          <FormField
            name="status"
            label="Status"
            required
            description="Drafts are admin-only. Archive blocks new claims without changing existing entitlements."
          >
            {(field) => (
              <ChoiceBinding
                {...field}
                options={BUNDLE_STATUSES.map((status) => ({
                  value: status,
                  label: bundleStatusLabel(status),
                }))}
              />
            )}
          </FormField>
        </FormSection>
        <FormActions
          submitLabel={isNew ? "Create package" : "Save changes"}
          cancelHref="/bundles"
        />
      </AdminForm>
    </AdminPageShell>
  );
}
