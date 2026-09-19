import { PortalGuard } from "@/modules/layout/PortalGuard";
import { PortalNav } from "@/modules/layout/PortalNav";
import { PublicFooter, PublicHeader } from "@/modules/layout/PublicChrome";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalGuard>
      <PublicHeader />
      <PortalNav />
      <main className="min-h-0 flex-1">{children}</main>
      <PublicFooter />
    </PortalGuard>
  );
}
