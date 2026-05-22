"""
Process raw scene layers:
1. Chroma-key green backgrounds → transparency
2. Generate matched depth maps for each layer
"""

import sys
import os
import math
from PIL import Image, ImageFilter, ImageDraw

OUT_DIR = sys.argv[1] if len(sys.argv) > 1 else "public/scene"

# Layer configs: (name, needs_chromakey, depth_style)
# depth_style: "vertical" = bottom-bright, "radial" = center-bright, "full" = uniform
LAYERS = [
    ("sky",        False, "vertical_inv"),  # sky: top bright (clouds close-ish), bottom dim
    ("mountains",  True,  "vertical_inv"),  # mountains: peaks at top, base lower
    ("hills",      True,  "vertical"),      # hills: bottom closer
    ("temple",     True,  "radial"),        # temple: center structure has most depth
    ("trees",      True,  "radial"),        # trees: canopy has depth variation
    ("water",      False, "vertical"),      # water: bottom closer to viewer
    ("foreground", True,  "corners"),       # foreground: corners are close, center empty
]

GREEN_THRESHOLD = 100  # How close to pure green to count as background


def chroma_key(img):
    """Remove solid green background, add anti-aliased transparency."""
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # How "green-screen" is this pixel?
            green_strength = g - max(r, b)
            if green_strength > GREEN_THRESHOLD and g > 150:
                pixels[x, y] = (r, g, b, 0)
            elif green_strength > GREEN_THRESHOLD // 2 and g > 120:
                # Partial transparency for anti-aliasing edges
                alpha = max(0, min(255, 255 - int((green_strength - GREEN_THRESHOLD // 2) * 3)))
                pixels[x, y] = (r, g, b, alpha)

    return img


def generate_depth_map(img, style):
    """Generate a grayscale depth map that matches the image content."""
    w, h = img.size
    depth = Image.new("L", (w, h), 0)
    pixels = depth.load()
    has_alpha = img.mode == "RGBA"
    src = img.load()

    if style == "vertical":
        # Bottom = bright (close), top = dark (far)
        for y in range(h):
            for x in range(w):
                if has_alpha and src[x, y][3] < 30:
                    continue
                t = y / h
                val = int(t ** 0.7 * 200 + 30)
                pixels[x, y] = min(255, val)

    elif style == "vertical_inv":
        # Top = bright, bottom = dark (for sky/mountains)
        for y in range(h):
            for x in range(w):
                if has_alpha and src[x, y][3] < 30:
                    continue
                t = 1 - y / h
                val = int(t ** 0.7 * 180 + 40)
                pixels[x, y] = min(255, val)

    elif style == "radial":
        # Center-out radial depth (objects in center have more depth)
        cx, cy = w / 2, h / 2
        max_dist = math.sqrt(cx**2 + cy**2)
        for y in range(h):
            for x in range(w):
                if has_alpha and src[x, y][3] < 30:
                    continue
                dist = math.sqrt((x - cx)**2 + (y - cy)**2) / max_dist
                # Combine radial with vertical for natural depth
                radial = (1 - dist) * 160
                vertical = (y / h) * 80
                val = int(radial + vertical + 20)
                pixels[x, y] = min(255, val)

    elif style == "corners":
        # Corners bright (close), center dark (far/empty)
        cx, cy = w / 2, h / 2
        for y in range(h):
            for x in range(w):
                if has_alpha and src[x, y][3] < 30:
                    continue
                # Distance from center (normalized)
                dx = abs(x - cx) / cx
                dy = abs(y - cy) / cy
                corner_dist = max(dx, dy)
                val = int(corner_dist ** 0.6 * 220 + 30)
                pixels[x, y] = min(255, val)

    # Heavy blur for smooth depth transitions
    depth = depth.filter(ImageFilter.GaussianBlur(radius=30))
    depth = depth.filter(ImageFilter.GaussianBlur(radius=20))

    return depth


def process_layer(name, needs_chromakey, depth_style):
    raw_path = os.path.join(OUT_DIR, f"{name}_raw.webp")
    out_path = os.path.join(OUT_DIR, f"{name}.webp")
    depth_path = os.path.join(OUT_DIR, f"{name}_depth.webp")

    if not os.path.exists(raw_path):
        print(f"  SKIP {name} (raw file not found)")
        return

    print(f"  Processing {name}...")

    img = Image.open(raw_path)

    if needs_chromakey:
        img = chroma_key(img)
        img.save(out_path, "WEBP", quality=88)
    else:
        img = img.convert("RGBA")
        img.save(out_path, "WEBP", quality=88)

    # Generate matched depth map
    depth = generate_depth_map(img, depth_style)
    depth.save(depth_path, "WEBP", quality=85)

    raw_size = os.path.getsize(raw_path) // 1024
    out_size = os.path.getsize(out_path) // 1024
    depth_size = os.path.getsize(depth_path) // 1024
    print(f"    {name}.webp: {out_size}KB | {name}_depth.webp: {depth_size}KB")


if __name__ == "__main__":
    print("Processing layers...")
    for name, chromakey, depth_style in LAYERS:
        process_layer(name, chromakey, depth_style)
    print("All layers processed.")
