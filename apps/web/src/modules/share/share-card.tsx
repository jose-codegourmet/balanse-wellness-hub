import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildPublicEventPath,
  buildPublicSessionPath,
  formatSessionDate,
  formatSessionTimeRange,
  type PublicEventPage,
  type PublicSessionPage,
  type ShareParams,
  withShareParams,
} from "@balanse/domain";
import { createQrMatrix, qrSvgPath, qrViewBoxSize } from "@balanse/ui";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";

/**
 * Branded share images for public session and event pages (#347).
 *
 * - **Poster** 1080×1350 (Instagram portrait) with a scannable QR, served by
 *   `/share/poster/{sessions,events}/[id]` and opened from `ShareDialog`.
 * - **OG** 1200×630 link preview without a QR, for `opengraph-image.tsx`.
 *
 * Runtime: **Node.js only** (reads `public/` from disk and uses `qrcode`).
 * Do not set `runtime = "edge"` on a caller.
 *
 * Images: `next/og` (Satori) only decodes PNG, JPEG and GIF. Event posters and
 * class heroes in any other format (the bundled class heroes are WebP) fall
 * back to the brand pattern instead of failing the render.
 *
 * Fonts: Fraunces (display) and Manrope (body) are fetched once per server
 * process from Google Fonts as TTF. When that fails (offline), the card still
 * renders with the `next/og` default font.
 */

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Either payload from `getPublicSessionPage` / `getPublicEventPage`. */
export type ShareCardPage = PublicSessionPage | PublicEventPage;

export type ShareCardOptions = {
  /** Public web origin. Defaults to `NEXT_PUBLIC_SITE_URL` (fallback `http://localhost:9000`). */
  origin?: string;
};

export type PosterImageOptions = ShareCardOptions & {
  /** Attribution carried by the embedded QR (`ref`, `src`). `via=qr` is always set. */
  share?: Pick<ShareParams, "ref" | "src">;
};

export const POSTER_IMAGE_SIZE = { width: 1080, height: 1350 } as const;
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const SHARE_IMAGE_CONTENT_TYPE = "image/png";

/** Public web origin without a trailing slash. */
export function getPublicSiteOrigin(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (value || "http://localhost:9000").replace(/\/+$/, "");
}

/** Canonical absolute URL of the public page, with optional share params. */
export function shareCardCanonicalUrl(
  page: ShareCardPage,
  share: ShareParams = {},
  origin = getPublicSiteOrigin(),
): string {
  const pathname = isEventPage(page)
    ? buildPublicEventPath({ title: page.title, startsAt: page.session.startsAt, id: page.id })
    : buildPublicSessionPath(page);
  return withShareParams(`${origin}${pathname}`, share);
}

/**
 * 1080×1350 poster PNG with the QR. The QR encodes the canonical absolute URL
 * plus `share.ref` / `share.src` and `via=qr`. Cancelled pages get a
 * "Cancelled" ribbon. Callers decide 404s (draft, past) before calling.
 *
 * @example
 * const page = await getMockAdapter().getPublicSessionPage(id);
 * return renderPosterImage(page, { share: parseShareParams({ ref, src }) });
 */
export async function renderPosterImage(
  page: ShareCardPage,
  options: PosterImageOptions = {},
): Promise<ImageResponse> {
  const origin = options.origin ?? getPublicSiteOrigin();
  const content = describe(page);
  const qrUrl = shareCardCanonicalUrl(
    page,
    { ref: options.share?.ref, src: options.share?.src, via: "qr" },
    origin,
  );
  const [image, fonts] = await Promise.all([loadImage(content.imageSrc, origin), loadFonts()]);
  return new ImageResponse(<PosterCard content={content} image={image} qrUrl={qrUrl} />, {
    ...POSTER_IMAGE_SIZE,
    fonts,
  });
}

/**
 * 1200×630 link-preview PNG (no QR). For `opengraph-image.tsx`:
 *
 * @example
 * export const size = OG_IMAGE_SIZE;
 * export const contentType = SHARE_IMAGE_CONTENT_TYPE;
 * export default async function Image({ params }) {
 *   const page = await getMockAdapter().getPublicSessionPage((await params).sessionId);
 *   if (!page) notFound();
 *   return renderOgImage(page);
 * }
 */
