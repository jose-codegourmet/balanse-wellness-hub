"use client";

import type { CustomerProfile } from "@balanse/domain";
import { PROFILE_FIELDS_NOTE, validateCustomerProfile } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Input, Label } from "@balanse/ui";
import { ArrowUpRight, LoaderCircle, Mail, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/jabkit/button";
import { notify } from "@/modules/notifications/notify";

export function BasicProfileSection({
  profile,
  onSaved,
  forcedStatus,
}: {
  profile: CustomerProfile;
  onSaved: (next: CustomerProfile) => void;
  forcedStatus?: "saving" | "failed";
}) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [contactNumber, setContactNumber] = useState(profile.contactNumber);
  const [errors, setErrors] = useState<
    Partial<Record<"fullName" | "email" | "contactNumber", string>>
  >({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">(
    forcedStatus ?? "idle",
  );

  return (
    <section data-section="profile" className="profile-panel">
      <div className="profile-section-title">
        <UserRound size={21} strokeWidth={1.5} aria-hidden="true" />
        <h2 className="font-display">Basic profile</h2>
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
            .patchMe(profile.id, { fullName, email, contactNumber })
            .then(() => {
              onSaved({ ...profile, fullName, email, contactNumber });
              setStatus("saved");
              notify.portal("profile.saved");
            })
            .catch(() => {
              setStatus("failed");
              notify.portal("profile.save-failed");
            });
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
        {/* A successful save is announced by the toast. Failures keep a
            form-level live region so the message stays next to the fields
            after the toast has auto-dismissed. */}
        {status === "failed" ? (
          <p role="alert" aria-live="assertive" className="text-sm text-destructive">
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
  );
}
