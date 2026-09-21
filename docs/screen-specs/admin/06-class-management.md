# Admin Portal — Class Management

```text
CLASSES                              [Add Class]
Yoga       Active       [Edit]
Boxing     Active       [Edit]
Capoeira   Active       [Edit]
```

The create form lives at `/classes/new` as a standalone page, not a modal or wizard. Content/images/coaches sit beside compact page settings and session defaults, stacking on mobile.

Fields: name, unique marketing slug, standard-layout/custom-redirect URL mode, short description, rich-text about content, optional assigned marketing coaches, hero image, ordered gallery images, default duration(optional), default customer price(optional), active/inactive. Session-level price/capacity may override defaults.

Classes may have zero or more assigned coaches for their public marketing roster. This does not constrain session staffing: every scheduled session independently requires at least one coach and may contain multiple coaches. Customers book the class session, not an individual coach. A session may have an optional custom name; blank names display the current class name.

Public routes: `/classes` and `/classes/[slug]`. Detail order: image hero, assigned coaches, safe rich text, full-width carousel with fullscreen zoom, customer rate, booking section. Admin rows link to the canonical marketing URL. The editor also offers an unsaved standard-layout preview with public fields in a URL fragment. Class routes now read/write the confirmed Supabase project through server actions and RLS; other entities remain mocked. See [database catalogue](../../backend/class-catalogue.md).

## Pricing note

Class definitions may contain a default customer-facing price for convenience.

The actual scheduled session may override that value.

Do not store coach compensation as public class information.
