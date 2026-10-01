"use client";

import { Button, buttonVariants } from "@balanse/ui";
import { ImageIcon, ImagePlusIcon, XIcon } from "lucide-react";
import { type DragEvent, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { EventImageTileProps } from "./EventImageTile.meta";

const MAX_BYTES = 5 * 1024 * 1024;

export function EventImageTile({
  label,
  value,
  src,
  aspect,
  onPick,
  onRemove,
  invalid = false,
  className,
}: EventImageTileProps) {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const filled = value.length > 0;

  function accept(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is larger than 5 MB.");
      return;
    }
    onPick(file);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files?.[0]);
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      <fieldset
        aria-label={label}
        className={cn(
          "group relative m-0 min-w-0 overflow-hidden rounded-xl border p-0 bg-muted/40 transition-colors",
          aspect === "poster" ? "aspect-[4/5]" : "aspect-square",
          filled ? "border-border" : "border-dashed border-border",
          dragging && "border-primary bg-primary/5",
          (invalid || error) && "border-destructive",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            accept(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {filled ? (
          <>
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center p-3 text-center text-xs text-muted-foreground">
                <span className="grid justify-items-center gap-1">
                  <ImageIcon aria-hidden className="size-5" />
                  <span className="line-clamp-2 break-all">{value}</span>
                </span>
              </div>
            )}
            <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1.5 opacity-100 transition-opacity pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
              <label
                htmlFor={inputId}
                className={cn(buttonVariants({ variant: "secondary", size: "xs" }))}
              >
                Replace
              </label>
              {onRemove ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-xs"
                  aria-label={`Remove ${label.replace(/^Add /, "")}`}
                  onClick={onRemove}
                >
                  <XIcon aria-hidden />
                </Button>
              ) : null}
            </div>
          </>
        ) : (
          <button
            type="button"
            className="grid size-full place-items-center text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => inputRef.current?.click()}
          >
            <span className="grid justify-items-center gap-1.5 px-2 text-center text-xs">
              <ImagePlusIcon aria-hidden className="size-5" />
              {label}
            </span>
          </button>
        )}
      </fieldset>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
