import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminVenuesQuery } from "@/lib/query/queries";
import { VenueFormPage } from "../_components/venue-form-page/VenueFormPage";

type Params = Promise<{ venueId: string }>;

// `/venues/new` is served by this segment too, like `/coaches/new`.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { venueId } = await params;
  return venueId === "new"
    ? { title: "Add venue", description: "Add a studio branch or an off-site partner venue." }
    : { title: "Edit venue", description: "Venue details, staff hours, and operating model." };
}

export default async function Page({ params }: { params: Params }) {
  const { venueId } = await params;
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin([adminVenuesQuery(principal)], <VenueFormPage venueId={venueId} />);
}
