import { type PrismaClient, prisma } from "@balanse/db";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AuthMethod = "google" | "email";

export type ResolvedUser = {
  id: string;
  email: string | null;
  authMethod: AuthMethod;
};

export type ApiActor =
  | { kind: "anon" }
  | { kind: "customer"; userId: string; email: string | null; authMethod: AuthMethod }
  | {
      kind: "admin";
      userId: string;
      staffId: string;
      email: string | null;
      authMethod: AuthMethod;
    };

export type StoragePort = {
  createSignedUpload: (
    bucket: string,
    path: string,
    options: { contentType: string; upsert?: boolean },
  ) => Promise<{ signedUrl: string; token: string; path: string }>;
  createSignedUrl: (bucket: string, path: string, expiresIn: number) => Promise<string>;
  remove: (bucket: string, paths: string[]) => Promise<void>;
  publicUrl: (bucket: string, path: string) => string;
  inviteUser?: (input: { email: string; name: string }) => Promise<{ userId: string } | null>;
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
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
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

export function createDefaultStorage(): StoragePort {
  return {
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
    async inviteUser(input) {
      const client = serviceClient();
      if (!client) return null;
      const { data, error } = await client.auth.admin.inviteUserByEmail(input.email, {
        data: { full_name: input.name },
      });
      if (error || !data.user) return null;
      return { userId: data.user.id };
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
