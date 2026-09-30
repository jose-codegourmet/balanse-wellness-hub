"use client";

import { type PolicyDocumentVersion, validateContactForm } from "@balanse/domain";
import { Alert, AlertDescription, AlertTitle, Button, Input, Label, Textarea } from "@balanse/ui";
import { CircleCheck, LoaderCircle, TriangleAlert } from "lucide-react";
import { useState } from "react";
import {
  PolicyAcceptance,
  usePolicyAcceptance,
} from "@/components/balanse/policy-acceptance/PolicyAcceptance";
import { notify } from "@/modules/notifications/notify";

/**
 * Mock-only contact form (FE-PUB-007). Nothing is sent: `validateContactForm`
 * decides the outcome. The submitted message stays in the textarea through
 * every state, so a success never makes the customer's words disappear.
 */
export function ContactForm({
  forcedOutcome,
  policies = [],
}: {
  forcedOutcome?: "success" | "failure" | "submitting";
  /** Current versions of the policies admin attached to the contact form. */
  policies?: PolicyDocumentVersion[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "message", string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "failure">(
    forcedOutcome ?? "idle",
  );
  const submitting = status === "submitting";
  const policyAcceptance = usePolicyAcceptance(policies);

  return (
    <form
      className="contact-form"
      noValidate
      aria-busy={submitting}
      onSubmit={(event) => {
        event.preventDefault();
        const result = validateContactForm({ name, email, message });
        const accepted = policyAcceptance.check();
        if (!result.ok) {
          setErrors(result.errors);
          return;
        }
        if (!accepted) return;
        setErrors({});
        setStatus("submitting");
        window.setTimeout(() => {
          setStatus(result.outcome);
          notify.portal(
            result.outcome === "success" ? "contact.message-sent" : "contact.message-failed",
          );
        }, 400);
      }}
    >
      {status === "success" ? (
        <Alert className="contact-form-outcome" data-outcome="success" role="status">
          <CircleCheck aria-hidden="true" />
          <AlertTitle>Message saved in this mock</AlertTitle>
          <AlertDescription>
            Nothing was sent to the studio, and no class was reserved. Your message is still in the
            form below if you want to copy it.
          </AlertDescription>
        </Alert>
      ) : null}
      {status === "failure" ? (
        <Alert className="contact-form-outcome" data-outcome="failure" role="alert">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>The mock form could not save that message</AlertTitle>
          <AlertDescription>
            Try again, or use the studio details above — not for reservations.
          </AlertDescription>
        </Alert>
      ) : null}

      <fieldset className="contact-form-fields" disabled={submitting}>
        <div className="contact-form-field">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            name="name"
            value={name}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            onChange={(event) => setName(event.target.value)}
          />
          {errors.name ? (
            <p id="contact-name-error" className="contact-form-error">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className="contact-form-field">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            value={email}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email ? (
            <p id="contact-email-error" className="contact-form-error">
              {errors.email}
            </p>
          ) : null}
        </div>
        <div className="contact-form-field">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            id="contact-message"
            name="message"
            rows={5}
            value={message}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            onChange={(event) => setMessage(event.target.value)}
          />
          {errors.message ? (
            <p id="contact-message-error" className="contact-form-error">
              {errors.message}
            </p>
          ) : null}
        </div>
      </fieldset>

      <PolicyAcceptance {...policyAcceptance.props} title="Before you send" />

      <div className="contact-form-actions">
        <p>Questions only. Reservations happen on the schedule.</p>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            "Send"
          )}
        </Button>
      </div>
    </form>
  );
}
