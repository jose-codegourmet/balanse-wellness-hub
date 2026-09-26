import type { AdminEvent } from "@balanse/domain";
import { type EventFormValues, eventPartsFromInstant } from "./EventFormPage.schema";

export const eventFormDefaultValues: EventFormValues = {
  sessionId: "",
  title: "",
  summary: "",
  description: "",
  posterImage: "",
  galleryImages: [],
  venueName: "",
  venueAddress: "",
  beneficiary: "",
  whatToBring: "",
  internalNotes: "",
  registrationOpensOn: "",
  registrationOpensAtTime: "",
  registrationClosesOn: "",
  registrationClosesAtTime: "",
};

export function eventFormValuesFromEvent(event: AdminEvent): EventFormValues {
  const opens = eventPartsFromInstant(event.registrationOpensAt);
  const closes = eventPartsFromInstant(event.registrationClosesAt);
  return {
    sessionId: event.sessionId,
    title: event.title,
    summary: event.summary,
    description: event.description,
    posterImage: event.posterImage ?? "",
    galleryImages: [...event.galleryImages],
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    beneficiary: event.beneficiary,
    whatToBring: event.whatToBring,
    internalNotes: event.internalNotes,
    registrationOpensOn: opens.ymd,
    registrationOpensAtTime: opens.hhmm,
    registrationClosesOn: closes.ymd,
    registrationClosesAtTime: closes.hhmm,
  };
}
