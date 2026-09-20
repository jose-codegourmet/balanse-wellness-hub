#!/usr/bin/env bash
# ASSET-013 — ImageMagick derivatives from approved 4:5 masters.
# Masters are 3×3 contact sheets. Extract one reviewed hero tile (no re-generation).
# v1 only: headshot-v2 masters are single portraits, so this crops nine ways into
# one face. Use scripts/derive-headshot-v2-fe-bundle.sh for those.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)/docs/assets/headshots"

# slug -> "col row" (0-indexed) of the front-facing hero cell
hero_cell() {
  case "$1" in
    ephraim-bacaltos) echo "2 2" ;;   # bottom-right close front
    francis-acido) echo "2 0" ;;      # top-right close front
    *) echo "1 0" ;;                  # top-center close / 3-quarter
  esac
}

write_pair() {
  local src=$1 dest_stem=$2
  convert "$src" -strip -quality 85 "${dest_stem}.jpg"
  convert "$src" -strip -quality 82 "${dest_stem}.webp"
}

for master in "$ROOT"/*/headshot-4x5.jpg; do
  dir=$(dirname "$master")
  slug=$(basename "$dir")
  read -r col row <<< "$(hero_cell "$slug")"
  read -r w h <<< "$(identify -format '%w %h' "$master")"
  cw=$((w / 3))
  ch=$((h / 3))
  x=$((col * cw))
  y=$((row * ch))

  mkdir -p "$dir/archive"
  if [ ! -f "$dir/archive/headshot-4x5.png" ]; then
    convert "$master" -strip PNG32:"$dir/archive/headshot-4x5.png"
  fi

  convert "$master" -crop "${cw}x${ch}+${x}+${y}" +repage "$dir/_tile.png"

  # Lanczos resample of the same tile (not a new face) so card/avatar meet ~800 CSS px
  convert "$dir/_tile.png" -filter Lanczos -resize "800x" "$dir/_card.png"

  write_pair "$dir/_card.png" "$dir/headshot-card-4x5"
  convert "$dir/_card.png" -resize "400x" -strip -quality 85 "$dir/headshot-card-4x5-w400.jpg"
  convert "$dir/_card.png" -resize "400x" -strip -quality 82 "$dir/headshot-card-4x5-w400.webp"

  # 1:1 from hero tile — center crop so close-up chins are not clipped
  tw=$(identify -format '%w' "$dir/_tile.png")
  th=$(identify -format '%h' "$dir/_tile.png")
  side=$tw
  sy=$(( (th - tw) / 2 ))
  if [ "$sy" -lt 0 ]; then sy=0; side=$th; fi
  convert "$dir/_tile.png" -crop "${side}x${side}+0+${sy}" +repage "$dir/_square.png"
  convert "$dir/_square.png" -filter Lanczos -resize "800x800" "$dir/_avatar.png"
  write_pair "$dir/_avatar.png" "$dir/headshot-1x1"
  for ww in 400 200; do
    convert "$dir/_avatar.png" -resize "${ww}x${ww}" -strip -quality 85 "$dir/headshot-1x1-w${ww}.jpg"
    convert "$dir/_avatar.png" -resize "${ww}x${ww}" -strip -quality 82 "$dir/headshot-1x1-w${ww}.webp"
  done
  rm -f "$dir/headshot-1x1-w640.jpg" "$dir/headshot-1x1-w640.webp" "$dir/_card.png" "$dir/_avatar.png"

  # Responsive full-sheet 4:5 (same session) for review; do not overwrite master JPEG
  for ww in 800 400; do
    if [ "$ww" -ge "$w" ]; then
      continue
    fi
    convert "$master" -resize "${ww}x" -strip -quality 85 "$dir/headshot-4x5-w${ww}.jpg"
    convert "$master" -resize "${ww}x" -strip -quality 82 "$dir/headshot-4x5-w${ww}.webp"
  done

  rm -f "$dir/_tile.png" "$dir/_square.png"
  echo "$slug tile=${col},${row} ${cw}x${ch}+${x}+${y}"
done
