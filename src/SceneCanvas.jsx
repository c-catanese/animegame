import React, { useEffect, useRef, useState } from 'react';

// ============================================
// 3D Parallax Japanese Garden Scene
// Multiple depth layers with mouse-reactive parallax
// + Canvas overlay for animated petals, water shimmer
// ============================================

const PETAL_COUNT = 50;

function SceneCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouse = (e) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const petals = Array.from({ length: PETAL_COUNT }, () => makePetal(w, h));
    let time = 0;

    function draw() {
      time += 0.016;
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      drawScene(ctx, w, h, time, mx, my, petals);
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

function makePetal(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h * 1.2 - h * 0.1,
    z: Math.random(), // depth: 0=far, 1=near
    size: 3 + Math.random() * 6,
    speedY: 0.2 + Math.random() * 0.5,
    speedX: -0.15 + Math.random() * 0.3,
    wobbleAmp: 20 + Math.random() * 30,
    wobbleSpeed: 0.008 + Math.random() * 0.012,
    wobbleOffset: Math.random() * Math.PI * 2,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: 0.008 + Math.random() * 0.02,
    opacity: 0.3 + Math.random() * 0.6,
    hue: Math.floor(Math.random() * 3),
  };
}

function drawScene(ctx, w, h, time, mx, my, petals) {
  // Parallax offsets based on mouse (subtle)
  const px = (mx - 0.5) * 2; // -1 to 1
  const py = (my - 0.5) * 2;

  // === LAYER 0: Sky (no parallax) ===
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  skyGrad.addColorStop(0, '#5DADE2');
  skyGrad.addColorStop(0.35, '#85C1E9');
  skyGrad.addColorStop(0.7, '#AED6F1');
  skyGrad.addColorStop(1, '#D6EAF8');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.62);

  // Sun
  const sunX = w * 0.78 + px * -5;
  const sunY = h * 0.08 + py * -3;
  drawSun(ctx, sunX, sunY, time);

  // Clouds (layer 0.5 — very slight parallax)
  drawClouds(ctx, w, h, time, px);

  // === LAYER 1: Far mountains (subtle parallax) ===
  drawMountainRange(ctx, w, h, 0.42, px * -8, 'rgba(120, 160, 190, 0.45)', 0.12);

  // === LAYER 2: Mid mountains (more parallax) ===
  drawMountainRange(ctx, w, h, 0.48, px * -15, '#6B9E5A', 0.18);

  // Mist between layers
  drawMist(ctx, w, h, time, 0.44, 0.52);

  // === LAYER 3: Near hills + trees (strong parallax) ===
  drawNearHills(ctx, w, h, px * -25);
  drawTrees(ctx, w, h, time, px * -30, py * -8);

  // === LAYER 4: Ground ===
  drawGround(ctx, w, h);

  // === LAYER 5: Lake with reflections ===
  drawLake(ctx, w, h, time);

  // === LAYER 6: Near petals (strongest parallax — closest to viewer) ===
  drawPetals(ctx, petals, w, h, time, px);
}

function drawSun(ctx, x, y, time) {
  // Outer glow
  ctx.save();
  const r = 80 + Math.sin(time * 0.4) * 5;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
  glow.addColorStop(0, 'rgba(255, 250, 215, 0.7)');
  glow.addColorStop(0.3, 'rgba(255, 245, 190, 0.3)');
  glow.addColorStop(0.6, 'rgba(255, 240, 170, 0.1)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Disc
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 252, 230, 0.95)';
  ctx.fill();
  ctx.restore();
}

function drawClouds(ctx, w, h, time, px) {
  const clouds = [
    { baseX: 0.12, y: 0.06, s: 1.1, speed: 6 },
    { baseX: 0.4, y: 0.1, s: 0.75, speed: 9 },
    { baseX: 0.65, y: 0.04, s: 0.6, speed: 7 },
    { baseX: 0.88, y: 0.12, s: 0.5, speed: 11 },
  ];
  clouds.forEach(c => {
    const cx = ((w * c.baseX + time * c.speed + px * -4) % (w + 300)) - 150;
    drawCloud(ctx, cx, h * c.y, c.s);
  });
}

