"use client";

import { COACH_ROLE_KEY } from "@balanse/domain";
import { UserPlus, UsersRound } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  FormField,
  FormSection,
  useAdminFormContext,
} from "@/modules/admin/forms/admin-form/AdminForm";
import { ChoiceBinding, TextBinding } from "@/modules/admin/forms/bindings";
import type { CoachNewFormValues } from "@/modules/admin/forms/coach/coach-form.schema";
import type { CoachStaffSourceProps } from "./CoachStaffSource.meta";

/**
 * "Who is this coach?" for /coaches/new. A coach is always one staff member:
 * pick staff without a coach profile, or invite a new person (Coach role pre-selected).
 */
export function CoachStaffSource({ staff, roles, canInvite, canPickStaff }: CoachStaffSourceProps) {
  const { watch, setValue, getValues } = useAdminFormContext<CoachNewFormValues>();
  const source = watch("staffSource");
  const staffId = watch("staffId");
  const inviteName = watch("inviteName");
  const inviteRoleId = watch("inviteRoleId");
  // The coach name follows the chosen person until the admin edits it themselves.
  const autoName = useRef("");
  const available = staff.filter((row) => row.status === "active" && !row.coachId);
  const activeRoles = roles.filter((role) => role.status === "active");

  useEffect(() => {
    if (!canPickStaff && canInvite && getValues("staffSource") !== "invite") {
      setValue("staffSource", "invite");
    }
  }, [canInvite, canPickStaff, getValues, setValue]);

  useEffect(() => {
    if (inviteRoleId || activeRoles.length === 0) return;
    const coachRole = activeRoles.find((role) => role.key === COACH_ROLE_KEY) ?? activeRoles[0];
    if (coachRole) setValue("inviteRoleId", coachRole.id);
  }, [activeRoles, inviteRoleId, setValue]);

  useEffect(() => {
    const person =
      source === "existing" ? (staff.find((row) => row.id === staffId)?.name ?? "") : inviteName;
    const current = getValues("name");
    if (!current || current === autoName.current) {
      setValue("name", person, { shouldDirty: true });
    }
    autoName.current = person;
  }, [getValues, inviteName, setValue, source, staff, staffId]);

  const sourceOptions = [
    ...(canPickStaff ? [{ value: "existing", label: "An existing staff member" }] : []),
    ...(canInvite ? [{ value: "invite", label: "Invite someone new" }] : []),
  ];

  return (
    <FormSection
      title="Who is this coach?"
      description="Every coach is a staff member. Their staff account is how they sign in to see their classes and roster."
      surface="card"
    >
      {sourceOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Adding a coach needs access to Staff. Ask a Super Admin to add them.
        </p>
      ) : (
        <FormField name="staffSource" label="Coach is" span="full">
          {(field) => <ChoiceBinding {...field} as="radio" options={sourceOptions} />}
        </FormField>
      )}

      {source === "existing" && canPickStaff ? (
        <FormField
          name="staffId"
          label="Staff member"
          required
          span="full"
          description={
            available.length === 0
              ? "Every active staff member already has a coach profile. Invite someone new instead."
              : "Only active staff without a coach profile are listed."
          }
        >
          {(field) => (
            <ChoiceBinding
              {...field}
              as="native-select"
              options={available.map((row) => ({
                value: row.id,
                label: `${row.name} · ${row.email}`,
              }))}
            />
          )}
        </FormField>
      ) : null}

      {source === "invite" && canInvite ? (
        <>
          <FormField name="inviteName" label="Full name" required>
            {(field) => <TextBinding {...field} />}
          </FormField>
          <FormField name="inviteEmail" label="Email" required>
            {(field) => <TextBinding {...field} type="email" />}
          </FormField>
          <FormField
            name="inviteRoleId"
            label="Staff role"
            required
            span="full"
            description="Coach gives them their own schedule, roster, and students. Pick another role if they also run the front desk."
          >
            {(field) => (
              <ChoiceBinding
                {...field}
                as="native-select"
                options={activeRoles.map((role) => ({
                  value: role.id,
                  label: role.builtIn ? `${role.name} · built-in` : role.name,
                }))}
              />
            )}
          </FormField>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <UserPlus aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            You'll get a private invite link to share. No email is sent.
          </p>
        </>
      ) : null}

      {source === "existing" && canPickStaff ? (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <UsersRound aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Their coach name starts as their staff name. You can change it below.
        </p>
      ) : null}
    </FormSection>
  );
}
