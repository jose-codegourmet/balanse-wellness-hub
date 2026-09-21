"use client";

import { Button, Input, Label } from "@balanse/ui";
import { ArrowUpRight } from "lucide-react";

export function CustomerForgotPasswordForm({
  email,
  error,
  onEmailChange,
  onSubmit,
}: {
  email: string;
  error: string;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="auth-field">
        <Label htmlFor="reset-email">Email address</Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          aria-invalid={Boolean(error)}
          onChange={(event) => onEmailChange(event.target.value)}
        />
        {error ? (
          <p className="auth-error">{error}</p>
        ) : (
          <p className="auth-field-hint">We will only send a link if the address is on file.</p>
        )}
      </div>
      <Button type="submit" className="auth-submit-button">
        Send reset link <ArrowUpRight className="ml-auto size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
