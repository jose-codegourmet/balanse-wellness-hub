import { manilaYmd } from "@balanse/domain";

/** Live admin clock. Storybook substitutes its own frozen fixture clock. */
export function adminNowIso(): string {
  return new Date().toISOString();
}

/** Current studio day in Asia/Manila, regardless of the device timezone. */
export function adminTodayYmd(): string {
  return manilaYmd(adminNowIso());
}
