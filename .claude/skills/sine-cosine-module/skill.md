---
name: sine-cosine-module
description: Technical implementation guide for building the interactive sine/cosine visualization module. Use when writing React Three Fiber components, implementing animations, structuring state, building the unit circle or wave visualization, creating the match scoring system, or optimizing performance. Triggers on code implementation questions for the math module.
---

# Sine/Cosine Module Implementation

Technical patterns for building the interactive visualization with React Three Fiber.

## Stack

```
Vite + React + TypeScript
├── @react-three/fiber (R3F) — Declarative Three.js
├── @react-three/drei — R3F helpers
├── gsap — Discrete transitions
├── shadcn/ui — Control components  
└── tailwind — Styling
```

## Architecture Overview

```
<App>
├── <Canvas> (R3F — 3D scene)
│   ├── <UnitCircle />
│   ├── <SineWave />
│   ├── <PulsingGlow isTarget={false} />
│   └── <PulsingGlow isTarget={true} />
├── <ControlPanel /> (HTML — outside canvas)
├── <MatchIndicator />
└── <FormulaReveal />
```

**Key principle:** HTML controls live OUTSIDE `<Canvas>`. Only Three.js objects inside.

## Critical Performance Pattern

**NEVER call `setState` inside `useFrame`.** This triggers React re-renders every frame and kills performance.

```typescript
// ❌ WRONG — causes re-render every frame
useFrame(() => {
  setAngle(prev => prev + 0.01); // DON'T DO THIS
});

// ✅ RIGHT — mutate refs directly
const angleRef = useRef(0);
const meshRef = useRef<THREE.Mesh>(null);

useFrame((state, delta) => {
  angleRef.current += delta;
  if (meshRef.current) {
    meshRef.current.position.x = Math.cos(angleRef.current);
    meshRef.current.position.y = Math.sin(angleRef.current);
  }
});
```

## State Shape

```typescript
// Parameters — React state (user-controlled, trigger re-render)
const [amplitude, setAmplitude] = useState(1.0);
const [frequency, setFrequency] = useState(1.0);
const [phase, setPhase] = useState(0);

// Animation — Refs (updated every frame, no re-render)
const timeRef = useRef(0);
const angleRef = useRef(0);

// Challenge — React state
const [target] = useState(() => ({
  a: 0.5 + Math.random() * 1.5,  // 0.5 - 2.0
  f: 0.5 + Math.random() * 2.5,  // 0.5 - 3.0
  p: Math.random() * Math.PI * 2 // 0 - 2π
}));
const [hasMatched, setHasMatched] = useState(false);
```

## Syncing Circle and Wave

Both use the same time value. The wave's x-position maps to elapsed angle:

```typescript
useFrame((state, delta) => {
  timeRef.current += delta;
  const t = timeRef.current;
  
  // Circle point position
  const circleAngle = frequency * t + phase;
  circlePoint.x = Math.cos(circleAngle);
  circlePoint.y = Math.sin(circleAngle);
  
  // Wave uses same calculation
  // x = angle (or time), y = amplitude * sin(angle)
  const waveY = amplitude * Math.sin(circleAngle);
  
  // Glow intensity from wave value
  const glowIntensity = mapRange(waveY, -amplitude, amplitude, 0.2, 1.0);
});
```

## Component Patterns

### UnitCircle

```typescript
function UnitCircle({ amplitude, frequency, phase }: Props) {
  const pointRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<THREE.Line>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const angle = frequency * t + phase;
    
    // Move the point
    if (pointRef.current) {
      pointRef.current.position.x = Math.cos(angle);
      pointRef.current.position.y = Math.sin(angle);
    }
    
    // Update radius line (connect center to point)
    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position;
      positions.setXYZ(1, Math.cos(angle), Math.sin(angle), 0);
      positions.needsUpdate = true;
    }
  });
  
  return (
    <group>
      {/* Circle outline */}
      <Line points={circlePoints} color="#4a5568" lineWidth={1} />
      
      {/* Radius line */}
      <Line ref={lineRef} points={[[0,0,0], [1,0,0]]} color="#c8e44c" />
      
      {/* Moving point */}
      <mesh ref={pointRef}>
        <circleGeometry args={[0.08, 32]} />
        <meshBasicMaterial color="#c8e44c" />
      </mesh>
    </group>
  );
}
```

