# Spec — Customer portal mocks

- Auth screens follow `docs/screen-specs/customer/01-login.md`–`03-forgot-password.md`
- Portal surfaces follow `04`–`13` with human-readable statuses only
- Reserve from a guest calendar keeps the session in `returnTo`
- Customer Reserve skips the auth interstitial
- Hold deadline is `min(reserved_at + 8h, class_start)` and is not editable
- GCash proof upload never auto-confirms
- Cancellation and reschedule are requests; slots stay held
- Packages at `/portal/packages` follow `docs/screen-specs/customer/14-packages.md` and `openspec/specs/session-bundles.md`
