# Venue management

**Route:** `/venues`, `/venues/new`, `/venues/[venueId]`  
**Audience:** Staff with `classes.read`; create, edit, activate, and deactivate require `classes.manage`.

## Purpose

Maintain the places where sessions run. A venue can be a studio branch or an off-site partner location. The directory lets staff see operational details before scheduling, while keeping the existing no-overlap restriction policy unchanged.

## Header

- Title: **Venues**
- Summary metrics: active branches, studio-owned locations, third-party / rented locations, and upcoming off-site sessions.
- Primary action: a visually distinct **Add venue** callout. It links to `/venues/new` for authorized staff.

## List

The responsive `AdminDataTable` shows name, type, venue operation, address, opening hours, status, and upcoming session count. Staff can filter Type, Operation, and Status. On compact screens, name and address lead the venue card while operation, opening hours, type, status, and session count remain visible as concise metadata.

## Create and edit pages

`/venues/new` creates a venue and `/venues/[venueId]` edits one (the Edit row action and the venue name link there). Both require `classes.manage`. Saving returns to `/venues`; Cancel confirms first when the form has unsaved changes. Activate and deactivate stay row actions on the list.

Fields:

- Name (required)
- Type: Branch or Off-site
- Address
- Opening hours
- Venue operation: **Studio-owned** or **Third-party / rented**
- Staff notes
- Active status

Opening hours and venue operation are staff-only mock fields. They have no API, database, migration, or RLS contract until explicitly approved. Deactivated venues remain on historical sessions but cannot be selected for a new session.
