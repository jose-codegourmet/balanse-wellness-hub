# Timezone assumption

All session times are stored as instants and **displayed** in `Asia/Manila` (Cebu local time), regardless of the viewer’s device timezone. The Philippines does not observe DST.

Helpers: `formatSessionRange`, `formatHoldDeadline`, `effectiveHoldDeadline` in `@balanse/domain`.
Hold display is `min(holdExpiresAt, classStartsAt)`.
