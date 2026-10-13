-- WIRE-0701 (#360): venue operations fields used by the admin venue editor.
ALTER TABLE "public"."venues"
  ADD COLUMN "openingHours" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "studioOwned" BOOLEAN;
