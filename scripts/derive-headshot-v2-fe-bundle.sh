#!/usr/bin/env bash
# Derive the bundled FE headshot set from the headshot-v2 locked-pose 4K masters.
#
# Source : docs/assets/headshots/{slug}/headshot-4x5.jpg   (3712x4608 single portrait)
# Target : apps/web/public/assets/headshots/{slug}/...
#          apps/admin/public/assets/headshots/{slug}/...
#
# v2 masters are single editorial portraits, so there is no 3x3 hero tile to
# extract the way `derive-headshot-delivery-set.sh` does for the v1 sheets.
# Filenames stay exactly as they are on main so no FE path changes are needed.
#
# Uses Python + Pillow (GitHub Actions ubuntu has no `magick`), same as
# scripts/materialize-headshot-v2.sh.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
command -v python3 >/dev/null
python3 -c 'from PIL import Image' 2>/dev/null || {
  echo "Pillow required: pip install pillow" >&2
  exit 1
}

python3 - "$ROOT" <<'PY'
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(sys.argv[1])
MASTERS = ROOT / "docs/assets/headshots"

# ASSET-012 coaches with a catalogued source photo. Alec / Sofia / Kate keep the
# ASSET-014 placeholder crests and must never get a generated portrait here.
SLUGS = (
    "ephraim-bacaltos",
    "rex-francis-regis",
    "rachelle-tobiano",
    "jodi-tio",
    "wolf",
    "mikaela-danielle",
    "maris-cabrera",
    "francis-acido",
)

# Variant name -> (crop, width, height, jpeg quality, webp quality).
# `apps/web` also serves the 1600w card candidate and the 4K master; `apps/admin`
# only ever renders the avatar and card, so its bundle stays light.
CARD = "card"
SQUARE = "square"
COMMON = (
    ("headshot-4x5", CARD, 1200, 1500, 85, 82),
    ("headshot-card-4x5", CARD, 800, 1000, 85, 82),
    ("headshot-card-4x5-w400", CARD, 400, 500, 85, 82),
    ("headshot-1x1", SQUARE, 800, 800, 85, 82),
    ("headshot-1x1-w400", SQUARE, 400, 400, 85, 82),
    ("headshot-1x1-w200", SQUARE, 200, 200, 85, 82),
)
TARGETS = {
    "apps/web/public/assets/headshots": COMMON
    + (
        ("headshot-card-4x5-w1600", CARD, 1600, 2000, 85, 82),
        # v2 masters arrive at native ~4K, so the v1 `ai-upscale-4k` step is skipped.
        ("headshot-upscaled-4k", CARD, 3276, 4096, 82, 80),
    ),
    "apps/admin/public/assets/headshots": COMMON,
}

# Avatar framing, as a fraction of the master height: the square is 52% of the
# frame with 11% of it kept as headroom above the detected crown, so every coach
# lands on the same head-and-shoulders crop despite small pose differences.
AVATAR_SIDE = 0.52
AVATAR_HEADROOM = 0.11
DARK_LUMA = 150
CROWN_MIN_PIXELS = 8


def center_crop(image: Image.Image, ratio: float) -> Image.Image:
    """Center crop to an exact aspect ratio (masters are 3712x4608, ~0.8055)."""
    w, h = image.size
    if w / h > ratio:
        side = round(h * ratio)
        return image.crop(((w - side) // 2, 0, (w - side) // 2 + side, h))
    side = round(w / ratio)
    return image.crop((0, (h - side) // 2, w, (h - side) // 2 + side))


def find_crown(image: Image.Image) -> tuple[int, int]:
    """Locate (top, center x) of the head against the cream studio backdrop.

    The subject's hair and navy top are the only dark pixels in the frame, so the
    first row holding a run of dark pixels is the crown, and their mean x over
    the band just below it is the head's horizontal center.
    """
    w, h = image.size
    probe = image.convert("L").resize((400, round(400 * h / w)), Image.Resampling.BILINEAR)
    pw, ph = probe.size
    pixels = probe.load()
    limit = int(ph * 0.4)
    for y in range(limit):
        dark = [x for x in range(pw) if pixels[x, y] < DARK_LUMA]
        if len(dark) < CROWN_MIN_PIXELS:
            continue
        band = dark[:]
        for by in range(y, min(ph, y + round(ph * 0.12))):
            band += [x for x in range(pw) if pixels[x, by] < DARK_LUMA]
        return round(y * h / ph), round((sum(band) / len(band)) * w / pw)
    return round(h * 0.06), w // 2


def square_crop(image: Image.Image) -> Image.Image:
    w, h = image.size
    side = min(round(h * AVATAR_SIDE), w, h)
    crown, center_x = find_crown(image)
    top = max(0, min(h - side, crown - round(side * AVATAR_HEADROOM)))
    left = max(0, min(w - side, center_x - side // 2))
    return image.crop((left, top, left + side, top + side))


def write_pair(image: Image.Image, stem: Path, jpeg_q: int, webp_q: int) -> None:
    stem.parent.mkdir(parents=True, exist_ok=True)
    image.save(stem.with_suffix(".jpg"), "JPEG", quality=jpeg_q, optimize=True, progressive=True)
    image.save(stem.with_suffix(".webp"), "WEBP", quality=webp_q, method=6)


for slug in SLUGS:
    master_path = MASTERS / slug / "headshot-4x5.jpg"
    if not master_path.exists():
        raise SystemExit(f"missing v2 master: {master_path} (run scripts/materialize-headshot-v2.sh)")
    master = Image.open(master_path).convert("RGB")
    crops = {CARD: center_crop(master, 4 / 5), SQUARE: square_crop(master)}
    crown, center_x = find_crown(master)
    print(f"==> {slug} master={master.size[0]}x{master.size[1]} crown_y={crown} head_x={center_x}")
    for target, variants in TARGETS.items():
        dest = ROOT / target / slug
        for name, crop, width, height, jpeg_q, webp_q in variants:
            resized = crops[crop].resize((width, height), Image.Resampling.LANCZOS)
            write_pair(resized, dest / name, jpeg_q, webp_q)
        print(f"    {target}/{slug}: {len(variants) * 2} files")
PY
