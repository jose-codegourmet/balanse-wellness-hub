#!/usr/bin/env bash
# Materialize headshot-v2 4K masters from CDN PNGs → jpg/webp/preview.
# Uses Python+Pillow so GitHub Actions (ubuntu ImageMagick 6) does not need `magick`.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JOBS="$ROOT/docs/assets/headshots/headshot-v2-jobs.json"
command -v jq >/dev/null
command -v curl >/dev/null
command -v python3 >/dev/null
python3 -c 'from PIL import Image' 2>/dev/null || {
  echo "Pillow required: pip install pillow" >&2
  exit 1
}
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
for slug in $(jq -r '.cdn_png | keys[]' "$JOBS"); do
  url=$(jq -r --arg s "$slug" '.cdn_png[$s]' "$JOBS")
  dest="$ROOT/docs/assets/headshots/$slug"
  mkdir -p "$dest"
  echo "==> $slug"
  curl -fsSL "$url" -o "$TMP/$slug.png"
  python3 - "$TMP/$slug.png" "$dest" <<'PY'
import sys
from pathlib import Path
from PIL import Image
src, dest = Path(sys.argv[1]), Path(sys.argv[2])
im = Image.open(src).convert("RGB")
w, h = im.size
print(f"  source {w}x{h}")
im.save(dest / "headshot-4x5.jpg", "JPEG", quality=88, optimize=True, progressive=True)
im.save(dest / "headshot-4x5.webp", "WEBP", quality=85, method=6)
preview = im.copy()
preview.thumbnail((800, 1000), Image.Resampling.LANCZOS)
preview.save(dest / "preview.jpg", "JPEG", quality=82, optimize=True)
jpg = Image.open(dest / "headshot-4x5.jpg")
print(f"  wrote headshot-4x5.jpg {jpg.size[0]}x{jpg.size[1]} ({(dest / 'headshot-4x5.jpg').stat().st_size} bytes)")
print(f"  wrote headshot-4x5.webp ({(dest / 'headshot-4x5.webp').stat().st_size} bytes)")
print(f"  wrote preview.jpg {preview.size[0]}x{preview.size[1]} ({(dest / 'preview.jpg').stat().st_size} bytes)")
PY
done
echo "Materialized $(jq -r '.cdn_png | keys | length' "$JOBS") coaches."
