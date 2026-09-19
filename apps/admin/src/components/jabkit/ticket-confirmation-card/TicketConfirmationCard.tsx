"use client";

import { CircleCheckIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type { TicketConfirmationCardProps } from "./TicketConfirmationCard.types";

const defaults = {
  heading: "Thank you!",
  description: "Your ticket has been issued successfully",
  ticketIdLabel: "Ticket ID",
  ticketId: "TCK-8821",
  amountLabel: "Amount",
  amount: "$150.00",
  dateTimeLabel: "Date & Time",
  dateTime: "15 Sep 2026 • 14:30",
  cardHolder: "Mira Solano",
  last4Digits: "4418",
  barcodeValue: "TCK8821928374",
} as const;

const CONFETTI_COUNT = 100;
const CONFETTI_COLORS = [
  "var(--jk-destructive)",
  "var(--jk-chart-1)",
  "var(--jk-success)",
  "var(--jk-warning)",
  "var(--jk-chart-4)",
  "var(--jk-chart-3)",
] as const;

function hashCode(value: string) {
  return value.split("").reduce((acc, char) => {
    acc = (acc << 5) - acc + char.charCodeAt(0);
    return acc & acc;
  }, 0);
}

function unitRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function barcodeBars(value: string) {
  const seed = hashCode(value);
  return Array.from({ length: 60 }, (_, index) => {
    const rand = unitRandom(seed + index);
    return { width: rand > 0.7 ? 2.5 : 1.5 };
  });
}

function confettiPieces(seedValue: string) {
  const seed = hashCode(seedValue);
  return Array.from({ length: CONFETTI_COUNT }, (_, index) => {
    const a = unitRandom(seed + index * 7 + 1);
    const b = unitRandom(seed + index * 11 + 3);
    const c = unitRandom(seed + index * 13 + 5);
    const d = unitRandom(seed + index * 17 + 7);
    const e = unitRandom(seed + index * 19 + 9);
    return {
      id: `${seedValue}-${index}`,
      left: `${a * 100}%`,
      top: `${-20 + b * 10}%`,
      rotate: `${c * 360}deg`,
      duration: `${2.5 + d * 2.5}s`,
      delay: `${e * 2}s`,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    };
  });
}

function CardBrandMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-9 shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="fill-destructive" cx="8" cy="12" r="7" />
      <circle className="fill-warning opacity-80" cx="16" cy="12" r="7" />
    </svg>
  );
}

function DashedLine() {
  return (
    <div
      aria-hidden="true"
      className="w-full border-border border-t-2 border-dashed"
    />
  );
}

function TicketBarcode({ value }: { value: string }) {
  const bars = barcodeBars(value);
  const spacing = 1.5;
  const totalWidth =
    bars.reduce((acc, bar) => acc + bar.width + spacing, 0) - spacing;
  const svgWidth = 250;
  const svgHeight = 70;
  let currentX = (svgWidth - totalWidth) / 2;

  return (
    <div className="flex flex-col items-center py-2">
      <svg
        aria-hidden="true"
        className="fill-current text-foreground"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width={svgWidth}
        xmlns="http://www.w3.org/2000/svg"
      >
        {bars.map((bar, index) => {
          const x = currentX;
          currentX += bar.width + spacing;
          return (
            <rect
              height="50"
              key={`${value}-${index}`}
              width={bar.width}
              x={x}
              y="10"
            />
          );
        })}
      </svg>
      <p className="mt-2 text-sm tracking-[0.3em] text-muted-foreground">
        {value}
      </p>
    </div>
  );
}

