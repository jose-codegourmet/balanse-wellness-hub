-- Reservation functions use search_path = public; Supabase installs pgcrypto
-- in extensions. Bind the helper to pgcrypto's actual schema at migration time
-- so hosted and plain-Postgres installations both work with a restricted path.
-- Preserve the existing 16 random bytes / 32 hexadecimal characters and ACLs.
DO $migration$
DECLARE
  crypto_schema text;
BEGIN
  SELECT n.nspname INTO STRICT crypto_schema
  FROM pg_catalog.pg_extension e
  JOIN pg_catalog.pg_namespace n ON n.oid = e.extnamespace
  WHERE e.extname = 'pgcrypto';

  EXECUTE pg_catalog.format($definition$
    CREATE OR REPLACE FUNCTION app_private.opaque_reference()
    RETURNS text
    LANGUAGE sql
    VOLATILE
    SECURITY INVOKER
    SET search_path = ''
    AS $body$
      SELECT pg_catalog.encode(%I.gen_random_bytes(16), 'hex');
    $body$;
  $definition$, crypto_schema);
END;
$migration$;
