import { BalanseFooter } from "@/components/balanse/marketing/BalanseFooter";
import { PublicHeader } from "@/modules/layout/PublicChrome";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="min-h-0 flex-1">
        {children}
      </main>
      <BalanseFooter />
    </>
  );
}
