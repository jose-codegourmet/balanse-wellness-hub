"use client";

import {
  getDisplayName,
  ONBOARDING_INPUT_STEPS,
  ONBOARDING_STEP_LABELS,
  type OnboardingInputStepId,
  type OnboardingStepId,
} from "@balanse/domain";
import { Button } from "@balanse/ui";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AvatarUploader } from "@/components/balanse/avatar-uploader/AvatarUploader";
import { notify } from "@/modules/notifications/notify";
import type { OnboardingWizardProps } from "./OnboardingWizard.meta";
import { OnboardingStepDone } from "./onboarding-step-done/OnboardingStepDone";
import { OnboardingStepGoals } from "./onboarding-step-goals/OnboardingStepGoals";
import { onboardingStepGoalsValuesFrom } from "./onboarding-step-goals/OnboardingStepGoals.defaults";
import { OnboardingStepHeardFrom } from "./onboarding-step-heard-from/OnboardingStepHeardFrom";
import {
  onboardingStepHeardFromValuesFrom,
  referredByCustomer,
} from "./onboarding-step-heard-from/OnboardingStepHeardFrom.defaults";
import { OnboardingStepInterests } from "./onboarding-step-interests/OnboardingStepInterests";
import { onboardingStepInterestsValuesFrom } from "./onboarding-step-interests/OnboardingStepInterests.defaults";
import { OnboardingStepYou } from "./onboarding-step-you/OnboardingStepYou";
import { onboardingStepYouValuesFrom } from "./onboarding-step-you/OnboardingStepYou.defaults";

const TOTAL = ONBOARDING_INPUT_STEPS.length;

