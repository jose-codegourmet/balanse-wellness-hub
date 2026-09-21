BEGIN;
ALTER TABLE public.classes DROP CONSTRAINT classes_marketing_redirect_check;
ALTER TABLE public.classes ADD CONSTRAINT classes_marketing_redirect_check CHECK ("customPageUrl" IS NULL OR
 ("customPageUrl" ~ '^(https://[^/[:space:]]+(/|$)|/($|[^/]))' AND "customPageUrl" !~ '[[:space:]\\]')),
 ADD CONSTRAINT classes_catalogue_duration_check CHECK ("defaultDurationMinutes" IS NULL OR "defaultDurationMinutes" BETWEEN 1 AND 240),
 ADD CONSTRAINT classes_catalogue_price_check CHECK ("defaultCustomerPrice" IS NULL OR "defaultCustomerPrice" >= 0),
 ADD CONSTRAINT classes_catalogue_name_check CHECK (length(trim(name)) BETWEEN 1 AND 80),
 ADD CONSTRAINT classes_catalogue_intro_check CHECK (length("shortDescription") BETWEEN 1 AND 500);
COMMIT;
