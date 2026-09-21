"use client";

import {
  BrandLockup,
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@balanse/ui";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminNotificationHeader } from "@/components/balanse/admin-notification-header/AdminNotificationHeader";
import { AdminSidebarFooter } from "../admin-sidebar-footer/AdminSidebarFooter";
import { AdminSidebarNav } from "../admin-sidebar-nav/AdminSidebarNav";
import type { AdminSidebarMobileProps } from "./AdminSidebarMobile.schema";

export function AdminSidebarMobile({
  pathname,
  snapshot = null,
  open: openProp,
  onOpenChange,
  onSettings,
  onLogout,
  className,
  ...props
}: AdminSidebarMobileProps) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const controlled = openProp !== undefined;
  const open = openProp ?? uncontrolled;

  function setOpen(next: boolean) {
    if (!controlled) setUncontrolled(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    if (controlled) return;
    setUncontrolled(false);
  }, [pathname, controlled]);

  return (
    <div className={className} {...props}>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
        <BrandLockup showTagline={false} />
        <div className="flex items-center gap-2">
          <AdminNotificationHeader compact pathname={pathname} />
          <Sheet onOpenChange={setOpen} open={open}>
            <SheetTrigger
              render={
                <Button
                  aria-label="Open navigation"
                  className="md:hidden"
                  size="icon"
                  variant="outline"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent className="w-64 gap-0 p-0 sm:max-w-64" side="left">
              <SheetHeader className="h-16 justify-center border-b border-border px-4">
                <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                <BrandLockup showTagline={false} />
              </SheetHeader>
              <AdminSidebarNav pathname={pathname} snapshot={snapshot} />
              <AdminSidebarFooter onLogout={onLogout} onSettings={onSettings} />
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
}
