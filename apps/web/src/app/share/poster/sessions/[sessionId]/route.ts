import { getPublicSession } from "@balanse/api-client";
import { parseShareParams } from "@balanse/domain";
import { serverFetcher } from "@/lib/query/fetcher";
import { renderPosterImage } from "@/modules/share/share-card";

/** Branded 1080×1350 poster PNG for a public session (#347). Node runtime (fs + qrcode). */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL = "public, max-age=300";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
): Promise<Response> {
  const { sessionId } = await params;
  const page = await getPublicSession(serverFetcher(null), sessionId).catch(() => null);
  // Draft/unknown → null. Past sessions have nothing left to promote.
  if (!page || page.availability === "past" || Date.parse(page.endsAt) <= Date.now()) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": CACHE_CONTROL } });
  }
  const query = new URL(request.url).searchParams;
  const share = parseShareParams({ ref: query.get("ref"), src: query.get("src") });
  const image = await renderPosterImage(page, { share });
  image.headers.set("Cache-Control", CACHE_CONTROL);
  // Admin (another origin) downloads posters via fetch → blob. Public image, so any origin.
  image.headers.set("Access-Control-Allow-Origin", "*");
  return image;
}
