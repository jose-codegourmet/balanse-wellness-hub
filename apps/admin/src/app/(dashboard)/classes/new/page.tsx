import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchAdmin } from "@/lib/query/prefetch";
import { adminClassesQuery } from "@/lib/query/queries";
import { getStaffAccessToken, getStaffSession } from "@/modules/session/current-staff";
import { ClassFormPage } from "../_components/class-form-page/ClassFormPage";
export const metadata = { title: "Create a class" };
export default async function Page() {
  const [{ actor }, token] = await Promise.all([getStaffSession(), getStaffAccessToken()]);
  return prefetchAdmin(
    [adminClassesQuery(actor, serverFetcher(token))],
    <ClassFormPage classId="new" />,
  );
}
