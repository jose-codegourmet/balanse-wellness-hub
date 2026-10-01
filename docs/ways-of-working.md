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
`firstImplementedPermittedAdminRoute` (domain `firstPermittedAdminRoute`).
Admin nav, guards, and
actions consume `ADMIN_NAV_ACCESS` / `ADMIN_ROUTE_ACCESS` /
`ADMIN_ACTION_ACCESS` via `apps/admin/src/lib/authorization/admin-access.ts`
and `useAdminAccess` — never copy permission lists into screens.
| `modules/` | Current home for screen-level implementations and app infrastructure (auth, public, customer, admin pages; `layout/`, `providers/`, `session/`, `notifications/`). **Do not add new route-specific screens here** — colocate them under the matching `app/` route. Promote into `src/components/` only when a second unrelated route needs the piece. Cross-cutting kits that already serve many routes (admin `forms/`, session providers) stay here or in `src/components/` until a dedicated migration. |

## Customer self-service writes and the web proxy (#343)

- **Mock store is per runtime.** The browser and the Next server each hold their own in-memory `MockDataAdapter`. Pages rendered on the server (portal header, home nudge, public share pages, booking prefill) only see writes made on the server.
- **Self-service writes therefore go through server actions.** Sign-up (`app/(auth)/sign-up/_lib/sign-up-actions.ts`) and profile/onboarding writes (`app/(portal)/portal/profile/_lib/`) are server actions. Routes pass them to client components as props. The customer id always comes from the server-side mock principal (`getServerMockPrincipal()`), never from the caller. Stories pass `mockCustomerSelfServiceActions(customerId)`, which runs against the in-browser store.
- **`apps/web/src/proxy.ts`** (Next 16 renamed `middleware.ts` to `proxy.ts`) only captures share attribution (`ref` / `src` / `via`) into the HttpOnly `balanse_share_attr` cookie. It never redirects or strips the query, and skips portal, api, share, dev, `_next`, and static files. Read or clear the cookie through `src/modules/share/attribution.ts`.
- **Public share pages** (`/sessions/...`, `/events/...`) do not have `loading.tsx`. A streaming boundary makes `permanentRedirect` / `notFound` return HTTP 200, and stale share links must 301 and unknown ones must 404.

## Buttons

One button system for both apps: the editorial `Button` in `@balanse/ui` (`packages/ui/src/components/button/Button.tsx`). Crisp 6px corners, uppercase letter-spaced labels (uppercased in CSS, so write labels in sentence case), navy / gold / cream.

| Variant | Use for |
| --- | --- |
| `default` (alias `primary`) | The one main action on a screen or dialog |
| `accent` | Gold. Booking and purchase moments (book a session, buy a package) |
| `secondary` | Tonal cream. Supporting actions beside a primary |
| `outline` | Cancel, back, edit, secondary navigation actions |
| `ghost` | Toolbars, row actions, dismiss, icon buttons in dense UI |
| `destructive` | Cancel a session, archive, delete (outline that fills red on hover) |
| `link` | Inline text actions ("Reset to class default", "Show all coaches") |

Sizes: `sm` 32px (dense admin rows and tables), `md` 40px (default), `lg` 48px (public hero and page CTAs); icon-only `icon-sm` / `icon` / `icon-lg` (`xs` / `icon-xs` only for very dense tables). On touch screens (`pointer-coarse:`) the sizes grow by themselves: `sm` / `icon-sm` to 40px, `md` / `icon` to 44px, `lg` to 48px. `xs` / `icon-xs` do not grow, which is why they are reserved for very dense tables.

Rules:

- Use `Button` for every action. Links that look like buttons use `Button` with `render={<Link href="…" />}` and `nativeButton={false}`, or `className={buttonVariants({ … })}` on the `Link`.
- Choices, toggles, filters, and time/day pickers use `Chip` (`packages/ui/src/components/chip/Chip.tsx`), not `Button`. For radio or checkbox semantics, style the wrapping `<label>` with `chipVariants({ selected })` and give the input `className="sr-only"`.
- Do not restyle a button's shape, height, colour, padding, radius, or casing with `className` or page CSS. `className` is for layout only (`w-full`, `mt-*`, `self-start`, `hidden md:inline-flex`). If a new look is needed, add a variant to `Button`.
- On navy surfaces (navy CTA bands, the admin sidebar) add `dark` to the surface wrapper so the theme tokens flip for that subtree: `accent` stays gold, and `outline`, `ghost` and `link` draw in warm white with a gold focus ring. There is no separate inverse variant.
- Do not hand-roll `<button className="…">` for anything that looks like a button, chip, or text link. Selectable cards, calendar cells, and tabs are components of their own and may stay custom.
- Labels are verb-first sentence case ("Book session", "Save changes"); CSS uppercases them.

### Radius and fields

