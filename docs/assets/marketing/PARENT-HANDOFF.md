# Parent handoff — CTA marketing refresh

## Done
- Non-draft PR: https://github.com/jose-codegourmet/balanse-wellness-hub/pull/177
- Binaries committed on `assets/cta-marketing-refresh`: refreshed + new `landing`, `about`,
  `contact`, `faqs`, `coaches` slots as jpg + webp (+ 480px `-thumb` pair)
- `docs/assets/manifest.json` synced (42 rows) — passes `manifest.schema.json` and
  `pnpm assets:validate`
- Docs on branch: `REFRESH-NOTES.md`, `FE-PATHS.md`, `cost-log.csv` append rows
- Base64 `_pack` decode workaround and `expand-marketing-pack.yml` removed now that
  real binaries are in git
- Studio mood plate job: `d8a483d7-a892-4161-b14f-58d96b5f14da` (retire desert `0dad9831-…`)
- Model: `nano_banana_2_shots` @ 1k
- ASSET-015 group hero skipped

## Still open
- Supabase `marketing-assets` upload: anon writes blocked by RLS and no service-role key
  was invented. `ASSET-030` (`pnpm assets:upload`) must run with a service-role key held
  outside the repo. `storage_key` / `public_url` in the manifest are the intended keys.
- Merge with a merge or rebase commit; **do not squash** — the binary history is the point.

## NEW slots for FE
- `landing/mid-cta-21x9` (manifest `landing-e`)
- `about/cta-band-21x9` (manifest `about-d`)
- `coaches/specialty-accent-{calisthenics,pilates,dance}-1x1`
  (manifest `coaches-c-calisthenics` / `-pilates` / `-dance`)

Full path list and wiring snippet: `FE-PATHS.md`.

Sample URL (post ASSET-030):
`https://xydundrayuusqizssgby.supabase.co/storage/v1/object/public/marketing-assets/landing/mid-cta-21x9.webp`
