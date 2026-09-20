#!/usr/bin/env python3
"""Merge coaches-b approval patch into docs + domain manifests (from main baseline)."""
import json
from pathlib import Path

root = Path(".")
patch = json.loads((root / "docs/assets/_staging/coaches-b-patch.json").read_text())
cb = patch["coaches_b"]
assert cb["id"] == "coaches-b"
assert cb["approval_status"] == "approved"
assert cb["identity_bound"] is True
assert isinstance(cb["source_asset_id"], list) and len(cb["source_asset_id"]) == 8

for rel in ("docs/assets/manifest.json", "packages/domain/src/asset-manifest.json"):
    path = root / rel
    data = json.loads(path.read_text())
    found = False
    for i, asset in enumerate(data["assets"]):
        if asset["id"] == "coaches-b":
            data["assets"][i] = cb
            found = True
            break
    if not found:
        raise SystemExit(f"coaches-b missing in {rel}")
    data["updated"] = patch["updated"]
    notes = data.get("notes") or ""
    suffix = patch.get("notes_suffix") or ""
    if suffix and suffix.strip() not in notes:
        data["notes"] = (notes.rstrip() + suffix).strip()
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print("patched", rel)

# verify docs == domain
docs = json.loads((root / "docs/assets/manifest.json").read_text())
dom = json.loads((root / "packages/domain/src/asset-manifest.json").read_text())
assert docs == dom
print("docs==domain OK; coaches-b approved")
