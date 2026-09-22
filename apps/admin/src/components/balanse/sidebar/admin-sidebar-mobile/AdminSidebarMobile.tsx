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
import { useState } from "react";
import { AdminNotificationHeader } from "@/components/balanse/admin-notification-header/AdminNotificationHeader";
import { AdminSidebarFooter } from "../admin-sidebar-footer/AdminSidebarFooter";
import { AdminSidebarNav } from "../admin-sidebar-nav/AdminSidebarNav";
import type { AdminSidebarMobileProps } from "./AdminSidebarMobile.meta";

export function AdminSidebarMobile({
  pathname,
  items,
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

  return (
    <div className={className} {...props}>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-background/85 px-4 shadow-sm shadow-primary/5 backdrop-blur-xl md:hidden">
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
            <SheetContent
              className="w-72 gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-0.75 before:bg-(--balanse-gold) sm:max-w-72"
              side="left"
            >
              <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-4">
                <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                <BrandLockup showTagline={false} />
              </SheetHeader>
              <AdminSidebarNav items={items} pathname={pathname} snapshot={snapshot} />
              <AdminSidebarFooter onLogout={onLogout} onSettings={onSettings} />
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
}
