"use client";

import type { CustomerProfile } from "@balanse/domain";
import {
  customerAuthMethodCopy,
  customerAuthMethodLabel,
  customerProfileSection,
} from "@balanse/domain";
import { ArrowUpRight, Check, Globe, KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/jabkit/button";

/**
 * Sign-in method as a connected-account row rather than a sentence. Every
 * control here is mocked: `INF-005` owns real Google linking and unlinking, so
 * the manage affordance is inert and says so.
 */
export function AccountSettingsSection({ profile }: { profile: CustomerProfile }) {
  const copy = customerAuthMethodCopy(profile.authMethod);
  const isGoogle = profile.authMethod === "google";
  const ProviderIcon = isGoogle ? Globe : Mail;
  const passwordSection = customerProfileSection("password");

  return (
    <section data-section="account" className="profile-panel">
      <div className="profile-section-title">
        <KeyRound size={21} strokeWidth={1.5} aria-hidden="true" />
        <h2 className="font-display">Account settings</h2>
      </div>
      <p className="profile-description">How you sign in to Balansé.</p>

      <div className="profile-connected-account">
        <span className="profile-connected-icon" aria-hidden="true">
          <ProviderIcon size={19} strokeWidth={1.5} />
        </span>
        <div className="profile-connected-identity">
          <strong>{copy.provider}</strong>
          <span>{profile.email}</span>
        </div>
        <span className="profile-connected-state">
          <Check size={14} aria-hidden="true" /> Connected
        </span>
        <Button
          type="button"
          variant="secondary"
          className="profile-connected-action"
          aria-disabled="true"
          aria-describedby="account-manage-note"
          onClick={(event) => event.preventDefault()}
        >
          {isGoogle ? "Disconnect Google" : "Manage sign-in"}
        </Button>
      </div>
      <p id="account-manage-note" className="profile-mock-note">
        {copy.mockNote}
      </p>

      <div className="profile-auth-method">
        <span>Sign-in method</span>
        <strong>{customerAuthMethodLabel(profile.authMethod)}</strong>
      </div>
      <p className="profile-description">{copy.summary}</p>

      <p className="profile-section-link">
        <Link href={passwordSection.href}>
          {passwordSection.label} <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </p>
    </section>
  );
}
