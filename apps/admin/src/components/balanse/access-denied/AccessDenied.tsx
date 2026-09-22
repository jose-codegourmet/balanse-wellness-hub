import { Button } from "@balanse/ui";
import { ShieldAlert, ShieldOff, UserX } from "lucide-react";
import Link from "next/link";
import type { AccessDeniedKind, AccessDeniedProps } from "./AccessDenied.meta";

const COPY: Record<
  AccessDeniedKind,
  { title: string; description: string; icon: typeof ShieldAlert }
> = {
  forbidden: {
    title: "Admin access is not available",
    description:
      "This account is a customer or other non-staff identity. Sign out and use a staff account to manage the studio.",
    icon: ShieldOff,
  },
  revoked: {
    title: "Staff access is disabled",
    description:
      "This staff account or role is no longer active. Contact a Super Admin if you still need the admin portal.",
    icon: UserX,
  },
  denied: {
    title: "You do not have permission",
    description:
      "Your role cannot open this page or action. Use the navigation to reach a section you can manage, or ask a Super Admin for access.",
    icon: ShieldAlert,
  },
};

export function AccessDenied({ kind, homeHref }: AccessDeniedProps) {
  const copy = COPY[kind];
  const Icon = copy.icon;

  return (
    <section
      aria-labelledby="admin-access-denied-title"
      className="mx-auto max-w-xl rounded-2xl border border-border bg-card px-6 py-10 text-card-foreground"
      role="alert"
    >
      <Icon className="size-8 text-destructive" aria-hidden />
      <h1 id="admin-access-denied-title" className="mt-4 font-display text-3xl">
        {copy.title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">{copy.description}</p>
      {kind === "denied" && homeHref ? (
        <Button className="mt-6" nativeButton={false} render={<Link href={homeHref} />}>
          Go to your first available page
        </Button>
      ) : null}
    </section>
  );
}
