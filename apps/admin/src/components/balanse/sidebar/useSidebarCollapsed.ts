"use client";

import { useCallback, useEffect, useState } from "react";
import { ADMIN_SIDEBAR_COOKIE } from "./sidebar-cookie";

function writeSidebarCookie(collapsed: boolean) {
  // biome-ignore lint/suspicious/noDocumentCookie: persist collapse choice across reloads
  document.cookie = `${ADMIN_SIDEBAR_COOKIE}=${collapsed ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.getAttribute("contenteditable") === "true") return true;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true'], [role='textbox']"),
  );
}

export function useSidebarCollapsed({
  defaultCollapsed = false,
  collapsed: collapsedProp,
  onCollapsedChange,
}: {
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
} = {}) {
  const [uncontrolled, setUncontrolled] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? uncontrolled;

  const setCollapsed = useCallback(
    (next: boolean) => {
      if (collapsedProp === undefined) setUncontrolled(next);
      onCollapsedChange?.(next);
      writeSidebarCookie(next);
    },
    [collapsedProp, onCollapsedChange],
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.repeat) return;
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "b") return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      setCollapsed(!collapsed);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [collapsed, setCollapsed]);

  return { collapsed, toggleCollapsed, setCollapsed };
}
