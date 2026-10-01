import { create as createQrCode } from "qrcode";

/**
 * Server-safe QR helpers shared by `ShareDialog` (client) and the `apps/web`
 * poster renderer (`next/og`, Node runtime). No `"use client"` here on purpose.
 *
 * Every QR in the share kit uses error correction `M` and a 4-module quiet zone.
 */

/** Quiet zone in modules. The QR spec minimum is 4. */
export const QR_QUIET_ZONE = 4;

export type QrMatrix = {
  /** Modules per side, without the quiet zone. */
  size: number;
  isDark: (row: number, col: number) => boolean;
};

/** `url` with `via=qr` set, keeping any existing `src` / `ref`. Non-URLs pass through. */
export function withQrVia(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("via", "qr");
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Encodes `text` at error correction `M`. Returns `null` when it cannot be encoded. */
export function createQrMatrix(text: string): QrMatrix | null {
  try {
    const { modules } = createQrCode(text, { errorCorrectionLevel: "M" });
    return { size: modules.size, isDark: (row, col) => modules.get(row, col) === 1 };
  } catch {
    return null;
  }
}

/** Edge length of the SVG viewBox: modules plus the quiet zone on both sides. */
export function qrViewBoxSize(matrix: QrMatrix): number {
  return matrix.size + QR_QUIET_ZONE * 2;
}

/** One SVG path (`d`) for every dark module, offset by the quiet zone; 1 unit = 1 module. */
export function qrSvgPath(matrix: QrMatrix): string {
  const parts: string[] = [];
  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (matrix.isDark(row, col)) {
        parts.push(`M${col + QR_QUIET_ZONE} ${row + QR_QUIET_ZONE}h1v1h-1z`);
      }
    }
  }
  return parts.join("");
}
