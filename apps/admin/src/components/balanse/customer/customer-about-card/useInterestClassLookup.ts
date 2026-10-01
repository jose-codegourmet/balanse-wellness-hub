"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { adminClassesQuery, adminPublicClassesQuery } from "@/lib/query/queries";
import { useCanAdminRoute } from "@/modules/authorization/useAdminAccess";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import type { InterestClass } from "./CustomerAboutCard.meta";

/**
 * Names for onboarding interest class ids. Staff with `classes.read` get the
 * admin catalogue (including inactive classes) and class links; everyone else
 * (e.g. Coach) gets the active public catalogue and plain text.
 */
export function useInterestClassLookup(): {
  classes: Record<string, InterestClass>;
  classHref: ((classId: string) => string | null) | null;
} {
  const { principal } = useMockPrincipal();
  const canReadClasses = useCanAdminRoute("/classes");
  const adminClasses = useQuery({ ...adminClassesQuery(principal), enabled: canReadClasses });
  const publicClasses = useQuery({
    ...adminPublicClassesQuery(principal),
    enabled: !canReadClasses,
  });
  const rows = canReadClasses ? adminClasses.data : publicClasses.data;

  const classes = useMemo(
    () =>
      Object.fromEntries(
        (rows ?? []).map((row) => [row.id, { id: row.id, name: row.name, active: row.active }]),
      ),
    [rows],
  );

  return {
    classes,
    classHref: canReadClasses ? (classId: string) => `/classes/${classId}` : null,
  };
}
