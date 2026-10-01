"use client";

import { CheckIcon, CopyIcon, ExternalLinkIcon, QrCodeIcon, Share2Icon } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useIsMobile } from "../../hooks/use-breakpoint/UseBreakpoint";
import { cn } from "../../lib/utils";
import { Button } from "../button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../dialog/Dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../drawer/Drawer";
import { Input } from "../input/Input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/Tooltip";

import {
  createQrMatrix,
  QR_QUIET_ZONE,
  type QrMatrix,
  qrSvgPath,
  qrViewBoxSize,
  withQrVia,
} from "./QrMatrix";
import type {
  ShareButtonProps,
  ShareContentProps,
  ShareDialogProps,
  ShareNotification,
  ShareNotifier,
} from "./ShareDialog.meta";

/** Downloaded QR edge length in pixels. */
const QR_PNG_SIZE = 1024;
const COPIED_RESET_MS = 2000;

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Host + path for the QR caption: `balanse.ph/sessions/reformer/2026-10-04/abc`. */
function shortenUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/+$/, "");
    return `${host}${path}`;
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

function safeFileSlug(fileSlug: string): string {
  const slug = fileSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "share";
}

/**
 * 1024×1024 PNG. Modules use the largest whole-pixel scale that fits the code
 * plus its quiet zone, then the code is centred, so edges stay sharp and the
 * quiet zone is never below 4 modules.
 */
function renderQrPng(matrix: QrMatrix): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = QR_PNG_SIZE;
    canvas.height = QR_PNG_SIZE;
    const context = canvas.getContext("2d");
    if (!context) {
      reject(new Error("Canvas is not available."));
      return;
    }
    const scale = Math.floor(QR_PNG_SIZE / (matrix.size + QR_QUIET_ZONE * 2));
    const offset = Math.floor((QR_PNG_SIZE - matrix.size * scale) / 2);
    context.fillStyle = "white";
    context.fillRect(0, 0, QR_PNG_SIZE, QR_PNG_SIZE);
    context.fillStyle = "black";
    for (let row = 0; row < matrix.size; row += 1) {
      for (let col = 0; col < matrix.size; col += 1) {
        if (matrix.isDark(row, col)) {
          context.fillRect(offset + col * scale, offset + row * scale, scale, scale);
        }
      }
    }
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not encode the QR image."));
    }, "image/png");
  });
}

function saveBlob(blob: Blob, fileName: string) {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Give the browser a tick to start the download before releasing the blob.
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}

const sonnerNotifier: ShareNotifier = ({ tone, title, description }) => {
  if (tone === "success") toast.success(title, { description });
  else toast.error(title, { description });
};

function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

// ---------------------------------------------------------------------------
// Body (shared by Dialog and Drawer)
// ---------------------------------------------------------------------------

type CopyState = "idle" | "copied" | "fallback";

