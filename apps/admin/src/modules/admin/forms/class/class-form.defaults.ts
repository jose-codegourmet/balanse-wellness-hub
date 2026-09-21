import type { ClassFormValues } from "./class-form.schema";

export const classFormDefaultValues: ClassFormValues = {
  name: "",
  slug: "",
  pageMode: "standard",
  customPageUrl: "",
  description: "",
  coachIds: [],
  heroImage: "",
  galleryImages: [],
  shortDescription: "",
  defaultDurationMinutes: null,
  defaultPricePhp: null,
  active: false,
};
