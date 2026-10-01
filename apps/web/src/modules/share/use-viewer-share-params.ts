"use client";

import type { ShareParams } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { useEffect, useState } from "react";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

/**
 * Share attribution for links the current viewer creates (#350): a signed-in
 * customer shares with `ref=<referralCode>&src=customer`; guests share plain links.
 */
export function useViewerShareParams(): ShareParams {
  const { principal } = useMockPrincipal();
  const [params, setParams] = useState<ShareParams>({});
  useEffect(() => {
    if (principal.role !== "customer") {
      setParams({});
      return;
    }
    let active = true;
    void getMockAdapter()
      .getMe(principal.customerId)
      .then((profile) => {
        if (active && profile) setParams({ ref: profile.referralCode, src: "customer" });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [principal.role, principal.customerId]);
  return params;
}
