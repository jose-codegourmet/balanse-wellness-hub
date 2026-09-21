"use client";

import { Button, Input, Label, PasswordInput, PhPhoneInput } from "@balanse/ui";
import { ArrowUpRight } from "lucide-react";

type SignUpField = "fullName" | "email" | "contactNumber" | "password" | "confirmPassword";
type SignUpValues = Record<SignUpField, string>;
type SignUpErrors = Partial<Record<SignUpField, string>>;

export function CustomerSignUpForm({
  values,
  errors,
  onChange,
  onSubmit,
}: {
  values: SignUpValues;
  errors: SignUpErrors;
  onChange: (field: SignUpField, value: string) => void;
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
        <Label htmlFor="signup-name">Full name</Label>
        <Input
          id="signup-name"
          name="name"
          autoComplete="name"
          value={values.fullName}
          aria-invalid={Boolean(errors.fullName)}
          onChange={(event) => onChange("fullName", event.target.value)}
        />
        {errors.fullName ? <p className="auth-error">{errors.fullName}</p> : null}
      </div>
      <div className="auth-field">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          aria-invalid={Boolean(errors.email)}
          onChange={(event) => onChange("email", event.target.value)}
        />
        {errors.email ? <p className="auth-error">{errors.email}</p> : null}
      </div>
      <div className="auth-field">
        <Label htmlFor="signup-contact">Contact number</Label>
        <PhPhoneInput
          id="signup-contact"
          name="tel"
          autoComplete="tel"
          value={values.contactNumber}
          aria-invalid={Boolean(errors.contactNumber)}
          onChange={(event) => onChange("contactNumber", event.target.value)}
        />
        {errors.contactNumber ? <p className="auth-error">{errors.contactNumber}</p> : null}
      </div>
      <div className="auth-field">
        <Label htmlFor="signup-password">Password</Label>
        <PasswordInput
          id="signup-password"
          name="new-password"
          autoComplete="new-password"
          value={values.password}
          aria-invalid={Boolean(errors.password)}
          onChange={(event) => onChange("password", event.target.value)}
        />
        {errors.password ? <p className="auth-error">{errors.password}</p> : null}
      </div>
      <div className="auth-field">
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <PasswordInput
          id="signup-confirm"
          name="confirm-password"
          autoComplete="new-password"
          value={values.confirmPassword}
          aria-invalid={Boolean(errors.confirmPassword)}
          onChange={(event) => onChange("confirmPassword", event.target.value)}
        />
        {errors.confirmPassword ? <p className="auth-error">{errors.confirmPassword}</p> : null}
      </div>
      <Button type="submit" className="auth-submit-button">
        Create account <ArrowUpRight className="ml-auto size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
