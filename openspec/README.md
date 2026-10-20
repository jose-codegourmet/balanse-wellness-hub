# Balansé feature map

OpenSpec is the first stop for product behavior. Read the capability spec below, then a matching in-flight change under `changes/`, then the linked business, screen, or backend document when implementation detail is needed. The route and API inventories below describe this checkout; a route's presence does not imply that production data or owner-supplied content is ready.

## Customer and public experience

| Feature | OpenSpec | Main surfaces |
| --- | --- | --- |
| Public site, class discovery, booking entry | [FE public screens](specs/fe-public-screens.md), [catalogue and scheduling](specs/catalogue-and-scheduling.md) | `/`, `/about`, `/contact`, `/faqs`, `/coaches`, `/classes`, `/classes/[slug]`, `/book/quick`, `/book/calendar` |
| Customer sign-in, profile, onboarding | [Identity and onboarding](specs/identity-and-onboarding.md), [FE customer screens](specs/fe-customer-screens.md) | `/login`, `/sign-up`, `/forgot-password`, `/portal/welcome`, `/portal/profile/**` |
| Booking, capacity, waitlist, requests, attendance | [Booking lifecycle](specs/booking-lifecycle.md), [FE customer screens](specs/fe-customer-screens.md) | `/portal/book/[sessionId]`, `/portal/bookings/**`, `/portal/schedule` |
| Manual payment and refund tracking | [Payments and refunds](specs/payments-and-refunds.md) | booking payment and GCash pages, admin `/payments`, `/payment-qr`, `/transactions` |
| Packages | [Session bundles](specs/session-bundles.md) | `/packages/**`, `/portal/packages/**`, admin `/bundles/**` |
| Public session/event links, sharing and roster privacy | [Public sharing and roster](specs/public-sharing-and-roster.md), [public-share-and-profile change](changes/public-share-and-profile/proposal.md) | `/sessions/**`, `/events/**`, `/share/poster/**` |

## Studio operations

| Feature | OpenSpec | Main surfaces |
| --- | --- | --- |
| Class, coach and session catalogue | [Catalogue and scheduling](specs/catalogue-and-scheduling.md), [FE admin screens](specs/fe-admin-screens.md) | `/classes/**`, `/coaches/**`, `/schedule/**` |
| Recurrence, venues and events | [Recurring schedules](specs/recurring-schedules.md), [Venues](specs/venues.md), [Events](specs/events.md) | `/schedule/duplicate`, `/schedule/[id]/recurrence`, `/venues/**`, `/events/**` |
| Coach change requests and roster | [Booking lifecycle](specs/booking-lifecycle.md), [Catalogue and scheduling](specs/catalogue-and-scheduling.md) | `/schedule/[id]/change`, `/schedule/requests`, `/sessions/[id]/roster` |
| Staff, roles and access | [Staff roles and permissions](specs/staff-roles-and-permissions.md), [Identity and onboarding](specs/identity-and-onboarding.md) | `/staff/**`, `/my-profile`, `/students/**` |
| Settings, policy forms and content | [Policies and content](specs/policies-and-content.md) | `/settings/**`, `/payment-qr`, public content pages |
| Dashboard, financial and marketing reports | [Reporting and operations](specs/reporting-and-operations.md) | `/dashboard`, `/sales`, `/transactions`, `/reports/**`, `/marketing-insights` |

## Cross-cutting system

| Feature | OpenSpec | Implementation contract |
| --- | --- | --- |
| App shells, shared UI, status language, calendar | [FE foundation](specs/fe-foundation.md), [FE shared systems](specs/fe-shared-systems.md) | `docs/ways-of-working.md`, `docs/screen-specs/shared/` |
| API, database, auth, storage, jobs, validation, Storybook | [Platform and data](specs/platform-and-data.md) | `packages/db/contracts/routes.ts`, `docs/backend/` |

## API family coverage

The exact method/path list is generated from `packages/db/contracts/routes.ts`; these groups point to the requirement that explains each family's behavior.

