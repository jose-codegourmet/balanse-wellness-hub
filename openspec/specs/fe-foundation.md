# Spec: FE foundation

## Requirements

1. Apps start on ports 9000 and 9001 via `pnpm dev`.
2. Screens read data only through `MockDataAdapter`.
3. Brand tokens are defined once and consumed by both apps.
4. Public nav matches `docs/screen-specs/shared/01-navigation.md`.
5. Customer portal is guarded for guests and preserves `returnTo`.
6. Admin sidebar order includes Reports between Classes and Staff.
7. Admin login has no sign-up or forgot-password affordance.
8. Formatters always display Cebu time (`Asia/Manila`) and peso amounts.
