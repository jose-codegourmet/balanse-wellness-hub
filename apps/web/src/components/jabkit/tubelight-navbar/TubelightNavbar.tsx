"use client";

import {
  BookOpenIcon,
  BriefcaseIcon,
  CameraIcon,
  FileTextIcon,
  HomeIcon,
  type LucideIcon,
  MailIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  TubelightNavbarIconName,
  TubelightNavbarItem,
  TubelightNavbarProps,
} from "./TubelightNavbar.types";

const namedIcons: Record<TubelightNavbarIconName, LucideIcon> = {
  home: HomeIcon,
  user: UserIcon,
  briefcase: BriefcaseIcon,
  "file-text": FileTextIcon,
  sparkles: SparklesIcon,
  camera: CameraIcon,
  "book-open": BookOpenIcon,
  mail: MailIcon,
};

const defaultItems: TubelightNavbarItem[] = [
  { name: "Home", href: "#home", icon: "home" },
  { name: "About", href: "#about", icon: "user" },
  { name: "Projects", href: "#projects", icon: "briefcase" },
  { name: "Notes", href: "#notes", icon: "file-text" },
];

function resolveIcon(icon: TubelightNavbarItem["icon"]): LucideIcon {
  if (typeof icon === "string") return namedIcons[icon];
  return icon;
}

export function TubelightNavbar({
  className,
  items = defaultItems,
  activeName: activeNameProp,
  defaultActiveName,
  onActiveChange,
  ...props
}: TubelightNavbarProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [uncontrolledActive, setUncontrolledActive] = useState(
    defaultActiveName ?? items[0]?.name ?? "",
  );
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    ready: false,
  });

  const activeName = activeNameProp ?? uncontrolledActive;

  const setActive = (name: string) => {
    if (activeNameProp === undefined) setUncontrolledActive(name);
    onActiveChange?.(name);
  };

  useLayoutEffect(() => {
    const root = listRef.current;
    if (!root) return;

    const measure = () => {
      const activeItem = items.find((item) => item.name === activeName);
      if (!activeItem) return;
      const active = root.querySelector<HTMLElement>(
        `[data-nav-item="${CSS.escape(activeItem.name)}"]`,
      );
      if (!active) return;
      setIndicator({
        left: active.offsetLeft,
        width: active.offsetWidth,
        ready: true,
      });
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    for (const child of root.children) {
      if (child instanceof HTMLElement) observer.observe(child);
    }
    return () => observer.disconnect();
  }, [activeName, items]);

  return (
    <header
      className={cn(
        "relative flex w-full justify-center bg-background px-4 py-6 text-foreground",
        className,
      )}
      data-slot="tubelight-navbar"
      {...props}
    >
      <nav aria-label="Primary" className="relative">
        <div
          className={cn(
            "relative isolate flex items-center gap-1 rounded-full border border-border",
            "bg-background/75 p-1 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--jk-foreground),transparent_72%)]",
            "backdrop-blur-lg supports-[backdrop-filter]:bg-background/55",
          )}
          ref={listRef}
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1 bottom-1 rounded-full bg-muted",
              indicator.ready &&
                "transition-[left,width] duration-300 ease-out motion-reduce:transition-none",
            )}
            style={{ left: indicator.left, width: indicator.width }}
          />
          {items.map((item) => {
            const Icon = resolveIcon(item.icon);
            const isActive = item.name === activeName;
            return (
              <a
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative z-10 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium outline-none",
                  "transition-colors duration-200 motion-reduce:transition-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                data-active={isActive ? "true" : undefined}
                data-nav-item={item.name}
                href={item.href}
                key={item.name}
                onClick={() => setActive(item.name)}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="inline-flex md:hidden">
                  <Icon aria-hidden="true" className="size-[18px]" />
                  <span className="sr-only">{item.name}</span>
                </span>
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_16px_2px_color-mix(in_oklab,var(--jk-primary),transparent_35%)]"
                  >
                    <span className="absolute -top-2 left-1/2 h-6 w-12 -translate-x-1/2 rounded-full bg-primary/30 blur-md motion-reduce:hidden" />
                    <span className="absolute -top-1 left-1/2 h-4 w-8 -translate-x-1/2 rounded-full bg-primary/25 blur-sm motion-reduce:hidden" />
                  </span>
                ) : null}
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
