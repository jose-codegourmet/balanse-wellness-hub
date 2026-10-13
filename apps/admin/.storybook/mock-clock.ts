import { manilaYmd } from "@balanse/domain";
import { MOCK_NOW_ISO } from "@balanse/mock";

/** Preview-only clock, aligned with the September demo sessions. */
export function adminNowIso(): string {
  return MOCK_NOW_ISO;
}

export function adminTodayYmd(): string {
  return manilaYmd(adminNowIso());
}
