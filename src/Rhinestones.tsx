// Crystals — decorative mineral crystal points scattered across the
// page. Each crystal is a hand-drawn SVG with individual facets —
// separate polygons at different brightness values that create the
// 3D crystalline look. Translucent, icy, angular.
//
// SSR-safe (seeded PRNG), accessible (aria-hidden, no pointer events),
// respects prefers-reduced-motion.

"use client";

import { useEffect, useRef } from "react";

export type RhinestonesProps = {
  /** Total number of crystals. Default 30. */
  count?: number;
  /** Color palette (hex strings). Defaults to natural quartz tones. */
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
  "#40c8f0", // vivid ice blue
  "#60e0d0", // sea glass
  "#50b0e8", // azure
  "#80d8f0", // glacier
  "#38d0b8", // teal crystal
  "#70c0e0", // cerulean
  "#90a8e0", // sapphire ice
  "#58e8c8", // mint
];

// ─── Helpers ───────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

// HSL facet fill helper — returns hsla string with alpha for translucency
function f(h: number, s: number, l: number, a: number): string {
  return `hsla(${h}, ${s}%, ${Math.max(5, Math.min(98, l))}%, ${a})`;
}

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

// ─── Crystal SVG shapes ────────────────────────────────────────
// Each crystal is drawn as individual facet polygons. Light source
// is upper-left. Facets facing the light are brighter, shadow side
// darker. All fills are semi-transparent for the glassy look.
//
// h = hue, s = saturation, l = base lightness

type CrystalProps = { h: number; s: number; l: number };

// 1. Classic single quartz point — viewed at slight angle
function Crystal1({ h, s, l }: CrystalProps) {
  return (
    <svg viewBox="0 0 60 130" className="crystal-gem">
      {/* Column faces */}
      <polygon points="10,120 10,42 22,32 22,120" fill={f(h, s, l + 25, 0.8)} />
      <polygon points="22,120 22,32 46,36 46,120" fill={f(h, s, l + 10, 0.7)} />
      <polygon points="46,120 46,36 54,44 54,120" fill={f(h, s, l - 25, 0.75)} />
      {/* Point facets */}
      <polygon points="10,42 22,32 30,4" fill={f(h, s, l + 38, 0.85)} />
      <polygon points="22,32 46,36 30,4" fill={f(h, s, l + 18, 0.75)} />
      <polygon points="46,36 54,44 30,4" fill={f(h, s, l - 15, 0.7)} />
      {/* Edge highlights — bright edges where facets meet on lit side */}
      <line x1="22" y1="120" x2="22" y2="32" stroke="white" strokeWidth="1" opacity="0.55" />
      <line x1="22" y1="32" x2="30" y2="4" stroke="white" strokeWidth="0.8" opacity="0.7" />
      <line x1="10" y1="42" x2="30" y2="4" stroke="white" strokeWidth="0.6" opacity="0.4" />
      <line x1="10" y1="42" x2="22" y2="32" stroke="white" strokeWidth="0.6" opacity="0.45" />
      {/* Specular gleam on brightest facet */}
      <polygon points="14,40 24,30 27,14 17,28" fill="white" opacity="0.35" />
      {/* Striation lines on center column face */}
      <line x1="24" y1="50" x2="44" y2="51" stroke="white" strokeWidth="0.4" opacity="0.2" />
      <line x1="24" y1="62" x2="44" y2="63" stroke="white" strokeWidth="0.4" opacity="0.15" />
      <line x1="24" y1="74" x2="44" y2="75" stroke="white" strokeWidth="0.4" opacity="0.12" />
      <line x1="24" y1="88" x2="44" y2="89" stroke="white" strokeWidth="0.4" opacity="0.15" />
      {/* Glint element */}
      <circle cx="22" cy="30" r="4" fill="white" opacity="0.3" className="crystal-glint" />
    </svg>
  );
}

