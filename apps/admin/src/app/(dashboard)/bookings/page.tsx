import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingListPage } from "@/modules/admin/BookingPages";

export const metadata: Metadata = {
  title: "Bookings",
  description: "Booking management.",
};

export default function Page() {
  return (
    <Suspense>
      <BookingListPage />
    </Suspense>
  );
}
