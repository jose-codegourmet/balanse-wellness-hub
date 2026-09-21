import { BALANSE_BREAKPOINTS } from "@balanse/config";

import type { UseMediaQueryProps } from "./UseMediaQuery.schema";

export const useMediaQueryDefaultValues: UseMediaQueryProps = {
  query: `(min-width: ${BALANSE_BREAKPOINTS.tablet}px)`,
};
