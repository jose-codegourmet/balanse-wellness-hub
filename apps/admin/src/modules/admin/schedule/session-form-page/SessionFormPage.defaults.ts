import type { SessionFormPageProps } from "./SessionFormPage.schema";

export { sessionFormDefaultValues } from "../../forms/session/session-form.defaults";
export const sessionFormPageDefaultValues: SessionFormPageProps = {
  sessionId: "new",
  date: "2026-09-21",
  surface: "page",
};
