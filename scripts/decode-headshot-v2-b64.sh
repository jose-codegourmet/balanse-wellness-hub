#!/usr/bin/env bash
# Join/decode headshot-4x5.{jpg,webp}.b64(.partNN) sidecars into binary masters.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
shopt -s nullglob
decoded=0
for dir in "$root"/docs/assets/headshots/*/; do
  slug="$(basename "$dir")"
  for ext in jpg webp; do
    out="$dir/headshot-4x5.$ext"
    single="$dir/headshot-4x5.$ext.b64"
    parts=( "$dir"headshot-4x5."$ext".b64.part* )
    if [[ -f "$single" ]]; then
      base64 -d "$single" > "$out"
      rm -f "$single"
      echo "wrote $out ($(wc -c < "$out") bytes) from single .b64"
      decoded=$((decoded+1))
    elif [[ ${#parts[@]} -gt 0 ]]; then
      b64="$dir/headshot-4x5.$ext.b64"
      cat $(printf '%s\n' "${parts[@]}" | sort) > "$b64"
      base64 -d "$b64" > "$out"
      rm -f "$b64" "${parts[@]}"
      echo "wrote $out ($(wc -c < "$out") bytes) from ${#parts[@]} parts"
      decoded=$((decoded+1))
    fi
  done
done
if [[ $decoded -eq 0 ]]; then
  echo "No .b64 sidecars found — run scripts/materialize-headshot-v2.sh instead" >&2
  exit 1
fi
echo "Decoded $decoded files."
