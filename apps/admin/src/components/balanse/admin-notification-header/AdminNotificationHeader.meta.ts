/** Workspace context and permission-filtered operations inbox on warm gradient surfaces.
 * The full header renders from `lg` (1024px) beside the inline sidebar; compact mode
 * renders only the inbox trigger for the phone / tablet-portrait top bar.
 * Reads the dashboard query; supports pending, failed, empty, and populated queues.
 * Use for shell navigation, not individual notification messages or page actions.
 */
export type AdminNotificationHeaderProps = {
  pathname: string;
  compact?: boolean;
};
