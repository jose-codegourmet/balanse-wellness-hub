/**
 * Header badge for admin queue pages (payments, cancellations, reschedules).
 * Pass it to `AdminPageShell` `actions` so the open-item total sits beside the
 * page title. Use the queue's server `totalCount`, never a count of loaded rows.
 */
export type AdminQueueCountProps = {
  count: number;
  /** Lowercase noun phrase after the number, e.g. "open requests". */
  label: string;
  className?: string;
};
