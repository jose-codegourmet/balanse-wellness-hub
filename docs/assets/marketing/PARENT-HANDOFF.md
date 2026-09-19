# Parent handoff — CTA marketing refresh

## Done
- Non-draft PR: https://github.com/jose-codegourmet/balanse-wellness-hub/pull/177
- Docs on branch: `REFRESH-NOTES.md`, `FE-PATHS.md`, `_pack/decode.sh`, expand workflow, `cost-log.csv` append rows
- Studio mood plate job: `d8a483d7-a892-4161-b14f-58d96b5f14da` (retire desert `0dad9831-…`)
- Model: `nano_banana_2_shots` @ 1k
- ASSET-015 group hero skipped
- Supabase `marketing-assets` upload skipped (anon RLS; no service-role invented)

## Parent must squash-merge binaries
MCP cannot reliably push ~3.4MB image blobs. On the agent box:

```bash
cp -a /workspace/balanse-mkt-refresh/webready/docs/assets/marketing/{landing,about,contact,faqs,coaches} \
  docs/assets/marketing/
# or: tar xzf /tmp/cta-webready-clean.tar.gz
```

Then commit onto `assets/cta-marketing-refresh` and squash-merge.

Also push updated `docs/assets/manifest.json` from:
`/workspace/balanse-mkt-refresh/pr-files/docs/assets/manifest.json`

## NEW slots for FE
- `landing/mid-cta-21x9`
- `about/cta-band-21x9`
- `coaches/specialty-accent-{calisthenics,pilates,dance}-1x1`

Sample URL (post ASSET-030):
`https://xydundrayuusqizssgby.supabase.co/storage/v1/object/public/marketing-assets/landing/mid-cta-21x9.webp`
