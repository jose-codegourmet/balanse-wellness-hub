import type { ApiFetcher } from "./classes";

export type PublicContentResponse = {
  about: string;
  contact: { phone: string; email: string; address: string };
  faqs: Array<{ id: string; question: string; answer: string; sortOrder: number }>;
  business: {
    name: string;
    phone: string;
    email: string;
    address: string;
    instagram: string;
    tiktok: string;
    whatsapp: string;
    openingHours: string;
  };
};

export const getPublicContent = (fetcher: ApiFetcher) =>
  fetcher<PublicContentResponse>("/api/public/content");
