import { CardListSkeleton } from "@balanse/ui";
import { AdminPageShell } from "@/components/balanse/page/AdminPageShell";
import { AdminPageTabs } from "@/components/balanse/page/AdminPageTabs";

const TABS = [
  { id: "gcash", label: "GCash Pending" },
  { id: "counter", label: "Pay at Counter" },
  { id: "refunds", label: "Refunds" },
] as const;

export default function Loading() {
  return (
    <AdminPageShell
      title="Payments"
      tabs={<AdminPageTabs tabs={TABS} value="gcash" onValueChange={() => undefined} />}
    >
      <CardListSkeleton label="Loading payments" items={3} />
    </AdminPageShell>
  );
}
