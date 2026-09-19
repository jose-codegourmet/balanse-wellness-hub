import type { Metadata } from "next";
import { BookingDetailPage } from "@/modules/admin/BookingPages";

export const metadata: Metadata = {
  title: "Booking",
  description: "Review a booking.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return <BookingDetailPage bookingId={bookingId} />;
}
