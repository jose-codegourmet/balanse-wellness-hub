"use client";

import { isSensitivePermission, type PermissionKey, sensitivePermissionsOf } from "@balanse/domain";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import {
  AdminForm,
  FormActions,
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import { TextareaBinding, TextBinding } from "@/modules/admin/forms/bindings";
import { RoleAccessSummary } from "../role-access-summary/RoleAccessSummary";
import { RolePermissionChecklist } from "../role-permission-checklist/RolePermissionChecklist";
import { roleFormDefaultValues } from "./RoleForm.defaults";
import { type RoleFormValues, roleFormSchema } from "./RoleForm.schema";

export type RoleFormProps = {
  defaultValues?: RoleFormValues;
  builtIn?: boolean;
  cloneSourceName?: string | null;
  canArchive?: boolean;
  onSubmit: (values: RoleFormValues) => Promise<void>;
  onArchive?: () => Promise<void>;
};

export function RoleForm({
  defaultValues = roleFormDefaultValues,
  builtIn = false,
  cloneSourceName,
  canArchive = false,
  onSubmit,
  onArchive,
}: RoleFormProps) {
  return (
    <AdminForm
      id="role-form"
      className="grid gap-6"
      schema={roleFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    >
      <RoleFormFields
        builtIn={builtIn}
        cloneSourceName={cloneSourceName}
        canArchive={canArchive}
        onArchive={onArchive}
      />
    </AdminForm>
  );
}

function RoleFormFields({
  builtIn,
  cloneSourceName,
  canArchive,
  onArchive,
}: {
  builtIn: boolean;
  cloneSourceName?: string | null;
  canArchive: boolean;
  onArchive?: () => Promise<void>;
}) {
  const { watch } = useAdminFormContext<RoleFormValues>();
  const permissionKeys = (watch("permissionKeys") ?? []) as PermissionKey[];
  const sensitive = sensitivePermissionsOf(permissionKeys);

  return (
    <>
      <FormSection title="Role" surface="card">
        {builtIn ? (
          <p className="rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm">
            Built-in roles are protected. Name, key, and permissions cannot change.
          </p>
        ) : null}
        {cloneSourceName ? (
          <p className="text-sm text-muted-foreground">
            Cloned from <span className="font-medium text-foreground">{cloneSourceName}</span>.
            Review the checklist before saving a new custom role.
          </p>
        ) : null}
        <FormField name="name" label="Name" required disabled={builtIn}>
          {(field) => <TextBinding {...field} />}
        </FormField>
        <FormField
          name="description"
          label="Description"
          optional
          disabled={builtIn}
          maxLength={400}
        >
          {(field) => <TextareaBinding {...field} />}
        </FormField>
      </FormSection>
      <FormSection
        title="Permissions"
        description="Checklist is generated from the canonical registry. Own-scope never implies all-scope."
        surface="card"
      >
        <FormField
          name="permissionKeys"
          label="Permission checklist"
          required
          disabled={builtIn}
          description={
            sensitive.length > 0
              ? `Sensitive permissions selected: ${sensitive.filter(isSensitivePermission).length}. These unlock rates, refunds, staff, or financial reports.`
              : "Select at least one permission. Sensitive keys are labeled in the list."
          }
        >
          {(field) => (
            <RolePermissionChecklist
              name={field.name}
              value={(field.value as PermissionKey[]) ?? []}
              onChange={(next) => field.onChange(next)}
              onBlur={field.onBlur}
              ref={field.ref}
              disabled={builtIn}
            />
          )}
        </FormField>
        {sensitive.length > 0 ? (
          <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm">
            This role can see or change sensitive studio data. Only grant these keys to people who
            need them.
          </p>
        ) : null}
        <RoleAccessSummary permissionKeys={permissionKeys} />
      </FormSection>
      <FormActions
        submitLabel="Save role"
        cancelHref="/staff/roles"
        hideSubmit={builtIn}
        destructive={
          canArchive && onArchive ? (
            <ConfirmAction
              triggerLabel="Archive role"
              title="Archive this role?"
              description="Archived roles cannot be assigned. Assigned custom roles cannot be archived."
              variant="outline"
              onConfirm={onArchive}
            />
          ) : undefined
        }
      />
    </>
  );
}
