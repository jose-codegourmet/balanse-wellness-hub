-- INF-004: reproducible storage buckets on the existing Balanse project.
-- Visibility: payment-proofs private; coach-photos and marketing-assets public-read.
-- Per-object RLS (owner customer / admin write) is BE-021.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'payment-proofs',
    'payment-proofs',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']::text[]
  ),
  (
    'coach-photos',
    'coach-photos',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']::text[]
  ),
  (
    'marketing-assets',
    'marketing-assets',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  )
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
