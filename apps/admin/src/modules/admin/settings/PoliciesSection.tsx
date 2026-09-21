"use client";

import {
  type AdminSettings,
  auditConfirmationCopy,
  formatSessionDate,
  isPolicyVersion,
  type PolicyDocumentVersion,
} from "@balanse/domain";
import { Badge } from "@balanse/ui";
import { useEffect, useState } from "react";
import { ConfirmAction } from "@/components/balanse/ConfirmAction";
import { adminNowIso } from "@/lib/clock";
import { usePromotePolicyVersion } from "@/lib/query/mutations";
import { notify } from "@/modules/notifications/notify";
import { AdminForm, FormField, FormSection, useAdminFormContext } from "../forms/AdminForm";
import { TextBinding } from "../forms/bindings";
import {
  type PolicyPromoteFormValues,
  policyPromoteFormSchema,
} from "../forms/settings/settings-form.schema";
import { DirtyBridge } from "./DirtyBridge";

function promoteFormId(documentName: string) {
  return `promote-${documentName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`.replace(/-$/, "");
}

function nextPolicyVersion(current: string): string {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(current.trim());
  if (!match) return "";
  let year = Number(match[1]);
  let month = Number(match[2]) + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, "0")}`;
}

function groupPolicyDocuments(docs: PolicyDocumentVersion[]) {
  const names: string[] = [];
  const grouped = new Map<string, PolicyDocumentVersion[]>();
  for (const doc of docs) {
    if (!grouped.has(doc.documentName)) {
      names.push(doc.documentName);
      grouped.set(doc.documentName, []);
    }
    grouped.get(doc.documentName)?.push(doc);
  }
  return names.map((name) => ({
    name,
    versions: [...(grouped.get(name) ?? [])].sort((a, b) => {
      if (a.current !== b.current) return a.current ? -1 : 1;
      return b.promotedAt.localeCompare(a.promotedAt);
    }),
  }));
}

function PromotePolicyForm({
  documentName,
  currentVersion,
  invalidVersion = false,
  onDirtyChange,
  onSaved,
}: {
  documentName: string;
  currentVersion: string;
  invalidVersion?: boolean;
  onDirtyChange?: (documentName: string, dirty: boolean) => void;
  onSaved?: () => void;
}) {
  const promote = usePromotePolicyVersion();
  const suggested = invalidVersion ? "not-a-version" : nextPolicyVersion(currentVersion);

  return (
    <AdminForm
      id={promoteFormId(documentName)}
      schema={policyPromoteFormSchema}
      defaultValues={{ version: suggested }}
      onSubmit={async (values) => {
        try {
          await promote.mutateAsync({ documentName, version: values.version });
          notify.admin("policy.promoted");
          onSaved?.();
        } catch (error) {
          notify.admin("policy.promote-failed");
          throw error;
        }
      }}
    >
      <DirtyBridge onDirtyChange={(dirty) => onDirtyChange?.(documentName, dirty)} />
      <PromotePolicyFields documentName={documentName} />
    </AdminForm>
  );
}

function PromotePolicyFields({ documentName }: { documentName: string }) {
  const { watch, requestSubmit } = useAdminFormContext<PolicyPromoteFormValues>();
  const version = String(watch("version") ?? "");
  const valid = isPolicyVersion(version);
  const stamp = auditConfirmationCopy(
    `Promote ${documentName} to ${version || "(invalid version)"}`,
    "Admin",
    adminNowIso(),
  );

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,12rem)_auto] md:items-end">
      <FormField
        name="version"
        label="New version"
        description="Format yyyy-mm, matching the stored policy versions."
      >
        {(field) => <TextBinding {...field} placeholder="yyyy-mm" />}
      </FormField>
      <ConfirmAction
        triggerLabel={`Promote ${documentName}`}
        title={`Promote ${documentName}?`}
        description={`${stamp} Customers accept the new version going forward. Existing acceptances stay historical.`}
        confirmLabel="Promote version"
        disabled={!valid}
        onConfirm={() => {
          requestSubmit();
        }}
      />
    </div>
  );
}

export function PoliciesSection({
  settings,
  invalidVersion = false,
  onDirtyChange,
  onSaved,
}: {
  settings: AdminSettings;
  invalidVersion?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  onSaved?: () => void;
}) {
  const groups = groupPolicyDocuments(settings.policyDocuments);
  const [promoteDirty, setPromoteDirty] = useState<Record<string, boolean>>({});

  function markPromoteDirty(documentName: string, next: boolean) {
    setPromoteDirty((current) => {
      if (current[documentName] === next) return current;
      return { ...current, [documentName]: next };
    });
  }

  useEffect(() => {
    onDirtyChange?.(Object.values(promoteDirty).some(Boolean));
  }, [onDirtyChange, promoteDirty]);

  return (
    <FormSection
      title="Policies & waivers"
      description="Promotion applies to any policy document. Customers accept the new version going forward; existing acceptances remain historical (BE-009)."
    >
      <ul className="grid gap-4">
        {groups.map((group) => {
          const current = group.versions.find((doc) => doc.current) ?? group.versions[0];
          return (
            <li key={group.name} className="grid gap-3 rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-xl">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Current version {current?.version ?? "—"}.
                  </p>
                </div>
                <Badge
                  variant={current?.current ? "success" : "neutral"}
                  appearance="soft"
                  size="sm"
                  dot
                >
                  {current?.current ? "Current" : "Inactive"}
                </Badge>
              </div>
              <ul className="grid gap-2">
                {group.versions.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span>
                      {doc.version}
                      <span className="text-muted-foreground">
                        {" "}
                        · promoted {formatSessionDate(doc.promotedAt)}
                      </span>
                    </span>
                    <Badge
                      variant={doc.current ? "success" : "neutral"}
                      appearance="soft"
                      size="sm"
                    >
                      {doc.current ? "Current" : "Historical"}
                    </Badge>
                  </li>
                ))}
              </ul>
              {current ? (
                <PromotePolicyForm
                  documentName={group.name}
                  currentVersion={current.version}
                  invalidVersion={invalidVersion}
                  onDirtyChange={markPromoteDirty}
                  onSaved={onSaved}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </FormSection>
  );
}
