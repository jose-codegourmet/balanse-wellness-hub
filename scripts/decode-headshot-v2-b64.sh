#!/usr/bin/env bash
# Join headshot-4x5.{jpg,webp}.b64.partNN sidecars, base64-decode to binary masters.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
shopt -s nullglob
decoded=0
for dir in "$root"/docs/assets/headshots/*/; do
  slug="$(basename "$dir")"
  for ext in jpg webp; do
    parts=( "$dir"headshot-4x5."$ext".b64.part* )
    if [[ ${#parts[@]} -eq 0 ]]; then
      continue
    fi
    b64="$dir/headshot-4x5.$ext.b64"
    cat $(printf '%s\n' "${parts[@]}" | sort) > "$b64"
    base64 -d "$b64" > "$dir/headshot-4x5.$ext"
    rm -f "$b64" "${parts[@]}"
    echo "wrote docs/assets/headshots/$slug/headshot-4x5.$ext ($(wc -c < "$dir/headshot-4x5.$ext") bytes)"
    decoded=$((decoded+1))
  done
done
if [[ $decoded -eq 0 ]]; then
  echo "No .b64.part* sidecars found" >&2
  exit 1
fi
echo "Decoded $decoded files."
