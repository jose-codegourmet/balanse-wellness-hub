# Spec: Policies, settings and public content

## Requirements

1. Required booking policies are versioned documents. A customer affirmatively accepts the required version before reserving; the booking records the document version and acceptance timestamp. Promoting a new version never rewrites historical acceptances. Production waiver wording must be supplied by the business.
2. Admin can manage policy documents, versions and form assignments at `/settings/policies/**`. A promotion creates a new current version and audits the change. Re-acceptance behavior for a later version remains an explicit business decision, not an inferred auto-acceptance.
3. Admin settings expose business identity/contact, payment account details, public About and contact content, FAQs and policy controls according to permissions. Partial section writes leave absent keys unchanged and audit changed keys. Opening hours remain read-only until verified; hold duration and cutoff are developer-controlled and absent from admin settings.
4. FAQs are ordered records with create, edit, delete and reorder actions. Public FAQ search filters the published answers client-side; unknown policy or refund timing is not invented in copy.
5. The public About, Contact and FAQ pages read approved content and assets. Contact information and hours must not be fabricated. The contact form's current UI state is validation/submission feedback only; it is not a booking or a replacement for the system reservation flow.
6. Marketing images come from the asset manifest or approved class/coach uploads. Missing imagery keeps a reserved frame or designed fallback. Admin image uploads use intent, byte upload and confirmation; the private/public storage boundary is described in [platform and data](platform-and-data.md).
7. Public content and policy APIs omit admin-only notes, financial fields, payment QR collection labels and unpublished material. Staff-facing content writes require server authorization as well as UI gating.

## Scenarios

- **Version integrity:** Given a booking that accepted policy version `2026-09`, when staff promotes `2026-10`, the old booking still points to `2026-09`.
- **Partial settings:** Given a saved About section and payment section, when staff changes the About copy only, payment settings remain unchanged.
- **Unknown hours:** Given no verified opening-hours source, when the public Contact page renders, it does not invent a schedule.

## Surfaces and sources

- Public: `/about`, `/contact`, `/faqs`; `/api/public/content`, `/api/public/policy-forms/{form}`.
- Customer: `/portal/profile/policies`; `/api/me/policy-acceptances`.
- Staff: `/settings/**`, `/payment-qr`; `/api/admin/settings/**`.
- Detail: `docs/business-requirements/07-booking-form-and-waivers.md`, `docs/backend/settings-write.md`, `docs/backend/uploads.md`, `docs/assets/manifest.json`.
