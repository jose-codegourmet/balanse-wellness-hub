# Ways of working

This file is the source of truth for the project's folder structure, naming conventions, and architectural decisions. Keep it up to date in the same change whenever a convention is introduced, changed, or deliberately departed from.

Authoring details for the colocated file set live in [`docs/component-guide.md`](./component-guide.md). Placement — where a folder goes — is decided here. Every public component is wrapped in its own kebab-case folder; never dump sibling `SomeExample.tsx` / `SomeExample.meta.ts` files as loose files in a shared directory.

## Read order

Agents read in this order and stop as soon as the picture is clear:

1. **OpenSpec** — `openspec/specs/` for the capability; `openspec/changes/` if a matching change is in flight.
2. **`Component.meta.ts`** — colocated in the component folder. If it already explains purpose, API, and when to use the component, do not open `Component.tsx`.
3. **Implementation** — only when the meta is missing, stale, or does not answer the question.

`docs/metas/` are phase closeout notes, not a substitute for OpenSpec.

This is a two-app Next.js monorepo. Each app has its own `src/`:

- `apps/web` — public marketing + customer portal
- `apps/admin` — staff dashboard

## Component foldering

Each component owns a `kebab-case` folder. Implementation and companions live **inside** that folder. Do not place two components’ files as siblings in the same directory.

Wrong — loose siblings:

```
_components/
  SomeExample.tsx
  SomeExample.meta.ts
  AnotherExample.tsx
  AnotherExample.meta.ts
```

Right — one folder per component (non-form):

```
_components/
  some-example/
    SomeExample.meta.ts
    SomeExample.tsx
    SomeExample.stories.tsx
  another-example/
    AnotherExample.meta.ts
    AnotherExample.tsx
    AnotherExample.stories.tsx
```

Right — form (own component; schema + defaults required):

```
login-form/
  LoginForm.tsx
  LoginForm.meta.ts
  LoginForm.defaults.ts
  LoginForm.schema.ts
  LoginForm.stories.tsx
```

