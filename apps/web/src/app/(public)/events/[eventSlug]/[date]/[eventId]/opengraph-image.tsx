import { getPublicEvent } from "@balanse/api-client";
import { notFound } from "next/navigation";
import { serverFetcher } from "@/lib/query/fetcher";
import { OG_IMAGE_SIZE, renderOgImage, SHARE_IMAGE_CONTENT_TYPE } from "@/modules/share/share-card";

export const size = OG_IMAGE_SIZE;
export const contentType = SHARE_IMAGE_CONTENT_TYPE;
export const alt = "Balansé event";

export default async function Image({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const page = await getPublicEvent(serverFetcher(null), decodeURIComponent(eventId)).catch(
    () => null,
  );
  if (!page) notFound();
  return renderOgImage(page);
}