export async function renderOgImage(
  page: ShareCardPage,
  options: ShareCardOptions = {},
): Promise<ImageResponse> {
  const origin = options.origin ?? getPublicSiteOrigin();
  const content = describe(page);
  const [image, fonts] = await Promise.all([loadImage(content.imageSrc, origin), loadFonts()]);
  return new ImageResponse(<OgCard content={content} image={image} />, {
    ...OG_IMAGE_SIZE,
    fonts,
  });
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

/** Mirrors `packages/config/src/tokens.css`. Satori cannot read CSS variables. */
const BRAND = {
  cream: "#f7f1e8",
  warmWhite: "#fffaf3",
  beige: "#e6d5b8",
  tan: "#c9b48a",
  mutedBrown: "#6b5344",
  navy: "#1c2331",
  gold: "#c4a35a",
  goldDeep: "#9a7b32",
  destructive: "#8b2e2e",
} as const;

/** QR modules are always pure black on white for scan reliability. */
const QR_DARK = "#000000";
const QR_LIGHT = "#ffffff";

const DISPLAY_FONT = "Fraunces";
const BODY_FONT = "Manrope";

type CardContent = {
  kind: "Session" | "Event";
  title: string;
  date: string;
  time: string;
  venue: string | null;
  coaches: string | null;
  spotsLeft: string | null;
  cancelled: boolean;
  imageSrc: string | null;
};

function isEventPage(page: ShareCardPage): page is PublicEventPage {
  return "session" in page && typeof page.session === "object" && page.session !== null;
}

function coachLine(names: string[]): string | null {
  if (names.length === 0) return null;
  const shown = names.slice(0, 3);
  const extra = names.length - shown.length;
  if (extra > 0) return `With ${shown.join(", ")} +${extra}`;
  if (shown.length === 1) return `With ${shown[0]}`;
  return `With ${shown.slice(0, -1).join(", ")} & ${shown[shown.length - 1]}`;
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

function describe(page: ShareCardPage): CardContent {
  const event = isEventPage(page) ? page : null;
  const session = event ? event.session : (page as PublicSessionPage);
  const cancelled =
    event?.status === "CANCELLED" ||
    session.status === "CANCELLED" ||
    session.availability === "cancelled";
  const title = event?.title || session.name?.trim() || session.className;
  const remaining = session.remainingSlots;
  return {
    kind: event ? "Event" : "Session",
    title: truncate(title, 80),
    date: formatSessionDate(session.startsAt),
    time: formatSessionTimeRange(session.startsAt, session.endsAt),
    venue: session.venue?.name ? truncate(session.venue.name, 60) : null,
    coaches: coachLine(session.coaches.map((coach) => coach.name)),
    spotsLeft:
      !cancelled && session.availability === "nearly_full" && remaining > 0
        ? `${remaining} ${remaining === 1 ? "spot" : "spots"} left`
        : null,
    cancelled,
    imageSrc: event?.posterImage || session.heroImage || null,
  };
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT_MS = 4000;

function sniffImageType(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/gif" | null {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
  return null;
}

function toDataUrl(bytes: Uint8Array): string | null {
  const type = sniffImageType(bytes);
  return type ? `data:${type};base64,${Buffer.from(bytes).toString("base64")}` : null;
}

async function readPublicFile(pathname: string): Promise<Uint8Array | null> {
  const publicDir = path.join(process.cwd(), "public");
  const filePath = path.normalize(path.join(publicDir, decodeURIComponent(pathname)));
  if (!filePath.startsWith(publicDir + path.sep)) return null;
  try {
    return new Uint8Array(await readFile(filePath));
  } catch {
    return null;
  }
}

async function fetchBytes(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!response.ok) return null;
    return new Uint8Array(await response.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Resolves a stored image (`/assets/...`, `https://...`, or a `data:` URL) to
 * a PNG/JPEG/GIF data URL Satori can draw, or `null` for the brand pattern.
 */
async function loadImage(src: string | null, origin: string): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("data:")) {
    const match = /^data:([^;,]+);base64,([\s\S]*)$/.exec(src);
    if (!match) return null;
    return toDataUrl(new Uint8Array(Buffer.from(match[2], "base64")));
  }
  if (src.startsWith("/") && !src.startsWith("//")) {
    const bytes = (await readPublicFile(src)) ?? (await fetchBytes(`${origin}${src}`));
    return bytes ? toDataUrl(bytes) : null;
  }
  if (/^https?:\/\//i.test(src)) {
    const bytes = await fetchBytes(src);
    return bytes ? toDataUrl(bytes) : null;
  }
  return null;
}

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700;
  style: "normal";
};

const GOOGLE_FONTS_CSS =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@144,600&family=Manrope:wght@500;700";

let fontsPromise: Promise<OgFont[]> | null = null;

async function fetchFonts(): Promise<OgFont[]> {
  // No browser User-Agent, so Google serves TrueType, which Satori can parse.
  const css = await fetch(GOOGLE_FONTS_CSS, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).then(
    (response) => (response.ok ? response.text() : ""),
  );
  const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((match) => match[1]);
  const fonts = await Promise.all(
    faces.map(async (face): Promise<OgFont | null> => {
      const family = /font-family:\s*'([^']+)'/.exec(face)?.[1];
      const weight = Number(/font-weight:\s*(\d+)/.exec(face)?.[1]);
      const url = /src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/.exec(face)?.[1];
      if (!family || !url || ![400, 500, 600, 700].includes(weight)) return null;
      const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!response.ok) return null;
      return {
        name: family,
        data: await response.arrayBuffer(),
        weight: weight as OgFont["weight"],
        style: "normal",
      };
    }),
  );
  return fonts.filter((font): font is OgFont => font !== null);
}

