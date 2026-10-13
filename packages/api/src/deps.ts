import { type PrismaClient, prisma } from "@balanse/db";
import type { PermissionKey, StaffAuthorizationActor, StaffMemberStatus } from "@balanse/domain";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "./errors";

export type AuthMethod = "google" | "email";

export type ResolvedUser = {
  id: string;
  email: string | null;
  authMethod: AuthMethod;
};

export type AdminApiActor = {
  kind: "admin";
  userId: string;
  staffId: string;
  email: string | null;
  authMethod: AuthMethod;
  staffStatus: StaffMemberStatus;
  roleId: string;
  roleKey: string;
  roleActive: boolean;
  permissions: readonly PermissionKey[];
  coachId: string | null;
  isCoach: boolean;
  isSystem: boolean;
};

export type ApiActor =
  | { kind: "anon" }
  | { kind: "customer"; userId: string; email: string | null; authMethod: AuthMethod }
  | AdminApiActor;

export function staffAuthorizationOf(actor: AdminApiActor): StaffAuthorizationActor {
  return {
    userId: actor.userId,
    staffId: actor.staffId,
    staffStatus: actor.staffStatus,
    roleId: actor.roleId,
    roleKey: actor.roleKey,
    roleActive: actor.roleActive,
    permissions: actor.permissions,
    coachId: actor.coachId,
    isCoach: actor.isCoach,
    email: actor.email,
    isSystem: actor.isSystem,
  };
}

export type StoragePort = {
  getObjectInfo?: (bucket: string, path: string) => Promise<{ size: number; contentType: string }>;
  createSignedUpload: (
    bucket: string,
    path: string,
    options: { contentType: string; upsert?: boolean },
  ) => Promise<{ signedUrl: string; token: string; path: string }>;
  createSignedUrl: (bucket: string, path: string, expiresIn: number) => Promise<string>;
  remove: (bucket: string, paths: string[]) => Promise<void>;
  publicUrl: (bucket: string, path: string) => string;
  generateStaffInvite?: (input: {
    email: string;
    name: string;
    userId?: string;
  }) => Promise<{ userId: string; inviteUrl: string } | null>;
  generateStaffPasswordReset?: (input: { userId: string }) => Promise<{ resetUrl: string }>;
};

export type ApiDeps = {
  prisma: PrismaClient;
  now: () => Date;
  resolveUser: (accessToken: string | null) => Promise<ResolvedUser | null>;
  storage: StoragePort;
};

function supabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
}

