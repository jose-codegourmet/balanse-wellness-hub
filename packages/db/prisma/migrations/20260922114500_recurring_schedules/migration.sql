-- #288 recurring schedules: bounded weekly rules with eagerly generated sessions.
BEGIN;

CREATE TABLE public.session_recurrence_rules (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sourceSessionId" text NOT NULL,
  "startsOn" date NOT NULL,
  "endsOn" date NOT NULL,
  weekdays integer[] NOT NULL,
  "timeZone" text NOT NULL DEFAULT 'Asia/Manila',
  publish boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT session_recurrence_rules_date_order CHECK ("endsOn" >= "startsOn"),
  CONSTRAINT session_recurrence_rules_weekdays CHECK (
    cardinality(weekdays) BETWEEN 1 AND 7
    AND weekdays <@ ARRAY[0,1,2,3,4,5,6]
  ),
  CONSTRAINT session_recurrence_rules_timezone CHECK ("timeZone" = 'Asia/Manila'),
  CONSTRAINT "session_recurrence_rules_sourceSessionId_fkey"
    FOREIGN KEY ("sourceSessionId") REFERENCES public.sessions(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX session_recurrence_rules_sourceSessionId_idx
  ON public.session_recurrence_rules("sourceSessionId");
CREATE INDEX session_recurrence_rules_active_endsOn_idx
  ON public.session_recurrence_rules(active, "endsOn");

ALTER TABLE public.sessions ADD COLUMN "recurrenceRuleId" text;
CREATE INDEX sessions_recurrenceRuleId_idx ON public.sessions("recurrenceRuleId");
ALTER TABLE public.sessions
  ADD CONSTRAINT "sessions_recurrenceRuleId_fkey"
  FOREIGN KEY ("recurrenceRuleId") REFERENCES public.session_recurrence_rules(id)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public.session_recurrence_rules ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.session_recurrence_rules FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.session_recurrence_rules TO authenticated;

CREATE POLICY session_recurrence_rules_admin_all
  ON public.session_recurrence_rules
  FOR ALL
  TO authenticated
  USING ((select app_private.is_admin(auth.uid())))
  WITH CHECK ((select app_private.is_admin(auth.uid())));

NOTIFY pgrst, 'reload schema';
COMMIT;
