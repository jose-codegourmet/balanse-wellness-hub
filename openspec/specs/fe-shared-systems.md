# Spec: FE shared systems

## Requirements

1. Public nav is Schedule, Classes, Coaches, About, FAQs, Contact, Login/Profile in that order. Schedule and Classes hash to the landing calendar.
2. Customer nav is Home/My Bookings, Schedule, Profile, Achievements (TBD).
3. Admin nav is the 12-item list with Reports between Classes and Staff, and is not rendered in `apps/web`.
4. Customer-facing status copy matches `docs/screen-specs/shared/02-status-language.md` exactly; raw enums never reach the DOM.
5. The 15 empty/error states in `shared/03-empty-error-states.md` exist as reusable components. Calendar load uses a localized skeleton, not a full-page spinner.
6. Public image slots read `docs/assets/manifest.json` (packaged copy). Missing art degrades to a reserved frame. Coach photos come from the coach record and fall back to ASSET-014.
7. The schedule calendar is day < 768px, week ≥ 768px, month ≥ 1280px. Session panel shows class, time, coach, price, remaining slots, and Reserve or Join Waitlist — never a coach rate.
