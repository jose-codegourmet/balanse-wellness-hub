import { getMockAdapter } from "@balanse/mock";
import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PortalGuard } from "@/modules/layout/PortalGuard";
import { PortalNav } from "@/modules/layout/PortalNav";
import "@/components/balanse/portal/portal.css";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const principal = parseMockPrincipal(store.get(MOCK_HARNESS_COOKIE)?.value);
  if (principal.role === "guest") {
    redirect("/login?returnTo=/portal");
  }
  // Identifies whose session the sidebar logout ends (FE-CUS-018).
  const profile = await getMockAdapter().getMe(principal.customerId);
  return (
    <PortalGuard>
      <div className="portal-shell">
        <PortalNav
          account={profile ? { fullName: profile.fullName, email: profile.email } : undefined}
        />
        <div className="portal-workspace">
          <main id="main-content" className="min-w-0 flex-1">
            {children}
          </main>
          <footer className="portal-footer">
            Balansé Wellness Hub <span>A little time for you.</span>
          </footer>
        </div>
      </div>
    </PortalGuard>
  );
}
