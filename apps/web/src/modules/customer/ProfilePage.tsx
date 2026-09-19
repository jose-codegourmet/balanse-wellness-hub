"use client";

import type { CustomerProfile, PolicyAcceptance } from "@balanse/domain";
import {
  customerAuthMethodLabel,
  formatSessionDate,
  PROFILE_FIELDS_NOTE,
  validateCustomerProfile,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { Button, Input, Label, LocalizedSkeleton } from "@balanse/ui";
import { useState } from "react";

export function ProfilePage({
  initialProfile,
  initialAcceptances,
  forcedStatus,
}: {
  initialProfile: CustomerProfile;
  initialAcceptances: PolicyAcceptance[];
  forcedStatus?: "saving" | "saved" | "failed";
}) {
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [email, setEmail] = useState(initialProfile.email);
  const [contactNumber, setContactNumber] = useState(initialProfile.contactNumber);
  const [errors, setErrors] = useState<
    Partial<Record<"fullName" | "email" | "contactNumber", string>>
  >({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">(
    forcedStatus === "saving" ? "saving" : (forcedStatus ?? "idle"),
  );

  if (status === "saving") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <LocalizedSkeleton lines={5} label="Saving profile" />
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
      <section data-section="profile">
        <h1 className="font-display text-3xl">Profile</h1>
        <p className="sr-only">{PROFILE_FIELDS_NOTE}</p>
        <form
          className="mt-6 grid gap-4"
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
              .then(() => setStatus("saved"))
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
              onChange={(event) => setFullName(event.target.value)}
            />
            {errors.fullName ? <p className="text-sm text-destructive">{errors.fullName}</p> : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="profile-contact">Contact number</Label>
            <Input
              id="profile-contact"
              type="tel"
              value={contactNumber}
              autoComplete="tel"
              aria-invalid={Boolean(errors.contactNumber)}
              onChange={(event) => setContactNumber(event.target.value)}
            />
            {errors.contactNumber ? (
              <p className="text-sm text-destructive">{errors.contactNumber}</p>
            ) : null}
          </div>
          {status === "saved" ? (
            <p role="status" className="text-sm">
              Profile saved in this mock. Booking forms will use these details.
            </p>
          ) : null}
          {status === "failed" ? (
            <p role="alert" className="text-sm text-destructive">
              The mock profile could not be saved. Try again.
            </p>
          ) : null}
          <Button type="submit">Save</Button>
        </form>
      </section>

      <section data-section="account">
        <h2 className="font-display text-2xl">Account</h2>
        <p className="mt-2 text-sm">
          Auth method: {customerAuthMethodLabel(initialProfile.authMethod)}
        </p>
        {initialProfile.authMethod === "email" ? (
          <p className="mt-3 text-sm">
            Change password is available for this email-and-password mock account. No reset is sent.
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Change password is hidden for Google mock principals.
          </p>
        )}
      </section>

      <section data-section="policy-history">
        <h2 className="font-display text-2xl">Policy / waiver history</h2>
        {initialAcceptances.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No accepted versions recorded yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {initialAcceptances.map((row) => (
              <li key={`${row.documentName}-${row.version}`}>
                {row.documentName} {row.version} · accepted {formatSessionDate(row.acceptedAt)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
