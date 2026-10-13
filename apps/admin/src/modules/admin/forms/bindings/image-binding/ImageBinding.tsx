"use client";

import { ApiError, type ApiFetcher } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { useFieldContext } from "@balanse/ui";
import { ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUploadPaymentAccountImage } from "@/lib/query/mutations";
import type { FormFieldRenderProps } from "../../admin-form/AdminForm.schema";

export type ImageBindingProps = FormFieldRenderProps & {
  label: string;
  fallbackLabel: string;
  previewName?: string;
  fetcher?: ApiFetcher;
};

/**
 * Value binding for a confirmed upload `objectKey` (currently: payment
 * account QR images). Performs the real BE-052 mint → `PUT` → confirm
 * (WIRE-1705, #371) — replace always writes a new key; it does not keep the
 * previous one. Only one consumer (`PaymentAccountFormDialog`) exists today,
 * so this stays a plain image preview rather than the coach-specific
 * `CoachPhoto` component.
 */
export function ImageBinding({
  label,
  fallbackLabel,
  previewName,
  fetcher = apiFetchBrowser,
  value,
  onChange,
  name,
}: ImageBindingProps) {
  const field = useFieldContext();
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const upload = useUploadPaymentAccountImage(fetcher);
  const objectKey = typeof value === "string" && value.length > 0 ? value : null;

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  return (
    <div
      id={field?.id}
      aria-invalid={field?.invalid || undefined}
      aria-describedby={field?.describedBy}
      className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4"
    >
      <div className="flex items-center gap-4">
        <div className="grid aspect-square size-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-background">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={`${previewName ?? fallbackLabel} preview`}
              className="size-full object-cover"
            />
          ) : objectKey ? (
            <span className="grid place-items-center gap-1 p-2 text-center text-[0.65rem] text-muted-foreground">
              <ImageIcon className="size-4" aria-hidden />
              Saved
            </span>
          ) : (
            <span className="grid place-items-center gap-1 p-2 text-center text-[0.65rem] text-muted-foreground">
              <ImageIcon className="size-4" aria-hidden />
              {fallbackLabel}
            </span>
          )}
        </div>
        <div className="grid gap-2">
          <input
            ref={input}
            id={field?.id}
            className="sr-only"
            type="file"
            tabIndex={-1}
            accept="image/*"
            aria-label={label}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={field?.describedBy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setError(null);
              const nextPreview = URL.createObjectURL(file);
              setPreview(nextPreview);
              upload.mutate(file, {
                onSuccess: (key) => onChange(key),
                onError: (uploadError) => {
                  setError(
                    uploadError instanceof ApiError
                      ? uploadError.message
                      : "The upload failed. Try again.",
                  );
                  setPreview(null);
                  URL.revokeObjectURL(nextPreview);
                },
              });
            }}
          />
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium disabled:opacity-60"
            disabled={upload.isPending}
            onClick={() => input.current?.click()}
          >
            {upload.isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
            {objectKey ? "Replace" : label}
          </button>
          {objectKey ? (
            <button
              type="button"
              className="text-left text-xs text-muted-foreground underline underline-offset-4 disabled:opacity-60"
              disabled={upload.isPending}
              onClick={() => {
                setPreview(null);
                setError(null);
                onChange(null);
              }}
            >
              Remove
            </button>
          ) : null}
          {error ? <p className="text-xs text-destructive!">{error}</p> : null}
        </div>
      </div>
      <input type="hidden" name={name} value={objectKey ?? ""} readOnly />
    </div>
  );
}
