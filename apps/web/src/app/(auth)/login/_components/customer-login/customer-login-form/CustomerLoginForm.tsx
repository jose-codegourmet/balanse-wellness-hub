"use client";

import { Button, Input, Label, PasswordInput } from "@balanse/ui";
import { ArrowUpRight } from "lucide-react";

type LoginErrors = Partial<Record<"email" | "password" | "form", string>>;

export function CustomerLoginForm({
  email,
  password,
  errors,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: {
  email: string;
  password: string;
  errors: LoginErrors;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="auth-form auth-login-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="auth-field">
        <Label htmlFor="login-email">Email address</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          aria-invalid={Boolean(errors.email)}
          onChange={(event) => onEmailChange(event.target.value)}
        />
        {errors.email ? (
          <p className="auth-error">{errors.email}</p>
        ) : (
          <p className="auth-field-hint">Use the email attached to your membership.</p>
        )}
      </div>
      <div className="auth-field">
        <Label htmlFor="login-password">Password</Label>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          value={password}
          aria-invalid={Boolean(errors.password)}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
        {errors.password ? <p className="auth-error">{errors.password}</p> : null}
      </div>
      {errors.form ? (
        <p role="alert" className="auth-form-error">
          {errors.form}
        </p>
      ) : null}
      <Button type="submit" className="auth-submit-button">
        Log in <ArrowUpRight className="ml-auto size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
