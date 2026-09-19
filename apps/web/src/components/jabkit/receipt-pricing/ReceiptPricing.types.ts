import type { HTMLAttributes, ReactNode } from "react";

export type ReceiptPricingPeriod = "monthly" | "yearly";

export interface ReceiptPricingItem {
  label: string;
  value: string;
}

export interface ReceiptPricingPlan {
  id: string;
  name: string;
  tagline?: string;
  monthly: number;
  yearly?: number;
  cta?: string;
  href?: string;
  featured?: boolean;
  items: ReceiptPricingItem[];
}

export interface ReceiptPricingProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: string;
  description?: string;
  children?: ReactNode;
  merchant?: string;
  merchantNote?: string;
  orderPrefix?: string;
  monthsFree?: number;
  printMs?: number;
  tearMs?: number;
  stagger?: number;
  toothWidth?: number;
  toothDepth?: number;
  grain?: number;
  printOnReveal?: boolean;
  showStamp?: boolean;
  showBarcode?: boolean;
  stampLabel?: string;
  monthlyLabel?: string;
  yearlyLabel?: string;
  currency?: string;
  locale?: string;
  defaultPeriod?: ReceiptPricingPeriod;
  period?: ReceiptPricingPeriod;
  onPeriodChange?: (period: ReceiptPricingPeriod) => void;
  onSelectPlan?: (
    plan: ReceiptPricingPlan,
    period: ReceiptPricingPeriod,
  ) => void;
  plans?: ReceiptPricingPlan[];
}