| API family | Capability |
| --- | --- |
| `/api/public/sessions`, `/events`, `/classes`, `/coaches`, `/content`, `/policy-forms`, `/packages` | [Catalogue and scheduling](specs/catalogue-and-scheduling.md), [public sharing and roster](specs/public-sharing-and-roster.md), [policies and content](specs/policies-and-content.md), [session bundles](specs/session-bundles.md) |
| `/api/me`, `/api/me/avatar`, `/api/me/onboarding`, `/api/me/policy-acceptances` | [Identity and onboarding](specs/identity-and-onboarding.md), [policies and content](specs/policies-and-content.md) |
| `/api/bookings`, `/api/payment-instructions` | [Booking lifecycle](specs/booking-lifecycle.md), [payments and refunds](specs/payments-and-refunds.md) |
| `/api/packages`, `/api/me/packages`, `/api/sessions/{id}/eligible-packages` | [Session bundles](specs/session-bundles.md) |
| `/api/admin/classes`, `/coaches`, `/sessions`, `/venues`, `/events`, `/class-change-requests` | [Catalogue and scheduling](specs/catalogue-and-scheduling.md), [venues](specs/venues.md), [events](specs/events.md), [recurring schedules](specs/recurring-schedules.md) |
| `/api/admin/bookings`, `/payments`, `/refunds`, `/cancellation-requests`, `/reschedule-requests`, `/sessions/{id}/roster` | [Booking lifecycle](specs/booking-lifecycle.md), [payments and refunds](specs/payments-and-refunds.md) |
| `/api/admin/bundles`, `/packages`, `/package-acquisitions` | [Session bundles](specs/session-bundles.md) |
| `/api/admin/staff`, `/roles`, `/permissions`, `/customers`, `/coach/students`, `/me` | [Staff roles and permissions](specs/staff-roles-and-permissions.md), [identity and onboarding](specs/identity-and-onboarding.md) |
| `/api/admin/settings` and its FAQ, policy and QR subroutes | [Policies and content](specs/policies-and-content.md), [payments and refunds](specs/payments-and-refunds.md) |
| `/api/admin/dashboard`, `/reports`, `/marketing-insights` | [Reporting and operations](specs/reporting-and-operations.md) |

## Change boundaries

`changes/` contains work that has its own proposal or delta while it is in flight. Read those files alongside the base capability; do not treat a proposal as proof of deployment. The newer base specs here summarize current behavior without erasing those change histories.

| Change | Status (2026-10-13) | Capabilities touched |
| --- | --- | --- |
| [wire-e03-no-more-mocks](changes/wire-e03-no-more-mocks/proposal.md) | implemented, uncommitted | base spec rewording, new capability specs, admin hydration |
| [package-payment-review](changes/package-payment-review/proposal.md) | implemented, uncommitted | session bundles, payments and refunds, FE admin/customer screens |
| [coach-staff-provisioning](changes/coach-staff-provisioning/proposal.md) | implemented, uncommitted | staff roles and permissions, catalogue, FE admin screens |
| [class-images-and-delete](changes/class-images-and-delete/proposal.md) | implemented, uncommitted | catalogue, platform and data, FE admin screens |
| [schedule-day-timeline](changes/schedule-day-timeline/proposal.md) | implemented, uncommitted | catalogue and scheduling, FE admin screens |
| [event-started-session-guard](changes/event-started-session-guard/proposal.md) | implemented, uncommitted | events |
| [customer-schedule-timetable](changes/customer-schedule-timetable/proposal.md) | implemented, uncommitted | FE public/customer screens |
| [session-price-floor-and-lock](changes/session-price-floor-and-lock/proposal.md) | implemented, uncommitted | catalogue and scheduling, FE admin screens |
| [session-early-end](changes/session-early-end/proposal.md) | proposal only | booking lifecycle, FE admin screens |
| [public-share-and-profile](changes/public-share-and-profile/proposal.md) | in flight (#343) | public sharing, identity, FE screens |
| `recurring-schedules`, `session-bundles`, `staff-roles-and-permissions*`, `be-058-session-bundles`, `fe-*` | historical waves, wired | see each proposal |

Each implemented change's `tasks.md` ends with a "Files in this change" list for splitting the working tree into commits; files marked shared belong to more than one change.

Business policy still comes from `docs/business-requirements/`, especially `21-canonical-rules.md` and `20-open-questions.md`. Do not resolve an open cancellation deadline, reschedule price rule, waiver text, or session-completion transition by inference from a screen.
