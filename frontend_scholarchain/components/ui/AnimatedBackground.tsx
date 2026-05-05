import {
  GraduationCap,
  BookOpen,
  Award,
  Link,
  Shield,
  Wallet,
  Globe,
  Database,
  Layers,
  Key,
  Cpu,
  Lock,
  Network,
  Fingerprint,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Custom hexagon SVG — represents a blockchain block
function HexBlock({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    >
      <polygon points="30,3 55,17 55,43 30,57 5,43 5,17" />
      {/* Inner detail lines */}
      <line x1="30" y1="3"  x2="30" y2="57" strokeOpacity="0.4" />
      <line x1="5"  y1="17" x2="55" y2="43" strokeOpacity="0.4" />
      <line x1="55" y1="17" x2="5"  y2="43" strokeOpacity="0.4" />
    </svg>
  );
}

interface IconConfig {
  Icon: LucideIcon;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  variant: "a" | "b" | "c";
}

const ICONS: IconConfig[] = [
  { Icon: GraduationCap, x: 7,  y: 10, size: 28, duration: 13, delay: 0,   variant: "a" },
  { Icon: BookOpen,      x: 87, y: 15, size: 22, duration: 16, delay: 1.5, variant: "b" },
  { Icon: Award,         x: 14, y: 72, size: 30, duration: 18, delay: 0.5, variant: "c" },
  { Icon: Link,          x: 78, y: 63, size: 24, duration: 14, delay: 2.2, variant: "a" },
  { Icon: Shield,        x: 47, y: 6,  size: 20, duration: 11, delay: 1.0, variant: "b" },
  { Icon: Wallet,        x: 92, y: 79, size: 26, duration: 19, delay: 3.0, variant: "c" },
  { Icon: Globe,         x: 4,  y: 50, size: 22, duration: 15, delay: 2.8, variant: "a" },
  { Icon: Database,      x: 63, y: 87, size: 20, duration: 12, delay: 0.8, variant: "b" },
  { Icon: Layers,        x: 30, y: 26, size: 18, duration: 20, delay: 1.8, variant: "c" },
  { Icon: Key,           x: 71, y: 33, size: 22, duration: 14, delay: 3.5, variant: "a" },
  { Icon: Cpu,           x: 40, y: 58, size: 18, duration: 17, delay: 4.0, variant: "b" },
  { Icon: Lock,          x: 55, y: 43, size: 16, duration: 13, delay: 2.5, variant: "c" },
  { Icon: Network,       x: 20, y: 88, size: 24, duration: 16, delay: 1.2, variant: "a" },
  { Icon: Fingerprint,   x: 82, y: 46, size: 20, duration: 21, delay: 0.3, variant: "b" },
  { Icon: GraduationCap, x: 58, y: 20, size: 16, duration: 15, delay: 5.0, variant: "c" },
  { Icon: BookOpen,      x: 35, y: 80, size: 18, duration: 12, delay: 3.8, variant: "a" },
];

const HEXAGONS = [
  { x: 22, y: 35, size: 90,  duration: 45, delay: 0,   reverse: false },
  { x: 68, y: 18, size: 65,  duration: 38, delay: 8,   reverse: true  },
  { x: 48, y: 68, size: 75,  duration: 52, delay: 14,  reverse: false },
  { x: 10, y: 78, size: 50,  duration: 42, delay: 5,   reverse: true  },
];

export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* ── Moving gradient orbs ─────────────────────────── */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)",
          top: "5%",
          left: "10%",
          animation: "orb-drift-1 22s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 550,
          height: 550,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 70%)",
          top: "40%",
          right: "5%",
          animation: "orb-drift-2 28s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)",
          bottom: "10%",
          left: "38%",
          animation: "orb-drift-3 19s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* ── Rotating blockchain hexagons ─────────────────── */}
      {HEXAGONS.map((h, i) => (
        <div
          key={`hex-${i}`}
          style={{
            position: "absolute",
            left: `${h.x}%`,
            top: `${h.y}%`,
            color: "rgba(99,102,241,0.06)",
            animation: `${h.reverse ? "spin-reverse" : "spin-slow"} ${h.duration}s linear infinite`,
            animationDelay: `${h.delay}s`,
            willChange: "transform",
          }}
        >
          <HexBlock size={h.size} />
        </div>
      ))}

      {/* ── Floating school & blockchain icons ───────────── */}
      {ICONS.map(({ Icon, x, y, size, duration, delay, variant }, i) => (
        <div
          key={`icon-${i}`}
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            color: "rgba(147,197,253,0.07)",
            animation: `float-${variant} ${duration}s ${delay}s ease-in-out infinite`,
            willChange: "transform, opacity",
          }}
        >
          <Icon size={size} />
        </div>
      ))}
    </div>
  );
}
