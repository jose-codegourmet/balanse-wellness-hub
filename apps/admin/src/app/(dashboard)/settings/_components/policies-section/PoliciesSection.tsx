"use client";

import {
  type AdminSettings,
  auditConfirmationCopy,
  CUSTOMER_POLICY_FORM_META,
  formsForPolicy,
  isPolicyVersion,
  type PolicyDocumentVersion,
} from "@balanse/domain";
import { Badge, Button } from "@balanse/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { adminNowIso } from "@/lib/clock";
import {
  useDeletePolicy,
  useDeletePolicyDocument,
  usePromotePolicyVersion,
  useUpsertPolicyDocument,
} from "@/lib/query/mutations";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import { RichTextBinding, TextBinding } from "@/modules/admin/forms/bindings";
import {
  type PolicyPromoteFormValues,
  policyDocumentFormSchema,
  policyPromoteFormSchema,
} from "@/modules/admin/forms/settings/settings-form.schema";
import { notify } from "@/modules/notifications/notify";
import { PolicyFormsSection } from "../policy-forms-section/PolicyFormsSection";

const POLICIES_HREF = "/settings/policies";

function nextPolicyVersion(current: string): string {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(current.trim());
  if (!match) return "";
  let year = Number(match[1]),
    month = Number(match[2]) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, "0")}`;
}
function groups(docs: PolicyDocumentVersion[]) {
  const map = new Map<string, PolicyDocumentVersion[]>();
  for (const doc of docs) {
    if (!map.has(doc.documentName)) map.set(doc.documentName, []);
    map.get(doc.documentName)?.push(doc);
  }
  return [...map.entries()].map(([name, versions]) => ({
    name,
    versions: [...versions].sort(
      (a, b) => Number(b.current) - Number(a.current) || b.promotedAt.localeCompare(a.promotedAt),
    ),
  }));
}
function Promote({
  documentName,
  currentVersion,
  onSaved,
}: {
  documentName: string;
  currentVersion: string;
  onSaved: () => void;
}) {
  const promote = usePromotePolicyVersion();
  const suggested = nextPolicyVersion(currentVersion);
  return (
    <AdminForm
      className="w-full sm:w-96"
      schema={policyPromoteFormSchema}
      defaultValues={{ version: suggested }}
      onSubmit={async (values) => {
        try {
          await promote.mutateAsync({ documentName, version: values.version });
          notify.admin("policy.promoted");
          onSaved();
        } catch (error) {
          notify.admin("policy.promote-failed");
          throw error;
        }
      }}
    >
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-40 shrink-0">
          <FormField name="version" label="New version">
            {(field) => <TextBinding {...field} placeholder="yyyy-mm" />}
          </FormField>
        </div>
        <PromoteButton documentName={documentName} />
      </div>
    </AdminForm>
  );
}
function PromoteButton({ documentName }: { documentName: string }) {
  const { watch, requestSubmit } = useAdminFormContext<PolicyPromoteFormValues>();
  const version = String(watch("version") ?? "");
  const valid = isPolicyVersion(version);
  const stamp = auditConfirmationCopy(
    `Promote ${documentName} to ${version || "(invalid version)"}`,
    "Admin",
    adminNowIso(),
  );
  return (
    <ConfirmAction
      triggerLabel={`Promote ${documentName}`}
      title={`Promote ${documentName}?`}
      description={`${stamp} Customers accept the new version going forward.`}
      confirmLabel="Promote version"
      disabled={!valid}
      onConfirm={() => requestSubmit()}
    />
  );
}
function PolicyEditor({
  document,
  onSaved,
}: {
  document?: PolicyDocumentVersion;
  onSaved: () => void;
}) {
  const upsert = useUpsertPolicyDocument();
  const deletePolicy = useDeletePolicyDocument();
  return (
    <AdminForm
      schema={policyDocumentFormSchema}
      defaultValues={{
        documentName: document?.documentName ?? "",
        version: document?.version ?? "",
        body: document?.body ?? "",
        current: document?.current ?? false,
      }}
      onSubmit={async (values) => {
        try {
          await upsert.mutateAsync({ ...values, id: document?.id });
          notify.admin("settings.saved");
          onSaved();
        } catch (error) {
          notify.admin("settings.save-failed");
          throw error;
        }
      }}
    >
      <FormSection
        title={document ? `Edit ${document.documentName} · ${document.version}` : "New policy"}
        surface="card"
        description={
          document?.current
            ? "This is the current version. Saving changes the text customers accept going forward."
            : "Use rich text for the policy customers will read."
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField name="documentName" label="Policy name">
            {(field) => <TextBinding {...field} placeholder="e.g. Liability waiver" />}
          </FormField>
          <FormField name="version" label="Version">
            {(field) => <TextBinding {...field} placeholder="yyyy-mm" />}
          </FormField>
        </div>
        <FormField name="body" label="Policy text" wireAria>
          {(field) => <RichTextBinding {...field} maxLength={10000} minRows={10} />}
        </FormField>
        <FormField name="current" label="Publish as current" orientation="horizontal">
          {(field) => (
            <input
              type="checkbox"
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
            />
          )}
        </FormField>
        <FormActions
          submitLabel={document ? "Save policy" : "Create policy"}
          cancelHref={POLICIES_HREF}
          destructive={
            document && !document.current ? (
              <ConfirmAction
                triggerLabel="Delete version"
                title={`Delete ${document.documentName} ${document.version}?`}
                description="This cannot be undone in the mock catalogue."
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={async () => {
                  await deletePolicy.mutateAsync(document.id);
                  onSaved();
                }}
              />
            ) : undefined
          }
        />
      </FormSection>
    </AdminForm>
  );
}
function attachedLabel(settings: AdminSettings, documentName: string): string {
  const forms = formsForPolicy(settings.policyFormRequirements, documentName);
  if (forms.length === 0) return "Not on any customer form.";
  return `Shown on ${forms.map((form) => CUSTOMER_POLICY_FORM_META[form].label).join(", ")}.`;
}
function policyHref(id: string): string {
  return `${POLICIES_HREF}/${encodeURIComponent(id)}`;
}
export function PoliciesSection({
  settings,
  onSaved,
  view = "library",
  policyId,
}: {
  settings: AdminSettings;
  invalidVersion?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  onSaved?: () => void;
  view?: "library" | "new" | "forms";
  policyId?: string;
}) {
  const router = useRouter();
  const deletePolicy = useDeletePolicy();
  const save = () => {
    onSaved?.();
    router.push(POLICIES_HREF);
  };
  if (view === "new") return <PolicyEditor onSaved={save} />;
  if (view === "forms") return <PolicyFormsSection settings={settings} onSaved={onSaved} />;
  const decodedId = policyId ? decodeURIComponent(policyId) : undefined;
  const editing = decodedId
    ? settings.policyDocuments.find((doc) => doc.id === decodedId)
    : undefined;
  if (editing) return <PolicyEditor key={editing.id} document={editing} onSaved={save} />;
  const currentDocs = groups(settings.policyDocuments);
  return (
    <div className="grid gap-6">
      {decodedId ? (
        <p role="alert" className="rounded-xl border border-border bg-muted p-4 text-sm">
          That policy version no longer exists. Pick another version below.
        </p>
      ) : null}
      <FormSection
        title="Policies & waivers"
        description="Create, edit, publish, and retain historical policy versions. Customers accept the current version going forward."
      >
        <div className="flex justify-end">
          <Button type="button" onClick={() => router.push(`${POLICIES_HREF}/new`)}>
            New policy
          </Button>
        </div>
        <ul className="grid gap-4">
          {currentDocs.map((group) => {
            const current = group.versions[0];
            return (
              <li key={group.name} className="grid gap-3 rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Current version {current?.version ?? "—"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {attachedLabel(settings, group.name)}{" "}
                      <Link
                        href={`${POLICIES_HREF}/forms`}
                        className="font-medium text-foreground underline underline-offset-4"
                      >
                        Manage forms
                      </Link>
                    </p>
                  </div>
                  <Badge
                    variant={current?.current ? "success" : "neutral"}
                    appearance="soft"
                    size="sm"
                    dot
                  >
                    {current?.current ? "Current" : "Historical"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.versions.map((doc) => (
                    <Link
                      key={doc.id}
                      href={policyHref(doc.id)}
                      aria-label={`Edit ${group.name} ${doc.version}`}
                      className="rounded-md bg-muted px-2 py-1 text-sm transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {doc.version}
                      {doc.current ? " · Current" : " · Historical"}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(policyHref(current.id))}
                    >
                      {current.current ? "Edit current" : "Edit latest"}
                    </Button>
                    <ConfirmAction
                      triggerLabel="Delete policy"
                      title={`Delete ${group.name}?`}
                      description={`Removes all ${group.versions.length} version${group.versions.length === 1 ? "" : "s"} and detaches it from every customer form. Past customer acceptances stay in their history. This cannot be undone in the mock catalogue.`}
                      confirmLabel="Delete policy"
                      variant="destructive"
                      onConfirm={async () => {
                        try {
                          await deletePolicy.mutateAsync(group.name);
                          notify.admin("policy.deleted");
                          onSaved?.();
                        } catch {
                          notify.admin("policy.delete-failed");
                        }
                      }}
                    />
                  </div>
                  {current ? (
                    <Promote
                      documentName={group.name}
                      currentVersion={current.version}
                      onSaved={() => onSaved?.()}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </FormSection>
    </div>
  );
}
