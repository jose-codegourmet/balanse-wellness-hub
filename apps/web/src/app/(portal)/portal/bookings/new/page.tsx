import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; intent?: string }>;
}) {
  const { sessionId, intent } = await searchParams;
  if (!sessionId) {
    redirect("/portal/schedule");
  }
  const suffix = intent === "waitlist" ? "?intent=waitlist" : "";
  redirect(`/portal/book/${sessionId}${suffix}`);
}
