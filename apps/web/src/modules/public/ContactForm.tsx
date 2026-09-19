"use client";

import { validateContactForm } from "@balanse/domain";
import { Button, Input, Label, LocalizedSkeleton, Textarea } from "@balanse/ui";
import { useState } from "react";

export function ContactForm({
  forcedOutcome,
}: {
  forcedOutcome?: "success" | "failure" | "submitting";
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "message", string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "failure">(
    forcedOutcome === "submitting" ? "submitting" : (forcedOutcome ?? "idle"),
  );

  if (status === "submitting") {
    return <LocalizedSkeleton lines={4} label="Sending message" />;
  }

  if (status === "success") {
    return (
      <p role="status" className="rounded-xl border border-border bg-card p-4 text-sm">
        Message saved in this mock. Nothing was sent to the studio.
      </p>
    );
  }

  if (status === "failure") {
    return (
      <div className="space-y-3 rounded-xl border border-destructive/40 bg-card p-4">
        <p role="alert" className="text-sm">
          The mock form could not save that message. Try again, or use the studio details above —
          not for reservations.
        </p>
        <Button type="button" variant="outline" onClick={() => setStatus("idle")}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const result = validateContactForm({ name, email, message });
        if (!result.ok) {
          setErrors(result.errors);
          return;
        }
        setErrors({});
        setStatus("submitting");
        window.setTimeout(() => {
          setStatus(result.outcome);
        }, 400);
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          name="name"
          value={name}
          aria-invalid={Boolean(errors.name)}
          onChange={(event) => setName(event.target.value)}
        />
        {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          value={email}
          aria-invalid={Boolean(errors.email)}
          onChange={(event) => setEmail(event.target.value)}
        />
        {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          value={message}
          aria-invalid={Boolean(errors.message)}
          onChange={(event) => setMessage(event.target.value)}
        />
        {errors.message ? <p className="text-sm text-destructive">{errors.message}</p> : null}
      </div>
      <Button type="submit">Send</Button>
    </form>
  );
}
