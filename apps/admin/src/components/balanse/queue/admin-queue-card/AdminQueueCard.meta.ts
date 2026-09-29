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

export type AdminQueueFact = {
  label: string;
  value: React.ReactNode;
};

/**
 * `AdminQueueFacts` lays out a card body's key facts (time, amount, method,
 * payment state) as a label / value grid. Two columns on phones, four from `sm`.
 */
export type AdminQueueFactsProps = {
  items: AdminQueueFact[];
  className?: string;
};
