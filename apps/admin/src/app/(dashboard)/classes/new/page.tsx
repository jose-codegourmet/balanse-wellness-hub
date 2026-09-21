import { ClassFormPage } from "@/modules/admin/classes/class-form-page/ClassFormPage";
export const metadata = { title: "Create a class" };
export default function Page() {
  return <ClassFormPage classId="new" />;
}