/** Brand fonts, cached per process. Resolves `[]` (default font) when offline. */
function loadFonts(): Promise<OgFont[]> {
  if (!fontsPromise) {
    fontsPromise = fetchFonts()
      .catch(() => [])
      .then((fonts) => {
        if (fonts.length === 0) fontsPromise = null; // retry on the next render
        return fonts;
      });
  }
  return fontsPromise;
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function Wordmark({ tone, scale = 1 }: { tone: "light" | "dark"; scale?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <div
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: 40 * scale,
          letterSpacing: 6 * scale,
          color: tone === "dark" ? BRAND.navy : BRAND.warmWhite,
        }}
      >
        Balansé
      </div>
      <div
        style={{
          marginTop: 8 * scale,
          fontFamily: BODY_FONT,
          fontWeight: 700,
          fontSize: 14 * scale,
          letterSpacing: 5 * scale,
          color: tone === "dark" ? BRAND.goldDeep : BRAND.gold,
        }}
      >
        WELLNESS HUB
      </div>
    </div>
  );
}

/** Navy field with gold rings, used when there is no drawable image. SVG so the rings clip. */
function BrandPattern({ width, height }: { width: number; height: number }) {
  const rings = [
    { cx: 0.9, cy: 0.1, r: 0.45, opacity: 0.35 },
    { cx: 0.9, cy: 0.2, r: 0.3, opacity: 0.5 },
    { cx: 0.05, cy: 1.05, r: 0.38, opacity: 0.25 },
    { cx: 0.23, cy: 0.3, r: 0.15, opacity: 0.4 },
  ];
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative; rasterised by Satori.
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <rect width={width} height={height} fill={BRAND.navy} />
      {rings.map((ring) => (
        <circle
          key={`${ring.cx}-${ring.cy}`}
          cx={ring.cx * width}
          cy={ring.cy * height}
          r={ring.r * Math.max(width, height)}
          fill="none"
          stroke={BRAND.gold}
          strokeWidth={2}
          strokeOpacity={ring.opacity}
        />
      ))}
    </svg>
  );
}

function CoverImage({
  image,
  width,
  height,
}: {
  image: string | null;
  width: number;
  height: number;
}) {
  if (!image) return <BrandPattern width={width} height={height} />;
  return (
    <img
      alt=""
      src={image}
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, width, height, objectFit: "cover" }}
    />
  );
}

function CancelledRibbon({ width }: { width: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 58,
        right: -width * 0.28,
        width: width * 0.9,
        display: "flex",
        justifyContent: "center",
        padding: "14px 0",
        backgroundColor: BRAND.destructive,
        color: BRAND.warmWhite,
        fontFamily: BODY_FONT,
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: 8,
        transform: "rotate(35deg)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      CANCELLED
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: BODY_FONT,
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: 6,
        color: BRAND.goldDeep,
      }}
    >
      {children}
    </div>
  );
}

function DetailLine({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: BODY_FONT,
        fontWeight: strong ? 700 : 500,
        fontSize: 30,
        lineHeight: 1.3,
        color: strong ? BRAND.navy : BRAND.mutedBrown,
      }}
    >
      {children}
    </div>
  );
}

function SpotsPill({ label, size = 24 }: { label: string; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        padding: `${size * 0.35}px ${size * 0.8}px`,
        borderRadius: 6,
        backgroundColor: BRAND.gold,
        color: BRAND.navy,
        fontFamily: BODY_FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 2,
      }}
    >
      {label.toUpperCase()}
    </div>
  );
}

