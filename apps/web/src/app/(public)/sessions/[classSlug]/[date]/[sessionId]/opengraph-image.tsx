import { getPublicSession } from "@balanse/api-client";
import { notFound } from "next/navigation";
import { serverFetcher } from "@/lib/query/fetcher";
import { OG_IMAGE_SIZE, renderOgImage, SHARE_IMAGE_CONTENT_TYPE } from "@/modules/share/share-card";

export const size = OG_IMAGE_SIZE;
export const contentType = SHARE_IMAGE_CONTENT_TYPE;
export const alt = "Balansé session";

export default async function Image({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const page = await getPublicSession(serverFetcher(null), decodeURIComponent(sessionId)).catch(
    () => null,
  );
  if (!page) notFound();
  return renderOgImage(page);
}
