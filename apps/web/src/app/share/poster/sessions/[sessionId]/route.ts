import { parseShareParams } from "@balanse/domain";
import { getMockAdapter, MOCK_NOW_ISO } from "@balanse/mock";
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
  const page = await getMockAdapter().getPublicSessionPage(sessionId);
  // Draft/unknown → null. Past sessions have nothing left to promote.
  if (
    !page ||
    page.availability === "past" ||
    Date.parse(page.endsAt) <= Date.parse(MOCK_NOW_ISO)
  ) {
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
