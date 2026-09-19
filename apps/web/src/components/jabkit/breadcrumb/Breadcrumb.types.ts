import type { useRender } from "@base-ui/react/use-render";
import type { ComponentProps } from "react";

export type BreadcrumbProps = ComponentProps<"nav">;

export type BreadcrumbListProps = ComponentProps<"ol">;

export type BreadcrumbItemProps = ComponentProps<"li">;

export type BreadcrumbLinkProps = useRender.ComponentProps<"a">;

export type BreadcrumbPageProps = ComponentProps<"span">;

export type BreadcrumbSeparatorProps = ComponentProps<"li">;

export type BreadcrumbEllipsisProps = ComponentProps<"span">;