function serviceClient(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function publishableClient(): SupabaseClient | null {
  const url = supabaseUrl();
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function authMethodFromUser(user: {
  app_metadata?: { provider?: string };
  identities?: { provider?: string }[];
}): AuthMethod {
  const provider = user.app_metadata?.provider ?? user.identities?.[0]?.provider;
  return provider === "google" ? "google" : "email";
}

function staffPasswordSetupUrl(): URL {
  const configuredOrigin =
    process.env.STAFF_INVITE_ORIGIN ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:9001" : undefined);
  try {
    if (!configuredOrigin) throw new Error("missing origin");
    const origin = new URL(configuredOrigin);
    if (
      origin.username ||
      origin.password ||
      origin.pathname !== "/" ||
      origin.search ||
      origin.hash ||
      !["http:", "https:"].includes(origin.protocol) ||
      (process.env.NODE_ENV === "production" && origin.protocol !== "https:")
    ) {
      throw new Error("invalid origin");
    }
    return new URL("/auth/set-password", origin);
  } catch {
    throw new ApiError(
      503,
      "invite_not_configured",
      "Set STAFF_INVITE_ORIGIN to the admin portal origin (HTTPS in production).",
    );
  }
}

export function createDefaultStorage(): StoragePort {
  return {
    async getObjectInfo(bucket, path) {
      const client = serviceClient();
      if (!client)
        throw new ApiError(503, "storage_not_configured", "Photo uploads are not configured.");
      const { data, error } = await client.storage.from(bucket).info(path);
      if (error || !data)
        throw new ApiError(400, "upload_missing", "Upload the photo before saving it.");
      return {
        size: data.size ?? data.metadata?.size ?? 0,
        contentType: data.contentType ?? data.metadata?.mimetype ?? "",
      };
    },
    async createSignedUpload(bucket, path, options) {
      const client = serviceClient() ?? publishableClient();
      if (!client) {
        return {
          signedUrl: `https://storage.local/${bucket}/${path}`,
          token: "local-dev",
          path,
        };
      }
      const { data, error } = await client.storage.from(bucket).createSignedUploadUrl(path, {
        upsert: options.upsert ?? true,
      });
      if (error || !data) throw error ?? new Error("signed upload failed");
      return { signedUrl: data.signedUrl, token: data.token, path: data.path };
    },
    async createSignedUrl(bucket, path, expiresIn) {
      const client = serviceClient();
      if (!client) {
        return `https://storage.local/signed/${bucket}/${path}?exp=${expiresIn}`;
      }
      const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresIn);
      if (error || !data) throw error ?? new Error("signed url failed");
      return data.signedUrl;
    },
    async remove(bucket, paths) {
      const client = serviceClient();
      if (!client || paths.length === 0) return;
      await client.storage.from(bucket).remove(paths);
    },
    publicUrl(bucket, path) {
      const url = supabaseUrl() ?? "https://xydundrayuusqizssgby.supabase.co";
      return `${url}/storage/v1/object/public/${bucket}/${path}`;
    },
    async generateStaffInvite(input) {
      const client = serviceClient();
      if (!client) {
        throw new ApiError(
          503,
          "invite_not_configured",
          "Configure SUPABASE_SERVICE_ROLE_KEY on the server to create staff invite links.",
        );
      }
      const inviteUrl = staffPasswordSetupUrl();
      let email = input.email;
      if (input.userId) {
        const { data, error } = await client.auth.admin.getUserById(input.userId);
        if (error || !data.user?.email) {
          throw new ApiError(
            400,
            "auth_user_missing",
            "The staff Auth account could not be found.",
          );
        }
        // Never turn the invite action into password recovery for an existing account.
        if (data.user.email_confirmed_at || data.user.last_sign_in_at) return null;
        email = data.user.email;
      }
      // generateLink provisions the Auth user, but does not deliver any email.
      const { data, error } = await client.auth.admin.generateLink({
        type: "invite",
        email,
        options: { data: { full_name: input.name }, redirectTo: inviteUrl.href },
      });
      if (error || !data.user || !data.properties?.hashed_token) {
        throw new ApiError(
          400,
          "invite_failed",
          "Could not generate an invitation. Check the Supabase Auth account and try again.",
        );
      }
      if (input.userId && data.user.id !== input.userId) {
        throw new ApiError(
          409,
          "invite_user_mismatch",
          "The invitation does not match this staff account.",
        );
      }
      // A fragment stays out of HTTP access logs and referrers. The password form
      // exchanges it only on submission, so link previews cannot consume it.
      inviteUrl.hash = new URLSearchParams({ token_hash: data.properties.hashed_token }).toString();
      return { userId: data.user.id, inviteUrl: inviteUrl.href };
    },
    async generateStaffPasswordReset({ userId }) {
      const client = serviceClient();
      if (!client) {
        throw new ApiError(
          503,
          "reset_not_configured",
          "Configure SUPABASE_SERVICE_ROLE_KEY on the server to create password reset links.",
        );
      }
      const resetUrl = staffPasswordSetupUrl();
      const { data: account, error: accountError } = await client.auth.admin.getUserById(userId);
      if (accountError || !account.user?.email) {
        throw new ApiError(400, "auth_user_missing", "The staff Auth account could not be found.");
      }
      // Use the verified Auth email, never an editable staff contact email.
      // generateLink does not deliver mail or change the existing password.
      const { data, error } = await client.auth.admin.generateLink({
        type: "recovery",
        email: account.user.email,
        options: { redirectTo: resetUrl.href },
      });
      if (error || !data.user || !data.properties?.hashed_token) {
        throw new ApiError(
          400,
          "reset_link_failed",
          "Could not create a password reset link. Please try again.",
        );
      }
      if (data.user.id !== userId) {
        throw new ApiError(
          409,
          "reset_user_mismatch",
          "The reset link does not match this staff account.",
        );
      }
      resetUrl.hash = new URLSearchParams({
        token_hash: data.properties.hashed_token,
        type: "recovery",
      }).toString();
      return { resetUrl: resetUrl.href };
    },
  };
}

export function createDefaultDeps(): ApiDeps {
  const publishable = publishableClient();
  return {
    prisma,
    now: () => new Date(),
    async resolveUser(accessToken) {
      if (!accessToken || !publishable) return null;
      const { data, error } = await publishable.auth.getUser(accessToken);
      if (error || !data.user) return null;
      return {
        id: data.user.id,
        email: data.user.email ?? null,
        authMethod: authMethodFromUser(data.user),
      };
    },
    storage: createDefaultStorage(),
  };
}
