"use client";

import { BALANSE_BREAKPOINTS } from "@balanse/config";
import { Button, useMinWidth } from "@balanse/ui";
import { XIcon } from "lucide-react";
import {
  Children,
  isValidElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { StepperWithTitles } from "@/components/jabkit/stepper-with-titles/StepperWithTitles";
import { cn } from "@/lib/utils";
import type {
  AdminWizardLayout,
  AdminWizardProps,
  AdminWizardStep,
  AdminWizardStepPanelProps,
} from "./AdminWizard.schema";

export function AdminWizardStepPanel({ children }: AdminWizardStepPanelProps) {
  return <>{children}</>;
}

export { useMinWidth };

function panelsByStepId(children: AdminWizardProps["children"]) {
  const map = new Map<string, ReactNode>();
  Children.forEach(children, (child) => {
    if (!isValidElement<AdminWizardStepPanelProps>(child)) return;
    if (child.type !== AdminWizardStepPanel) return;
    map.set(child.props.stepId, child.props.children);
  });
  return map;
}

function stepStatus(
  step: AdminWizardStep,
  index: number,
  current: number,
  reached: number,
  hasStepError?: AdminWizardProps["hasStepError"],
): "complete" | "error" | "current" | "upcoming" {
  if (index + 1 === current) return "current";
  if (hasStepError?.(step)) return "error";
  if (index + 1 < current || index + 1 <= reached) return "complete";
  return "upcoming";
}

export function AdminWizard({
  title,
  description,
  steps,
  children,
  footer,
  mode = "create",
  surface = "page",
  closeHref,
  breadcrumb,
  className,
  step: stepProp,
  defaultStep = 1,
  onStepChange,
  onBeforeStepChange,
  hasStepError,
  onRequestClose,
  layout: layoutProp,
}: AdminWizardProps) {
  const headingId = useId();
  const statusId = useId();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const mdUp = useMinWidth(BALANSE_BREAKPOINTS.tablet);
  const layout: AdminWizardLayout = layoutProp ?? (mdUp ? "step" : "stack");
  const overlayIsDialog = surface === "overlay" && mdUp;
  const overlayIsPage = surface === "overlay" && !mdUp;

  const [uncontrolled, setUncontrolled] = useState(defaultStep);
  const current = stepProp ?? uncontrolled;
  const [reached, setReached] = useState(() => (mode === "edit" ? steps.length : defaultStep));

  useEffect(() => {
    if (mode === "edit") setReached(steps.length);
  }, [mode, steps.length]);

  useEffect(() => {
    setReached((value) => Math.max(value, current));
  }, [current]);

  const panels = useMemo(() => panelsByStepId(children), [children]);

  const requestStep = useCallback(
    async (next: number) => {
      if (next < 1 || next > steps.length || next === current) return;
      const locked = mode === "create" && next > reached && next > current;
      if (locked) return;
      const allowed = (await onBeforeStepChange?.(current, next)) ?? true;
      if (!allowed) return;
      setReached((value) => Math.max(value, next, current));
      if (stepProp === undefined) setUncontrolled(next);
      onStepChange?.(next);
    },
    [current, mode, onBeforeStepChange, onStepChange, reached, stepProp, steps.length],
  );

  const stepper = (
    <nav aria-label="Form steps" className="min-w-0">
      <StepperWithTitles
        className="min-w-0 space-y-3 text-left [&_[role=region]]:sr-only"
        steps={steps.map((item, index) => {
          const status = stepStatus(item, index, current, reached, hasStepError);
          const locked = mode === "create" && index + 1 > reached;
          const statusLabel =
            status === "error"
              ? "Has errors"
              : status === "complete"
                ? "Complete"
                : item.description;
          return {
            title: item.title,
            description: statusLabel,
            disabled: locked,
          };
        })}
        value={current}
        onValueChange={(next) => {
          void requestStep(next);
        }}
      />
      <p id={statusId} aria-live="polite" className="sr-only">
        Step {current} of {steps.length}: {steps[current - 1]?.title ?? ""}
      </p>
    </nav>
  );

  const body = (
    <div className="grid min-h-0 gap-6">
      {steps.map((item, index) => {
        const active = index + 1 === current;
        return (
          <section
            key={item.id}
            id={`wizard-step-${item.id}`}
            aria-labelledby={`${headingId}-${item.id}`}
            hidden={layout === "step" && !active}
            className={cn(layout === "stack" ? "grid gap-4" : "grid gap-4")}
          >
            {layout === "stack" ? (
              <h2 id={`${headingId}-${item.id}`} className="font-display text-2xl">
                {item.title}
              </h2>
            ) : (
              <h2 id={`${headingId}-${item.id}`} className="sr-only">
                {item.title}
              </h2>
            )}
            {panels.get(item.id)}
          </section>
        );
      })}
    </div>
  );

  const chrome = (
    <div className={cn("flex min-h-0 flex-col gap-6", className)}>
      {stepper}
      <div className={cn(layout === "step" ? "min-h-0 flex-1 overflow-y-auto" : null, "pb-4")}>
        {body}
      </div>
    </div>
  );

  useEffect(() => {
    if (!overlayIsDialog) return;
    const previous = document.activeElement;
    panelRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onRequestClose?.();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [overlayIsDialog, onRequestClose]);

  if (overlayIsDialog) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Dismiss dialog"
          className="absolute inset-0 bg-foreground/10 supports-backdrop-filter:backdrop-blur-xs"
          onClick={() => onRequestClose?.()}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? undefined : statusId}
          tabIndex={-1}
          className="relative flex max-h-[min(100dvh-2rem,44rem)] w-full max-w-2xl flex-col gap-4 overflow-hidden rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10"
          onKeyDown={(event) => {
            if (event.key !== "Tab" || !panelRef.current) return;
            const nodes = [
              ...panelRef.current.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
              ),
            ].filter((node) => !node.hasAttribute("disabled") && node.tabIndex !== -1);
            if (nodes.length === 0) return;
            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-1">
              <h2 id={titleId} className="font-heading text-base font-medium">
                {title}
              </h2>
              {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              onClick={() => onRequestClose?.()}
            >
              <XIcon />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">{chrome}</div>
          {footer ? (
            <div className="-mx-4 -mb-4 shrink-0 border-t border-border bg-muted/50 p-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (overlayIsPage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <header className="shrink-0 border-b border-border px-4 py-4">
          <p className="font-display text-2xl">{title}</p>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">{chrome}</div>
        {footer ? (
          <div className="shrink-0 border-t border-border bg-background px-4 py-3">{footer}</div>
        ) : null}
      </div>
    );
  }

  return (
    <AdminPageShell
      className={cn("max-w-2xl", className)}
      title={title}
      description={description}
      breadcrumb={
        breadcrumb ??
        (closeHref ? [{ label: "Back", href: closeHref }, { label: title }] : undefined)
      }
    >
      <div className="pb-20">{chrome}</div>
      {footer ? (
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0">
          {footer}
        </div>
      ) : null}
    </AdminPageShell>
  );
}

export type { AdminWizardProps, AdminWizardStep, AdminWizardStepPanelProps };
