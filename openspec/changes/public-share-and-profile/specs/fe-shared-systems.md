# Delta: FE shared systems

Base: `openspec/specs/fe-shared-systems.md`. Merge on archive.

## ADDED Requirements

8. Display-name rule (`@balanse/domain` `getDisplayName`): nickname (trimmed, non-empty), otherwise first name. Customer-to-customer surfaces never show the last name. Staff surfaces show the full name with the nickname as a subtitle.
9. `UserAvatar` (`@balanse/ui`) renders a customer photo or, when there is none or the image fails, initials (`getInitials`: first letter of first name + first letter of last name, safe for an empty last name) on a deterministic brand-palette tone (`avatarToneFor(seed)`). Sizes `sm`, `default`, `lg`, `xl`. `UserAvatarStack` overlaps avatars with a "+N" chip. Coach avatars keep their existing component.
10. `ShareDialog` + `ShareButton` (`@balanse/ui`) is the one share experience: copy link (with a visible fallback field), native share when `navigator.share` exists, an on-screen QR (dark on light, error correction `M`, quiet zone ≥ 4), **Download QR** (`balanse-<fileSlug>-qr.png`, 1024×1024) and **View poster card** when a poster URL is given. The poster opens in a new tab for viewing or browser-managed saving. Dialog on desktop, drawer below `md`. Callers pass ready URLs; the dialog adds `via=qr` for the QR and fetches nothing else. `disabledReason` renders a disabled trigger with a tooltip.
11. Share URLs are built with `buildPublicSessionPath` / `buildPublicEventPath` and `withShareParams`: customer `ref=<referralCode>&src=customer`, studio `src=studio`, QR `via=qr` (`via=link` omitted). Attribution cookie `balanse_share_attr`, 30 days, last touch. Channel mapping `CUSTOMER_LINK` / `CUSTOMER_QR` / `STUDIO_LINK` / `STUDIO_QR` via `toReferralChannel`.
12. Poster card (1080×1350) and OG image (1200×630) come from one renderer built on `@balanse/config` tokens and the brand display font: poster or class hero (fallback brand pattern), title, Manila date/time, venue, up to 3 coaches, "Spots left" only when nearly full, the QR (poster only) and the wordmark. Cancelled shows a ribbon; past posters 404. Passes `pnpm guard:brand`.
13. Customer profile nav gains `{ id: "about", label: "About you", href: "/portal/profile/about" }`.
14. Onboarding option lists (`FITNESS_GOAL_OPTIONS`, `EXPERIENCE_LEVEL_OPTIONS`, `HEARD_FROM_OPTIONS`) and `ONBOARDING_STEPS` are fixed in `@balanse/domain` and mirror the Prisma enums. No medical or injury options.
