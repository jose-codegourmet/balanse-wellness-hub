"use client";

import { type CustomerOnboardingAnswers, formatSessionDate } from "@balanse/domain";
import { Button } from "@balanse/ui";
import { ArrowUpRight, EyeOff, LoaderCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { notify } from "@/modules/notifications/notify";
import { OnboardingStepGoals } from "../../../../welcome/_components/onboarding-wizard/onboarding-step-goals/OnboardingStepGoals";
import { onboardingStepGoalsValuesFrom } from "../../../../welcome/_components/onboarding-wizard/onboarding-step-goals/OnboardingStepGoals.defaults";
import { OnboardingStepHeardFrom } from "../../../../welcome/_components/onboarding-wizard/onboarding-step-heard-from/OnboardingStepHeardFrom";
import {
  onboardingStepHeardFromValuesFrom,
  referredByCustomer,
} from "../../../../welcome/_components/onboarding-wizard/onboarding-step-heard-from/OnboardingStepHeardFrom.defaults";
import { OnboardingStepInterests } from "../../../../welcome/_components/onboarding-wizard/onboarding-step-interests/OnboardingStepInterests";
import { onboardingStepInterestsValuesFrom } from "../../../../welcome/_components/onboarding-wizard/onboarding-step-interests/OnboardingStepInterests.defaults";
import type { OnboardingAnswersPatch } from "../../../_lib/customer-self-service.types";
import type { AboutYouSectionProps } from "./AboutYouSection.meta";

type PanelId = "goals" | "interests" | "heard-from";

export function AboutYouSection({
  profile,
  answers: initialAnswers,
  classes,
  referralChannel,
  actions,
}: AboutYouSectionProps) {
  const [answers, setAnswers] = useState<CustomerOnboardingAnswers | null>(initialAnswers);
  const [saving, setSaving] = useState<PanelId | null>(null);
  const [errors, setErrors] = useState<Partial<Record<PanelId, string>>>({});
  // Defaults are captured once; each form owns its edits after mount.
  const [initial] = useState(() => ({
    goals: onboardingStepGoalsValuesFrom(initialAnswers),
    interests: onboardingStepInterestsValuesFrom(
      initialAnswers,
      classes.map((gymClass) => gymClass.id),
    ),
    heardFrom: onboardingStepHeardFromValuesFrom(initialAnswers, referralChannel),
  }));

  async function save(panel: PanelId, patch: OnboardingAnswersPatch) {
    setSaving(panel);
    setErrors((current) => ({ ...current, [panel]: undefined }));
    const result = await actions.saveAnswers(patch);
    setSaving(null);
    if (!result.ok) {
      setErrors((current) => ({ ...current, [panel]: result.error }));
      notify.portal("profile.save-failed");
      return;
    }
    setAnswers(result.value);
    notify.portal("profile.saved");
  }

  function footer(panel: PanelId): ReactNode {
    return (
      <div className="profile-form-actions">
        <span />
        <Button type="submit" disabled={saving !== null}>
          {saving === panel ? (
            <>
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Saving…
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    );
  }

  return (
    <section data-section="about" className="profile-panel">
      <div className="profile-section-title">
        <Sparkles size={21} strokeWidth={1.5} aria-hidden="true" />
        <h2 className="font-display">About you</h2>
      </div>
      <p className="profile-description flex items-start gap-2">
        <EyeOff size={14} className="mt-1 shrink-0" aria-hidden="true" />
        Visible to you, your coaches and studio staff. Never shown to other members.
      </p>
      <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
        {answers?.updatedAt
          ? `Last updated ${formatSessionDate(answers.updatedAt)}`
          : "Nothing saved yet."}
      </p>
      {profile.onboardingStatus === "completed" ? null : (
        <p className="profile-section-link">
          <Link href="/portal/welcome?returnTo=/portal/profile/about">
            Finish the welcome steps <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </p>
      )}

      <div className="mt-8 grid gap-10">
        <OnboardingStepGoals
          idPrefix="about-goals"
          headingLevel={3}
          defaultValues={initial.goals}
          formError={errors.goals}
          footer={footer("goals")}
          onSubmit={(values) => save("goals", values)}
        />
        <div className="border-t border-border pt-8">
          <OnboardingStepInterests
            idPrefix="about-interests"
            headingLevel={3}
            classes={classes}
            defaultValues={initial.interests}
            formError={errors.interests}
            footer={footer("interests")}
            onSubmit={(values) => save("interests", values)}
          />
        </div>
        <div className="border-t border-border pt-8">
          <OnboardingStepHeardFrom
            idPrefix="about-heard-from"
            headingLevel={3}
            defaultValues={initial.heardFrom}
            referredByFriend={!initialAnswers?.heardFrom && referredByCustomer(referralChannel)}
            formError={errors["heard-from"]}
            footer={footer("heard-from")}
            onSubmit={(values) => save("heard-from", values)}
          />
        </div>
      </div>
    </section>
  );
}
