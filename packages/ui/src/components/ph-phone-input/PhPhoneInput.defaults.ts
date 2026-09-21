import { PH_MOBILE_PLACEHOLDER } from "@balanse/domain";

import type { PhPhoneInputProps } from "./PhPhoneInput.schema";

export const phPhoneInputDefaultValues: Partial<PhPhoneInputProps> = {
  placeholder: PH_MOBILE_PLACEHOLDER,
  className: "max-w-sm",
};