The admin theme (`apps/admin/src/app/globals.css`) uses an editorial radius scale so every `rounded-*` utility matches the buttons: `rounded-sm` 4px, `rounded-md`/`rounded-lg` 6px (buttons, fields, chips), `rounded-xl`/`rounded-2xl` 8px (cards, panels), `rounded-3xl` 10px (large surfaces). Do not hardcode larger radii (`rounded-[1rem]`, `rounded-[2rem]`). `rounded-full` is only for avatars, switches, dots, and progress bars. Tailwind v4 CSS-variable radii are written `rounded-(--radius)`, never `rounded-[--radius]`.

Fields share `packages/ui/src/lib/control-surface.ts`: 6px corners, a navy hairline like the outline button, and the same heights as `Button` (sm 32px, md 40px, lg 48px). Field labels are small letter-spaced caps like button labels. Badges are 4px tags, not pills.

### Jabkit patches

Recorded deviations from pristine Jabkit source:

| File | Patch | Why |
| --- | --- | --- |
| `apps/{admin,web}/src/components/jabkit/button/Button.tsx` | Renders `@balanse/ui` `buttonVariants` (Jabkit `primary`→`default`, `secondary`→`outline`, `ghost`, `destructive`; sizes unchanged). API unchanged. | One button system across Jabkit blocks and app code (2026-09-29 button redesign). |
| `apps/{admin,web}/src/components/jabkit/fullscreen-calendar/FullscreenCalendar.tsx` | Toolbar uses `@balanse/ui` `Button` / `ButtonGroup` for today, previous/next month, and add; invalid `rounded-[--radius]` classes replaced with theme radii. | The hand-rolled arrow group had square corners, a gold hover, and a different height from its neighbours. |

## Tablet and touch

The admin app is used on a regular iPad (768–834px portrait, 1024–1180px landscape), so the admin shell and every interactive affordance must work with a coarse pointer and no hover.

- **Shell breakpoint is `lg` (1024px), not `md`.** `AdminShell`, `AdminSidebar`, `AdminSidebarMobile`, and `AdminNotificationHeader` switch from the top bar + navigation drawer to the inline collapsible sidebar at `lg`. Tablet portrait therefore gets the full content width instead of a 288px rail beside ~480px of content. Page-level breakpoints (`useIsMobile`, calendar week view, `AdminWizard`, form grids) stay at 768px; do not move them to match the shell. `AdminDataTable` does not read the viewport at all (next bullet).
- **Lists switch on their container, not the viewport.** The sidebar changes the content width without changing the viewport, so `AdminDataTable` `layout="auto"` measures its own section with a `ResizeObserver` (`useAdminDataTableLayout`) and renders cards when it is narrower than 64rem / 1024px (`cardsBelow`) or when the table would scroll horizontally inside it; a measured overflow is remembered for that width so paging does not flip the layout. Resize measurements are debounced (120ms) so the sidebar animation commits one re-render, and the entering layout fades in (`motion-safe`). That makes every list a card list on an iPad (portrait and landscape) and beside an expanded sidebar on a 1280px laptop (913px column); the collapsed rail (1125px) and wider screens get tables. Keep every table's min-content width under ~1024px so any container that passes the floor renders it without horizontal scroll (widest today: 823px): short headers ("Upcoming", not "Upcoming sessions"), `line-clamp-2` rather than `truncate` for long text (`truncate` is `nowrap`, so its `max-w` becomes the column's minimum), `whitespace-nowrap` only on dates and amounts, `break-all` on URLs, and badges at `size="sm"`. Measure with the table at `width: min-content` in devtools. Apply the same rule to any new component with a wide and a narrow layout: measure the container, or use Tailwind `@container` variants for CSS-only differences — never `md:` / `lg:` for something that sits beside the sidebar.
- **The collapsed icon rail is a pointer affordance.** Its labels are hover tooltips (Base UI `Tooltip`, which does not open on touch), so never default to the collapsed rail for a tablet layout. If you need more width on a tablet, hide the sidebar, do not collapse it.
- **Hover-reveal must not be the only way to reach an action.** Tailwind v4 wraps `hover:` in `@media (hover: hover)`, so `opacity-0 group-hover:opacity-100` is permanently invisible on an iPad. Use `pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100` (hide only where hovering exists) or add `pointer-coarse:opacity-100` as a fallback. Row actions in `AdminDataTable` already pass `touch` in card mode and `icon-sm` grows on touch in table mode.
- **Tap targets grow by themselves.** `Button` sizes carry `pointer-coarse:` bumps (see Buttons); do not add ad-hoc `min-h-11` to buttons. For custom tappable rows and chips use `min-h-11` on the row, as `AdminDataTable` and the toolbar filter lists do.
- **No double-tap zoom on controls.** `apps/admin/src/app/globals.css` sets `touch-action: manipulation` on links, buttons, labels, and fields so rapid taps (pagination, steppers) do not zoom the page. Pinch zoom still works.
- **Review in Storybook** at the 768 (tablet) and 1024 (tablet landscape) viewport presets before shipping shell or list changes.
