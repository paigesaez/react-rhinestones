# react-rhinestones

Scatter faceted rhinestones across your page. They catch light as you scroll — a bright glint flashes when each stone crosses an invisible "light band" in the viewport, like sunlight sweeping across a bedazzled surface.

Five gem cuts (round brilliant, marquise, teardrop, emerald, heart) in randomized rotations. SSR-safe, accessible, respects `prefers-reduced-motion`.

## Install

```sh
npm install paigesaez/react-rhinestones
```

## Usage

```tsx
import { Rhinestones } from "react-rhinestones";
import "react-rhinestones/css";

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen">
      <Rhinestones />
      {children}
    </div>
  );
}
```

The wrapper needs `position: relative` so the stones anchor correctly. This is a client component (`"use client"`) because the scroll-driven glint effect needs a scroll listener.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `40` | Total number of rhinestones |
| `palette` | `string[]` | Classic gem tones | Array of hex color strings |
| `seed` | `number` | `42` | PRNG seed — same seed = same layout |
| `intensity` | `number` | `1` | Global opacity multiplier (0–1) |
| `lightPosition` | `number` | `0.4` | Where the light band sits in the viewport (0=top, 1=bottom) |
| `className` | `string` | `""` | Extra classes on the wrapper div |

## Examples

```tsx
// Warm gold and rose
<Rhinestones
  palette={["#f0d0a0", "#f0c0d0", "#f0e8c0"]}
  count={30}
/>

// Ice princess
<Rhinestones
  palette={["#c0d8f0", "#e8e8f0", "#d0e8f8", "#ffffff"]}
  count={50}
  lightPosition={0.3}
/>

// Sparse emeralds
<Rhinestones
  palette={["#50c878", "#d0f0d0", "#2e8b57"]}
  count={15}
  intensity={0.8}
/>
```

## How it works

Stones are positioned using a seeded PRNG (mulberry32) so layout is deterministic across server and client renders.

The scroll-driven glint works by tracking each stone's distance from an invisible horizontal "light band" in the viewport. When a stone crosses within range, its specular highlight scales up and brightens — like turning a gem in sunlight. The catch zone is ~15% of viewport height, so the flash is quick and sharp as you scroll past.

Between glints, stones have a subtle idle shimmer via CSS animation so they feel alive even when stationary.

## License

MIT
