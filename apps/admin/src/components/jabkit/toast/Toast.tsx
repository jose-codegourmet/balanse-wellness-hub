"use client";

import {
  type ToastManager,
  Toast as ToastPrimitive,
} from "@base-ui/react/toast";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { type ReactNode, useLayoutEffect, useState } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type {
  ToastActionProps,
  ToastCardProps,
  ToastCloseProps,
  ToastContentProps,
  ToastDescriptionProps,
  ToasterProps,
  ToastPortalProps,
  ToastProps,
  ToastProviderProps,
  ToastStatus,
  ToastTitleProps,
  ToastViewportProps,
} from "./Toast.types";

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

let sharedManager: ToastManager | undefined;

function getSharedToastManager() {
  sharedManager ??= createToastManager();
  return sharedManager;
}

const toast = {
  add: ((options) =>
    getSharedToastManager().add(options)) as ToastManager["add"],
  close: ((id) => getSharedToastManager().close(id)) as ToastManager["close"],
  update: ((id, options) =>
    getSharedToastManager().update(id, options)) as ToastManager["update"],
  promise: ((promiseValue, options) =>
    getSharedToastManager().promise(
      promiseValue,
      options,
    )) as ToastManager["promise"],
};

function ToastProvider({ ...props }: ToastProviderProps) {
  return <ToastPrimitive.Provider data-slot="toast-provider" {...props} />;
}

function ToastPortal({ ...props }: ToastPortalProps) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastViewportProps) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className,
      )}
      {...props}
    />
  );
}

function Toast({ className, ...props }: ToastProps) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-[--radius] border border-border bg-popover text-popover-foreground shadow-lg outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
        "[--gap:0.75rem] [--peek:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))]",
        "[--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "[--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
        "h-(--height) will-change-transform [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
        "[transition:transform_.5s_cubic-bezier(.22,1,.36,1),opacity_.5s,height_.15s] motion-reduce:transition-none",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className,
      )}
      {...props}
    />
  );
}

function ToastContent({ className, ...props }: ToastContentProps) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none data-behind:opacity-0 data-expanded:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: ToastTitleProps) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function ToastAction({ className, ...props }: ToastActionProps) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-[--radius] border border-border bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function ToastClose({ className, children, ...props }: ToastCloseProps) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      className={cn(
        "relative shrink-0 rounded-[--radius] text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon className="size-4" />}
    </ToastPrimitive.Close>
  );
}

function ToastIcon({ type }: { type: ToastStatus | string | undefined }) {
  const icons: Record<ToastStatus, ReactNode> = {
    success: <CircleCheckIcon className="size-4 text-success" />,
    info: <InfoIcon className="size-4 text-foreground" />,
    warning: <TriangleAlertIcon className="size-4 text-warning" />,
    error: <CircleAlertIcon className="size-4 text-destructive" />,
    loading: (
      <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none" />
    ),
  };
  const icon = type && type in icons ? icons[type as ToastStatus] : null;
  if (!icon) return null;
  return (
    <div
      data-slot="toast-icon"
      className="flex size-8 shrink-0 items-center justify-center rounded-[--radius] bg-muted"
    >
      {icon}
    </div>
  );
}

function ToastList() {
  const { toasts } = useToastManager();

  return toasts.map((item) => (
    <Toast key={item.id} toast={item}>
      <ToastContent>
        <ToastIcon type={item.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {item.title ? <ToastTitle>{item.title}</ToastTitle> : null}
          {item.description ? (
            <ToastDescription>{item.description}</ToastDescription>
          ) : null}
        </div>
        {item.actionProps ? <ToastAction {...item.actionProps} /> : null}
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function ToastCard({
  className,
  title,
  description,
  type,
  actionLabel,
}: ToastCardProps) {
  return (
    <div
      data-slot="toast"
      className={cn(
        "flex w-full max-w-sm items-center rounded-[--radius] border border-border bg-popover text-popover-foreground shadow-lg",
        className,
      )}
    >
      <div className="flex w-full items-center gap-3 overflow-hidden p-4">
        <ToastIcon type={type} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actionLabel ? (
          <span className="inline-flex h-8 shrink-0 items-center justify-center rounded-[--radius] border border-border bg-secondary px-3 text-sm font-medium text-secondary-foreground">
            {actionLabel}
          </span>
        ) : null}
        <span className="relative shrink-0 text-muted-foreground">
          <XIcon className="size-4" />
        </span>
      </div>
    </div>
  );
}

function Toaster({
  children,
  toastManager,
  disablePortal = false,
  viewportClassName,
  ...props
}: ToasterProps) {
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => {
    setMounted(true);
  }, []);
  const manager =
    toastManager ?? (mounted ? getSharedToastManager() : undefined);
  const viewport = (
    <ToastViewport className={viewportClassName}>
      <ToastList />
    </ToastViewport>
  );

  return (
    <ToastProvider toastManager={manager} {...props}>
      {children}
      {mounted ? (
        disablePortal ? (
          viewport
        ) : (
          <ToastPortal>{viewport}</ToastPortal>
        )
      ) : null}
    </ToastProvider>
  );
}

export {
  createToastManager,
  Toast,
  ToastAction,
  ToastCard,
  ToastClose,
  ToastContent,
  ToastDescription,
  Toaster,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
  useToastManager,
};
