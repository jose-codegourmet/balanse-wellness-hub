#!/usr/bin/env bash
# Join group-hero-16x9*.b64.partNN under docs/assets/marketing/_pack_group_hero/,
# base64-decode into docs/assets/marketing/coaches/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACK="$ROOT/docs/assets/marketing/_pack_group_hero"
DEST="$ROOT/docs/assets/marketing/coaches"
mkdir -p "$DEST"
decoded=0
for stem in group-hero-16x9.webp group-hero-16x9.jpg group-hero-16x9-thumb.webp group-hero-16x9-thumb.jpg; do
  mapfile -t parts < <(ls "$PACK"/"$stem".b64.part* 2>/dev/null | sort || true)
  if [[ ${#parts[@]} -eq 0 ]]; then
    continue
  fi
  b64="$PACK/$stem.b64"
  cat "${parts[@]}" > "$b64"
  base64 -d "$b64" > "$DEST/$stem"
  rm -f "$b64"
  decoded=$((decoded+1))
  echo "decoded $stem ($(wc -c < "$DEST/$stem") bytes)"
done
if [[ $decoded -eq 0 ]]; then
  echo "No .b64.part* sidecars found in $PACK" >&2
  exit 1
fi
echo "Decoded $decoded files into $DEST"
