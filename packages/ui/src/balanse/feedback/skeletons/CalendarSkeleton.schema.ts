export type CalendarSkeletonView = "day" | "week" | "month" | "auto";

export type CalendarSkeletonProps = {
  className?: string;
  weeks?: number;
  view?: CalendarSkeletonView;
  label?: string;
};