| Thing | Pattern | Example |
| --- | --- | --- |
| Folder | `kebab-case` | `some-example/` |
| Files | `PascalCase.*` | `SomeExample.tsx` |
| Always | `.meta.ts`, `.tsx`, `.stories.tsx` | every authored component |
| Forms only | `.schema.ts`, `.defaults.ts` | [react-hook-form](https://react-hook-form.com/) + zod value schema |
| Story fixtures | `.stories-data.ts` | non-form demo data used only by stories |
| Never | `.usecase.md` | purpose lives in `.meta.ts` |

**Do not write, add, or complete `Component.usecase.md`.** Purpose, when to use, and when not to use belong in `Component.meta.ts`. Leave existing `*.usecase.md` files alone unless a ticket asks to delete them.

**`.schema.ts` and `.defaults.ts` exist only when the component is a form** (or a value-owning form control). Do not add them to display, layout, chart, card, or other non-form components. Props types for non-forms live in `Component.meta.ts` or next to the component in `Component.tsx`. This rule supersedes the older “always ship schema + defaults + usecase” language in `docs/component-guide.md`.

This applies everywhere a component is authored: `_components/` next to a route, `src/components/balanse/`, `src/modules/` (legacy), and `packages/ui`. Vendored `src/components/jabkit/` keeps its upstream shape and is exempt.

Admin composition may nest under a feature parent (`dashboard/dashboard-bento/`). One-off non-component helpers (`_lib/format-money.ts`, `_hooks/use-booking-id.ts`) do not need the companion set, but they still live in kebab-case folders when they are more than a single file.

## Forms

Every `<form>` is its own component. Do not inline a form in a page, layout, dialog wrapper, or a parent section that also owns other UI. Extract it into a kebab-case folder and author it with [react-hook-form](https://react-hook-form.com/).

Required file set:

```
login-form/
  LoginForm.tsx
  LoginForm.meta.ts
  LoginForm.defaults.ts
  LoginForm.schema.ts
  LoginForm.stories.tsx
```

| File | Role |
| --- | --- |
| `LoginForm.tsx` | The only file that renders the `<form>`. Uses `useForm` + `zodResolver`. |
| `LoginForm.schema.ts` | Zod value schema. Export the schema and the inferred values type. |
| `LoginForm.defaults.ts` | `defaultValues` reused by `useForm({ defaultValues })` and the story. |
| `LoginForm.meta.ts` | Purpose, API, when to use / not use. |
| `LoginForm.stories.tsx` | Stories reuse the same schema and defaults. Do not re-declare values inline. |

Do not manage form fields with raw `useState` + `onSubmit` preventDefault. Bind fields through react-hook-form (`register` or `Controller`) and surface errors from `formState.errors`. Authoring details (naming, zod, `FieldError`) live in [`docs/component-guide.md`](./component-guide.md).

## Component colocation convention

### a. Colocate route-specific UI next to the route

Route-specific components live in a `_components/` folder (plus `_hooks/` and `_lib/` as needed) next to the route that uses them. The underscore prefix excludes the folder from Next.js routing. Each component inside that folder is still wrapped in its own kebab-case directory.

```
apps/web/src/app/(portal)/portal/bookings/_components/booking-card/BookingCard.tsx
apps/admin/src/app/(dashboard)/dashboard/_components/sales-series-chart/SalesSeriesChart.tsx
```

### b. Shared components stay out of `app/`

Shared/global components used by 2+ unrelated routes live in `src/components/`:

- `src/components/jabkit/` — vendored Jabkit primitives (pristine)
- `src/components/balanse/` — app-specific composition of Jabkit / `@balanse/ui`

Never place shared components inside `app/`.

### c. Decision rule

Start colocated. Promote to `src/components/` only once a second, **unrelated** route needs the component. Related routes in the same group (for example every `/portal/bookings/*` page, or every public marketing page) may share a `_components/` folder at the group or feature segment.

### d. Route groups

Use `(groupName)/` to organize related routes without affecting the URL. Existing groups:

| App | Group | URL prefix |
| --- | --- | --- |
| `apps/web` | `(public)` | `/`, `/about`, `/classes`, `/coaches`, `/contact`, `/faqs` |
| `apps/web` | `(auth)` | `/login`, `/sign-up`, `/forgot-password` |
| `apps/web` | `(portal)` | `/portal/*` |
| `apps/admin` | `(dashboard)` | `/dashboard`, `/classes`, `/schedule`, … (everything except `/login` and `/dev`) |

### e. No loose non-route files in route segments

Never place a plain (non-route) `.tsx` file directly inside a route segment folder in `app/`. Route files only: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `default.tsx`, `route.ts`, `robots.ts`. Helpers go in `_components/`, `_hooks/`, or `_lib/`.

### Example: target tree on current routes

Illustrative placement of today's screens under the colocation rule. Route names are real; `_components/` folders are the target shape (most screens still live in `src/modules/` today).

```
apps/web/src/app/
  layout.tsx
  not-found.tsx
  (auth)/
    layout.tsx
    login/
      page.tsx
      _components/customer-login/CustomerLogin.tsx
    sign-up/
      page.tsx
      _components/customer-sign-up/CustomerSignUp.tsx
    forgot-password/
      page.tsx
      _components/customer-forgot-password/CustomerForgotPassword.tsx
  (public)/
    layout.tsx
    page.tsx                          # landing
    _components/                      # public chrome used only by this group
    about/page.tsx
    classes/
      page.tsx
      loading.tsx
      error.tsx
      _components/classes-page/ClassesPage.tsx
      [slug]/
        page.tsx
        _components/class-detail-page/ClassDetailPage.tsx
    coaches/page.tsx
    contact/page.tsx
    faqs/page.tsx
  (portal)/
    layout.tsx
    _components/                      # portal chrome used only by this group
    portal/
      page.tsx
      achievements/page.tsx
      schedule/page.tsx
      book/[sessionId]/page.tsx
      bookings/
        new/page.tsx
        [bookingId]/
          page.tsx
          cancel/page.tsx
          reschedule/page.tsx
          payment/
            page.tsx
            gcash/page.tsx
      profile/
        page.tsx
        account/page.tsx
        password/page.tsx
        policies/page.tsx
        _components/profile-section-route/ProfileSectionRoute.tsx
  api/[[...path]]/route.ts
  dev/
    kit/page.tsx
    tokens/page.tsx

apps/admin/src/app/
  layout.tsx
  page.tsx                            # redirects into the dashboard
  not-found.tsx
  robots.ts
  login/page.tsx
  (dashboard)/
    layout.tsx
    error.tsx
    dashboard/page.tsx
    bookings/
      page.tsx
      [bookingId]/page.tsx
    cancellations/page.tsx
    classes/
      page.tsx
      new/page.tsx
      [classId]/page.tsx
    coaches/
      page.tsx
      [coachId]/page.tsx
    customers/
      page.tsx
      [customerId]/page.tsx
    payments/page.tsx
    payment-qr/page.tsx
    reports/
      page.tsx
      [sessionId]/page.tsx
    reschedules/page.tsx
    schedule/
      page.tsx
      new/page.tsx
      [sessionId]/page.tsx
    sessions/[sessionId]/roster/page.tsx
    settings/
      page.tsx
      content/
        page.tsx
        about-page/page.tsx
        contact/page.tsx
        faqs/page.tsx
      policies/
        page.tsx
        new/page.tsx
        [policyId]/page.tsx
    staff/
      page.tsx
      [staffId]/page.tsx
    @modal/                           # intercepting schedule / class dialogs
      default.tsx
      (.)schedule/...
      (.)classes/...
  dev/
    kit/page.tsx
    tokens/page.tsx
```

## `src/` top-level folders

Both apps currently have the same four top-level folders. Neither app has `hooks/` or `types/` at `src/` root; add those only if a convention here is updated first.

| Folder | What belongs there |
| --- | --- |
| `app/` | Next.js App Router routes and route files only. Colocated `_components/<kebab-name>/`, `_hooks/`, and `_lib/` for UI used by that route or group. |
| `components/` | Shared app UI, one kebab-case folder per component. `jabkit/` is vendored and stays pristine; `balanse/` is app composition used by 2+ unrelated routes. |
| `lib/` | Non-UI helpers (classnames, class-catalogue loaders, admin React Query). Not React components. |

Admin React Query keys (`apps/admin/src/lib/query/keys.ts`) are rooted at
`["admin", adminAuthScope(principal)]`. The scope is a staff authorization
fingerprint (staff id + role/permission revision), not the coarse
`guest | customer | admin` shell role. Identity switches must
`removeQueries` / `clear` before navigating through
`firstPermittedAdminRoute`.
| `modules/` | Current home for screen-level implementations and app infrastructure (auth, public, customer, admin pages; `layout/`, `providers/`, `session/`, `notifications/`). **Do not add new route-specific screens here** — colocate them under the matching `app/` route. Promote into `src/components/` only when a second unrelated route needs the piece. Cross-cutting kits that already serve many routes (admin `forms/`, session providers) stay here or in `src/components/` until a dedicated migration. |