// 2. Wider stubby crystal — more tabular habit
function Crystal2({ h, s, l }: CrystalProps) {
  return (
    <svg viewBox="0 0 70 100" className="crystal-gem">
      {/* Column faces */}
      <polygon points="8,90 8,35 25,28 25,90" fill={f(h, s, l + 25, 0.75)} />
      <polygon points="25,90 25,28 52,32 52,90" fill={f(h, s, l + 10, 0.65)} />
      <polygon points="52,90 52,32 62,38 62,90" fill={f(h, s, l - 25, 0.7)} />
      {/* Point facets */}
      <polygon points="8,35 25,28 35,8" fill={f(h, s, l + 40, 0.85)} />
      <polygon points="25,28 52,32 35,8" fill={f(h, s, l + 20, 0.7)} />
      <polygon points="52,32 62,38 35,8" fill={f(h, s, l - 15, 0.65)} />
      {/* Extra facet on point — phantom face */}
      <polygon points="25,28 35,8 30,18" fill={f(h, s, l + 42, 0.5)} />
      {/* Edges */}
      <line x1="25" y1="90" x2="25" y2="28" stroke="white" strokeWidth="1" opacity="0.5" />
      <line x1="25" y1="28" x2="35" y2="8" stroke="white" strokeWidth="0.8" opacity="0.65" />
      <line x1="8" y1="35" x2="35" y2="8" stroke="white" strokeWidth="0.6" opacity="0.35" />
      <line x1="52" y1="32" x2="35" y2="8" stroke="white" strokeWidth="0.5" opacity="0.25" />
      {/* Specular */}
      <polygon points="11,34 27,26 32,12 16,26" fill="white" opacity="0.3" />
      {/* Striations */}
      <line x1="27" y1="45" x2="50" y2="46" stroke="white" strokeWidth="0.4" opacity="0.18" />
      <line x1="27" y1="58" x2="50" y2="59" stroke="white" strokeWidth="0.4" opacity="0.14" />
      <line x1="27" y1="72" x2="50" y2="73" stroke="white" strokeWidth="0.4" opacity="0.16" />
      <circle cx="25" cy="26" r="4" fill="white" opacity="0.3" className="crystal-glint" />
    </svg>
  );
}

// 3. Thin needle crystal — acicular habit
function Crystal3({ h, s, l }: CrystalProps) {
  return (
    <svg viewBox="0 0 32 140" className="crystal-gem">
      {/* Column faces — very narrow */}
      <polygon points="6,130 6,30 13,22 13,130" fill={f(h, s, l + 28, 0.8)} />
      <polygon points="13,130 13,22 24,26 24,130" fill={f(h, s, l + 10, 0.65)} />
      <polygon points="24,130 24,26 28,32 28,130" fill={f(h, s, l - 20, 0.7)} />
      {/* Sharp point */}
      <polygon points="6,30 13,22 16,2" fill={f(h, s, l + 40, 0.85)} />
      <polygon points="13,22 24,26 16,2" fill={f(h, s, l + 18, 0.7)} />
      <polygon points="24,26 28,32 16,2" fill={f(h, s, l - 10, 0.65)} />
      {/* Edges */}
      <line x1="13" y1="130" x2="13" y2="22" stroke="white" strokeWidth="0.8" opacity="0.55" />
      <line x1="13" y1="22" x2="16" y2="2" stroke="white" strokeWidth="0.6" opacity="0.7" />
      <line x1="6" y1="30" x2="16" y2="2" stroke="white" strokeWidth="0.5" opacity="0.4" />
      {/* Specular streak down the lit face */}
      <polygon points="8,30 14,22 14,70 8,72" fill="white" opacity="0.2" />
      <circle cx="13" cy="20" r="3" fill="white" opacity="0.3" className="crystal-glint" />
    </svg>
  );
}

