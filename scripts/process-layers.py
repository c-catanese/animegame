"""
Process raw scene layers.
- Background: just optimize
- Foreground: crush near-black → remove to transparency
"""

import sys
import os
from PIL import Image

OUT_DIR = sys.argv[1] if len(sys.argv) > 1 else "public/scene"

BLACK_CRUSH = 35      # Luminance below this → pure black
BLACK_REMOVE = 5      # After crush, anything this dark → transparent
BLACK_FADE = 15       # Smooth edge transition up to this luminance


def process_foreground(img):
    """Crush near-black to pure black, then convert black to transparency."""
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            lum = 0.299 * r + 0.587 * g + 0.114 * b

            if lum < BLACK_CRUSH:
                # Crush to transparent
                pixels[x, y] = (0, 0, 0, 0)
            elif lum < BLACK_CRUSH + BLACK_FADE:
                # Smooth edge transition
                t = (lum - BLACK_CRUSH) / BLACK_FADE
                pixels[x, y] = (r, g, b, int(t * 255))

    return img


if __name__ == "__main__":
    print("Processing layers...")

    bg_raw = os.path.join(OUT_DIR, "background_raw.webp")
    bg_out = os.path.join(OUT_DIR, "background.webp")
    if os.path.exists(bg_raw):
        print("  Processing background...")
        img = Image.open(bg_raw).convert("RGB")
        img.save(bg_out, "WEBP", quality=90)
        print(f"    background.webp: {os.path.getsize(bg_out) // 1024}KB")

    fg_raw = os.path.join(OUT_DIR, "foreground_raw.webp")
    fg_out = os.path.join(OUT_DIR, "foreground.webp")
    if os.path.exists(fg_raw):
        print("  Processing foreground...")
        img = Image.open(fg_raw)
        img = process_foreground(img)
        img.save(fg_out, "WEBP", quality=90)
        print(f"    foreground.webp: {os.path.getsize(fg_out) // 1024}KB")

    print("All layers processed.")
