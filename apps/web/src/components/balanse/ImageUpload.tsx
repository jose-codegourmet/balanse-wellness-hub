"use client";

import type { MockImageUploadProps } from "@balanse/ui";
import { useState } from "react";

/** App wrapper. Do not edit vendored Jabkit files; compose here. */
export function ImageUpload(props: MockImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className={props.className}>
      <label className="grid gap-2 text-sm font-medium">
        {props.label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={(event) => {
            const next = event.target.files?.[0] ?? null;
            if (next && next.size > 5 * 1024 * 1024) {
              setFile(null);
              setError("Choose an image no larger than 5 MiB.");
              return;
            }
            setFile(next);
            setError(null);
          }}
        />
      </label>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        disabled={!file || Boolean(error)}
        onClick={() => void props.onMockSubmit?.(file)}
      >
        {props.submitLabel ?? "Submit"}
      </button>
    </div>
  );
}
