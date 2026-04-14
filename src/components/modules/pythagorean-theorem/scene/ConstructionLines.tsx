// src/components/modules/pythagorean-theorem/scene/ConstructionLines.tsx
//
// Phase 4 construction: horizontal + vertical legs showing the hidden right triangle.
//
// Before confirm:
//   Ghost-colored lines at reduced opacity (student sees the decomposition suggested)
//
// After confirm (GSAP crossfade, 0.4s):
//   Accent-colored lines at full opacity
//   Right-angle marker at the corner vertex
//   Leg length labels on each segment

import { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { SpriteLabel } from './scene-primitives'
import { Z } from './scene-layout'
import type { Vec2 } from '../types'

const MARKER_SIZE = 0.35
const GHOST  = '#7a746a'
const ACCENT = '#7cc87c'

interface ConstructionLinesProps {
  p1: Vec2
  p2: Vec2
  constructionConfirmed: boolean
}

export function ConstructionLines({ p1, p2, constructionConfirmed }: ConstructionLinesProps) {
  // Corner where the two legs meet (directly right of p1, directly below p2)
  const corner: Vec2 = { x: p2.x, y: p1.y }

  // Leg lengths (integer — coord points are always integers)
  const hLength = Math.round(Math.abs(p2.x - p1.x))
  const vLength = Math.round(Math.abs(p2.y - p1.y))

  // ---------------------------------------------------------------------------
  // Line geometries — shared between ghost and accent
  // ---------------------------------------------------------------------------

  const hGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([p1.x, p1.y, 0,  corner.x, corner.y, 0]),
      3,
    ))
    return geo
  }, [p1.x, p1.y, corner.x, corner.y])

  const vGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([corner.x, corner.y, 0,  p2.x, p2.y, 0]),
      3,
    ))
    return geo
  }, [corner.x, corner.y, p2.x, p2.y])

  // Right-angle marker geometry — small square at the corner, pointing inward
  const markerGeo = useMemo(() => {
    const s = MARKER_SIZE
    // The legs go left (toward p1) and up (toward p2) from the corner
    // Marker occupies the inside quadrant
    const cx = corner.x, cy = corner.y
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([
        cx,     cy,       0,
        cx - s, cy,       0,
        cx - s, cy + s,   0,
        cx,     cy + s,   0,
      ]),
      3,
    ))
    return geo
  }, [corner.x, corner.y])

  useEffect(() => () => {
    hGeo.dispose()
    vGeo.dispose()
    markerGeo.dispose()
  }, [hGeo, vGeo, markerGeo])

  // ---------------------------------------------------------------------------
  // Material refs for GSAP crossfade
  // ---------------------------------------------------------------------------

  const ghostHRef  = useRef<THREE.LineBasicMaterial | null>(null)
  const ghostVRef  = useRef<THREE.LineBasicMaterial | null>(null)
  const accentHRef = useRef<THREE.LineBasicMaterial | null>(null)
  const accentVRef = useRef<THREE.LineBasicMaterial | null>(null)

  useEffect(() => {
    if (constructionConfirmed) {
      // Crossfade: ghost fades out, accent fades in
      const tl = gsap.timeline()
      if (ghostHRef.current)  tl.to(ghostHRef.current,  { opacity: 0, duration: 0.4 }, 0)
      if (ghostVRef.current)  tl.to(ghostVRef.current,  { opacity: 0, duration: 0.4 }, 0)
      if (accentHRef.current) tl.to(accentHRef.current, { opacity: 1, duration: 0.4 }, 0)
      if (accentVRef.current) tl.to(accentVRef.current, { opacity: 1, duration: 0.4 }, 0)
      return () => { tl.kill() }
    } else {
      // Reset to pre-confirm state — fires on round advance within Phase 4
      if (ghostHRef.current)  ghostHRef.current.opacity  = 0.45
      if (ghostVRef.current)  ghostVRef.current.opacity  = 0.45
      if (accentHRef.current) accentHRef.current.opacity = 0
      if (accentVRef.current) accentVRef.current.opacity = 0
    }
  }, [constructionConfirmed])

  // Label positions — midpoints of each leg, slightly offset
  const hMid = { x: (p1.x + corner.x) / 2, y: p1.y - 0.55 }
  const vMid = { x: corner.x + 0.55,        y: (corner.y + p2.y) / 2 }

  return (
    <group>
      {/* Ghost lines — visible before confirm */}
      <lineSegments geometry={hGeo} position={[0, 0, Z.COORD_DOT]}>
        <lineBasicMaterial ref={ghostHRef} color={GHOST} transparent opacity={0.45} />
      </lineSegments>
      <lineSegments geometry={vGeo} position={[0, 0, Z.COORD_DOT]}>
        <lineBasicMaterial ref={ghostVRef} color={GHOST} transparent opacity={0.45} />
      </lineSegments>

      {/* Accent lines — fade in on confirm */}
      <lineSegments geometry={hGeo} position={[0, 0, Z.COORD_DOT + 0.001]}>
        <lineBasicMaterial ref={accentHRef} color={ACCENT} transparent opacity={0} />
      </lineSegments>
      <lineSegments geometry={vGeo} position={[0, 0, Z.COORD_DOT + 0.001]}>
        <lineBasicMaterial ref={accentVRef} color={ACCENT} transparent opacity={0} />
      </lineSegments>

      {/* Right-angle marker + leg labels — visible after confirm */}
      {constructionConfirmed && (
        <>
          <lineLoop geometry={markerGeo} position={[0, 0, Z.COORD_DOT + 0.002]}>
            <lineBasicMaterial color={ACCENT} transparent opacity={0.8} />
          </lineLoop>
          <SpriteLabel
            text={String(hLength)}
            position={hMid}
            zLayer={Z.COORD_DOT + 0.003}
            color={ACCENT}
            planeWidth={0.55}
          />
          <SpriteLabel
            text={String(vLength)}
            position={vMid}
            zLayer={Z.COORD_DOT + 0.003}
            color={ACCENT}
            planeWidth={0.55}
          />
        </>
      )}
    </group>
  )
}
