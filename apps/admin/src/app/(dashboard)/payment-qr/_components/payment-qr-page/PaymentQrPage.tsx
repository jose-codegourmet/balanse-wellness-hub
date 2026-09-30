"use client";

import {
  FIELD_CONSTRAINTS,
  PAYMENT_ACCOUNT_TYPE_META,
  type PaymentAccountType,
  type PaymentQrCode,
} from "@balanse/domain";
import { Alert, AlertDescription, AlertTitle, Badge, Button, Switch } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, Copy, EyeOff, Pencil, Plus, QrCode, TriangleAlert, Wallet } from "lucide-react";
import { useState } from "react";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import { useArchivePaymentQr, useSetPaymentQrActive } from "@/lib/query/mutations";
import { adminPaymentQrsQuery } from "@/lib/query/queries";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";
import { PaymentAccountFormDialog } from "../payment-account-form-dialog/PaymentAccountFormDialog";

export type PaymentQrPageProps = {
  empty?: boolean;
  /** Storybook: render these accounts instead of the adapter list. */
  items?: PaymentQrCode[];
};

const TYPE_BADGE: Record<PaymentAccountType, string> = {
  GCASH: "bg-primary/10 text-primary",
  MAYA: "bg-[var(--balanse-gold)]/20 text-foreground",
  QRPH: "bg-muted text-foreground",
};

/**
 * Payment accounts customers pay into: GCash, Maya, or QR Ph. Each has an
 * optional QR (required for QR Ph), holder name, and number. Any number can be
 * shown at checkout at once.
 */
