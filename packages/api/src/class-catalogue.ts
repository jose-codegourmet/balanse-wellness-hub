import type { PublicClass, PublicCoach } from "@balanse/domain";
import { createClient } from "@supabase/supabase-js";

/** Server-only catalogue access. Uses the caller's JWT and RLS, never a service-role key. */
export function catalogueClient(accessToken?: string) {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Class database configuration is missing.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      ...(accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}),
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

export async function catalogueAdmin(accessToken?: string): Promise<boolean> {
  if (!accessToken) return false;
  const client = catalogueClient(accessToken);
  const {
    data: { user },
    error,
  } = await client.auth.getUser(accessToken);
  if (error || !user) return false;
  const { data } = await client
    .from("staff_members")
    .select("id")
    .eq("userId", user.id)
    .eq("role", "ADMIN")
    .eq("status", "ACTIVE")
    .eq("isSystem", false)
    .maybeSingle();
  return !!data;
}

export async function readClassCatalogue(
  accessToken?: string,
): Promise<{ classes: PublicClass[]; coaches: PublicCoach[] }> {
  const client = catalogueClient(accessToken);
  const [classes, coaches] = await Promise.all([
    client
      .from("classes")
      .select(
        "id,name,slug,customPageUrl,shortDescription,description,heroImage,galleryImages,defaultDurationMinutes,defaultCustomerPrice,active,class_marketing_coaches(coachId)",
      )
      .order("name"),
    client.from("coaches").select("id,name,specialties,shortBio,photoKey,active").order("name"),
  ]);
  if (classes.error || coaches.error)
    throw new Error("Unable to load the class catalogue. Please try again.");
  return {
    classes: classes.data.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      customPageUrl: row.customPageUrl,
      shortDescription: row.shortDescription,
      description: row.description,
      heroImage: row.heroImage,
      galleryImages: row.galleryImages,
      defaultDurationMinutes: row.defaultDurationMinutes,
      defaultPricePhp: row.defaultCustomerPrice === null ? null : Number(row.defaultCustomerPrice),
      active: row.active,
      coachIds: row.class_marketing_coaches.map((link: { coachId: string }) => link.coachId),
    })),
    coaches: coaches.data,
  };
}

export async function writeClassCatalogue(
  input: Omit<PublicClass, "id"> & { id?: string },
  accessToken: string,
): Promise<PublicClass> {
  if (!(await catalogueAdmin(accessToken)))
    throw new Error("Sign in with an active Supabase admin account to save classes.");
  const { data: id, error } = await catalogueClient(accessToken).rpc("save_class_catalogue", {
    payload: input,
  });
  if (error)
    throw new Error(
      error.code === "23505"
        ? "That class name or URL is already in use."
        : "Class could not be saved. Check your fields and try again.",
    );
  const saved = (await readClassCatalogue(accessToken)).classes.find((row) => row.id === id);
  if (!saved) throw new Error("Class saved but could not be reloaded. Refresh the catalogue.");
  return saved;
}
