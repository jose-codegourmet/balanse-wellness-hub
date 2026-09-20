export type CalendarSkeletonView = "day" | "week" | "month";

export type CalendarSkeletonProps = {
  className?: string;
  weeks?: number;
  view?: CalendarSkeletonView;
  label?: string;
};