export function PaymentQrPage({ empty, items: itemsProp }: PaymentQrPageProps) {
  const { principal } = useMockPrincipal();
  const listQuery = useSuspenseQuery(adminPaymentQrsQuery(principal));
  const items = empty ? [] : (itemsProp ?? listQuery.data.items);
  const shown = items.filter((row) => row.isActive);
  const hidden = items.filter((row) => !row.isActive);
  const atLimit = items.length >= FIELD_CONSTRAINTS.settings.paymentQr.maxItems;
  const [dialog, setDialog] = useState<{ account: PaymentQrCode | null } | null>(null);

  const addButton = (
    <Button type="button" disabled={atLimit} onClick={() => setDialog({ account: null })}>
      <Plus />
      Add account
    </Button>
  );

  return (
    <AdminPageShell
      eyebrow="Payment QR"
      title="Payment accounts"
      description="The GCash, Maya, and QR Ph accounts customers pay into. Upload each QR, keep the holder name and number right, and choose which ones customers see at checkout."
      actions={items.length > 0 ? addButton : undefined}
      stats={
        items.length > 0 ? (
          <dl className="grid grid-cols-2 gap-3 sm:max-w-sm">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Shown at checkout</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{shown.length}</dd>
            </div>
            <div className="border-l border-border pl-3 sm:pl-5">
              <dt className="text-xs font-medium text-muted-foreground">Hidden</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{hidden.length}</dd>
            </div>
          </dl>
        ) : undefined
      }
    >
      <div className="mx-auto grid max-w-5xl gap-6">
        {items.length === 0 ? (
          <section className="grid place-items-center gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-muted">
              <Wallet className="size-5" aria-hidden />
            </span>
            <div className="grid max-w-md gap-1">
              <h2 className="font-display text-2xl">Add your first payment account</h2>
              <p className="text-sm text-muted-foreground">
                Add the studio&apos;s GCash, Maya, or QR Ph account so customers know where to send
                payment.
              </p>
            </div>
            {addButton}
          </section>
        ) : (
          <>
            {shown.length === 0 ? (
              <Alert variant="destructive">
                <TriangleAlert aria-hidden />
                <AlertTitle>Customers can&apos;t see any payment account</AlertTitle>
                <AlertDescription>
                  Show at least one account so customers know where to pay at checkout.
                </AlertDescription>
              </Alert>
            ) : null}
            <ul className="grid gap-4 md:grid-cols-2">
              {[...shown, ...hidden].map((account) => (
                <li key={account.id}>
                  <AccountCard account={account} onEdit={() => setDialog({ account })} />
                </li>
              ))}
            </ul>
            {atLimit ? (
              <p className="text-sm text-muted-foreground">
                You have the maximum of {FIELD_CONSTRAINTS.settings.paymentQr.maxItems} accounts.
                Remove one to add another.
              </p>
            ) : null}
          </>
        )}
      </div>

      <PaymentAccountFormDialog
        open={dialog !== null}
        account={dialog?.account ?? null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </AdminPageShell>
  );
}

function AccountCard({ account, onEdit }: { account: PaymentQrCode; onEdit: () => void }) {
  const setActive = useSetPaymentQrActive();
  const archive = useArchivePaymentQr();
  const [copied, setCopied] = useState(false);
  const meta = PAYMENT_ACCOUNT_TYPE_META[account.type];
  const switchId = `payment-account-${account.id}-shown`;

  return (
    <article
      className={`grid h-full overflow-hidden rounded-2xl border bg-card shadow-sm sm:grid-cols-[10rem_minmax(0,1fr)] ${account.isActive ? "border-border" : "border-dashed border-border opacity-90"}`}
    >
      <div className="grid place-items-center bg-muted/50 p-5">
        {account.imageKey ? (
          <PaymentQrImage imageKey={account.imageKey} label={account.label} />
        ) : (
          <div className="grid aspect-square w-full max-w-[8rem] place-items-center rounded-lg border border-dashed border-border bg-background p-3 text-center text-xs text-muted-foreground">
            <span className="grid justify-items-center gap-1.5">
              <QrCode className="size-5" aria-hidden />
              No QR — number only
            </span>
          </div>
        )}
      </div>
      <div className="grid content-between gap-4 p-5">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_BADGE[account.type]}`}
            >
              {meta.label}
            </span>
            {account.isActive ? (
              <Badge variant="success" size="sm" dot>
                Shown at checkout
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                <EyeOff aria-hidden />
                Hidden
              </Badge>
            )}
          </div>
          <h2 className="font-display text-xl leading-tight">{account.label}</h2>
          <dl className="grid gap-1 text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">Account name</dt>
              <dd className="font-medium">{account.accountName}</dd>
            </div>
            <div className="flex flex-wrap items-center gap-x-2">
              <dt className="text-muted-foreground">{meta.numberLabel}</dt>
              <dd className="font-medium tabular-nums">{account.accountNumber || "—"}</dd>
              {account.accountNumber ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs underline underline-offset-4"
                  onClick={() => {
                    void navigator.clipboard?.writeText(account.accountNumber);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? (
                    <Check className="size-3" aria-hidden />
                  ) : (
                    <Copy className="size-3" aria-hidden />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              ) : null}
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <label htmlFor={switchId} className="mr-auto inline-flex items-center gap-2 text-sm">
            <Switch
              id={switchId}
              checked={account.isActive}
              disabled={setActive.isPending}
              onCheckedChange={(checked) => {
                void setActive
                  .mutateAsync({ id: account.id, active: checked })
                  .then(() =>
                    notify.admin(checked ? "payment-account.shown" : "payment-account.hidden"),
                  )
                  .catch(() => notify.admin("payment-account.save-failed"));
              }}
            />
            Show to customers
          </label>
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            <Pencil />
            Edit
          </Button>
          <ConfirmAction
            triggerLabel="Remove"
            title={`Remove ${account.label}?`}
            description={
              account.isActive
                ? "Customers stop seeing this account at checkout. Payments already sent to it are not affected."
                : "It disappears from this list. Payments already sent to it are not affected."
            }
            confirmLabel="Remove account"
            variant="destructive"
            onConfirm={async () => {
              try {
                await archive.mutateAsync(account.id);
                notify.admin("payment-account.removed");
              } catch {
                notify.admin("payment-account.save-failed");
              }
            }}
          />
        </div>
      </div>
    </article>
  );
}

function PaymentQrImage({ imageKey, label }: { imageKey: string; label: string }) {
  return (
    <div
      role="img"
      aria-label={`QR code used to receive payment — ${label}`}
      className="grid aspect-square w-full max-w-[8rem] place-items-center rounded-lg border border-border bg-background p-3 text-center text-xs leading-4 text-muted-foreground"
    >
      <span className="grid justify-items-center gap-1.5">
        <QrCode className="size-8 text-foreground" aria-hidden />
        {imageKey.startsWith("pending:") ? `${label} preview` : label}
      </span>
    </div>
  );
}
