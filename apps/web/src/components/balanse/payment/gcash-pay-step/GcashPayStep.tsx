"use client";

import type { PaymentAccountSummary, PaymentInstructions } from "@balanse/domain";
import { PAYMENT_ACCOUNT_TYPE_META } from "@balanse/domain";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@balanse/ui";
import { ArrowRight, Check, CircleAlert, Copy, Expand, QrCode, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import "./payment-qr-lightbox.css";

/** Only render an image for something the browser can actually load. */
function qrSrc(account: PaymentAccountSummary): string | null {
  const key = account.imageKey;
  if (!key) return null;
  return /^(https?:|data:|\/)/.test(key) ? key : null;
}

function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-1 break-words font-medium tabular-nums">{value}</dd>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          void navigator.clipboard?.writeText(value).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2_000);
          });
        }}
        aria-label={`Copy ${label.toLowerCase()}`}
      >
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

export function GcashPayStep({
  instructions,
  amountLabel,
  counterHref,
  onSent,
}: {
  /** Null when payment details could not be loaded. */
  instructions: PaymentInstructions | null;
  /** Formatted amount due, e.g. "₱550.00". */
  amountLabel: string;
  /** Where "Pay at the front desk" goes, usually the payment method page. */
  counterHref: string;
  onSent: () => void;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const accounts = instructions?.accounts ?? [];
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? null);
  const account = accounts.find((row) => row.id === accountId) ?? accounts[0] ?? null;
  const accountQr = account ? qrSrc(account) : null;

  return (
    <div className="grid gap-6 [&>*]:min-w-0">
      <div>
        <h2 className="font-display text-3xl tracking-[-0.04em]">Send {amountLabel}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Open GCash, scan the studio QR or send to the number below, and pay exactly {amountLabel}.
          Keep the confirmation screen open so you can screenshot it.
        </p>
      </div>

      {account ? (
        <>
          {accounts.length > 1 ? (
            <fieldset className="flex flex-wrap gap-2">
              <legend className="sr-only">Payment account</legend>
              {accounts.map((row) => (
                <Button
                  key={row.id}
                  type="button"
                  size="sm"
                  variant={row.id === account.id ? "default" : "outline"}
                  aria-pressed={row.id === account.id}
                  onClick={() => setAccountId(row.id)}
                >
                  {row.label}
                </Button>
              ))}
            </fieldset>
          ) : null}
          <div className="grid gap-6 sm:grid-cols-[14rem_minmax(0,1fr)] sm:items-start [&>*]:min-w-0">
            {accountQr ? (
              <button
                type="button"
                className="group relative grid aspect-square w-full max-w-[14rem] place-items-center justify-self-center overflow-hidden rounded-[1.25rem] border border-border bg-white p-3 outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
                aria-label={`Open ${account.label} QR code full screen`}
                onClick={() => setQrOpen(true)}
              >
                <img
                  src={accountQr}
                  alt={`${PAYMENT_ACCOUNT_TYPE_META[account.type].label} QR code for ${account.label}`}
                  className="size-full min-h-0 min-w-0 object-contain"
                />
                <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-foreground/90 px-2 py-1 text-[0.65rem] font-medium text-background">
                  <Expand aria-hidden className="size-3" />
                  View full screen
                </span>
              </button>
            ) : (
              <div className="grid aspect-square w-full max-w-[14rem] place-items-center justify-self-center overflow-hidden rounded-[1.25rem] border border-border bg-white p-3">
                <span className="grid place-items-center gap-2 p-4 text-center text-xs text-muted-foreground">
                  <QrCode aria-hidden className="size-8" />
                  No QR for this account. Send to the number instead.
                </span>
              </div>
            )}
            <dl className="rounded-[1.25rem] border border-border px-4">
              <CopyValue label="Amount" value={amountLabel} />
              <CopyValue label="Account name" value={account.accountName} />
              {account.accountNumber ? (
                <CopyValue
                  label={PAYMENT_ACCOUNT_TYPE_META[account.type].numberLabel}
                  value={account.accountNumber}
                />
              ) : null}
            </dl>
          </div>
        </>
      ) : (
        <Alert data-advisory="instruction">
          <CircleAlert aria-hidden />
          <AlertTitle>GCash details aren’t available right now</AlertTitle>
          <AlertDescription>
            {instructions
              ? "The studio hasn't set up a GCash account yet."
              : "We couldn't load the studio's payment details."}{" "}
            You can pay in cash at the front desk instead.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6 max-sm:[&>*]:w-full">
        {account ? (
          <Button type="button" size="lg" onClick={onSent}>
            I’ve sent the payment
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        ) : null}
        <Button
          variant={account ? "ghost" : "default"}
          size="lg"
          nativeButton={false}
          render={<Link href={counterHref} />}
        >
          Pay at the front desk
        </Button>
      </div>

      {account && accountQr ? (
        <Dialog open={qrOpen} onOpenChange={setQrOpen}>
          <DialogContent
            className="payment-qr-lightbox"
            showCloseButton={false}
            style={{ translate: "none" }}
          >
            <header className="payment-qr-lightbox-header">
              <div>
                <DialogTitle>{account.label} QR code</DialogTitle>
                <DialogDescription className="sr-only">
                  Full-screen payment QR code. Press Escape or use Close to return to the payment
                  page.
                </DialogDescription>
              </div>
              <DialogClose className="payment-qr-lightbox-close" aria-label="Close QR code">
                <X aria-hidden className="size-5" />
                <span>Close</span>
              </DialogClose>
            </header>
            <div className="payment-qr-lightbox-viewport">
              <img
                src={accountQr}
                alt={`${PAYMENT_ACCOUNT_TYPE_META[account.type].label} QR code for ${account.label}, full screen`}
                className="payment-qr-lightbox-image"
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
