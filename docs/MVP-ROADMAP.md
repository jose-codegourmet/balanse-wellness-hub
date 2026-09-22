# Balanse Wellness Hub — MVP Execution Roadmap

> **Purpose of this document.** This is a ticket-ready execution roadmap for the Balanse MVP. Every section below is written so that a lead can copy a ticket block into the tracker with minimal rewriting. It is derived **only** from the documents already in this repository:
>
> - `docs/business-requirements/` (`README.md`, `01`–`22`, canonical rules in `21-canonical-rules.md`, reporting in `22-inventory-and-sales-reporting.md`)
> - `docs/screen-specs/` (`README.md`, `SCREEN_INDEX.md`, `public/`, `customer/`, `admin/`, `shared/`)
> - `docs/facebook-findings/` (`README.md`, `findings.md`)
>
> No new product scope is introduced. Where the business documents leave a decision **OPEN**, this roadmap records it as a deferred blocker in [Section 9](#9-deferred-open-business-questions) and points at the tickets it gates. It does **not** invent an answer.
>
> Where this roadmap makes a purely technical choice that the business docs do not cover (folder layout, which app hosts which route group, naming), the choice is labelled **Engineering decision (not a product rule)** so reviewers can tell product truth from implementation convenience.

**Document version:** 1.0 · **Last updated:** 2026-09-19

**2026-09-21 product amendment — coach assignments:** Classes are standalone catalogue entries with an optional marketing coach roster. This roster is separate from scheduled staffing: every scheduled session (including drafts) requires at least one coach and may have multiple. Customers book the scheduled class session, not a coach. Each session assignment holds an immutable compensation snapshot; retained assignments preserve it. Sessions support an optional custom name, falling back to the class name when blank. Public class pages include generated hero imagery, assigned coaches, rich-text about content, zoomable galleries, customer rates, and booking. Current marketing content and custom titles remain in the mock UI lane; no live backend wiring is added. See [class pages](screen-specs/public/10-class-pages.md) and [session coach assignments](backend/session-coach-assignments.md) for scope and rollout details.

**2026-09-22 product amendment — recurring schedules (#288):** Admin schedule automation now supports duplicating an inclusive range of up to 63 days and creating a bounded weekly series from one existing session. Generated occurrences are ordinary sessions, default to draft, skip exact class/start-time matches, and capture current coach rates as new immutable snapshots. Holiday exceptions and series-wide mutation remain future scope. See `openspec/specs/recurring-schedules.md`.

---

## Table of contents

1. [Executive summary and phase boundaries](#1-executive-summary-and-phase-boundaries)
2. [Principles and constraints](#2-principles-and-constraints)
3. [Delivery phases and dependency graph](#3-delivery-phases-and-dependency-graph)
4. [INF and BE tickets — schema, RLS, buckets, API routes](#4-inf-and-be-tickets)
5. [FE foundation tickets](#5-fe-foundation-tickets)
6. [FE screen tickets](#6-fe-screen-tickets)
7. [Assets / Higgsfield generation track](#7-assets--higgsfield-generation-track)
8. [Later phase — FE↔BE wiring (thin stubs)](#8-later-phase--febe-wiring-thin-stubs)
9. [Deferred OPEN business questions](#9-deferred-open-business-questions)
10. [Definition of done for this phase](#10-definition-of-done-for-this-phase)
11. [Appendix A — screen-spec coverage matrix](#appendix-a--screen-spec-coverage-matrix)
12. [Appendix B — ticket index](#appendix-b--ticket-index)

---

## 1. Executive summary and phase boundaries

### 1.1 What we are building

Balanse is a **calendar-first class booking system** for a Cebu wellness gym (`docs/business-requirements/01-product-context.md`). The MVP validates one loop:

> availability → account → reserve → payment intent/evidence → admin approval → check-in
> (`docs/business-requirements/02-mvp-scope.md`)

Payments are manual (GCash proof upload or Pay at Counter), reservations hold capacity for a developer-configured grace period, the waitlist is FIFO, and the admin has final confirmation authority.

### 1.2 What this phase delivers

This phase runs **two independent lanes in parallel** and deliberately does **not** connect them.

| Lane | This phase delivers | This phase does **not** deliver |
| --- | --- | --- |
| **FE** | Every screen in `docs/screen-specs/` implemented as a **mocked UI page** — real routes, real components, real states, fixture data. Built on `fe-multi-web-template` with all PawPair content stripped, using **Jabkit** as the component library. | No live API calls, no Supabase client calls from screens, no real auth session, no real uploads. |
| **BE / INF** | Supabase schema (tables, enums, constraints, indexes), RLS policies, storage buckets, scheduled jobs, reporting queries, and the **API route inventory** implemented and testable on its own (integration tests / REST client), on the existing Supabase project. | No FE consumption of those routes. No UI-driven end-to-end flows. |
| **Assets** | Higgsfield generation of **professional coach headshots** for the confirmed roster plus the public-page marketing imagery whose prompts already exist in the screen specs, delivered with an asset inventory, naming conventions, and a Storage handoff. See the dedicated track in [Section 7](#7-assets--higgsfield-generation-track). | No generated product UI (the calendar and booking UI stay coded); no invented coaches; no live Storage-backed rendering in the mocked FE. |

**Wiring FE to BE is an explicitly later phase** and appears in this document only as thin stubs ([Section 8](#8-later-phase--febe-wiring-thin-stubs)). Do not expand those stubs into build-now tickets during this phase.

**Asset generation is in scope now**, even though the FE stays mocked. Generated assets land in the repo/asset store and the manifest, are dropped into the mock pages as they are approved, and are uploaded to Supabase Storage once the bucket tickets land. Serving them *from* Storage at runtime is a wiring-phase concern.

### 1.3 Locked decisions carried into every ticket

1. **FE = mocks only.** Implement every screen listed in `docs/screen-specs/`. **Do not create new screen designs.** The screen specs are the source of truth for layout and content; where a spec is terse, build exactly what it says and stop.
2. **Stack.** The FE app is based on [`jose-codegourmet/fe-multi-web-template`](https://github.com/jose-codegourmet/fe-multi-web-template) — a pnpm workspaces + Turborepo monorepo (Next.js 16, React 19, Tailwind 4, Prisma, Supabase) shipping `apps/web` (port 9000) and `apps/admin` (port 9001). **All PawPair example content must be stripped.** [`jose-codegourmet/jabkit`](https://github.com/jose-codegourmet/jabkit) is the component library used to build pages (source-distributed registry, `jabkit init` / `jabkit add`, 214 components across `atoms`, `marketing`, `dashboard`).
3. **BE this phase.** Tickets create the Supabase schema, storage buckets, and API routes. FE↔BE wiring is a follow-on phase.
4. **Supabase project already exists — use it, do not create a new one.**

   | Field | Value |
   | --- | --- |
   | Name | Balanse Wellness Hub |
   | Project ref | `xydundrayuusqizssgby` |
   | Region | `ap-southeast-1` |
   | API URL | `https://xydundrayuusqizssgby.supabase.co` |
   | DB host | `db.xydundrayuusqizssgby.supabase.co` (Postgres 17) |
   | Verified state at time of writing | `public` schema empty, **zero** applied migrations, **zero** storage buckets |

### 1.4 Ticket count by lane

| Lane | Range | Count |
| --- | --- | --- |
| INF | `INF-001` – `INF-008` | 8 |
| BE (schema, RLS, jobs, reporting) | `BE-001` – `BE-024` | 24 |
| BE (API routes) | `BE-030` – `BE-043` | 14 |
| FE foundation | `FE-FND-001` – `FE-FND-012` | 12 |
| FE shared systems | `FE-SHR-001` – `FE-SHR-005` | 5 |
| FE public screens | `FE-PUB-001` – `FE-PUB-005` | 5 |
| FE customer screens | `FE-CUS-001` – `FE-CUS-013` | 13 |
| FE admin screens | `FE-ADM-001` – `FE-ADM-014` | 14 |
| FE shared systems (later polish; epics #179, #197) | `FE-SHR-006` – `FE-SHR-013` | 8 |
| FE admin polish (epic #197) | `FE-ADM-015` – `FE-ADM-032` | 18 |
| Assets — foundations | `ASSET-001` – `ASSET-002` | 2 |
| Assets — coach headshots | `ASSET-010` – `ASSET-015` | 6 |
| Assets — marketing imagery | `ASSET-020` – `ASSET-023` | 4 |
| Assets — Storage handoff | `ASSET-030` | 1 |
| Later-phase wiring stubs | `WIRE-001` – `WIRE-013` | 13 |
| **Total build-now tickets** | | **108** |

The **108** total is the original inventory. `FE-SHR-006`–`013` and `FE-ADM-015`–`032` are later polish (epics #179 / #197) and are **not** folded into that number. Admin work did not stop at `FE-ADM-014`.

### 1.5 Ticket format used throughout

Every ticket below carries the same fields:

```text
### <ID> — <Title>
- Lane:            FE | BE | INF | Assets
- Depends on:      <ticket IDs, or "none">
- Source docs:     <business doc paths> / <screen-spec paths>
- Scope notes:     <what to build, grounded in the source docs>
- Acceptance criteria: <testable checkboxes>
- Out of scope:    <explicit non-goals>
- Phase:           P0 | P1 | P2 | P3 | P4 | LATER
```

---

## 2. Principles and constraints

These are lifted from `docs/business-requirements/21-canonical-rules.md` (highest-level business reference per `docs/business-requirements/README.md`) and must hold in every ticket. The rule number in brackets is the canonical rule ID.

### 2.1 Product and identity

- The calendar is the primary customer entry point; guests may browse, auth is required to reserve [R1, R4, R5].
- **All** bookings go through the system, including physical walk-ins arriving via QR [R3, `04-auth-and-profile.md` §Walk-in].
- A customer books **only for themselves**; the authenticated account owner is the attendee. No "book for someone else" control may appear anywhere in the UI [R7, R8, `07-booking-form-and-waivers.md`].
- Supabase Auth with Google sign-in preferred, email/password as fallback [R6].

### 2.2 Booking, capacity, and holds

- Pricing is per session; a session may run ~1–3 hours; a customer may book multiple sessions on the same day [R15, R16, R17].
- `hold_expires_at = min(reserved_at + HOLD_DURATION, class_start_at)`; default hold is **8 hours** [R29, R30, `06-booking-rules.md`].
- New bookings and waitlist promotions stop at a cutoff before start; default **15 minutes** [R32, R33, R34].
- Hold duration and cutoff are **developer-configurable only** — they must never appear in the admin Settings UI [R31, R35, `17-developer-config.md`, `docs/screen-specs/admin/13-settings.md`].
- Capacity ordering is first-come-first-served based on **reservation creation**, not on who uploads proof first [R36, `16-edge-cases.md`].
- Waitlist is FIFO; waitlisted customers do not pay while waiting; promotion recalculates the hold from promotion time [R37, R38, R39, R40, R41].
- A cancellation **request** does not free the slot — the slot stays locked until admin completes the cancellation [R43, `10-capacity-and-waitlist.md`].

### 2.3 Payment, cancellation, refunds

- Payments are manual: GCash with uploaded proof, or Pay at Counter/Cash (no screenshot required for cash) [R22–R25].
- Payment never auto-confirms a booking; admin has final confirmation authority [R26, R13].
- Customer cancellation is a **request**, not an instant cancellation [R42, R44].
- Refunds are manual and tracked as **separate state** from booking state; no store credit, wallet, or vouchers [R45, R46, R56, `08-payment-rules.md` §No store credit].
- No-show receives no refund [R54].
- No payment gateway (PayMongo / Maya / Stripe) in MVP [R27].

### 2.4 Records, audit, notifications

- Expired / rejected / cancelled / no-show bookings stay in history — never silently removed [R55, `06-booking-rules.md`].
- Important admin actions and status changes must be auditable: what, when, who, and whether payment/refund action occurred [R57, `09-reservation-lifecycle.md` §State-history principle].
- In-app booking status is required. Email via Resend is **optional** and booking correctness must not depend on it [R58, R59, `18-notifications-and-confirmations.md`].
- Never expose raw enum names to users — use the mapping in `docs/screen-specs/shared/02-status-language.md` [R? / screen spec].

### 2.5 Financial and inventory

- Coach compensation is **internal admin-only** data and must never appear on public coach pages, the public calendar, customer booking screens, or customer confirmations [R67, R68, `03-roles-and-permissions.md` §Coach-rate privacy].
- A coach may have `defaultRate` + `rateType` (`per_session` / `per_hour`) [R69].
- Scheduled sessions must **snapshot** customer price, coach rate, and rate type; changing a coach's current rate must not rewrite historical session costs [R70, R71, `22-inventory-and-sales-reporting.md` §2].
- Class capacity is the primary sellable inventory [R72].
- Reporting must support gross sales, refunds, net sales, coach costs, and capacity/occupancy [R73].
- Waitlisted customers are **not** sales; unpaid held reservations are **not** revenue; refunded bookings stay in history [R74, R75, R76].
- Session contribution = gross session revenue − coach cost, and must **not** be labelled "profit" [R77, R78].
- Occupancy (`confirmed / capacity`) and attendance utilisation (`checked_in / capacity`) are separate measures [`22-...` §6].

### 2.6 Do-not-invent list (hard stops)

From `21-canonical-rules.md` §Do not invent [R63–R66] and `docs/screen-specs/customer/06-achievements-tbd.md`:

- Do **not** invent a cancellation deadline.
- Do **not** invent reschedule price-difference rules.
- Do **not** invent legal waiver text (placeholder document definitions are allowed in development only).
- Do **not** add automated payments, memberships, or coach self-service.
- Do **not** implement XP, badges, rewards, or scoring on the Achievements screen.
- Do **not** generate product UI (calendar/booking) as marketing imagery [`docs/screen-specs/shared/04-marketing-image-generation.md`].

### 2.7 Engineering constraints adopted for this phase

**Engineering decisions (not product rules):**

- **App split.** `apps/web` hosts both the public site and the customer portal (two route groups); `apps/admin` hosts the admin portal. Rationale: `docs/screen-specs/shared/01-navigation.md` puts "Login/Profile" in the public header and the public → booking flow must preserve the selected session through login (`docs/screen-specs/public/01-landing-page.md`, `customer/01-login.md`), which is simplest inside one app. The admin portal has a separate nav, separate login, and no public sign-up (`docs/screen-specs/admin/01-login.md`), so it stays a separate app.
- **Schema tooling.** Prisma (already in the template as `packages/db`) is the migration source of truth; Supabase is the Postgres + Auth + Storage host. Prisma schema conventions apply: both sides of every relation declared with `@relation`, `@id @default(...)`, `createdAt`/`updatedAt` on every table, `@@index` on frequently queried columns, `@unique`/`@@unique` where business uniqueness exists.
- **RLS still required.** Server-side API routes connect with a privileged role that bypasses RLS, so RLS is the defence for any direct Supabase client/Storage access. Both layers must enforce the same rules.
- **Currency and time.** Amounts are Philippine pesos (₱) as used throughout `22-inventory-and-sales-reporting.md`; session times are Cebu local time (`Asia/Manila`) per `docs/facebook-findings/findings.md` §3. Store timestamps as `timestamptz`.

---

## 3. Delivery phases and dependency graph

### 3.1 Phases

| Phase | Name | Lanes active | Exit condition |
| --- | --- | --- | --- |
| **P0** | Ground zero | INF, FE, **Assets** | Repo bootstrapped, PawPair removed, Jabkit wired, Supabase env + migration workflow proven with one no-op migration, **coach source-image intake under way via Balanse image assets dev** (it is the longest-lead asset dependency). |
| **P1** | Skeletons | INF, BE, FE, **Assets** | Core schema domains (identity, catalogue, sessions) migrated; FE route shells + mock data layer + shared systems exist and render; asset pipeline, inventory conventions, and the approved headshot look are locked. |
| **P2** | Booking engine + public surface | BE, FE, **Assets** | Booking/waitlist/payment/request schema + rules + jobs done; all 5 public screens mocked; **all coach headshots and public-page imagery generated, approved, and dropped into the mocks**. |
| **P3** | Customer surface + API | BE, FE | Customer-facing API routes implemented and testable; all 13 customer screens mocked. |
| **P4** | Admin surface + reporting | BE, FE, **Assets** | Admin API routes + reporting queries done; all 14 admin screens mocked; storage buckets and RLS suite complete; **approved assets uploaded into `coach-photos` and `marketing-assets`**. |
| **LATER** | Wiring | FE + BE together | Out of scope for this phase — see [Section 8](#8-later-phase--febe-wiring-thin-stubs). |

FE and BE lanes are independent within P1–P4; the only cross-lane dependency in this phase is **shared vocabulary** (status names, field names, money/date formats) so that wiring later is mechanical. That vocabulary is owned by `BE-001` (enums) and consumed by `FE-FND-005` (mock domain types) and `FE-SHR-002` (status language).

### 3.2 Dependency graph

```text
P0 ──────────────────────────────────────────────────────────────────────────
  INF-001 Supabase baseline ──► INF-002 env/connection ──► INF-003 migration workflow
                                  │                            │
                                  └──► INF-005 Auth config     └──► BE-001 enums+conventions
  FE-FND-001 bootstrap ──► FE-FND-002 strip PawPair ──► FE-FND-003 Jabkit ──► FE-FND-004 brand tokens
  ASSET-010 coach source intake via Balanse image assets dev (in progress)      │
P1 ──────────────────────────────────────────────────────────────────────────  │
  BE-001 ──┬─► BE-002 profiles ──► BE-003 staff/roles                          │
           ├─► BE-004 coaches ──► BE-005 classes ──► BE-006 sessions(+snapshot)│
           └─► BE-007 policy docs                                              │
  INF-004 buckets ──► BE-021 storage RLS                                       │
  FE-FND-004 ──┬─► FE-FND-005 mock data layer ──► FE-FND-006 mock session/role switch
               ├─► FE-FND-007 public shell     │
               ├─► FE-FND-008 customer shell   ├─► FE-SHR-001 navigation
               ├─► FE-FND-009 admin shell      ├─► FE-SHR-002 status language
               ├─► FE-FND-010 mock upload      ├─► FE-SHR-003 empty/error states
               ├─► FE-FND-011 quality gate     ├─► FE-SHR-005 responsive calendar
               └─► FE-FND-012 format utils     
  FE-FND-004 ──► ASSET-001 Higgsfield pipeline ──► ASSET-002 inventory+naming
  ASSET-001 + ASSET-010 ──► ASSET-011 headshot look lockup (pilot approval)

P2 ──────────────────────────────────────────────────────────────────────────
  BE-006 ──┬─► BE-008 bookings ──┬─► BE-009 policy acceptance
           │                      ├─► BE-010 payments ──► BE-011 refunds
           │                      ├─► BE-012 waitlist
           │                      ├─► BE-013 cancellation requests
           │                      ├─► BE-014 reschedule requests
           │                      ├─► BE-015 check-in/attendance
           │                      └─► BE-016 audit log
           └─► BE-017 capacity integrity ──► BE-018 expiry+promotion jobs
  BE-019 developer config ──► BE-017/BE-018
  BE-020 RLS suite (needs BE-002..BE-016)
  FE-SHR-005 + FE-FND-007 ──► FE-PUB-001..005
  ASSET-010 source photos ──► ASSET-012 roster headshots (source-driven) ──┐
  ASSET-011 recipe ─────────► ASSET-012 ──► ASSET-013 post-processing ─────┤
  ASSET-010 ──► ASSET-014 placeholder avatar (the no-source path)          ├─► FE-SHR-004
  ASSET-012 ──► ASSET-015 coaches group hero + specialty accents           │
  ASSET-001/002 ──► ASSET-020 landing · ASSET-021 about · ASSET-022 contact · ASSET-023 faq ──┘

P3 ──────────────────────────────────────────────────────────────────────────
  BE-022 reporting queries (needs BE-010, BE-011, BE-015)
  BE-023 seed data (needs BE-004..BE-006)
  BE-030 public API ──► BE-031 auth/profile API ──► BE-032 booking API
  BE-033 payment API ──► BE-034 cancellation API ──► BE-035 reschedule API
  FE-FND-008 + FE-SHR-* ──► FE-CUS-001..013

P4 ──────────────────────────────────────────────────────────────────────────
  BE-036..BE-043 admin APIs (+ reports API needs BE-022)
  BE-024 API contract pack (OpenAPI-ish reference for the wiring phase)
  FE-FND-009 + FE-SHR-* ──► FE-ADM-001..014
  INF-004 + BE-021 + ASSET-013/020..023 ──► ASSET-030 Storage handoff

LATER ───────────────────────────────────────────────────────────────────────
  WIRE-001..012 (thin stubs only)
```

### 3.3 Critical path

`INF-001 → INF-002 → INF-003 → BE-001 → BE-006 → BE-008 → BE-017 → BE-018 → BE-032` is the BE critical path (everything about capacity correctness sits behind it).

`FE-FND-001 → FE-FND-002 → FE-FND-003 → FE-FND-005 → FE-SHR-005 → FE-CUS-007` is the FE critical path (the calendar is the product's hero and is reused by public and customer surfaces).

`ASSET-010 → ASSET-011 → ASSET-012 → ASSET-013 → ASSET-030` is the Assets critical path — source intake, then recipe, then generation, then delivery crops, then Storage. `ASSET-010` is already under way (Jose is uploading coach photos through Balanse image assets dev) and should stay the lane's first priority: the screen specs forbid generating a coach portrait without a valid source image, so each coach's headshot starts only once their photo has landed. The sub-track is designed to run in waves rather than waiting for the last upload.

### 3.4 Blocked-by-business items

Tickets gated on an OPEN business question are marked **⛔ BLOCKED-BY-OQ-n** in their scope notes and must ship the surrounding workflow with the undecided rule left configurable/absent, never guessed. See [Section 9](#9-deferred-open-business-questions).

---

## 4. INF and BE tickets

### 4.1 Schema domain overview

Eleven schema domains cover the whole business model. Every domain maps to explicit business rules; nothing here exists without a source.

| # | Domain | Core tables | Primary source |
| --- | --- | --- | --- |
| D1 | Identity & profile | `profiles` | `04-auth-and-profile.md` |
| D2 | Staff & roles | `staff_members` | `03-roles-and-permissions.md`, `admin/03-staff-management.md` |
| D3 | Coaches | `coaches` (public fields + internal rate) | `05-class-and-schedule-rules.md` §Coach compensation, `admin/07-coach-management.md` |
| D4 | Class catalogue | `classes` | `05-class-and-schedule-rules.md`, `admin/06-class-management.md` |
| D5 | Scheduled sessions | `sessions` (+ financial snapshot) | `05-class-and-schedule-rules.md` §Session financial snapshot, `22-...` §2 |
| D6 | Policies & waivers | `policy_documents`, `policy_document_versions` | `07-booking-form-and-waivers.md` |
| D7 | Bookings | `bookings`, `booking_policy_acceptances` | `06-booking-rules.md`, `09-reservation-lifecycle.md` |
| D8 | Payments & refunds | `payments`, `refunds` | `08-payment-rules.md`, `11-cancellations-and-refunds.md` |
| D9 | Waitlist | `waitlist_entries` | `10-capacity-and-waitlist.md` |
| D10 | Requests | `cancellation_requests`, `reschedule_requests` | `11-...`, `12-rescheduling.md` |
| D11 | Attendance & audit | attendance columns on `bookings`, `audit_events` | `13-check-in-attendance-and-no-show.md`, `09-...` §State-history |

Plus configuration (`BE-019`), reporting (`BE-022`), and site/content settings (`BE-043`, from `admin/13-settings.md`).

### 4.2 Storage buckets

Three buckets, all created in `INF-004` and secured in `BE-021`:

| Bucket | Visibility | Contents | Source |
| --- | --- | --- | --- |
| `payment-proofs` | **Private** | GCash proof-of-payment uploads, one or more per booking | `08-payment-rules.md` §GCash, `customer/10-gcash-proof-upload.md`, `admin/09-payment-review.md` |
| `coach-photos` | Public read | One primary coach profile photo per coach | `admin/07-coach-management.md` §Profile photo management, `public/05-coaches.md` §Coach image source |
| `marketing-assets` | Public read | Generated public-page imagery + GCash QR image used in Settings | `shared/04-marketing-image-generation.md`, `admin/13-settings.md` §Payment info |

### 4.3 API route inventory (mapped to business flows)

| Route group | Routes | Business flow |
| --- | --- | --- |
| `BE-030` Public catalogue | `GET /api/public/sessions`, `GET /api/public/sessions/:id`, `GET /api/public/coaches`, `GET /api/public/classes`, `GET /api/public/content` | Flow A guest browse (`14-customer-flows.md`) |
| `BE-031` Auth & profile | `GET/PATCH /api/me`, `GET /api/me/policy-acceptances` | `04-auth-and-profile.md` |
| `BE-032` Booking | `POST /api/bookings`, `GET /api/bookings`, `GET /api/bookings/:id`, `POST /api/bookings/:id/waitlist` | Flows B, E, F |
| `BE-033` Payment | `POST /api/bookings/:id/payment-method`, `POST /api/bookings/:id/payment-proof`, `GET /api/payment-instructions` | Flows C, D |
| `BE-034` Cancellation | `POST /api/bookings/:id/cancellation-request` | Flow G |
| `BE-035` Reschedule | `POST /api/bookings/:id/reschedule-request` | Flow H |
| `BE-036` Admin bookings | `GET /api/admin/bookings`, `POST /api/admin/bookings/:id/confirm`, `/reject` | Admin Flow B |
| `BE-037` Admin payments & refunds | `GET /api/admin/payments`, `POST /api/admin/payments/:id/record-cash`, `POST /api/admin/refunds/:id/mark-pending`, `/mark-refunded`, `GET /api/admin/payment-proofs/:id/signed-url` | Admin Flows B, C, E |
| `BE-038` Admin catalogue | CRUD for `/api/admin/classes`, `/api/admin/coaches`, `/api/admin/sessions`, `POST /api/admin/sessions/:id/cancel` | Admin Flows A, F, I |
| `BE-039` Admin requests | `GET/POST /api/admin/cancellation-requests/*`, `/reschedule-requests/*` | Admin Flows E, G |
| `BE-040` Admin roster | `GET /api/admin/sessions/:id/roster`, `POST .../check-in`, `POST .../no-show` | Admin Flow H |
| `BE-041` Admin reports | `GET /api/admin/reports/sales`, `/class-performance`, `/coach-costs`, `/sessions`, `/sessions/:id` | Admin reporting flow |
| `BE-042` Admin staff & customers | `GET/POST/PATCH /api/admin/staff`, `GET /api/admin/customers`, `GET /api/admin/customers/:id` | `admin/03`, `admin/04` |
| `BE-043` Admin settings & content | `GET/PUT /api/admin/settings`, `/api/admin/policies` | `admin/13-settings.md` |
| `BE-055` Staff/coach unification | `POST/DELETE /api/admin/staff/:id/coach`; `isCoach`/`coachId`/`staffId` | `admin/03`, `admin/07` |
| `BE-056` Payment QR collection | `/api/admin/settings/payment-qrs` (+ legacy `/settings/qr`) | `admin/13-settings.md` |

---

### 4.4 INF tickets

#### INF-001 — Adopt the existing Supabase project as the MVP backend of record

- **Lane:** INF
- **Depends on:** none
- **Source docs:** `docs/business-requirements/04-auth-and-profile.md`, `docs/business-requirements/21-canonical-rules.md` [R6]
- **Scope notes:** Register the existing project (`Balanse Wellness Hub`, ref `xydundrayuusqizssgby`, region `ap-southeast-1`, API `https://xydundrayuusqizssgby.supabase.co`) as the single backend for the MVP. Verified starting state: empty `public` schema, no migrations, no storage buckets. Document project ref, org, DB host, Postgres major version, and who holds owner access. Decide and document the environment strategy (at minimum: local dev + this shared project; optionally Supabase branches for PR previews).
- **Acceptance criteria:**
  - [ ] A `docs/backend/supabase-project.md` (or equivalent) records ref, region, API URL, DB host, Postgres version, and access owners.
  - [ ] No new Supabase project is created.
  - [ ] Team members can authenticate against the project with least-privilege credentials (no shared service-role key in chat/commits).
  - [ ] The environment strategy (single shared project vs. branches) is written down with the rationale.
- **Out of scope:** Creating tables; auth provider configuration (`INF-005`); buckets (`INF-004`).
- **Phase:** P0

#### INF-002 — Environment variables and connection wiring

- **Lane:** INF
- **Depends on:** INF-001
- **Source docs:** `docs/business-requirements/17-developer-config.md`; template README env table
- **Scope notes:** Wire the template's env contract to the Balanse project: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL` (pooled, port 6543, `?pgbouncer=true`), `DIRECT_URL` (direct, port 5432). Populate `.env.example`, `packages/db/.env.example`, `apps/web/.env.example`, `apps/admin/.env.example` with placeholders only. Add an env-var reference doc listing which workspace reads which variable.
- **Acceptance criteria:**
  - [ ] `pnpm --filter @fe-template/db db:generate` (renamed package name acceptable) succeeds from a clean checkout after copying the example env files.
  - [ ] A connection smoke script proves both pooled and direct URLs reach the Balanse database.
  - [ ] No real keys are committed; `*.env.example` contain placeholders only.
  - [ ] Env reference doc lists every variable, its consumer workspace, and whether it is public.
- **Out of scope:** Secrets rotation policy; production hosting config (`INF-008`).
- **Phase:** P0

#### INF-003 — Migration workflow, naming, and safety conventions

- **Lane:** INF
- **Depends on:** INF-002
- **Source docs:** `docs/business-requirements/21-canonical-rules.md` [R55, R57, R71, R76]
- **Scope notes:** Establish how schema changes ship: Prisma schema files under `packages/db/prisma/schema/*.prisma` split per domain, `prisma migrate dev` locally, `prisma migrate deploy` for the shared project, migration naming convention, and a review checklist. Codify the **expand → migrate → contract** rule for any change touching historical financial data, because history must never be rewritten [R71, R76]. Prove the loop end-to-end with one trivial migration (e.g. an `app_meta` table holding schema version) and then confirm `list_migrations` reports it.
- **Acceptance criteria:**
  - [ ] Documented commands for create / apply / inspect / roll-forward, plus what to do when a migration fails mid-apply.
  - [ ] Migration naming convention documented and applied to the first migration.
  - [ ] Review checklist includes: destructive-change flag, index review, RLS impact, and "does this rewrite history?".
  - [ ] One migration is successfully applied to `xydundrayuusqizssgby` and visible in the migrations list.
  - [ ] Prisma schema conventions are written into the repo contributor docs: both sides of relations declared, `@id @default(...)`, `createdAt`/`updatedAt` on every model, `@@index` for frequently queried fields, `@unique`/`@@unique` for business-unique fields.
- **Out of scope:** Any business tables (`BE-002`+).
- **Phase:** P0

#### INF-004 — Create storage buckets

- **Lane:** INF
- **Depends on:** INF-001
- **Source docs:** `docs/business-requirements/08-payment-rules.md`; `docs/screen-specs/customer/10-gcash-proof-upload.md`; `docs/screen-specs/admin/07-coach-management.md`; `docs/screen-specs/admin/09-payment-review.md`; `docs/screen-specs/shared/04-marketing-image-generation.md`
- **Scope notes:** Create the three buckets in [§4.2](#42-storage-buckets). `payment-proofs` is **private** — proofs are customer financial evidence and are only readable by the owning customer and admins, via signed URLs. `coach-photos` and `marketing-assets` are public-read, admin-write. Define object key conventions (`payment-proofs/{booking_id}/{uuid}.{ext}`, `coach-photos/{coach_id}/{uuid}.{ext}`, `marketing-assets/{page}/{slug}.{ext}`), per-bucket MIME allowlists (images only for proofs/photos), and size limits.
- **Acceptance criteria:**
  - [ ] All three buckets exist on project `xydundrayuusqizssgby` with the stated visibility.
  - [ ] Key conventions, MIME allowlists, and size limits are documented and enforced at bucket config where supported.
  - [ ] An unauthenticated request for a `payment-proofs` object is rejected.
  - [ ] An unauthenticated request for a `coach-photos` object succeeds (public read).
  - [ ] Bucket creation is reproducible (script or migration), not a one-off console click.
- **Out of scope:** Storage RLS policies (`BE-021`); upload endpoints (`BE-033`, `BE-038`).
- **Phase:** P1

#### INF-005 — Configure Supabase Auth (Google + email/password) and admin access model

- **Lane:** INF
- **Depends on:** INF-001
- **Source docs:** `docs/business-requirements/04-auth-and-profile.md`; `21-canonical-rules.md` [R5, R6]; `docs/screen-specs/customer/01-login.md`, `customer/02-sign-up.md`, `customer/03-forgot-password.md`, `admin/01-login.md`
- **Scope notes:** Enable Google OAuth and email/password providers. Configure redirect URLs for local (`:9000`, `:9001`) and deployed origins. Configure the password-reset email/redirect used by `customer/03-forgot-password.md`. Admin portal has **no public sign-up and no forgot-password page** (`admin/01-login.md`) — document how an admin account is provisioned instead (invite/manual creation by an existing admin).
- **Acceptance criteria:**
  - [ ] Google sign-in and email/password both succeed against the project from a scratch test client.
  - [ ] Password-reset link delivery and redirect are verified for the customer flow.
  - [ ] Admin provisioning path is documented; no self-serve admin sign-up route exists.
  - [ ] Redirect URL allowlist covers local and deployed origins for both apps.
- **Out of scope:** FE auth screens (mocks only this phase); role assignment in the database (`BE-003`).
- **Phase:** P1

#### INF-006 — Secrets management and environment matrix

- **Lane:** INF
- **Depends on:** INF-002
- **Source docs:** `docs/business-requirements/03-roles-and-permissions.md` §Coach-rate privacy; `21-canonical-rules.md` [R67, R68]
- **Scope notes:** Define where each secret lives (local `.env*`, CI secret store, hosting provider) and who can read it. Service-role keys must never reach a browser bundle; note explicitly that admin-only financial data (coach rates, coach costs) is protected by server-side authorisation, so any leak of a privileged key is a privacy incident, not just a security one.
- **Acceptance criteria:**
  - [ ] Matrix of secret × environment × owner × rotation trigger exists.
  - [ ] A CI or pre-commit check fails the build if a service-role key pattern appears in committed files or in `NEXT_PUBLIC_*` variables.
  - [ ] Rotation runbook documented.
- **Out of scope:** Penetration testing; formal security audit.
- **Phase:** P1

#### INF-007 — CI pipeline for the monorepo

- **Lane:** INF
- **Depends on:** FE-FND-001, INF-003
- **Source docs:** template README (root scripts: `lint`, `typecheck`, `build`, `db:generate`)
- **Scope notes:** CI runs on every PR: install, `db:generate`, `typecheck`, `lint` (Biome + per-app ESLint), `build` for both apps, and Storybook build. Add a job that runs the BE integration test suite against a disposable database once `BE-001` lands. Enforce Conventional Commits (the template already ships commitlint/Husky).
- **Acceptance criteria:**
  - [ ] A PR with a type error fails CI.
  - [ ] A PR with a lint error fails CI.
  - [ ] Both apps build in CI from a clean cache.
  - [ ] CI duration and caching strategy documented.
- **Out of scope:** Deployment (`INF-008`).
- **Phase:** P1

#### INF-008 — Preview and staging deployment

- **Lane:** INF
- **Depends on:** INF-007
- **Source docs:** delivery infrastructure — **not** a product requirement; supports reviewing mocked screens with the client
- **Scope notes:** Deploy `apps/web` and `apps/admin` to per-PR preview URLs so Coach Rex can review mocked screens without a local setup. Previews run in mock mode with no backend credentials. Protect the admin preview behind access control.
- **Acceptance criteria:**
  - [ ] Every PR produces reachable preview URLs for both apps.
  - [ ] Preview builds contain no Supabase service credentials.
  - [ ] Admin preview is not publicly indexable and is access-protected.
- **Out of scope:** Production domain, DNS, and go-live (post-wiring).
- **Phase:** P1

---

### 4.5 BE tickets — schema, rules, jobs, reporting

#### BE-001 — Enum vocabulary and shared schema conventions

- **Lane:** BE
- **Depends on:** INF-003
- **Source docs:** `docs/business-requirements/09-reservation-lifecycle.md`; `docs/screen-specs/shared/02-status-language.md`; `22-inventory-and-sales-reporting.md` §1
- **Scope notes:** Define the shared vocabulary every other ticket uses. Business meaning must be preserved even if names differ (`09-reservation-lifecycle.md` explicitly allows naming freedom). Required enums:
  - `booking_status`: `WAITLISTED`, `HELD_AWAITING_PAYMENT`, `PAYMENT_SUBMITTED`, `CONFIRMED`, `CANCELLATION_REQUESTED`, `RESCHEDULE_REQUESTED`, `CANCELLED`, `REJECTED`, `EXPIRED`, `CHECKED_IN`, `COMPLETED`, `NO_SHOW`.
  - `payment_method`: `GCASH`, `PAY_AT_COUNTER`.
  - `payment_status`: at minimum `NONE`, `PROOF_SUBMITTED`, `CASH_RECEIVED`, `VERIFIED`, `REJECTED` — kept **distinct from booking status** (`admin/09-payment-review.md`: "Keep payment state and booking state distinct enough to preserve accurate history").
  - `refund_status`: `NOT_APPLICABLE`, `REFUND_PENDING`, `REFUNDED`.
  - `coach_rate_type`: `PER_SESSION`, `PER_HOUR`.
  - `session_status`: `DRAFT`, `PUBLISHED`, `CANCELLED` (from `admin/05-schedule-management.md` publish/bookable state + `05-class-and-schedule-rules.md` §Class cancellation).
  - `staff_role`: `ADMIN` (+ any additional role only if `admin/03-staff-management.md` review confirms one is needed).
  - `COMPLETED` is listed as optional in `09-reservation-lifecycle.md` and is **⛔ BLOCKED-BY-OQ-10** for behaviour; define the enum value, ship no transition into it until answered.
- **Acceptance criteria:**
  - [ ] All enums exist in the Prisma schema and in the database.
  - [ ] A single exported TypeScript module re-exports these enums for app code.
  - [ ] Every enum value maps 1:1 to a row in `docs/screen-specs/shared/02-status-language.md` (or is documented as an internal-only value with a rationale).
  - [ ] Schema conventions doc from `INF-003` is applied: every model gets `id`, `createdAt`, `updatedAt`.
  - [ ] No enum value invents a business state that is absent from the business docs.
- **Out of scope:** Tables using the enums.
- **Phase:** P1

#### BE-002 — `profiles` (customer identity)

- **Lane:** BE
- **Depends on:** BE-001, INF-005
- **Source docs:** `docs/business-requirements/04-auth-and-profile.md`; `docs/screen-specs/customer/02-sign-up.md`, `customer/05-profile.md`
- **Scope notes:** One profile row per `auth.users` record, holding the reusable personal details the booking form prefills. Confirmed-safe fields from the specs: full name, email, contact number. **⛔ BLOCKED-BY-OQ-3** — the exact required field list (date of birth, emergency contact, health declarations) is undecided; `04-auth-and-profile.md` says "Do not add sensitive fields unless the business genuinely requires them". Ship the three confirmed fields plus a documented extension point; do **not** add health or emergency-contact columns yet.
- **Acceptance criteria:**
  - [ ] `profiles` table exists with a 1:1 FK to the Supabase auth user id, and both relation sides declared in Prisma.
  - [ ] Fields: full name, email, contact number, timestamps.
  - [ ] Profile is created on first sign-in (trigger or application-level upsert) and the mechanism is documented.
  - [ ] Unique constraint on the auth user id; index on email.
  - [ ] No sensitive field (DOB, health, emergency contact) is added; a comment/ADR records that these await OQ-3.
- **Out of scope:** Profile editing API (`BE-031`); admin customer views (`BE-042`).
- **Phase:** P1

#### BE-003 — `staff_members` and the admin authorisation model

- **Lane:** BE
- **Depends on:** BE-002
- **Source docs:** `docs/business-requirements/03-roles-and-permissions.md`; `docs/screen-specs/admin/03-staff-management.md`
- **Scope notes:** Admins are Coach Rex and his wife [R60]. Model staff as rows linked to auth users with `role` and `status` (active/disabled — the spec has a `[Disable Access]` action). Provide a reusable authorisation helper (`is_admin(auth.uid())` SQL function + server-side equivalent) used by every admin RLS policy and admin route. `admin/03-staff-management.md` requires that only authorised admins can reach coach rates, sales reports, refund totals, coach-cost reports, and capacity reporting — the helper is the single gate for that.
- **Acceptance criteria:**
  - [ ] `staff_members` table with name, email, role, status, timestamps, unique auth-user link.
  - [ ] SQL `is_admin()` helper is `SECURITY DEFINER`, stable, and unit-tested for active vs disabled staff.
  - [ ] Disabling a staff member immediately removes admin access on the next request.
  - [ ] No public registration path can create a staff row.
  - [ ] Financial-privacy note recorded on the table: rate/report access derives from this role.
- **Out of scope:** Staff management API (`BE-042`); FE staff screens (`FE-ADM-003`).
- **Phase:** P1

#### BE-004 — `coaches` (public profile + internal rate)

- **Lane:** BE
- **Depends on:** BE-001, INF-004
- **Source docs:** `docs/business-requirements/05-class-and-schedule-rules.md` §Coach compensation; `22-inventory-and-sales-reporting.md` §1; `docs/screen-specs/admin/07-coach-management.md`; `docs/screen-specs/public/05-coaches.md`
- **Scope notes:** Public columns: name, specialty/classes, short bio, photo object key, active/inactive. Internal columns: `default_rate` (decimal), `rate_type` (`coach_rate_type`). Photo rules from the spec: one primary photo per coach, replaceable without duplicate active photos, removable, with a deliberate fallback state when absent. Column-level privacy must be structural, not cosmetic: create a **public projection view** (`coaches_public`) that omits rate columns so public queries cannot accidentally leak them [R67, R68].
- **Acceptance criteria:**
  - [ ] `coaches` table with the public and internal columns above, timestamps, index on `active`.
  - [ ] `coaches_public` view exposes only name, specialty, bio, photo key, active.
  - [ ] Rate columns are unreachable for anon/customer roles (verified by a negative test).
  - [ ] At most one active photo key per coach is enforceable (single column, not a collection).
  - [ ] Rate type constrained to the `coach_rate_type` enum.
- **Out of scope:** Coach CRUD API (`BE-038`); rate change history (see `BE-006` snapshot rule).
- **Phase:** P1

#### BE-005 — `classes` (class catalogue)

- **Lane:** BE
- **Depends on:** BE-001
- **Source docs:** `docs/business-requirements/05-class-and-schedule-rules.md` §Class vs scheduled session; `docs/screen-specs/admin/06-class-management.md`
- **Scope notes:** Fields per the admin spec: name, short description, optional default duration, optional default customer price, active/inactive, optional associated coaches. Session-level price/capacity override class defaults. **Do not** store coach compensation on the class (`admin/06-class-management.md`: "Do not store coach compensation as public class information").
- **Acceptance criteria:**
  - [ ] `classes` table with the fields above and timestamps.
  - [ ] Optional many-to-many `classes ↔ coaches` association with both relation sides declared.
  - [ ] Unique constraint on class name (or documented reason not to).
  - [ ] No compensation column exists on `classes`.
  - [ ] Index on `active`.
- **Out of scope:** Class CRUD API (`BE-038`).
- **Phase:** P1

#### BE-006 — `sessions` (scheduled sessions with financial snapshot)

- **Lane:** BE
- **Depends on:** BE-004, BE-005
- **Source docs:** `docs/business-requirements/05-class-and-schedule-rules.md`; `22-inventory-and-sales-reporting.md` §2; `docs/screen-specs/admin/05-schedule-management.md`
- **Scope notes:** The central inventory table. Columns: class FK, coach FK (nullable — a session "may be assigned to a coach"), `starts_at`/`ends_at` (`timestamptz`), `capacity`, `status` (`session_status`), and the **financial snapshot**: `customer_price`, `coach_rate`, `coach_rate_type`. Snapshot values are copied at creation and are never recomputed from the coach's current rate [R70, R71]. Sessions may last ~1–3 hours [R16]. Cancelling a session must preserve history [`05-...` §Class cancellation].
- **Acceptance criteria:**
  - [ ] Table exists with all columns above; money columns are exact decimals, not floats.
  - [ ] Snapshot columns populate from the coach's current rate at creation but are independently editable and never back-written by a later coach-rate change (regression test: change coach rate, assert old session cost unchanged).
  - [ ] `ends_at > starts_at` and `capacity > 0` enforced by check constraints.
  - [ ] Indexes on `starts_at`, `(status, starts_at)`, `class_id`, `coach_id`.
  - [ ] Both sides of `class`, `coach` relations declared in Prisma.
  - [ ] Cancelling a session sets `status = CANCELLED` and never deletes the row.
- **Out of scope:** Recurring generation (future scope, `05-...` §Recurring schedules); capacity arithmetic (`BE-017`).
- **Phase:** P1

#### BE-007 — `policy_documents` and versioned content

- **Lane:** BE
- **Depends on:** BE-001
- **Source docs:** `docs/business-requirements/07-booking-form-and-waivers.md`; `21-canonical-rules.md` [R11, R12, R13, R65]; `docs/screen-specs/admin/13-settings.md` §Policies/waivers
- **Scope notes:** Model documents (waiver, gym policy, participation rules) and immutable versions (`version`, `title`, `body`, `effective_from`, `is_current`). **Do not invent legal waiver text** [R65]; seed clearly-labelled placeholder content for development only, pending Coach Rex's production text (**⛔ BLOCKED-BY-OQ-4**). Old bookings must keep pointing at the version they accepted [`16-edge-cases.md` §Policy changes].
- **Acceptance criteria:**
  - [ ] `policy_documents` + `policy_document_versions` with both relation sides declared.
  - [ ] Version rows are immutable once referenced by an acceptance (enforced by trigger or documented process).
  - [ ] Exactly one current version per document is enforceable.
  - [ ] Placeholder seed content is unmistakably marked as placeholder (e.g. a `is_placeholder` flag, and body text that says so).
  - [ ] Unique constraint on `(document_id, version)`.
- **Out of scope:** Re-acceptance cadence (**⛔ OQ-5**); actual legal text.
- **Phase:** P1

#### BE-008 — `bookings` (core reservation record)

- **Lane:** BE
- **Depends on:** BE-002, BE-006, BE-019
- **Source docs:** `docs/business-requirements/06-booking-rules.md`; `09-reservation-lifecycle.md`; `docs/screen-specs/customer/11-booking-detail.md`
- **Scope notes:** One row per (authenticated customer × scheduled session) reservation. Columns: profile FK, session FK, `status` (`booking_status`), `reserved_at`, `hold_expires_at`, `booking_reference`, `payment_method`, and attendance columns owned by `BE-015`. `hold_expires_at = min(reserved_at + HOLD_DURATION, session.starts_at)` computed at creation and re-computed on waitlist promotion [R29, R30, R40]. Rows are never deleted [R55]. **⛔ Partially BLOCKED-BY-OQ-9** — the booking reference format (human-readable code vs QR vs in-app only) is undecided; generate an opaque, collision-resistant reference now and treat its presentation as a later decision.
- **Acceptance criteria:**
  - [ ] Table exists with the columns above; `booking_reference` is unique.
  - [ ] `hold_expires_at` never exceeds `session.starts_at` (check constraint or trigger + test).
  - [ ] A customer cannot hold two *active* main-list bookings for the same session (partial unique index over active statuses) while still being able to book multiple **different** sessions the same day [R17].
  - [ ] Deleting a booking row is impossible through application paths; tests assert history retention for `EXPIRED`, `REJECTED`, `CANCELLED`, `NO_SHOW`.
  - [ ] Indexes on `(session_id, status)`, `(profile_id, status)`, `hold_expires_at`.
  - [ ] Every status transition performed through a single documented transition function, not ad-hoc updates.
- **Out of scope:** Eligibility/cutoff enforcement (`BE-017`); expiry job (`BE-018`); API (`BE-032`).
- **Phase:** P2

#### BE-009 — `booking_policy_acceptances`

- **Lane:** BE
- **Depends on:** BE-007, BE-008
- **Source docs:** `docs/business-requirements/07-booking-form-and-waivers.md` §Version tracking; `docs/screen-specs/customer/08-booking-form.md`, `customer/05-profile.md` §Policy/waiver history, `admin/04-customer-management.md`
- **Scope notes:** Record document id, version, acceptance timestamp, and booking/customer association — exactly the four items the business doc lists. Both the customer profile screen and admin customer detail display accepted versions, so the query shape must support "list acceptances by customer".
- **Acceptance criteria:**
  - [ ] Table with FKs to booking, profile, and policy version; acceptance timestamp; both relation sides declared.
  - [ ] Unique constraint on `(booking_id, policy_version_id)`.
  - [ ] Acceptance rows are append-only (no update path).
  - [ ] A booking cannot leave `HELD_AWAITING_PAYMENT` without acceptance rows for all currently-required documents (enforced in the booking creation transaction).
  - [ ] Index supporting per-customer acceptance history.
- **Out of scope:** Re-acceptance rule (**⛔ OQ-5**).
- **Phase:** P2

#### BE-010 — `payments`

- **Lane:** BE
- **Depends on:** BE-008, INF-004
- **Source docs:** `docs/business-requirements/08-payment-rules.md`; `docs/screen-specs/customer/09-payment-method.md`, `customer/10-gcash-proof-upload.md`, `admin/09-payment-review.md`
- **Scope notes:** Payment state must stay distinct from booking state (`admin/09-payment-review.md`). Columns: booking FK, `method` (`payment_method`), `status` (`payment_status`), `amount`, proof object key (nullable — cash needs no screenshot [R25]), submitted-at, reviewed-by (staff FK), reviewed-at, admin note. **⛔ BLOCKED-BY-OQ-8** — whether a reference number, amount, and payer name are *required* with a GCash proof is undecided; model them as **optional** columns and do not enforce them.
- **Acceptance criteria:**
  - [ ] Table exists with the columns above; `amount` is an exact decimal.
  - [ ] GCash payments require a proof object key before reaching `PROOF_SUBMITTED`; cash payments never require one.
  - [ ] Reviewer identity and timestamp are recorded on verify/reject.
  - [ ] Optional reference-number / payer-name columns exist but are nullable and unenforced (OQ-8).
  - [ ] Index on `(status, created_at)` for the admin pending queue.
  - [ ] A payment row can exist in a non-verified state while the booking is still `HELD_AWAITING_PAYMENT` (state independence test).
- **Out of scope:** Automated verification (explicitly out of scope, `02-mvp-scope.md`); refunds (`BE-011`).
- **Phase:** P2

#### BE-011 — `refunds` (manual refund state tracking)

- **Lane:** BE
- **Depends on:** BE-010
- **Source docs:** `docs/business-requirements/11-cancellations-and-refunds.md`; `08-payment-rules.md` §Refunds; `21-canonical-rules.md` [R45, R46, R56, R76]; `docs/screen-specs/admin/10-cancellation-requests.md`
- **Scope notes:** Refund is a separate concept from cancellation [`09-reservation-lifecycle.md`: booking `CANCELLED` + refund `REFUND_PENDING`, later `REFUNDED`]. Columns: booking FK, payment FK, `status` (`refund_status`), amount, marked-pending-by/at, marked-refunded-by/at, note. Money moves **outside** the app — this table only records state. No store credit, wallet, or voucher concept may exist [R46].
- **Acceptance criteria:**
  - [ ] Table exists; refund status transitions are `NOT_APPLICABLE → REFUND_PENDING → REFUNDED` only, with actor and timestamp recorded for each.
  - [ ] A booking can be `CANCELLED` while its refund is still `REFUND_PENDING` (test).
  - [ ] Refunded bookings remain queryable in history and contribute to refund totals [R76].
  - [ ] No credit/wallet/voucher table or column is introduced.
  - [ ] Index on `(status, created_at)`.
- **Out of scope:** Refund eligibility policy (**⛔ OQ-1**) — eligibility stays an admin decision.
- **Phase:** P2

#### BE-012 — `waitlist_entries` (FIFO)

- **Lane:** BE
- **Depends on:** BE-008
- **Source docs:** `docs/business-requirements/10-capacity-and-waitlist.md`; `21-canonical-rules.md` [R36–R41]; `docs/screen-specs/admin/12-session-roster-check-in.md`
- **Scope notes:** Waitlist entries do not consume main capacity and require no payment [R38]. FIFO ordering must be durable and gap-tolerant (use `joined_at` plus a monotonic sequence, not a mutable position integer). Promotion creates/updates a booking with a fresh hold from promotion time [R40] and must not occur at/after the cutoff [R41].
- **Acceptance criteria:**
  - [ ] Table with session FK, profile FK, `joined_at`, sequence, `status` (waiting / promoted / withdrawn / expired), timestamps.
  - [ ] Unique constraint preventing the same customer from holding two waiting entries on one session.
  - [ ] FIFO order is stable under concurrent inserts (concurrency test).
  - [ ] Waitlist entries never count toward `confirmed`/`held` capacity (asserted against `BE-017` counters).
  - [ ] Roster query can return waitlist in FIFO order for `admin/12`.
- **Out of scope:** The promotion job itself (`BE-018`); promotion notifications (future scope).
- **Phase:** P2

#### BE-013 — `cancellation_requests`

- **Lane:** BE
- **Depends on:** BE-008, BE-011
- **Source docs:** `docs/business-requirements/11-cancellations-and-refunds.md`; `14-customer-flows.md` Flow G; `15-admin-flows.md` Flow E; `docs/screen-specs/customer/12-cancellation-request.md`, `admin/10-cancellation-requests.md`
- **Scope notes:** Customer submits a request with an optional reason; booking moves to `CANCELLATION_REQUESTED`; **the slot stays locked** until admin completes cancellation [R43]. Admin outcomes per `admin/10`: complete cancellation, reject request, mark refund pending, mark refunded.
- **Acceptance criteria:**
  - [ ] Table with booking FK, requester, reason (nullable), `requested_at`, resolution (`COMPLETED` / `REJECTED`), resolver staff FK, resolved-at, resolution note.
  - [ ] Creating a request does not decrement held/confirmed capacity (test against `BE-017` counters).
  - [ ] Only one open request per booking at a time.
  - [ ] Completing a request releases the slot and makes the session eligible for waitlist promotion (`BE-018`).
  - [ ] All four admin actions in `admin/10` are representable.
- **Out of scope:** Cancellation deadline / refund eligibility rules (**⛔ OQ-1**).
- **Phase:** P2

#### BE-014 — `reschedule_requests`

- **Lane:** BE
- **Depends on:** BE-008
- **Source docs:** `docs/business-requirements/12-rescheduling.md`; `14-customer-flows.md` Flow H; `15-admin-flows.md` Flow G; `docs/screen-specs/customer/13-reschedule-request.md`, `admin/11-reschedule-requests.md`
- **Scope notes:** Customer indicates a desired target session; booking moves to `RESCHEDULE_REQUESTED`; the current booking is protected until admin resolves [`12-...` step 5]. On approval the booking moves to the new session while preserving history. **⛔ BLOCKED-BY-OQ-2** — same-class restriction, price-difference handling, reschedule cutoff, max reschedules, whether reschedule is allowed after check-in, whether new waiver acceptance is required, and full-target behaviour are **all** undecided. Ship the request/resolution workflow with **no automatic eligibility rule**: admin decides, the system records.
- **Acceptance criteria:**
  - [ ] Table with booking FK, requested target session FK (nullable if the customer only indicates a preference), requested-at, resolution, resolver, resolved-at, note.
  - [ ] Approving moves the booking to the target session and writes a history record retaining the original session id.
  - [ ] Only one open request per booking.
  - [ ] No price-difference calculation, no automatic cutoff rejection, and no automatic re-acceptance requirement is implemented (all deferred to OQ-2/OQ-5).
  - [ ] The original booking keeps its slot until resolution (capacity test).
- **Out of scope:** Everything listed under OQ-2.
- **Phase:** P2

#### BE-015 — Check-in, attendance, and no-show

- **Lane:** BE
- **Depends on:** BE-008
- **Source docs:** `docs/business-requirements/13-check-in-attendance-and-no-show.md`; `21-canonical-rules.md` [R52, R54]; `docs/screen-specs/admin/12-session-roster-check-in.md`
- **Scope notes:** Admin-performed manual check-in only — there is no customer self-check-in in MVP [R52]. Add `checked_in_at`, `checked_in_by`, `no_show_marked_at`, `no_show_marked_by` to `bookings` (or an attendance side-table) and drive `CHECKED_IN` / `NO_SHOW` statuses. No-show yields no refund [R54] — the system must not create a refund row automatically for a no-show.
- **Acceptance criteria:**
  - [ ] Only a booking in a valid confirmed state can be checked in; invalid transitions rejected with a clear error.
  - [ ] Check-in and no-show record actor and timestamp.
  - [ ] Marking no-show never creates or advances a refund record.
  - [ ] Roster counts (`confirmed`, `held`, `waitlisted`, `checked in`, `no-show`) are derivable for `admin/12` and `admin/14`.
  - [ ] Customer self-check-in is impossible via RLS and via API.
- **Out of scope:** `COMPLETED` transition (**⛔ OQ-10**).
- **Phase:** P2

#### BE-016 — `audit_events` (admin action and status history)

- **Lane:** BE
- **Depends on:** BE-008
- **Source docs:** `docs/business-requirements/09-reservation-lifecycle.md` §State-history principle; `21-canonical-rules.md` [R57]; `docs/screen-specs/admin/08-booking-management.md` ("Important actions should be auditable")
- **Scope notes:** Append-only log answering: what happened, when, who performed it, and whether a payment/refund action occurred. Cover at minimum: booking status transitions, payment verify/reject, cash recorded, refund pending/refunded, session cancelled, coach rate change, check-in, no-show, request resolutions.
- **Acceptance criteria:**
  - [ ] `audit_events` table: entity type, entity id, action, actor (staff or system), before/after status, metadata JSON, `occurred_at`.
  - [ ] Append-only (no update/delete grants for any application role).
  - [ ] Every state transition in `BE-008`–`BE-015` writes exactly one audit event (coverage test).
  - [ ] Indexes on `(entity_type, entity_id, occurred_at)` and `(actor_id, occurred_at)`.
  - [ ] System-generated transitions (hold expiry, waitlist promotion) are attributed to a system actor, not to a random admin.
- **Out of scope:** An admin audit-log UI (no screen spec exists for one — do not invent it).
- **Phase:** P2

#### BE-017 — Capacity integrity and booking eligibility

- **Lane:** BE
- **Depends on:** BE-008, BE-012, BE-019
- **Source docs:** `docs/business-requirements/06-booking-rules.md`; `10-capacity-and-waitlist.md`; `16-edge-cases.md`; `21-canonical-rules.md` [R28, R32–R34, R36, R43]
- **Scope notes:** The correctness core. A single transactional routine decides: is the customer authenticated, is the session accepting bookings, is the cutoff passed, is a slot free, or is the waitlist the right outcome. Capacity consumption counts **held + confirmed + checked-in** main-list bookings; it must **not** count waitlisted entries, and it must **still count** bookings in `CANCELLATION_REQUESTED` [R43]. Two customers racing for the last slot: the first successfully created eligible reservation wins; the second sees full capacity [`16-edge-cases.md`]. Capacity must never be silently exceeded [`05-...`].
- **Acceptance criteria:**
  - [ ] A documented, single source-of-truth definition of "consumed capacity" implemented as one SQL function/view and reused everywhere (roster, reports, booking creation).
  - [ ] Concurrency test: N parallel booking attempts for 1 remaining slot yield exactly 1 hold and N−1 full-capacity outcomes.
  - [ ] Booking creation at/after cutoff is rejected [R32, R33].
  - [ ] `CANCELLATION_REQUESTED` bookings keep consuming capacity (test).
  - [ ] Waitlisted entries never consume capacity (test).
  - [ ] Capacity can never exceed `session.capacity` (invariant test + DB-level guard).
  - [ ] Cutoff and hold values are read from `BE-019`, never hardcoded at call sites.
- **Out of scope:** HTTP layer (`BE-032`).
- **Phase:** P2

#### BE-018 — Hold expiry and FIFO waitlist promotion jobs

- **Lane:** BE
- **Depends on:** BE-017
- **Source docs:** `docs/business-requirements/10-capacity-and-waitlist.md`; `15-admin-flows.md` Flow D; `16-edge-cases.md`; `21-canonical-rules.md` [R39, R40, R41]
- **Scope notes:** Scheduled job that (1) expires holds whose `hold_expires_at` has passed, releasing the slot, and (2) promotes the next FIFO waitlisted customer **only if** the promotion cutoff has not been reached, giving them `min(promoted_at + HOLD_DURATION, starts_at)`. Slot release also happens on admin reject and completed cancellation — promotion must be triggerable from those paths too, not only on a timer.
- **Acceptance criteria:**
  - [ ] Expiry job marks overdue holds `EXPIRED` and writes an audit event with a system actor.
  - [ ] Promotion selects strictly the earliest eligible FIFO entry.
  - [ ] No promotion occurs at or after the cutoff (test at cutoff boundary ±1 minute).
  - [ ] Promoted booking's hold is recalculated from promotion time and capped by session start.
  - [ ] Job is idempotent and safe to run concurrently (no double promotion).
  - [ ] Admin reject and completed cancellation also trigger promotion evaluation.
  - [ ] Job schedule, failure handling, and observability documented.
- **Out of scope:** Promotion notifications (future scope, `19-future-scope.md`).
- **Phase:** P2

#### BE-019 — Developer-controlled business configuration module

- **Lane:** BE
- **Depends on:** BE-001
- **Source docs:** `docs/business-requirements/17-developer-config.md`; `21-canonical-rules.md` [R31, R35]; `docs/screen-specs/admin/13-settings.md`
- **Scope notes:** Centralise `BOOKING_HOLD_DURATION_HOURS = 8` and `BOOKING_CUTOFF_MINUTES_BEFORE_START = 15` as developer configuration. They must be reachable from both the API layer and SQL (jobs/functions) without duplication, and must **never** be exposed as an admin setting [R31, R35, `admin/13-settings.md`: "Do NOT expose reservation hold duration or booking cutoff"].
- **Acceptance criteria:**
  - [ ] Both values defined in exactly one place, with the deployment/change process documented (`17-developer-config.md` §Change process).
  - [ ] SQL functions and application code read the same source (no drift possible; test asserts equality).
  - [ ] No admin API or admin UI surface can read or write these values.
  - [ ] Changing a value does not retroactively alter existing bookings' recorded timestamps or states.
- **Out of scope:** Making these admin-editable (explicitly future scope).
- **Phase:** P2

#### BE-020 — RLS policy suite

- **Lane:** BE
- **Depends on:** BE-002 … BE-016
- **Source docs:** `docs/business-requirements/03-roles-and-permissions.md`; `04-auth-and-profile.md` §Privacy boundary; `21-canonical-rules.md` [R4, R5, R7, R67, R68]
- **Scope notes:** Enable RLS on every business table and write policies for three principals:
  - **anon/guest** — read published, non-cancelled sessions and public coach/class data only; no writes; no access to rate columns.
  - **customer** — read/write only their own profile, bookings, payments, acceptances, requests, waitlist entries [`04-...` §Privacy boundary]; cannot confirm their own booking, cannot check themselves in, cannot write capacity-bearing fields directly.
  - **admin** — full operational access gated by `is_admin()` from `BE-003`.
- **Acceptance criteria:**
  - [ ] RLS enabled on every business table (no table left open).
  - [ ] Negative tests: customer A cannot read customer B's booking, payment, proof, or profile.
  - [ ] Negative tests: anon cannot read any booking, payment, coach rate, or report data.
  - [ ] Negative tests: customer cannot set `CONFIRMED`, `CHECKED_IN`, or any refund status.
  - [ ] Coach rate columns readable only under `is_admin()`.
  - [ ] Policy set is documented per table with the business rule it enforces.
  - [ ] Documented note: server API routes run with a privileged role that bypasses RLS, so equivalent checks exist in the route layer (`BE-030`+).
- **Out of scope:** Storage policies (`BE-021`).
- **Phase:** P2

#### BE-021 — Storage bucket access policies

- **Lane:** BE
- **Depends on:** INF-004, BE-003, BE-010
- **Source docs:** `docs/business-requirements/08-payment-rules.md`; `docs/screen-specs/customer/10-gcash-proof-upload.md`; `admin/07-coach-management.md`; `admin/09-payment-review.md`
- **Scope notes:** `payment-proofs`: a customer may upload/read only objects under their own booking's prefix; admins may read all; nobody may read without auth; admin review uses short-lived signed URLs. `coach-photos`: public read, admin write/delete, replacement must not leave duplicate active photos. `marketing-assets`: public read, admin write.
- **Acceptance criteria:**
  - [ ] Customer A cannot read customer B's proof object (negative test).
  - [ ] Anonymous read of any `payment-proofs` object fails.
  - [ ] Admin can generate a working, expiring signed URL for review.
  - [ ] Only admins can write to `coach-photos` and `marketing-assets`.
  - [ ] Upload MIME/size limits enforced server-side, not only in the browser.
  - [ ] Deleting a coach photo removes the object and clears the coach's photo key in one transaction-equivalent flow.
- **Out of scope:** Image processing/optimisation pipelines.
- **Phase:** P2

#### BE-022 — Reporting queries and views

- **Lane:** BE
- **Depends on:** BE-010, BE-011, BE-015, BE-017
- **Source docs:** `docs/business-requirements/22-inventory-and-sales-reporting.md`; `15-admin-flows.md` §Review sales and inventory reports; `docs/screen-specs/admin/14-sales-inventory-reports.md`
- **Scope notes:** Implement the four report shapes the spec names — **Sales overview**, **Class performance**, **Coach report**, **Session report** — plus the session drill-down. Definitions are fixed by the business doc:
  - Gross Sales = value of paid/confirmed bookings in range; Refunds = value of completed refunds; Net Sales = Gross − Refunds.
  - Coach Cost uses the **session snapshot**, never the coach's current rate [R71].
  - Gross Contribution = gross session revenue − coach cost, and must not be labelled profit [R77, R78].
  - Occupancy = `confirmed / capacity`; Attendance Utilisation = `checked_in / capacity` — separate measures.
  - Exclusions: waitlisted are not sales; unpaid held reservations are not revenue; refunded bookings stay in history [R74–R76].
  - Filters: date range (minimum), plus class, coach, session status.
- **Acceptance criteria:**
  - [ ] Each of the four reports plus session drill-down is implemented as a parameterised query/view with the exact field list from `admin/14-sales-inventory-reports.md`.
  - [ ] Fixture-based test proves a coach-rate change after a session does not alter that session's reported coach cost.
  - [ ] Fixture-based test proves waitlisted and unpaid-held bookings contribute zero revenue.
  - [ ] Fixture-based test proves a refunded booking still appears in history and in refund totals.
  - [ ] Occupancy and attendance utilisation are reported as distinct fields.
  - [ ] No output field is named "profit".
  - [ ] Reports respect the date-range filter boundaries inclusively/exclusively as documented.
- **Out of scope:** BI dashboards, forecasting, P&L, payroll, tax, accounting integration (all future scope, `19-future-scope.md`).
- **Phase:** P3

#### BE-023 — Seed data for development and demo

- **Lane:** BE
- **Depends on:** BE-004, BE-005, BE-006, BE-007
- **Source docs:** `docs/facebook-findings/findings.md` §3 (weekly timetable), §4b (confirmed coach roster), §5 (brand); `docs/business-requirements/05-class-and-schedule-rules.md`
- **Scope notes:** Seed realistic catalogue data drawn from the Facebook findings — the **owner-provided confirmed roster** in §4b supersedes names inferred from the schedule graphic:

  | Coach | Classes |
  | --- | --- |
  | Rex Francis Regis | Calisthenics / Mat Pilates / Caliyoga |
  | Ephraim Bacaltos | Circuit Training / Groundworks / Calisthenics |
  | Rachelle Tobiano | Kickboxing / Brazilian Jiu-Jitsu |
  | Alec James Co | Calisthenics / Circuit Training |
  | Jodi Tio | Mat Pilates |
  | Wolf | Yoga |
  | Kate Go | Yoga |
  | Sofia Ocampo | Mat Pilates |
  | Mikaela Danielle | Dance Fitness |
  | Maris Cabrera | Dance Fitness |
  | Francis Acido | Dance Fitness |

  Class catalogue from the same source: Yoga, Mat Pilates, Calisthenics, Caliyoga, Circuit Training, Kickboxing, Brazilian Jiu-Jitsu, Groundworks, Dance Fitness (plus Contemporary/Groove/Femme/Kids as labelled in the timetable). Session times seed from the observed daily slots (8:00, 9:30, 11:00, 15:00, 16:30, 18:00, 19:30, Cebu time). Seed **placeholder** prices and coach rates clearly marked as non-authoritative (the findings contain no per-class pricing).
- **Acceptance criteria:**
  - [ ] Idempotent, re-runnable seed script.
  - [ ] Coaches match the §4b roster exactly (spelling and class assignment).
  - [ ] Seeded sessions span a realistic week using the observed time slots.
  - [ ] Prices and coach rates are flagged as placeholder values in the seed source and in the data (e.g. a demo flag or obvious round numbers plus a README note).
  - [ ] Seed never runs automatically against the shared project without an explicit flag.
  - [ ] Placeholder policy versions from `BE-007` are linked so booking flows are testable.
- **Out of scope:** Real pricing, real waiver text, real customer data.
- **Phase:** P3

#### BE-024 — API contract pack for the wiring phase

- **Lane:** BE
- **Depends on:** BE-030 … BE-043
- **Source docs:** all business flow docs (`14-customer-flows.md`, `15-admin-flows.md`)
- **Scope notes:** Publish a machine-readable contract (OpenAPI or typed route manifest) plus example request/response payloads for every route in [§4.3](#43-api-route-inventory-mapped-to-business-flows). This is the artefact the later wiring phase consumes so FE mock adapters can be swapped for real clients mechanically.
- **Acceptance criteria:**
  - [ ] Every implemented route appears in the contract with request/response schemas and error codes.
  - [ ] Status/enum names in the contract match `BE-001` exactly.
  - [ ] Example payloads exist for each route and are generated from real integration-test fixtures (not hand-written drift).
  - [ ] The contract is committed in-repo and CI fails if a route lacks contract coverage.
- **Out of scope:** FE consumption (`WIRE-*`).
- **Phase:** P4

---

### 4.6 BE tickets — API routes

> All routes are implemented **and tested server-side only** this phase. Each route must (a) enforce the same rule as its RLS counterpart, (b) return human-mappable status values matching `BE-001`, and (c) write audit events via `BE-016` for state-changing operations.

#### BE-030 — Public catalogue API

- **Lane:** BE
- **Depends on:** BE-006, BE-020
- **Source docs:** `docs/business-requirements/14-customer-flows.md` Flow A; `03-roles-and-permissions.md` §Guest; `docs/screen-specs/public/01-landing-page.md`, `public/05-coaches.md`
- **Scope notes:** `GET /api/public/sessions` (date-range query returning class, time, coach, price, capacity, remaining slots, reservability), `GET /api/public/sessions/:id`, `GET /api/public/coaches` (from `coaches_public`), `GET /api/public/classes`, `GET /api/public/content` (About/Contact/FAQ content managed in `admin/13-settings.md`). Guests see availability but nothing personal [`03-...` §Guest].
- **Acceptance criteria:**
  - [ ] Remaining-slot numbers use the single capacity definition from `BE-017`.
  - [ ] Coach rate, rate type, and any customer identity are absent from every public response (schema-level assertion test).
  - [ ] Unpublished and cancelled sessions are excluded (or clearly flagged non-reservable) [R? per `admin/05` publish state and `05-...` §Class cancellation].
  - [ ] Past sessions and sessions past cutoff are marked non-reservable rather than hidden inconsistently.
  - [ ] Responses are cacheable and the date-range query is indexed (no full scans).
- **Out of scope:** Any write operation.
- **Phase:** P3

#### BE-031 — Authenticated profile API

- **Lane:** BE
- **Depends on:** BE-002, BE-009, BE-020
- **Source docs:** `docs/business-requirements/04-auth-and-profile.md`; `docs/screen-specs/customer/05-profile.md`
- **Scope notes:** `GET /api/me` (profile + auth method), `PATCH /api/me` (full name, contact number; email changes follow the auth provider's flow), `GET /api/me/policy-acceptances` (accepted versions summary for the profile screen).
- **Acceptance criteria:**
  - [ ] A customer can only read/modify their own profile (negative test with another user's token).
  - [ ] Profile updates never alter historical booking snapshots.
  - [ ] Acceptance history returns document name, version, and accepted timestamp.
  - [ ] Validation errors are field-scoped and machine-readable.
- **Out of scope:** Admin customer management (`BE-042`).
- **Phase:** P3

#### BE-032 — Booking creation and retrieval API

- **Lane:** BE
- **Depends on:** BE-008, BE-009, BE-017, BE-019
- **Source docs:** `docs/business-requirements/06-booking-rules.md`; `07-booking-form-and-waivers.md`; `10-capacity-and-waitlist.md`; `14-customer-flows.md` Flows B, E, F
- **Scope notes:** `POST /api/bookings` performs the whole eligibility gate in one transaction: authenticated, session accepting bookings, cutoff not reached, required policy acceptances present, slot available **or** waitlist eligible. Returns either a held booking (with `hold_expires_at`) or a waitlist entry. `POST /api/bookings/:id/waitlist` for explicit waitlist join on a full session. `GET /api/bookings` (own bookings, grouped upcoming/pending/history for `customer/04`), `GET /api/bookings/:id`.
- **Acceptance criteria:**
  - [ ] Booking for another person is impossible — the attendee is always the authenticated user; any `customer_id`/attendee field in the request body is ignored or rejected [R7, R8].
  - [ ] Missing required policy acceptance rejects the request with a specific error.
  - [ ] At/after cutoff the request is rejected with a distinguishable error code.
  - [ ] Full session returns the waitlist path, never an over-capacity hold.
  - [ ] Same-day multiple bookings across different sessions succeed [R17].
  - [ ] Duplicate active booking for the same session is rejected.
  - [ ] Response includes the customer-facing status label source (raw enum + label key), never a bare enum for display.
  - [ ] Concurrency test at capacity boundary passes (reuses `BE-017` guarantees).
- **Out of scope:** Payment selection (`BE-033`).
- **Phase:** P3

#### BE-033 — Payment method, proof upload, and instructions API

- **Lane:** BE
- **Depends on:** BE-010, BE-021
- **Source docs:** `docs/business-requirements/08-payment-rules.md`; `14-customer-flows.md` Flows C, D; `docs/screen-specs/customer/09-payment-method.md`, `customer/10-gcash-proof-upload.md`
- **Scope notes:** `POST /api/bookings/:id/payment-method` (`GCASH` | `PAY_AT_COUNTER`), `POST /api/bookings/:id/payment-proof` (signed-upload issue + proof record creation → `PAYMENT_SUBMITTED`), `GET /api/payment-instructions` (GCash details/QR from settings). Uploading proof must **not** confirm the booking [R26, `customer/10`: "Uploading proof does not auto-confirm"]. Pay at Counter creates no proof requirement [R25].
- **Acceptance criteria:**
  - [ ] Selecting a method does not change `hold_expires_at`.
  - [ ] Proof upload transitions payment to `PROOF_SUBMITTED` and booking to `PAYMENT_SUBMITTED`, and never to `CONFIRMED`.
  - [ ] Proof upload is rejected for expired holds and for bookings the caller does not own.
  - [ ] Only allowed MIME types and sizes are accepted (server-enforced).
  - [ ] Re-upload behaviour is defined (replace vs append) and documented; history is retained either way.
  - [ ] GCash instructions come from settings (`BE-043`), not hardcoded.
- **Out of scope:** Automated verification; gateways.
- **Phase:** P3

#### BE-034 — Cancellation request API (customer)

- **Lane:** BE
- **Depends on:** BE-013
- **Source docs:** `docs/business-requirements/11-cancellations-and-refunds.md`; `14-customer-flows.md` Flow G; `docs/screen-specs/customer/12-cancellation-request.md`
- **Scope notes:** `POST /api/bookings/:id/cancellation-request` with optional reason. Response must communicate that the request is reviewed manually and any refund is manual (`customer/12` notice text).
- **Acceptance criteria:**
  - [ ] Booking moves to `CANCELLATION_REQUESTED`; the slot remains consumed (capacity assertion).
  - [ ] A second open request for the same booking is rejected.
  - [ ] Customers cannot cancel directly — no route exists that sets `CANCELLED` from a customer token.
  - [ ] Audit event written.
  - [ ] No eligibility window is enforced (**⛔ OQ-1**) and the code contains no placeholder deadline.
- **Out of scope:** Admin resolution (`BE-039`).
- **Phase:** P3

#### BE-035 — Reschedule request API (customer)

- **Lane:** BE
- **Depends on:** BE-014
- **Source docs:** `docs/business-requirements/12-rescheduling.md`; `14-customer-flows.md` Flow H; `docs/screen-specs/customer/13-reschedule-request.md`
- **Scope notes:** `POST /api/bookings/:id/reschedule-request` carrying the desired target session. Current booking stays protected until admin resolves.
- **Acceptance criteria:**
  - [ ] Booking moves to `RESCHEDULE_REQUESTED` and keeps its slot.
  - [ ] Target session id is recorded but **not** validated against class-type, price, cutoff, or reschedule-count rules (**⛔ OQ-2**).
  - [ ] One open request per booking.
  - [ ] Audit event written.
  - [ ] Route documentation explicitly lists the OQ-2 rules it deliberately does not enforce.
- **Out of scope:** Admin approval and the move itself (`BE-039`).
- **Phase:** P3

#### BE-036 — Admin booking management API

- **Lane:** BE
- **Depends on:** BE-008, BE-016, BE-003
- **Source docs:** `docs/business-requirements/15-admin-flows.md` Flow B; `docs/screen-specs/admin/08-booking-management.md`
- **Scope notes:** `GET /api/admin/bookings` with the exact filter set from the spec (Pending / Confirmed / Waitlisted / Expired / History, plus customer search, class, date). `POST /api/admin/bookings/:id/confirm` and `/reject` with a reason. **⛔ BLOCKED-BY-OQ-7** — whether rejection reasons are free text, predefined, or both is undecided; accept free text now and keep the field shape open to a code later.
- **Acceptance criteria:**
  - [ ] All five tabs and all three search/filter axes are served by the list endpoint with pagination.
  - [ ] Confirm/reject require admin authorisation and write audit events including the actor.
  - [ ] Rejecting a booking releases the slot and triggers promotion evaluation (`BE-018`).
  - [ ] Rejecting a paid booking does **not** auto-create a refund transfer; it only allows admin to set refund state (`BE-037`).
  - [ ] Non-admin tokens receive 403 on every route.
- **Out of scope:** Payment verification specifics (`BE-037`).
- **Phase:** P4

#### BE-037 — Admin payment review and refund state API

- **Lane:** BE
- **Depends on:** BE-010, BE-011, BE-021
- **Source docs:** `docs/business-requirements/15-admin-flows.md` Flows B, C, E; `08-payment-rules.md`; `docs/screen-specs/admin/09-payment-review.md`, `admin/10-cancellation-requests.md`
- **Scope notes:** `GET /api/admin/payments` with the spec's three tabs (GCash Pending / Pay at Counter / Refunds) showing customer, session, amount, hold expiry. `GET /api/admin/payment-proofs/:id/signed-url` for review. `POST /api/admin/payments/:id/record-cash`. `POST /api/admin/refunds/:id/mark-pending` and `/mark-refunded`.
- **Acceptance criteria:**
  - [ ] Signed URLs are short-lived and admin-only; access attempts are audited.
  - [ ] Recording cash sets payment state without implicitly confirming the booking (confirmation remains an explicit action) [R26].
  - [ ] Refund state transitions are actor-attributed and audited.
  - [ ] Payment state and booking state remain separately queryable (`admin/09` requirement).
  - [ ] Hold-expiry column is computed from the booking, not stored redundantly.
- **Out of scope:** Executing actual money transfers (manual, outside the app).
- **Phase:** P4

#### BE-038 — Admin catalogue API (classes, coaches, sessions)

- **Lane:** BE
- **Depends on:** BE-004, BE-005, BE-006, BE-021
- **Source docs:** `docs/business-requirements/15-admin-flows.md` Flows A, F, I; `05-class-and-schedule-rules.md`; `docs/screen-specs/admin/05-schedule-management.md`, `admin/06-class-management.md`, `admin/07-coach-management.md`
- **Scope notes:** CRUD for classes and coaches (including coach photo upload/replace/remove and internal rate fields), and session create/edit/cancel with the snapshot fields (`Customer Price`, `Coach`, `Coach Rate`, `Coach Rate Type`, `Capacity`, publish state). Cancelling a session must prevent new reservations, mark affected bookings appropriately, and preserve history (`15-admin-flows.md` Flow F).
- **Acceptance criteria:**
  - [ ] Creating a session snapshots the coach's current rate and rate type at creation time.
  - [ ] Updating a coach's `default_rate` leaves existing sessions untouched (regression test) [R71].
  - [ ] Reducing a session's capacity below current consumption is rejected with a clear error (capacity can never be silently exceeded).
  - [ ] Cancelling a session sets `CANCELLED`, blocks new bookings, and enumerates affected bookings for admin follow-up without deleting anything.
  - [ ] Coach photo replace leaves exactly one active photo; remove clears the key and deletes the object.
  - [ ] Coach rate fields are rejected on any non-admin path.
  - [ ] No recurring-generation endpoint is added (out of MVP).
- **Out of scope:** Recurring schedule automation; coach self-service.
- **Phase:** P4

#### BE-039 — Admin cancellation and reschedule resolution API

- **Lane:** BE
- **Depends on:** BE-013, BE-014, BE-018
- **Source docs:** `docs/business-requirements/15-admin-flows.md` Flows E, G; `docs/screen-specs/admin/10-cancellation-requests.md`, `admin/11-reschedule-requests.md`
- **Scope notes:** Cancellation: list queue, complete cancellation (releases slot, enables promotion), reject request, set refund pending/refunded. Reschedule: list queue showing current booking, requested session, target capacity and coach; approve & move; reject.
- **Acceptance criteria:**
  - [ ] Completing a cancellation releases the slot exactly once and triggers promotion evaluation before the cutoff only.
  - [ ] Rejecting a cancellation request returns the booking to its prior status with an audit trail.
  - [ ] Approving a reschedule moves the booking, preserves the original session reference in history, and re-checks target capacity at approval time.
  - [ ] Approving a reschedule into a full target session is rejected (capacity invariant) — target-full policy beyond that is **⛔ OQ-2** and not implemented.
  - [ ] No price-difference computation is performed (**⛔ OQ-2**).
  - [ ] All actions audited with actor and reason.
- **Out of scope:** OQ-2 policy rules.
- **Phase:** P4

#### BE-040 — Admin session roster and check-in API

- **Lane:** BE
- **Depends on:** BE-015, BE-017
- **Source docs:** `docs/business-requirements/13-check-in-attendance-and-no-show.md`; `15-admin-flows.md` Flow H; `docs/screen-specs/admin/12-session-roster-check-in.md`
- **Scope notes:** `GET /api/admin/sessions/:id/roster` returning confirmed list, held/pending list, FIFO waitlist, and the inventory metrics block from the spec (`Capacity`, `Confirmed`, `Held`, `Available`, `Waitlisted`, `Checked In`, `No-show`, plus Occupancy and Attendance Utilisation as separate measures). `POST .../check-in` and `POST .../no-show`.
- **Acceptance criteria:**
  - [ ] Roster returns all three groups with the fields the spec lists (name, payment, attendance).
  - [ ] Waitlist is returned in FIFO order.
  - [ ] Metrics use the single capacity definition from `BE-017` and match `BE-022` for the same session (cross-check test).
  - [ ] Occupancy and attendance utilisation are separate fields.
  - [ ] Check-in/no-show are admin-only and audited.
  - [ ] Marking no-show creates no refund.
- **Out of scope:** Customer self-check-in (not in MVP).
- **Phase:** P4

#### BE-041 — Admin reports API

- **Lane:** BE
- **Depends on:** BE-022
- **Source docs:** `docs/business-requirements/22-inventory-and-sales-reporting.md`; `docs/screen-specs/admin/14-sales-inventory-reports.md`
- **Scope notes:** Expose the four reports plus session drill-down over HTTP with date-range (required) and class/coach/session-status (optional) filters.
- **Acceptance criteria:**
  - [ ] Endpoint field names match the spec's table headers exactly (Gross Sales, Refunds, Net Sales, Paid Bookings, Coach Cost, Gross Contribution, Occupancy, Attendance Utilisation).
  - [ ] Admin-only; non-admin receives 403 (financial privacy) [R67, R68].
  - [ ] Date-range filter is required and validated.
  - [ ] Response never contains a field named "profit".
  - [ ] Large ranges are paginated or aggregated without timeouts (documented performance budget).
- **Out of scope:** Exports, scheduled report delivery, BI tooling.
- **Phase:** P4

#### BE-042 — Admin staff and customer management API

- **Lane:** BE
- **Depends on:** BE-003, BE-002, BE-009
- **Source docs:** `docs/business-requirements/03-roles-and-permissions.md`; `docs/screen-specs/admin/03-staff-management.md`, `admin/04-customer-management.md`
- **Scope notes:** Staff: list, add (invite/provision), edit, disable access. Customers: searchable list (name, contact, upcoming, last visit) and detail aggregating profile, upcoming/pending/history bookings, cancellation/reschedule history, attendance/no-show history, payment/refund history, and accepted policy versions — exactly the blocks in `admin/04`.
- **Acceptance criteria:**
  - [ ] Staff routes are admin-only and cannot be reached by any public path.
  - [ ] Disabling staff access takes effect immediately.
  - [ ] Customer detail returns all six blocks listed in `admin/04`.
  - [ ] Customer list supports search and pagination.
  - [ ] Admin access to customer data is limited to operational needs and is audited for sensitive reads (documented policy).
- **Out of scope:** Staff self-service password reset (admin login has no forgot-password page in MVP).
- **Phase:** P4

#### BE-043 — Admin settings and public content API

- **Lane:** BE
- **Depends on:** BE-007, BE-003, INF-004
- **Source docs:** `docs/screen-specs/admin/13-settings.md`; `docs/business-requirements/17-developer-config.md`; `docs/facebook-findings/findings.md` §2
- **Scope notes:** Settings blocks per the spec: Business profile (name, contact, address), Payment info (GCash details/QR image), Public content (About/Contact/FAQs), Policies/waivers (current versions). Real contact data available for seeding from the Facebook findings (phone `+63 968 220 9198`, email `balanse.wellnesshub@gmail.com`, address `Unit 2A, Capitol Centrum Building, N Escario, Cebu City`, IG/TikTok `@balanse.wellness`, WhatsApp `+63 917 722 2040`). Hours were **not** exposed in the findings — leave blank rather than inventing them.
- **Acceptance criteria:**
  - [ ] All four settings blocks are readable and writable by admins only.
  - [ ] Reservation hold duration and booking cutoff are **absent** from this API entirely [R31, R35].
  - [ ] GCash QR upload targets `marketing-assets` and is served publicly.
  - [ ] Policy version management can promote a new current version without mutating prior versions.
  - [ ] Seeded contact values match the Facebook findings; opening hours default to empty.
- **Out of scope:** A CMS; rich content modelling beyond what the four blocks require.
- **Phase:** P4

---

## 5. FE foundation tickets

> **Reminder for every FE ticket in this document:** screens are **mocks**. No `fetch` to `/api/*`, no Supabase client calls, no real auth. Data comes from the mock layer (`FE-FND-005`). Screen specs in `docs/screen-specs/` are the source of truth for layout and content; do not design new screens, and do not add fields, tabs, or actions the spec does not list.

### 5.1 Target application structure

**Engineering decision (not a product rule)** — the route map the foundation tickets create, derived from `docs/screen-specs/SCREEN_INDEX.md` and `docs/screen-specs/shared/01-navigation.md`:

```text
apps/web   (port 9000)
  /                         → public/01-landing-page.md   (calendar hero)
  /about                    → public/02-about.md
  /contact                  → public/03-contact.md
  /faqs                     → public/04-faqs.md
  /coaches                  → public/05-coaches.md
  /login                    → customer/01-login.md
  /sign-up                  → customer/02-sign-up.md
  /forgot-password          → customer/03-forgot-password.md
  /portal                   → customer/04-portal-home.md
  /portal/profile           → customer/05-profile.md
  /portal/achievements      → customer/06-achievements-tbd.md
  /portal/schedule          → customer/07-schedule.md
  /portal/book/[sessionId]  → customer/08-booking-form.md
  /portal/book/[sessionId]/payment        → customer/09-payment-method.md
  /portal/book/[sessionId]/payment/gcash  → customer/10-gcash-proof-upload.md
  /portal/bookings/[id]                   → customer/11-booking-detail.md
  /portal/bookings/[id]/cancel            → customer/12-cancellation-request.md
  /portal/bookings/[id]/reschedule        → customer/13-reschedule-request.md

apps/admin (port 9001)
  /login        → admin/01-login.md            /bookings      → admin/08-booking-management.md
  /             → admin/02-dashboard.md        /payments      → admin/09-payment-review.md
  /staff        → admin/03-staff-management.md /cancellations → admin/10-cancellation-requests.md
  /customers    → admin/04-customer-management.md
  /schedule     → admin/05-schedule-management.md /reschedules → admin/11-reschedule-requests.md
  /classes      → admin/06-class-management.md /schedule/[sessionId]/roster → admin/12-session-roster-check-in.md
  /coaches      → admin/07-coach-management.md /settings      → admin/13-settings.md
                                               /reports       → admin/14-sales-inventory-reports.md
```

**Navigation gap to flag, not fill:** `docs/screen-specs/shared/01-navigation.md` lists a public **"Classes"** item and a public **"Schedule"** item, but `docs/screen-specs/public/` contains no dedicated Classes or Schedule screen spec — the calendar lives on the landing page. Do **not** design new pages for them. Point both nav items at the landing calendar (Schedule → calendar anchor; Classes → calendar with the class filter surfaced) and raise the discrepancy as **OQ-NAV** in [Section 9](#9-deferred-open-business-questions).

---

#### FE-FND-001 — Bootstrap the monorepo from `fe-multi-web-template`

- **Lane:** FE
- **Depends on:** none
- **Source docs:** locked stack decision; [`fe-multi-web-template`](https://github.com/jose-codegourmet/fe-multi-web-template) README
- **Scope notes:** Create the Balanse app from the template (GitHub "Use this template" or clone + history reset). The template ships pnpm workspaces + Turborepo with `apps/web` (9000), `apps/admin` (9001), `packages/ui`, `packages/db`, `packages/config`, Biome, Husky + commitlint (Conventional Commits), Storybook, Node 24 via `.nvmrc`. Rename workspace scopes from `@fe-template/*` to a Balanse scope, update root `README.md`, `AGENTS.md`, and `Makefile` references.
- **Acceptance criteria:**
  - [ ] `nvm use && pnpm install && pnpm dev` starts both apps on 9000/9001 from a clean clone.
  - [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm build` all pass on the untouched bootstrap.
  - [ ] Workspace package names no longer reference `fe-template`.
  - [ ] Root README describes Balanse, not the template.
  - [ ] Conventional Commits and Husky hooks work.
  - [ ] The template's own `docs/superpowers/` historical plans and `scripts/migrate-components.py` are removed or clearly quarantined (the template README says the migration script must not be run).
- **Out of scope:** Removing PawPair content (`FE-FND-002`); Jabkit (`FE-FND-003`).
- **Phase:** P0

#### FE-FND-002 — Strip all PawPair mock content

- **Lane:** FE
- **Depends on:** FE-FND-001
- **Source docs:** locked stack decision ("strip all Pawpair mock content"); template README §Using as a template
- **Scope notes:** The template ships a complete fictional brand (**PawPair**, "Better matches. Happier tails.") that must leave the repo entirely. Known PawPair surfaces to remove:
  - `apps/web/src/app/` demo routes not in the Balanse route map: `blog/`, `blog/grid/`, `blog/[slug]/`, `careers/`, `press/`, `partners/`, `pricing/`, `help/`, `status/`, `resources/*`, `create-profile/`, `showcase/`, `otp/`, `sign-in/`, and the `legal/*` set (re-add only if a Balanse screen spec calls for it — none currently does).
  - `apps/web/src/sections/*` PawPair sections (home/about/contact/blog/pricing families) and their stories.
  - `apps/web/src/lib/mock/pets.ts`, PawPair constants in `apps/web/src/constants/*`, PawPair copy in `seo.ts`, `navigation.ts`, `placeholder-pages.ts`, `blog.ts`.
  - `apps/admin/src/app/(dashboard)/` PawPair domains: `pets/`, `posts/`, `pricing-plans/`, `testimonials/`, `contacts/` and their hooks (`use-pets`, `use-posts`, `use-pricing-plans`, `use-testimonials`, `use-contacts`).
  - `packages/db/prisma/schema/{pet,post,marketing}.prisma`, `packages/db/prisma/constants/*` PawPair seed constants, and PawPair migrations (Balanse starts from a clean schema — see `INF-003`).
  - `docs/about-example-site/` (PawPair branding/content/image guide) and PawPair imagery under `apps/web/public/images/`.
  - Run `python scripts/cleanup-unused.py` (dry run first, then `--delete`) and hand-prune unused `packages/ui/src/components/*` plus their `index.ts` exports, as the template README instructs.
- **Acceptance criteria:**
  - [ ] A case-insensitive repo-wide search for `pawpair`, `pet`, `Happier tails`, and the template's demo domain names returns **zero** hits outside of an intentional changelog entry.
  - [ ] No PawPair route resolves in either app (404 or route removed).
  - [ ] No PawPair Prisma model, migration, or seed constant remains.
  - [ ] No PawPair image asset remains in `public/`.
  - [ ] `pnpm typecheck && pnpm lint && pnpm build` still pass after removal.
  - [ ] A CI guard (grep-based) fails the build if `pawpair` reappears.
- **Out of scope:** Adding Balanse content (later tickets).
- **Phase:** P0

#### FE-FND-003 — Install and wire Jabkit as the component library

- **Lane:** FE
- **Depends on:** FE-FND-002
- **Source docs:** locked stack decision; [`jabkit`](https://github.com/jose-codegourmet/jabkit) `docs/cli.md`, `docs/registry.md`, `docs/theming.md`
- **Scope notes:** Jabkit is **source-distributed**: the CLI writes component source into the consumer repo. Run `jabkit init` in each consuming app, producing `jabkit.config.json` (`componentsDir: "src/components/jabkit"`, `alias: "@/components/jabkit"`, `registry: "https://jabkit.joseadrianbuctuanon.dev"`, `formatter: "biome"`), a consumer skill file, and an `AGENTS.md` section. Then `jabkit add` the baseline set the screens need. Registry facts to honour: `add` resolves `registryDependencies` depth-first; imports are rewritten to the configured alias; `cssVars` from added components are appended to `src/app/globals.css` as `:root`/`.dark` blocks — so `globals.css` must exist before adding themed components. Installed component source stays **pristine** until a deliberate, separate edit; local changes go in wrapper components, not in the vendored files.

  Baseline set to install (verify names against `{registry}/r/index.json` — 214 components across `atoms`, `marketing`, `dashboard`):

  | Purpose | Components |
  | --- | --- |
  | Primitives | `button`, `input`, `label`, `textarea`, `checkbox`, `radio-group`, `switch`, `card`, `badge`, `avatar`, `separator`, `skeleton`, `alert`, `alert-dialog`, `dialog`, `drawer`, `popover`, `tooltip`, `dropdown-menu`, `command`, `combobox`, `pagination`, `progress`, `scroll-area`, `toast`, `breadcrumb`, `accordion`, `collapsible` |
  | Data | `data-table`, `table-2`, `chart`, `chart-group14` |
  | Calendar | `calendar-03`, `calendar-with-localisation`, `fullscreen-calendar` |
  | Shell / nav | `sidebar`, `navigation-menu`, `application-shell1`, `application-shell13`, `tubelight-navbar`, `footer-column`, `footer-section` |
  | Auth | `login4`, `forgot-password2` |
  | Upload / media | `attachment`, `image-cropper`, `aspect-ratio` |
  | Booking artefacts | `ticket-confirmation-card`, `order-confirmation-card`, `receipt-pricing`, `stepper-with-titles` |
  | Marketing | `hero-1`, `about6`, `faq12`, `team11`, `content1`, `cta22`, `agency-contact-form`, `form` |

- **Acceptance criteria:**
  - [ ] `jabkit.config.json` exists in each consuming app with the values above; the registry URL is configurable via `JABKIT_REGISTRY`.
  - [ ] The baseline components are installed under `src/components/jabkit/` with rewritten imports that resolve and typecheck.
  - [ ] `globals.css` contains the merged Jabkit `:root`/`.dark` variable blocks.
  - [ ] A documented convention exists: vendored Jabkit files are not hand-edited; wrappers live in `src/components/balanse/`.
  - [ ] The repo's `AGENTS.md` carries the Jabkit section written by `init`.
  - [ ] A Storybook page (or `/dev/kit` route) renders every installed component so the team can browse what is available.
  - [ ] Any component the team decides against is removed rather than left dead.
- **Out of scope:** Building screens; theming Balanse colours (`FE-FND-004`).
- **Phase:** P0

#### FE-FND-004 — Balanse brand tokens, typography, and app chrome

- **Lane:** FE
- **Depends on:** FE-FND-003
- **Source docs:** `docs/facebook-findings/findings.md` §5 (visual identity, logo, tone); `docs/screen-specs/shared/04-marketing-image-generation.md` §Suggested base visual language
- **Scope notes:** Encode the Balansé visual identity as Tailwind 4 / CSS custom-property tokens: cream, warm white, beige/tan, muted brown, dark navy/charcoal, and gold accents. Brand emblem is a line-art meditating figure inside a leafy wreath with **BALANSÉ** and "WELLNESS HUB" in gold. Tone is warm, encouraging, inclusive, community-minded. Define light/dark token sets compatible with Jabkit's `cssVars` pipeline, a type scale, spacing rhythm, and the shared page chrome (header/footer shells) both apps consume.
- **Acceptance criteria:**
  - [ ] Token set defined once and consumed by both apps; no hardcoded hex values in screen code (lint rule or review checklist).
  - [ ] Jabkit components visually adopt Balanse tokens without editing vendored files.
  - [ ] The brand name renders as "Balansé" with the accent wherever the logo lockup is textual.
  - [ ] Contrast ratios meet WCAG AA for body text and interactive controls.
  - [ ] A `/dev/tokens` page or Storybook page displays the palette, type scale, and spacing scale.
  - [ ] No brand asset is invented beyond what `findings.md` §5 describes; the actual logo file is sourced, not redrawn from imagination (if unavailable, a text lockup placeholder is used and flagged).
- **Out of scope:** Generated marketing imagery (`ASSET-*`).
- **Phase:** P0

#### FE-FND-005 — Mock data layer and shared domain types

- **Lane:** FE
- **Depends on:** FE-FND-004, BE-001 (vocabulary only)
- **Source docs:** `docs/business-requirements/09-reservation-lifecycle.md`; `22-inventory-and-sales-reporting.md`; `docs/screen-specs/shared/02-status-language.md`; `docs/facebook-findings/findings.md` §3, §4b
- **Scope notes:** One typed, deterministic, in-memory fixture layer that every mocked screen reads through a narrow adapter interface — so the wiring phase replaces the adapter, not the screens. Domain types mirror the BE vocabulary from `BE-001` exactly (booking status, payment method/status, refund status, session status, coach rate type). Fixtures cover: classes and coaches from the confirmed Facebook roster (§4b), a realistic week of sessions using the observed 8:00 / 9:30 / 11:00 / 15:00 / 16:30 / 18:00 / 19:30 Cebu slots, sessions in every availability condition (open, nearly full, full-with-waitlist, past, cancelled, past-cutoff), and bookings in **every** status in `shared/02-status-language.md`. Coach rates exist in fixtures only for admin screens and must never be reachable from public/customer fixtures.
- **Acceptance criteria:**
  - [ ] A single `MockDataAdapter` interface (or equivalent) is the only way screens obtain data; no screen imports a fixture file directly.
  - [ ] Every status row in `shared/02-status-language.md` has at least one fixture booking.
  - [ ] Fixtures are deterministic (seeded) so screenshots and Storybook snapshots are stable.
  - [ ] Public and customer fixture shapes contain no coach rate or coach cost field (type-level guarantee, not just convention).
  - [ ] Adapter methods are named after the future API routes in [§4.3](#43-api-route-inventory-mapped-to-business-flows) so the wiring swap is mechanical.
  - [ ] Simulated latency and simulated failure are toggleable, so loading/error states are demonstrable.
  - [ ] Money and dates use the shared formatters from `FE-FND-012`.
- **Out of scope:** Any real network call.
- **Phase:** P1

#### FE-FND-006 — Mock session and role switcher (dev harness)

- **Lane:** FE
- **Depends on:** FE-FND-005
- **Source docs:** `docs/business-requirements/03-roles-and-permissions.md`; `docs/screen-specs/public/01-landing-page.md` (guest → auth transition), `customer/01-login.md` (return to selected session)
- **Scope notes:** Because there is no real auth this phase, screens still need to demonstrate guest vs customer vs admin behaviour and the "reserve → login → return to the selected session" handoff. Build a dev-only harness: a persisted mock principal (guest / customer / admin), a picker for which fixture customer is "signed in", and a picker for the booking state to showcase. It must be visibly non-production and trivially removable in the wiring phase.
- **Acceptance criteria:**
  - [ ] Switching principal immediately changes header state, guarded routes, and available actions.
  - [ ] Guest attempting Reserve is routed to login and, after mock login, lands back on the originally selected session (the behaviour `public/01` and `customer/01` require).
  - [ ] The harness is excluded from production builds by an environment flag and is visually marked as a mock.
  - [ ] No harness code is imported by screen components (only by the shell/provider).
  - [ ] Removal path is documented in one place for `WIRE-002`.
- **Out of scope:** Real Supabase auth.
- **Phase:** P1

#### FE-FND-007 — Public route shell

- **Lane:** FE
- **Depends on:** FE-FND-004, FE-SHR-001
- **Source docs:** `docs/screen-specs/shared/01-navigation.md`; `docs/screen-specs/public/01-landing-page.md` (header line)
- **Scope notes:** Route group + layout for the five public pages: header (`BALANSÉ | Schedule | Classes | Coaches | About | FAQs | Contact | Login/Profile`), footer, responsive behaviour, SEO metadata per page, and the not-found page. "Schedule" and "Classes" resolve to the landing calendar per the nav gap note above.
- **Acceptance criteria:**
  - [ ] All five public routes exist and render the shell with correct active-nav state.
  - [ ] Header shows Login for a mock guest and Profile for a mock customer.
  - [ ] Mobile navigation works down to 360 px width.
  - [ ] Per-page metadata (title/description) is set and contains no PawPair remnants.
  - [ ] No new public page beyond the five specs is created.
- **Out of scope:** Page content (`FE-PUB-*`).
- **Phase:** P1

#### FE-FND-008 — Customer portal route shell

- **Lane:** FE
- **Depends on:** FE-FND-006, FE-SHR-001
- **Source docs:** `docs/screen-specs/shared/01-navigation.md` §Customer; `docs/screen-specs/customer/04-portal-home.md`
- **Scope notes:** `(customer)` route group under `/portal` with nav `Home | Schedule | My Bookings | Profile | Achievements(TBD)`, a mock route guard that redirects an unauthenticated mock principal to `/login`, and the booking-flow sub-routes. Also the three auth routes (`/login`, `/sign-up`, `/forgot-password`) with their own minimal layout.
- **Acceptance criteria:**
  - [ ] All 13 customer routes from the route map resolve and render within the correct layout.
  - [ ] Mock guard redirects guests away from `/portal/*` and preserves the intended destination.
  - [ ] Achievements nav item is present and labelled TBD (spec requires the nav item).
  - [ ] Booking flow routes preserve the selected session id across steps.
  - [ ] Auth routes do not render the portal nav.
- **Out of scope:** Screen content (`FE-CUS-*`).
- **Phase:** P1

#### FE-FND-009 — Admin portal route shell

- **Lane:** FE
- **Depends on:** FE-FND-006, FE-SHR-001
- **Source docs:** `docs/screen-specs/shared/01-navigation.md` §Admin (+ reporting addition); `docs/screen-specs/admin/01-login.md`
- **Scope notes:** `apps/admin` shell using a Jabkit application shell + sidebar, with the nav order the spec prescribes: Dashboard, Schedule, Bookings, Payments, Cancellations, Reschedules, Customers, Coaches, Classes, **Reports**, Staff, Settings. Login is a standalone route with **no sign-up and no forgot-password link**.
- **Acceptance criteria:**
  - [ ] All 14 admin routes resolve and render inside the shell (login excepted).
  - [ ] Sidebar order matches `shared/01-navigation.md` exactly, including Reports between Classes and Staff.
  - [ ] No public sign-up or forgot-password affordance exists anywhere in the admin app.
  - [ ] Mock guard redirects a non-admin principal to `/login`.
  - [ ] Shell is usable on tablet width (admins operate at the counter).
- **Out of scope:** Screen content (`FE-ADM-*`).
- **Phase:** P1

#### FE-FND-010 — Shared mock upload and image-preview primitive

- **Lane:** FE
- **Depends on:** FE-FND-003, FE-FND-005
- **Source docs:** `docs/screen-specs/customer/10-gcash-proof-upload.md`; `docs/screen-specs/admin/07-coach-management.md` §Profile photo management; `docs/screen-specs/shared/03-empty-error-states.md` ("Proof upload failed")
- **Scope notes:** One component used by both the GCash proof upload and the coach photo manager: choose file → local preview → submit (mocked) → success/failure states, plus replace and remove. Built on Jabkit `attachment` / `image-cropper` / `aspect-ratio`. No bytes leave the browser this phase.
- **Acceptance criteria:**
  - [ ] Preview renders before "submit" in both consumers.
  - [ ] Replace leaves exactly one active image; remove returns to the designed fallback state (never a broken image).
  - [ ] Upload-failure state is reachable via the mock failure toggle and matches `shared/03`.
  - [ ] Non-image and oversize files are rejected with an inline message.
  - [ ] Keyboard and screen-reader accessible (labelled control, announced state changes).
  - [ ] No network request is made.
- **Out of scope:** Real storage (`BE-021`, `BE-033`).
- **Phase:** P1

#### FE-FND-011 — FE quality gate: Storybook, a11y, and visual review

- **Lane:** FE
- **Depends on:** FE-FND-003, INF-007
- **Source docs:** `docs/screen-specs/shared/03-empty-error-states.md` ("Prefer localized skeletons/errors over full-page spinners")
- **Scope notes:** Establish the bar every screen ticket is measured against: a Storybook story per screen-level component including its empty/loading/error variants, automated a11y checks in Storybook, and responsive review at the three breakpoints the specs mandate (mobile day / tablet week / desktop month for calendar surfaces).
- **Acceptance criteria:**
  - [ ] Storybook builds in CI and fails on a11y violations above the agreed severity.
  - [ ] A documented screen-ticket checklist exists (states, breakpoints, a11y, no raw enums, no invented fields) and is linked from every FE ticket.
  - [ ] Full-page spinners are flagged in review; localized skeletons are the default.
  - [ ] Breakpoint set is defined once and reused.
- **Out of scope:** End-to-end tests against a backend.
- **Phase:** P1

#### FE-FND-012 — Money, date, and timezone formatting utilities

- **Lane:** FE
- **Depends on:** FE-FND-001
- **Source docs:** `docs/business-requirements/22-inventory-and-sales-reporting.md` (₱ amounts throughout); `docs/facebook-findings/findings.md` §3 ("Times appear to be Cebu local time"); `docs/screen-specs/customer/09-payment-method.md` (hold deadline display)
- **Scope notes:** Shared helpers for peso formatting, session date/time ranges, relative deadlines ("Reservation held until …"), and `Asia/Manila` handling. Every screen uses them; none formats inline.
- **Acceptance criteria:**
  - [ ] Currency renders as ₱ with consistent decimal handling across public, customer, and admin surfaces.
  - [ ] Session times render in `Asia/Manila` regardless of the viewer's device timezone, and the timezone assumption is documented.
  - [ ] Deadline rendering handles the `min(hold, class start)` cap correctly in display text (never shows a deadline after class start).
  - [ ] Unit tests cover DST-free but cross-midnight and same-day-start edge cases.
  - [ ] No inline `toLocaleString` calls remain in screen code (lint rule or review item).
- **Out of scope:** Server-side formatting.
- **Phase:** P1

---

### 5.2 Shared systems tickets

#### FE-SHR-001 — Navigation system (public, customer, admin)

- **Lane:** FE
- **Depends on:** FE-FND-004
- **Source docs:** `docs/screen-specs/shared/01-navigation.md`; `docs/screen-specs/public/01-landing-page.md`; `docs/screen-specs/customer/04-portal-home.md`
- **Scope notes:** Implement the three nav sets exactly as specced — public (`Schedule, Classes, Coaches, About, FAQs, Contact, Login/Profile`), customer (`Home/My Bookings, Schedule, Profile, Achievements(TBD)`), admin (12 items in the prescribed order, Reports included). Handles active state, mobile collapse, and the guest/customer header swap.
- **Acceptance criteria:**
  - [ ] Each nav set matches its spec item-for-item and in order; no extra items.
  - [ ] Active state is correct for nested routes.
  - [ ] Mobile navigation is reachable and operable by keyboard.
  - [ ] Public "Schedule" and "Classes" resolve to the landing calendar (documented as OQ-NAV, not a new page).
  - [ ] Admin nav is absent from `apps/web` and vice versa.
- **Out of scope:** Inventing a Classes page.
- **Phase:** P1

#### FE-SHR-002 — Status language and status-badge system

- **Lane:** FE
- **Depends on:** FE-FND-005
- **Source docs:** `docs/screen-specs/shared/02-status-language.md`; `docs/business-requirements/09-reservation-lifecycle.md`; `docs/screen-specs/customer/04-portal-home.md` ("Use human-readable statuses, never raw enum names")
- **Scope notes:** A single mapping module and badge component implementing the spec's table verbatim:

  | Internal | Customer label |
  | --- | --- |
  | `WAITLISTED` | Waitlisted |
  | `HELD_AWAITING_PAYMENT` | Reserved — Payment Needed |
  | `PAYMENT_SUBMITTED` | Payment Under Review |
  | `CONFIRMED` | Confirmed |
  | `CANCELLATION_REQUESTED` | Cancellation Requested |
  | `RESCHEDULE_REQUESTED` | Reschedule Requested |
  | `CANCELLED` | Cancelled |
  | `REJECTED` | Not Confirmed |
  | `EXPIRED` | Reservation Expired |
  | `CHECKED_IN` | Checked In |
  | `COMPLETED` | Completed |
  | `NO_SHOW` | No-show |
  | `REFUND_PENDING` | Refund Pending |
  | `REFUNDED` | Refunded |

- **Acceptance criteria:**
  - [ ] All 14 rows implemented with exactly the spec's customer-facing strings (including the em dash in "Reserved — Payment Needed").
  - [ ] A type-level exhaustiveness check fails compilation if a new status lacks a label.
  - [ ] A lint rule or test fails if a raw enum value can reach the DOM.
  - [ ] Badge variants are visually distinguishable without relying on colour alone (accessibility).
  - [ ] Storybook shows every status in every surface variant (customer badge, admin table cell).
- **Out of scope:** Deciding new statuses.
- **Phase:** P1

#### FE-SHR-003 — Empty, loading, and error state library

- **Lane:** FE
- **Depends on:** FE-FND-005, FE-FND-011
- **Source docs:** `docs/screen-specs/shared/03-empty-error-states.md`
- **Scope notes:** Build reusable components for the exact states the spec enumerates:
  - **Calendar:** no sessions for selected date/period; filter returns no results; schedule failed to load; session became full while being viewed.
  - **Customer:** no bookings yet; no upcoming bookings; no history; proof upload failed; reservation expired.
  - **Admin:** no pending payments; no cancellation requests; no reschedule requests; no customers found; no sessions scheduled; no staff found.

  The spec mandates localized skeletons/errors over full-page spinners.
- **Acceptance criteria:**
  - [ ] All 15 enumerated states exist as reusable, copy-configurable components.
  - [ ] Each consuming screen wires the states its spec names (verified in the screen tickets' ACs).
  - [ ] No full-page spinner exists in any screen.
  - [ ] "Session became full while being viewed" is demonstrable via the mock harness.
  - [ ] Error states offer a retry affordance where retry is meaningful.
  - [ ] Storybook covers every state.
- **Out of scope:** Real error taxonomies from the API.
- **Phase:** P1

#### FE-SHR-004 — Marketing asset integration layer

- **Lane:** FE
- **Depends on:** FE-FND-004, ASSET-002
- **Source docs:** `docs/screen-specs/shared/04-marketing-image-generation.md`; `docs/screen-specs/public/05-coaches.md` §Coach image source; `docs/screen-specs/public/01-landing-page.md` §Coach image source
- **Scope notes:** How generated imagery enters the app: an asset manifest (id, page, slot, aspect ratio, source prompt reference, alt text), responsive image components honouring the specced aspect ratios (16:9, 3:2, 1:1, 21:9, 4:3, 3:1, 4:5), and the coach-photo rule — coach imagery always comes from the coach record (mocked this phase), never hardcoded per page, with a designed placeholder avatar when absent.
- **Acceptance criteria:**
  - [ ] Asset manifest exists and every public-page image slot references it.
  - [ ] Each image renders at the aspect ratio its prompt specifies, without layout shift.
  - [ ] Coach images resolve from the coach fixture; a coach with no photo shows the placeholder, never a broken image.
  - [ ] Alt text exists for every decorative-vs-informative image, with decorative images correctly marked.
  - [ ] No generated image contains product UI (reviewer checklist item from the shared spec).
  - [ ] Missing asset falls back gracefully rather than breaking the layout.
  - [ ] Approved assets from the Assets track are consumed from the local/bundled asset path this phase; no Storage URL is fetched at runtime (that is `WIRE-012`).
- **Out of scope:** Generating the images ([Section 7](#7-assets--higgsfield-generation-track)); serving from Supabase Storage (`WIRE-012`).
- **Phase:** P2

#### FE-SHR-005 — Responsive calendar component (mock)

- **Lane:** FE
- **Depends on:** FE-FND-005, FE-FND-012
- **Source docs:** `docs/screen-specs/README.md` ("Mobile = day view, tablet = week view, desktop = month view"); `docs/screen-specs/public/01-landing-page.md`; `docs/screen-specs/customer/07-schedule.md`; `docs/screen-specs/shared/03-empty-error-states.md` §Calendar
- **Scope notes:** The product's hero component, shared by the public landing page and the customer schedule. Responsive contract is fixed: **mobile = day**, **tablet = week**, **desktop = month**. A selected-day/session panel shows class, time, coach, price, remaining slots, and the primary action (`Reserve` / `Join Waitlist`). Class filters (`All / Yoga / Boxing / Capoeira` in the specs; driven by fixture classes in practice). Non-reservable conditions must be visibly distinct: full, closed (past cutoff), past, cancelled. Build in code — the shared marketing spec is explicit that the calendar must not be a generated image.
- **Acceptance criteria:**
  - [ ] All three breakpoint views render and switch at the defined breakpoints.
  - [ ] Session panel shows exactly the fields the specs list; **never** a coach rate.
  - [ ] Remaining-slot display and the four non-reservable conditions are each demonstrable from fixtures.
  - [ ] `Reserve` vs `Join Waitlist` swaps correctly based on availability.
  - [ ] For a guest principal, the action routes to login and preserves the selected session.
  - [ ] All four calendar empty/error states from `shared/03` are wired.
  - [ ] Keyboard navigation between days and sessions works; the selected day is announced.
  - [ ] Customer variant can mark the viewer's own existing bookings on the calendar (`customer/07`).
- **Out of scope:** Real availability data; booking submission.
- **Phase:** P2

---

## 6. FE screen tickets

> Every ticket in this section is **mock-only**. Common acceptance criteria apply to all of them (from `FE-FND-011`) and are not repeated per ticket:
>
> - Renders at mobile (360 px), tablet, and desktop widths.
> - All states the screen's spec and `shared/03-empty-error-states.md` require are implemented and reachable from the mock harness.
> - No raw enum strings reach the DOM (`FE-SHR-002`).
> - Built from Jabkit components; no bespoke component where a registry one fits.
> - Storybook story exists, including empty/loading/error variants; a11y checks pass.
> - No field, tab, action, or section exists that the screen spec does not list.
> - No coach compensation data appears on any public or customer surface.

### 6.1 Public screens

#### FE-PUB-001 — Landing page (calendar hero)

- **Lane:** FE
- **Depends on:** FE-FND-007, FE-SHR-005, FE-SHR-004
- **Source docs:** `docs/screen-specs/public/01-landing-page.md`; `docs/business-requirements/14-customer-flows.md` Flow A; `docs/business-requirements/01-product-context.md`
- **Scope notes:** Section order is fixed by the spec: header → small hero copy ("Find your balance. Choose a class and reserve your spot.") → **interactive calendar hero** → selected day/session panel → How it works → Classes → Coaches → About Balanse → Location / walk-in QR explanation → final CTA (scrolls to schedule) → footer. Rules from the spec: guests may browse; `Reserve`/`Join Waitlist` triggers auth and **must preserve the selected session through login**; full/closed/past/cancelled sessions are not reservable. The walk-in explanation reflects `04-auth-and-profile.md` §Walk-in (scan QR → sign in → book in the same system). Coach previews reuse the coach record's photo, never hardcoded imagery. Asset slots A–D from the spec are consumed via `FE-SHR-004`.
- **Acceptance criteria:**
  - [ ] All ten sections present in the specified order; nothing added.
  - [ ] Calendar is the visual hero above the fold on desktop.
  - [ ] Guest clicking Reserve lands on `/login` and returns to the same session after mock login.
  - [ ] Each of the four non-reservable conditions renders distinctly in the session panel.
  - [ ] Coach previews pull from the coach fixture and show the placeholder when a photo is missing.
  - [ ] Walk-in section explains the QR flow without implying a separate booking channel.
  - [ ] Final CTA scrolls to the calendar rather than navigating away.
  - [ ] Hero background asset never reduces calendar legibility (contrast check with the asset in place).
- **Out of scope:** Real availability; a separate Schedule page.
- **Phase:** P2

#### FE-PUB-002 — About page

- **Lane:** FE
- **Depends on:** FE-FND-007, FE-SHR-004
- **Source docs:** `docs/screen-specs/public/02-about.md`; `docs/facebook-findings/findings.md` §1, §5
- **Scope notes:** Spec blocks: About Balansé + short positioning statement → Our Approach (Movement | Wellness | Community) → What You Can Do (class families) → Meet the Team (coach previews) → How Booking Works (Calendar → Reserve → Pay → Confirm) → `[View Schedule]`. Spec says "keep it concise and booking-oriented". Positioning copy can draw on the page bio in `findings.md` §1 (holistic wellness, movement, fitness education, recovery, tranquility, workshops, community) — do not invent claims beyond it. Class families from `findings.md` §3: Yoga, Mat Pilates, Calisthenics, Caliyoga, Circuit Training, Kickboxing, Kids Classes, Dance Fitness.
- **Acceptance criteria:**
  - [ ] All six blocks present, in order, concise.
  - [ ] Coach previews reuse the coach record (no page-local coach images).
  - [ ] "How Booking Works" states the four steps in the spec's order and matches the real MVP flow (admin confirms).
  - [ ] `[View Schedule]` routes to the landing calendar.
  - [ ] Copy makes no claim absent from the Facebook findings or business docs.
  - [ ] Asset slots A–C are wired via the manifest.
- **Out of scope:** Team bios (none exist in the source docs — `findings.md` §4 notes no coach bios were visible).
- **Phase:** P2

#### FE-PUB-003 — Contact page

- **Lane:** FE
- **Depends on:** FE-FND-007, FE-SHR-004
- **Source docs:** `docs/screen-specs/public/03-contact.md`; `docs/facebook-findings/findings.md` §2
- **Scope notes:** Spec blocks: contact details (phone/email/socials) and location/map action (address/opening hours) → "Walking in?" section (scan the Balanse QR and reserve through the same booking system) → optional contact form (Name | Email | Message | Send). Critical rule from the spec: **contact channels must not be framed as a separate booking channel**. Real values available from `findings.md` §2: phone `+63 968 220 9198`, email `balanse.wellnesshub@gmail.com`, address `Unit 2A, Capitol Centrum Building, N Escario, Cebu City, 6000`, Instagram/TikTok `@balanse.wellness`, WhatsApp `+63 917 722 2040`, Messenger. **Opening hours were not exposed in the findings** — render an empty/"contact us" state, do not invent hours.
- **Acceptance criteria:**
  - [ ] Contact details render the verified values above; no invented hours.
  - [ ] Copy never invites the visitor to book via message/phone/WhatsApp.
  - [ ] Walk-in section restates the QR → account → book flow.
  - [ ] Contact form is mocked: validation, submitting state, success and failure states, no network call.
  - [ ] Map action is a link/placeholder, not a fabricated storefront image.
  - [ ] Asset slots A–B wired via the manifest.
- **Out of scope:** Real form delivery; a booking-by-message path.
- **Phase:** P2

#### FE-PUB-004 — FAQs page

- **Lane:** FE
- **Depends on:** FE-FND-007
- **Source docs:** `docs/screen-specs/public/04-faqs.md`; `docs/business-requirements/02-mvp-scope.md`; `21-canonical-rules.md`
- **Scope notes:** Spec structure: search field, then grouped questions — Booking (need an account? book for someone else? multiple classes in one day?), Payment (GCash? Pay at Counter? is payment automatically confirmed?), Waitlist, Cancellation/Reschedule, Walk-ins, then `[Contact Us]`. The spec fixes the canonical answers: account required to reserve; no booking for others; manual GCash/cash; admin confirms; FIFO waitlist; cancellation/reschedule are requests; walk-ins still use the app. **Cancellation/reschedule answers must not state a deadline or a refund-eligibility rule** (⛔ OQ-1, OQ-2) — describe the request workflow only.
- **Acceptance criteria:**
  - [ ] All five groups and the listed questions are present.
  - [ ] Every answer matches the canonical answers in the spec; no invented policy.
  - [ ] Cancellation/reschedule answers contain no timing or refund-eligibility claim.
  - [ ] Search filters questions client-side, with the "no results" state wired.
  - [ ] Content-first layout with at most one accent image (spec constraint).
  - [ ] `[Contact Us]` routes to `/contact`.
- **Out of scope:** A policy/terms page (no screen spec exists).
- **Phase:** P2

#### FE-PUB-005 — Coaches page

- **Lane:** FE
- **Depends on:** FE-FND-007, FE-SHR-004
- **Source docs:** `docs/screen-specs/public/05-coaches.md`; `docs/facebook-findings/findings.md` §4b; `docs/business-requirements/03-roles-and-permissions.md` §Coach-rate privacy
- **Scope notes:** Header + specialty filter chips (`All / Yoga / Boxing / Capoeira` per the spec; in practice generated from fixture specialties) + coach cards (Photo | Name | Specialty | Short bio | `[View Classes]`). `View Classes` focuses/filters the public schedule; no coach self-service is implied. Coach photos come from the coach record with a designed placeholder fallback. Seed from the confirmed roster in `findings.md` §4b. **No rate, rate type, or cost may appear.**
- **Acceptance criteria:**
  - [ ] Cards render the four specced fields plus the action, nothing more.
  - [ ] Filter chips filter the list and have a no-results state.
  - [ ] `[View Classes]` navigates to the landing calendar with that coach's filter applied.
  - [ ] A coach without a photo renders the placeholder avatar.
  - [ ] Automated test asserts no rate/cost field is present in the rendered output or in the props passed to the page.
  - [ ] Roster matches `findings.md` §4b exactly.
- **Out of scope:** Coach detail pages (no spec); coach login.
- **Phase:** P2

---

### 6.2 Customer screens

#### FE-CUS-001 — Customer login

- **Lane:** FE
- **Depends on:** FE-FND-008, FE-FND-006
- **Source docs:** `docs/screen-specs/customer/01-login.md`; `docs/business-requirements/04-auth-and-profile.md`
- **Scope notes:** Layout per spec: BALANSÉ wordmark, "Welcome back", `[Continue with Google]`, divider, Email, Password, `[Log In]`, `[Forgot Password]`, "New here? `[Create Account]`". Rule: **if entered from booking, return to the selected session after login.** Use Jabkit `login4`.
- **Acceptance criteria:**
  - [ ] All controls in the spec are present and in order; Google is the primary path.
  - [ ] Mock login as a customer redirects back to the originally selected session when entered from a Reserve action, and to `/portal` otherwise.
  - [ ] Validation, submitting, and invalid-credential states exist (mocked).
  - [ ] Links to sign-up and forgot-password work.
  - [ ] Form is keyboard-operable with correct autocomplete attributes.
- **Out of scope:** Real authentication.
- **Phase:** P3

#### FE-CUS-002 — Customer sign-up

- **Lane:** FE
- **Depends on:** FE-FND-008
- **Source docs:** `docs/screen-specs/customer/02-sign-up.md`; `docs/business-requirements/04-auth-and-profile.md`; `20-open-questions.md` §3
- **Scope notes:** Spec fields: `[Continue with Google]`, divider, Full name, Email, Contact number, Password, Confirm password, `[Create Account]`, "Already have an account? `[Log In]`". The spec says exact required profile fields remain subject to Coach Rex (**⛔ OQ-3**) — build exactly these fields and do not add DOB, emergency contact, or health declarations. There must be **no** "book for someone else" affordance.
- **Acceptance criteria:**
  - [ ] Exactly the specced fields, no more.
  - [ ] Client-side validation with field-level errors; password confirmation mismatch handled.
  - [ ] Mock submission creates a mock customer principal and lands in the portal.
  - [ ] No sensitive field is added pending OQ-3; a code comment or ADR records why.
  - [ ] Google path is visually primary, matching the spec order.
- **Out of scope:** Email verification flows (not specced).
- **Phase:** P3

#### FE-CUS-003 — Forgot password

- **Lane:** FE
- **Depends on:** FE-FND-008
- **Source docs:** `docs/screen-specs/customer/03-forgot-password.md`
- **Scope notes:** "Reset your password", Email, `[Send Reset Link]`, `[Back to Login]`. The spec names four states explicitly: **initial, submitted, invalid email, expired link/retry**. Use Jabkit `forgot-password2`.
- **Acceptance criteria:**
  - [ ] All four specced states are implemented and reachable from the mock harness.
  - [ ] Submitted state does not disclose whether an account exists.
  - [ ] Expired-link state offers a retry path.
  - [ ] `[Back to Login]` works.
- **Out of scope:** Real email delivery.
- **Phase:** P3

#### FE-CUS-004 — Portal home / My Bookings

- **Lane:** FE
- **Depends on:** FE-FND-008, FE-SHR-002, FE-SHR-003
- **Source docs:** `docs/screen-specs/customer/04-portal-home.md`; `docs/business-requirements/18-notifications-and-confirmations.md`
- **Scope notes:** Spec blocks: nav → "Welcome, [Name]" → **UPCOMING** (confirmed booking card) → **NEEDS ATTENTION** (payment needed / payment under review / request pending) → **MY BOOKINGS** with `[Upcoming] [Pending] [History]` tabs → `[Browse Schedule]`. This screen is the MVP's primary status surface (`18-notifications-and-confirmations.md`: the in-app profile/dashboard is the source of truth), so every status in `shared/02-status-language.md` must be presentable here. Spec rule: human-readable statuses only.
- **Acceptance criteria:**
  - [ ] All five blocks present in order; three tabs functional.
  - [ ] Needs Attention surfaces exactly the three categories the spec lists, driven by booking status.
  - [ ] Every status from the status table renders correctly in the list (fixture-driven test).
  - [ ] Empty states wired: no bookings yet / no upcoming bookings / no history (`shared/03`).
  - [ ] Booking cards link to `customer/11` booking detail.
  - [ ] "Reserved — Payment Needed" cards show the hold deadline using `FE-FND-012` formatting.
- **Out of scope:** Notifications/email.
- **Phase:** P3

#### FE-CUS-005 — Customer profile

- **Lane:** FE
- **Depends on:** FE-FND-008
- **Source docs:** `docs/screen-specs/customer/05-profile.md`; `docs/business-requirements/04-auth-and-profile.md`; `07-booking-form-and-waivers.md` §Version tracking
- **Scope notes:** Spec blocks: PROFILE (Full name, Email, Contact number, `[Save]`) → ACCOUNT (auth method, change password when applicable) → POLICY / WAIVER HISTORY (accepted versions summary). "Profile data pre-fills booking forms" — so the fixture profile must be the same object the booking form reads.
- **Acceptance criteria:**
  - [ ] Three blocks present with exactly the specced fields.
  - [ ] "Change password" appears only for the email/password mock principal, not for the Google principal.
  - [ ] Policy history lists document, version, and accepted date.
  - [ ] Saving updates the mock profile and the change is visible in the booking form prefill.
  - [ ] Validation and saved/failed states exist.
  - [ ] No additional profile fields are introduced (OQ-3).
- **Out of scope:** Account deletion; sensitive fields.
- **Phase:** P3

#### FE-CUS-006 — Achievements (TBD placeholder)

- **Lane:** FE
- **Depends on:** FE-FND-008
- **Source docs:** `docs/screen-specs/customer/06-achievements-tbd.md`
- **Scope notes:** The entire spec is a placeholder: "ACHIEVEMENTS / Coming soon / TBD" with possible future directions (attendance milestones, class variety, streaks, wellness goals) listed as **ideas only**. Hard rule: **do not implement XP, badges, rewards, or scoring until rules are defined.** Jabkit `coming-soon-3` is a reasonable base.
- **Acceptance criteria:**
  - [ ] Route exists, nav item is present and marked TBD, page renders a coming-soon state.
  - [ ] No badge, point, streak, level, or score element is rendered anywhere.
  - [ ] Any mention of future ideas is clearly framed as not-yet-available.
  - [ ] Page contains no fabricated achievement data.
- **Out of scope:** All achievement mechanics.
- **Phase:** P3

#### FE-CUS-007 — Customer schedule

- **Lane:** FE
- **Depends on:** FE-SHR-005, FE-FND-008
- **Source docs:** `docs/screen-specs/customer/07-schedule.md`; `docs/screen-specs/README.md` (responsive contract)
- **Scope notes:** Authenticated variant of the calendar: filters, interactive calendar, selected session panel, `[Reserve]` / `[Join Waitlist]`. Because the user is already authenticated, **Reserve goes directly to the booking form** (no auth interstitial). The customer's existing bookings may be marked on the calendar.
- **Acceptance criteria:**
  - [ ] Reserve navigates straight to `/portal/book/[sessionId]`.
  - [ ] Join Waitlist appears only for full sessions and leads to the waitlist confirmation path.
  - [ ] The viewer's own bookings are visually marked on the calendar.
  - [ ] Mobile/tablet/desktop views follow the day/week/month contract.
  - [ ] All four calendar empty/error states are wired, including "session became full while being viewed".
  - [ ] Sessions past the cutoff are shown as closed rather than silently missing.
- **Out of scope:** Real booking creation.
- **Phase:** P3

#### FE-CUS-008 — Booking form

- **Lane:** FE
- **Depends on:** FE-CUS-007, FE-FND-005
- **Source docs:** `docs/screen-specs/customer/08-booking-form.md`; `docs/business-requirements/07-booking-form-and-waivers.md`; `21-canonical-rules.md` [R10–R13]
- **Scope notes:** Spec blocks: "RESERVE YOUR SPOT" → session summary (class | date | time | coach | price) → YOUR DETAILS (Name, Email, Contact — **prefilled** from profile) → WAIVERS / POLICIES (checkbox per required document with version, e.g. "Waiver vX", "Gym Policy vX") → `[Continue to Payment]`. Hard rules: customer books only for themselves (no attendee field, no "book for someone else"); required acceptance must be affirmative and blocks progress; the accepted version is recorded. Waiver text is **placeholder only** (⛔ OQ-4) and must be visibly labelled as such in mocks.
- **Acceptance criteria:**
  - [ ] Session summary shows exactly the five specced fields (no coach rate).
  - [ ] Details prefill from the mock profile and are editable where the spec allows.
  - [ ] `[Continue to Payment]` is disabled until every required policy checkbox is ticked.
  - [ ] Checkbox labels display the document name **and version**.
  - [ ] No attendee/"someone else" control exists anywhere on the form.
  - [ ] Placeholder waiver content is unmistakably marked as placeholder.
  - [ ] Submitting advances to `customer/09` carrying the session context.
- **Out of scope:** Real waiver text; re-acceptance cadence (OQ-5).
- **Phase:** P3

#### FE-CUS-009 — Payment method selection

- **Lane:** FE
- **Depends on:** FE-CUS-008, FE-FND-012
- **Source docs:** `docs/screen-specs/customer/09-payment-method.md`; `docs/business-requirements/08-payment-rules.md`; `21-canonical-rules.md` [R28–R31]
- **Scope notes:** Spec: "PAYMENT" → "Reservation held until: [deadline]" → radio `( ) GCash` / `( ) Pay at Counter` → `[Continue]`. The deadline display must respect `min(reserved_at + 8h, class start)`. The spec is explicit that hold duration is developer-controlled — **no UI to change it**.
- **Acceptance criteria:**
  - [ ] Hold deadline renders from mock data and is never later than session start (fixture covers the capped case, e.g. 1:00 AM reservation for an 8:00 AM class).
  - [ ] Exactly two payment options; no gateway options appear.
  - [ ] GCash continues to `customer/10`; Pay at Counter continues to the booking detail with counter instructions.
  - [ ] No control exposes or implies an editable hold duration.
  - [ ] A near-expiry / expired-hold state is demonstrable (`shared/03` "Reservation expired").
- **Out of scope:** Real payment processing.
- **Phase:** P3

#### FE-CUS-010 — GCash proof upload

- **Lane:** FE
- **Depends on:** FE-CUS-009, FE-FND-010
- **Source docs:** `docs/screen-specs/customer/10-gcash-proof-upload.md`; `docs/business-requirements/08-payment-rules.md` §GCash; `20-open-questions.md` §8
- **Scope notes:** Spec blocks: "GCASH PAYMENT" → Amount → GCash QR / details → Instructions → "UPLOAD PROOF" (`[Choose Image]`, Preview, `[Submit Proof]`) → status after submit: **Payment Under Review**. Hard rule: uploading proof does **not** auto-confirm the booking. **⛔ OQ-8** — whether a reference number, amount, or payer name is required is undecided; do **not** add required fields for them.
- **Acceptance criteria:**
  - [ ] Amount and GCash details render from mock settings, not hardcoded.
  - [ ] Choose → preview → submit flow works with no network call.
  - [ ] After submit, the booking status displays "Payment Under Review" and nothing implies confirmation.
  - [ ] "Proof upload failed" state from `shared/03` is reachable.
  - [ ] No required reference-number/payer-name field is introduced (OQ-8).
  - [ ] Non-image or oversize selections are rejected inline.
- **Out of scope:** Real upload and admin review.
- **Phase:** P3

#### FE-CUS-011 — Booking detail

- **Lane:** FE
- **Depends on:** FE-CUS-004, FE-SHR-002
- **Source docs:** `docs/screen-specs/customer/11-booking-detail.md`; `docs/business-requirements/18-notifications-and-confirmations.md` §Confirmed booking view; `13-check-in-attendance-and-no-show.md`; `20-open-questions.md` §9
- **Scope notes:** Spec blocks: BOOKING STATUS (class | date | time | coach | price | reference) → PAYMENT (method | payment status) → ACTIONS (`[Request Reschedule]`, `[Request Cancellation]`). A confirmed booking must be showable to staff and carry customer identity, class/session, date/time, status, and reference (`18-...`), but it is **not** an official receipt — label it accordingly. **⛔ OQ-9** — reference format (human-readable code vs QR vs in-app only) is undecided; render the mock reference as plain text and do **not** ship a QR code.
- **Acceptance criteria:**
  - [ ] All three blocks render with exactly the specced fields.
  - [ ] Payment status and booking status are shown as **separate** values.
  - [ ] Action buttons are present/absent according to booking status (e.g. no cancellation request on an already cancelled booking) and every variant is demonstrable.
  - [ ] Confirmed view includes the customer's identity and is visually suitable to show at the counter.
  - [ ] Copy states this is a booking confirmation, not an official receipt.
  - [ ] No QR code is rendered (OQ-9).
- **Out of scope:** Check-in from the customer side (admin-only in MVP).
- **Phase:** P3

#### FE-CUS-012 — Cancellation request

- **Lane:** FE
- **Depends on:** FE-CUS-011
- **Source docs:** `docs/screen-specs/customer/12-cancellation-request.md`; `docs/business-requirements/11-cancellations-and-refunds.md`; `21-canonical-rules.md` [R42, R43, R45]
- **Scope notes:** Spec: "REQUEST CANCELLATION" → booking summary → Reason (optional unless later required) → notice that the request is reviewed manually and any applicable refund is manual → `[Submit Request]`. The request does **not** immediately free the slot, and the UI must not imply that money has been refunded. **⛔ OQ-1** — no deadline or eligibility messaging.
- **Acceptance criteria:**
  - [ ] Reason field is optional.
  - [ ] The manual-review and manual-refund notice text is present and unambiguous.
  - [ ] After submit, the booking shows "Cancellation Requested" and the slot is still presented as held.
  - [ ] No copy states or implies a cancellation deadline, refund eligibility, or automatic refund (OQ-1).
  - [ ] Submitting state, success state, and failure state exist.
- **Out of scope:** Admin resolution.
- **Phase:** P3

#### FE-CUS-013 — Reschedule request

- **Lane:** FE
- **Depends on:** FE-CUS-011, FE-SHR-005
- **Source docs:** `docs/screen-specs/customer/13-reschedule-request.md`; `docs/business-requirements/12-rescheduling.md`; `20-open-questions.md` §2
- **Scope notes:** Spec: CURRENT BOOKING → SELECT PREFERRED NEW SESSION (available session list/calendar) → `[Submit Reschedule Request]`. The spec itself lists the open rules: same-class restriction, price differences, cutoff, max reschedules, full-target behaviour. **⛔ OQ-2** — implement **none** of them: show available sessions, let the customer pick one, submit the request, and state that admin will review.
- **Acceptance criteria:**
  - [ ] Current booking summary and target-session picker both render.
  - [ ] No price-difference message, no eligibility blocking, no reschedule-count limit, and no cutoff enforcement appears (OQ-2).
  - [ ] After submit, the booking shows "Reschedule Requested" and keeps its slot.
  - [ ] Copy makes clear that admin reviews and resolves the request.
  - [ ] Empty state when no alternative sessions are available.
  - [ ] Full target sessions are visible but clearly marked full, with no invented waitlist-transfer behaviour.
- **Out of scope:** Everything under OQ-2.
- **Phase:** P3

---

### 6.3 Admin screens

> Additional standing rule for this whole subsection: coach compensation, coach cost, and financial report data are **admin-only** [R67, R68]. Admin screens may show them; no component built here may be reused on a public or customer surface without stripping those fields.
>
> Ticket range: original mocks `FE-ADM-001`–`014`, then polish `FE-ADM-015`–`032` plus `FE-SHR-007`–`013` (epic #197). The polish IDs are listed after `FE-ADM-014`.

#### FE-ADM-001 — Admin login

- **Lane:** FE
- **Depends on:** FE-FND-009
- **Source docs:** `docs/screen-specs/admin/01-login.md`; `docs/business-requirements/03-roles-and-permissions.md`
- **Scope notes:** Spec: "BALANSE ADMIN", Email, Password, `[Log In]`, and the line "Need access or password help? Contact the system administrator." Explicitly: **no public sign-up, no forgot-password page in MVP.**
- **Acceptance criteria:**
  - [ ] Only the specced controls exist; the help line is present verbatim in intent.
  - [ ] No sign-up link, no forgot-password link, anywhere in the admin app.
  - [ ] Mock login as an admin principal enters the dashboard; a non-admin principal is rejected with a clear message.
  - [ ] Invalid-credential and submitting states exist.
  - [ ] No Google sign-in button (the spec shows email/password only for admin).
- **Out of scope:** Real auth; admin self-service recovery.
- **Phase:** P4

#### FE-ADM-002 — Admin dashboard

- **Lane:** FE
- **Depends on:** FE-FND-009, FE-SHR-002, FE-SHR-003
- **Source docs:** `docs/screen-specs/admin/02-dashboard.md`; `docs/business-requirements/15-admin-flows.md`
- **Scope notes:** Spec blocks: counter tiles `[Today's Classes] [Pending Payments] [Cancellations] [Reschedules] [Waitlisted]` → **NEEDS ATTENTION** (Payment proof → Review, Cancellation → Review, Reschedule → Review) → **TODAY'S SCHEDULE** table (Time | Class | Coach | Capacity | Status). Optional lightweight financial cards named by the spec: Today's Sales, Pending Refunds, Today's Occupancy, Coach Cost Today. The spec's rule: **prioritise operational actions over analytics** — detailed analysis belongs in Reports.
- **Acceptance criteria:**
  - [ ] Five counter tiles and the three Needs Attention rows are present and each links to its queue screen.
  - [ ] Today's schedule table shows exactly the five specced columns.
  - [ ] The four financial cards use the spec's exact labels; "Coach Cost Today" is visible only to the admin principal.
  - [ ] Action items outrank analytics visually (review checklist item).
  - [ ] Empty states for each queue ("No pending payments", etc.) are wired.
  - [ ] No chart-heavy analytics block is added here.
- **Out of scope:** Report drill-downs (`FE-ADM-014`).
- **Phase:** P4

#### FE-ADM-003 — Staff management

- **Lane:** FE
- **Depends on:** FE-FND-009
- **Source docs:** `docs/screen-specs/admin/03-staff-management.md`; `docs/business-requirements/03-roles-and-permissions.md`
- **Scope notes:** Spec: list (`Name | Role | Status | Action`) with `[Add Staff]`, and a staff detail form (Name, Email, Role, Status, `[Save]`, `[Disable Access]`). Spec note: staff roles should be designed so only authorised admins reach coach rates, sales reports, refund totals, coach-cost reports, and capacity reporting. No public admin registration.
- **Acceptance criteria:**
  - [ ] List and detail render exactly the specced fields and actions.
  - [ ] `[Disable Access]` has a confirmation step and a disabled-state presentation.
  - [ ] Add Staff is an invite/provision flow, never a public sign-up.
  - [ ] The UI documents (in-page helper text or tooltip) which capabilities the role grants, consistent with the financial-access note.
  - [ ] "No staff found" empty state wired.
- **Out of scope:** Granular permission matrices (not specced).
- **Phase:** P4

#### FE-ADM-004 — Customer management

- **Lane:** FE
- **Depends on:** FE-FND-009, FE-SHR-002
- **Source docs:** `docs/screen-specs/admin/04-customer-management.md`; `docs/business-requirements/04-auth-and-profile.md`
- **Scope notes:** Spec: CUSTOMERS list with `[Search] [Filters]` and columns `Name | Contact | Upcoming | Last Visit | View`; CUSTOMER DETAIL with six blocks — Profile; Upcoming/pending/history; Cancellation/reschedule history; Attendance/no-show history; Payment/refund history; Accepted policy versions.
- **Acceptance criteria:**
  - [ ] List columns match the spec exactly; search and filters work against fixtures with a "No customers found" empty state.
  - [ ] Detail renders all six blocks, each with its own empty state.
  - [ ] Payment/refund history shows payment status and refund status as separate values.
  - [ ] Accepted policy versions show document, version, and date.
  - [ ] Booking rows deep-link to booking management detail.
  - [ ] Only operationally necessary customer data is shown (no fields beyond the spec).
- **Out of scope:** Editing customer profiles (not specced).
- **Phase:** P4

#### FE-ADM-005 — Schedule management

- **Lane:** FE
- **Depends on:** FE-FND-009, FE-SHR-005
- **Source docs:** `docs/screen-specs/admin/05-schedule-management.md`; `docs/business-requirements/05-class-and-schedule-rules.md`; `15-admin-flows.md` Flow A, Flow F
- **Scope notes:** Spec: header with `[Duplicate Range] [Create Session]`, `[Today] [<] Month [>]` controls, admin calendar showing `Class | Coach | Capacity | Confirmed/Held/Waitlisted`, and a selected-session panel with `[View Roster] [Edit] [Make Recurring] [Cancel Session]`. Create/Edit fields: class, date, start/end, coach, price, capacity, publish/bookable state — plus the financial fields the spec adds: `Customer Price`, `Coach`, `Coach Rate`, `Coach Rate Type`, `Capacity`. Historical snapshot rule must be surfaced in the UI: editing a coach's default rate later must not rewrite this session (show the snapshot as session-owned data).
- **Acceptance criteria:**
  - [ ] Calendar shows the four specced per-session data points.
  - [ ] Create/Edit form contains every specced field including the coach-rate snapshot fields, and no others.
  - [ ] UI copy or helper text makes clear the rate shown is a session snapshot, not a live coach rate.
  - [ ] `[Cancel Session]` requires confirmation and explains that affected bookings enter manual refund handling.
  - [ ] Duplicate-range and recurring-series forms preview the generated count, default to draft, and report skipped exact matches.
  - [ ] Capacity below current consumption is rejected in the mock validation.
  - [ ] "No sessions scheduled" empty state wired.
- **Out of scope:** Holiday/exception engine, series-wide editing/deletion, coach self-service.
- **Phase:** P4

#### FE-ADM-006 — Class management

- **Lane:** FE
- **Depends on:** FE-FND-009
- **Source docs:** `docs/screen-specs/admin/06-class-management.md`
- **Scope notes:** Spec: list of classes with status and `[Edit]`, plus `[Add Class]`. Fields: name, short description, optional default duration, optional default price, active/inactive, optional associated coaches. Session-level price/capacity override defaults. **Do not store or display coach compensation as class information.**
- **Acceptance criteria:**
  - [ ] List and form contain exactly the specced fields.
  - [ ] Optional fields are genuinely optional in validation.
  - [ ] Helper text states that session values override class defaults.
  - [ ] No coach compensation field appears on this screen.
  - [ ] Active/inactive toggle affects list presentation; inactive classes are not offered when creating a session.
  - [ ] Empty state for "no classes yet".
- **Out of scope:** Class-level scheduling.
- **Phase:** P4

#### FE-ADM-007 — Coach management (incl. photo and internal rate)

- **Lane:** FE
- **Depends on:** FE-FND-009, FE-FND-010
- **Source docs:** `docs/screen-specs/admin/07-coach-management.md`; `docs/business-requirements/22-inventory-and-sales-reporting.md` §1; `docs/facebook-findings/findings.md` §4b
- **Scope notes:** The spec gives a full edit layout: **PROFILE PHOTO** (preview, `[Upload/Replace]`, `[Remove]`) → **PUBLIC PROFILE** (Name, Specialty/Classes, Short Bio, Status Active/Inactive) → **INTERNAL FINANCIALS** (Default Rate, Rate Type: Per Session / Per Hour) → `[Save Changes]`, plus an upcoming-sessions list on the detail view. Photo behaviour is specified precisely: one primary photo per coach, preview before saving, replacement without duplicate active photos, removal allowed, public pages use the current saved photo, and a deliberate fallback avatar when none exists. Privacy: photo/name/specialty/bio are public; **rate and rate type are admin-only**.
- **Acceptance criteria:**
  - [ ] All four blocks render in the spec's order with the exact field set.
  - [ ] Photo upload shows a preview before save; replace leaves one active photo; remove restores the fallback avatar.
  - [ ] Internal financials block is visually separated and labelled internal.
  - [ ] Rate and rate type never appear in any component also used by public/customer surfaces (test asserts this).
  - [ ] Upcoming assigned sessions list renders on the detail view.
  - [ ] Changing the default rate shows an explicit note that existing sessions keep their snapshot.
  - [ ] Coach list seeds from the confirmed roster.
- **Out of scope:** Coach login/self-service; rate history reporting.
- **Phase:** P4

#### FE-ADM-008 — Booking management

- **Lane:** FE
- **Depends on:** FE-FND-009, FE-SHR-002
- **Source docs:** `docs/screen-specs/admin/08-booking-management.md`; `docs/business-requirements/15-admin-flows.md` Flow B; `09-reservation-lifecycle.md`
- **Scope notes:** Spec: tabs `[Pending] [Confirmed] [Waitlisted] [Expired] [History]`, filters `[Search Customer] [Class] [Date]`, table `Customer | Class | Time | Payment | Status | Review`. Booking detail actions per the spec: confirm, reject, view proof, view policy acceptance, open cancellation/reschedule request, check in, mark no-show — and important actions should be auditable. Reporting relationship note: only paid/confirmed bookings count toward gross sales; waitlisted and unpaid-held do not; refunded bookings stay in history.
- **Acceptance criteria:**
  - [ ] All five tabs and all three filters work against fixtures, with pagination.
  - [ ] Table columns match the spec exactly; Payment and Status are distinct columns.
  - [ ] Booking detail exposes all eight specced actions, each with a confirmation step where destructive.
  - [ ] Reject requires a reason input (free text — OQ-7 keeps the taxonomy open).
  - [ ] Each action shows what will be audited (actor + timestamp) in the confirmation copy.
  - [ ] Expired/rejected/cancelled/no-show bookings remain visible in History (never hidden).
  - [ ] Every booking status from `shared/02` is representable in the table.
- **Out of scope:** Refund transfer; report totals (`FE-ADM-014`).
- **Phase:** P4

#### FE-ADM-009 — Payment review

- **Lane:** FE
- **Depends on:** FE-FND-009, FE-FND-010
- **Source docs:** `docs/screen-specs/admin/09-payment-review.md`; `docs/business-requirements/08-payment-rules.md`; `15-admin-flows.md` Flows B, C
- **Scope notes:** Spec: tabs `[GCash Pending] [Pay at Counter] [Refunds]`; row data `Customer | Session | Amount | Hold Expiry`; payment proof preview; actions `[Confirm Payment & Booking]` `[Reject]`. Pay at Counter path: find held booking → receive cash → record payment → confirm → optionally check in. Refund transfer stays manual; the app records refund status. Payment state and booking state must remain visibly distinct.
- **Acceptance criteria:**
  - [ ] Three tabs with the specced columns and a proof preview panel (zoomable image from fixtures).
  - [ ] Confirm and Reject both require confirmation; Reject captures a reason.
  - [ ] The Pay at Counter tab exposes the full record-cash → confirm → optional check-in sequence.
  - [ ] Refunds tab exposes mark-pending / mark-refunded with clear copy that money moves outside the app.
  - [ ] Hold expiry renders with the `min(hold, class start)` cap respected.
  - [ ] Payment status and booking status are shown as separate values throughout.
  - [ ] "No pending payments" empty state wired.
- **Out of scope:** Automated verification.
- **Phase:** P4

#### FE-ADM-010 — Cancellation requests

- **Lane:** FE
- **Depends on:** FE-FND-009
- **Source docs:** `docs/screen-specs/admin/10-cancellation-requests.md`; `docs/business-requirements/11-cancellations-and-refunds.md`; `15-admin-flows.md` Flow E
- **Scope notes:** Spec fields per request: Customer, Booking, Payment status, Request time, Reason; actions `[Complete Cancellation]` `[Reject Request]` `[Mark Refund Pending]` `[Mark Refunded]`. Rule: the slot stays locked until admin completes the cancellation.
- **Acceptance criteria:**
  - [ ] Queue shows the five specced fields per request.
  - [ ] All four actions present; refund actions are clearly separate from cancellation actions.
  - [ ] UI states that the slot remains locked until cancellation is completed, and the fixture behaviour demonstrates it.
  - [ ] Completing cancellation shows what happens next (slot release, possible waitlist promotion).
  - [ ] No refund-eligibility rule or deadline is enforced or implied (OQ-1).
  - [ ] "No cancellation requests" empty state wired.
- **Out of scope:** Refund execution.
- **Phase:** P4

#### FE-ADM-011 — Reschedule requests

- **Lane:** FE
- **Depends on:** FE-FND-009
- **Source docs:** `docs/screen-specs/admin/11-reschedule-requests.md`; `docs/business-requirements/12-rescheduling.md`; `15-admin-flows.md` Flow G
- **Scope notes:** Spec: CURRENT BOOKING, REQUESTED SESSION, target capacity / coach, actions `[Approve & Move]` `[Reject]`. The spec names the open rules (price differences, class-type restrictions, cutoff, target-full behaviour) — **⛔ OQ-2**, so none of them are implemented.
- **Acceptance criteria:**
  - [ ] Both bookings (current and requested) render side by side with target capacity and coach.
  - [ ] Approve & Move and Reject both require confirmation.
  - [ ] Approving into a session with no capacity is blocked by the capacity invariant, with a clear message — and no further policy is invented.
  - [ ] No price-difference UI, no class-type restriction, no cutoff enforcement (OQ-2).
  - [ ] Approval copy states that booking history is preserved.
  - [ ] "No reschedule requests" empty state wired.
- **Out of scope:** OQ-2 rules.
- **Phase:** P4

#### FE-ADM-012 — Session roster and check-in

- **Lane:** FE
- **Depends on:** FE-FND-009, FE-ADM-005
- **Source docs:** `docs/screen-specs/admin/12-session-roster-check-in.md`; `docs/business-requirements/13-check-in-attendance-and-no-show.md`; `22-inventory-and-sales-reporting.md` §6
- **Scope notes:** Spec: session header (class — date — time, coach, "9 confirmed • 2 held • 1 waitlisted"), **CONFIRMED** list (`Name | Payment | Attendance | [Check In]`), **HELD / PENDING** list, **WAITLIST (FIFO)** list. Actions: check in, mark no-show, inspect booking/payment, inspect waitlist order. Inventory metrics block: Capacity, Confirmed, Held, Available, Waitlisted, Checked In, No-show. Utilisation: Occupancy = Confirmed/Capacity and Attendance Utilisation = Checked In/Capacity, kept as **separate** metrics. No-show = no refund.
- **Acceptance criteria:**
  - [ ] Three lists render with the specced columns; waitlist is explicitly ordered FIFO and shows position.
  - [ ] All seven inventory metrics render, plus both utilisation measures as distinct values.
  - [ ] Check-in and no-show actions work per row with confirmation and optimistic state.
  - [ ] Marking no-show shows no refund affordance and states no refund is issued.
  - [ ] Screen is usable on a tablet at the counter (touch target sizes, no horizontal scroll).
  - [ ] Counts are internally consistent with the fixture (Confirmed + Held + Available = Capacity check).
- **Out of scope:** Customer self-check-in; QR scanning (OQ-9).
- **Phase:** P4

#### FE-ADM-013 — Settings

- **Lane:** FE
- **Depends on:** FE-FND-009, FE-FND-010
- **Source docs:** `docs/screen-specs/admin/13-settings.md`; `docs/business-requirements/17-developer-config.md`; `docs/facebook-findings/findings.md` §2
- **Scope notes:** Spec blocks: BUSINESS PROFILE (Name | contact | address), PAYMENT INFO (GCash details / QR), PUBLIC CONTENT (About | Contact | FAQs), POLICIES / WAIVERS (current versions). Hard rule: **do NOT expose reservation hold duration or booking cutoff** — developer-controlled. Also do not expose coach-rate visibility controls.
- **Acceptance criteria:**
  - [ ] All four blocks present with the specced fields.
  - [ ] No hold-duration or cutoff control exists anywhere in the admin app (repo-wide check).
  - [ ] GCash QR uses the shared upload primitive with preview and replace.
  - [ ] Policy/waiver block lists current versions and allows promoting a new version without editing prior ones.
  - [ ] Public content editing is plain and scoped to the three named pages — no general CMS.
  - [ ] Seeded business profile matches the Facebook findings; opening hours are left blank rather than invented.
- **Out of scope:** Developer configuration; permission toggles.
- **Phase:** P4

#### FE-ADM-014 — Sales and inventory reports

- **Lane:** FE
- **Depends on:** FE-FND-009, FE-FND-012
- **Source docs:** `docs/screen-specs/admin/14-sales-inventory-reports.md`; `docs/business-requirements/22-inventory-and-sales-reporting.md`; `15-admin-flows.md` §Review sales and inventory reports
- **Scope notes:** Spec layout: filter bar `[Date Range] [Class] [Coach] [Session Status]` → **SALES OVERVIEW** cards (Gross Sales, Refunds, Net Sales, Paid Bookings) → **CLASS PERFORMANCE** table (Class, Sessions, Revenue, Occupancy, No-shows) → **COACH COSTS** table (Coach, Sessions, Coach Cost, Related Revenue) → **SESSION PERFORMANCE** table (Date/Time, Class, Capacity, Confirmed, Revenue, Cost) → session drill-down (Capacity, Confirmed, Held, Available, Waitlisted, Checked In, No-show, Customer Price, Gross Revenue, Refunds, Coach Cost, Gross Contribution). Terminology is fixed: Gross Sales, Refunds, Net Sales, Coach Cost, Gross Contribution, Occupancy, Attendance Utilisation — and **never "profit"**.
- **Acceptance criteria:**
  - [ ] All four sections plus the drill-down render with exactly the specced columns and labels.
  - [ ] Filter bar has all four filters; date range is required.
  - [ ] The word "profit" appears nowhere on the screen (automated check).
  - [ ] Fixtures demonstrate the integrity rules: waitlisted contribute no revenue; unpaid held contribute no revenue; refunded bookings appear in refunds and remain in history; a coach-rate change does not alter historical coach cost.
  - [ ] Occupancy and Attendance Utilisation are displayed as separate metrics.
  - [ ] Screen is admin-only and its components are never imported by `apps/web`.
  - [ ] Empty state when the selected range has no data.
- **Out of scope:** Exports, scheduled reports, BI, accounting integrations.
- **Phase:** P4

#### Admin polish wave (epic #197) — `FE-ADM-015`–`032` and `FE-SHR-007`–`013`

The tickets above are the original mocked admin screens. They are not the end of admin FE work. Epic #197 polished the existing surfaces under the mock harness (no `WIRE-*`). Historical definitions for `FE-ADM-001`–`014` stay as written.

| ID | Issue | Title |
| --- | --- | --- |
| FE-SHR-007 | #198 | Component authoring standard + `docs/component-guide.md` |
| FE-SHR-008 | #199 | Field primitives hardening |
| FE-SHR-009 | #200 | `DatePicker` / `DateRangePicker` / `TimePicker` |
| FE-SHR-010 | #201 | `RichTextarea` |
| FE-SHR-011 | #202 | `Badge` + `StatusBadge` (+ `CountBadge`) |
| FE-SHR-012 | #203 | Page-skeleton kit |
| FE-ADM-015 | #204 | React Query data layer + prefetch |
| FE-ADM-016 | #205 | Collapsible sidebar + shell |
| FE-ADM-017 | #207 | `AdminDataTable` v2 |
| FE-ADM-018 | #208 | `AdminPageShell` + `loading.tsx` |
| FE-ADM-019 | #209 | Admin form kit |
| FE-ADM-020 | #210 | Virtualized notification queues |
| FE-ADM-021 | #211 | Admin Storybook split |
| FE-ADM-022 | #212 | `/dashboard` bento |
| FE-ADM-023 | #213 | `/payments` queue |
| FE-ADM-024 | #214 | `/cancellations` queue |
| FE-ADM-025 | #215 | `/reschedules` queue |
| FE-ADM-026 | #216 | `/classes` list |
| FE-ADM-027 | #217 | Class form wizard |
| FE-ADM-028 | #218 | `/coaches` list + imagery |
| FE-ADM-029 | #219 | Coach form tabs |
| FE-ADM-030 | #220 | Schedule + add-session wizard |
| FE-ADM-031 | #221 | `/customers` + roster stats |
| FE-ADM-032 | #222 | `/settings` IA |
| FE-SHR-013 | #223 | OpenSpec + `docs/metas/` closeout |

What actually shipped (and what did not) is recorded in `docs/metas/fe-admin-polish.md` and `openspec/specs/fe-admin-screens.md`. Related BE contract tickets: `BE-050`–`BE-054` (#224–#228).

---

### 6.4 Asset tickets

Asset generation has its own lane and its own section — see [Section 7](#7-assets--higgsfield-generation-track). The FE screen tickets above consume approved assets through the manifest built in `FE-SHR-004`; they are not blocked on generation, because every image slot degrades to a designed placeholder.

---

## 7. Assets / Higgsfield generation track

### 7.1 Why this track exists

`docs/screen-specs/` does not just describe layouts — every public screen spec carries **explicit generation prompts**, and `docs/screen-specs/shared/04-marketing-image-generation.md` fixes the conventions for all of them ("intended for generation through Higgsfield CLI using Nano Banana Pro or GPT Image 2"). Coach imagery additionally has a data rule attached to it: `public/05-coaches.md` and `public/01-landing-page.md` both require coach photos to come from the **database-managed coach record**, never from hardcoded page imagery, with a designed fallback avatar when a coach has no photo. That makes assets a delivery lane with its own dependencies (people, consent, approval) rather than a decoration step at the end of FE work.

Jose confirmed **professional coach headshots** as the priority output of this track, and confirmed the intake path: **coach source images are being uploaded through _Balanse image assets dev_**. That is the canonical place raw/source photography arrives. This roadmap does not invent an alternative sourcing route, and no generation ticket starts from an empty prompt for a real person.

### 7.2 The asset pipeline (every generated asset follows this chain)

```text
1. SOURCE      raw/source image ingested and catalogued via Balanse image assets dev
                  └─ identity-bound assets (coach headshots) REQUIRE this step
                  └─ non-identity assets (studio scenes, still lifes, textures) legitimately have no source
2. GENERATE    Higgsfield run that takes the catalogued source as its reference input
3. REVIEW      internal review gate + client approval; status moves draft → client-review → approved
4. STORE       approved output uploaded to Supabase Storage (coach-photos / marketing-assets)
                  └─ depends on INF-004 (buckets) and BE-021 (bucket policies)
```

Each generation ticket's acceptance criteria restate this chain for its own assets. Two rules follow from it and are not negotiable:

- **No coach headshot is generated from scratch.** Every portrait takes a real, catalogued source image of that coach as its input. A coach with no source image does not get a generated face — they get the designed placeholder, and `ASSET-014` is the one ticket that explicitly covers that fallback.
- **Non-identity marketing imagery is text-to-image by design.** The landing, about, contact, and FAQ prompts in the screen specs describe scenes and objects, not specific people, so they have no source-asset prerequisite — but they still pass through review and Storage in the same way.

### 7.3 Ground rules (from the specs, not invented)

From `shared/04-marketing-image-generation.md`:

- Put the target **aspect ratio first** in every prompt; follow the prompt structure `[ASPECT RATIO] → Create … → Purpose → Composition → Visual direction → Important constraints`.
- Generate **image assets only**. No embedded text, logos, labels, fake UI, watermarks, or unreadable signage unless explicitly requested.
- Keep **negative space** where the layout needs copy or controls.
- Reuse the shared art-direction tail: *"modern Cebu wellness studio atmosphere, calm but energetic, editorial fitness photography, natural daylight, warm neutral materials, subtle tropical cues without resort clichés, contemporary minimal interior styling, authentic movement, premium but approachable, realistic skin texture, realistic fabric and equipment, clean composition, generous negative space, no text, no logos, no watermark."*
- **The calendar and booking UI are real product UI and must be built in code, never generated into an image.**
- **Do not generate to fill space.** Skip when the calendar already carries the hierarchy, when typography and spacing work better, when an icon or CSS accent suffices, or when the image would make booking slower or noisier.

From `public/05-coaches.md` (the hard constraints on headshots):

- Coach portraits should feel like **a coherent set**.
- If real coach photos are available, **prefer editing or consistent re-shoot direction rather than inventing people**.
- Generate a portrait **only per real coach and only when a valid reference image is available**.
- **Preserve the referenced person's identity accurately.** No fake medals or credentials, no invented tattoos or accessories, **no invented team members**.
- If a coach has no photo, show a **designed placeholder/avatar** — never a broken image.

Brand direction for the "Balansé look" comes from `docs/facebook-findings/findings.md` §5: cream, warm white, beige/tan, muted brown, dark navy/charcoal, and **gold accents**; calm, warm, community-minded; muted neutral backgrounds with gold/brown labels and simple editorial typography.

### 7.4 Confirmed coach roster (owner-provided)

Source: `docs/facebook-findings/findings.md` §4b. This roster **supersedes** names inferred from the Facebook schedule graphic and is the definitive list for headshot production: eleven coaches, and nobody else. Each one resolves to either a generated headshot (reference + consent available) or the designed placeholder — never to an invented face and never to an omission from the page.

| # | Coach | Classes | Headshot asset id |
| --- | --- | --- | --- |
| 1 | Rex Francis Regis | Calisthenics / Mat Pilates / Caliyoga | `coach-rex-francis-regis` |
| 2 | Ephraim Bacaltos | Circuit Training / Groundworks / Calisthenics | `coach-ephraim-bacaltos` |
| 3 | Rachelle Tobiano | Kickboxing / Brazilian Jiu-Jitsu | `coach-rachelle-tobiano` |
| 4 | Alec James Co | Calisthenics / Circuit Training | `coach-alec-james-co` |
| 5 | Jodi Tio | Mat Pilates | `coach-jodi-tio` |
| 6 | Wolf | Yoga | `coach-wolf` |
| 7 | Kate Go | Yoga | `coach-kate-go` |
| 8 | Sofia Ocampo | Mat Pilates | `coach-sofia-ocampo` |
| 9 | Mikaela Danielle | Dance Fitness | `coach-mikaela-danielle` |
| 10 | Maris Cabrera | Dance Fitness | `coach-maris-cabrera` |
| 11 | Francis Acido | Dance Fitness | `coach-francis-acido` |

### 7.5 Source-image intake status

**Intake path:** coach source images are uploaded and managed through **Balanse image assets dev**. That is the system of record for raw source photography, and `ASSET-010` tracks and catalogues what lands there rather than sourcing photos by some other route. The roadmap deliberately does not describe that system's internals — `ASSET-010` records its concrete location and access details as part of its deliverable.

**Status at time of writing:** upload is **in progress**. This matters for sequencing rather than for feasibility:

- The repository itself still contains no image files — `docs/facebook-findings/` holds only `README.md` and `findings.md`, while `coaches-roster.jpg` and the `facebook_findings.zip` screenshot set live in Google Drive per `docs/facebook-findings/README.md`. Those Facebook captures are **research material, not headshot sources**.
- Because uploads are ongoing, per-coach coverage is not yet known. `ASSET-010` resolves that into a coverage matrix, and until a coach's source image is catalogued, that coach's headshot cannot start — not because the work is blocked in principle, but because the pipeline in §7.2 has no input for them.

Remaining open items (per-coach coverage and likeness consent) are tracked as **OQ-REF** in [Section 9](#9-deferred-open-business-questions). The intake route itself is settled.

### 7.6 Tooling notes (verified against the Higgsfield catalogue)

These are engineering notes for whoever runs generation, not product rules:

- **`nano_banana_pro`** (Google Nano Banana Pro) is the model the shared spec already names. It accepts reference media in an `image_references` role and supports `1:1, 3:2, 2:3, 4:3, 3:4, 4:5, 5:4, 9:16, 16:9, 21:9` at 1k/2k/4k.
- **`soul_2` / Higgsfield Soul 2.0** is the portrait/character-oriented model (tags include `portrait`, `character-generation`) and supports a `soul_id` for personalised, repeatable identity — useful for a coherent per-coach set. It takes **one** reference image and supports `1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3`.
- **Aspect-ratio gaps to plan around:** `soul_2` does **not** offer the `4:5` ratio the coach-portrait prompt asks for (generate `3:4` and reframe, or use `nano_banana_pro`), and **no** listed image model offers the `3:1` ratio the About brand-texture divider asks for (generate `21:9` and crop/reframe). Record the crop step in the manifest so the delivered asset still matches the spec's ratio.
- Supporting operations available for the post-processing pass: `upscale_image`, `remove_background`, `outpaint_image`, `reframe`, and `generate_image_batch` + `jobs_wait` for roster-scale runs.
- **Getting a source image into a generation run:** a catalogued source from Balanse image assets dev must be registered as Higgsfield media (upload widget / `media_upload` / `media_import_url`) and then passed **by media id** in the generation call's `medias` array. Never paste a raw URL into a prompt parameter. The resulting media id is what the manifest records as `source_asset_id`, which is how a finished headshot stays traceable to the photo it came from.
- Free-trial "unlim" generations were **not** spendable at the time of writing, so budget for paid generations and record spend per ticket.

---

### 7.7 Foundations

#### ASSET-001 — Higgsfield generation pipeline, models, and prompt conventions

- **Lane:** Assets
- **Depends on:** FE-FND-004
- **Source docs:** `docs/screen-specs/shared/04-marketing-image-generation.md`; `docs/screen-specs/README.md` §Marketing image-generation prompts; `docs/facebook-findings/findings.md` §5
- **Scope notes:** Stand up the repeatable generation pipeline before any asset is produced. Codify the four-stage chain in §7.2 (source → generate → review → store), the prompt structure and shared art-direction tail from §7.3, the model selection guidance and aspect-ratio gaps from §7.6, the **Balanse image assets dev → Higgsfield media id** handoff, the **when not to generate** checklist, and the review gate (who approves, what disqualifies an output). Include a cost log so spend per asset is visible. This ticket produces a runbook plus prompt library — not images.
- **Acceptance criteria:**
  - [ ] A generation runbook exists covering: the four-stage pipeline, prompt structure (aspect ratio first), the shared art-direction tail, model selection per asset type, and the post-processing operations available.
  - [ ] The runbook documents the source handoff end to end: locate a catalogued source in Balanse image assets dev → register it as Higgsfield media → pass it by media id → record that id against the output.
  - [ ] The runbook states which asset classes require a source image (identity-bound: coach headshots, group hero) and which do not (non-identity scenes and still lifes), so no operator has to guess.
  - [ ] A prompt library file holds every prompt from the screen specs **verbatim**, keyed by page and asset letter, so no prompt is paraphrased at generation time.
  - [ ] The do-not-generate checklist from `shared/04` is reproduced and is part of the review gate.
  - [ ] The reviewer checklist exists and rejects: embedded text, logos, fake UI/signage, watermarks, insufficient negative space, duplicated people, visible AI distortion.
  - [ ] The rule that the calendar and booking UI are coded — never generated — is stated explicitly in the runbook.
  - [ ] Aspect-ratio gaps (`4:5` on `soul_2`, `3:1` anywhere) have a documented generate-then-crop procedure.
  - [ ] A per-asset cost log template exists and is populated as generation proceeds.
- **Out of scope:** Generating any image; the inventory/manifest schema (`ASSET-002`).
- **Phase:** P1

#### ASSET-002 — Asset inventory, naming conventions, and provenance manifest

- **Lane:** Assets
- **Depends on:** ASSET-001
- **Source docs:** `docs/screen-specs/shared/04-marketing-image-generation.md`; all `docs/screen-specs/public/*` §Image / Visual Asset Prompts; `docs/screen-specs/admin/07-coach-management.md` §Profile photo management
- **Scope notes:** Produce the single inventory of every image the product needs, the naming convention that carries it from generation through Storage, and the manifest/provenance record consumed by `FE-SHR-004`. The inventory is closed — it contains exactly the slots the screen specs define (see §7.8 and §7.9), plus the coach placeholder. Proposed naming, aligned with the bucket key conventions in `INF-004`:

  ```text
  marketing-assets/{page}/{slot}-{aspect}.{ext}      e.g. marketing-assets/landing/hero-accent-16x9.webp
  coach-photos/{coach-slug}/headshot-{aspect}.{ext}  e.g. coach-photos/rachelle-tobiano/headshot-4x5.webp
  ```

  Manifest fields: asset id, page, slot, aspect ratio, source prompt key, **`source_asset_id`** (the Balanse image assets dev item and its Higgsfield media id, required for identity-bound assets), model + parameters used, generation date, approval status and approver, alt text, the crop/post-processing applied, and the final Storage key once `ASSET-030` runs. The manifest is the audit trail for the whole §7.2 chain: for any published image it must answer *what source did this come from, what produced it, who approved it, and where does it live now*.
- **Acceptance criteria:**
  - [ ] The inventory lists every slot from the public screen specs (landing A–D, about A–C, contact A–B, faqs A, coaches A–C) plus 11 coach headshots and the placeholder avatar, with no extra invented slots.
  - [ ] Naming convention is documented and matches the bucket key conventions in `INF-004`.
  - [ ] Manifest schema is defined, versioned, and consumable by `FE-SHR-004` without transformation.
  - [ ] Every manifest entry requires alt text before it can be marked approved.
  - [ ] Identity-bound entries require a `source_asset_id` pointing at a catalogued Balanse image assets dev item; the manifest **rejects a coach portrait without one**, and a validation check enforces this rather than relying on reviewer discipline.
  - [ ] Non-identity entries are explicitly marked as source-free so the missing `source_asset_id` reads as intentional rather than as an omission.
  - [ ] Approval status is explicit (`draft` / `client-review` / `approved` / `rejected`), and only `approved` assets may ship to a public page.
  - [ ] Every entry has a slot for its final Storage key, populated by `ASSET-030`.
  - [ ] The inventory records which slots are deliberately **not** generated and why (per the do-not-generate rule).
- **Out of scope:** Generating images; uploading to Storage (`ASSET-030`).
- **Phase:** P1

---

### 7.8 Professional coach headshots

> This sub-track is the priority of the Assets lane. Every ticket in it inherits one hard constraint from `docs/screen-specs/public/05-coaches.md`: **no portrait may be generated for a coach without a valid source image of that coach, and no coach may be invented.** Headshots are always source-driven — stage 1 of the §7.2 pipeline is not optional here. Where a source is missing, the placeholder from `ASSET-014` ships instead; that is a complete, acceptable outcome, not a failure.

#### ASSET-010 — Coach source-image intake via Balanse image assets dev

- **Lane:** Assets
- **Depends on:** none — **start on day one**; intake is already under way
- **Source docs:** `docs/screen-specs/public/05-coaches.md` §Image / Visual Asset Prompts, §Coach image source; `docs/facebook-findings/findings.md` §4b, §Not found / limitations; `docs/facebook-findings/README.md`
- **Scope notes:** Own the **source** stage of the pipeline. Jose is uploading coach photography through **Balanse image assets dev**; this ticket ingests, catalogues, and quality-checks what arrives there, and turns it into the per-coach coverage matrix that every downstream headshot ticket reads. It does **not** invent a parallel sourcing route — Balanse image assets dev is the intake path, and where a coach's photo is missing the resolution is to request it through that same workflow.

  Three things to keep distinct:
  1. **Source photos** — real photographs of a named coach, arriving via Balanse image assets dev. These are the only valid inputs for a headshot.
  2. **Research captures** — the Facebook screenshots and `coaches-roster.jpg` in Google Drive. These establish *who the coaches are and what they teach*; they are **not** headshot sources.
  3. **Consent** — written permission to generate and publish an AI-assisted likeness. These are real, named people appearing on a public page, so consent is tracked per coach alongside the photo, and a photo without consent is treated the same as no photo.

  Also record the concrete intake details (where Balanse image assets dev lives, how the team accesses it, how a new upload is noticed) so the pipeline is operable by someone other than Jose.
- **Acceptance criteria:**
  - [ ] The intake path is documented concretely: location/URL of Balanse image assets dev, access instructions, and how the team detects newly uploaded coach photos.
  - [ ] A coverage matrix exists with one row per roster coach: source photo received (yes/no), intake item reference, upload date, quality assessment, consent recorded (yes/no), decision (**generate** / **placeholder**).
  - [ ] Every received source is catalogued with a stable identifier that `ASSET-002` can store as `source_asset_id`, and registered as Higgsfield media so it is usable as a generation input.
  - [ ] Minimum source quality is defined (face clearly visible, adequate resolution, not heavily filtered, reasonably current) and applied consistently, with rejected uploads flagged back through the intake rather than silently used.
  - [ ] Source photos live in a private working location with provenance recorded; they are **not** committed to the public repo.
  - [ ] Coaches with no source photo **or** no consent are routed to `ASSET-014` and are explicitly **not** queued for generation.
  - [ ] All 11 roster names appear in the matrix; no additional person appears.
  - [ ] Outstanding uploads are tracked with request dates so partial coverage stays visible instead of quietly stalling `ASSET-012`.
  - [ ] The matrix is treated as living: it is re-checked before `ASSET-012` starts and again before `ASSET-030` uploads, so late-arriving photos are picked up.
- **Out of scope:** Generating anything; retouching; running a photo shoot (raise separately if Coach Rex prefers real photography, which the screen spec says to prefer where it is available).
- **Phase:** P0 (start, in progress) → P1 (matrix complete for coaches whose photos have landed)

#### ASSET-011 — Coach headshot art-direction lockup and pilot approval

- **Lane:** Assets
- **Depends on:** ASSET-001, ASSET-010 (at least two coaches with catalogued source photos and consent)
- **Source docs:** `docs/screen-specs/public/05-coaches.md` §Asset A — Coach portrait template; `docs/facebook-findings/findings.md` §5; `docs/screen-specs/shared/04-marketing-image-generation.md`
- **Scope notes:** Lock the single look every headshot will share before producing a roster's worth of them. **Input is a real source photo from the `ASSET-010` intake**, passed to Higgsfield as a reference media id — the pilot is an edit/restyle of an actual coach, not a text-only invention. The spec's portrait template is the base (4:5, waist-up or three-quarter, subject slightly off-centre, relaxed confident posture, enough environmental context to suggest their discipline, clean negative space, natural daylight, modern Cebu wellness studio, realistic skin and fabric texture, approachable, athletic without aggressive bodybuilding aesthetics). Layer the Balansé palette on top: cream / warm white / beige-tan backdrop, muted brown and dark navy-charcoal accents, restrained gold warmth in the light — **as art direction, not as an overlaid logo or text**. Iterate with Coach Rex, then freeze the prompt, model, parameters, and post-processing recipe.
- **Acceptance criteria:**
  - [ ] One approved pilot headshot exists for a real, consenting roster coach, produced **from that coach's catalogued source photo**.
  - [ ] The frozen recipe is recorded: exact prompt text, model and version, parameters, how the source media id is supplied, seed/`soul_id` strategy, aspect ratio, and post-processing steps.
  - [ ] The recipe demonstrably reproduces a consistent look across **two different coaches from two different source photos** — proving the look survives varied input quality, lighting, and framing before roster rollout.
  - [ ] Source-to-output likeness is verified: the pilot is recognisably the person in the source photo, judged by someone who knows them.
  - [ ] Guidance exists for handling poor-quality sources (when to request a better upload through the intake rather than over-processing a weak photo).
  - [ ] Background, lighting, crop, and colour treatment are specified tightly enough that a different operator gets the same result.
  - [ ] No text, logo, watermark, invented credential, or invented accessory appears.
  - [ ] The pilot's manifest entry carries its `source_asset_id`.
  - [ ] Coach Rex has signed off on the look in writing before roster generation starts.
- **Out of scope:** Generating the rest of the roster (`ASSET-012`).
- **Phase:** P1

#### ASSET-012 — Professional headshots for the full coach roster

- **Lane:** Assets
- **Depends on:** ASSET-011, ASSET-010 (coverage matrix), ASSET-002
- **Source docs:** `docs/screen-specs/public/05-coaches.md`; `docs/facebook-findings/findings.md` §4b; `docs/screen-specs/admin/07-coach-management.md` §Profile photo management
- **Scope notes:** Run the frozen recipe across every coach in the §7.4 roster whose source photo and consent are catalogued in `ASSET-010`, producing one approved primary headshot each at 4:5 per the portrait template. **Each run takes that coach's own source photo as its reference input** — this is a restyle of a real photograph into the Balansé look, never a fresh invention of a face. Each coach's environmental context should hint at their own discipline (calisthenics, Mat Pilates, Caliyoga, circuit training, groundworks, kickboxing, Brazilian jiu-jitsu, yoga, dance fitness) without turning into a themed costume shoot. Use batch generation with per-coach review; the set must read as one coherent series when placed side by side on the Coaches page.

  Because intake is still in progress, this ticket is expected to run in waves: generate for the coaches whose photos have landed, and re-run for late arrivals rather than blocking the whole roster on the last upload. Coaches marked placeholder-only are skipped, not substituted.
- **Acceptance criteria:**
  - [ ] Every generated headshot was produced from that specific coach's catalogued source photo; a headshot with no `source_asset_id` fails review.
  - [ ] One approved primary headshot exists per coach with a source photo and consent; coaches without one are listed with their reason and routed to `ASSET-014`.
  - [ ] Each headshot is recognisably the person in their source photo, confirmed by someone who knows them.
  - [ ] Side-by-side review of the full set shows consistent framing, lighting, background treatment, and colour — a coherent set, per the spec.
  - [ ] Brand direction reads as cream/beige with gold warmth, with **no** logo, text, watermark, or graphic overlay.
  - [ ] No fake medals or credentials, no invented tattoos or accessories, no invented people.
  - [ ] Each asset is registered in the manifest with `source_asset_id`, model, parameters, generation date, approver, and alt text, then moved to `approved` only after review.
  - [ ] A late-arrival procedure is documented and exercised at least once: a photo that lands after the first wave gets a headshot without re-running the whole roster.
  - [ ] Coach Rex has approved the full set before it is marked `approved`.
  - [ ] Generation spend is recorded in the cost log.
- **Out of scope:** Generating a portrait for any coach without a source photo — that case is `ASSET-014` and produces a placeholder, not a face. Crops/derivatives (`ASSET-013`); group hero (`ASSET-015`); upload to Storage (`ASSET-030`).
- **Phase:** P2

#### ASSET-013 — Headshot post-processing and delivery set

- **Lane:** Assets
- **Depends on:** ASSET-012
- **Source docs:** `docs/screen-specs/public/05-coaches.md` (4:5 card portrait); `docs/screen-specs/public/01-landing-page.md` §Coach image source (landing coach previews); `docs/screen-specs/admin/07-coach-management.md` (photo preview and fallback); `docs/screen-specs/shared/04-marketing-image-generation.md`
- **Scope notes:** Turn each approved headshot into the delivery set the product actually consumes: the 4:5 Coaches-page card portrait, a square/avatar crop for coach previews and admin lists, and responsive web derivatives. Use `reframe`/crop for ratios the model cannot emit natively, `upscale_image` where resolution is short, and keep background treatment uniform across the set. Every derivative is the same person, same session, same look — derivatives must never be re-generated from scratch, because that breaks set consistency.
- **Acceptance criteria:**
  - [ ] Each eligible coach has the full delivery set: 4:5 card portrait, square/avatar crop, and responsive sizes.
  - [ ] All derivatives originate from the approved master, not from a fresh generation.
  - [ ] Faces are not cropped awkwardly at any ratio (visual review of every crop).
  - [ ] Output format and compression meet the page-weight budget agreed in `FE-FND-011`; modern format with fallback.
  - [ ] Masters are archived losslessly and are traceable from the manifest **back to the original source photo** via `source_asset_id`.
  - [ ] Derivative filenames follow the `ASSET-002` convention.
  - [ ] Every derivative is marked ready for the Storage stage, so `ASSET-030` has an unambiguous set to upload.
- **Out of scope:** Storage upload (`ASSET-030`); rendering (`FE-SHR-004`).
- **Phase:** P2

#### ASSET-014 — Coach placeholder avatar (the explicit no-source fallback)

- **Lane:** Assets
- **Depends on:** FE-FND-004, ASSET-010
- **Source docs:** `docs/screen-specs/public/05-coaches.md` §Fallback behavior; `docs/screen-specs/admin/07-coach-management.md` §Photo behavior
- **Scope notes:** **This is the one ticket that covers what happens when a coach has no source photo**, and its answer is a designed placeholder — never a generated face. Both specs demand a deliberate fallback rather than a broken image: the public Coaches page shows "a designed placeholder/avatar" when a coach has no photo, and the admin coach form must present the same fallback after a photo is removed. Design an on-brand placeholder (cream/beige ground, muted brown or gold line treatment consistent with the Balansé emblem language) that works at card size and avatar size. It must read as intentional rather than broken or unfinished. It is also the interim state for coaches whose uploads are still in flight, so it needs to look acceptable on a live public page, not just in a wireframe.
- **Acceptance criteria:**
  - [ ] Placeholder exists at both card (4:5) and avatar (square) sizes.
  - [ ] It uses Balanse brand tokens and sits comfortably next to real headshots in the same grid — a mixed grid of real and placeholder cards is reviewed and looks deliberate.
  - [ ] It contains **no generated human face** and no text beyond, at most, initials.
  - [ ] It is used by the public Coaches page, landing coach previews, and the admin coach form.
  - [ ] No code path can render a broken image for a photo-less coach (verified in `FE-PUB-005` and `FE-ADM-007`).
  - [ ] Swapping a placeholder for a real headshot later is a data change only — no layout or code change is needed when a late upload arrives.
  - [ ] Registered in the manifest like any other asset, marked source-free by design.
- **Out of scope:** Generating a portrait for a coach who has no source photo. That is explicitly not done anywhere in this roadmap; this ticket is the sanctioned alternative.
- **Phase:** P1

#### ASSET-015 — Coaches page group hero and specialty accents (conditional)

- **Lane:** Assets
- **Depends on:** ASSET-012
- **Source docs:** `docs/screen-specs/public/05-coaches.md` §Asset B — Coaches page group hero, §Asset C — Coach specialty card background accents
- **Scope notes:** Two conditional assets with opposite source requirements. **Group hero (16:9)** is identity-bound: allowed **only if** catalogued source photos and consent exist for every coach depicted, per the spec — coaches interacting naturally rather than in a formal lineup, room for heading copy on one side, hints of the disciplines without staged props, each person's identity preserved, no invented team members. If source coverage is incomplete, **skip it** and record the skip; do not depict a subset as "the team" without saying so, and do not fill gaps with invented figures. **Specialty accents (1:1)** are not identity-bound — close-crop movement details (hands, footwork, equipment, body movement) explicitly **without showing a full face** — so they are text-to-image and proceed regardless of intake status.
- **Acceptance criteria:**
  - [ ] Specialty accents delivered at 1:1 for the roster's real disciplines, with no full faces and no cliché stock poses; marked source-free in the manifest.
  - [ ] Group hero is produced only when every depicted coach has a catalogued source photo and consent; otherwise the skip is recorded in the inventory with its reason.
  - [ ] If produced, the group hero records the `source_asset_id` of every coach it depicts.
  - [ ] If produced, the group hero preserves every depicted person's identity and adds nobody who is not on the roster.
  - [ ] Heading-copy negative space is preserved on one side.
  - [ ] No text, logos, or watermarks.
  - [ ] Registered in the manifest with provenance.
- **Out of scope:** Individual headshots (`ASSET-012`).
- **Phase:** P2

---

### 7.9 Marketing and public-page imagery

> These tickets execute prompts that **already exist verbatim** in the screen specs. No new prompt is authored, and no new image slot is invented.
>
> All four are **non-identity** assets — the specs describe studio scenes, objects, and textures rather than named people — so they have no source-photo prerequisite and are generated text-to-image. They still pass through the rest of the §7.2 chain: generate → review and client approval → Supabase Storage via `ASSET-030`. Where Balanse supplies real photography for one of these slots, the real photograph **replaces** the generated asset rather than sitting alongside it, and that swap is recorded in the inventory.

#### ASSET-020 — Landing page imagery (Assets A–D)

- **Lane:** Assets
- **Depends on:** ASSET-001, ASSET-002
- **Source docs:** `docs/screen-specs/public/01-landing-page.md` §Image / Visual Asset Prompts
- **Scope notes:** Four specced assets, prompts used verbatim: **A** hero background accent (16:9 — must sit behind/beside the calendar with a calm, visually quiet centre and no prominent faces in the middle), **B** classes section editorial strip (3:2 — one coherent scene with layered activity, explicitly **not** a collage), **C** how-it-works still life (1:1 — towel, water bottle, hand wraps, yoga strap, phone **face-down** so no screen UI shows), **D** final CTA background (21:9 — golden-hour studio, one or two people at the far right, broad negative space at the left, subjects **not** centred).
- **Acceptance criteria:**
  - [ ] Four assets delivered at exactly the specced ratios and registered in the manifest with alt text.
  - [ ] Asset A keeps the calendar area quiet and passes a legibility/contrast check with the real calendar composited over it.
  - [ ] Asset B is a single coherent scene — no collage, no duplicated people, no distorted anatomy.
  - [ ] Asset C shows no phone screen UI and no readable text.
  - [ ] Asset D leaves the left side clear for CTA copy and a button, with subjects off-centre right.
  - [ ] No asset contains text, logos, fake UI, calendar graphics, or watermarks.
  - [ ] Page-weight budget from `FE-FND-011` is respected after optimisation.
- **Out of scope:** Coach imagery (§7.8); any generated calendar UI.
- **Phase:** P2

#### ASSET-021 — About page imagery (Assets A–C)

- **Lane:** Assets
- **Depends on:** ASSET-001, ASSET-002
- **Source docs:** `docs/screen-specs/public/02-about.md` §Image / Visual Asset Prompts
- **Scope notes:** **A** About hero (16:9 — candid in-between moment after a class, subjects grouped to one side, generous negative space for heading copy, **not** a posed corporate team photo, no exaggerated fitness physiques). **B** Our Approach accent (4:3 — studio corner communicating balance between strength, mobility, and recovery; human presence optional and secondary). **C** brand texture divider (**3:1** — soft fabric folds, warm concrete, subtle shadows, gentle directional light; no people required). Note the ratio gap from §7.6: 3:1 is not natively available, so generate 21:9 and crop, recording the crop in the manifest.
- **Acceptance criteria:**
  - [ ] Three assets delivered at the specced ratios (Asset C delivered as a true 3:1 crop with the source ratio and crop recorded).
  - [ ] Hero reads as candid community, not a staged corporate lineup.
  - [ ] Negative space for heading copy is preserved on hero and approach assets.
  - [ ] No text, logos, fake signage, or watermarks; no exaggerated physiques.
  - [ ] Registered in the manifest with alt text.
- **Out of scope:** Coach portraits used in the "Meet the team" block — those come from the coach record (§7.8).
- **Phase:** P2

#### ASSET-022 — Contact page imagery (Assets A–B)

- **Lane:** Assets
- **Depends on:** ASSET-001, ASSET-002
- **Source docs:** `docs/screen-specs/public/03-contact.md` §Image / Visual Asset Prompts; `docs/facebook-findings/findings.md` §2
- **Scope notes:** **A** arrival atmosphere (16:9). The spec is emphatic: **do not invent a literal exterior or address** — use an atmospheric studio-arrival image, no fabricated storefront, no signage. This matters because a real address exists (`Unit 2A, Capitol Centrum Building, N Escario, Cebu City`) and a fabricated building would misrepresent it. **B** walk-in QR still life (1:1) — phone near a simple tabletop QR stand, with the **QR abstract and non-scannable** and the phone screen blank or out of focus.
- **Acceptance criteria:**
  - [ ] Two assets delivered at the specced ratios and registered in the manifest.
  - [ ] Asset A depicts no identifiable real building, no signage, and no address.
  - [ ] Asset B contains no readable/scannable QR code and no fake app UI.
  - [ ] Negative space is preserved for contact copy.
  - [ ] No text, logos, or watermarks.
  - [ ] Inventory records that real location photography, if Coach Rex supplies it, **replaces** Asset A rather than supplementing it.
- **Out of scope:** Real location photography; generating a scannable QR (the real walk-in QR is a product artefact, not a marketing image).
- **Phase:** P2

#### ASSET-023 — FAQ header accent (Asset A)

- **Lane:** Assets
- **Depends on:** ASSET-001, ASSET-002
- **Source docs:** `docs/screen-specs/public/04-faqs.md` §Image / Visual Asset Prompts
- **Scope notes:** One asset only. The spec states the FAQ page must remain **content-first** and use **at most one** quiet accent image: a calm studio corner after class (3:2) with objects offset to one side and large negative space for the FAQ heading and search field.
- **Acceptance criteria:**
  - [ ] Exactly one asset delivered at 3:2 and registered in the manifest.
  - [ ] Negative space accommodates the heading and the search field without overlap at all breakpoints.
  - [ ] No text, logos, phone screens, or watermarks.
  - [ ] The inventory records that no further FAQ imagery is to be generated.
- **Out of scope:** Additional FAQ imagery.
- **Phase:** P2

---

### 7.10 Storage handoff

#### ASSET-030 — Upload approved assets into Supabase Storage

- **Lane:** Assets + BE
- **Depends on:** INF-004, BE-021, ASSET-013, ASSET-014, ASSET-020, ASSET-021, ASSET-022, ASSET-023
- **Source docs:** `docs/screen-specs/admin/07-coach-management.md` §Profile photo management; `docs/screen-specs/public/05-coaches.md` §Coach image source; `docs/screen-specs/shared/04-marketing-image-generation.md`; `docs/business-requirements/03-roles-and-permissions.md` §Coach-rate privacy
- **Scope notes:** The final stage of the §7.2 chain. Move approved assets from the working store into the buckets created by `INF-004` and secured by `BE-021`: coach headshots and the placeholder into **`coach-photos`** (public read, admin write), marketing imagery into **`marketing-assets`** (public read, admin write). Keys follow the `ASSET-002` convention. Because `public/05-coaches.md` requires coach cards to pull "the current coach profile photo from the database-managed coach record", the upload must also set each coach's photo key on the `coaches` row from `BE-004`, so exactly one active photo exists per coach. The upload is scripted and idempotent, not a manual console drag — intake is ongoing, so this will run more than once as late headshots are approved. Note the privacy boundary: coach **photos** are public; coach **rates** are not — this handoff touches only the photo column.
- **Acceptance criteria:**
  - [ ] Every approved asset exists in the correct bucket under a key matching the `ASSET-002` convention.
  - [ ] Each coach row with an approved headshot carries exactly one active photo key pointing at a real object; coaches still awaiting a source photo carry none and resolve to the placeholder.
  - [ ] Every uploaded coach headshot is traceable end to end — Storage object → manifest entry → `source_asset_id` → the Balanse image assets dev intake item — and an object that cannot be traced back to a source is treated as a defect.
  - [ ] The upload script is idempotent and re-runnable without creating duplicates or orphans, so a second wave of approved headshots can be published without disturbing the first.
  - [ ] Public read works for `coach-photos` and `marketing-assets`; anonymous write fails; non-admin write fails (re-verifies `BE-021`).
  - [ ] The manifest records the final Storage key and public URL for each asset.
  - [ ] Only assets marked `approved` are uploaded; drafts and rejects are excluded by the script.
  - [ ] A reconciliation report lists any manifest entry without an object, any object without a manifest entry, and any coach whose photo key points at a missing object — all three lists empty at sign-off.
- **Out of scope:** The mocked FE fetching these URLs at runtime — that is `WIRE-012`. The GCash QR image is an admin-uploaded business artefact handled by `BE-043`/`FE-ADM-013`, not by this ticket.
- **Phase:** P4

---

## 8. Later phase — FE↔BE wiring (thin stubs)

> **These are placeholders, not build-now tickets.** They exist so the team can see where the mocked FE and the standalone BE meet, and so nobody accidentally does wiring work during this phase. Each stub gets refined into detailed tickets **after** this phase closes, using the contract pack from `BE-024`. Do not expand, estimate, or start them now.

The intended mechanics: every mocked screen reads through the `MockDataAdapter` from `FE-FND-005`, whose method names mirror the API route inventory in [§4.3](#43-api-route-inventory-mapped-to-business-flows). Wiring means replacing the adapter implementation, not rewriting screens.

| ID | Title | Lane | Depends on | Replaces mock |
| --- | --- | --- | --- | --- |
| **WIRE-001** | Real data-access layer replacing `MockDataAdapter` | FE+BE | `BE-024`, `FE-FND-005` | Whole mock layer |
| **WIRE-002** | Supabase Auth integration; remove the mock session/role harness | FE+BE | `INF-005`, `FE-FND-006` | `FE-FND-006` |
| **WIRE-003** | Public calendar and coaches pages consume `BE-030` | FE | `WIRE-001` | `FE-PUB-001`, `FE-PUB-005` fixtures |
| **WIRE-004** | Customer portal lists and booking detail consume `BE-031`, `BE-032` | FE | `WIRE-002` | `FE-CUS-004`, `FE-CUS-011` fixtures |
| **WIRE-005** | Booking creation, waitlist join, and hold countdown against `BE-032` | FE | `WIRE-004` | `FE-CUS-007`, `FE-CUS-008` fixtures |
| **WIRE-006** | Payment method, real proof upload to `payment-proofs`, instructions from settings | FE | `BE-033`, `BE-021` | `FE-CUS-009`, `FE-CUS-010` mock upload |
| **WIRE-007** | Cancellation and reschedule requests against `BE-034`, `BE-035` | FE | `WIRE-004` | `FE-CUS-012`, `FE-CUS-013` fixtures |
| **WIRE-008** | Admin queues (bookings, payments, cancellations, reschedules) against `BE-036`–`BE-039` | FE | `WIRE-002` | `FE-ADM-008`–`FE-ADM-011` fixtures |
| **WIRE-009** | Admin catalogue CRUD and coach photo upload against `BE-038` | FE | `WIRE-002` | `FE-ADM-005`–`FE-ADM-007` fixtures |
| **WIRE-010** | Roster and check-in against `BE-040` | FE | `WIRE-002` | `FE-ADM-012` fixtures |
| **WIRE-011** | Reports against `BE-041`, including admin-only access enforcement end to end | FE | `WIRE-002` | `FE-ADM-014` fixtures |
| **WIRE-012** | Serve coach and marketing imagery from Supabase Storage instead of bundled assets | FE | `ASSET-030`, `FE-SHR-004` | Bundled asset paths in the manifest |
| **WIRE-013** | End-to-end verification of the canonical loop and the edge cases in `16-edge-cases.md` | FE+BE | all above | — |

**Deliberately excluded from the wiring phase as well** (still future scope per `docs/business-requirements/19-future-scope.md`): payment gateways, automated verification/refunds, memberships/packages/credits, recurrence exceptions and series-wide mutation, a coach portal, Resend email notifications, SMS/push, multi-branch, and admin-editable hold/cutoff settings.

---

## 9. Deferred OPEN business questions

These are unresolved **business** decisions. No ticket may guess an answer. Each entry lists the tickets it gates and the interim behaviour that ships instead.

### 9.1 High priority

| ID | Question | Source | Gates | Interim behaviour this phase |
| --- | --- | --- | --- | --- |
| **OQ-1** | Cancellation eligibility window — can a customer cancel any time before class, only before a cutoff, or even after class for admin review? Does timing affect refund eligibility? | `20-open-questions.md` §1; `11-cancellations-and-refunds.md` §Cancellation policy timing; `21-canonical-rules.md` [R63] | `BE-011`, `BE-013`, `BE-034`, `FE-CUS-012`, `FE-ADM-010`, `FE-PUB-004` | Ship the request→review→resolve workflow with **no** deadline and **no** automated refund-eligibility rule. Eligibility stays an admin judgement. No placeholder deadline in code or copy. |
| **OQ-2** | Reschedule policy — cutoff, number of allowed reschedules, same class only vs any class, price-difference handling, whether a full target session can accept a request via waitlist, whether reschedule is allowed after check-in, whether new waiver acceptance is required. | `20-open-questions.md` §2; `12-rescheduling.md` §OPEN; `21-canonical-rules.md` [R51, R64] | `BE-014`, `BE-035`, `BE-039`, `FE-CUS-013`, `FE-ADM-011` | Ship request capture and admin approve/reject only. No price math, no class-type restriction, no cutoff, no count limit, no automatic re-acceptance. The capacity invariant still applies at approval. |
| **OQ-3** | Required customer profile fields — exactly what does Coach Rex need (full name, phone, DOB, emergency contact, health declarations)? | `20-open-questions.md` §3; `04-auth-and-profile.md` §Customer profile | `BE-002`, `BE-031`, `FE-CUS-002`, `FE-CUS-005` | Ship full name, email, contact number only. Do not add sensitive fields. Extension point documented. |
| **OQ-4** | Actual waiver and policy documents — waiver text, gym policies, cancellation/refund policy if one exists, participation rules. | `20-open-questions.md` §4; `07-booking-form-and-waivers.md` §Content dependency; `21-canonical-rules.md` [R13, R65] | `BE-007`, `BE-043`, `FE-CUS-008`, `FE-ADM-013` | Placeholder document definitions for development **only**, visibly marked as placeholder. No invented legal content anywhere. |
| **OQ-5** | Waiver re-acceptance rule — every booking, only on version change, or once per fixed period? | `20-open-questions.md` §5; `07-booking-form-and-waivers.md` §Re-acceptance | `BE-009`, `FE-CUS-008` | Per the business doc's guidance, require applicable acceptance in the booking flow until Rex chooses otherwise; keep the rule isolated in one place so it can change cheaply. |

### 9.2 Medium priority

| ID | Question | Source | Gates | Interim behaviour this phase |
| --- | --- | --- | --- | --- |
| **OQ-6** | Session cancellation communication — in-app only, email, or both, when Rex cancels a class? | `20-open-questions.md` §6 | `BE-038`, `FE-ADM-005` | In-app status only (email is optional for MVP per [R59]). Cancel-session UI states in-app effects only. |
| **OQ-7** | Admin rejection reasons — free text, predefined, or both? | `20-open-questions.md` §7 | `BE-036`, `FE-ADM-008`, `FE-ADM-009` | Free text field, stored in a shape that can later carry a code. No invented reason taxonomy. |
| **OQ-8** | Payment-proof requirements — screenshot only, or also transaction/reference number, amount, payer name? | `20-open-questions.md` §8 | `BE-010`, `BE-033`, `FE-CUS-010` | Image required; reference/amount/payer-name columns exist but are optional and unenforced, and no required fields appear in the UI. |
| **OQ-9** | Confirmation/reference format — human-readable booking reference, QR code, or in-app status only? | `20-open-questions.md` §9 | `BE-008`, `FE-CUS-011` | Generate an opaque unique reference and display it as plain text. **No QR code shipped.** |
| **OQ-10** | Session completion — is a formal `COMPLETED` status needed after class, or is `CHECKED_IN` enough? | `20-open-questions.md` §10; `09-reservation-lifecycle.md` §COMPLETED | `BE-001`, `BE-015` | Define the enum value (the status-language table lists it) but ship **no transition into it**. |

### 9.3 Raised by this roadmap

| ID | Question | Source of the discrepancy | Gates | Interim behaviour |
| --- | --- | --- | --- | --- |
| **OQ-NAV** | Public navigation lists **Schedule** and **Classes**, but `docs/screen-specs/public/` has no spec for either page — the calendar lives on the landing page. Should they remain anchors into the landing calendar, or does Rex want dedicated pages? | `docs/screen-specs/shared/01-navigation.md` vs `docs/screen-specs/public/` | `FE-SHR-001`, `FE-FND-007`, `FE-PUB-001` | Both nav items resolve to the landing calendar (Classes surfaces the class filter). **No new page is designed.** |
| **OQ-PRICE** | No source document contains real per-class pricing or real coach rates; `findings.md` has no pricing beyond a one-off ₱1,000 charity event. | `docs/facebook-findings/findings.md` §3 | `BE-023`, `FE-*` fixtures | All prices and rates in seeds/fixtures are obvious placeholders, flagged as non-authoritative. |
| **OQ-HOURS** | Opening hours were not exposed in the Facebook review ("Open now" only). | `docs/facebook-findings/findings.md` §2, §Not found | `BE-043`, `FE-PUB-003`, `FE-ADM-013` | Hours field ships empty; no hours are invented on the Contact page. |
| **OQ-CLASSFAM** | Screen specs use `Yoga / Boxing / Capoeira` as filter examples, while the Facebook findings list the live families as Yoga, Mat Pilates, Calisthenics, Caliyoga, Circuit Training, Kickboxing, Brazilian Jiu-Jitsu, Groundworks, Dance Fitness. | `docs/screen-specs/public/05-coaches.md` vs `docs/facebook-findings/findings.md` §3, §4b | `BE-023`, `FE-PUB-005`, `FE-SHR-005` | Filters are generated from the class catalogue rather than hardcoded, so either list renders correctly. Seeds use the findings list. |
| **OQ-REF** | **Coach source-photo coverage and likeness consent.** The intake route is settled — Jose is uploading coach photography through **Balanse image assets dev** — but two things remain open: which of the 11 roster coaches will end up with a usable source photo, and has each coach consented to an AI-assisted likeness being published on a public page? A secondary question: would Coach Rex prefer a real photo shoot, which `public/05-coaches.md` says to prefer where photography is available? | `docs/screen-specs/public/05-coaches.md` §Coach image source; intake status in §7.5 | `ASSET-010`, `ASSET-011`, `ASSET-012`, `ASSET-013`, `ASSET-015`, `FE-PUB-005` | `ASSET-010` catalogues uploads as they arrive and maintains the per-coach coverage matrix; `ASSET-012` generates in waves so partial coverage never blocks the roster. Any coach without a source photo **or** without consent gets the designed placeholder from `ASSET-014` — no face is invented, and no coach is dropped from the page. |

### 9.4 Escalation

Every OQ above should be raised with Coach Rex as a single consolidated list before the wiring phase begins, because **OQ-1**, **OQ-2**, **OQ-3**, and **OQ-4** all change either the schema or the legal surface of the product, and are cheapest to answer before real data exists.

**OQ-REF is the exception to that timing** — it should be chased continuously rather than batched. Its intake route is already settled and in use, but coverage and consent depend on eleven individual people rather than a single decision from Rex, and every missing photo is one coach who ships as a placeholder.

---

## 10. Definition of done for this phase

The phase is complete when every statement below is true and evidenced.

### 10.1 Backend / infrastructure

- [ ] All eleven schema domains from [§4.1](#41-schema-domain-overview) are migrated onto Supabase project `xydundrayuusqizssgby`, with the migration history visible and reproducible from a clean database.
- [ ] Prisma schema conventions hold throughout: both sides of every relation declared, `@id @default(...)`, `createdAt`/`updatedAt` on every model, `@@index` on frequently queried columns, `@unique`/`@@unique` on business-unique fields.
- [ ] The three storage buckets exist with the visibility, key conventions, MIME allowlists, and size limits from [§4.2](#42-storage-buckets).
- [ ] RLS is enabled on every business table, and the negative tests in `BE-020` and `BE-021` pass: no cross-customer reads, no anonymous access to bookings/payments/proofs, no customer-side self-confirmation or self-check-in, no non-admin access to coach rates.
- [ ] Every route in the API inventory ([§4.3](#43-api-route-inventory-mapped-to-business-flows)) is implemented and covered by integration tests exercised without any frontend.
- [ ] Capacity correctness is proven: concurrency test at the last-slot boundary, cutoff boundary test, `CANCELLATION_REQUESTED` still consumes capacity, waitlist never consumes capacity, capacity never exceeded.
- [ ] Hold expiry and FIFO promotion jobs run idempotently, respect the cutoff, and recalculate holds from promotion time.
- [ ] Financial history integrity is proven: changing a coach's default rate does not alter historical session costs or reported coach cost.
- [ ] Reporting returns Gross Sales, Refunds, Net Sales, Coach Cost, Gross Contribution, Occupancy, and Attendance Utilisation with the documented definitions, and the word "profit" appears in no output.
- [ ] Hold duration (8 h) and cutoff (15 min) live in exactly one developer-controlled place and are absent from every admin surface.
- [ ] `BE-024` contract pack is published and CI fails if a route lacks contract coverage.

### 10.2 Frontend

- [ ] **Every file under `docs/screen-specs/` is covered by at least one shipped FE ticket** — see [Appendix A](#appendix-a--screen-spec-coverage-matrix).
- [ ] No PawPair content remains: repo-wide search returns zero hits, no demo route resolves, no demo model or asset survives, and a CI guard prevents regression.
- [ ] Jabkit is installed and is the component library the screens are built from; vendored component files are unmodified and wrappers carry all local changes.
- [ ] Balanse brand tokens are the only source of colour and type; no hardcoded hex values in screen code.
- [ ] Every screen renders at mobile, tablet, and desktop; calendar surfaces honour the day/week/month contract.
- [ ] All 15 empty/error states enumerated in `docs/screen-specs/shared/03-empty-error-states.md` are implemented and reachable; no full-page spinners.
- [ ] All 14 status labels from `docs/screen-specs/shared/02-status-language.md` render with the specified customer-facing strings, and no raw enum can reach the DOM.
- [ ] No coach rate, coach cost, or financial report data appears on any public or customer surface (automated assertion).
- [ ] No "book for someone else" affordance exists anywhere.
- [ ] Storybook builds with a story per screen-level component including empty/error variants, and a11y checks pass.
- [ ] Both apps build, typecheck, and lint clean in CI; preview deployments are reachable for client review.
- [ ] The mock layer is the only data source; a repo-wide check confirms no screen calls `/api/*` or a Supabase client.

### 10.3 Assets

- [ ] The generation runbook, verbatim prompt library, and review gate from `ASSET-001` exist and were actually used — every shipped asset traces to a prompt in the library.
- [ ] The closed asset inventory from `ASSET-002` is complete, and every entry has an approval status, alt text, and provenance; deliberately-skipped slots are recorded with their reason.
- [ ] Every asset followed the §7.2 chain — source (where identity-bound) → Higgsfield generation → review and approval → Supabase Storage — with each stage evidenced in the manifest.
- [ ] The coach coverage matrix covers all 11 roster coaches with a source-photo and consent decision each, reconciled against Balanse image assets dev at sign-off.
- [ ] Every coach with a catalogued source photo and consent has an approved professional headshot generated **from that photo**; the set reads as one coherent series.
- [ ] Every coach without one resolves to the designed placeholder from `ASSET-014`, and swapping in a late headshot is a data change only.
- [ ] **No coach headshot was generated from scratch**: every portrait in the manifest carries a `source_asset_id`, and a spot check confirms each traces back to a real uploaded photo of that person.
- [ ] No generated image depicts a person who is not on the confirmed roster.
- [ ] Landing (A–D), About (A–C), Contact (A–B), and FAQ (A) imagery is delivered at the specced aspect ratios, with crops recorded where the ratio was not natively available.
- [ ] No asset contains text, logos, fake UI, fake signage, a readable QR code, or a watermark; the Contact hero fabricates no storefront.
- [ ] No product UI — calendar or booking — was generated as an image.
- [ ] Approved assets are uploaded to `coach-photos` and `marketing-assets` with keys matching the naming convention, each coach row with an approved headshot points at exactly one active photo, and the reconciliation report is clean.
- [ ] Mocked pages render approved assets from bundled paths; nothing fetches a Storage URL at runtime yet.
- [ ] Generation spend is recorded per asset in the cost log.

### 10.4 Product governance

- [ ] No product rule exists in code or copy that cannot be traced to a specific line in `docs/business-requirements/` or `docs/screen-specs/`.
- [ ] Every OPEN question in [Section 9](#9-deferred-open-business-questions) is still visibly open — none has been silently resolved by an implementation choice.
- [ ] Placeholder content (waivers, prices, coach rates, imagery) is labelled as placeholder wherever it is stored or displayed.
- [ ] The consolidated OQ list has been sent to Coach Rex.
- [ ] A walkthrough of all 36 mocked screens has been reviewed with the client, and feedback is captured as new tickets rather than silent changes to these specs.

---

## Appendix A — screen-spec coverage matrix

Every file under `docs/screen-specs/` and the FE ticket(s) that cover it.

| Screen-spec file | Covered by |
| --- | --- |
| `README.md` (responsive contract, canonical assumptions) | `FE-SHR-005`, `FE-FND-011` |
| `SCREEN_INDEX.md` (route inventory) | `FE-FND-007`, `FE-FND-008`, `FE-FND-009` |
| `public/01-landing-page.md` | `FE-PUB-001` (+ `FE-SHR-005`, `ASSET-020`, coach previews via `ASSET-013`) |
| `public/02-about.md` | `FE-PUB-002` (+ `ASSET-021`) |
| `public/03-contact.md` | `FE-PUB-003` (+ `ASSET-022`) |
| `public/04-faqs.md` | `FE-PUB-004` (+ `ASSET-023`) |
| `public/05-coaches.md` | `FE-PUB-005` (+ `ASSET-010`–`ASSET-015`) |
| `customer/01-login.md` | `FE-CUS-001` |
| `customer/02-sign-up.md` | `FE-CUS-002` |
| `customer/03-forgot-password.md` | `FE-CUS-003` |
| `customer/04-portal-home.md` | `FE-CUS-004` |
| `customer/05-profile.md` | `FE-CUS-005` |
| `customer/06-achievements-tbd.md` | `FE-CUS-006` |
| `customer/07-schedule.md` | `FE-CUS-007` (+ `FE-SHR-005`) |
| `customer/08-booking-form.md` | `FE-CUS-008` |
| `customer/09-payment-method.md` | `FE-CUS-009` |
| `customer/10-gcash-proof-upload.md` | `FE-CUS-010` (+ `FE-FND-010`) |
| `customer/11-booking-detail.md` | `FE-CUS-011` |
| `customer/12-cancellation-request.md` | `FE-CUS-012` |
| `customer/13-reschedule-request.md` | `FE-CUS-013` |
| `admin/01-login.md` | `FE-ADM-001` |
| `admin/02-dashboard.md` | `FE-ADM-002` |
| `admin/03-staff-management.md` | `FE-ADM-003` |
| `admin/04-customer-management.md` | `FE-ADM-004` |
| `admin/05-schedule-management.md` | `FE-ADM-005` |
| `admin/06-class-management.md` | `FE-ADM-006` |
| `admin/07-coach-management.md` | `FE-ADM-007` (+ `FE-FND-010`, `ASSET-014`, `ASSET-030`) |
| `admin/08-booking-management.md` | `FE-ADM-008` |
| `admin/09-payment-review.md` | `FE-ADM-009` |
| `admin/10-cancellation-requests.md` | `FE-ADM-010` |
| `admin/11-reschedule-requests.md` | `FE-ADM-011` |
| `admin/12-session-roster-check-in.md` | `FE-ADM-012` |
| `admin/13-settings.md` | `FE-ADM-013` |
| `admin/14-sales-inventory-reports.md` | `FE-ADM-014` |
| `shared/01-navigation.md` | `FE-SHR-001` |
| `shared/02-status-language.md` | `FE-SHR-002` |
| `shared/03-empty-error-states.md` | `FE-SHR-003` |
| `shared/04-marketing-image-generation.md` | `ASSET-001`, `ASSET-002` (+ `FE-SHR-004`) |

**36 screen-spec files, all covered.**

---

## Appendix B — ticket index

### INF

| ID | Title | Phase |
| --- | --- | --- |
| INF-001 | Adopt the existing Supabase project as the MVP backend of record | P0 |
| INF-002 | Environment variables and connection wiring | P0 |
| INF-003 | Migration workflow, naming, and safety conventions | P0 |
| INF-004 | Create storage buckets | P1 |
| INF-005 | Configure Supabase Auth and admin access model | P1 |
| INF-006 | Secrets management and environment matrix | P1 |
| INF-007 | CI pipeline for the monorepo | P1 |
| INF-008 | Preview and staging deployment | P1 |

### BE — schema, rules, jobs, reporting

| ID | Title | Phase |
| --- | --- | --- |
| BE-001 | Enum vocabulary and shared schema conventions | P1 |
| BE-002 | `profiles` (customer identity) | P1 |
| BE-003 | `staff_members` and the admin authorisation model | P1 |
| BE-004 | `coaches` (public profile + internal rate) | P1 |
| BE-005 | `classes` (class catalogue) | P1 |
| BE-006 | `sessions` (scheduled sessions with financial snapshot) | P1 |
| BE-007 | `policy_documents` and versioned content | P1 |
| BE-008 | `bookings` (core reservation record) | P2 |
| BE-009 | `booking_policy_acceptances` | P2 |
| BE-010 | `payments` | P2 |
| BE-011 | `refunds` (manual refund state tracking) | P2 |
| BE-012 | `waitlist_entries` (FIFO) | P2 |
| BE-013 | `cancellation_requests` | P2 |
| BE-014 | `reschedule_requests` | P2 |
| BE-015 | Check-in, attendance, and no-show | P2 |
| BE-016 | `audit_events` | P2 |
| BE-017 | Capacity integrity and booking eligibility | P2 |
| BE-018 | Hold expiry and FIFO waitlist promotion jobs | P2 |
| BE-019 | Developer-controlled business configuration module | P2 |
| BE-020 | RLS policy suite | P2 |
| BE-021 | Storage bucket access policies | P2 |
| BE-022 | Reporting queries and views | P3 |
| BE-023 | Seed data for development and demo | P3 |
| BE-024 | API contract pack for the wiring phase | P4 |

### BE — API routes

| ID | Title | Phase |
| --- | --- | --- |
| BE-030 | Public catalogue API | P3 |
| BE-031 | Authenticated profile API | P3 |
| BE-032 | Booking creation and retrieval API | P3 |
| BE-033 | Payment method, proof upload, and instructions API | P3 |
| BE-034 | Cancellation request API (customer) | P3 |
| BE-035 | Reschedule request API (customer) | P3 |
| BE-036 | Admin booking management API | P4 |
| BE-037 | Admin payment review and refund state API | P4 |
| BE-038 | Admin catalogue API (classes, coaches, sessions) | P4 |
| BE-039 | Admin cancellation and reschedule resolution API | P4 |
| BE-040 | Admin session roster and check-in API | P4 |
| BE-041 | Admin reports API | P4 |
| BE-042 | Admin staff and customer management API | P4 |
| BE-043 | Admin settings and public content API | P4 |
| BE-055 | Staff/coach unification contract (`StaffMember` ↔ `Coach`) | P4 |
| BE-056 | Payment-receive QR collection contract | P4 |

### FE foundation and shared

| ID | Title | Phase |
| --- | --- | --- |
| FE-FND-001 | Bootstrap the monorepo from `fe-multi-web-template` | P0 |
| FE-FND-002 | Strip all PawPair mock content | P0 |
| FE-FND-003 | Install and wire Jabkit as the component library | P0 |
| FE-FND-004 | Balanse brand tokens, typography, and app chrome | P0 |
| FE-FND-005 | Mock data layer and shared domain types | P1 |
| FE-FND-006 | Mock session and role switcher (dev harness) | P1 |
| FE-FND-007 | Public route shell | P1 |
| FE-FND-008 | Customer portal route shell | P1 |
| FE-FND-009 | Admin portal route shell | P1 |
| FE-FND-010 | Shared mock upload and image-preview primitive | P1 |
| FE-FND-011 | FE quality gate: Storybook, a11y, visual review | P1 |
| FE-FND-012 | Money, date, and timezone formatting utilities | P1 |
| FE-SHR-001 | Navigation system (public, customer, admin) | P1 |
| FE-SHR-002 | Status language and status-badge system | P1 |
| FE-SHR-003 | Empty, loading, and error state library | P1 |
| FE-SHR-004 | Marketing asset integration layer | P2 |
| FE-SHR-005 | Responsive calendar component (mock) | P2 |
| FE-SHR-006 | Portal toast system (epic #179) | later |
| FE-SHR-007 | Component authoring standard | later |
| FE-SHR-008 | Field primitives hardening | later |
| FE-SHR-009 | DatePicker / DateRangePicker / TimePicker | later |
| FE-SHR-010 | RichTextarea | later |
| FE-SHR-011 | Badge + StatusBadge redesign | later |
| FE-SHR-012 | Page-skeleton kit | later |
| FE-SHR-013 | OpenSpec closeout for admin polish | later |

### FE screens

| ID | Title | Phase |
| --- | --- | --- |
| FE-PUB-001 | Landing page (calendar hero) | P2 |
| FE-PUB-002 | About page | P2 |
| FE-PUB-003 | Contact page | P2 |
| FE-PUB-004 | FAQs page | P2 |
| FE-PUB-005 | Coaches page | P2 |
| FE-CUS-001 | Customer login | P3 |
| FE-CUS-002 | Customer sign-up | P3 |
| FE-CUS-003 | Forgot password | P3 |
| FE-CUS-004 | Portal home / My Bookings | P3 |
| FE-CUS-005 | Customer profile | P3 |
| FE-CUS-006 | Achievements (TBD placeholder) | P3 |
| FE-CUS-007 | Customer schedule | P3 |
| FE-CUS-008 | Booking form | P3 |
| FE-CUS-009 | Payment method selection | P3 |
| FE-CUS-010 | GCash proof upload | P3 |
| FE-CUS-011 | Booking detail | P3 |
| FE-CUS-012 | Cancellation request | P3 |
| FE-CUS-013 | Reschedule request | P3 |
| FE-ADM-001 | Admin login | P4 |
| FE-ADM-002 | Admin dashboard | P4 |
| FE-ADM-003 | Staff management | P4 |
| FE-ADM-004 | Customer management | P4 |
| FE-ADM-005 | Schedule management | P4 |
| FE-ADM-006 | Class management | P4 |
| FE-ADM-007 | Coach management | P4 |
| FE-ADM-008 | Booking management | P4 |
| FE-ADM-009 | Payment review | P4 |
| FE-ADM-010 | Cancellation requests | P4 |
| FE-ADM-011 | Reschedule requests | P4 |
| FE-ADM-012 | Session roster and check-in | P4 |
| FE-ADM-013 | Settings | P4 |
| FE-ADM-014 | Sales and inventory reports | P4 |
| FE-ADM-015 | React Query data layer + prefetch | later |
| FE-ADM-016 | Collapsible admin sidebar + shell | later |
| FE-ADM-017 | AdminDataTable v2 | later |
| FE-ADM-018 | AdminPageShell + route skeletons | later |
| FE-ADM-019 | Admin form kit | later |
| FE-ADM-020 | Virtualized notification queues | later |
| FE-ADM-021 | Admin Storybook split | later |
| FE-ADM-022 | Dashboard bento | later |
| FE-ADM-023 | Payments notification queue | later |
| FE-ADM-024 | Cancellations notification queue | later |
| FE-ADM-025 | Reschedules notification queue | later |
| FE-ADM-026 | Classes list redesign | later |
| FE-ADM-027 | Class form wizard | later |
| FE-ADM-028 | Coaches list + imagery | later |
| FE-ADM-029 | Coach form tabs | later |
| FE-ADM-030 | Schedule + add-session wizard | later |
| FE-ADM-031 | Customers list + roster stats | later |
| FE-ADM-032 | Settings reorganize | later |

### Assets

| ID | Title | Phase |
| --- | --- | --- |
| ASSET-001 | Higgsfield generation pipeline, models, and prompt conventions | P1 |
| ASSET-002 | Asset inventory, naming conventions, and provenance manifest | P1 |
| ASSET-010 | Coach source-image intake via Balanse image assets dev | P0 → P1 |
| ASSET-011 | Coach headshot art-direction lockup and pilot approval | P1 |
| ASSET-012 | Professional headshots for the full coach roster | P2 |
| ASSET-013 | Headshot post-processing and delivery set | P2 |
| ASSET-014 | Coach placeholder avatar (the explicit no-source fallback) | P1 |
| ASSET-015 | Coaches page group hero and specialty accents (conditional) | P2 |
| ASSET-020 | Landing page imagery (Assets A–D) | P2 |
| ASSET-021 | About page imagery (Assets A–C) | P2 |
| ASSET-022 | Contact page imagery (Assets A–B) | P2 |
| ASSET-023 | FAQ header accent (Asset A) | P2 |
| ASSET-030 | Upload approved assets into Supabase Storage | P4 |

