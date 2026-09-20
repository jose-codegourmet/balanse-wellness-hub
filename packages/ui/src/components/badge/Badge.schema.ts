import type { useRender } from "@base-ui/react/use-render";
import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import type { badgeVariants } from "./Badge";

export type BadgeProps = useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    dot?: boolean;
    icon?: ReactNode;
  };
