"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "@/components/jabkit/lib/cn";
import { receiptPricingMocks } from "./ReceiptPricing.mocks";
import type {
  ReceiptPricingPeriod,
  ReceiptPricingPlan,
  ReceiptPricingProps,
} from "./ReceiptPricing.types";

const PERIODS: ReceiptPricingPeriod[] = ["monthly", "yearly"];
const PRINT_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const TEAR_EASE = "cubic-bezier(0.4, 0, 1, 1)";
const TOOTH_MASK_IMAGE = [
  "linear-gradient(135deg, transparent 50%, black 0)",
  "linear-gradient(-135deg, transparent 50%, black 0)",
  "linear-gradient(black, black)",
  "linear-gradient(135deg, black 50%, transparent 0)",
  "linear-gradient(-135deg, black 50%, transparent 0)",
].join(", ");
const TOOTH_MASK_SIZE =
  "var(--tooth-w) var(--tooth-h), var(--tooth-w) var(--tooth-h), 100% calc(100% - var(--tooth-h)), var(--tooth-w) var(--tooth-h), var(--tooth-w) var(--tooth-h)";
const TOOTH_MASK_POSITION = "0 0, 0 0, 0 calc(var(--tooth-h) / 2), 0 100%, 0 100%";
const TOOTH_MASK_REPEAT = "repeat-x, repeat-x, no-repeat, repeat-x, repeat-x";

type PrintPhase = "idle" | "tear" | "hidden" | "print";

function hashSeed(value: string) {
  let n = 2166136261;
  for (let i = 0; i < value.length; i++) {
    n ^= value.charCodeAt(i);
    n = Math.imul(n, 16777619);
  }
  return n >>> 0;
}

function barcodeBars(seed: string, count = 46) {
  let n = hashSeed(seed);
  return Array.from({ length: count }, (_, position) => {
    n = Math.imul(n ^ (n >>> 15), 2246822519) >>> 0;
    return { id: `${seed}-${position}`, width: (n % 3) + 1 };
  });
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function phaseStyle(
  phase: PrintPhase,
  delay: number,
  printMs: number,
  tearMs: number,
): CSSProperties {
  switch (phase) {
    case "tear":
      return {
        clipPath: "inset(0 0 0 0)",
        transform: "translateY(28px) rotate(0.5deg)",
        opacity: 0,
        transition: `transform ${tearMs}ms ${TEAR_EASE} ${delay}ms, opacity ${tearMs}ms linear ${delay}ms`,
      };
    case "hidden":
      return {
        clipPath: "inset(0 0 100% 0)",
        transform: "none",
        opacity: 1,
        transition: "none",
      };
    case "print":
      return {
        clipPath: "inset(0 0 0 0)",
        transform: "none",
        opacity: 1,
        transition: `clip-path ${printMs}ms ${PRINT_EASE} ${delay}ms`,
      };
    default:
      return {
        clipPath: "inset(0 0 0 0)",
        transform: "none",
        opacity: 1,
      };
  }
}

function headStyle(
  phase: PrintPhase,
  delay: number,
  printMs: number,
): CSSProperties {
  const backgroundImage =
    "linear-gradient(to bottom, transparent 0%, transparent 86%, color-mix(in oklab, currentColor 6%, transparent) 97%, color-mix(in oklab, currentColor 30%, transparent) 100%)";
  if (phase === "hidden") {
    return {
      backgroundImage,
      transform: "translateY(-100%)",
      opacity: 1,
      transition: "none",
    };
  }
  if (phase === "print") {
    return {
      backgroundImage,
      transform: "translateY(0)",
      opacity: 1,
      transition: `transform ${printMs}ms ${PRINT_EASE} ${delay}ms`,
    };
  }
  return {
    backgroundImage,
    transform: "translateY(0)",
    opacity: 0,
    transition: "opacity 160ms linear",
  };
}

function Rule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("border-t border-current/30 border-dashed", className)}
    />
  );
}

