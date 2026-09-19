# Assets track

Foundations for Higgsfield marketing imagery and coach headshots.

| File | Ticket | Purpose |
| --- | --- | --- |
| [runbook.md](runbook.md) | ASSET-001 | Four-stage pipeline, models, handoff, review, crops |
| [prompt-library.md](prompt-library.md) | ASSET-001 | Screen-spec prompts **verbatim**, keyed by page + letter |
| [cost-log.csv](cost-log.csv) | ASSET-001 | Per-asset spend template |
| [naming.md](naming.md) | ASSET-002 | Storage key convention |
| [manifest.schema.json](manifest.schema.json) | ASSET-002 | Versioned provenance schema for `FE-SHR-004` |
| [manifest.json](manifest.json) | ASSET-002 | Closed inventory (all slots, draft) |
| [intake.md](intake.md) | ASSET-010 | Balanse image assets / Drive intake path |
| [coverage-matrix.yaml](coverage-matrix.yaml) | ASSET-010 | Per-coach source / consent / generate vs placeholder |
| [source-catalog.yaml](source-catalog.yaml) | ASSET-010 | Stable `source_asset_id` values |
| [placeholders/](placeholders/) | ASSET-014 | Designed 4:5 + 1:1 coach fallback (source-free, no face) |
| [recipes/headshot-v1.md](recipes/headshot-v1.md) | ASSET-011 | Frozen 4:5 headshot prompt + `nano_banana_2_shots` params |
| [headshots/](headshots/) | ASSET-012 / ASSET-013 | Approved 4:5 masters (contact sheets) plus ImageMagick card 4:5, 1:1 avatar, responsive WebP/JPEG, lossless PNG archive; Alec / Sofia / Kate stay on ASSET-014 |
| [marketing/](marketing/) | ASSET-015 C · ASSET-020–023 | Working WebP + JPEG under `{landing,about,contact,faqs,coaches}/` using ASSET-002 `{slot}-{aspect}` names. Mood plate `0dad9831-2091-4538-b892-f9f96e6d7352` (source_free). Group hero not in this folder. |

**Storage:** `ASSET-030` — [storage-upload.md](storage-upload.md) / `pnpm assets:upload -- --dry-run`. Live buckets `coach-photos` (84 objects uploaded this wave) and `marketing-assets` (0 this run). Coach table photo columns remain a BE follow-up.

**Not generated here:** invented faces for placeholder coaches; coaches-B group hero (incomplete source coverage).
