-- Cache auth.uid() once per statement for the #288 recurrence admin policy.
BEGIN;

DROP POLICY IF EXISTS session_recurrence_rules_admin_all
  ON public.session_recurrence_rules;

CREATE POLICY session_recurrence_rules_admin_all
  ON public.session_recurrence_rules
  FOR ALL
  TO authenticated
  USING ((select app_private.is_admin((select auth.uid()))))
  WITH CHECK ((select app_private.is_admin((select auth.uid()))));

COMMIT;

