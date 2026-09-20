import type { CustomerStatusKey } from "@balanse/domain";
import type * as React from "react";

export type AdminQueueCardProps = {
  who: string;
  what: string;
  when: string;
  status: CustomerStatusKey;
  body?: React.ReactNode;
  media?: React.ReactNode;
  actions?: React.ReactNode;
  emphasis?: boolean;
  className?: string;
};