// 4. Double-terminated crystal — pointed both ends
function Crystal4({ h, s, l }: CrystalProps) {
  return (
    <svg viewBox="0 0 50 130" className="crystal-gem">
      {/* Column faces */}
      <polygon points="6,90 6,40 18,32 18,96" fill={f(h, s, l + 25, 0.75)} />
      <polygon points="18,96 18,32 38,36 38,92" fill={f(h, s, l + 10, 0.65)} />
      <polygon points="38,92 38,36 46,42 46,88" fill={f(h, s, l - 22, 0.7)} />
      {/* Top point */}
      <polygon points="6,40 18,32 25,6" fill={f(h, s, l + 38, 0.85)} />
      <polygon points="18,32 38,36 25,6" fill={f(h, s, l + 18, 0.7)} />
      <polygon points="38,36 46,42 25,6" fill={f(h, s, l - 12, 0.65)} />
      {/* Bottom point */}
      <polygon points="6,90 18,96 25,124" fill={f(h, s, l + 15, 0.6)} />
      <polygon points="18,96 38,92 25,124" fill={f(h, s, l, 0.5)} />
      <polygon points="38,92 46,88 25,124" fill={f(h, s, l - 28, 0.6)} />
      {/* Edges */}
      <line x1="18" y1="96" x2="18" y2="32" stroke="white" strokeWidth="1" opacity="0.5" />
      <line x1="18" y1="32" x2="25" y2="6" stroke="white" strokeWidth="0.8" opacity="0.65" />
      <line x1="6" y1="40" x2="25" y2="6" stroke="white" strokeWidth="0.5" opacity="0.35" />
      <line x1="6" y1="90" x2="25" y2="124" stroke="white" strokeWidth="0.5" opacity="0.25" />
      {/* Specular */}
      <polygon points="9,40 20,31 23,12 12,28" fill="white" opacity="0.3" />
      {/* Striations */}
      <line x1="20" y1="48" x2="36" y2="49" stroke="white" strokeWidth="0.4" opacity="0.18" />
      <line x1="20" y1="65" x2="36" y2="66" stroke="white" strokeWidth="0.4" opacity="0.14" />
      <line x1="20" y1="80" x2="36" y2="81" stroke="white" strokeWidth="0.4" opacity="0.16" />
      <circle cx="18" cy="30" r="4" fill="white" opacity="0.3" className="crystal-glint" />
    </svg>
  );
}

// 5. Cluster — two crystals growing together
function Crystal5({ h, s, l }: CrystalProps) {
  return (
    <svg viewBox="0 0 70 120" className="crystal-gem">
      {/* Main crystal — larger, slightly left */}
      <polygon points="10,110 10,40 22,30 22,110" fill={f(h, s, l + 25, 0.75)} />
      <polygon points="22,110 22,30 40,34 40,110" fill={f(h, s, l + 10, 0.65)} />
      <polygon points="40,110 40,34 46,40 46,110" fill={f(h, s, l - 22, 0.7)} />
      <polygon points="10,40 22,30 28,6" fill={f(h, s, l + 38, 0.85)} />
      <polygon points="22,30 40,34 28,6" fill={f(h, s, l + 18, 0.7)} />
      <polygon points="40,34 46,40 28,6" fill={f(h, s, l - 12, 0.65)} />
      {/* Second crystal — smaller, growing off to the right */}
      <polygon points="36,110 36,55 44,48 44,110" fill={f(h, s, l + 28, 0.7)} />
      <polygon points="44,110 44,48 58,52 58,110" fill={f(h, s, l + 15, 0.6)} />
      <polygon points="58,110 58,52 62,56 62,110" fill={f(h, s, l - 18, 0.65)} />
      <polygon points="36,55 44,48 50,28" fill={f(h, s, l + 40, 0.8)} />
      <polygon points="44,48 58,52 50,28" fill={f(h, s, l + 22, 0.65)} />
      <polygon points="58,52 62,56 50,28" fill={f(h, s, l - 8, 0.6)} />
      {/* Edge highlights — main crystal */}
      <line x1="22" y1="110" x2="22" y2="30" stroke="white" strokeWidth="1" opacity="0.5" />
      <line x1="22" y1="30" x2="28" y2="6" stroke="white" strokeWidth="0.8" opacity="0.65" />
      <line x1="10" y1="40" x2="28" y2="6" stroke="white" strokeWidth="0.5" opacity="0.35" />
      {/* Edge highlights — second crystal */}
      <line x1="44" y1="110" x2="44" y2="48" stroke="white" strokeWidth="0.7" opacity="0.45" />
      <line x1="44" y1="48" x2="50" y2="28" stroke="white" strokeWidth="0.6" opacity="0.6" />
      {/* Speculars */}
      <polygon points="13,38 24,28 27,12 16,26" fill="white" opacity="0.3" />
      <polygon points="38,54 46,46 48,32 40,44" fill="white" opacity="0.25" />
      {/* Striations on main */}
      <line x1="24" y1="50" x2="38" y2="51" stroke="white" strokeWidth="0.4" opacity="0.18" />
      <line x1="24" y1="68" x2="38" y2="69" stroke="white" strokeWidth="0.4" opacity="0.14" />
      <circle cx="22" cy="28" r="4" fill="white" opacity="0.3" className="crystal-glint" />
      <circle cx="44" cy="46" r="3" fill="white" opacity="0.25" className="crystal-glint" />
    </svg>
  );
}

