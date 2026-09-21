"use client";

import { cn } from "@balanse/ui";
import Link from "next/link";
import type { CoachStaffLinkProps } from "./CoachStaffLink.meta";

export type { CoachStaffLinkProps, CoachStaffLinkStaff } from "./CoachStaffLink.meta";

export function CoachStaffLink({ staff, className }: CoachStaffLinkProps) {
  return (
    <p data-slot="coach-staff-link" className={cn("text-sm text-muted-foreground", className)}>
      {staff ? (
        <>
          Linked staff account:{" "}
          <Link
            className="text-foreground underline underline-offset-4"
            href={`/staff/${staff.id}`}
          >
            {staff.name}
          </Link>
        </>
      ) : (
        "Not linked to a staff account. Coach-only people stay valid during this phase."
      )}
    </p>
  );
}
