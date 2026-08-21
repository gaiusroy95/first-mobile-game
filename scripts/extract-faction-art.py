"""Copy commander portraits and crop unit sheets from client reference art."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

REF = Path(r"E:\task\mobile_game\apps\mobile\assets\reference_image")
OUT = Path(r"E:\task\mobile_game\apps\mobile\assets\factions")
OUT.mkdir(parents=True, exist_ok=True)

COMMANDERS = {
    "cmd-arab.jpg": "bdb0cfd0-f3bb-4f07-a2ec-aabffb86691e.jpg",
    "cmd-byzantine.jpg": "f14b7bfd-a566-477f-827b-061be26ba1e5.jpg",
    "cmd-janissary.jpg": "8eb31ba9-1f31-4e26-990a-6fe65a3ad1b6.jpg",
    "cmd-viking.jpg": "6c8802e1-c338-4d9d-9535-c6e6a3bdc251.jpg",
    "cmd-mongol.jpg": "fd5d828c-ac23-496e-b0b7-6969916bc8a2.jpg",
    "cmd-samurai.jpg": "deecd4c9-d44c-4caf-a3c9-709f801f97bd.jpg",
}

# 3-unit sheets: source, unit ids, (top, bottom) as fractions of sheet height
SHEETS = {
    "arab": ("2e845d77-4fcd-4584-a116-5d2ea36412e3.jpg", ["unit-arab-vanguard", "unit-arab-blademaster", "unit-arab-mystic"], (0.18, 0.58)),
    "samurai": ("d3856d9a-cea7-44b8-86db-0ee02ad70a16.jpg", ["unit-samurai-yari", "unit-samurai-katana", "unit-samurai-archer"], (0.20, 0.58)),
    "byzantine": ("d8bc5c66-1da0-4fc2-9da1-eb8803806abc.jpg", ["unit-byzantine-guard", "unit-byzantine-lancer", "unit-byzantine-strategos"], (0.28, 0.60)),
    "janissary": ("354641ef-3017-4dfb-b458-11e1a5379095.jpg", ["unit-janissary-guard", "unit-janissary-musketeer", "unit-janissary-officer"], (0.20, 0.58)),
    "mongol": ("0bc2c3f6-0d89-4bd9-8dc2-b38e25f1d052.jpg", ["unit-mongol-raider", "unit-mongol-horse-archer", "unit-mongol-scout"], (0.20, 0.58)),
    "viking": ("17f1a8ae-4f30-4441-8d16-021a6a4206ba.jpg", ["unit-viking-shield", "unit-viking-berserker", "unit-viking-shaman"], (0.20, 0.58)),
}


def crop_to_3x4(im: Image.Image, *, top_bias: float = 0.15) -> Image.Image:
    """Center-crop (slightly toward the head) into a 3:4 bust for hero cards."""
    w, h = im.size
    target = 3 / 4
    if w / h > target:
        new_w = int(h * target)
        x0 = (w - new_w) // 2
        return im.crop((x0, 0, x0 + new_w, h))
    new_h = int(w / target)
    spare = max(0, h - new_h)
    y0 = int(spare * top_bias)
    return im.crop((0, y0, w, y0 + new_h))


def commander_bust(im: Image.Image) -> Image.Image:
    """Drop the framed title strip; keep head + torso at 3:4."""
    w, h = im.size
    box_h = int(h * 0.58)
    box_w = int(box_h * 3 / 4)
    x0 = (w - box_w) // 2
    y0 = int(h * 0.05)
    return im.crop((x0, y0, x0 + box_w, y0 + box_h))


def crop_thirds(src: Path, names: list[str], window: tuple[float, float]) -> None:
    im = Image.open(src).convert("RGB")
    w, h = im.size
    top = int(h * window[0])
    bottom = int(h * window[1])
    pad = int(w * 0.03)
    col_w = w // 3
    for i, name in enumerate(names):
        x0 = i * col_w + pad
        x1 = (i + 1) * col_w - pad
        piece = crop_to_3x4(im.crop((x0, top, x1, bottom)), top_bias=0.0)
        piece.save(OUT / f"{name}.jpg", quality=92)
        print("unit", name, piece.size)


for dest, src_name in COMMANDERS.items():
    src = REF / src_name
    bust = commander_bust(Image.open(src).convert("RGB"))
    bust.save(OUT / dest, quality=92)
    print("cmd", dest, bust.size)

for _faction, (src_name, names, window) in SHEETS.items():
    crop_thirds(REF / src_name, names, window)

print("done", OUT)
