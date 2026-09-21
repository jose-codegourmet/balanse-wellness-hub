"use client";
import { CLASS_IMAGE_LIBRARY } from "@balanse/domain";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@balanse/ui";
import { ArrowLeft, Check, Images, X } from "lucide-react";
import { useState } from "react";
import type { ClassImagesInputProps } from "./ClassImagesInput.schema";
export function ClassImagesInput({
  value,
  onChange,
  onBlur,
  multiple = true,
  id,
}: ClassImagesInputProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3">
      <div className={multiple ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : "max-w-md"}>
        {value.map((src, index) => (
          <div key={src} className="relative overflow-hidden rounded-lg border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={multiple ? `Gallery image ${index + 1}` : "Class cover"}
              className="aspect-video w-full object-cover"
            />
            <div className="flex items-center justify-between gap-1 p-2">
              <span className="text-xs text-muted-foreground">
                {multiple ? `Image ${index + 1}` : "Cover image"}
              </span>
              <div className="flex gap-1">
                {multiple && index > 0 ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Move image ${index + 1} earlier`}
                    onClick={() => {
                      const next = [...value];
                      const previous = next[index - 1];
                      if (previous === undefined) return;
                      next[index - 1] = src;
                      next[index] = previous;
                      onChange(next);
                    }}
                  >
                    <ArrowLeft />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Remove image ${index + 1}`}
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                >
                  <X />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button id={id} type="button" variant="outline" onBlur={onBlur} onClick={() => setOpen(true)}>
        <Images />
        {value.length ? (multiple ? "Add images" : "Change cover") : "Choose from image library"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Class image library</DialogTitle>
            <DialogDescription>
              Generated Higgsfield artwork.{" "}
              {multiple
                ? "Choose up to 12 images; reorder them after selecting."
                : "Choose one cover image."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CLASS_IMAGE_LIBRARY.map((asset) => {
              const selected = value.includes(asset.src);
              return (
                <button
                  key={asset.id}
                  type="button"
                  aria-pressed={selected}
                  disabled={!selected && multiple && value.length >= 12}
                  className="overflow-hidden rounded-lg border text-left transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
                  onClick={() => {
                    onChange(
                      multiple
                        ? selected
                          ? value.filter((src) => src !== asset.src)
                          : [...value, asset.src]
                        : [asset.src],
                    );
                    if (!multiple) setOpen(false);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.src}
                    alt=""
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                  <span className="flex items-center justify-between gap-2 p-3 text-sm">
                    {asset.label}
                    {selected ? <Check className="size-4 shrink-0" aria-hidden /> : null}
                  </span>
                </button>
              );
            })}
          </div>
          <Button type="button" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
