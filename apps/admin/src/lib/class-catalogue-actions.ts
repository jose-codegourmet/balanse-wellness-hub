"use server";
import {
  catalogueAdmin,
  catalogueClient,
  readClassCatalogue,
  writeClassCatalogue,
} from "@balanse/api/class-catalogue";
import type { PublicClass } from "@balanse/domain";
import { cookies } from "next/headers";
import { classFormSchema } from "@/modules/admin/forms/class/class-form.schema";

const COOKIE = "balanse-catalogue-access";
export async function loadClassCatalogue() {
  const token = (await cookies()).get(COOKIE)?.value;
  const canSave = await catalogueAdmin(token);
  return { ...(await readClassCatalogue(canSave ? token : undefined)), canSave };
}
export async function saveClassCatalogue(input: Omit<PublicClass, "id"> & { id?: string }) {
  if (input.id !== undefined && (typeof input.id !== "string" || input.id.length > 100))
    throw new Error("Invalid class ID.");
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !(await catalogueAdmin(token)))
    throw new Error("Sign in with an active Supabase admin account to save classes.");
  const result = classFormSchema.safeParse({
    ...input,
    pageMode: input.customPageUrl ? "redirect" : "standard",
    customPageUrl: input.customPageUrl ?? "",
    heroImage: input.heroImage ?? "",
  });
  if (!result.success)
    throw new Error(result.error.issues[0]?.message ?? "Check the class fields.");
  const { pageMode, ...values } = result.data;
  return writeClassCatalogue(
    {
      ...values,
      id: input.id,
      heroImage: values.heroImage || null,
      customPageUrl: pageMode === "redirect" ? values.customPageUrl : null,
    },
    token,
  );
}
export async function connectClassAdmin(input: {
  email: string;
  password: string;
}): Promise<{ error?: string }> {
  if (!input.email || !input.password || input.email.length > 254 || input.password.length > 1024)
    return { error: "Enter your admin email and password." };
  const { data, error } = await catalogueClient().auth.signInWithPassword(input);
  if (error || !data.session)
    return { error: "Could not sign in. Use an existing Supabase account." };
  if (!(await catalogueAdmin(data.session.access_token)))
    return {
      error:
        "This account is not an active administrator. Ask the project owner to provision admin access.",
    };
  (await cookies()).set(COOKIE, data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: data.session.expires_in,
  });
  return {};
}

export async function disconnectClassAdmin() {
  (await cookies()).delete(COOKIE);
}
