import type * as React from "react";
import type { Label } from "../label/Label";
import type { FieldVariantProps } from "./Field";

export type FieldProps = React.ComponentProps<"div"> &
  FieldVariantProps & {
    invalid?: boolean;
    disabled?: boolean;
  };

export type FieldSetProps = React.ComponentProps<"fieldset">;
export type FieldLegendProps = React.ComponentProps<"legend"> & { variant?: "legend" | "label" };
export type FieldGroupProps = React.ComponentProps<"div">;
export type FieldContentProps = React.ComponentProps<"div">;
export type FieldLabelProps = React.ComponentProps<typeof Label>;
export type FieldTitleProps = React.ComponentProps<"div">;
export type FieldDescriptionProps = React.ComponentProps<"p">;
export type FieldSeparatorProps = React.ComponentProps<"div"> & {
  children?: React.ReactNode;
};
export type FieldErrorProps = React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
};
