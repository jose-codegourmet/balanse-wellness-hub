import type { ReactNode } from "react";
import type { AdminBreadcrumbItem } from "@/components/balanse/page/admin-page-shell/AdminPageShell.meta";

export type AdminWizardMode = "create" | "edit";
export type AdminWizardSurface = "overlay" | "page";
export type AdminWizardLayout = "step" | "stack";

export type AdminWizardStep = {
  id: string;
  title: string;
  description?: string;
  /** Field names used to mark the step complete / has-errors. */
  fields?: readonly string[];
};

export type AdminWizardProps = {
  title: string;
  description?: string;
  steps: readonly AdminWizardStep[];
  children: ReactNode;
  footer?: ReactNode;
  /** Create enforces linear order; edit lets every step be opened directly. */
  mode?: AdminWizardMode;
  /**
   * `overlay` is a desktop dialog (or a mobile full-bleed page). `page` is
   * always an `AdminPageShell` — used for hard navigation and refresh.
   */
  surface?: AdminWizardSurface;
  closeHref?: string;
  breadcrumb?: AdminBreadcrumbItem[];
  className?: string;
  /** 1-based controlled step. */
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /**
   * Return false to block the change (e.g. current-step validation failed).
   * Called for stepper clicks and Next / Back.
   */
  onBeforeStepChange?: (from: number, to: number) => boolean | Promise<boolean>;
  hasStepError?: (step: AdminWizardStep) => boolean;
  onRequestClose?: () => void;
  /** Force one-step or stacked sections. Omit to follow the 768px breakpoint. */
  layout?: AdminWizardLayout;
};

export type AdminWizardStepPanelProps = {
  stepId: string;
  children: ReactNode;
};
