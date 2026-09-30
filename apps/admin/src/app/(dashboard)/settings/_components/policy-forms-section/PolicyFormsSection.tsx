"use client";

import {
  type AdminSettings,
  CUSTOMER_POLICY_FORM_META,
  CUSTOMER_POLICY_FORMS,
  type CustomerPolicyForm,
  type PolicyDocumentVersion,
} from "@balanse/domain";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from "@balanse/ui";
import { useRouter } from "next/navigation";
import { useSetPolicyFormRequirements } from "@/lib/query/mutations";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import { policyFormRequirementsFormSchema } from "@/modules/admin/forms/settings/settings-form.schema";
import { notify } from "@/modules/notifications/notify";
import { SortablePolicyList } from "./sortable-policy-list/SortablePolicyList";

function policyOptions(docs: PolicyDocumentVersion[]) {
  const names = [...new Set(docs.map((doc) => doc.documentName))];
  return names.map((name) => {
    const current = docs.find((doc) => doc.documentName === name && doc.current);
    return {
      value: name,
      label: name,
      description: current
        ? `Customers accept version ${current.version}.`
        : "No current version — customers will not see it until one is published.",
    };
  });
}

const PAPER =
  "rounded-2xl border border-border/60 bg-card shadow-[0_1px_2px_color-mix(in_oklab,var(--foreground)_6%,transparent),0_18px_40px_-24px_color-mix(in_oklab,var(--foreground)_38%,transparent)] transition duration-200 hover:shadow-[0_2px_4px_color-mix(in_oklab,var(--foreground)_6%,transparent),0_26px_50px_-26px_color-mix(in_oklab,var(--foreground)_45%,transparent)]";

/** Collapsed-header summary: the attached policies in customer order. */
function AttachedSummary({ form }: { form: CustomerPolicyForm }) {
  const { watch } = useAdminFormContext<Record<CustomerPolicyForm, string[]>>();
  const attached = (watch(form) as string[] | undefined) ?? [];
  if (attached.length === 0) {
    return <span className="text-sm text-muted-foreground">No policies</span>;
  }
  return (
    <span className="flex flex-wrap gap-1.5">
      {attached.map((name, index) => (
        <span
          key={name}
          className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
        >
          <span className="text-muted-foreground">{index + 1}.</span>
          {name}
        </span>
      ))}
    </span>
  );
}

/**
 * Attaches existing policies to customer-facing forms. The forms themselves are
 * fixed; this only decides which policies a customer must accept before submit.
 */
export function PolicyFormsSection({
  settings,
  onSaved,
}: {
  settings: AdminSettings;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const save = useSetPolicyFormRequirements();
  const options = policyOptions(settings.policyDocuments);

  if (options.length === 0) {
    return (
      <FormSection
        title="Customer forms"
        description="Create a policy first, then attach it to the customer forms that need it."
      >
        <div>
          <Button type="button" onClick={() => router.push("/settings/policies/new")}>
            New policy
          </Button>
        </div>
      </FormSection>
    );
  }

  return (
    <AdminForm
      schema={policyFormRequirementsFormSchema}
      defaultValues={settings.policyFormRequirements}
      onSubmit={async (values) => {
        try {
          await save.mutateAsync(values);
          notify.admin("policy.forms-saved");
          onSaved?.();
        } catch (error) {
          notify.admin("settings.save-failed");
          throw error;
        }
      }}
    >
      <FormSection
        title="Customer forms"
        description="Choose which policies each customer form asks people to accept, and open a form to drag them into the order customers see. The form fields themselves do not change."
      >
        <Accordion multiple className="gap-4">
          {CUSTOMER_POLICY_FORMS.map((form) => {
            const meta = CUSTOMER_POLICY_FORM_META[form];
            return (
              <AccordionItem key={form} value={form} className={PAPER}>
                <AccordionTrigger className="items-center gap-4 px-5 py-4 hover:no-underline md:px-6">
                  <span className="grid min-w-0 flex-1 gap-2">
                    <span className="grid gap-0.5">
                      <span className="font-display text-xl font-normal">{meta.label}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {meta.description}
                      </span>
                    </span>
                    <AttachedSummary form={form} />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="grid gap-4 border-t border-border/60 px-5 pt-4 pb-5 md:px-6">
                  <p className="font-mono text-xs text-muted-foreground">{meta.path}</p>
                  <FormField name={form} label={`Policies on ${meta.label}, in order`}>
                    {(field) => (
                      <SortablePolicyList {...field} options={options} formLabel={meta.label} />
                    )}
                  </FormField>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </FormSection>
      <FormActions submitLabel="Save customer forms" />
    </AdminForm>
  );
}
