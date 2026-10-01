"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { ProfileNameFields } from "../../../../profile/_components/profile-name-fields/ProfileNameFields";
import { onboardingStepYouDefaultValues } from "./OnboardingStepYou.defaults";
import type { OnboardingStepYouProps } from "./OnboardingStepYou.meta";
import { type OnboardingStepYouValues, onboardingStepYouSchema } from "./OnboardingStepYou.schema";

export function OnboardingStepYou({
  defaultValues = onboardingStepYouDefaultValues,
  onSubmit,
  footer,
  headingLevel = 2,
  headingRef,
  formError,
  idPrefix = "onboarding-you",
  avatarSlot,
  avatarUrl,
  seed,
}: OnboardingStepYouProps) {
  const form = useForm<OnboardingStepYouValues>({
    resolver: zodResolver(onboardingStepYouSchema),
    defaultValues,
  });
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <FormProvider {...form}>
      <form
        className="grid gap-6"
        noValidate
        aria-labelledby={`${idPrefix}-heading`}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <header className="grid gap-1.5">
          <Heading
            id={`${idPrefix}-heading`}
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-2xl tracking-tight outline-none"
          >
            First, a little about you
          </Heading>
          <p className="text-sm text-muted-foreground">
            Your coaches use your name at the front desk. A nickname and photo help classmates
            recognise you.
          </p>
        </header>
        {avatarSlot ? (
          <div className="grid gap-2">
            <p className="text-xs font-semibold tracking-[0.12em] uppercase">Photo (optional)</p>
            {avatarSlot}
          </div>
        ) : null}
        <ProfileNameFields avatarUrl={avatarUrl} seed={seed} />
        {formError ? (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        ) : null}
        {footer}
      </form>
    </FormProvider>
  );
}
