"use client";

import { ONBOARDING_OTHER_MAX } from "@balanse/domain";
import { chipVariants, Field, FieldError, FieldLabel, Input } from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Dumbbell } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { cn } from "@/lib/cn";
import { onboardingStepInterestsDefaultValues } from "./OnboardingStepInterests.defaults";
import type { OnboardingStepInterestsProps } from "./OnboardingStepInterests.meta";
import {
  type OnboardingStepInterestsValues,
  onboardingStepInterestsSchema,
} from "./OnboardingStepInterests.schema";

export function OnboardingStepInterests({
  defaultValues = onboardingStepInterestsDefaultValues,
  onSubmit,
  footer,
  headingLevel = 2,
  headingRef,
  formError,
  idPrefix = "onboarding-interests",
  classes,
}: OnboardingStepInterestsProps) {
  const form = useForm<OnboardingStepInterestsValues>({
    resolver: zodResolver(onboardingStepInterestsSchema),
    defaultValues,
  });
  const { errors } = form.formState;
  const [showOther, setShowOther] = useState(Boolean(defaultValues.interestsOther));
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <form
      className="grid gap-7"
      noValidate
      aria-labelledby={`${idPrefix}-heading`}
      onSubmit={form.handleSubmit((values) =>
        onSubmit(showOther ? values : { ...values, interestsOther: "" }),
      )}
    >
      <header className="grid gap-1.5">
        <Heading
          id={`${idPrefix}-heading`}
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl tracking-tight outline-none"
        >
          Which classes are you curious about?
        </Heading>
        <p className="text-sm text-muted-foreground">
          Optional. We use this to suggest sessions and plan new classes.
        </p>
      </header>

      <fieldset className="grid gap-3">
        <legend className="sr-only">Classes</legend>
        <Controller
          control={form.control}
          name="interestClassIds"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {classes.map((gymClass) => {
                const selected = field.value.includes(gymClass.id);
                return (
                  <label
                    key={gymClass.id}
                    className={cn(
                      "group relative grid cursor-pointer overflow-hidden rounded-xl border bg-card transition-colors",
                      "has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2",
                      selected
                        ? "border-primary ring-1 ring-primary"
                        : "border-border hover:border-foreground/40",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      name={field.name}
                      value={gymClass.id}
                      checked={selected}
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        field.onChange(
                          event.target.checked
                            ? [...field.value, gymClass.id]
                            : field.value.filter((id) => id !== gymClass.id),
                        )
                      }
                    />
                    <span className="relative block aspect-[4/3] bg-muted">
                      {gymClass.heroImage ? (
                        <Image
                          src={gymClass.heroImage}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 50vw, 220px"
                          className="object-cover"
                          unoptimized={gymClass.heroImage.startsWith("https:")}
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-muted-foreground">
                          <Dumbbell className="size-6" aria-hidden="true" />
                        </span>
                      )}
                      {selected ? (
                        <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3.5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </span>
                    <span className="px-3 py-2.5 text-sm leading-snug font-medium">
                      {gymClass.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        />
      </fieldset>

      <div className="grid gap-3">
        <label className={cn(chipVariants({ selected: showOther }), "justify-self-start")}>
          <input
            type="checkbox"
            className="sr-only"
            checked={showOther}
            onChange={(event) => setShowOther(event.target.checked)}
          />
          Something else
        </label>
        {showOther ? (
          <Field invalid={Boolean(errors.interestsOther)} className="max-w-md">
            <FieldLabel>What would you like us to offer?</FieldLabel>
            <Input maxLength={ONBOARDING_OTHER_MAX} {...form.register("interestsOther")} />
            <FieldError errors={[errors.interestsOther]} />
          </Field>
        ) : null}
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}
      {footer}
    </form>
  );
}
