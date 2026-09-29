/** Desktop workspace context and permission-filtered operations inbox on warm gradient surfaces.
 * Compact mode renders only the inbox trigger for the mobile shell.
 * Reads the dashboard query; supports pending, failed, empty, and populated queues.
 * Use for shell navigation, not individual notification messages or page actions.
 */
export type AdminNotificationHeaderProps = {
  pathname: string;
  compact?: boolean;
};
