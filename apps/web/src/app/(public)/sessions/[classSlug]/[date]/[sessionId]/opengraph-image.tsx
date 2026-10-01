import { getMockAdapter } from "@balanse/mock";
import { notFound } from "next/navigation";
import { OG_IMAGE_SIZE, renderOgImage, SHARE_IMAGE_CONTENT_TYPE } from "@/modules/share/share-card";

export const size = OG_IMAGE_SIZE;
export const contentType = SHARE_IMAGE_CONTENT_TYPE;
export const alt = "Balansé session";

export default async function Image({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const page = await getMockAdapter().getPublicSessionPage(decodeURIComponent(sessionId));
  if (!page) notFound();
  return renderOgImage(page);
}
