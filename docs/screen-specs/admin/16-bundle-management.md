# Admin — Bundle / package management

## Routes

- `/bundles` — catalogue table + paid-request review
- `/bundles/new` and `/bundles/[bundleId]` — create/edit form

## Fields

Name, unique slug, short summary, rich-text description, session credits (>0), PHP price (zero allowed), all classes vs selected classes, optional validity days, optional per-customer limit, status draft/published/archived.

## Rules

- Drafts are admin-only.
- Archive blocks new claims. Existing entitlements stay valid.
- Saving never rewrites entitlement or redemption history.
- Destructive/history-affecting grants need an internal note. Limit overrides are explicit and audited.

## Customer detail

Staff can grant a published package from `/customers/[customerId]` with a note and optional limit override.