function QrBlock({ url, size }: { url: string; size: number }) {
  const matrix = createQrMatrix(url);
  if (!matrix) return null;
  const box = qrViewBoxSize(matrix);
  // Whole pixels per module keep the edges sharp for print and screen scans.
  const pixels = box * Math.max(1, Math.floor(size / box));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          borderRadius: 12,
          backgroundColor: QR_LIGHT,
          border: `2px solid ${BRAND.tan}`,
          overflow: "hidden",
        }}
      >
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: rasterised by Satori; a <title> would render as text. */}
        <svg width={pixels} height={pixels} viewBox={`0 0 ${box} ${box}`}>
          <rect width={box} height={box} fill={QR_LIGHT} />
          <path d={qrSvgPath(matrix)} fill={QR_DARK} />
        </svg>
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: BODY_FONT,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 4,
          color: BRAND.navy,
        }}
      >
        SCAN TO BOOK
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

function PosterCard({
  content,
  image,
  qrUrl,
}: {
  content: CardContent;
  image: string | null;
  qrUrl: string;
}) {
  const { width, height } = POSTER_IMAGE_SIZE;
  const coverHeight = 600;
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width,
        height,
        backgroundColor: BRAND.cream,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          width,
          height: coverHeight,
          overflow: "hidden",
        }}
      >
        <CoverImage image={image} width={width} height={coverHeight} />
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 56,
            display: "flex",
            padding: "18px 26px",
            borderRadius: 8,
            backgroundColor: "rgba(28,35,49,0.78)",
          }}
        >
          <Wordmark tone="light" scale={0.8} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          padding: "52px 64px 56px",
        }}
      >
        <Eyebrow>{content.kind.toUpperCase()}</Eyebrow>
        <div
          style={{
            display: "flex",
            marginTop: 14,
            fontFamily: DISPLAY_FONT,
            fontSize: content.title.length > 40 ? 64 : 80,
            lineHeight: 1.05,
            color: BRAND.navy,
          }}
        >
          {content.title}
        </div>

        <div style={{ display: "flex", flexGrow: 1, marginTop: 36, alignItems: "flex-end" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              paddingRight: 40,
              gap: 6,
              alignSelf: "stretch",
            }}
          >
            <DetailLine strong>{content.date}</DetailLine>
            <DetailLine strong>{content.time}</DetailLine>
            {content.venue ? <DetailLine>{content.venue}</DetailLine> : null}
            {content.coaches ? <DetailLine>{content.coaches}</DetailLine> : null}
            {content.spotsLeft ? (
              <div style={{ display: "flex", marginTop: 22 }}>
                <SpotsPill label={content.spotsLeft} />
              </div>
            ) : null}
          </div>
          <QrBlock url={qrUrl} size={260} />
        </div>
      </div>

      {content.cancelled ? <CancelledRibbon width={width} /> : null}
    </div>
  );
}

function OgCard({ content, image }: { content: CardContent; image: string | null }) {
  const { width, height } = OG_IMAGE_SIZE;
  const coverWidth = 460;
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width,
        height,
        backgroundColor: BRAND.cream,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: width - coverWidth,
          height,
          padding: "56px 60px",
        }}
      >
        <Eyebrow>{content.kind.toUpperCase()}</Eyebrow>
        <div
          style={{
            display: "flex",
            marginTop: 14,
            fontFamily: DISPLAY_FONT,
            fontSize: content.title.length > 36 ? 52 : 64,
            lineHeight: 1.05,
            color: BRAND.navy,
          }}
        >
          {content.title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 28, gap: 4 }}>
          <DetailLine strong>{`${content.date} · ${content.time}`}</DetailLine>
          {content.venue ? <DetailLine>{content.venue}</DetailLine> : null}
          {content.coaches ? <DetailLine>{content.coaches}</DetailLine> : null}
        </div>
        <div
          style={{
            display: "flex",
            flexGrow: 1,
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <Wordmark tone="dark" scale={0.8} />
          {content.spotsLeft ? <SpotsPill label={content.spotsLeft} size={20} /> : null}
        </div>
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          width: coverWidth,
          height,
          overflow: "hidden",
        }}
      >
        <CoverImage image={image} width={coverWidth} height={height} />
        {content.cancelled ? <CancelledRibbon width={coverWidth * 1.4} /> : null}
      </div>
    </div>
  );
}
