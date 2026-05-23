import React, { useEffect, useRef, useCallback } from 'react';
import './SceneParallax.css';

// ============================================
// Multi-layer CSS parallax with "breathing" idle animation
// Each layer is a full scene image positioned to show its depth zone
// Mouse movement shifts layers at different rates for 3D depth
// Subtle idle sway animation makes it feel alive
// ============================================

const LAYERS = [
  { src: '/scene/background.webp', depth: 0.006, className: 'layer-bg' },
  { src: '/scene/foreground.webp', depth: 0.03,  className: 'layer-fg' },
];

const PETAL_COUNT = 120;

function SceneParallax() {
  const layerEls = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const petalCanvas = useRef(null);
  const petalsData = useRef(null);
  const rafId = useRef(null);
  const time = useRef(0);

  // Track mouse
  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onOrient = (e) => {
      if (e.gamma != null) {
        mouse.current.x = Math.max(-1, Math.min(1, e.gamma / 15));
        mouse.current.y = Math.max(-1, Math.min(1, (e.beta - 40) / 15));
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('deviceorientation', onOrient);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('deviceorientation', onOrient);
    };
  }, []);

  // Unified animation loop: parallax + idle breathing + petals
  useEffect(() => {
    const canvas = petalCanvas.current;
    const ctx = canvas ? canvas.getContext('2d') : null;
    let w = 0, h = 0;

    function resize() {
      if (canvas) {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      }
    }
    resize();
    window.addEventListener('resize', resize);

    // Init petals
    petalsData.current = Array.from({ length: PETAL_COUNT }, () => ({
      x: Math.random() * (w || 1920),
      y: Math.random() * (h || 1080) * 1.1 - 50,
      z: Math.random(),
      size: 3 + Math.random() * 7,
      vy: 0.12 + Math.random() * 0.4,
      vx: -0.08 + Math.random() * 0.16,
      wo: Math.random() * Math.PI * 2,
      ws: 0.005 + Math.random() * 0.01,
      rot: Math.random() * Math.PI * 2,
      rs: 0.005 + Math.random() * 0.014,
      alpha: 0.3 + Math.random() * 0.55,
      ci: Math.floor(Math.random() * 3),
    }));

    const colors = [[248,180,200],[253,215,225],[255,240,244]];

    function tick() {
      time.current += 0.016;
      const t = time.current;

      // Smooth lerp mouse
      current.current.x += (mouse.current.x - current.current.x) * 0.035;
      current.current.y += (mouse.current.y - current.current.y) * 0.035;
      const mx = current.current.x;
      const my = current.current.y;

      // Update layer transforms
      LAYERS.forEach((layer, i) => {
        const el = layerEls.current[i];
        if (!el) return;

        // Parallax from mouse
        const px = mx * layer.depth * -800;
        const py = my * layer.depth * -400;

        // Idle "breathing" sway — each layer sways slightly differently
        const breathX = Math.sin(t * 0.3 + i * 1.2) * 2 * (1 + layer.depth * 8);
        const breathY = Math.cos(t * 0.25 + i * 0.8) * 1.2 * (1 + layer.depth * 5);

        // Subtle scale pulse
        const breathScale = 1 + Math.sin(t * 0.2 + i * 0.5) * 0.003 * (1 + layer.depth * 10);

        el.style.transform = `translate(${px + breathX}px, ${py + breathY}px) scale(${(1.02 + layer.depth * 0.8) * breathScale})`;
      });

      // Draw petals
      if (ctx && w && h) {
        ctx.clearRect(0, 0, w, h);

        petalsData.current.forEach(p => {
          const d = 0.4 + p.z * 0.8;
          p.y += p.vy * d;
          p.x += p.vx * d + Math.sin(t * p.ws * 60 + p.wo) * 0.3;
          p.rot += p.rs * d;

          if (p.y > h + 15) {
            p.x = Math.random() * w;
            p.y = -8 - Math.random() * 50;
            p.z = Math.random();
          }

          const dx = p.x + mx * -25 * p.z;
          const ds = p.size * (0.4 + p.z * 0.8);
          const da = p.alpha * (0.3 + p.z * 0.7);
          const co = colors[p.ci];

          ctx.save();
          ctx.translate(dx, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = da;
          ctx.fillStyle = `rgba(${co[0]},${co[1]},${co[2]},${da})`;
          ctx.beginPath();
          ctx.moveTo(0, -ds * 0.5);
          ctx.bezierCurveTo(ds * 0.55, -ds * 0.35, ds * 0.45, ds * 0.2, 0, ds * 0.5);
          ctx.bezierCurveTo(-ds * 0.45, ds * 0.2, -ds * 0.55, -ds * 0.35, 0, -ds * 0.5);
          ctx.fill();
          ctx.restore();
        });
      }

      rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="parallax-scene">
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          className={`parallax-layer ${layer.className}`}
          ref={el => layerEls.current[i] = el}
        >
          <img src={layer.src} alt="" draggable={false} />
        </div>
      ))}
      <canvas ref={petalCanvas} className="parallax-petals" />
    </div>
  );
}

export default SceneParallax;
