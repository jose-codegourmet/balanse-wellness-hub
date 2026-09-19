"use client";

import {
  createContext,
  createElement,
  type ReactNode,
  type RefObject,
  useContext,
} from "react";

export type JkPortalContainer =
  | HTMLElement
  | ShadowRoot
  | RefObject<HTMLElement | ShadowRoot | null>
  | null
  | undefined;

const JkPortalContainerContext = createContext<JkPortalContainer>(undefined);

export function JkPortalContainerProvider({
  container,
  children,
}: {
  container: JkPortalContainer;
  children: ReactNode;
}) {
  return createElement(
    JkPortalContainerContext.Provider,
    { value: container },
    children,
  );
}

export function useJkPortalContainer(
  override?: JkPortalContainer,
): JkPortalContainer {
  const ctx = useContext(JkPortalContainerContext);
  if (override !== undefined) return override ?? undefined;
  return ctx ?? undefined;
}
