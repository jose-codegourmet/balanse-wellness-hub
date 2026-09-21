"use client";

import { FIELD_CONSTRAINTS } from "@balanse/domain";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FeedbackState,
  Input,
  Label,
} from "@balanse/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
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
import type { PaymentQrPageProps } from "./PaymentQrPage.schema";

export function PaymentQrPage({ empty, items: itemsProp }: PaymentQrPageProps) {
  const { principal } = useMockPrincipal();
  const settingsQuery = useSuspenseQuery(adminSettingsQuery(principal.role));
  const listQuery = useSuspenseQuery(adminPaymentQrsQuery(principal.role));
  const items = empty ? [] : (itemsProp ?? listQuery.data.items);
  const settings = settingsQuery.data;
  const active = items.find((row) => row.isActive) ?? null;

  const upsert = useUpsertPaymentQr();
  const activate = useActivatePaymentQr();
  const archive = useArchivePaymentQr();

  const [label, setLabel] = useState("GCash — main");
  const [imageKey, setImageKey] = useState<string | null>(null);

  async function addQr() {
    if (!imageKey || !label.trim()) return;
    try {
      await upsert.mutateAsync({ label: label.trim(), imageKey });
      notify.admin("settings.saved");
      setImageKey(null);
    } catch {
      notify.admin("settings.save-failed");
    }
  }

  return (
    <AdminPageShell title="Payment QR">
      <p className="max-w-2xl text-sm text-muted-foreground">
        QRs used to receive payment. Customers see only the active image plus the GCash name and
        number from{" "}
        <Link className="underline underline-offset-4" href="/settings?tab=payment">
          Settings → Payment info
        </Link>
        .
      </p>

      {active ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Active QR</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-[minmax(0,20rem)_1fr] md:items-start">
            <div className="mx-auto w-full max-w-xs">
              <PaymentQrImage imageKey={active.imageKey} label={active.label} />
            </div>
            <div className="grid gap-3">
              <p className="text-lg font-semibold">{active.label}</p>
              <dl className="grid gap-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    GCash name
                  </dt>
                  <dd>{settings.gcashName}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    GCash number
                  </dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    <span>{settings.gcashNumber}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-11"
                      onClick={() => void navigator.clipboard?.writeText(settings.gcashNumber)}
                    >
                      Copy number
                    </Button>
                  </dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      ) : (
        <FeedbackState
          id="admin.no-payment-qrs"
          className="mt-6"
          actionLabel="Upload a QR"
          onAction={() => document.getElementById("payment-qr-label")?.focus()}
        />
      )}

      <section className="mt-8 grid gap-4">
        <h2 className="font-display text-2xl">Collection</h2>
        {items.length ? (
          <ul className="grid gap-3">
            {items.map((row) => (
              <li key={row.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center gap-4 py-4">
                    <div className="w-16">
                      <PaymentQrImage imageKey={row.imageKey} label={row.label} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{row.label}</p>
                      <Badge
                        variant={row.isActive ? "success" : "neutral"}
                        appearance="solid"
                        size="sm"
                      >
                        {row.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {row.isActive ? null : (
                        <Button
                          type="button"
                          variant="outline"
                          className="min-h-11"
                          onClick={() => {
                            void activate.mutateAsync(row.id).then(
                              () => notify.admin("settings.saved"),
                              () => notify.admin("settings.save-failed"),
                            );
                          }}
                        >
                          Set active
                        </Button>
                      )}
                      {row.isActive ? null : (
                        <ConfirmAction
                          triggerLabel="Remove"
                          title="Remove this QR?"
                          description="The image stays in mock storage. Customers will not see this QR."
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
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Upload QR</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="payment-qr-label">Label</Label>
              <Input
                id="payment-qr-label"
                value={label}
                maxLength={FIELD_CONSTRAINTS.settings.paymentQr.label.max}
                onChange={(event) => setLabel(event.target.value)}
              />
            </div>
            <ImageUpload
              label={imageKey ? "Replace QR" : "Upload QR"}
              fallbackLabel="No QR selected yet."
              photoKey={imageKey}
              previewName={label}
              onPhotoKeyChange={setImageKey}
            />
            <Button
              type="button"
              className="min-h-11 w-fit"
              disabled={!imageKey || !label.trim() || upsert.isPending}
              onClick={() => void addQr()}
            >
              Add to collection
            </Button>
          </CardContent>
        </Card>
      </section>
    </AdminPageShell>
  );
}

function PaymentQrImage({ imageKey, label }: { imageKey: string; label: string }) {
  return (
    <div
      role="img"
      aria-label={`QR code used to receive payment — ${label}`}
      className="flex aspect-square w-full items-center justify-center rounded-xl border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground"
    >
      {imageKey.startsWith("pending:") ? `${label} preview (mock upload)` : label}
    </div>
  );
}
