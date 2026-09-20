#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JOBS="$ROOT/docs/assets/headshots/headshot-v2-jobs.json"
command -v jq >/dev/null
command -v curl >/dev/null
command -v magick >/dev/null
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
for slug in $(jq -r '.cdn_png | keys[]' "$JOBS"); do
  url=$(jq -r --arg s "$slug" '.cdn_png[$s]' "$JOBS")
  dest="$ROOT/docs/assets/headshots/$slug"
  mkdir -p "$dest"
  echo "==> $slug"
  curl -fsSL "$url" -o "$TMP/$slug.png"
  magick "$TMP/$slug.png" -sampling-factor 4:2:0 -quality 88 -interlace Plane -strip "$dest/headshot-4x5.jpg"
  magick "$TMP/$slug.png" -quality 85 -define webp:method=6 -strip "$dest/headshot-4x5.webp"
  magick "$TMP/$slug.png" -resize 800x1000 -quality 82 "$dest/preview.jpg"
  identify "$dest/headshot-4x5.jpg"
done
echo "Materialized $(jq -r '.cdn_png | keys | length' "$JOBS") coaches."
