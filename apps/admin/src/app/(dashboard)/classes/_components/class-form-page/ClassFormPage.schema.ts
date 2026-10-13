import type { ApiFetcher } from "@balanse/api-client";

export { classFormSchema } from "@/modules/admin/forms/class/class-form.schema";
export type ClassFormPageProps = {
  classId: string;
  /** Defaults to the real browser client; stories pass `mockClassFetcher`. */
  fetcher?: ApiFetcher;
};