function drawCloud(ctx, x, y, s) {
  ctx.save();
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = '#fff';
  [
    [0, 0, 55 * s, 22 * s],
    [-28 * s, -10 * s, 32 * s, 20 * s],
    [22 * s, -7 * s, 38 * s, 18 * s],
    [-12 * s, -16 * s, 26 * s, 15 * s],
    [16 * s, -14 * s, 30 * s, 14 * s],
  ].forEach(([ox, oy, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(x + ox, y + oy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawMountainRange(ctx, w, h, baseRatio, offsetX, color, heightRatio) {
  const base = h * baseRatio;
  const mh = h * heightRatio;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-50 + offsetX, base);
  const segments = 14;
  for (let i = 0; i <= segments; i++) {
    const x = (w + 100) * (i / segments) - 50 + offsetX;
    const peakiness = Math.sin(i * 1.8 + 0.5) * 0.5 + 0.5;
    const y = base - mh * peakiness * (0.5 + Math.sin(i * 2.3) * 0.3);
    if (i === 0) ctx.lineTo(x, y);
    else {
      const cpx = ((w + 100) * ((i - 0.5) / segments)) - 50 + offsetX;
      const cpy = base - mh * (peakiness + Math.sin((i - 0.5) * 2.3 + 0.5) * 0.3) * 0.5;
      ctx.quadraticCurveTo(cpx, cpy, x, y);
    }
  }
  ctx.lineTo(w + 50 + offsetX, base);
  ctx.closePath();
  ctx.fill();
}

function drawMist(ctx, w, h, time, top, bottom) {
  ctx.save();
  ctx.globalAlpha = 0.08 + Math.sin(time * 0.25) * 0.03;
  const grad = ctx.createLinearGradient(0, h * top, 0, h * bottom);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.4, 'rgba(210, 230, 245, 0.9)');
  grad.addColorStop(0.6, 'rgba(210, 230, 245, 0.9)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h * top, w, h * (bottom - top));
  ctx.restore();
}

function drawNearHills(ctx, w, h, offsetX) {
  const base = h * 0.58;
  const grad = ctx.createLinearGradient(0, base - h * 0.1, 0, base);
  grad.addColorStop(0, '#5C8A48');
  grad.addColorStop(1, '#6B9F55');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-50 + offsetX, base);
  for (let i = 0; i <= 12; i++) {
    const x = (w + 100) * (i / 12) - 50 + offsetX;
    const y = base - h * 0.08 * (Math.sin(i * 1.4 + 2) * 0.5 + 0.5);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w + 50 + offsetX, base);
  ctx.closePath();
  ctx.fill();
}

function drawTrees(ctx, w, h, time, offsetX, offsetY) {
  const trees = [
    { x: 0.05, ground: 0.56, trunkH: 0.18, canopy: 0.13, lean: -0.04 },
    { x: 0.95, ground: 0.55, trunkH: 0.20, canopy: 0.15, lean: 0.03 },
    { x: 0.2, ground: 0.57, trunkH: 0.14, canopy: 0.09, lean: -0.02 },
    { x: 0.8, ground: 0.57, trunkH: 0.12, canopy: 0.08, lean: 0.02 },
    { x: 0.38, ground: 0.575, trunkH: 0.09, canopy: 0.06, lean: 0.01 },
  ];
  trees.forEach(t => {
    drawTree(ctx, w * t.x + offsetX, h * t.ground + offsetY * 0.3, h * t.trunkH, h * t.canopy, t.lean, time);
  });
}

function drawTree(ctx, x, groundY, trunkH, canopyR, lean, time) {
  const sway = Math.sin(time * 0.6 + x * 0.005) * 4;
  const topX = x + lean * trunkH + sway;
  const topY = groundY - trunkH;

  // Shadow on ground
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#2a4a20';
  ctx.beginPath();
  ctx.ellipse(x + canopyR * 0.3, groundY + 2, canopyR * 0.8, canopyR * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Trunk with slight curve
  ctx.save();
  ctx.strokeStyle = '#3d2010';
  ctx.lineWidth = Math.max(2.5, canopyR * 0.1);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.quadraticCurveTo(
    x + lean * trunkH * 0.4 + sway * 0.3,
    groundY - trunkH * 0.55,
    topX, topY
  );
  ctx.stroke();

  // Branches
  ctx.lineWidth = Math.max(1.2, canopyR * 0.04);
  ctx.strokeStyle = '#4a2a15';
  const branches = [
    { a: -0.5, d: 0.45, l: 0.55 },
    { a: 0.6, d: 0.4, l: 0.5 },
    { a: -0.35, d: 0.65, l: 0.4 },
    { a: 0.45, d: 0.6, l: 0.45 },
  ];
  branches.forEach(b => {
    const bx = x + lean * trunkH * b.d + sway * b.d;
    const by = groundY - trunkH * b.d;
    const bl = canopyR * b.l;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(
      bx + Math.cos(b.a * Math.PI) * bl * 0.6,
      by - bl * 0.3,
      bx + Math.cos(b.a * Math.PI) * bl,
      by - bl * 0.4
    );
    ctx.stroke();
  });
  ctx.restore();

  // Canopy — layered for depth
  const cx = topX;
  const cy = topY;
  const blobs = [
    [0, -canopyR * 0.05, canopyR, canopyR * 0.78],
    [-canopyR * 0.45, canopyR * 0.08, canopyR * 0.7, canopyR * 0.58],
    [canopyR * 0.4, 0, canopyR * 0.72, canopyR * 0.62],
    [-canopyR * 0.15, -canopyR * 0.4, canopyR * 0.55, canopyR * 0.48],
    [canopyR * 0.12, -canopyR * 0.45, canopyR * 0.5, canopyR * 0.42],
    [-canopyR * 0.55, -canopyR * 0.12, canopyR * 0.48, canopyR * 0.4],
    [canopyR * 0.5, -canopyR * 0.18, canopyR * 0.46, canopyR * 0.38],
  ];

  // Shadow layer
  ctx.save();
  ctx.globalAlpha = 0.3;
  blobs.forEach(([ox, oy, rx, ry]) => {
    const g = ctx.createRadialGradient(cx + ox + sway * 0.2, cy + oy + 5, rx * 0.1, cx + ox + sway * 0.2, cy + oy + 5, rx);
    g.addColorStop(0, 'rgba(180, 80, 110, 0.6)');
    g.addColorStop(0.6, 'rgba(180, 80, 110, 0.2)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx + ox + sway * 0.2, cy + oy + 5, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Main blossom
  ctx.save();
  ctx.globalAlpha = 0.75;
  blobs.forEach(([ox, oy, rx, ry]) => {
    const g = ctx.createRadialGradient(cx + ox + sway * 0.2, cy + oy, rx * 0.15, cx + ox + sway * 0.2, cy + oy, rx);
    g.addColorStop(0, 'rgba(248, 185, 205, 0.95)');
    g.addColorStop(0.35, 'rgba(244, 160, 182, 0.7)');
    g.addColorStop(0.65, 'rgba(238, 135, 165, 0.35)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx + ox + sway * 0.2, cy + oy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Highlight
  ctx.save();
  ctx.globalAlpha = 0.35;
  blobs.slice(0, 4).forEach(([ox, oy, rx, ry]) => {
    const g = ctx.createRadialGradient(cx + ox + sway * 0.2, cy + oy - ry * 0.35, 0, cx + ox + sway * 0.2, cy + oy, rx * 0.6);
    g.addColorStop(0, 'rgba(255, 225, 235, 0.9)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx + ox + sway * 0.2, cy + oy - ry * 0.12, rx * 0.55, ry * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawGround(ctx, w, h) {
  const gy = h * 0.56;
  const grad = ctx.createLinearGradient(0, gy - 4, 0, h * 0.66);
  grad.addColorStop(0, '#5A9045');
  grad.addColorStop(0.5, '#68A352');
  grad.addColorStop(1, '#4E8038');
  ctx.fillStyle = grad;
  ctx.fillRect(0, gy, w, h * 0.1);
}

function drawLake(ctx, w, h, time) {
  const ly = h * 0.64;
  const lakeH = h - ly;

  // Base water
  const grad = ctx.createLinearGradient(0, ly, 0, h);
  grad.addColorStop(0, '#6DB5C8');
  grad.addColorStop(0.15, '#5DA8BE');
  grad.addColorStop(0.4, '#4D98AE');
  grad.addColorStop(0.7, '#3D889E');
  grad.addColorStop(1, '#2D7888');
  ctx.fillStyle = grad;
  ctx.fillRect(0, ly, w, lakeH);

  // Reflection of sky
  ctx.save();
  ctx.globalAlpha = 0.12;
  const rGrad = ctx.createLinearGradient(0, ly, 0, ly + lakeH * 0.3);
  rGrad.addColorStop(0, '#AED6F1');
  rGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = rGrad;
  ctx.fillRect(0, ly, w, lakeH * 0.3);
  ctx.restore();

  // Shimmer
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 15; i++) {
    const lineY = ly + 8 + i * (lakeH / 15);
    ctx.beginPath();
    for (let x = 0; x < w; x += 20) {
      const y = lineY + Math.sin(time * 0.6 + x * 0.015 + i * 0.5) * 1.5;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Shore edge
  ctx.save();
  const shore = ctx.createLinearGradient(0, ly - 2, 0, ly + 6);
  shore.addColorStop(0, 'rgba(78, 128, 56, 0.4)');
  shore.addColorStop(1, 'transparent');
  ctx.fillStyle = shore;
  ctx.fillRect(0, ly - 2, w, 8);
  ctx.restore();
}

function drawPetals(ctx, petals, w, h, time, px) {
  const colors = [
    [245, 170, 190],
    [250, 205, 218],
    [255, 235, 242],
  ];

  petals.forEach(p => {
    // Depth-based speed (closer = faster)
    const depthFactor = 0.5 + p.z * 0.8;
    p.y += p.speedY * depthFactor;
    p.x += p.speedX * depthFactor + Math.sin(time * p.wobbleSpeed * 60 + p.wobbleOffset) * 0.4;
    p.rotation += p.rotSpeed * depthFactor;

    // Parallax offset based on depth and mouse
    const parallaxX = px * -40 * p.z;

    if (p.y > h + 20) {
      p.x = Math.random() * w;
      p.y = -10 - Math.random() * 50;
      p.z = Math.random();
    }

    const drawX = p.x + parallaxX;
    const drawSize = p.size * (0.6 + p.z * 0.6);
    const drawOpacity = p.opacity * (0.4 + p.z * 0.6);

    ctx.save();
    ctx.translate(drawX, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = drawOpacity;
    const c = colors[p.hue];
    ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${drawOpacity})`;

    // Petal shape
    ctx.beginPath();
    const s = drawSize;
    ctx.moveTo(0, -s * 0.5);
    ctx.bezierCurveTo(s * 0.6, -s * 0.4, s * 0.5, s * 0.2, 0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.5, s * 0.2, -s * 0.6, -s * 0.4, 0, -s * 0.5);
    ctx.fill();
    ctx.restore();
  });
}

export default SceneCanvas;
