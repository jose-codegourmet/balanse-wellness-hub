"use client";

import {
  type AdminSettings,
  auditConfirmationCopy,
  isPolicyVersion,
  type PolicyDocumentVersion,
} from "@balanse/domain";
import { Badge, Button } from "@balanse/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { adminNowIso } from "@/lib/clock";
import {
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
      <div className="grid gap-3 md:grid-cols-[minmax(0,12rem)_auto] md:items-end">
        <FormField name="version" label="New version">
          {(field) => <TextBinding {...field} placeholder="yyyy-mm" />}
        </FormField>
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
        title={document ? "Edit policy" : "New policy"}
        surface="card"
        description="Use rich text for the policy customers will read."
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
        <FormActions submitLabel={document ? "Save policy" : "Create policy"} />
      </FormSection>
    </AdminForm>
  );
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
  view?: "library" | "new";
  policyId?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<PolicyDocumentVersion | undefined>(() =>
    settings.policyDocuments.find((doc) => doc.id === policyId),
  );
  const [creating, setCreating] = useState(view === "new");
  useEffect(() => {
    setEditing(settings.policyDocuments.find((doc) => doc.id === policyId));
  }, [policyId, settings.policyDocuments]);
  const deletePolicy = useDeletePolicyDocument();
  const save = () => {
    setEditing(undefined);
    setCreating(false);
    onSaved?.();
    router.push("/settings/policies");
  };
  const currentDocs = groups(settings.policyDocuments);
  return (
    <div className="grid gap-6">
      <FormSection
        title="Policies & waivers"
        description="Create, edit, publish, and retain historical policy versions. Customers accept the current version going forward."
      >
        <div className="flex justify-end">
          <Button type="button" onClick={() => setCreating(true)}>
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
                    <span key={doc.id} className="rounded-md bg-muted px-2 py-1 text-sm">
                      {doc.version}
                      {doc.current ? " · Current" : " · Historical"}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/settings/policies/${current.id}`)}
                  >
                    Edit current
                  </Button>
                  {!current?.current ? (
                    <ConfirmAction
                      triggerLabel="Delete"
                      title="Delete this policy version?"
                      description="This cannot be undone in the mock catalogue."
                      confirmLabel="Delete"
                      variant="destructive"
                      onConfirm={async () => {
                        if (!current) return;
                        await deletePolicy.mutateAsync(current.id);
                        onSaved?.();
                      }}
                    />
                  ) : null}
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
      {creating ? <PolicyEditor onSaved={save} /> : null}
      {editing ? <PolicyEditor document={editing} onSaved={save} /> : null}
    </div>
  );
}
