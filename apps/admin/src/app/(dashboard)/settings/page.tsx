import type { Metadata } from "next";
import { SettingsPage } from "@/modules/admin/SettingsPage";

export const metadata: Metadata = {
  title: "Settings",
  description: "Studio settings.",
};

export default function Page() {
  return <SettingsPage />;
}
