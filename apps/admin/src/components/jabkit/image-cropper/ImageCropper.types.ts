import type { HTMLAttributes } from "react";

export type ImageCropperAspect = "free" | "1:1" | "4:3" | "16:9";

export const imageCropperAcceptedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type ImageCropperAcceptedType =
  (typeof imageCropperAcceptedTypes)[number];

export const imageCropperDefaultMaxFileBytes = 8 * 1024 * 1024;

export type ImageCropperErrorCode = "type" | "size" | "decode";

export interface ImageCropperError {
  code: ImageCropperErrorCode;
  message: string;
}

export interface ImageCropperArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageCropperProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  aspect?: ImageCropperAspect;
  defaultZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  downloadFileName?: string;
  /**
   * Maximum upload size in bytes. Defaults to 8 MB.
   */
  maxFileBytes?: number;
  /**
   * Shows a control that restores `src` and revokes any object URL.
   * Off by default so existing cropper layouts stay unchanged.
   */
  showReset?: boolean;
  resetLabel?: string;
  onCropChange?: (area: ImageCropperArea) => void;
  onFileChange?: (file: File | null) => void;
  onUploadError?: (error: ImageCropperError | null) => void;
}
