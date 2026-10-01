"use client";

import type { CustomerProfile, CustomerProfilePatch } from "@balanse/domain";
import { Button, Field, FieldError, FieldLabel, Input, PhPhoneInput } from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, LoaderCircle, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { notify } from "@/modules/notifications/notify";
import { ProfileNameFields } from "../../../profile-name-fields/ProfileNameFields";
import { basicProfileFormValuesFrom } from "./BasicProfileForm.defaults";
import { type BasicProfileFormValues, basicProfileFormSchema } from "./BasicProfileForm.schema";

export type BasicProfileFormProps = {
  profile: CustomerProfile;
  /** Persist the patch; resolve to the saved profile, or an error message. */
  onSave: (
    patch: CustomerProfilePatch,
  ) => Promise<{ ok: true; value: CustomerProfile } | { ok: false; error: string }>;
  onSaved: (next: CustomerProfile) => void;
  forcedStatus?: "saving" | "failed";
};

export function BasicProfileForm({
  profile,
  onSave,
  onSaved,
  forcedStatus,
}: BasicProfileFormProps) {
  const form = useForm<BasicProfileFormValues>({
    resolver: zodResolver(basicProfileFormSchema),
    defaultValues: basicProfileFormValuesFrom(profile),
  });
  const { errors } = form.formState;
  const [status, setStatus] = useState<"idle" | "saving" | "failed">(forcedStatus ?? "idle");

  return (
    <FormProvider {...form}>
      <form
        className="profile-form"
        aria-busy={status === "saving"}
        noValidate
        onSubmit={form.handleSubmit(async (values) => {
          setStatus("saving");
          const result = await onSave({
            firstName: values.firstName,
            lastName: values.lastName,
            nickname: values.nickname || null,
            email: values.email,
            contactNumber: values.contactNumber,
          });
          if (!result.ok) {
            setStatus("failed");
            notify.portal("profile.save-failed");
            return;
          }
          form.reset(basicProfileFormValuesFrom(result.value));
          onSaved(result.value);
          setStatus("idle");
          notify.portal("profile.saved");
        })}
      >
        <ProfileNameFields avatarUrl={profile.avatarUrl} seed={profile.id} />
        <Field invalid={Boolean(errors.email)}>
          <FieldLabel>
            <Mail size={14} aria-hidden="true" /> Email address
          </FieldLabel>
          <Input type="email" autoComplete="email" {...form.register("email")} />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field invalid={Boolean(errors.contactNumber)}>
          <FieldLabel>
            <Phone size={14} aria-hidden="true" /> Contact number
          </FieldLabel>
          <Controller
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <PhPhoneInput
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(event.target.value)}
                autoComplete="tel"
              />
            )}
          />
          <FieldError errors={[errors.contactNumber]} />
        </Field>
        {/* A successful save is announced by the toast. Failures keep a
            form-level live region so the message stays next to the fields
            after the toast has auto-dismissed. */}
        {status === "failed" ? (
          <p role="alert" aria-live="assertive" className="text-sm text-destructive">
            The mock profile could not be saved. Try again.
          </p>
        ) : null}
        <div className="profile-form-actions">
          <span>You can update these anytime.</span>
          <Button type="submit" disabled={status === "saving"}>
            {status === "saving" ? (
              <>
                <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Saving…
              </>
            ) : (
              <>
                Save changes <ArrowUpRight size={17} aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
