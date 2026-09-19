"use client";

import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../button/Button";

type EmblaCarouselApi = UseEmblaCarouselType[1];
type UseEmblaCarouselParameters = Parameters<typeof useEmblaCarousel>;
type EmblaCarouselOptions = UseEmblaCarouselParameters[0];
type EmblaCarouselPlugin = UseEmblaCarouselParameters[1];

type EmblaCarouselVariant = "horizontal" | "horizontal-auto" | "vertical";

type EmblaCarouselProps = {
  variant?: EmblaCarouselVariant;
  opts?: EmblaCarouselOptions;
  plugins?: EmblaCarouselPlugin;
  setApi?: (api: EmblaCarouselApi) => void;
};

type EmblaCarouselContextProps = {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollSnaps: number[];
  onDotClick: (index: number) => void;
  variant: EmblaCarouselVariant;
} & EmblaCarouselProps;

const EmblaCarouselContext = React.createContext<EmblaCarouselContextProps | null>(null);

function useEmblaCarouselContext() {
  const context = React.useContext(EmblaCarouselContext);

  if (!context) {
    throw new Error("useEmblaCarouselContext must be used within a <EmblaCarousel />");
  }

  return context;
}

function getAxis(variant: EmblaCarouselVariant): "x" | "y" {
  return variant === "vertical" ? "y" : "x";
}

function EmblaCarousel({
  variant = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & EmblaCarouselProps) {
  const [emblaRef, api] = useEmblaCarousel(
    {
      ...opts,
      ...(variant === "horizontal-auto" ? { align: opts?.align ?? "start" } : null),
      axis: getAxis(variant),
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const onSelect = React.useCallback((carouselApi: EmblaCarouselApi) => {
    if (!carouselApi) return;
    setCanScrollPrev(carouselApi.canScrollPrev());
    setCanScrollNext(carouselApi.canScrollNext());
    setSelectedIndex(carouselApi.selectedScrollSnap());
  }, []);

  const onInit = React.useCallback((carouselApi: EmblaCarouselApi) => {
    if (!carouselApi) return;
    setScrollSnaps(carouselApi.scrollSnapList());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const onDotClick = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (variant === "vertical") {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          scrollNext();
        }
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext, variant],
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onInit(api);
    onSelect(api);
    api.on("reInit", onInit);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api.off("reInit", onInit);
      api.off("reInit", onSelect);
      api.off("select", onSelect);
    };
  }, [api, onInit, onSelect]);

  return (
    <EmblaCarouselContext.Provider
      value={{
        emblaRef,
        api,
        opts,
        plugins,
        setApi,
        variant,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
        onDotClick,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="embla-carousel"
        data-variant={variant}
        {...props}
      >
        {children}
      </div>
    </EmblaCarouselContext.Provider>
  );
}

function EmblaCarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { emblaRef, variant } = useEmblaCarouselContext();
  const isVertical = variant === "vertical";

  return (
    <div ref={emblaRef} className="overflow-hidden" data-slot="embla-carousel-content">
      <div className={cn("flex", isVertical ? "-mt-4 flex-col" : "-ml-4", className)} {...props} />
    </div>
  );
}

function EmblaCarouselSlide({ className, ...props }: React.ComponentProps<"div">) {
  const { variant } = useEmblaCarouselContext();
  const isVertical = variant === "vertical";
  const isAutoWidth = variant === "horizontal-auto";

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="embla-carousel-slide"
      className={cn(
        "min-w-0 shrink-0 grow-0",
        isAutoWidth ? "w-auto" : "basis-full",
        isVertical ? "pt-4" : "pl-4",
        className,
      )}
      {...props}
    />
  );
}

function EmblaCarouselPrev({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { variant: carouselVariant, scrollPrev, canScrollPrev } = useEmblaCarouselContext();
  const isVertical = carouselVariant === "vertical";

  return (
    <Button
      data-slot="embla-carousel-prev"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        isVertical ? "-top-12 left-1/2 -translate-x-1/2 rotate-90" : "inset-y-0 -left-12 my-auto",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function EmblaCarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { variant: carouselVariant, scrollNext, canScrollNext } = useEmblaCarouselContext();
  const isVertical = carouselVariant === "vertical";

  return (
    <Button
      data-slot="embla-carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        isVertical
          ? "-bottom-12 left-1/2 -translate-x-1/2 rotate-90"
          : "inset-y-0 -right-12 my-auto",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

function EmblaCarouselDots({ className, ...props }: React.ComponentProps<"div">) {
  const { scrollSnaps, selectedIndex, onDotClick, variant } = useEmblaCarouselContext();
  const isVertical = variant === "vertical";

  if (scrollSnaps.length <= 1) return null;

  return (
    <div
      data-slot="embla-carousel-dots"
      className={cn(
        "absolute flex items-center justify-center gap-1.5",
        isVertical ? "inset-y-0 -right-8 flex-col" : "inset-x-0 -bottom-8",
        className,
      )}
      {...props}
    >
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === selectedIndex ? "true" : undefined}
          className={cn(
            "size-2 rounded-full transition-colors",
            index === selectedIndex
              ? "bg-foreground"
              : "bg-muted-foreground/40 hover:bg-muted-foreground/70",
          )}
          onClick={() => onDotClick(index)}
        />
      ))}
    </div>
  );
}

export {
  EmblaCarousel,
  type EmblaCarouselApi,
  EmblaCarouselContent,
  EmblaCarouselDots,
  EmblaCarouselNext,
  EmblaCarouselPrev,
  EmblaCarouselSlide,
  type EmblaCarouselVariant,
  useEmblaCarouselContext,
};
