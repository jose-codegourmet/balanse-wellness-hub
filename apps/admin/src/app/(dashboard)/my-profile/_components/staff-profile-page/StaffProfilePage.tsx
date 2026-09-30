"use client";

import { roleLabel } from "@balanse/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@balanse/ui";
import { BellRing, ShieldCheck, UserRound } from "lucide-react";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { ProfilePreferencesForm } from "../profile-preferences-form/ProfilePreferencesForm";

export function StaffProfilePage() {
  const { actor } = useMockPrincipal();
  const email = actor?.email ?? "staff@balanse.example";
  const role = actor ? roleLabel(actor.roleKey, actor.roleName ?? undefined) : "Staff";

  return (
    <AdminPageShell
      breadcrumb={[{ label: "My profile" }]}
      description="Review your active staff account and choose the updates you want to receive."
      eyebrow="Account"
      title="My profile"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserRound aria-hidden className="size-5 text-primary" />
                <CardTitle>Staff identity</CardTitle>
              </div>
              <CardDescription>
                Your role and sign-in email are managed by a Super Admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
                  Sign-in email
                </p>
                <p className="mt-1 break-all text-sm font-medium">{email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
                  Active role
                </p>
                <p className="mt-1 text-sm font-medium">{role}</p>
              </div>
            </CardContent>
          </Card>
          <ProfilePreferencesForm />
        </div>
        <aside className="grid content-start gap-4">
          <Card className="border-primary/20 bg-primary/3">
            <CardHeader>
              <ShieldCheck aria-hidden className="size-5 text-primary" />
              <CardTitle>Account access</CardTitle>
              <CardDescription>
                Your screen access is based on your current staff role. Contact a Super Admin if the
                access shown in the sidebar does not match your responsibilities.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <BellRing aria-hidden className="size-5 text-primary" />
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>
                Preferences are saved to this mock session only; they do not change delivery
                channels outside the preview.
              </CardDescription>
            </CardHeader>
          </Card>
        </aside>
      </div>
    </AdminPageShell>
  );
}
