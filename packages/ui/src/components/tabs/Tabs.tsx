"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../button/Button";

function Tabs({ className, orientation = "horizontal", ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

const tabsTriggerClassName = cn(
  "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
  "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
  "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
);

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(tabsTriggerClassName, className)}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

type TabsCarouselItem = {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
};

type TabsCarouselBreakpoint = "xs" | "sm" | "md" | "lg";

const tabsCarouselBreakpointClasses: Record<
  TabsCarouselBreakpoint,
  { staticList: string; carousel: string }
> = {
  xs: {
    staticList: "@max-xs/tabs-carousel:hidden",
    carousel: "@xs/tabs-carousel:hidden",
  },
  sm: {
    staticList: "@max-sm/tabs-carousel:hidden",
    carousel: "@sm/tabs-carousel:hidden",
  },
  md: {
    staticList: "@max-md/tabs-carousel:hidden",
    carousel: "@md/tabs-carousel:hidden",
  },
  lg: {
    staticList: "@max-lg/tabs-carousel:hidden",
    carousel: "@lg/tabs-carousel:hidden",
  },
};

type TabsCarouselListProps = {
  tabs: TabsCarouselItem[];
  breakpoint?: TabsCarouselBreakpoint;
  className?: string;
} & VariantProps<typeof tabsListVariants>;

function TabsCarouselTriggers({
  tabs,
  className,
}: {
  tabs: TabsCarouselItem[];
  className?: string;
}) {
  return tabs.map((tab) => (
    <TabsPrimitive.Tab
      key={tab.value}
      value={tab.value}
      disabled={tab.disabled}
      data-slot="tabs-trigger"
      className={cn(tabsTriggerClassName, "flex-none grow-0", className)}
    >
      {tab.icon}
      {tab.label}
    </TabsPrimitive.Tab>
  ));
}

function TabsCarouselViewport({
  tabs,
  variant = "default",
  className,
}: {
  tabs: TabsCarouselItem[];
  variant?: VariantProps<typeof tabsListVariants>["variant"];
  className?: string;
}) {
  const [emblaRef, api] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback(() => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  React.useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api.off("reInit", onSelect);
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Re-measure when the carousel leaves `display: none` after a @container swap
  React.useEffect(() => {
    if (!api) return;
    const root = api.rootNode();
    if (!root) return;

    const observer = new ResizeObserver(() => {
      api.reInit();
    });
    observer.observe(root);

    return () => observer.disconnect();
  }, [api]);

  return (
    <div
      data-slot="tabs-carousel"
      className={cn("relative flex min-w-0 items-center gap-1", className)}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className={cn("shrink-0", !canScrollPrev && "invisible")}
        disabled={!canScrollPrev}
        aria-label="Scroll tabs left"
        onClick={() => api?.scrollPrev()}
      >
        <ChevronLeftIcon />
      </Button>

      <div ref={emblaRef} className="min-w-0 flex-1 overflow-hidden">
        <TabsPrimitive.List
          data-slot="tabs-list"
          data-variant={variant}
          className={cn(
            tabsListVariants({ variant }),
            "w-max max-w-none flex-nowrap justify-start",
          )}
        >
          <TabsCarouselTriggers tabs={tabs} />
        </TabsPrimitive.List>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className={cn("shrink-0", !canScrollNext && "invisible")}
        disabled={!canScrollNext}
        aria-label="Scroll tabs right"
        onClick={() => api?.scrollNext()}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}

function TabsCarouselList({
  tabs,
  variant = "default",
  breakpoint = "sm",
  className,
}: TabsCarouselListProps) {
  const breakpointClasses = tabsCarouselBreakpointClasses[breakpoint];

  return (
    <div
      data-slot="tabs-carousel-list"
      className={cn("@container/tabs-carousel w-full min-w-0", className)}
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), breakpointClasses.staticList)}
      >
        <TabsCarouselTriggers tabs={tabs} />
      </TabsPrimitive.List>

      <div className={cn("w-full min-w-0", breakpointClasses.carousel)}>
        <TabsCarouselViewport tabs={tabs} variant={variant} />
      </div>
    </div>
  );
}

export {
  Tabs,
  type TabsCarouselBreakpoint,
  type TabsCarouselItem,
  TabsCarouselList,
  TabsContent,
  TabsList,
  TabsTrigger,
  tabsListVariants,
};
