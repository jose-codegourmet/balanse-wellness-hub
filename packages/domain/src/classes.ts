import type { PublicClass, PublicSession } from "./types";

export function classPageHref(gymClass: Pick<PublicClass, "slug">): string {
  return `/classes/${encodeURIComponent(gymClass.slug)}`;
}

export function sessionDisplayName(session: Pick<PublicSession, "name" | "className">): string {
  return session.name?.trim() || session.className;
}

/** Local asset paths or HTTPS images only. No executable/data/protocol-relative URLs. */
export function isClassImageSource(value: string): boolean {
  if (/^\/assets\/[a-zA-Z0-9/_ .-]+\.(webp|png|jpe?g|avif)$/i.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** A public-only snapshot lets the separate mock apps preview edits without a database. */
export function classPreviewHref(gymClass: PublicClass): string {
  const {
    id,
    name,
    slug,
    shortDescription,
    description,
    coachIds,
    heroImage,
    galleryImages,
    defaultDurationMinutes,
    defaultPricePhp,
    active,
  } = gymClass;
  const publicFields = {
    id,
    name,
    slug,
    shortDescription,
    description,
    coachIds,
    heroImage,
    galleryImages,
    defaultDurationMinutes,
    defaultPricePhp,
    active,
  };
  return `${classPageHref(gymClass)}?preview=1#class-preview=${encodeURIComponent(JSON.stringify(publicFields))}`;
}

export function parseClassPreview(hash: string): PublicClass | null {
  if (!hash.startsWith("#class-preview=") || hash.length > 60000) return null;
  try {
    const row = JSON.parse(decodeURIComponent(hash.slice(15)));
    if (!row || typeof row !== "object") return null;
    const text = (key: string, max: number) =>
      typeof row[key] === "string" && row[key].length <= max;
    if (
      !text("id", 100) ||
      !text("name", 80) ||
      !text("slug", 100) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) ||
      !text("shortDescription", 500) ||
      !text("description", 4000)
    )
      return null;
    if (
      !Array.isArray(row.coachIds) ||
      row.coachIds.length > 100 ||
      row.coachIds.some((id: unknown) => typeof id !== "string" || id.length > 100)
    )
      return null;
    if (
      row.heroImage !== null &&
      (typeof row.heroImage !== "string" || !isClassImageSource(row.heroImage))
    )
      return null;
    if (
      !Array.isArray(row.galleryImages) ||
      row.galleryImages.length > 12 ||
      row.galleryImages.some((src: unknown) => typeof src !== "string" || !isClassImageSource(src))
    )
      return null;
    if (
      row.defaultPricePhp !== null &&
      (!Number.isInteger(row.defaultPricePhp) || row.defaultPricePhp < 0)
    )
      return null;
    if (
      row.defaultDurationMinutes !== null &&
      (!Number.isInteger(row.defaultDurationMinutes) ||
        row.defaultDurationMinutes < 1 ||
        row.defaultDurationMinutes > 240)
    )
      return null;
    // Explicit projection prevents extra private fields entering the public component props.
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      shortDescription: row.shortDescription,
      description: row.description,
      coachIds: row.coachIds,
      heroImage: row.heroImage,
      galleryImages: row.galleryImages,
      defaultDurationMinutes: row.defaultDurationMinutes,
      defaultPricePhp: row.defaultPricePhp,
      active: row.active === true,
    };
  } catch {
    return null;
  }
}

export function classSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
    .replace(/-$/, "");
}

export function isClassRedirectUrl(value: string): boolean {
  if (!value || /[\\\s]/.test(value)) return false;
  try {
    const url = new URL(value, "https://balanse.invalid");
    if (url.username || url.password || url.protocol !== "https:") return false;
    if (!value.startsWith("/") && !value.startsWith("https://")) return false;
    if (value.startsWith("//")) return false;
    return !/^\/classes(?:\/|$)/i.test(decodeURIComponent(url.pathname));
  } catch {
    return false;
  }
}
