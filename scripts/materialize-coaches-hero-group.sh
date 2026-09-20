#!/usr/bin/env bash
# Materialize coaches-b group hero webready (+ 4k archive) from CDN map.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JOBS="$ROOT/docs/assets/marketing/coaches/group-hero-jobs.json"
DEST="$ROOT/docs/assets/marketing/coaches"
mkdir -p "$DEST"
URL="$(jq -r '.cdn.master_4k_png' "$JOBS")"
if [[ -z "$URL" || "$URL" == "null" ]]; then
  echo "missing cdn.master_4k_png in $JOBS" >&2
  exit 1
fi
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
curl -fsSL "$URL" -o "$TMP/master.png"
cp "$TMP/master.png" "$DEST/group-hero-16x9-4k.png"
python3 - "$TMP/master.png" "$DEST" <<'PY'
import sys
from pathlib import Path
from PIL import Image
src, dest = Path(sys.argv[1]), Path(sys.argv[2])
im = Image.open(src).convert("RGB")
w, h = im.size
long = max(w, h)
if long > 1600:
    scale = 1600 / long
    im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
im.save(dest / "group-hero-16x9.jpg", quality=78, optimize=True)
im.save(dest / "group-hero-16x9.webp", quality=72, method=6)
tw, th = im.size
scale = 480 / max(tw, th)
thumb = im.resize((int(tw * scale), int(th * scale)), Image.Resampling.LANCZOS)
thumb.save(dest / "group-hero-16x9-thumb.jpg", quality=72, optimize=True)
thumb.save(dest / "group-hero-16x9-thumb.webp", quality=70, method=6)
print("wrote", dest)
for p in sorted(dest.glob("group-hero-16x9*")):
    print(p.name, p.stat().st_size)
PY
