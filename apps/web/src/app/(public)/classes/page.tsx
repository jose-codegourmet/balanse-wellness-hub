import type { Metadata } from "next";
import { getClassCatalogue } from "@/lib/class-catalogue";
import { ClassesPage } from "@/modules/public/classes-page/ClassesPage";
export const metadata: Metadata = {
  title: "Classes",
  description: "Explore yoga, Pilates, strength, dance and movement classes at Balansé.",
};
export default async function Page() {
  return <ClassesPage classes={(await getClassCatalogue()).classes} />;
}
