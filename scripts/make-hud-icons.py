"""Paint in-game HUD icons: brass retreat medallion (no third-party asset pack)."""
from __future__ import annotations

from math import cos, pi, sin
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path(r"E:\task\mobile_game\apps\mobile\assets\hud")
OUT.mkdir(parents=True, exist_ok=True)

BRASS = (212, 168, 75, 255)
BRASS_DARK = (140, 98, 32, 255)
BRASS_LIGHT = (240, 214, 140, 255)
ENAMEL = (15, 24, 20, 255)
RIVET = (232, 196, 110, 255)


def medallion(size: int = 256) -> Image.Image:
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    pad = 10
    d.ellipse([pad + 4, pad + 6, size - pad + 2, size - pad + 4], fill=(0, 0, 0, 90))
    d.ellipse([pad, pad, size - pad, size - pad], fill=BRASS_DARK)
    d.ellipse([pad + 6, pad + 6, size - pad - 6, size - pad - 6], fill=BRASS)
    inner = pad + 28
    d.ellipse([inner, inner, size - inner, size - inner], fill=ENAMEL)
    d.ellipse([inner + 6, inner + 6, size - inner - 6, size - inner - 6], outline=BRASS, width=5)

    cx = cy = size / 2
    ring_r = (size / 2) - pad - 14
    for i in range(8):
        ang = (i / 8) * 2 * pi - pi / 2
        x = cx + ring_r * cos(ang)
        y = cy + ring_r * sin(ang)
        r = 7
        d.ellipse([x - r, y - r, x + r, y + r], fill=BRASS_DARK)
        d.ellipse([x - r + 2, y - r + 2, x + r - 2, y + r - 2], fill=RIVET)

    # Left chevron — retreat / return to camp
    chevron = [
        (cx + 28, cy - 52),
        (cx - 38, cy),
        (cx + 28, cy + 52),
        (cx + 52, cy + 28),
        (cx - 2, cy),
        (cx + 52, cy - 28),
    ]
    d.polygon(chevron, fill=BRASS)
    highlight = [
        (cx + 22, cy - 40),
        (cx - 24, cy),
        (cx + 22, cy + 4),
        (cx + 8, cy),
    ]
    d.polygon(highlight, fill=BRASS_LIGHT)
    return im.filter(ImageFilter.SMOOTH_MORE)


icon = medallion()
icon.save(OUT / "retreat.png")
print("wrote", OUT / "retreat.png", icon.size)
