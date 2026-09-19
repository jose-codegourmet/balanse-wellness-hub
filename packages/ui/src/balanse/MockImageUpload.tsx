"use client";

import { useId, useState } from "react";
import { cn } from "../lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;

export type MockImageUploadProps = {
  label: string;
  fallbackLabel: string;
  onMockSubmit?: (file: File | null) => Promise<void> | void;
  forceFailure?: boolean;
  className?: string;
};

export function MockImageUpload({
  label,
  fallbackLabel,
  onMockSubmit,
  forceFailure = false,
  className,
}: MockImageUploadProps) {
  const inputId = useId();
  const statusId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "preview" | "submitting" | "success" | "failed">(
    "idle",
  );

  function revoke() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }

  function resetToFallback() {
    revoke();
    setPreviewUrl(null);
    setFileName(null);
    setError(null);
    setStatus("idle");
  }

  function onFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is larger than 5 MB.");
      return;
    }
    revoke();
    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setStatus("preview");
  }

  async function submit() {
    setStatus("submitting");
    setError(null);
    if (forceFailure) {
      setStatus("failed");
      setError("Proof upload failed. Check the file and try again.");
      return;
    }
    await onMockSubmit?.(null);
    setStatus("success");
  }

  return (
    <div className={cn("space-y-3", className)}>
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="block w-full text-sm"
        onChange={(event) => onFile(event.target.files?.[0])}
      />
      <div aria-live="polite" id={statusId} className="text-sm">
        {status === "failed" ? (
          <p className="text-destructive">{error}</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : status === "success" ? (
          <p>Upload saved in this browser only. No network request was made.</p>
        ) : status === "preview" ? (
          <p>Preview ready. Submit to keep this image.</p>
        ) : (
          <p className="text-muted-foreground">{fallbackLabel}</p>
        )}
      </div>
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Selected upload preview"
          className="max-h-64 rounded-md border border-border"
        />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border bg-muted text-sm text-muted-foreground">
          {fallbackLabel}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
          disabled={status !== "preview" && status !== "failed"}
          onClick={() => void submit()}
        >
          Submit
        </button>
        <button
          type="button"
          className="rounded-md border border-border px-3 py-2 text-sm"
          onClick={() => document.getElementById(inputId)?.click()}
        >
          Replace
        </button>
        <button
          type="button"
          className="rounded-md border border-border px-3 py-2 text-sm"
          onClick={resetToFallback}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
