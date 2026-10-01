"use server";

import { EMAIL_FORMAT_RE } from "@balanse/domain";
import { createSupabaseServerClient } from "@/modules/session/supabase-server";

export type LoginErrors = Partial<Record<"email" | "password" | "form", string>>;

export type SignInWithPasswordResult = { ok: true } | { ok: false; errors: LoginErrors };

/** Email/password log in against Supabase Auth. Sets the session cookies on success. */
export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<SignInWithPasswordResult> {
  const email = input.email.trim();
  const errors: LoginErrors = {};
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_FORMAT_RE.test(email)) errors.email = "Enter a valid email.";
  if (!input.password) errors.password = "Password is required.";
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: input.password });
  if (!error) return { ok: true };
  if (error.code === "email_not_confirmed") {
    return {
      ok: false,
      errors: { form: "Confirm your email first. Check your inbox for the link we sent." },
    };
  }
  if (error.code === "invalid_credentials") {
    return { ok: false, errors: { form: "That email and password don't match. Try again." } };
  }
  return { ok: false, errors: { form: "We couldn't sign you in. Try again in a moment." } };
}
