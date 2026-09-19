import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PortalGuard } from "@/modules/layout/PortalGuard";
import { PortalNav } from "@/modules/layout/PortalNav";
import { PublicFooter, PublicHeader } from "@/modules/layout/PublicChrome";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const principal = parseMockPrincipal(store.get(MOCK_HARNESS_COOKIE)?.value);
  if (principal.role === "guest") {
    redirect("/login?returnTo=/portal");
  }
  return (
    <PortalGuard>
      <PublicHeader />
      <PortalNav />
      <main className="min-h-0 flex-1">{children}</main>
      <PublicFooter />
    </PortalGuard>
  );
}
