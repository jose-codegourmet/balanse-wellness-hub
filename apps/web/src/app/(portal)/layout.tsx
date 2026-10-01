import { redirect } from "next/navigation";
import { PortalNav } from "@/modules/layout/PortalNav";
import { getCurrentCustomer } from "@/modules/session/current-customer";
import "@/components/balanse/portal/portal.css";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  // `src/proxy.ts` already sends guests to /login with the full returnTo;
  // this is the server-side backstop.
  const profile = await getCurrentCustomer();
  if (!profile) {
    redirect("/login?returnTo=/portal");
  }
  return (
    <div className="portal-shell">
      {/* Identifies whose session the sidebar logout ends (FE-CUS-018). */}
      <PortalNav
        account={{
          id: profile.id,
          fullName: profile.fullName,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
          email: profile.email,
        }}
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
  );
}
