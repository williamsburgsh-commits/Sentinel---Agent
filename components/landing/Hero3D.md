# Hero3D Component

A stunning 3D visualization component for the Sentinel landing page hero section, built with React Three Fiber.

## Features

### Visual Design
- **Abstract AI Agent**: Layered 3D geometry (icosahedron + nested spheres)
- **Solana-Themed Colors**: 
  - Primary: `#9945FF` (Solana Purple)
  - Accent: `#14F195` (Solana Green)
- **Emissive Materials**: Glowing wireframe and solid geometries
- **Particle Field**: 1000 particles on desktop, 300 on mobile
- **Point Lights**: Dynamic lighting attached to the agent

### Interactions
- **Parallax Mouse Tracking**: Scene responds to pointer movement
- **Floating Rotation**: Continuous gentle rotation animation
- **Shimmering Particles**: Additional overlay particles in the hero section

### Performance Optimizations
- **Dynamic Import**: Lazy-loaded with `next/dynamic` and `ssr: false`
- **Skeleton Loading**: Shows animated placeholder during 3D scene load
- **Intersection Observer**: Pauses animation when not visible
- **Reduced Particles**: Mobile devices get 70% fewer particles
- **Adaptive Frame Loop**: Changes to `demand` when not visible

### Accessibility
- **Reduced Motion Support**: Respects `prefers-reduced-motion` media query
  - Disables all animations
  - Disables mouse parallax
  - Reduces particle count
  - Switches frame loop to `demand` mode
- **Keyboard Navigation**: Component doesn't interfere with keyboard navigation
- **Focus Management**: No focus traps or interactive elements

## Usage

```tsx
import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('@/components/landing/Hero3D'), {
  ssr: false,
  loading: () => <YourLoadingSkeleton />,
});

function HeroSection() {
  return (
    <div className="h-[600px]">
      <Hero3D className="rounded-3xl" />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes for the container |

## Implementation Details

### Components Hierarchy
```
Hero3D
├── Scene
│   ├── AIAgent
│   │   ├── Icosahedron (wireframe, purple)
│   │   ├── Sphere (solid, green, 0.7 radius)
│   │   ├── Sphere (wireframe, purple, 1.2 radius)
│   │   └── Point Lights (2)
│   └── ParticleField
│       └── Points (300-1000 particles)
```

### Animation Details
- **Group Rotation**: 0.3 rad/s on Y-axis, sinusoidal on X-axis
- **Icosahedron**: 0.4 rad/s on X-axis, 0.2 rad/s on Z-axis
- **Inner Sphere**: -0.3 rad/s on Y-axis
- **Particle Field**: 0.05 rad/s on Y-axis
- **Mouse Parallax**: 5% lerp speed, ±0.5 unit range

### Camera Setup
- **Position**: `[0, 0, 5]`
- **FOV**: 50°
- **DPR**: 1-2 (adaptive)
- **Performance Min**: 0.5

## Browser Compatibility

Works in all modern browsers that support:
- WebGL 2.0
- ES2020
- Intersection Observer API
- CSS `prefers-reduced-motion` media query

## Performance Metrics

- **Initial Load**: ~150KB gzipped (three.js + react-three-fiber + drei)
- **Runtime Memory**: ~50-100MB (varies by device)
- **FPS Target**: 60fps on desktop, 30fps on mobile
- **Lazy Load Delay**: ~200-500ms depending on connection

## Related Components

- **Landing Hero Section**: `/app/page.tsx`
- **Design Tokens**: `/lib/design-tokens.ts`
- **Reduced Motion Hook**: `/lib/use-reduced-motion.ts`