const CRYSTAL_COMPONENTS = [Crystal1, Crystal2, Crystal3, Crystal4, Crystal5];

// ─── Stone generation ──────────────────────────────────────────

type Stone = {
  top: number;
  left: number;
  scale: number;
  rotation: number;
  opacity: number;
  hsl: [number, number, number];
  shape: number;
  flip: boolean;
};

type SizeClass = {
  fraction: number;
  scaleMin: number;
  scaleMax: number;
  opacityMin: number;
  opacityMax: number;
};

const SIZE_CLASSES: SizeClass[] = [
  { fraction: 0.40, scaleMin: 0.3,  scaleMax: 0.6,  opacityMin: 0.3,  opacityMax: 0.55 },
  { fraction: 0.30, scaleMin: 0.5,  scaleMax: 0.9,  opacityMin: 0.4,  opacityMax: 0.7  },
  { fraction: 0.20, scaleMin: 0.8,  scaleMax: 1.3,  opacityMin: 0.5,  opacityMax: 0.85 },
  { fraction: 0.10, scaleMin: 1.2,  scaleMax: 2.0,  opacityMin: 0.6,  opacityMax: 0.95 },
];

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
        scale: cls.scaleMin + rand() * (cls.scaleMax - cls.scaleMin),
        rotation: rand() * 360,
        opacity: cls.opacityMin + rand() * (cls.opacityMax - cls.opacityMin),
        hsl: hexToHsl(color),
        shape: Math.floor(rand() * CRYSTAL_COMPONENTS.length),
        flip: rand() > 0.5,
      });
    }
  }
  return stones;
}

// ─── Component ─────────────────────────────────────────────────

const cache = new Map<string, Stone[]>();

export function Rhinestones({
  count = 30,
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

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const els = wrapper.querySelectorAll<HTMLElement>("[data-crystal]");
    if (!els.length) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const lightY = vh * lightPosition;
        const catchRadius = vh * 0.18;

        els.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const dist = Math.abs(center - lightY);

          if (dist < catchRadius) {
            const t = 1 - dist / catchRadius;
            el.style.filter = `brightness(${1 + t * 0.7}) drop-shadow(0 0 ${4 + t * 8}px rgba(200,230,255,${0.2 + t * 0.4}))`;
            // Boost the glint circles
            el.querySelectorAll<SVGElement>(".crystal-glint").forEach((g) => {
              g.style.opacity = String(0.15 + t * 0.7);
              g.style.transform = `scale(${1 + t * 2})`;
            });
          } else {
            el.style.filter = "brightness(1) drop-shadow(0 0 4px rgba(200,230,255,0.1))";
            el.querySelectorAll<SVGElement>(".crystal-glint").forEach((g) => {
              g.style.opacity = "0.15";
              g.style.transform = "scale(1)";
            });
          }
        });
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [lightPosition]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {stones.map((s, i) => {
        const [h, sat, l] = s.hsl;
        const CrystalShape = CRYSTAL_COMPONENTS[s.shape];
        return (
          <div
            key={i}
            data-crystal
            className="absolute"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              transform: `rotate(${s.rotation}deg) scale(${s.scale}) ${s.flip ? "scaleX(-1)" : ""}`,
              opacity: s.opacity * intensity,
              width: "50px",
              height: "100px",
              transition: "filter 0.3s ease-out",
              filter: "brightness(1) drop-shadow(0 0 4px rgba(200,230,255,0.1))",
            }}
          >
            <CrystalShape h={h} s={Math.max(sat, 12)} l={l} />
          </div>
        );
      })}
    </div>
  );
}
