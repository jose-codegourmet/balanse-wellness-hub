-- Customer directory membership is independent of staff roles and editable phone numbers.
ALTER TABLE public.profiles ADD COLUMN "customerRegisteredAt" timestamptz;
CREATE INDEX "profiles_customerRegisteredAt_idx" ON public.profiles ("customerRegisteredAt");

-- Historical customer sign-up required contact_number in Auth metadata. Staff
-- provisioning never supplied it. Use that evidence once, not as a live filter.
UPDATE public.profiles p
SET "customerRegisteredAt" = p."createdAt"
FROM auth.users u
WHERE u.id = p.id
  AND NULLIF(btrim(u.raw_user_meta_data->>'contact_number'), '') IS NOT NULL
  AND NULLIF(btrim(p."contactNumber"), '') IS NOT NULL;

-- Runs after on_auth_user_created (Postgres orders same-event triggers by name).
-- Email sign-up supplies the marker on INSERT; Google completion supplies it on
-- metadata UPDATE. Invites/password resets supply neither. This is directory
-- classification ONLY, never a source of permissions or an authorization claim.
CREATE FUNCTION app_private.mark_customer_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'registration_source' = 'customer_portal'
     AND NULLIF(btrim(NEW.raw_user_meta_data->>'contact_number'), '') IS NOT NULL
  THEN
    UPDATE public.profiles
    SET "customerRegisteredAt" = CURRENT_TIMESTAMP
    WHERE id = NEW.id AND "customerRegisteredAt" IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Auth writes run as supabase_auth_admin, which cannot otherwise update public
-- profiles. Privilege elevation is limited to the triggering Auth row's NEW.id;
-- there is no callable RPC, arbitrary user-id argument, or new customer grant.
REVOKE ALL ON FUNCTION app_private.mark_customer_registration() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_customer_registered
AFTER INSERT OR UPDATE OF raw_user_meta_data ON auth.users
FOR EACH ROW EXECUTE FUNCTION app_private.mark_customer_registration();

COMMENT ON COLUMN public.profiles."customerRegisteredAt" IS
  'Customer portal registration; null for staff-only/incomplete accounts. Not authorization. Legacy backfill uses profile creation time.';
