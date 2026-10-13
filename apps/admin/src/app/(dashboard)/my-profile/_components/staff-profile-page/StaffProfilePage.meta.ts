/**
 * Self-service staff account page. It must remain available to every active
 * staff actor, including custom roles with no other admin-route permission.
 * Includes immediate-save private avatar upload/replace/remove via /api/admin/me/photo.
 * The server chooses the owner from the verified session; no staff.manage needed.
 * Shares its identity query with navigation so both update after saving.
 */
export type StaffProfilePageProps = Record<string, never>;