function ShareDialogBody({
  url,
  title,
  subtitle,
  posterUrl,
  fileSlug,
  onCopied,
  notify = sonnerNotifier,
}: ShareContentProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [nativeShare, setNativeShare] = useState(false);
  const [qrSaving, setQrSaving] = useState(false);
  const fallbackRef = useRef<HTMLInputElement>(null);
  const resetTimer = useRef<number | undefined>(undefined);
  const fallbackId = useId();

  const slug = safeFileSlug(fileSlug);
  const qrUrl = useMemo(() => withQrVia(url), [url]);
  const qrMatrix = useMemo(() => createQrMatrix(qrUrl), [qrUrl]);
  const qrPathData = useMemo(() => (qrMatrix ? qrSvgPath(qrMatrix) : ""), [qrMatrix]);
  const qrViewBox = qrMatrix ? qrViewBoxSize(qrMatrix) : 0;
  const caption = shortenUrl(url);

  // `navigator.share` is browser-only; read it after mount to keep SSR stable.
  useEffect(() => {
    setNativeShare(canUseNativeShare());
  }, []);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  useEffect(() => {
    if (copyState === "fallback") {
      fallbackRef.current?.focus();
      fallbackRef.current?.select();
    }
  }, [copyState]);

  const raise = (notification: ShareNotification) => notify(notification);

  async function handleCopy() {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopyState("idle"), COPIED_RESET_MS);
      raise({ tone: "success", title: "Link copied" });
      onCopied?.();
    } catch {
      setCopyState("fallback");
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, text: subtitle, url });
    } catch (error) {
      if (isAbortError(error)) return;
      raise({
        tone: "error",
        title: "Couldn't open sharing",
        description: "Copy the link instead.",
      });
    }
  }

  async function handleDownloadQr() {
    if (!qrMatrix) return;
    setQrSaving(true);
    try {
      const blob = await renderQrPng(qrMatrix);
      saveBlob(blob, `balanse-${slug}-qr.png`);
    } catch {
      raise({ tone: "error", title: "Couldn't create the QR image", description: "Try again." });
    } finally {
      setQrSaving(false);
    }
  }

  return (
    <div data-slot="share-dialog-body" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="default"
            className="sm:flex-1"
            onClick={handleCopy}
            aria-describedby={copyState === "fallback" ? fallbackId : undefined}
          >
            {copyState === "copied" ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
            {copyState === "copied" ? "Link copied" : "Copy link"}
          </Button>
          {nativeShare ? (
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1"
              onClick={handleNativeShare}
            >
              <Share2Icon aria-hidden />
              Share…
            </Button>
          ) : null}
        </div>

        <p aria-live="polite" className="sr-only">
          {copyState === "copied" ? "Link copied to the clipboard." : ""}
        </p>

        {copyState === "fallback" ? (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${fallbackId}-input`}
              className="text-[0.6875rem] font-semibold tracking-[0.14em] text-foreground uppercase"
            >
              Copy this link
            </label>
            <Input
              ref={fallbackRef}
              id={`${fallbackId}-input`}
              readOnly
              value={url}
              size="sm"
              onFocus={(event) => event.currentTarget.select()}
              className="font-mono text-xs"
            />
            <p id={fallbackId} className="text-xs text-muted-foreground">
              Copying isn't available here. Select the link and copy it manually.
            </p>
          </div>
        ) : null}
      </div>

      <figure className="flex flex-col items-center gap-2 rounded-[6px] border border-border bg-card p-4">
        {qrMatrix ? (
          <svg
            role="img"
            aria-label={`QR code linking to ${title}`}
            viewBox={`0 0 ${qrViewBox} ${qrViewBox}`}
            shapeRendering="crispEdges"
            className="size-48 max-w-full rounded-[4px]"
          >
            <rect width={qrViewBox} height={qrViewBox} className="fill-white" />
            <path d={qrPathData} className="fill-black" />
          </svg>
        ) : (
          <div
            role="img"
            aria-label={`QR code for ${title} is unavailable`}
            className="flex size-48 items-center justify-center text-muted-foreground"
          >
            <QrCodeIcon aria-hidden className="size-10" />
          </div>
        )}
        <figcaption className="max-w-full text-center text-xs break-all text-muted-foreground">
          {caption}
        </figcaption>
      </figure>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="sm:flex-1"
          onClick={handleDownloadQr}
          disabled={!qrMatrix}
          loading={qrSaving}
        >
          <QrCodeIcon aria-hidden data-icon="inline-start" />
          Download QR (PNG)
        </Button>
        {posterUrl ? (
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            className="sm:flex-1"
            render={<a href={posterUrl} target="_blank" rel="noreferrer" />}
          >
            <ExternalLinkIcon aria-hidden data-icon="inline-start" />
            View poster card
          </Button>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ShareDialog (controlled surface)
// ---------------------------------------------------------------------------

function ShareDialog({ open, onOpenChange, layout = "auto", ...content }: ShareDialogProps) {
  const isMobile = useIsMobile();
  const asDrawer = layout === "drawer" || (layout === "auto" && isMobile);
  const heading = `Share ${content.title}`;

  if (asDrawer) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
        <DrawerContent data-slot="share-dialog">
          <DrawerHeader>
            <DrawerTitle className="font-heading text-lg">{heading}</DrawerTitle>
            <DrawerDescription>
              {content.subtitle ?? "Send this link or let friends scan the QR."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <ShareDialogBody {...content} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-slot="share-dialog" className="gap-5 p-6 sm:max-w-md">
        <DialogHeader className="pr-8">
          <DialogTitle className="font-heading text-lg">{heading}</DialogTitle>
          <DialogDescription>
            {content.subtitle ?? "Send this link or let friends scan the QR."}
          </DialogDescription>
        </DialogHeader>
        <ShareDialogBody {...content} />
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// ShareButton (trigger + state)
// ---------------------------------------------------------------------------

function ShareButton({
  label = "Share",
  "aria-label": ariaLabel,
  iconOnly = false,
  variant = "outline",
  size,
  className,
  disabledReason,
  defaultOpen = false,
  layout,
  icon,
  ...content
}: ShareButtonProps) {
  const [open, setOpen] = useState(defaultOpen);
  const reasonId = useId();
  const disabled = Boolean(disabledReason);
  const accessibleName = ariaLabel ?? (iconOnly ? `${label} ${content.title}` : undefined);
  const buttonSize = size ?? (iconOnly ? "icon" : "md");
  const glyph = icon ?? <Share2Icon aria-hidden />;

  const trigger = (
    <Button
      type="button"
      variant={variant}
      size={buttonSize}
      // Disabled stays focusable (`aria-disabled`) so keyboard users reach the
      // reason. Pointer events go to the tooltip wrapper, so the variant's hover
      // fill never plays on a disabled trigger.
      className={cn(disabled && "pointer-events-none opacity-45", className)}
      aria-label={accessibleName}
      aria-describedby={disabled ? reasonId : undefined}
      disabled={disabled}
      focusableWhenDisabled={disabled}
      onClick={disabled ? undefined : () => setOpen(true)}
      data-slot="share-button"
    >
      {glyph}
      {iconOnly ? null : label}
    </Button>
  );

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={<span className="inline-flex cursor-not-allowed" />}
          data-slot="share-button-disabled"
        >
          {trigger}
          <span id={reasonId} className="sr-only">
            {disabledReason}
          </span>
        </TooltipTrigger>
        <TooltipContent>{disabledReason}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <>
      {trigger}
      <ShareDialog open={open} onOpenChange={setOpen} layout={layout} {...content} />
    </>
  );
}

export type {
  ShareButtonProps,
  ShareContentProps,
  ShareDialogLayout,
  ShareDialogProps,
  ShareNotification,
  ShareNotifier,
} from "./ShareDialog.meta";
export { ShareButton, ShareDialog };
