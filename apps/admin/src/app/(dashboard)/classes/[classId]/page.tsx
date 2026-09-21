import { ClassFormPage } from "../_components/class-form-page/ClassFormPage";
export const metadata = { title: "Edit class" };
export default async function Page({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  return <ClassFormPage classId={classId} />;
}
