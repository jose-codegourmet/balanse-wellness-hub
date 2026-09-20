import { manilaYmd } from "@balanse/domain";
import { MOCK_NOW_ISO } from "@balanse/mock";

/** Frozen admin "now" — wraps the shared mock clock. Do not call `Date.now()`. */
export function adminNowIso(): string {
  return MOCK_NOW_ISO;
}

/** Manila calendar day for the shared mock clock (`YYYY-MM-DD`). */
export function adminTodayYmd(): string {
  return manilaYmd(MOCK_NOW_ISO);
}
