"use client";

import {
  EXPERIENCE_LEVEL_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  ONBOARDING_OTHER_MAX,
} from "@balanse/domain";
import { chipVariants, Field, FieldError, FieldLabel, Input, OptionRow } from "@balanse/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { cn } from "@/lib/cn";
import { onboardingStepGoalsDefaultValues } from "./OnboardingStepGoals.defaults";
import type { OnboardingStepGoalsProps } from "./OnboardingStepGoals.meta";
import {
  type OnboardingStepGoalsValues,
  onboardingStepGoalsSchema,
} from "./OnboardingStepGoals.schema";

export function OnboardingStepGoals({
  defaultValues = onboardingStepGoalsDefaultValues,
  onSubmit,
  footer,
  headingLevel = 2,
  headingRef,
  formError,
  idPrefix = "onboarding-goals",
}: OnboardingStepGoalsProps) {
  const form = useForm<OnboardingStepGoalsValues>({
    resolver: zodResolver(onboardingStepGoalsSchema),
    defaultValues,
  });
  const { errors } = form.formState;
  const goals = useWatch({ control: form.control, name: "goals" });
  const experience = useWatch({ control: form.control, name: "experienceLevel" });
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <form
      className="grid gap-7"
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
          Goals & experience
        </Heading>
        <p className="text-sm text-muted-foreground">Helps your coaches tailor the class to you.</p>
      </header>

      <fieldset
        className="grid gap-3"
        aria-describedby={errors.goals ? `${idPrefix}-goals-error` : undefined}
      >
        <legend className="mb-3 text-xs font-semibold tracking-[0.12em] uppercase">
          What would you like to work on?
        </legend>
        <Controller
          control={form.control}
          name="goals"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {FITNESS_GOAL_OPTIONS.map((option) => {
                const selected = field.value.includes(option.value);
                return (
                  <label key={option.value} className={chipVariants({ selected })}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      name={field.name}
                      value={option.value}
                      checked={selected}
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        field.onChange(
                          event.target.checked
                            ? [...field.value, option.value]
                            : field.value.filter((value) => value !== option.value),
                        )
                      }
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          )}
        />
        {errors.goals ? (
          <p id={`${idPrefix}-goals-error`} role="alert" className="text-sm text-destructive">
            {errors.goals.message}
          </p>
        ) : null}
        {goals.includes("OTHER") ? (
          <Field invalid={Boolean(errors.goalsOther)} className="mt-1 max-w-md">
            <FieldLabel>Your other goal</FieldLabel>
            <Input maxLength={ONBOARDING_OTHER_MAX} {...form.register("goalsOther")} />
            <FieldError errors={[errors.goalsOther]} />
          </Field>
        ) : null}
      </fieldset>

      <fieldset
        className="grid gap-2"
        aria-describedby={errors.experienceLevel ? `${idPrefix}-experience-error` : undefined}
      >
        <legend className="mb-3 text-xs font-semibold tracking-[0.12em] uppercase">
          How much do you train?
        </legend>
        {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
              "has-focus-visible:ring-2 has-focus-visible:ring-ring",
              experience === option.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-foreground/40",
            )}
          >
            <input
              type="radio"
              className="size-4 shrink-0 accent-primary"
              value={option.value}
              {...form.register("experienceLevel")}
            />
            <OptionRow
              label={option.label}
              description={option.description}
              className="[&_[data-slot=option-description]]:whitespace-normal [&_[data-slot=option-label]]:font-medium"
            />
          </label>
        ))}
        {errors.experienceLevel ? (
          <p id={`${idPrefix}-experience-error`} role="alert" className="text-sm text-destructive">
            {errors.experienceLevel.message}
          </p>
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
