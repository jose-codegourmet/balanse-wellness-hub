"use client";

import type {
  CustomerOnboardingAnswers,
  CustomerProfile,
  CustomerProfileSectionId,
  PolicyAcceptance,
  PublicClass,
  ReferralChannel,
} from "@balanse/domain";
import { joinFullName } from "@balanse/domain";
import { UserAvatar } from "@balanse/ui";
import { UserRound } from "lucide-react";
import { useState } from "react";
import type { CustomerOnboardingActions } from "../../_lib/customer-self-service.types";
import { AboutYouSection } from "./about-you-section/AboutYouSection";
import { AccountSettingsSection } from "./account-settings-section/AccountSettingsSection";
import { BasicProfileSection } from "./basic-profile-section/BasicProfileSection";
import { PasswordSettingsSection } from "./password-settings-section/PasswordSettingsSection";
import { PolicyHistorySection } from "./policy-history-section/PolicyHistorySection";
import { ProfileSettingsNav } from "./profile-settings-nav/ProfileSettingsNav";
import "@/components/balanse/portal/portal.css";

/**
 * Profile settings area (FE-CUS-017). The shell — heading, identity summary,
 * submenu — is shared; the routes under `/portal/profile/*` pick the section.
 * Only the active section is rendered, so nothing hidden is announced.
 */
export function ProfilePage({
  initialProfile,
  initialAcceptances,
  section = "basic",
  forcedStatus,
  forcedPasswordStatus,
  about,
  actions,
}: {
  initialProfile: CustomerProfile;
  initialAcceptances: PolicyAcceptance[];
  section?: CustomerProfileSectionId;
  forcedStatus?: "saving" | "failed";
  forcedPasswordStatus?: "saved";
  /** Loaded only for the `about` section (#352). */
  about?: {
    answers: CustomerOnboardingAnswers | null;
    classes: PublicClass[];
    referralChannel: ReferralChannel | null;
  };
  /** Self-service server actions from the route; stories pass mock ones. */
  actions: CustomerOnboardingActions;
}) {
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const fullName = joinFullName(savedProfile) || savedProfile.fullName;

  return (
    <div className="portal-profile">
      <header className="profile-heading">
        <p className="profile-eyebrow">Your account</p>
        <h1 className="font-display">My profile</h1>
        <p>A few details to make every visit feel personal.</p>
      </header>
      <div className="profile-summary">
        <UserAvatar
          name={{ firstName: savedProfile.firstName, lastName: savedProfile.lastName }}
          avatarUrl={savedProfile.avatarUrl}
          seed={savedProfile.id}
          size="xl"
          className="size-16 text-xl"
        />
        <div>
          <h2 className="font-display">{fullName}</h2>
          <p>{savedProfile.email}</p>
        </div>
        <span className="profile-account-label">
          <UserRound size={15} aria-hidden="true" /> Your Balansé account
        </span>
      </div>
      <div className="profile-layout">
        <ProfileSettingsNav activeSection={section} />
        <div className="profile-sections">
          {section === "basic" ? (
            <BasicProfileSection
              profile={savedProfile}
              onSaved={setSavedProfile}
              actions={actions}
              forcedStatus={forcedStatus}
            />
          ) : null}
          {section === "about" ? (
            <AboutYouSection
              profile={savedProfile}
              answers={about?.answers ?? null}
              classes={about?.classes ?? []}
              referralChannel={about?.referralChannel ?? null}
              actions={actions}
            />
          ) : null}
          {section === "account" ? <AccountSettingsSection profile={savedProfile} /> : null}
          {section === "password" ? (
            <PasswordSettingsSection profile={savedProfile} forcedStatus={forcedPasswordStatus} />
          ) : null}
          {section === "policies" ? (
            <PolicyHistorySection acceptances={initialAcceptances} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