### SineWave (Trail Effect)

```typescript
function SineWave({ amplitude, frequency, phase }: Props) {
  const MAX_POINTS = 200;
  const lineRef = useRef<THREE.Line>(null);
  const pointsRef = useRef<number[]>([]);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const y = amplitude * Math.sin(frequency * t + phase);
    
    // Add new point
    pointsRef.current.push(t, y, 0);
    
    // Trim old points
    while (pointsRef.current.length > MAX_POINTS * 3) {
      pointsRef.current.splice(0, 3);
    }
    
    // Update geometry
    if (lineRef.current && pointsRef.current.length >= 6) {
      const positions = new Float32Array(pointsRef.current);
      lineRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
    }
  });
  
  return <line ref={lineRef}><bufferGeometry /><lineBasicMaterial color="#c8e44c" /></line>;
}
```

### PulsingGlow

```typescript
function PulsingGlow({ amplitude, frequency, phase, isTarget }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const value = amplitude * Math.sin(frequency * t + phase);
    const intensity = mapRange(value, -amplitude, amplitude, 0.2, 1.0);
    
    if (materialRef.current) {
      materialRef.current.opacity = intensity;
    }
    
    // Optional: scale based on intensity
    if (meshRef.current) {
      const scale = 0.8 + intensity * 0.4;
      meshRef.current.scale.setScalar(scale);
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <circleGeometry args={[0.5, 64]} />
      <meshBasicMaterial 
        ref={materialRef}
        color={isTarget ? "#888888" : "#c8e44c"}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}
```

## Match Scoring

```typescript
function calculateMatchScore(
  user: { a: number; f: number; p: number },
  target: { a: number; f: number; p: number }
): number {
  // Normalize each parameter to 0-1 range based on allowed bounds
  const aDiff = Math.abs(user.a - target.a) / 2.0;      // Max diff = 2.0
  const fDiff = Math.abs(user.f - target.f) / 3.0;      // Max diff = 3.0
  const pDiff = Math.min(
    Math.abs(user.p - target.p),
    2 * Math.PI - Math.abs(user.p - target.p)
  ) / Math.PI;                                           // Phase wraps
  
  // Average distance (0 = perfect, 1 = max difference)
  const avgDiff = (aDiff + fDiff + pDiff) / 3;
  
  // Convert to percentage (100 = perfect match)
  return Math.max(0, (1 - avgDiff) * 100);
}

// Match threshold
const MATCH_THRESHOLD = 95; // Percentage required for "match"
```

## GSAP for Discrete Transitions

Use GSAP for user-initiated animations, not continuous motion:

```typescript
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

function FormulaReveal({ show, values }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (show && containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [show]);
  
  if (!show) return null;
  
  return (
    <div ref={containerRef} className="formula-reveal">
      y = {values.a.toFixed(1)} × sin({values.f.toFixed(1)}t + {values.p.toFixed(2)})
    </div>
  );
}
```

## Performance Checklist

- [ ] No `setState` inside `useFrame`
- [ ] Geometries/materials created with `useMemo`
- [ ] Vectors pre-allocated, reused via `.set()`
- [ ] Wave trail limited to ~200 points
- [ ] `<Canvas dpr={[1, 1.5]}>` for mobile
- [ ] Toggle visibility instead of unmounting: `visible={show}`

## Responsive Layout

```typescript
function ResponsiveScene() {
  const { viewport } = useThree();
  
  // Scale based on smaller dimension
  const scale = Math.min(viewport.width, viewport.height) / 6;
  
  return (
    <group scale={scale}>
      <UnitCircle position={[-2, 0, 0]} />
      <SineWave position={[0.5, 0, 0]} />
      <PulsingGlow position={[3, 0, 0]} />
    </group>
  );
}
```

## Utility Functions

```typescript
// Map value from one range to another
function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

// Generate circle points for Line geometry
function generateCirclePoints(segments = 64): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push([Math.cos(angle), Math.sin(angle), 0]);
  }
  return points;
}
```