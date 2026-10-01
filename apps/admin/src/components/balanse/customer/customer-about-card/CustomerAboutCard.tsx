"use client";

import {
  type CustomerOnboardingAnswers,
  EXPERIENCE_LEVEL_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  HEARD_FROM_OPTIONS,
  ONBOARDING_STATUS_LABELS,
  optionLabel,
} from "@balanse/domain";
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from "@balanse/ui";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { CustomerAboutCardProps, InterestClass } from "./CustomerAboutCard.meta";

export type { CustomerAboutCardProps, InterestClass } from "./CustomerAboutCard.meta";
export { useInterestClassLookup } from "./useInterestClassLookup";

function hasAnswers(
  answers: CustomerOnboardingAnswers | null,
): answers is CustomerOnboardingAnswers {
  if (!answers) return false;
  return Boolean(
    answers.goals.length ||
      answers.goalsOther.trim() ||
      answers.experienceLevel ||
      answers.interestClassIds.length ||
      answers.interestsOther.trim() ||
      answers.heardFrom,
  );
}

function goalLabels(answers: CustomerOnboardingAnswers): string[] {
  return answers.goals
    .filter((goal) => goal !== "OTHER" || !answers.goalsOther.trim())
    .map((goal) => optionLabel(FITNESS_GOAL_OPTIONS, goal));
}

function interestName(classes: CustomerAboutCardProps["classes"], id: string): string {
  const row: InterestClass | undefined = classes[id];
  if (!row) return "Unlisted class";
  return row.active ? row.name : `${row.name} (inactive)`;
}

function Interests({
  answers,
  classes,
  classHref,
}: Pick<CustomerAboutCardProps, "classes" | "classHref"> & {
  answers: CustomerOnboardingAnswers;
}) {
  if (answers.interestClassIds.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {answers.interestClassIds.map((id) => {
        const name = interestName(classes, id);
        const href = classHref?.(id) ?? null;
        return (
          <li key={id}>
            {href ? (
              <Link
                href={href}
                className="text-sm font-medium underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {name}
              </Link>
            ) : (
              <Badge appearance="soft" size="sm" variant="neutral">
                {name}
              </Badge>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function OtherText({ label, text }: { label: string; text: string }) {
  if (!text.trim()) return null;
  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{label}:</span> “{text.trim()}”
    </p>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <dt className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="grid gap-1.5 text-sm">{children}</dd>
    </div>
  );
}

const NOT_ANSWERED = <span className="text-muted-foreground">Not answered</span>;

function CompactAbout({
  answers,
  classes,
  classHref,
  className,
}: Pick<CustomerAboutCardProps, "classes" | "classHref" | "className"> & {
  answers: CustomerOnboardingAnswers;
}) {
  const goals = goalLabels(answers);
  const experience = answers.experienceLevel
    ? optionLabel(EXPERIENCE_LEVEL_OPTIONS, answers.experienceLevel)
    : null;
  const hasMore =
    answers.interestClassIds.length > 0 ||
    Boolean(answers.interestsOther.trim()) ||
    Boolean(answers.goalsOther.trim());

  return (
    <div className={cn("grid gap-2", className)} data-slot="customer-about-compact">
      {goals.length || experience ? (
        <ul className="flex flex-wrap items-center gap-1.5" aria-label="Goals and experience">
          {goals.map((goal) => (
            <li key={goal}>
              <Badge appearance="soft" size="sm" variant="neutral">
                {goal}
              </Badge>
            </li>
          ))}
          {experience ? (
            <li className="flex items-center gap-1.5">
              {goals.length ? (
                <span aria-hidden className="text-muted-foreground">
                  ·
                </span>
              ) : null}
              <Badge appearance="soft" size="sm" variant="info">
                {experience}
              </Badge>
            </li>
          ) : null}
        </ul>
      ) : null}
      {hasMore ? (
        <Collapsible>
          <CollapsibleTrigger
            render={
              <Button type="button" variant="ghost" size="sm" className="group/about -ml-2" />
            }
          >
            <ChevronDownIcon
              aria-hidden
              className="transition-transform group-data-[panel-open]/about:rotate-180 motion-reduce:transition-none"
            />
            Interests / Other
          </CollapsibleTrigger>
          <CollapsibleContent className="grid gap-2 pt-1">
            <Interests answers={answers} classes={classes} classHref={classHref} />
            <OtherText label="Other goal" text={answers.goalsOther} />
            <OtherText label="Other interest" text={answers.interestsOther} />
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  );
}

export function CustomerAboutCard({
  onboarding,
  onboardingStatus,
  classes,
  classHref = null,
  showHeardFrom = true,
  variant = "card",
  title = "About",
  className,
}: CustomerAboutCardProps) {
  const answered = hasAnswers(onboarding);
  const experienceDescription = EXPERIENCE_LEVEL_OPTIONS.find(
    (option) => option.value === onboarding?.experienceLevel,
  )?.description;

  if (variant === "compact") {
    return answered ? (
      <CompactAbout
        answers={onboarding}
        classes={classes}
        classHref={classHref}
        className={className}
      />
    ) : null;
  }

  const statusNote =
    onboardingStatus && onboardingStatus !== "completed" ? (
      <Badge appearance="soft" size="sm" variant={answered ? "neutral" : "warning"}>
        Onboarding {ONBOARDING_STATUS_LABELS[onboardingStatus].toLowerCase()}
      </Badge>
    ) : null;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
        className,
      )}
      aria-label={title}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
        <h2 className="font-display text-xl leading-tight">{title}</h2>
        {statusNote}
      </header>
      {answered ? (
        <dl className="grid gap-5 p-5">
          <Row label="Goals">
            {goalLabels(onboarding).length ? (
              <ul className="flex flex-wrap gap-1.5" aria-label="Goals">
                {goalLabels(onboarding).map((goal) => (
                  <li key={goal}>
                    <Badge appearance="soft" size="sm" variant="neutral">
                      {goal}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : onboarding.goalsOther.trim() ? null : (
              NOT_ANSWERED
            )}
            <OtherText label="Other" text={onboarding.goalsOther} />
          </Row>
          <Row label="Experience">
            {onboarding.experienceLevel ? (
              <p>
                <span className="font-medium">
                  {optionLabel(EXPERIENCE_LEVEL_OPTIONS, onboarding.experienceLevel)}
                </span>
                {experienceDescription ? (
                  <span className="block text-xs text-muted-foreground">
                    {experienceDescription}
                  </span>
                ) : null}
              </p>
            ) : (
              NOT_ANSWERED
            )}
          </Row>
          <Row label="Interests">
            {onboarding.interestClassIds.length === 0 && !onboarding.interestsOther.trim()
              ? NOT_ANSWERED
              : null}
            <Interests answers={onboarding} classes={classes} classHref={classHref} />
            <OtherText label="Other" text={onboarding.interestsOther} />
          </Row>
          {showHeardFrom ? (
            <Row label="Heard about us">
              {onboarding.heardFrom ? (
                <p className="font-medium">
                  {optionLabel(HEARD_FROM_OPTIONS, onboarding.heardFrom)}
                </p>
              ) : (
                NOT_ANSWERED
              )}
              {onboarding.heardFrom === "OTHER" ? (
                <OtherText label="Other" text={onboarding.heardFromOther} />
              ) : null}
            </Row>
          ) : null}
        </dl>
      ) : (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-medium">Hasn't completed onboarding yet</p>
          {onboardingStatus ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Status: {ONBOARDING_STATUS_LABELS[onboardingStatus]}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
