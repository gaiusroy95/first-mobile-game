"""Crop UI slices from the client main-menu jpeg (1536x1024)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

SRC = Path(r"E:\task\mobile_game\apps\mobile\assets\main.jpeg")
OUT = Path(r"E:\task\mobile_game\apps\mobile\assets\main-ui")
OUT.mkdir(parents=True, exist_ok=True)

im = Image.open(SRC).convert("RGB")
W, H = im.size


def crop(box: tuple[int, int, int, int], name: str) -> None:
    piece = im.crop(box)
    dest = OUT / f"{name}.png"
    piece.save(dest, optimize=True)
    print(f"{name:24s} {piece.size[0]:4d}x{piece.size[1]:<4d}  {box}")


# Full-bleed art for landscape / tablet
im.save(OUT / "background.jpg", quality=94)

# Horizontal bands used when stacking on portrait
crop((0, 0, W, 548), "band-hero")
crop((0, 548, W, 848), "band-factions")
crop((0, 848, W, H), "band-footer")

# Center slice so portrait does not cover-crop the title off the sides
crop((280, 72, 1256, 560), "hero-portrait")

# Title (LEGENDS + OF EMPIRES)
crop((340, 400, 1200, 585), "title")

# Faction cards — x gaps taken from dark columns in the faction band
factions = [
    ("01-arab", (24, 568, 180, 848)),
    ("02-samurai", (192, 568, 356, 848)),
    ("03-byzantine", (368, 568, 548, 848)),
    ("04-janissary", (568, 568, 744, 848)),
    ("05-mongol", (760, 568, 956, 848)),
    ("06-viking", (976, 568, 1132, 848)),
    ("07-persian", (1144, 568, 1308, 848)),
    ("08-crusader", (1320, 568, 1498, 848)),
]
for key, box in factions:
    crop(box, f"faction-{key}")

# Battle CTA
crop((520, 848, 1016, 1016), "battle-btn")

# Top-right nav
crop((1184, 4, 1272, 92), "icon-ranked")
crop((1272, 4, 1356, 92), "icon-clan")
crop((1356, 4, 1440, 92), "icon-missions")
crop((1440, 4, 1532, 92), "icon-store")

# Bottom nav
crop((56, 900, 196, 1020), "icon-heroes")
crop((220, 900, 372, 1020), "icon-upgrades")
crop((1152, 900, 1272, 1020), "icon-collection")
crop((1276, 900, 1392, 1020), "icon-events")
crop((1400, 900, 1524, 1020), "icon-settings")

# Tagline
crop((16, 16, 400, 80), "tagline")

dbg = im.copy()
draw = ImageDraw.Draw(dbg)
for _, box in factions:
    draw.rectangle(box, outline=(255, 220, 0), width=2)
draw.rectangle((520, 848, 1016, 1016), outline=(80, 180, 255), width=2)
draw.rectangle((300, 400, 1240, 575), outline=(255, 80, 80), width=2)
dbg.save(OUT / "_debug-crops.jpg", quality=88)
print("debug overlay written")
