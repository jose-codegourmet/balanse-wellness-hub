"use client";

import { HEARD_FROM_OPTIONS, ONBOARDING_OTHER_MAX } from "@balanse/domain";
import { chipVariants, Field, FieldError, FieldLabel, Input } from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { onboardingStepHeardFromDefaultValues } from "./OnboardingStepHeardFrom.defaults";
import type { OnboardingStepHeardFromProps } from "./OnboardingStepHeardFrom.meta";
import {
  type OnboardingStepHeardFromValues,
  onboardingStepHeardFromSchema,
} from "./OnboardingStepHeardFrom.schema";

export function OnboardingStepHeardFrom({
  defaultValues = onboardingStepHeardFromDefaultValues,
  onSubmit,
  footer,
  headingLevel = 2,
  headingRef,
  formError,
  idPrefix = "onboarding-heard-from",
  referredByFriend = false,
}: OnboardingStepHeardFromProps) {
  const form = useForm<OnboardingStepHeardFromValues>({
    resolver: zodResolver(onboardingStepHeardFromSchema),
    defaultValues,
  });
  const { errors } = form.formState;
  const heardFrom = useWatch({ control: form.control, name: "heardFrom" });
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <form
      className="grid gap-7"
      noValidate
      aria-labelledby={`${idPrefix}-heading`}
      onSubmit={form.handleSubmit((values) =>
        onSubmit(values.heardFrom === "OTHER" ? values : { ...values, heardFromOther: "" }),
      )}
    >
      <header className="grid gap-1.5">
        <Heading
          id={`${idPrefix}-heading`}
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl tracking-tight outline-none"
        >
          How did you hear about us?
        </Heading>
        <p className="text-sm text-muted-foreground">
          Helps a small studio know where to say hello next.
        </p>
      </header>

      {referredByFriend ? (
        <p className="rounded-lg bg-secondary/50 px-3 py-2.5 text-sm">
          Looks like a friend shared a class with you 👋
        </p>
      ) : null}

      <fieldset
        className="grid gap-3"
        aria-describedby={errors.heardFrom ? `${idPrefix}-error` : undefined}
      >
        <legend className="sr-only">How did you hear about us?</legend>
        <div className="flex flex-wrap gap-2">
          {HEARD_FROM_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={chipVariants({ selected: heardFrom === option.value })}
            >
              <input
                type="radio"
                className="sr-only"
                value={option.value}
                {...form.register("heardFrom")}
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.heardFrom ? (
          <p id={`${idPrefix}-error`} role="alert" className="text-sm text-destructive">
            {errors.heardFrom.message}
          </p>
        ) : null}
        {heardFrom === "OTHER" ? (
          <Field invalid={Boolean(errors.heardFromOther)} className="mt-1 max-w-md">
            <FieldLabel>Where did you hear about us?</FieldLabel>
            <Input maxLength={ONBOARDING_OTHER_MAX} {...form.register("heardFromOther")} />
            <FieldError errors={[errors.heardFromOther]} />
          </Field>
        ) : null}
      </fieldset>

      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}
      {footer}
    </form>
  );
}
