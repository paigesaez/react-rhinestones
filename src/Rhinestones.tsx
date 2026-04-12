// Rhinestones — decorative faceted gems scattered across the page
// like someone bedazzled their screen with a handful of stones.
//
// Gems catch light as they scroll through the viewport — a bright
// glint flashes when each stone crosses a "light band" that sits
// at a fixed point in the viewport. The effect reads like sunlight
// sweeping across a bedazzled surface as you scroll.
//
// SSR-safe (seeded PRNG), accessible (aria-hidden, no pointer events),
// respects prefers-reduced-motion.

"use client";

import { useEffect, useRef } from "react";

export type RhinestonesProps = {
  /** Total number of rhinestones. Default 40. */
  count?: number;
  /** Color palette (hex strings). Defaults to classic rhinestone colors. */
  palette?: string[];
  /** PRNG seed for deterministic layout. Default 42. */
  seed?: number;
  /** Global opacity multiplier (0–1). Default 1. */
  intensity?: number;
  /** Where in the viewport the "light band" sits (0=top, 1=bottom). Default 0.4. */
  lightPosition?: number;
  /** Extra className on the wrapper div. */
  className?: string;
};

const DEFAULT_PALETTE = [
  "#e8e8f0", // crystal
  "#f0c0d0", // rose
  "#c0d8f0", // ice blue
  "#d0f0d0", // peridot
  "#f0d0a0", // topaz
  "#e0c0f0", // amethyst
  "#f0e8c0", // champagne
];

type Stone = {
  top: number;
  left: number;
  size: number;
  rotation: number;
  opacity: number;
  color: string;
  highlight: string;
  shape: number;
};

type SizeClass = {
  fraction: number;
  sizeMin: number;
  sizeMax: number;
  opacityMin: number;
  opacityMax: number;
};

const SIZE_CLASSES: SizeClass[] = [
  { fraction: 0.45, sizeMin: 10, sizeMax: 18, opacityMin: 0.3,  opacityMax: 0.6  },
  { fraction: 0.30, sizeMin: 16, sizeMax: 28, opacityMin: 0.4,  opacityMax: 0.75 },
  { fraction: 0.18, sizeMin: 24, sizeMax: 40, opacityMin: 0.5,  opacityMax: 0.85 },
  { fraction: 0.07, sizeMin: 36, sizeMax: 56, opacityMin: 0.6,  opacityMax: 1.0  },
];

const SHAPE_COUNT = 5;

