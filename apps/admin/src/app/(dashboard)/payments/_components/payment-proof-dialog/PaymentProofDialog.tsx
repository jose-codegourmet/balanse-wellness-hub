"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@balanse/ui";
import { ZoomInIcon } from "lucide-react";

function FixtureProofImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  // Fixture `/assets` paths are not next/image remote sources. One shared <img> for thumbnail + zoom.
  return <img src={src} alt={alt} className={className} />;
}

export function PaymentProofDialog({
  url,
  customerName,
  defaultOpen = false,
}: {
  url: string;
  customerName: string;
  defaultOpen?: boolean;
}) {
  const alt = `GCash payment proof from ${customerName}`;
  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="group relative block w-full overflow-hidden rounded-xl border border-border/80 bg-muted/40 text-left focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        <FixtureProofImage
          src={url}
          alt={alt}
          className="h-40 w-full object-contain transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-foreground/70 py-1.5 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:opacity-100">
          <ZoomInIcon className="size-3.5" aria-hidden />
          View proof
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Payment proof</DialogTitle>
          <DialogDescription>
            Fit-to-viewport view of the uploaded screenshot for {customerName}.
          </DialogDescription>
        </DialogHeader>
        <FixtureProofImage
          src={url}
          alt={`Enlarged GCash payment proof from ${customerName}`}
          className="max-h-[80vh] w-full object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
