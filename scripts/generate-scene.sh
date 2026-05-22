#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$SCRIPT_DIR/../public/scene"
mkdir -p "$OUT_DIR"

BASE="https://image.pollinations.ai/prompt"
W=1920
H=1080
SEED=${1:-99}

encode() { python3 -c "import urllib.parse; print(urllib.parse.quote('''$1'''))"; }

echo "=== Generating scene layers (seed=$SEED) ==="
echo ""

# Sky — no green screen needed (it IS the background)
echo "[1/7] sky..."
curl -sL "$BASE/$(encode "anime art, beautiful blue sky with layered soft white and pink clouds, golden sunlight rays breaking through, spring atmosphere, Studio Ghibli movie background quality, masterpiece, no ground no trees no buildings, just expansive sky, wide panoramic 16:9, volumetric lighting, atmospheric")?width=$W&height=$H&seed=$SEED&nologo=true&model=flux" \
  -o "$OUT_DIR/sky_raw.webp"

# Mountains on green screen
echo "[2/7] mountains..."
curl -sL "$BASE/$(encode "anime art, distant misty blue-purple mountain range with snow-capped peaks, atmospheric perspective, multiple mountain layers fading into haze, isolated on solid bright green background hex 00FF00, no foreground no trees, Studio Ghibli style, wide panoramic, masterpiece")?width=$W&height=$H&seed=$((SEED+1))&nologo=true&model=flux" \
  -o "$OUT_DIR/mountains_raw.webp"

# Hills on green screen
echo "[3/7] hills..."
curl -sL "$BASE/$(encode "anime art, green rolling hills with lush grass and small wildflowers, gentle undulating slopes, isolated on solid bright green background hex 00FF00, no trees no buildings no sky, Studio Ghibli style, wide panoramic, soft lighting, masterpiece")?width=$W&height=$H&seed=$((SEED+2))&nologo=true&model=flux" \
  -o "$OUT_DIR/hills_raw.webp"

# Temple on green screen
echo "[4/7] temple..."
curl -sL "$BASE/$(encode "anime art, traditional Japanese three-story pagoda temple with red pillars and curved dark roof tiles, wooden torii gate beside it, stone steps leading up, zen rock garden with raked sand at base, isolated on solid bright green background hex 00FF00, Studio Ghibli movie quality, extremely detailed architecture, masterpiece")?width=$W&height=$H&seed=$((SEED+3))&nologo=true&model=flux" \
  -o "$OUT_DIR/temple_raw.webp"

# Cherry blossom trees on green screen
echo "[5/7] trees..."
curl -sL "$BASE/$(encode "anime art, three beautiful cherry blossom trees in full bloom with abundant pink and white flowers, detailed gnarled trunks and spreading branches, petals falling, isolated on solid bright green background hex 00FF00, Studio Ghibli style, extremely detailed, masterpiece")?width=$W&height=$H&seed=$((SEED+4))&nologo=true&model=flux" \
  -o "$OUT_DIR/trees_raw.webp"

# Water — no green screen (horizontal strip)
echo "[6/7] water..."
curl -sL "$BASE/$(encode "anime art, serene Japanese lake surface filling the entire image, crystal clear blue-green water with gentle ripples, reflections of cherry blossom pink and blue sky, a few lily pads floating, morning mist on water surface, wide panoramic, Studio Ghibli style, masterpiece, no land no shore just water surface")?width=$W&height=$H&seed=$((SEED+5))&nologo=true&model=flux" \
  -o "$OUT_DIR/water_raw.webp"

# Foreground on green screen
echo "[7/7] foreground..."
curl -sL "$BASE/$(encode "anime art, close-up cherry blossom tree branches with pink petals hanging from top left and top right corners of frame, stone lantern in bottom left corner, mossy rocks in bottom right, center of image is completely empty, framing composition, isolated on solid bright green background hex 00FF00, Studio Ghibli style, shallow depth of field bokeh, masterpiece")?width=$W&height=$H&seed=$((SEED+6))&nologo=true&model=flux" \
  -o "$OUT_DIR/foreground_raw.webp"

echo ""
echo "Raw images generated. Processing..."
echo ""

python3 "$SCRIPT_DIR/process-layers.py" "$OUT_DIR"

echo ""
echo "=== Done! ==="
ls -lh "$OUT_DIR"/*.webp | grep -v raw
