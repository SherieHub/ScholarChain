"use client";

import { useEffect, useRef } from "react";

// ── Pre-baked fake block hashes ──────────────────────────────────────────
const HASHES = [
  "3a8f2c","b91e47","f04d63","72c5a1","9d3b8e",
  "c16f52","5e2a78","8b4d91","1f7c34","d6a053",
  "4c9e27","a31b56","e85f0c","2d4a79","7f1c83",
  "b0e3d4","6a28f9","3c57b2","90d1ae","f4826c",
  "1b3e5a","8d0c74","c4f2b9","5a9e3d","27b4f8",
];

interface Pos { x: number; y: number; }

interface Chain {
  // — config —
  blockCount: number;
  blockW: number;
  blockH: number;
  targetSpacing: number;
  speed: number;
  amplitude: number;
  frequency: number;
  baseYRatio: number;
  dir: 1 | -1;
  rgb: [number, number, number];
  hashes: string[];
  // — state —
  headX: number;
  history: Pos[];
  blockPositions: Pos[];
  packet: { fromIdx: number; t: number };  // data-packet animation
}

const CHAIN_CONFIGS = [
  {
    blockCount: 7, blockW: 72, blockH: 34, targetSpacing: 100,
    speed: 0.85, amplitude: 70, frequency: 0.018,
    baseYRatio: 0.22, dir: 1 as const,
    rgb: [59, 130, 246] as [number,number,number], // blue
  },
  {
    blockCount: 6, blockW: 68, blockH: 32, targetSpacing: 110,
    speed: 0.65, amplitude: 90, frequency: 0.013,
    baseYRatio: 0.62, dir: -1 as const,
    rgb: [139, 92, 246] as [number,number,number], // violet
  },
  {
    blockCount: 5, blockW: 64, blockH: 30, targetSpacing: 95,
    speed: 1.05, amplitude: 50, frequency: 0.025,
    baseYRatio: 0.82, dir: 1 as const,
    rgb: [99, 102, 241] as [number,number,number], // indigo
  },
];

// Build block positions by sampling history at equal arc-length intervals
function sampleByDistance(history: Pos[], targetSpacing: number, count: number): Pos[] {
  const result: Pos[] = [];
  if (history.length === 0) return result;
  result.push(history[0]);
  let accum = 0;
  for (let i = 1; i < history.length && result.length < count; i++) {
    const dx = history[i].x - history[i - 1].x;
    const dy = history[i].y - history[i - 1].y;
    accum += Math.sqrt(dx * dx + dy * dy);
    if (accum >= targetSpacing) {
      result.push(history[i]);
      accum = 0;
    }
  }
  return result;
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawChain(ctx: CanvasRenderingContext2D, chain: Chain) {
  const pts = chain.blockPositions;
  if (pts.length < 2) return;
  const [r, g, b] = chain.rgb;

  // ── 1. Connection lines ───────────────────────────────────────────────
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], B = pts[i + 1];
    const fade = 1 - i / pts.length;

    // Outer glow
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(B.x, B.y);
    ctx.strokeStyle = `rgba(${r},${g},${b},${fade * 0.12})`;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.stroke();

    // Core line
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(B.x, B.y);
    ctx.strokeStyle = `rgba(${r},${g},${b},${fade * 0.55})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ── 2. Travelling data-packet dot ────────────────────────────────────
  const { fromIdx, t } = chain.packet;
  if (fromIdx < pts.length - 1) {
    const from = pts[fromIdx], to = pts[fromIdx + 1];
    const px = from.x + (to.x - from.x) * t;
    const py = from.y + (to.y - from.y) * t;

    ctx.save();
    ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();
    ctx.restore();
  }

  // ── 3. Blocks (back→front so head renders on top) ─────────────────────
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    const isHead = i === 0;
    const fade = 1 - (i / pts.length) * 0.65;
    const bx = p.x - chain.blockW / 2;
    const by = p.y - chain.blockH / 2;

    ctx.save();

    // Shadow / glow
    ctx.shadowColor = `rgba(${r},${g},${b},${isHead ? 0.9 : 0.4})`;
    ctx.shadowBlur = isHead ? 22 : 10;

    // Background fill
    drawRoundRect(ctx, bx, by, chain.blockW, chain.blockH, 5);
    ctx.fillStyle = `rgba(2,6,23,${fade * 0.88})`;
    ctx.fill();

    // Border
    ctx.shadowBlur = 0;
    drawRoundRect(ctx, bx, by, chain.blockW, chain.blockH, 5);
    ctx.strokeStyle = isHead
      ? `rgba(${r},${g},${b},${fade})`
      : `rgba(${r},${g},${b},${fade * 0.55})`;
    ctx.lineWidth = isHead ? 1.8 : 1;
    ctx.stroke();

    // Gradient overlay on head
    if (isHead) {
      const grad = ctx.createLinearGradient(bx, by, bx + chain.blockW, by + chain.blockH);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.18)`);
      grad.addColorStop(1, "transparent");
      drawRoundRect(ctx, bx, by, chain.blockW, chain.blockH, 5);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Hash text
    ctx.font = `${isHead ? "bold " : ""}9px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(${r},${g},${b},${fade * (isHead ? 1 : 0.75)})`;
    ctx.fillText(`#${chain.hashes[i] ?? "000000"}`, p.x, p.y);

    ctx.restore();
  }
}

export default function BlockchainSnake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialise chain state from config
    const chains: Chain[] = CHAIN_CONFIGS.map((cfg, ci) => ({
      ...cfg,
      hashes: Array.from({ length: cfg.blockCount }, (_, bi) =>
        HASHES[(ci * 9 + bi * 3) % HASHES.length]
      ),
      headX:   cfg.dir === 1 ? -300 : window.innerWidth + 300,
      history: [],
      blockPositions: [],
      packet:  { fromIdx: 0, t: 0 },
    }));

    // Pause when tab hidden
    const onVisChange = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current);
      else loop();
    };
    document.addEventListener("visibilitychange", onVisChange);

    const PACKET_SPEED = 0.015; // fraction of block-gap per frame

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width, H = canvas.height;

      chains.forEach((chain) => {
        // Move head
        chain.headX += chain.speed * chain.dir;
        const headY = H * chain.baseYRatio +
          chain.amplitude * Math.sin(chain.frequency * chain.headX);

        chain.history.unshift({ x: chain.headX, y: headY });

        // Keep only what we need
        const maxHistory = Math.ceil(chain.targetSpacing * chain.blockCount / chain.speed) + 200;
        if (chain.history.length > maxHistory) chain.history.length = maxHistory;

        // Sample block positions by arc-length
        chain.blockPositions = sampleByDistance(
          chain.history, chain.targetSpacing, chain.blockCount
        );

        // Advance data-packet
        chain.packet.t += PACKET_SPEED;
        if (chain.packet.t >= 1) {
          chain.packet.t = 0;
          chain.packet.fromIdx =
            (chain.packet.fromIdx + 1) % Math.max(1, chain.blockPositions.length - 1);
        }

        // Wrap when fully off-screen
        const offscreen = 400;
        if (chain.dir === 1 && chain.headX > W + offscreen) {
          chain.headX = -offscreen;
          chain.history = [];
          chain.packet  = { fromIdx: 0, t: 0 };
        } else if (chain.dir === -1 && chain.headX < -offscreen) {
          chain.headX = W + offscreen;
          chain.history = [];
          chain.packet  = { fromIdx: 0, t: 0 };
        }

        drawChain(ctx, chain);
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
