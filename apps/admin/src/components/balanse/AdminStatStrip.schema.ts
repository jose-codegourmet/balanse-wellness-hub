import type { LucideIcon } from "lucide-react";

export type AdminStat = {
  id: string;
  label: string;
  value: string;
  href?: string;
  icon: LucideIcon;
};

export type AdminStatStripProps = {
  stats: AdminStat[];
};
