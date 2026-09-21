"use client";

import { Button, Input, Label, PasswordInput } from "@balanse/ui";

type AdminLoginErrors = Partial<Record<"email" | "password" | "form", string>>;

export function AdminLoginForm({
  email,
  password,
  errors,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: {
  email: string;
  password: string;
  errors: AdminLoginErrors;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="mt-8 grid w-full gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          aria-invalid={Boolean(errors.email)}
          onChange={(event) => onEmailChange(event.target.value)}
        />
        {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="admin-password">Password</Label>
        <PasswordInput
          id="admin-password"
          name="password"
          autoComplete="current-password"
          value={password}
          aria-invalid={Boolean(errors.password)}
          onChange={(event) => onPasswordChange(event.target.value)}
        />
        {errors.password ? <p className="text-sm text-destructive">{errors.password}</p> : null}
      </div>
      {errors.form ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.form}
        </p>
      ) : null}
      <Button type="submit" className="w-full">
        Log In
      </Button>
    </form>
  );
}
