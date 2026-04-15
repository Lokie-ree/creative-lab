// src/components/modules/pythagorean-theorem/scene/CoordinateGrid.tsx
//
// Integer coordinate grid for Phase 4 (coord-distance).
// Grid range: [0, 12] on both axes, matching all Phase 4 point pairs.
// Number labels at even values via SpriteLabel (never drei <Text>).

import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { SpriteLabel } from './scene-primitives'
import { Z } from './scene-layout'

const GRID_MAX = 12
const LABEL_TICKS = [2, 4, 6, 8, 10, 12] as const

function buildGridGeometry(): Float32Array {
  const pts: number[] = []
  for (let i = 0; i <= GRID_MAX; i++) {
    pts.push(0, i, 0,  GRID_MAX, i, 0)  // horizontal line at y=i
    pts.push(i, 0, 0,  i, GRID_MAX, 0)  // vertical line at x=i
  }
  return new Float32Array(pts)
}

export function CoordinateGrid() {
  const gridGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(buildGridGeometry(), 3))
    return geo
  }, [])

  const axisGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([0,0,0, GRID_MAX,0,0,  0,0,0, 0,GRID_MAX,0]),
      3,
    ))
    return geo
  }, [])

  useEffect(() => () => { gridGeo.dispose(); axisGeo.dispose() }, [gridGeo, axisGeo])

  return (
    <group>
      {/* Grid lines */}
      <lineSegments geometry={gridGeo} position={[0, 0, Z.GRID]}>
        <lineBasicMaterial color="#7a746a" transparent opacity={0.2} />
      </lineSegments>

      {/* Axis lines (x=0 and y=0) — slightly brighter */}
      <lineSegments geometry={axisGeo} position={[0, 0, Z.GRID + 0.001]}>
        <lineBasicMaterial color="#7a746a" transparent opacity={0.5} />
      </lineSegments>

      {/* X-axis number labels */}
      {LABEL_TICKS.map(n => (
        <SpriteLabel
          key={`x-${n}`}
          text={String(n)}
          position={{ x: n, y: -0.7 }}
          zLayer={Z.AREA_LABEL}
          color="#8a847a"
          planeWidth={n >= 10 ? 0.65 : 0.5}
        />
      ))}

      {/* Y-axis number labels */}
      {LABEL_TICKS.map(n => (
        <SpriteLabel
          key={`y-${n}`}
          text={String(n)}
          position={{ x: -0.7, y: n }}
          zLayer={Z.AREA_LABEL}
          color="#8a847a"
          planeWidth={n >= 10 ? 0.65 : 0.5}
        />
      ))}
    </group>
  )
}
