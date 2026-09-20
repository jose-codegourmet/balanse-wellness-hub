"use client";

import { ADMIN_NAV_ITEMS, isAdminNavActive } from "@balanse/domain";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@balanse/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import type { AdminBreadcrumbItem } from "./AdminPageShell.schema";

function deriveTrail(pathname: string, recordName?: string): AdminBreadcrumbItem[] {
  const nav = ADMIN_NAV_ITEMS.find((item) => isAdminNavActive(item, pathname));
  if (!nav) return [];

  const isDetail = pathname !== nav.href && pathname.startsWith(`${nav.href}/`);
  if (!isDetail) return [{ label: nav.label }];

  const segment =
    pathname
      .slice(nav.href.length + 1)
      .split("/")
      .filter(Boolean)[0] ?? "";
  return [{ label: nav.label, href: nav.href }, { label: recordName ?? segment }];
}

export function AdminBreadcrumb({
  items,
  recordName,
}: {
  items?: AdminBreadcrumbItem[];
  recordName?: string;
}) {
  const pathname = usePathname() ?? "";
  const trail = items && items.length > 0 ? items : deriveTrail(pathname, recordName);
  if (trail.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <Fragment key={`${item.label}-${item.href ?? "current"}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={item.href} />}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