function ReceiptSlip({
  plan,
  period,
  phase,
  delay,
  index,
  money,
  monthsFree,
  merchant,
  merchantNote,
  orderPrefix,
  stamp,
  showStamp,
  showBarcode,
  printMs,
  tearMs,
  toothWidth,
  toothDepth,
  grain,
  onSelect,
}: {
  plan: ReceiptPricingPlan;
  period: ReceiptPricingPeriod;
  phase: PrintPhase;
  delay: number;
  index: number;
  money: Intl.NumberFormat;
  monthsFree: number;
  merchant: string;
  merchantNote?: string;
  orderPrefix: string;
  stamp: string;
  showStamp: boolean;
  showBarcode: boolean;
  printMs: number;
  tearMs: number;
  toothWidth: number;
  toothDepth: number;
  grain: number;
  onSelect?: () => void;
}) {
  const yearly = period === "yearly";
  const yearlyTotal = plan.yearly ?? plan.monthly * (12 - monthsFree);
  const subtotal = yearly ? plan.monthly * 12 : plan.monthly;
  const discount = yearly ? subtotal - yearlyTotal : 0;
  const due = yearly ? yearlyTotal : plan.monthly;
  const perMonth = yearly ? yearlyTotal / 12 : plan.monthly;
  const orderId = `${orderPrefix}-${(hashSeed(plan.id) % 90000) + 10000}`;
  const barcodeId = `${orderId}-${yearly ? "YR" : "MO"}`;
  const ctaLabel = plan.cta ?? `Choose ${plan.name}`;
  const ctaClassName = cn(
    "mt-5 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-md text-xs font-semibold tracking-[0.16em] uppercase outline-none transition-[background-color,transform] duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98] motion-reduce:transition-none",
    plan.featured
      ? "bg-primary text-primary-foreground hover:opacity-90 dark:bg-background dark:text-foreground"
      : "border border-current/30 hover:bg-current/5",
  );

  const slipStyle = {
    "--tooth-w": `${toothWidth}px`,
    "--tooth-h": `${toothDepth * 2}px`,
    maskImage: TOOTH_MASK_IMAGE,
    maskSize: TOOTH_MASK_SIZE,
    maskPosition: TOOTH_MASK_POSITION,
    maskRepeat: TOOTH_MASK_REPEAT,
    WebkitMaskImage: TOOTH_MASK_IMAGE,
    WebkitMaskSize: TOOTH_MASK_SIZE,
    WebkitMaskPosition: TOOTH_MASK_POSITION,
    WebkitMaskRepeat: TOOTH_MASK_REPEAT,
    backgroundImage:
      grain > 0
        ? `repeating-linear-gradient(180deg, color-mix(in oklab, currentColor ${(grain * 100).toFixed(1)}%, transparent) 0 1px, transparent 1px 4px)`
        : undefined,
    ...phaseStyle(phase, delay, printMs, tearMs),
  } as CSSProperties;

  return (
    <div
      className="w-full max-w-[19rem] transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      data-plan={plan.id}
      data-slot="receipt-slip"
      style={{
        filter:
          "drop-shadow(0 1px 1px color-mix(in oklab, var(--jk-foreground) 6%, transparent)) drop-shadow(0 10px 14px color-mix(in oklab, var(--jk-foreground) 14%, transparent))",
      }}
    >
      <article
        aria-label={`${plan.name} plan`}
        className="relative overflow-hidden border-x border-border/70 bg-card px-6 pt-8 pb-7 font-mono text-card-foreground dark:border-background/15 dark:bg-foreground dark:text-background"
        style={slipStyle}
      >
        <header className="text-center">
          <p className="text-[13px] font-semibold tracking-[0.34em] uppercase">
            {merchant}
          </p>
          {merchantNote ? (
            <p className="mt-1.5 text-[11px] tracking-[0.14em] text-muted-foreground uppercase dark:text-background/65">
              {merchantNote}
            </p>
          ) : null}
        </header>

        <Rule className="mt-5" />

        <dl className="mt-3 space-y-1 text-[11px] tracking-[0.1em] text-muted-foreground uppercase dark:text-background/65">
          <div className="flex justify-between gap-3">
            <dt>Order</dt>
            <dd className="tabular-nums text-card-foreground dark:text-background">
              {orderId}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Billing</dt>
            <dd className="text-card-foreground dark:text-background">
              {yearly ? "Yearly" : "Monthly"}
            </dd>
          </div>
        </dl>

        <Rule className="mt-3" />

        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold tracking-[0.2em] uppercase">
            {plan.name}
          </h3>
          {plan.tagline ? (
            <p className="mt-1 text-[11px] tracking-[0.1em] text-muted-foreground uppercase dark:text-background/65">
              {plan.tagline}
            </p>
          ) : null}
          {plan.featured ? (
            <p className="mt-2 text-[11px] font-semibold tracking-[0.24em] text-primary uppercase dark:text-[color-mix(in_oklab,var(--jk-primary)_40%,var(--jk-background))]">
              <span aria-hidden="true">*** </span>
              Most popular
              <span aria-hidden="true"> ***</span>
            </p>
          ) : null}
        </div>

        <Rule className="mt-4" />

        <ul className="mt-4 space-y-1.5 text-xs tracking-[0.06em] uppercase">
          {plan.items.map((item) => (
            <li className="flex items-baseline gap-1.5" key={item.label}>
              <span className="shrink-0">{item.label}</span>
              <span
                aria-hidden="true"
                className="min-w-3 flex-1 translate-y-[-0.28em] border-b border-dotted border-current/30"
              />
              <span className="shrink-0 tabular-nums">{item.value}</span>
            </li>
          ))}
        </ul>

        <Rule className="mt-4" />

        <dl className="mt-4 space-y-1.5 text-xs tracking-[0.06em] uppercase">
          <div className="flex items-baseline justify-between gap-3">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{money.format(subtotal)}</dd>
          </div>
          {discount > 0 ? (
            <div className="flex items-baseline justify-between gap-3 text-primary dark:text-[color-mix(in_oklab,var(--jk-primary)_40%,var(--jk-background))]">
              <dt>{monthsFree} months free</dt>
              <dd className="tabular-nums">-{money.format(discount)}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-3 border-t-[3px] border-double border-current/40 pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase">
              Total due
            </p>
            <p className="text-xl font-semibold tabular-nums">
              {money.format(due)}
            </p>
          </div>
          <p className="mt-1.5 text-[11px] tracking-[0.1em] text-muted-foreground uppercase dark:text-background/65">
            {yearly
              ? `${money.format(perMonth)} / mo · billed yearly`
              : "Billed monthly · cancel anytime"}
          </p>
        </div>

        {showStamp && yearly && monthsFree > 0 ? (
          <p
            className="mx-auto mt-4 w-fit border-2 border-primary/45 px-2.5 py-1 text-[11px] font-semibold tracking-[0.2em] text-primary uppercase dark:border-background/50 dark:text-background"
            style={{ transform: `rotate(${-3 + (index % 3) * 0.9}deg)` }}
          >
            {stamp}
          </p>
        ) : null}

        {plan.href ? (
          <a className={ctaClassName} data-slot="plan-cta" href={plan.href}>
            {ctaLabel}
          </a>
        ) : (
          <button
            className={ctaClassName}
            data-slot="plan-cta"
            onClick={onSelect}
            type="button"
          >
            {ctaLabel}
          </button>
        )}

        {showBarcode ? (
          <div className="mt-6">
            <div
              aria-hidden="true"
              className="mx-auto flex h-9 w-fit items-stretch"
            >
              {barcodeBars(barcodeId).map((bar, barIndex) => (
                <span
                  className={barIndex % 2 === 0 ? "bg-current" : undefined}
                  key={bar.id}
                  style={{ width: bar.width }}
                />
              ))}
            </div>
            <p
              aria-hidden="true"
              className="mt-1.5 text-center text-[11px] tracking-[0.24em] text-muted-foreground uppercase dark:text-background/65"
            >
              {barcodeId}
            </p>
          </div>
        ) : null}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={headStyle(phase, delay, printMs)}
        />
      </article>
    </div>
  );
}

export function ReceiptPricing({
  className,
  title = receiptPricingMocks.default.title,
  description = receiptPricingMocks.default.description,
  children,
  merchant = receiptPricingMocks.default.merchant,
  merchantNote = receiptPricingMocks.default.merchantNote,
  orderPrefix = receiptPricingMocks.default.orderPrefix,
  monthsFree = receiptPricingMocks.default.monthsFree,
  printMs = receiptPricingMocks.default.printMs,
  tearMs = receiptPricingMocks.default.tearMs,
  stagger = receiptPricingMocks.default.stagger,
  toothWidth = receiptPricingMocks.default.toothWidth,
  toothDepth = receiptPricingMocks.default.toothDepth,
  grain = receiptPricingMocks.default.grain,
  printOnReveal = receiptPricingMocks.default.printOnReveal,
  showStamp = receiptPricingMocks.default.showStamp,
  showBarcode = receiptPricingMocks.default.showBarcode,
  stampLabel = "{months} months free",
  monthlyLabel = receiptPricingMocks.default.monthlyLabel,
  yearlyLabel = receiptPricingMocks.default.yearlyLabel,
  currency = receiptPricingMocks.default.currency,
  locale = receiptPricingMocks.default.locale,
  defaultPeriod = "monthly",
  period: periodProp,
  onPeriodChange,
  onSelectPlan,
  plans = receiptPricingMocks.default.plans,
  ...props
}: ReceiptPricingProps) {
  const headingId = useId();
  const descriptionId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduceMotion = useReducedMotion();
  const [uncontrolled, setUncontrolled] =
    useState<ReceiptPricingPeriod>(defaultPeriod);
  const selected = periodProp ?? uncontrolled;
  const [printedPeriod, setPrintedPeriod] = useState(selected);
  const [phase, setPhase] = useState<PrintPhase>("idle");

  const planList = plans ?? [];
  const rowMs = (ms: number) => ms + (stagger ?? 60) * (Math.max(planList.length, 1) - 1);

  const setPeriod = (next: ReceiptPricingPeriod) => {
    if (periodProp === undefined) setUncontrolled(next);
    onPeriodChange?.(next);
  };

  useEffect(() => {
    if (selected === printedPeriod) return;
    if (reduceMotion || (printMs ?? 0) + (tearMs ?? 0) === 0) {
      setPrintedPeriod(selected);
      setPhase("idle");
      return;
    }
    const tearDuration = rowMs(tearMs ?? 200);
    setPhase("tear");
    const hideTimer = window.setTimeout(() => {
      setPrintedPeriod(selected);
      setPhase("hidden");
    }, tearDuration);
    const printTimer = window.setTimeout(() => setPhase("print"), tearDuration + 32);
    const idleTimer = window.setTimeout(
      () => setPhase("idle"),
      tearDuration + 32 + rowMs(printMs ?? 460),
    );
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(printTimer);
      window.clearTimeout(idleTimer);
    };
  }, [selected, reduceMotion, printMs, tearMs, stagger, planList.length]);

  useIsoLayoutEffect(() => {
    const node = sectionRef.current;
    if (!node || !printOnReveal || reduceMotion) return;
    let startTimer = 0;
    let idleTimer = 0;
    const start = () => {
      startTimer = window.setTimeout(() => setPhase("print"), 32);
      idleTimer = window.setTimeout(
        () => setPhase("idle"),
        32 + rowMs(printMs ?? 460),
      );
    };
    setPhase("hidden");
    const box = node.getBoundingClientRect();
    if (box.top < window.innerHeight * 0.9 && box.bottom > 0) {
      start();
      return () => {
        window.clearTimeout(startTimer);
        window.clearTimeout(idleTimer);
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          start();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(startTimer);
      window.clearTimeout(idleTimer);
    };
  }, [printOnReveal, reduceMotion, printMs, stagger, planList.length]);

  const money = useMemo(
    () =>
      new Intl.NumberFormat(locale ?? "en-US", {
        style: "currency",
        currency: currency ?? "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale, currency],
  );

  const onOptionKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const index = PERIODS.indexOf(selected);
      let next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = (index + 1) % PERIODS.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = (index + PERIODS.length - 1) % PERIODS.length;
      } else if (event.key === "Home") {
        next = 0;
      } else if (event.key === "End") {
        next = PERIODS.length - 1;
      } else {
        return;
      }
      event.preventDefault();
      const id = PERIODS[next];
      setPeriod(id);
      optionRefs.current[next]?.focus();
    },
    [selected, periodProp, onPeriodChange],
  );

  const labels = [monthlyLabel ?? "Monthly", yearlyLabel ?? "Yearly"];
  const stamp = (stampLabel ?? "{months} months free").replace(
    "{months}",
    String(monthsFree ?? 2),
  );
  const liveSummary = planList
    .map((plan) => {
      const amount =
        printedPeriod === "yearly"
          ? (plan.yearly ?? plan.monthly * (12 - (monthsFree ?? 2)))
          : plan.monthly;
      return `${plan.name} ${money.format(amount)} ${printedPeriod === "yearly" ? "per year" : "per month"}`;
    })
    .join(", ");

  return (
    <section
      aria-describedby={description && !children ? descriptionId : undefined}
      aria-labelledby={!children ? headingId : undefined}
      className={cn(
        "flex min-h-[max(680px,100svh)] w-full flex-col items-center justify-center bg-background px-6 py-8 text-foreground",
        className,
      )}
      data-period={selected}
      data-slot="receipt-pricing"
      ref={sectionRef}
      {...props}
    >
      {children ?? (
        <div className="mx-auto mb-6 max-w-xl text-center">
          <h2
            className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl"
            id={headingId}
          >
            {title}
          </h2>
          {description ? (
            <p
              className="mx-auto mt-3 max-w-lg text-base text-pretty text-muted-foreground"
              id={descriptionId}
            >
              {description}
            </p>
          ) : null}
        </div>
      )}

      <div
        aria-label="Billing period"
        className="mx-auto flex h-11 w-fit items-center rounded-full bg-muted p-1"
        data-slot="period-toggle"
        role="radiogroup"
      >
        {PERIODS.map((id, index) => {
          const checked = selected === id;
          return (
            <button
              aria-checked={checked}
              className={cn(
                "h-9 cursor-pointer rounded-full px-5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none",
                checked
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-period={id}
              data-slot={id === "yearly" ? "cta-primary" : "period-option"}
              data-state={checked ? "checked" : "unchecked"}
              key={id}
              onClick={() => setPeriod(id)}
              onKeyDown={onOptionKeyDown}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              role="radio"
              tabIndex={checked ? 0 : -1}
              type="button"
            >
              {labels[index]}
            </button>
          );
        })}
      </div>

      <div
        className="mx-auto mt-8 grid w-full max-w-5xl grid-cols-1 items-start justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3"
        data-slot="receipt-row"
      >
        {planList.map((plan, index) => (
          <ReceiptSlip
            delay={(stagger ?? 60) * index}
            grain={grain ?? 0.05}
            index={index}
            key={plan.id}
            merchant={merchant ?? "Meridian"}
            merchantNote={merchantNote}
            money={money}
            monthsFree={monthsFree ?? 2}
            onSelect={
              onSelectPlan ? () => onSelectPlan(plan, selected) : undefined
            }
            orderPrefix={orderPrefix ?? "MD"}
            period={printedPeriod}
            phase={phase}
            plan={plan}
            printMs={printMs ?? 460}
            showBarcode={showBarcode ?? true}
            showStamp={showStamp ?? true}
            stamp={stamp}
            tearMs={tearMs ?? 200}
            toothDepth={toothDepth ?? 6}
            toothWidth={toothWidth ?? 12}
          />
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        Billed {printedPeriod}. {liveSummary}.
      </p>
    </section>
  );
}
