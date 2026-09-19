"use client";

import type { CustomerProfile, PolicyAcceptance } from "@balanse/domain";
import {
  customerAuthMethodLabel,
  formatSessionDate,
  PROFILE_FIELDS_NOTE,
  validateCustomerProfile,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Input, Label } from "@balanse/ui";
import {
  ArrowUpRight,
  Check,
  FileCheck2,
  KeyRound,
  LoaderCircle,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/jabkit/button";
import { ProfileLogoutButton } from "@/modules/customer/ProfileLogoutButton";
import "@/components/balanse/portal/portal.css";

export function ProfilePage({
  initialProfile,
  initialAcceptances,
  forcedStatus,
}: {
  initialProfile: CustomerProfile;
  initialAcceptances: PolicyAcceptance[];
  forcedStatus?: "saving" | "saved" | "failed";
}) {
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [email, setEmail] = useState(initialProfile.email);
  const [contactNumber, setContactNumber] = useState(initialProfile.contactNumber);
  const [errors, setErrors] = useState<
    Partial<Record<"fullName" | "email" | "contactNumber", string>>
  >({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">(
    forcedStatus === "saving" ? "saving" : (forcedStatus ?? "idle"),
  );

  const initials = savedProfile.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("");

  return (
    <div className="portal-profile">
      <header className="profile-heading">
        <p className="profile-eyebrow">Your account</p>
        <h1 className="font-display">My profile</h1>
        <p>A few details to make every visit feel personal.</p>
      </header>
      <div className="profile-summary">
        <div className="profile-avatar" aria-hidden="true">
          {initials}
        </div>
        <div>
          <h2 className="font-display">{savedProfile.fullName}</h2>
          <p>{savedProfile.email}</p>
        </div>
        <span className="profile-account-label">
          <UserRound size={15} aria-hidden="true" /> Your Balansé account
        </span>
      </div>
      <div className="profile-columns">
        <section data-section="profile" className="profile-panel">
          <div className="profile-section-title">
            <UserRound size={21} strokeWidth={1.5} aria-hidden="true" />
            <h2 className="font-display">Personal details</h2>
          </div>
          <p className="profile-description">We’ll use these details for your class bookings.</p>
          <p className="sr-only">{PROFILE_FIELDS_NOTE}</p>
          <form
            className="profile-form"
            aria-busy={status === "saving"}
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              const result = validateCustomerProfile({ fullName, email, contactNumber });
              if (!result.ok) {
                setErrors(result.errors);
                return;
              }
              setErrors({});
              setStatus("saving");
              void getMockAdapter()
                .patchMe(initialProfile.id, { fullName, email, contactNumber })
                .then(() => {
                  setSavedProfile({ ...initialProfile, fullName, email, contactNumber });
                  setStatus("saved");
                })
                .catch(() => setStatus("failed"));
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                value={fullName}
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "profile-name-error" : undefined}
                onChange={(event) => setFullName(event.target.value)}
              />
              {errors.fullName ? (
                <p id="profile-name-error" className="text-sm text-destructive">
                  {errors.fullName}
                </p>
              ) : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="profile-email">
                <Mail size={14} aria-hidden="true" /> Email address
              </Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "profile-email-error" : undefined}
                onChange={(event) => setEmail(event.target.value)}
              />
              {errors.email ? (
                <p id="profile-email-error" className="text-sm text-destructive">
                  {errors.email}
                </p>
              ) : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="profile-contact">
                <Phone size={14} aria-hidden="true" /> Contact number
              </Label>
              <Input
                id="profile-contact"
                type="tel"
                value={contactNumber}
                autoComplete="tel"
                aria-invalid={Boolean(errors.contactNumber)}
                aria-describedby={errors.contactNumber ? "profile-contact-error" : undefined}
                onChange={(event) => setContactNumber(event.target.value)}
              />
              {errors.contactNumber ? (
                <p id="profile-contact-error" className="text-sm text-destructive">
                  {errors.contactNumber}
                </p>
              ) : null}
            </div>
            {status === "saved" ? (
              <p role="status" className="profile-save-status">
                <Check size={17} aria-hidden="true" />
                Profile saved in this mock. Booking forms will use these details.
              </p>
            ) : null}
            {status === "failed" ? (
              <p role="alert" className="text-sm text-destructive">
                The mock profile could not be saved. Try again.
              </p>
            ) : null}
            <div className="profile-form-actions">
              <span>You can update these anytime.</span>
              <Button type="submit" disabled={status === "saving"} className="profile-save-button">
                {status === "saving" ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Saving…
                  </>
                ) : (
                  <>
                    Save changes <ArrowUpRight size={17} aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>

        <div className="profile-secondary">
          <section data-section="account" className="profile-panel">
            <div className="profile-section-title">
              <KeyRound size={21} strokeWidth={1.5} aria-hidden="true" />
              <h2 className="font-display">Account access</h2>
            </div>
            <div className="profile-auth-method">
              <span>Sign-in method</span>
              <strong>{customerAuthMethodLabel(initialProfile.authMethod)}</strong>
            </div>
            {initialProfile.authMethod === "email" ? (
              <p className="mt-3 text-sm">
                Your account uses an email and password. Password changes are not connected in this
                preview.
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                You sign in with Google. Manage your password through your Google account.
              </p>
            )}
            <div className="profile-logout">
              <p>End this session on this device.</p>
              <ProfileLogoutButton />
            </div>
          </section>

          <section data-section="policy-history" className="profile-panel">
            <div className="profile-section-title">
              <FileCheck2 size={21} strokeWidth={1.5} aria-hidden="true" />
              <h2 className="font-display">Policies & waivers</h2>
            </div>
            <p className="profile-description">A record of the documents you’ve accepted.</p>
            {initialAcceptances.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No accepted versions recorded yet.
              </p>
            ) : (
              <ul className="profile-policy-list">
                {initialAcceptances.map((row) => (
                  <li key={`${row.documentName}-${row.version}`}>
                    <Check size={16} aria-hidden="true" />
                    <div>
                      <strong>{row.documentName}</strong>
                      <span>
                        {row.version} · Accepted {formatSessionDate(row.acceptedAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
