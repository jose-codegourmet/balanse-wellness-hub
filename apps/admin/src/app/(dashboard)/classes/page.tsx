import { AdminQuerySuspense } from "@/components/balanse/page/admin-query-suspense/AdminQuerySuspense";
import { ClassListPage } from "@/modules/admin/classes/class-list-page/ClassListPage";
export const metadata = { title: "Classes" };
export default function Page() {
  return (
    <AdminQuerySuspense>
      <ClassListPage />
    </AdminQuerySuspense>
  );
}