function ConfettiBurst({ seed }: { seed: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {confettiPieces(seed).map((piece) => (
        <span
          className="jk-ticket-confirmation-confetti absolute h-4 w-2"
          key={piece.id}
          style={{
            left: piece.left,
            top: piece.top,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotate})`,
            animationDuration: piece.duration,
            animationDelay: piece.delay,
          }}
        />
      ))}
    </div>
  );
}

export function TicketConfirmationCard({
  className,
  heading = defaults.heading,
  description = defaults.description,
  ticketIdLabel = defaults.ticketIdLabel,
  ticketId = defaults.ticketId,
  amountLabel = defaults.amountLabel,
  amount = defaults.amount,
  dateTimeLabel = defaults.dateTimeLabel,
  dateTime = defaults.dateTime,
  cardHolder = defaults.cardHolder,
  last4Digits = defaults.last4Digits,
  barcodeValue = defaults.barcodeValue,
  showBarcode = true,
  showConfetti = true,
  ...props
}: TicketConfirmationCardProps) {
  const headingId = useId();
  const descriptionId = useId();
  const barcode = barcodeValue || ticketId;
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (!showConfetti) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mountTimer = window.setTimeout(() => setBurst(true), 100);
    const unmountTimer = window.setTimeout(() => setBurst(false), 6000);
    return () => {
      window.clearTimeout(mountTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [showConfetti]);

  return (
    <section
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={headingId}
      className={cn(
        "relative isolate overflow-hidden bg-background text-foreground",
        className,
      )}
      data-slot="ticket-confirmation-card"
      {...props}
    >
      <style>
        {`
          @keyframes jk-ticket-confirmation-fall {
            0% {
              transform: translateY(-10vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(110vh) rotate(720deg);
              opacity: 0;
            }
          }
          .jk-ticket-confirmation-confetti {
            animation-name: jk-ticket-confirmation-fall;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
          }
          @media (prefers-reduced-motion: reduce) {
            .jk-ticket-confirmation-confetti {
              animation: none;
              opacity: 0;
            }
          }
        `}
      </style>
      {burst ? <ConfettiBurst seed={barcode} /> : null}
      <div className="relative z-10 flex w-full items-center justify-center p-6">
        <article
          className={cn(
            "relative w-full max-w-sm rounded-2xl bg-card font-sans text-card-foreground shadow-lg",
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-500 motion-reduce:animate-none",
          )}
        >
          <div
            aria-hidden="true"
            className="absolute top-1/2 -left-4 size-8 -translate-y-1/2 rounded-full bg-background"
          />
          <div
            aria-hidden="true"
            className="absolute top-1/2 -right-4 size-8 -translate-y-1/2 rounded-full bg-background"
          />

          <div className="flex flex-col items-center p-8 text-center">
            <div
              className={cn(
                "rounded-full bg-primary/10 p-3",
                "motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:delay-300 motion-safe:duration-500 motion-reduce:animate-none",
              )}
            >
              <CircleCheckIcon
                aria-hidden="true"
                className={cn(
                  "size-10 text-primary",
                  "motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:delay-500 motion-safe:duration-500 motion-reduce:animate-none",
                )}
              />
            </div>
            <h2 className="mt-4 text-2xl font-semibold" id={headingId}>
              {heading}
            </h2>
            {description ? (
              <p className="mt-1 text-muted-foreground" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>

          <div className="space-y-6 px-8 pb-8">
            <DashedLine />

            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  {ticketIdLabel}
                </p>
                <p className="font-mono font-medium">{ticketId}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase">
                  {amountLabel}
                </p>
                <p className="text-lg font-semibold">{amount}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase">
                {dateTimeLabel}
              </p>
              <p className="font-medium">{dateTime}</p>
            </div>

            <div className="flex items-center space-x-4 rounded-lg bg-muted/50 p-4">
              <CardBrandMark />
              <div>
                <p className="font-semibold">{cardHolder}</p>
                <p className="font-mono text-sm tracking-wider text-muted-foreground">
                  •••• {last4Digits}
                </p>
              </div>
            </div>

            <DashedLine />

            {showBarcode ? <TicketBarcode value={barcode} /> : null}
          </div>
        </article>
      </div>
    </section>
  );
}
