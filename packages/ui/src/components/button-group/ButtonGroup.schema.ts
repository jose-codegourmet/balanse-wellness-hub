import type { useRender } from "@base-ui/react/use-render";
import type * as React from "react";
import type { Separator } from "../separator/Separator";
import type { ButtonGroupVariantProps } from "./ButtonGroup";

export type ButtonGroupProps = React.ComponentProps<"div"> & ButtonGroupVariantProps;
export type ButtonGroupTextProps = useRender.ComponentProps<"div">;
export type ButtonGroupSeparatorProps = React.ComponentProps<typeof Separator>;
