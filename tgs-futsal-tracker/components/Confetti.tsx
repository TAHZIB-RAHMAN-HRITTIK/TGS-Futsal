"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "#2C84B6", "#F2B705", "#0E2A3F",
  "#FFFFFF", "#EEF5FA", "#B33A3A",
  "#1F6A99", "#E2A800",
];

interface Piece {
  x: number; y: number; size: number; angle: number;
  speed: number; spin: number; color: string; opacity: number;
}

export default function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const pieces: Piece[] = Array.from({ length: 220 }, (_, i) => ({
      x:       Math.random() * window.innerWidth,
      y:       Math.random() * -window.innerHeight * (i < 110 ? 1 : 0.3),
      size:    Math.random() * 10 + 5,
      angle:   Math.random() * Math.PI * 2,
      speed:   Math.random() * 3 + 2,
      spin:    (Math.random() - 0.5) * 0.18,
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 1,
    }));

    const deadline = Date.now() + 7000;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const remaining = deadline - Date.now();

      for (const p of pieces) {
        p.y     += p.speed;
        p.x     += Math.sin(p.angle) * 1.8;
        p.angle += p.spin;
        if (remaining < 1200) p.opacity = Math.max(0, remaining / 1200);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      }

      if (remaining > 0) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
}
