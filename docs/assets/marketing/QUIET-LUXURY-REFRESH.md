# Quiet luxury marketing refresh

September 19, 2026. User direction: warm ivory and earthy tones, professional and zen; calendar immediately in the homepage hero; mobile booking action only when the calendar is out of view; preserve coach portraits.

## Design and implementation

- Retain the existing Balansé palette, Fraunces/Manrope typography, wordmark, and public routes.
- Keep the real mock-backed calendar as the hero. Desktop displays a full-width month with class names and times inside dates; tablet displays a seven-day hourly grid; mobile displays one hourly day. Selecting a class opens its details and reservation action in a Jabkit dialog.
- Use Jabkit buttons in app-owned hero and CTA compositions. Vendored Jabkit sources remain pristine. Replace the animated photo footer with static brand, navigation, contact, and social content.
- Use IntersectionObserver for the mobile navigation CTA. The observer excludes the sticky header and reconnects on route changes.
- Present three existing coaches on the homepage and link to the complete roster. Preserve coach identity mappings and original headshot archives.
- Keep public UI mock-only and preserve session selection through authentication.

## Imagery

Six independent 2K generations were requested through Higgsfield MCP with `model: nano_banana_pro`, `resolution: 2k`. Higgsfield returned `model: nano_banana_2` for all six jobs. Both values are recorded in the manifests and `quiet-luxury-generation.json`; model equivalence is not assumed.

The six images refresh twelve marketing slots. Full-resolution WebP masters are in `masters/`; local delivery uses 1600px WebP/JPEG with 480px responsive thumbnails. Images depict illustrative studio and community scenes, not documented photographs of the actual premises. The later requested headshot upscale is recorded separately below. Storage destinations in the existing manifest are handoff metadata, not new uploads.

## Full menu and coach portrait follow-up

The public header now uses a hamburger on every screen size. Its full-screen menu composes the pristine Jabkit dialog with Balansé typography, all six public links, account actions, and studio contact details. Modal focus trapping, Escape dismissal, scroll locking, route dismissal, and focus restoration remain intact. The mobile booking action still appears only away from the calendar.

All eight existing professional portraits were upscaled through Higgsfield `bytedance_image_upscale` at 4K (3311 × 4096). Faces, expressions, clothing, and backgrounds were visually compared with the approved sources. Original contact sheets remain untouched; pre-upscale single-portrait crops are retained in each coach’s `archive/pre-upscale-card.webp`. Local 400/800/1600px portrait deliveries and 200/400/800px avatars come from the enhanced masters. Runtime portrait masters now point to the single 4K portrait; historical manifest masters still describe the original archive. No storage uploads or UI backend calls were made. Job provenance is in `../headshots/upscale-2026-09-19.json`.

## Calendar follow-up

The public hero uses `BalanseBookingCalendar`, an app-owned adaptation of Jabkit FullscreenCalendar’s bordered event grid. The vendored block is left pristine because its current API provides month/day selection but no interactive event selection or hourly week/day layouts. Jabkit buttons and dialogs provide the booking controls. The existing customer portal calendar is unchanged.

Responsive breakpoints use the shared config: month at 1280px+, week at 768–1279px, day below 768px. Previous/next moves the displayed period; Today resets to the mock clock. Hourly placement uses Manila timestamps, splits overnight events, and separates overlapping classes into lanes. The grid shows 6 AM–10 PM by default and expands for earlier/later classes. Empty dates stay visible. No sessions or backend integrations were added.

## Browser regression check

From the repository root with Node 24 and the web app on port 9000:

```sh
node apps/web/scripts/check-public-marketing.mjs
```

The check covers responsive widths, calendar placement, session-preserving login redirects, conditional mobile booking navigation, menu dismissal, public routes, and the absence of UI API calls. Use `MARKETING_BASE_URL` to target another preview.

## Calendar validation results

Repository lint, typecheck, all 92 unit tests, web/admin production builds, Storybook builds, brand guard, and secrets scan passed. Browser review at 1440px, 834px, 390px, and 360px verified the month/week/day layouts, hourly positions, period navigation, empty-week and class-filter states, closed booking actions, Reserve and Waitlist login redirects, Escape dismissal, focus restoration, and no horizontal overflow or browser errors. Unit coverage includes overlapping classes, consecutive classes, overnight clipping, Philippine timezone conversion, and leap/year boundaries.

## Earlier refresh validation results

Repository lint, typecheck, tests, production builds (web and admin), Storybook builds, brand guard, secrets scan, and asset-manifest validation passed. Browser regression checks passed against both development and production servers at widths from 360px to 1440px. Axe WCAG 2 A/AA checks found no homepage violations in light and dark modes after the contrast correction.

A local production Lighthouse mobile run scored performance 78, accessibility 100, and best practices 96, with zero layout shift and 50ms total blocking time. Simulated mobile LCP was 6.1s, so the performance target is not yet met. The best-practices deduction includes the existing missing favicon. This is lab evidence, not a claim about deployed performance.
