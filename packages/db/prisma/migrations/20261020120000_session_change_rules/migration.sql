-- #380 per-session change rules. Existing sessions keep today's behaviour: both on.
-- The switches only gate customer cancellation / reschedule requests; staff
-- actions, studio cancellations, and manual refunds are unchanged.
ALTER TABLE "public"."sessions"
  ADD COLUMN "cancellable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "reschedulable" BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN "public"."sessions"."cancellable" IS
  'Customers may open a cancellation request for a booking on this session. Off for one-off events. Staff actions are unaffected.';
COMMENT ON COLUMN "public"."sessions"."reschedulable" IS
  'Customers may open a reschedule request from a booking on this session. Off for one-off events. Does not block being chosen as a reschedule target.';
