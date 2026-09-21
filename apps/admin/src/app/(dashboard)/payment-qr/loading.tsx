import { CardListSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";

export default function Loading() {
  return (
    <AdminPageShell title="Payment QR">
      <CardListSkeleton label="Loading payment QRs" items={2} />
    </AdminPageShell>
  );
}