// mulberry32 — seeded PRNG
function makeRand(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

function generateStones(count: number, palette: string[], seed: number): Stone[] {
  const rand = makeRand(seed);
  const stones: Stone[] = [];
  for (const cls of SIZE_CLASSES) {
    const n = Math.round(count * cls.fraction);
    for (let i = 0; i < n; i++) {
      const color = palette[Math.floor(rand() * palette.length)];
      stones.push({
        top: rand() * 100,
        left: rand() * 100,
        size: cls.sizeMin + rand() * (cls.sizeMax - cls.sizeMin),
        rotation: rand() * 360,
        opacity: cls.opacityMin + rand() * (cls.opacityMax - cls.opacityMin),
        color,
        highlight: lighten(color, 0.7),
        shape: Math.floor(rand() * SHAPE_COUNT),
      });
    }
  }
  return stones;
}

// ─── SVG shape renderers ───────────────────────────────────────

function RoundCut({ color, highlight }: { color: string; highlight: string }) {
  return (
    <svg viewBox="0 0 40 40" className="rhinestone-stone w-full h-full">
      <circle cx="20" cy="20" r="17" fill={color} stroke={highlight} strokeWidth="0.5" />
      <path d="M20 3 L20 37 M3 20 L37 20 M8 8 L32 32 M32 8 L8 32" stroke={highlight} strokeWidth="0.3" opacity="0.4" />
      <circle cx="20" cy="20" r="8" fill={highlight} opacity="0.25" />
      <ellipse cx="14" cy="13" rx="4" ry="2.5" fill="white" opacity="0.15" transform="rotate(-25 14 13)" className="rhinestone-glint" />
    </svg>
  );
}

function MarquiseCut({ color, highlight }: { color: string; highlight: string }) {
  return (
    <svg viewBox="0 0 40 40" className="rhinestone-stone w-full h-full">
      <ellipse cx="20" cy="20" rx="9" ry="18" fill={color} stroke={highlight} strokeWidth="0.5" />
      <path d="M20 2 L20 38 M11 10 L29 30 M29 10 L11 30" stroke={highlight} strokeWidth="0.3" opacity="0.4" />
      <ellipse cx="20" cy="20" rx="4" ry="9" fill={highlight} opacity="0.2" />
      <ellipse cx="17" cy="12" rx="3" ry="2" fill="white" opacity="0.15" transform="rotate(-15 17 12)" className="rhinestone-glint" />
    </svg>
  );
}

function TeardropCut({ color, highlight }: { color: string; highlight: string }) {
  return (
    <svg viewBox="0 0 40 40" className="rhinestone-stone w-full h-full">
      <path d="M20 3 C 10 3, 4 14, 4 22 C 4 31, 11 38, 20 38 C 29 38, 36 31, 36 22 C 36 14, 30 3, 20 3 Z" fill={color} stroke={highlight} strokeWidth="0.5" />
      <path d="M20 3 L20 38 M10 14 L30 30 M30 14 L10 30 M6 22 L34 22" stroke={highlight} strokeWidth="0.3" opacity="0.35" />
      <path d="M20 10 C 16 10, 12 16, 12 20 C 12 26, 16 30, 20 30 C 24 30, 28 26, 28 20 C 28 16, 24 10, 20 10 Z" fill={highlight} opacity="0.15" />
      <ellipse cx="16" cy="14" rx="3.5" ry="2" fill="white" opacity="0.15" transform="rotate(-20 16 14)" className="rhinestone-glint" />
    </svg>
  );
}

function EmeraldCut({ color, highlight }: { color: string; highlight: string }) {
  return (
    <svg viewBox="0 0 40 40" className="rhinestone-stone w-full h-full">
      <rect x="6" y="4" width="28" height="32" rx="4" fill={color} stroke={highlight} strokeWidth="0.5" />
      <rect x="10" y="8" width="20" height="24" rx="2" fill="none" stroke={highlight} strokeWidth="0.3" opacity="0.4" />
      <rect x="14" y="12" width="12" height="16" rx="1" fill={highlight} opacity="0.15" />
      <path d="M6 4 L10 8 M34 4 L30 8 M6 36 L10 32 M34 36 L30 32" stroke={highlight} strokeWidth="0.3" opacity="0.4" />
      <ellipse cx="15" cy="12" rx="4" ry="2" fill="white" opacity="0.15" transform="rotate(-10 15 12)" className="rhinestone-glint" />
    </svg>
  );
}

function HeartCut({ color, highlight }: { color: string; highlight: string }) {
  return (
    <svg viewBox="0 0 40 40" className="rhinestone-stone w-full h-full">
      <path d="M20 36 C 20 36, 4 24, 4 14 C 4 8, 8 4, 13 4 C 16 4, 19 6, 20 9 C 21 6, 24 4, 27 4 C 32 4, 36 8, 36 14 C 36 24, 20 36, 20 36 Z" fill={color} stroke={highlight} strokeWidth="0.5" />
      <path d="M20 9 L20 33 M10 14 L30 14 M8 20 L32 20" stroke={highlight} strokeWidth="0.3" opacity="0.35" />
      <path d="M20 30 C 20 30, 10 22, 10 16 C 10 12, 12 10, 15 10 C 17 10, 19 11, 20 13 C 21 11, 23 10, 25 10 C 28 10, 30 12, 30 16 C 30 22, 20 30, 20 30 Z" fill={highlight} opacity="0.15" />
      <ellipse cx="14" cy="12" rx="3" ry="2" fill="white" opacity="0.15" transform="rotate(-25 14 12)" className="rhinestone-glint" />
    </svg>
  );
}

const SHAPES = [RoundCut, MarquiseCut, TeardropCut, EmeraldCut, HeartCut];

// ─── Component ─────────────────────────────────────────────────

const cache = new Map<string, Stone[]>();

export function Rhinestones({
  count = 40,
  palette = DEFAULT_PALETTE,
  seed = 42,
  intensity = 1,
  lightPosition = 0.4,
  className = "",
}: RhinestonesProps = {}) {
  const key = `${seed}:${count}`;
  if (!cache.has(key)) cache.set(key, generateStones(count, palette, seed));
  const stones = cache.get(key)!;
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Scroll-driven glint: each stone flashes when it crosses the
  // "light band" — a horizontal line at `lightPosition` in the
  // viewport. Distance from that line controls glint intensity.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const stoneEls = wrapper.querySelectorAll<HTMLElement>("[data-rhinestone]");
    if (!stoneEls.length) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const lightY = vh * lightPosition;
        // The "catch zone" — how close (in px) a stone needs to be
        // to the light band for it to start glinting.
        const catchRadius = vh * 0.15;

        stoneEls.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const stoneCenter = rect.top + rect.height / 2;
          const dist = Math.abs(stoneCenter - lightY);

          if (dist < catchRadius) {
            // 1 at the light band, 0 at the edge of the catch zone
            const t = 1 - dist / catchRadius;
            const glint = el.querySelector<SVGElement>(".rhinestone-glint");
            if (glint) {
              glint.style.opacity = String(0.15 + t * 0.85);
              glint.style.transform = `scale(${1 + t * 1.2})`;
            }
            el.style.filter = `brightness(${1 + t * 0.5})`;
          } else {
            const glint = el.querySelector<SVGElement>(".rhinestone-glint");
            if (glint) {
              glint.style.opacity = "0.15";
              glint.style.transform = "scale(1)";
            }
            el.style.filter = "brightness(1)";
          }
        });
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial pass
    return () => window.removeEventListener("scroll", onScroll);
  }, [lightPosition]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className={`rhinestones pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {stones.map((s, i) => {
        const Shape = SHAPES[s.shape];
        return (
          <div
            key={i}
            data-rhinestone
            className="absolute"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity * intensity,
              transform: `rotate(${s.rotation}deg)`,
              transition: "filter 0.3s ease-out",
            }}
          >
            <Shape color={s.color} highlight={s.highlight} />
          </div>
        );
      })}
    </div>
  );
}
