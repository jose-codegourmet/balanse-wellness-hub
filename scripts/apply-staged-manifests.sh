#!/usr/bin/env bash
set -euo pipefail
python3 <<'PY'
import base64, gzip, json
from pathlib import Path
root = Path(".")
staging = root / "docs/assets/_staging"
parts = sorted(staging.glob("manifest.json.gz.b64.part*"))
if not parts:
    raise SystemExit(f"no parts in {staging}")
b64 = "".join(p.read_text().strip() for p in parts)
raw = gzip.decompress(base64.b64decode(b64))
data = json.loads(raw)
cb = next(a for a in data["assets"] if a["id"] == "coaches-b")
assert cb.get("approval_status") == "approved", cb.get("approval_status")
assert cb.get("identity_bound") is True
assert isinstance(cb.get("source_asset_id"), list) and len(cb["source_asset_id"]) == 8
(root / "docs/assets/manifest.json").write_bytes(raw)
(root / "packages/domain/src/asset-manifest.json").write_bytes(raw)
print("applied manifests:", len(raw), "bytes; coaches-b approved with", len(cb["source_asset_id"]), "sources")
PY
