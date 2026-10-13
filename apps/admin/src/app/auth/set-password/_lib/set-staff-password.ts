"use server";

import { createDefaultDeps } from "@balanse/api";
import { createSupabaseServerClient } from "@/modules/session/supabase-server";
import {
  type StaffPasswordFormValues,
  staffPasswordFormSchema,
} from "../_components/staff-password-form/StaffPasswordForm.schema";
import {
  clearInviteProof,
  inviteTokenDigest,
  readInviteProof,
  setInviteProof,
} from "./invite-proof";

type Result = { ok: true } | { ok: false; message: string };

export async function setStaffPassword(
  input: StaffPasswordFormValues & { tokenHash?: string; tokenType?: "invite" | "recovery" },
): Promise<Result> {
  const values = staffPasswordFormSchema.safeParse(input);
  if (!values.success)
    return { ok: false, message: values.error.issues[0]?.message ?? "Check your password." };
  const tokenType = input.tokenType ?? "invite";
  if (tokenType !== "invite" && tokenType !== "recovery") {
    return {
      ok: false,
      message: "This password link is not valid. Ask your administrator for a fresh link.",
    };
  }
  if (
    input.tokenHash !== undefined &&
    (typeof input.tokenHash !== "string" || !/^[a-zA-Z0-9_-]{20,512}$/.test(input.tokenHash))
  ) {
    return {
      ok: false,
      message: "Open the full password setup or reset link shared by your administrator.",
    };
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      message: "Staff password links are not configured. Contact your administrator.",
    };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const proof = await readInviteProof();
    let userId: string | undefined;
    if (
      proof &&
      proof.tokenType === tokenType &&
      (!input.tokenHash || proof.tokenDigest === inviteTokenDigest(input.tokenHash))
    ) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user?.id === proof.userId) userId = proof.userId;
    }
    if (!userId) {
      if (typeof input.tokenHash !== "string" || !/^[a-zA-Z0-9_-]{20,512}$/.test(input.tokenHash)) {
        return {
          ok: false,
          message: "Open the full password setup or reset link shared by your administrator.",
        };
      }
      // Deliberately not a GET/callback: link scanners must not accept invitations.
      const { data, error } = await supabase.auth.verifyOtp({
        type: tokenType,
        token_hash: input.tokenHash,
      });
      if (error || !data.user || !data.session) {
        return {
          ok: false,
          message:
            "This link has expired or has already been used. Ask your administrator for a fresh link.",
        };
      }
      userId = data.user.id;
      await setInviteProof(userId, input.tokenHash, tokenType);
    }
    const staff = await createDefaultDeps().prisma.staffMember.findUnique({
      where: { userId },
      select: { status: true, isSystem: true, roleDefinition: { select: { status: true } } },
    });
    if (
      !staff ||
      staff.isSystem ||
      staff.status !== "ACTIVE" ||
      staff.roleDefinition?.status !== "ACTIVE"
    ) {
      await clearInviteProof();
      await supabase.auth.signOut({ scope: "local" });
      return {
        ok: false,
        message: "This staff account does not have active access. Contact your administrator.",
      };
    }
    const { error } = await supabase.auth.updateUser({ password: values.data.password });
    if (error) {
      return {
        ok: false,
        message:
          error.code === "weak_password"
            ? "This password does not meet the security requirements. Try a longer password with upper- and lowercase letters, numbers, and symbols."
            : "Your password could not be saved. Please retry on this page.",
      };
    }
    await clearInviteProof();
    await supabase.auth.signOut({ scope: "local" });
    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "We could not finish setting your password. Please retry on this page, or contact your administrator.",
    };
  }
}
