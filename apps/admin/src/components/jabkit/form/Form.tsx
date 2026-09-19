"use client";

import { BedDouble, CalendarDays, MapPin, Users2 } from "lucide-react";
import { type FormEvent, type ReactNode, useId, useState } from "react";
import { cn } from "@/components/jabkit/lib/cn";
import type { FormProps } from "./Form.types";

const defaults = {
  destinationsLabel: "Destinations",
  detailsLabel: "Details",
  defaultDestination: "Bali, Indonesia",
  destinationPlaceholder: "Bali, Indonesia",
  defaultDateRange: "8 May - 9 May",
  defaultRooms: 2,
  minRooms: 1,
  maxRooms: 8,
  defaultGuests: 4,
  minGuests: 1,
  maxGuests: 16,
  submitLabel: "Check Availability",
} as const;

const stagger =
  "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-both motion-reduce:animate-none";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function InfoButton({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      className={cn(
        "flex h-12 flex-1 items-center justify-start gap-3 rounded-xl border border-input bg-background px-4 text-left text-sm font-normal text-muted-foreground outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function Form({
  className,
  destinationsLabel = defaults.destinationsLabel,
  detailsLabel = defaults.detailsLabel,
  destination,
  defaultDestination = defaults.defaultDestination,
  destinationPlaceholder = defaults.destinationPlaceholder,
  dateRange,
  defaultDateRange = defaults.defaultDateRange,
  rooms,
  defaultRooms = defaults.defaultRooms,
  minRooms = defaults.minRooms,
  maxRooms = defaults.maxRooms,
  guests,
  defaultGuests = defaults.defaultGuests,
  minGuests = defaults.minGuests,
  maxGuests = defaults.maxGuests,
  submitLabel = defaults.submitLabel,
  onDestinationChange,
  onDateRangeClick,
  onRoomsClick,
  onGuestsClick,
  onSearch,
  onSubmit,
  ...props
}: FormProps) {
  const headingId = useId();
  const destinationId = useId();
  const [internalDestination, setInternalDestination] =
    useState(defaultDestination);
  const [internalRooms, setInternalRooms] = useState(
    clamp(defaultRooms, minRooms, maxRooms),
  );
  const [internalGuests, setInternalGuests] = useState(
    clamp(defaultGuests, minGuests, maxGuests),
  );

  const destinationValue = destination ?? internalDestination;
  const dateRangeValue = dateRange ?? defaultDateRange;
  const roomsValue = rooms ?? internalRooms;
  const guestsValue = guests ?? internalGuests;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    onSubmit?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    onSearch?.({
      destination: destinationValue.trim(),
      dateRange: dateRangeValue,
      rooms: roomsValue,
      guests: guestsValue,
    });
  };

  return (
    <section
      aria-labelledby={headingId}
      className={cn("bg-background text-foreground", className)}
      data-slot="form"
      {...props}
    >
      <div className="flex min-h-[100dvh] w-full items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-sm space-y-6 rounded-2xl bg-card p-6 text-card-foreground shadow-lg",
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-5 motion-safe:duration-500 motion-reduce:animate-none",
          )}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className={cn("space-y-2", stagger)}>
              <h2 className="font-medium text-card-foreground" id={headingId}>
                {destinationsLabel}
              </h2>
              <div className="relative">
                <MapPin
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  className="h-12 w-full rounded-xl border border-input bg-transparent pr-4 pl-10 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                  id={destinationId}
                  name="destination"
                  onChange={(event) => {
                    if (destination === undefined) {
                      setInternalDestination(event.target.value);
                    }
                    onDestinationChange?.(event);
                  }}
                  placeholder={destinationPlaceholder}
                  type="text"
                  value={destinationValue}
                />
              </div>
            </div>

            <div className={cn("space-y-2", stagger, "motion-safe:delay-100")}>
              <h3 className="font-medium text-card-foreground">{detailsLabel}</h3>
              <div className="flex flex-col gap-2 sm:flex-row">
                <InfoButton onClick={onDateRangeClick}>
                  <CalendarDays aria-hidden="true" className="size-5 shrink-0" />
                  <span>{dateRangeValue}</span>
                </InfoButton>
                <div className="flex flex-1 gap-2">
                  <InfoButton
                    className="w-1/2"
                    onClick={() => {
                      if (rooms === undefined) {
                        setInternalRooms(
                          clamp(roomsValue + 1, minRooms, maxRooms),
                        );
                      }
                      onRoomsClick?.();
                    }}
                  >
                    <BedDouble aria-hidden="true" className="size-5 shrink-0" />
                    <span>{roomsValue}</span>
                  </InfoButton>
                  <InfoButton
                    className="w-1/2"
                    onClick={() => {
                      if (guests === undefined) {
                        setInternalGuests(
                          clamp(guestsValue + 1, minGuests, maxGuests),
                        );
                      }
                      onGuestsClick?.();
                    }}
                  >
                    <Users2 aria-hidden="true" className="size-5 shrink-0" />
                    <span>{guestsValue}</span>
                  </InfoButton>
                </div>
              </div>
            </div>

            <div className={cn(stagger, "motion-safe:delay-200")}>
              <button
                className="h-12 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] motion-reduce:active:scale-100"
                type="submit"
              >
                {submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
