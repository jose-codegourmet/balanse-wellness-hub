import type { ComponentProps } from "react";

export type PaginationProps = ComponentProps<"nav">;

export type PaginationContentProps = ComponentProps<"ul">;

export type PaginationItemProps = ComponentProps<"li">;

export type PaginationLinkSize = "default" | "icon" | "sm" | "lg";

export type PaginationLinkProps = ComponentProps<"a"> & {
  isActive?: boolean;
  size?: PaginationLinkSize;
};

export type PaginationPreviousProps = PaginationLinkProps & {
  text?: string;
};

export type PaginationNextProps = PaginationLinkProps & {
  text?: string;
};

export type PaginationEllipsisProps = ComponentProps<"span">;
