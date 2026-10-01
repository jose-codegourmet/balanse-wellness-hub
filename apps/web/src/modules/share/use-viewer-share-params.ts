"use client";

import type { ShareParams } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { useEffect, useState } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

const NONE: ShareParams = {};

/**
 * Share attribution for links the current viewer creates (#350): a signed-in
 * customer shares with `ref=<referralCode>&src=customer`; guests share plain links.
 */
export function useViewerShareParams(): ShareParams {
  const { principal } = useMockPrincipal();
  const customerId = principal.role === "customer" ? principal.customerId : null;
  const [loaded, setLoaded] = useState<{ customerId: string; params: ShareParams } | null>(null);

  useEffect(() => {
    if (!customerId) return;
    let active = true;
    void getMockAdapter()
      .getMe(customerId)
      .then((profile) => {
        if (active && profile) {
          setLoaded({ customerId, params: { ref: profile.referralCode, src: "customer" } });
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [customerId]);

  // Derived, so a principal switch never shows the previous customer's code.
  return customerId && loaded?.customerId === customerId ? loaded.params : NONE;
}
