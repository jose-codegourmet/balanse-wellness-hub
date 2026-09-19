import type { Metadata } from "next";
import { CoachPhotoDemo } from "@/components/balanse/CoachPhotoDemo";

export const metadata: Metadata = {
  title: "Coaches",
  description: "Coach profiles and rates (admin only).",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-display text-3xl">Coaches</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Coach profiles and rates (admin only). Screen content is owned by the matching FE-ADM
        ticket.
      </p>
      <div className="mt-8 max-w-lg">
        <CoachPhotoDemo />
      </div>
    </section>
  );
}
