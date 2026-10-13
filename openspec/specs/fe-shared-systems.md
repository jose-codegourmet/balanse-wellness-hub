# Spec: FE shared systems

## Requirements

1. Public nav is Schedule, Classes, Packages, Coaches, About, FAQs, Contact, Login/Profile in that order. Schedule opens `/book/calendar`; Classes opens `/classes`. Both `/book/quick` and `/book/calendar` highlight Schedule.
2. Customer nav is Home, My bookings, Schedule, Packages, Profile, Achievements (TBD), in the order defined by `CUSTOMER_NAV_ITEMS`.
3. Admin nav uses the permission-filtered `ADMIN_NAV_ITEMS` catalog (Dashboard through Settings, including Events, Payment QR, Venues, Bundles, Sales, Transactions, Reports and Marketing insights). `My Students` is contextual to the built-in Coach role. Admin nav is not rendered in `apps/web`.
4. Customer-facing status copy matches `docs/screen-specs/shared/02-status-language.md` exactly; raw enums never reach the DOM.
5. The 15 empty/error states in `shared/03-empty-error-states.md` exist as reusable components. Calendar load uses a localized skeleton, not a full-page spinner.
6. Public image slots read `docs/assets/manifest.json` (packaged copy). Missing art degrades to a reserved frame. Coach photos come from the coach record and fall back to ASSET-014.
7. The schedule calendar is day < 768px, week ≥ 768px, month ≥ 1280px. Session panel shows class, time, coach, price, remaining slots, and Reserve or Join Waitlist — never a coach rate.
8. Shared screens read live data through the typed API client and React Query. Storybook may inject mock-backed fetchers to render the same components without a server.
