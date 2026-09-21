"use client";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@balanse/ui";
import { ArrowLeft, ArrowRight, Expand, Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { ClassGalleryProps } from "./ClassGallery.schema";
import "./class-gallery.css";

export function ClassGallery({ images, name }: ClassGalleryProps) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const touchX = useRef<number | null>(null);
  if (!images.length) return null;
  const active = index % images.length;
  const move = (direction: number) => {
    setIndex((value) => (value + direction + images.length) % images.length);
    setZoom(1);
  };
  const controls = (
    <>
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label="Previous image"
        disabled={images.length < 2}
      >
        <ArrowLeft />
      </button>
      <span aria-live="polite">
        {active + 1} / {images.length}
      </span>
      <button
        type="button"
        onClick={() => move(1)}
        aria-label="Next image"
        disabled={images.length < 2}
      >
        <ArrowRight />
      </button>
    </>
  );
  return (
    <section className="class-gallery" aria-label={`${name} image gallery`}>
      <button
        className="class-gallery-image"
        type="button"
        onClick={() => {
          setZoom(1);
          setOpen(true);
        }}
        aria-label={`Open ${name} image ${active + 1} fullscreen`}
      >
        <Image
          src={images[active]}
          alt={`${name} class inspiration, image ${active + 1}`}
          fill
          sizes="100vw"
          unoptimized={images[active].startsWith("https:")}
        />
        <span>
          <Expand size={18} /> Explore the gallery
        </span>
      </button>
      <div className="class-gallery-controls">{controls}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="class-lightbox"
          showCloseButton={false}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              move(-1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              move(1);
            }
          }}
        >
          <header>
            <div>
              <DialogTitle>{name}</DialogTitle>
              <DialogDescription>
                Use arrows to browse. Zoom in, then scroll to explore the image.
              </DialogDescription>
            </div>
            <DialogClose className="class-lightbox-close" aria-label="Close gallery">
              <X />
            </DialogClose>
          </header>
          <div
            className="class-lightbox-viewport"
            onTouchStart={(event) => {
              touchX.current = event.touches[0].clientX;
            }}
            onTouchEnd={(event) => {
              if (zoom === 1 && touchX.current !== null) {
                const distance = touchX.current - event.changedTouches[0].clientX;
                if (Math.abs(distance) > 60) move(distance > 0 ? 1 : -1);
              }
              touchX.current = null;
            }}
          >
            <div
              className="class-lightbox-canvas"
              style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
            >
              <Image
                src={images[active]}
                alt={`${name} class inspiration, image ${active + 1}`}
                fill
                sizes="100vw"
                unoptimized
              />
            </div>
          </div>
          <footer>
            <div className="class-gallery-controls">{controls}</div>
            <div className="class-gallery-controls">
              <button
                type="button"
                aria-label="Zoom out"
                disabled={zoom === 1}
                onClick={() => setZoom((value) => value - 1)}
              >
                <Minus />
              </button>
              <span aria-live="polite">{zoom * 100}%</span>
              <button
                type="button"
                aria-label="Zoom in"
                disabled={zoom === 3}
                onClick={() => setZoom((value) => value + 1)}
              >
                <Plus />
              </button>
            </div>
          </footer>
        </DialogContent>
      </Dialog>
    </section>
  );
}
