"use client";

import { FIELD_CONSTRAINTS } from "@balanse/domain";
import { Badge, Button, Card, CardContent, FeedbackState, Input, Label } from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, Copy, ImagePlus, QrCode, Settings2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ConfirmAction } from "@/components/balanse/confirm-action/ConfirmAction";
import { ImageUpload } from "@/components/balanse/image-upload/ImageUpload";
import { AdminPageShell } from "@/components/balanse/page/admin-page-shell/AdminPageShell";
import {
  useActivatePaymentQr,
  useArchivePaymentQr,
  useUpsertPaymentQr,
} from "@/lib/query/mutations";
import { adminPaymentQrsQuery, adminSettingsQuery } from "@/lib/query/queries";
import { notify } from "@/modules/notifications/notify";
import { useMockPrincipal } from "@/modules/session/MockSessionProvider";

export type PaymentQrPageProps = {
  empty?: boolean;
  items?: import("@balanse/domain").PaymentQrCode[];
};

export function PaymentQrPage({ empty, items: itemsProp }: PaymentQrPageProps) {
  const { principal } = useMockPrincipal();
  const settingsQuery = useSuspenseQuery(adminSettingsQuery(principal.role));
  const listQuery = useSuspenseQuery(adminPaymentQrsQuery(principal.role));
  const items = empty ? [] : (itemsProp ?? listQuery.data.items);
  const settings = settingsQuery.data;
  const active = items.find((row) => row.isActive) ?? null;
  const alternatives = items.filter((row) => !row.isActive);

  const upsert = useUpsertPaymentQr();
  const activate = useActivatePaymentQr();
  const archive = useArchivePaymentQr();
  const [label, setLabel] = useState("GCash — main");
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [adding, setAdding] = useState(!active);

  async function addQr() {
    if (!imageKey || !label.trim()) return;
    try {
      await upsert.mutateAsync({ label: label.trim(), imageKey });
      notify.admin("settings.saved");
      setImageKey(null);
      setAdding(false);
    } catch {
      notify.admin("settings.save-failed");
    }
  }

  return (
    <AdminPageShell
      title="Payment QR"
      description="Choose the one QR customers see at checkout, then keep replacements ready here."
      actions={
        active ? (
          <Button type="button" onClick={() => setAdding((value) => !value)}>
            <ImagePlus />
            {adding ? "Close upload" : "Add a QR"}
          </Button>
        ) : undefined
      }
    >
      <div className="mx-auto grid max-w-5xl gap-6">
        {active ? (
          <section
            aria-labelledby="active-qr-title"
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="grid gap-0 md:grid-cols-[minmax(17rem,0.85fr)_minmax(0,1.15fr)]">
              <div className="grid place-items-center bg-muted/55 p-8 md:p-10">
                <div className="w-full max-w-[15rem] rounded-[1.5rem] bg-background p-4 shadow-sm ring-1 ring-border">
                  <PaymentQrImage imageKey={active.imageKey} label={active.label} />
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Customer payment QR
                  </p>
                </div>
              </div>
              <div className="grid content-center gap-6 p-6 md:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success" appearance="solid" size="sm" dot>
                    Live at checkout
                  </Badge>
                  <span className="text-sm text-muted-foreground">{active.label}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">The customer sees</p>
                  <h2 id="active-qr-title" className="mt-1 font-display text-3xl text-balance">
                    {settings.gcashName}
                  </h2>
                  <p className="mt-2 text-lg tabular-nums">{settings.gcashNumber}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void navigator.clipboard?.writeText(settings.gcashNumber)}
                  >
                    <Copy />
                    Copy number
                  </Button>
                  <Button
                    nativeButton={false}
                    variant="ghost"
                    render={<Link href="/settings?tab=payment" />}
                  >
                    <Settings2 />
                    Edit payment details
                  </Button>
                </div>
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  Changing the active QR updates the image customers see. The GCash name and number
                  are managed separately in Payment info.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <FeedbackState
            id="admin.no-payment-qrs"
            className="rounded-2xl border border-dashed border-border bg-muted/30 py-10"
            actionLabel="Add the first QR"
            onAction={() => {
              setAdding(true);
              document.getElementById("payment-qr-label")?.focus();
            }}
          />
        )}

        {alternatives.length > 0 ? (
          <section aria-labelledby="saved-qr-title" className="grid gap-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Standby codes</p>
                <h2 id="saved-qr-title" className="font-display text-2xl">
                  Saved alternatives
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">Only one QR is live at a time.</p>
            </div>
            <ul className="grid gap-2">
              {alternatives.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-3"
                >
                  <div className="w-14 shrink-0">
                    <PaymentQrImage imageKey={row.imageKey} label={row.label} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{row.label}</p>
                    <p className="text-sm text-muted-foreground">Not shown to customers</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        void activate.mutateAsync(row.id).then(
                          () => notify.admin("settings.saved"),
                          () => notify.admin("settings.save-failed"),
                        )
                      }
                    >
                      <Check />
                      Make live
                    </Button>
                    <ConfirmAction
                      triggerLabel="Remove"
                      title="Remove this saved QR?"
                      description="This removes the QR from the payment collection. The active customer QR cannot be removed."
                      confirmLabel="Remove QR"
                      variant="outline"
                      onConfirm={async () => {
                        try {
                          await archive.mutateAsync(row.id);
                          notify.admin("settings.saved");
                        } catch {
                          notify.admin("settings.save-failed");
                        }
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : active ? (
          <p className="text-sm text-muted-foreground">
            No standby QR codes. Add one before you need to replace the live code.
          </p>
        ) : null}

        {adding ? (
          <Card className="overflow-hidden border-primary/25">
            <CardContent className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.85fr)] md:p-7">
              <div className="grid content-start gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Add to collection</p>
                  <h2 className="font-display text-2xl">Upload a payment QR</h2>
                  <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                    It stays on standby until you make it live. Upload a clean, square image
                    customers can scan.
                  </p>
                </div>
                <div className="grid max-w-md gap-1.5">
                  <Label htmlFor="payment-qr-label">Internal label</Label>
                  <Input
                    id="payment-qr-label"
                    value={label}
                    maxLength={FIELD_CONSTRAINTS.settings.paymentQr.label.max}
                    onChange={(event) => setLabel(event.target.value)}
                    placeholder="e.g. GCash — replacement"
                  />
                </div>
                <Button
                  type="button"
                  className="w-fit"
                  disabled={!imageKey || !label.trim() || upsert.isPending}
                  loading={upsert.isPending}
                  onClick={() => void addQr()}
                >
                  <QrCode />
                  Save QR
                </Button>
              </div>
              <div className="rounded-xl bg-muted/45 p-4">
                <ImageUpload
                  label={imageKey ? "Replace selected QR" : "Choose QR image"}
                  fallbackLabel="Choose an image to preview it here."
                  photoKey={imageKey}
                  previewName={label}
                  onPhotoKeyChange={setImageKey}
                />
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AdminPageShell>
  );
}

function PaymentQrImage({ imageKey, label }: { imageKey: string; label: string }) {
  return (
    <div
      role="img"
      aria-label={`QR code used to receive payment — ${label}`}
      className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-background p-3 text-center text-xs leading-4 text-muted-foreground"
    >
      {imageKey.startsWith("pending:") ? `${label} preview` : label}
    </div>
  );
}
