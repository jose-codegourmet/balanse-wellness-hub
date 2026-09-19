import type { ChangeEventHandler, FormEventHandler, HTMLAttributes } from "react";

export interface FormSearchDetails {
  destination: string;
  dateRange: string;
  rooms: number;
  guests: number;
}

export interface FormProps
  extends Omit<HTMLAttributes<HTMLElement>, "onSubmit"> {
  destinationsLabel?: string;
  detailsLabel?: string;
  destination?: string;
  defaultDestination?: string;
  destinationPlaceholder?: string;
  dateRange?: string;
  defaultDateRange?: string;
  rooms?: number;
  defaultRooms?: number;
  minRooms?: number;
  maxRooms?: number;
  guests?: number;
  defaultGuests?: number;
  minGuests?: number;
  maxGuests?: number;
  submitLabel?: string;
  onDestinationChange?: ChangeEventHandler<HTMLInputElement>;
  onDateRangeClick?: () => void;
  onRoomsClick?: () => void;
  onGuestsClick?: () => void;
  onSearch?: (details: FormSearchDetails) => void;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}
