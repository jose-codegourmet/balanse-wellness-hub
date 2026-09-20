"use client";

import {
  BalansePortalNavigation,
  type PortalAccount,
} from "@/components/balanse/portal/BalansePortalNavigation";

export function PortalNav({ account }: { account?: PortalAccount }) {
  return <BalansePortalNavigation account={account} />;
}