export function OnboardingWizard({
  profile: initialProfile,
  answers,
  classes,
  referralChannel,
  initialStep,
  returnTo,
  returnLabel,
  actions,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStepId>(initialStep);
  const [profile, setProfile] = useState(initialProfile);
  const [busy, setBusy] = useState<"saving" | "skipping" | null>(null);
  const [errors, setErrors] = useState<Partial<Record<OnboardingStepId, string>>>({});
  const headings = useRef<Partial<Record<OnboardingStepId, HTMLHeadingElement | null>>>({});
  const mounted = useRef(false);

  // Defaults are computed once: every step form stays mounted, so Back keeps edits.
  const [initial] = useState(() => ({
    you: onboardingStepYouValuesFrom(initialProfile),
    goals: onboardingStepGoalsValuesFrom(answers),
    interests: onboardingStepInterestsValuesFrom(
      answers,
      classes.map((gymClass) => gymClass.id),
    ),
    heardFrom: onboardingStepHeardFromValuesFrom(answers, referralChannel),
  }));

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headings.current[step]?.focus();
  }, [step]);

  const index = ONBOARDING_INPUT_STEPS.indexOf(step as OnboardingInputStepId);

  function goTo(next: OnboardingStepId) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function next() {
    const following = ONBOARDING_INPUT_STEPS[index + 1];
    goTo(following ?? "done");
  }

  /** Runs a save; on failure keeps the step and shows the message. */
  async function save(
    id: OnboardingInputStepId,
    work: () => Promise<{ ok: true } | { ok: false; error: string }>,
  ): Promise<boolean> {
    setBusy("saving");
    setErrors((current) => ({ ...current, [id]: undefined }));
    const result = await work();
    setBusy(null);
    if (!result.ok) {
      setErrors((current) => ({ ...current, [id]: result.error }));
      notify.error({ title: "That didn't save", description: result.error });
      return false;
    }
    return true;
  }

  async function skip() {
    setBusy("skipping");
    const result = await actions.skip();
    if (!result.ok) {
      setBusy(null);
      notify.error({ title: "Couldn't skip right now", description: result.error });
      return;
    }
    router.push(returnTo);
  }

  function footer(id: OnboardingInputStepId) {
    const position = ONBOARDING_INPUT_STEPS.indexOf(id);
    const saving = busy !== null && step === id;
    return (
      <div className="flex flex-wrap-reverse items-center justify-between gap-3 border-t border-border pt-5">
        {position > 0 ? (
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null}
            onClick={() => goTo(ONBOARDING_INPUT_STEPS[position - 1] ?? "you")}
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={busy !== null}>
          {saving && busy === "saving" ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {position === TOTAL - 1 ? "Finish" : "Continue"}
          {saving ? null : <ArrowRight className="size-4" aria-hidden="true" />}
        </Button>
      </div>
    );
  }

  const headingRef = (id: OnboardingStepId) => (node: HTMLHeadingElement | null) => {
    headings.current[id] = node;
  };

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-8 px-4 py-10 sm:px-6 md:py-14">
      <header className="grid gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <p className="text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase">
              Welcome to Balansé
            </p>
            <h1 className="font-display text-3xl tracking-tight md:text-4xl">
              {step === "done" ? "That's everything" : "Let's get to know you"}
            </h1>
          </div>
          {step === "done" ? null : (
            <Button
              type="button"
              variant="link"
              className="shrink-0"
              disabled={busy !== null}
              onClick={() => void skip()}
            >
              {busy === "skipping" ? "Skipping…" : "Skip for now"}
            </Button>
          )}
        </div>
        {step === "done" ? null : (
          <div className="grid gap-2">
            <p className="text-sm" aria-live="polite">
              <span className="font-medium">
                Step {index + 1} of {TOTAL}
              </span>
              <span className="text-muted-foreground"> · {ONBOARDING_STEP_LABELS[step]}</span>
            </p>
            <div className="flex gap-1.5" aria-hidden="true">
              {ONBOARDING_INPUT_STEPS.map((id, position) => (
                <span
                  key={id}
                  className={
                    position <= index
                      ? "h-1 flex-1 rounded-full bg-primary"
                      : "h-1 flex-1 rounded-full bg-muted"
                  }
                />
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="rounded-2xl bg-card p-5 sm:p-8">
        <div hidden={step !== "you"}>
          <OnboardingStepYou
            defaultValues={initial.you}
            headingRef={headingRef("you")}
            formError={errors.you}
            avatarUrl={profile.avatarUrl}
            seed={profile.id}
            avatarSlot={
              <AvatarUploader
                name={{ firstName: profile.firstName, lastName: profile.lastName }}
                avatarUrl={profile.avatarUrl}
                seed={profile.id}
                onSave={async (dataUrl) => {
                  const result = await actions.setAvatar({ dataUrl });
                  if (!result.ok) return result.error;
                  setProfile(result.value);
                  router.refresh();
                  return null;
                }}
                onRemove={async () => {
                  const result = await actions.setAvatar(null);
                  if (!result.ok) return result.error;
                  setProfile(result.value);
                  router.refresh();
                  return null;
                }}
              />
            }
            footer={footer("you")}
            onSubmit={async (values) => {
              const ok = await save("you", async () => {
                const result = await actions.patchProfile({
                  firstName: values.firstName,
                  lastName: values.lastName,
                  nickname: values.nickname || null,
                });
                if (result.ok) setProfile(result.value);
                return result;
              });
              if (ok) {
                router.refresh();
                next();
              }
            }}
          />
        </div>
        <div hidden={step !== "goals"}>
          <OnboardingStepGoals
            defaultValues={initial.goals}
            headingRef={headingRef("goals")}
            formError={errors.goals}
            footer={footer("goals")}
            onSubmit={async (values) => {
              if (await save("goals", () => actions.saveAnswers(values))) next();
            }}
          />
        </div>
        <div hidden={step !== "interests"}>
          <OnboardingStepInterests
            classes={classes}
            defaultValues={initial.interests}
            headingRef={headingRef("interests")}
            formError={errors.interests}
            footer={footer("interests")}
            onSubmit={async (values) => {
              if (await save("interests", () => actions.saveAnswers(values))) next();
            }}
          />
        </div>
        <div hidden={step !== "heard-from"}>
          <OnboardingStepHeardFrom
            defaultValues={initial.heardFrom}
            referredByFriend={referredByCustomer(referralChannel)}
            headingRef={headingRef("heard-from")}
            formError={errors["heard-from"]}
            footer={footer("heard-from")}
            onSubmit={async (values) => {
              const ok = await save("heard-from", async () => {
                const saved = await actions.saveAnswers(values);
                if (!saved.ok) return saved;
                const completed = await actions.complete();
                if (completed.ok) setProfile(completed.value);
                return completed;
              });
              if (ok) goTo("done");
            }}
          />
        </div>
        {step === "done" ? (
          <OnboardingStepDone
            displayName={getDisplayName(profile)}
            returnTo={returnTo}
            returnLabel={returnLabel}
            headingRef={headingRef("done")}
          />
        ) : null}
      </div>
    </div>
  );
}
