"use client";

import { getDisplayName } from "@balanse/domain";
import { Field, FieldDescription, FieldError, FieldLabel, Input, UserAvatar } from "@balanse/ui";
import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/cn";
import type { BasicProfileIdentityValues } from "../profile-page/basic-profile-section/basic-profile-form/BasicProfileForm.schema";
import type { ProfileNameFieldsProps } from "./ProfileNameFields.meta";

export function ProfileNameFields({ avatarUrl, seed, className }: ProfileNameFieldsProps) {
  const form = useFormContext<BasicProfileIdentityValues>();
  const { errors } = form.formState;
  const [firstName, lastName, nickname] = useWatch({
    control: form.control,
    name: ["firstName", "lastName", "nickname"],
  });
  const displayName = getDisplayName({ firstName: firstName ?? "", nickname });

  return (
    <div className={cn("grid gap-5", className)}>
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <Field invalid={Boolean(errors.firstName)}>
          <FieldLabel>First name</FieldLabel>
          <Input autoComplete="given-name" {...form.register("firstName")} />
          <FieldError errors={[errors.firstName]} />
        </Field>
        <Field invalid={Boolean(errors.lastName)}>
          <FieldLabel>Last name</FieldLabel>
          <Input autoComplete="family-name" {...form.register("lastName")} />
          <FieldError errors={[errors.lastName]} />
        </Field>
      </div>
      <Field invalid={Boolean(errors.nickname)}>
        <FieldLabel>Nickname (optional)</FieldLabel>
        <Input autoComplete="nickname" {...form.register("nickname")} />
        <FieldDescription>
          Shown to other members on class rosters instead of your first name.
        </FieldDescription>
        <FieldError errors={[errors.nickname]} />
      </Field>
      <p
        className="flex items-center gap-2.5 rounded-lg bg-secondary/50 px-3 py-2.5 text-sm"
        aria-live="polite"
      >
        <UserAvatar
          name={{ firstName: firstName ?? "", lastName: lastName ?? "" }}
          avatarUrl={avatarUrl}
          seed={seed}
          size="default"
          label={displayName}
        />
        <span>
          Other members will see you as <strong className="font-semibold">{displayName}</strong>
        </span>
      </p>
    </div>
  );
}
