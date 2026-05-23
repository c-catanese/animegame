#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$SCRIPT_DIR/../public/scene"
mkdir -p "$OUT_DIR"

BASE="https://image.pollinations.ai/prompt"
W=2560
H=1440
SEED=${1:-42}

encode() { python3 -c "import urllib.parse; print(urllib.parse.quote('''$1'''))"; }

echo "=== Generating scene layers (seed=$SEED) ==="
echo ""

# Background — complete Japanese landscape scene
echo "[1/2] Background — mountain temple lake scene..."
curl -sL "$BASE/$(encode "beautiful Japanese landscape at sunset in Firewatch video game art style, bold beautiful colors, distant purple mountains, a small pagoda temple on a hillside, calm reflective lake in the foreground, warm golden orange and coral pink sunset sky blending to deep purple at horizon, atmospheric depth with color layers, minimal detail but rich colors, muted purple and blue tones in the landscape, peaceful serene composition, wide panoramic cinematic 16:9, digital art masterpiece")?width=$W&height=$H&seed=$SEED&nologo=true&model=flux" \
  -o "$OUT_DIR/background_raw.webp"
echo " done"

# Foreground — cherry branch + lantern + rocks framing elements
echo "[2/2] Foreground — cherry branch and lantern frame..."
curl -sL "$BASE/$(encode "dark silhouette foreground frame elements on pure black background, a cherry blossom tree branch with flower clusters extending from the left edge across the top of the frame, a traditional Japanese stone lantern in the bottom left corner, mossy rocks and stones scattered along the bottom edge, all elements are dark purple-black silhouettes, the center and right side are completely empty black space, beautiful bold shapes, Firewatch video game art style, wide panoramic 16:9, digital art")?width=$W&height=$H&seed=$((SEED+1))&nologo=true&model=flux" \
  -o "$OUT_DIR/foreground_raw.webp"
echo " done"

echo ""
echo "Raw images generated. Processing..."
echo ""

python3 "$SCRIPT_DIR/process-layers.py" "$OUT_DIR"

echo ""
echo "=== Done! ==="
ls -lh "$OUT_DIR"/background.webp "$OUT_DIR"/foreground.webp
