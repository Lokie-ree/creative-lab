// src/components/modules/dilations/components/GhostTriangle.tsx
import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Triangle, Vec2 } from '../utils/types'
import { dilateTriangle } from '../utils/math'

const GHOST_COLOR = '#7a746a'

function snap(v: number): number {
  return Math.round(v * 2) / 2
}

function triangleCentroid(t: Triangle): Vec2 {
  return {
    x: (t.a.x + t.b.x + t.c.x) / 3,
    y: (t.a.y + t.b.y + t.c.y) / 3,
  }
}

function translateTriangle(t: Triangle, dx: number, dy: number): Triangle {
  return {
    a: { x: t.a.x + dx, y: t.a.y + dy },
    b: { x: t.b.x + dx, y: t.b.y + dy },
    c: { x: t.c.x + dx, y: t.c.y + dy },
  }
}

function buildTriangleGeometries(t: Triangle) {
  const { a, b, c } = t
  const shape = new THREE.Shape()
  shape.moveTo(a.x, a.y)
  shape.lineTo(b.x, b.y)
  shape.lineTo(c.x, c.y)
  shape.closePath()

  // 3 points only — <lineLoop> closes back to first automatically
  const outlinePts = [
    new THREE.Vector3(a.x, a.y, 0),
    new THREE.Vector3(b.x, b.y, 0),
    new THREE.Vector3(c.x, c.y, 0),
  ]

  return {
    fillGeo: new THREE.ShapeGeometry(shape),
    outlineGeo: new THREE.BufferGeometry().setFromPoints(outlinePts),
  }
}

export interface GhostTriangleProps {
  vertices: Triangle
  scale: number
  onDrop: (position: Vec2) => void
  disabled: boolean
  /** If provided, overrides internal drag position. Used for keyboard nudging. */
  externalPosition?: Vec2 | null
  /** Called on every position change during drag (for keyboard nudge sync). */
  onPositionChange?: (position: Vec2) => void
}

export function GhostTriangle({
  vertices, scale, onDrop, disabled,
  externalPosition, onPositionChange,
}: GhostTriangleProps) {
  const { camera, gl } = useThree()
  const lineLoopRef = useRef<THREE.LineLoop>(null)
  const dragging = useRef(false)
  const cleanupDragRef = useRef<(() => void) | null>(null)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])

  // scaledShape is the dilated triangle centered at origin
  const scaledShape = useMemo(() => {
    const dilated = dilateTriangle(vertices, scale)
    const c = triangleCentroid(dilated)
    return translateTriangle(dilated, -c.x, -c.y)
  }, [vertices, scale])

  const [centerPos, setCenterPos] = useState<Vec2 | null>(null)

  const getWorldPoint = useCallback((clientX: number, clientY: number): Vec2 => {
    const rect = gl.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(ndc, camera)
    const target = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, target)
    return { x: target.x, y: target.y }
  }, [camera, gl, raycaster, plane])

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (disabled) return
    e.stopPropagation()
    dragging.current = true

    const handleMove = (ev: PointerEvent) => {
      if (!dragging.current) return
      const p = getWorldPoint(ev.clientX, ev.clientY)
      const snapped = { x: snap(p.x), y: snap(p.y) }
      setCenterPos(snapped)
      onPositionChange?.(snapped)
    }

    const handleUp = (ev: PointerEvent) => {
      if (!dragging.current) return
      dragging.current = false
      const p = getWorldPoint(ev.clientX, ev.clientY)
      const snapped = { x: snap(p.x), y: snap(p.y) }
      setCenterPos(snapped)
      onDrop(snapped)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      cleanupDragRef.current = null
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    cleanupDragRef.current = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [disabled, getWorldPoint, onDrop, onPositionChange])

  useFrame(() => {
    lineLoopRef.current?.computeLineDistances()
  })

  // externalPosition (keyboard nudge) wins; otherwise use drag position; fallback to pre-image centroid
  const displayCenter = externalPosition ?? centerPos ?? triangleCentroid(vertices)

  const positioned = useMemo(() =>
    translateTriangle(scaledShape, displayCenter.x, displayCenter.y),
    [scaledShape, displayCenter]
  )

  const { fillGeo, outlineGeo } = useMemo(
    () => buildTriangleGeometries(positioned),
    [positioned]
  )

  useEffect(() => {
    return () => {
      fillGeo.dispose()
      outlineGeo.dispose()
    }
  }, [fillGeo, outlineGeo])

  useEffect(() => {
    return () => { cleanupDragRef.current?.() }
  }, [])

  return (
    <group>
      {/* Invisible drag capture plane — only rendered when NOT disabled.
          IMPORTANT: omit entirely when disabled so it doesn't block pointer events
          from sibling R3F components (e.g., during reveal/completion states). */}
      {!disabled && (
        <mesh
          position={[0, 0, -0.1]}
          onPointerDown={handlePointerDown}
        >
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* Ghost fill */}
      <mesh geometry={fillGeo} position={[0, 0, 0.05]}>
        <meshBasicMaterial color={GHOST_COLOR} transparent opacity={disabled ? 0.1 : 0.25} />
      </mesh>

      {/* Ghost outline */}
      <lineLoop ref={lineLoopRef} geometry={outlineGeo} position={[0, 0, 0.06]}>
        <lineDashedMaterial
          color={GHOST_COLOR}
          dashSize={0.25}
          gapSize={0.15}
          transparent
          opacity={disabled ? 0.3 : 0.8}
        />
      </lineLoop>
    </group>
  )
}
