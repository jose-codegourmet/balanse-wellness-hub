"use client";

import type { CustomerProfile, PasswordChangeInput } from "@balanse/domain";
import { PASSWORD_MIN_LENGTH, validateMockPasswordChange } from "@balanse/domain";
import { Label, PasswordInput } from "@balanse/ui";
import { useState } from "react";
import { Button } from "@/components/jabkit/button";

const EMPTY: PasswordChangeInput = { currentPassword: "", newPassword: "", confirmPassword: "" };

const MOCK_NOTE = "Mock only — this form does not change a real password.";

/**
 * Mock change-password form (FE-CUS-017). Validation is client-side only and
 * the submit writes nowhere: there is no credential store in the mock phase,
 * so the saved state says exactly that. Google principals keep the section
 * reachable with the fields disabled instead of a dead sentence.
 */
export function PasswordSettingsForm({
  profile,
  forcedStatus,
}: {
  profile: CustomerProfile;
  forcedStatus?: "saved";
}) {
  const managedByGoogle = profile.authMethod === "google";
  const [values, setValues] = useState<PasswordChangeInput>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordChangeInput, string>>>({});
  const [status, setStatus] = useState<"idle" | "saved">(forcedStatus ?? "idle");

  function update(field: keyof PasswordChangeInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setStatus("idle");
  }

  return (
    <form
      className="profile-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const result = validateMockPasswordChange(values);
        if (!result.ok) {
          setErrors(result.errors);
          setStatus("idle");
          return;
        }
        setErrors({});
        setValues(EMPTY);
        setStatus("saved");
      }}
    >
      <fieldset disabled={managedByGoogle} className="profile-fieldset">
        <legend className="sr-only">Change password</legend>
        <div className="grid gap-1.5">
          <Label htmlFor="password-current">Current password</Label>
          <PasswordInput
            id="password-current"
            value={values.currentPassword}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.currentPassword)}
            aria-describedby={errors.currentPassword ? "password-current-error" : undefined}
            onChange={(event) => update("currentPassword", event.target.value)}
          />
          {errors.currentPassword ? (
            <p id="password-current-error" className="text-sm text-destructive">
              {errors.currentPassword}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password-new">New password</Label>
          <PasswordInput
            id="password-new"
            value={values.newPassword}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.newPassword)}
            aria-describedby={
              errors.newPassword ? "password-new-error" : "password-new-requirement"
            }
            onChange={(event) => update("newPassword", event.target.value)}
          />
          {errors.newPassword ? (
            <p id="password-new-error" className="text-sm text-destructive">
              {errors.newPassword}
            </p>
          ) : (
            <p id="password-new-requirement" className="profile-field-hint">
              At least {PASSWORD_MIN_LENGTH} characters.
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password-confirm">Confirm new password</Label>
          <PasswordInput
            id="password-confirm"
            value={values.confirmPassword}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "password-confirm-error" : undefined}
            onChange={(event) => update("confirmPassword", event.target.value)}
          />
          {errors.confirmPassword ? (
            <p id="password-confirm-error" className="text-sm text-destructive">
              {errors.confirmPassword}
            </p>
          ) : null}
        </div>
      </fieldset>

      {/* Always mounted so the live region is monitored before it fills. */}
      <p role="status" className="profile-save-status">
        {status === "saved" ? "Password saved in this mock. No real credential was changed." : null}
      </p>

      <div className="profile-form-actions">
        <span>{MOCK_NOTE}</span>
        <Button
          type="submit"
          disabled={managedByGoogle}
          className="profile-save-button"
          title={managedByGoogle ? "Managed by Google in this preview" : undefined}
        >
          Update password
        </Button>
      </div>
    </form>
  );
}
