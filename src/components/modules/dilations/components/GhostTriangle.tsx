// src/components/modules/dilations/components/GhostTriangle.tsx
import { useRef, useMemo, useCallback, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Triangle, Vec2 } from '../utils/types'
import { dilateTriangle, translateTriangle, triangleCentroid } from '../utils/math'

const GHOST_COLOR = '#7a746a'

function snap(v: number): number {
  return Math.round(v * 2) / 2
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
  const groupRef = useRef<THREE.Group>(null)
  const lineLoopRef = useRef<THREE.LineLoop>(null)
  const dragging = useRef(false)
  const dragStartWorld = useRef<Vec2>({ x: 0, y: 0 })
  const centerAtDragStart = useRef<Vec2>({ x: 0, y: 0 })
  const cleanupDragRef = useRef<(() => void) | null>(null)
  // True after drag ends until externalPosition syncs — prevents stale-prop jump
  const postDragRef = useRef(false)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])

  // scaledShape is the dilated triangle centered at origin — built once per scale change
  const scaledShape = useMemo(() => {
    const dilated = dilateTriangle(vertices, scale)
    const c = triangleCentroid(dilated)
    return translateTriangle(dilated, -c.x, -c.y)
  }, [vertices, scale])

  // Geometry built once from origin-centered scaledShape — never rebuilt during drag
  const { fillGeo, outlineGeo } = useMemo(
    () => buildTriangleGeometries(scaledShape),
    [scaledShape]
  )

  useEffect(() => {
    return () => {
      fillGeo.dispose()
      outlineGeo.dispose()
    }
  }, [fillGeo, outlineGeo])

  // Drag position — start at preimage centroid (same pedagogical anchor as M1 ghost at offset 0)
  const initialCenter = useMemo(() => triangleCentroid(vertices), [vertices])
  const centerPosRef = useRef<Vec2>(initialCenter)

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

    const startWorld = getWorldPoint(e.nativeEvent.clientX, e.nativeEvent.clientY)
    dragStartWorld.current = startWorld
    centerAtDragStart.current = externalPosition ?? centerPosRef.current

    const handleMove = (ev: PointerEvent) => {
      if (!dragging.current) return
      const p = getWorldPoint(ev.clientX, ev.clientY)
      // No snap during drag — full floating-point resolution for 60fps smoothness.
      // Snap applied only on release (handleUp).
      centerPosRef.current = {
        x: centerAtDragStart.current.x + (p.x - dragStartWorld.current.x),
        y: centerAtDragStart.current.y + (p.y - dragStartWorld.current.y),
      }
    }

    const handleUp = (ev: PointerEvent) => {
      if (!dragging.current) return
      dragging.current = false
      postDragRef.current = true  // hold on centerPosRef until externalPosition syncs
      const p = getWorldPoint(ev.clientX, ev.clientY)
      const newCenter = {
        x: centerAtDragStart.current.x + (p.x - dragStartWorld.current.x),
        y: centerAtDragStart.current.y + (p.y - dragStartWorld.current.y),
      }
      const snapped = { x: snap(newCenter.x), y: snap(newCenter.y) }
      centerPosRef.current = snapped
      onDrop(snapped)
      onPositionChange?.(snapped)
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
  }, [disabled, getWorldPoint, onDrop, onPositionChange, externalPosition])

  // Sync externalPosition (keyboard nudge) to centerPosRef so useFrame stays consistent
  useEffect(() => {
    if (externalPosition != null) {
      centerPosRef.current = externalPosition
      postDragRef.current = false  // externalPosition has caught up — safe to use it again
    }
  }, [externalPosition])

  useFrame(() => {
    // externalPosition wins during keyboard nudge; otherwise use drag ref
    const pos = (dragging.current || postDragRef.current) ? centerPosRef.current : (externalPosition ?? centerPosRef.current)
    groupRef.current?.position.set(pos.x, pos.y, 0)
    lineLoopRef.current?.computeLineDistances()
  })

  useEffect(() => {
    return () => { cleanupDragRef.current?.() }
  }, [])

  return (
    <>
      {/* Drag capture plane — scene-level sibling (NOT inside ghost group).
          Fixed at world origin so hit-testing works regardless of ghost position.
          200×200 covers the entire canvas. Omitted when disabled so it doesn't
          block pointer events from reveal/completion siblings. */}
      {!disabled && (
        <mesh
          position={[0, 0, -0.2]}
          onPointerDown={handlePointerDown}
        >
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* Ghost visuals — purely visual, no pointer handlers */}
      <group ref={groupRef}>
        {/* Ghost fill — geometry at origin, group position drives location */}
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
    </>
  )
}
