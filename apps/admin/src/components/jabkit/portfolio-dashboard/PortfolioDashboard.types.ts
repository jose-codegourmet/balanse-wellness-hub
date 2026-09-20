import type { HTMLAttributes } from "react";

export type PortfolioDashboardPageId =
  | "overview"
  | "policy-threads"
  | "documents"
  | "claims-hub"
  | "renewals"
  | "clients"
  | "shared-portfolio"
  | "integrations"
  | "settings";

export type PortfolioDashboardNavIcon =
  | "overview"
  | "threads"
  | "documents"
  | "claims"
  | "renewals"
  | "clients"
  | "shared"
  | "integrations"
  | "settings";

export type PortfolioDashboardTone =
  | "success"
  | "warning"
  | "destructive"
  | "primary"
  | "muted";

export type PortfolioDashboardTrend = "up" | "down" | "stable";

export interface PortfolioDashboardNavItem {
  id: PortfolioDashboardPageId;
  label: string;
  icon: PortfolioDashboardNavIcon;
  count?: string;
}

export interface PortfolioDashboardNavGroup {
  label: string;
  items: PortfolioDashboardNavItem[];
}

export interface PortfolioDashboardUser {
  name: string;
  email: string;
  initials: string;
  image?: string;
  role?: string;
}

export interface PortfolioDashboardAlert {
  id: string;
  label: string;
  tone: "muted" | "warning";
}

export interface PortfolioDashboardStat {
  id: string;
  label: string;
  value: string;
  delta: string;
  period?: string;
  trend: PortfolioDashboardTrend;
  bars: number[];
}

export interface PortfolioDashboardPolicy {
  id: string;
  initials: string;
  name: string;
  type: string;
  status: string;
  tone: PortfolioDashboardTone;
  price: string;
  detail: string;
}

export interface PortfolioDashboardInsight {
  id: string;
  body: string;
}

export interface PortfolioDashboardActivity {
  id: string;
  time: string;
  title: string;
  detail: string;
}

export interface PortfolioDashboardRenewal {
  id: string;
  initials: string;
  name: string;
  type: string;
  due: string;
  tone: PortfolioDashboardTone;
}

export interface PortfolioDashboardRiskRow {
  id: string;
  label: string;
  bars: number;
  score: number;
  tone: PortfolioDashboardTone;
}

export interface PortfolioDashboardNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
}

export interface PortfolioDashboardThread {
  id: string;
  title: string;
  client: string;
  preview: string;
  updated: string;
  unread: number;
}

export interface PortfolioDashboardDocument {
  id: string;
  name: string;
  kind: string;
  owner: string;
  updated: string;
}

export interface PortfolioDashboardClaim {
  id: string;
  reference: string;
  client: string;
  type: string;
  amount: string;
  status: string;
  tone: PortfolioDashboardTone;
}

export interface PortfolioDashboardClient {
  id: string;
  initials: string;
  name: string;
  book: string;
  policies: number;
}

export interface PortfolioDashboardIntegration {
  id: string;
  name: string;
  status: string;
  connected: boolean;
}

export interface PortfolioDashboardUsage {
  label: string;
  current: number;
  limit: number;
  filled: number;
  total: number;
}

export interface PortfolioDashboardProps extends HTMLAttributes<HTMLElement> {
  brand?: string;
  greeting?: string;
  searchPlaceholder?: string;
  user?: PortfolioDashboardUser;
  navGroups?: PortfolioDashboardNavGroup[];
  alerts?: PortfolioDashboardAlert[];
  stats?: PortfolioDashboardStat[];
  policies?: PortfolioDashboardPolicy[];
  insights?: PortfolioDashboardInsight[];
  activities?: PortfolioDashboardActivity[];
  renewals?: PortfolioDashboardRenewal[];
  riskRows?: PortfolioDashboardRiskRow[];
  notifications?: PortfolioDashboardNotification[];
  threads?: PortfolioDashboardThread[];
  documents?: PortfolioDashboardDocument[];
  claims?: PortfolioDashboardClaim[];
  clients?: PortfolioDashboardClient[];
  integrations?: PortfolioDashboardIntegration[];
  usage?: PortfolioDashboardUsage;
  policyCountLabel?: string;
  initialPage?: PortfolioDashboardPageId;
}
