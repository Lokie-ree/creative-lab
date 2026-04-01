import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { Triangle, Vec2 } from '../utils/types'
import { SpriteLabel } from './SpriteLabel'
import { useDilationsSceneContext } from '../DilationsSceneContext'

const IMAGE_COLOR = '#7cc87c'
const PRIME_LABELS = ["A'", "B'", "C'"] as const

function centroid(t: Triangle): Vec2 {
  return { x: (t.a.x + t.b.x + t.c.x) / 3, y: (t.a.y + t.b.y + t.c.y) / 3 }
}

function labelOffset(vertex: Vec2, c: Vec2, distance = 0.5): Vec2 {
  const dx = vertex.x - c.x
  const dy = vertex.y - c.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return { x: vertex.x + (dx / len) * distance, y: vertex.y + (dy / len) * distance }
}

export interface ImageTriangleProps {
  vertices: Triangle
  visible: boolean
  opacity?: number
  showCoordinates?: boolean
  showAngles?: boolean
  coordinateLabels?: [string, string, string]
  angleLabels?: [number, number, number]
  suppressInlineCoords?: boolean
}

export function ImageTriangle({
  vertices,
  visible,
  opacity = 0.18,
  showCoordinates,
  showAngles,
  coordinateLabels,
  angleLabels,
  suppressInlineCoords,
}: ImageTriangleProps) {
  // HOOKS FIRST — all useMemo calls must appear before any early return (Rules of Hooks)
  const { coordinatesVisible, angleLabelsVisible } = useDilationsSceneContext()
  // Explicit prop wins; context is the fallback
  const effectiveShowCoords = showCoordinates ?? coordinatesVisible
  const effectiveShowAngles = showAngles ?? angleLabelsVisible
  const { a, b, c } = vertices
  const verts = [a, b, c] as const

  const { fillGeo, outlineGeo } = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(a.x, a.y)
    shape.lineTo(b.x, b.y)
    shape.lineTo(c.x, c.y)
    shape.closePath()
    // 3 points — <lineLoop> closes back to first automatically
    const outlinePts = [
      new THREE.Vector3(a.x, a.y, 0),
      new THREE.Vector3(b.x, b.y, 0),
      new THREE.Vector3(c.x, c.y, 0),
    ]
    return {
      fillGeo: new THREE.ShapeGeometry(shape),
      outlineGeo: new THREE.BufferGeometry().setFromPoints(outlinePts),
    }
  }, [a, b, c])

  useEffect(() => {
    return () => {
      fillGeo.dispose()
      outlineGeo.dispose()
    }
  }, [fillGeo, outlineGeo])

  const c2 = useMemo(() => centroid(vertices), [vertices])

  // Early return AFTER all hooks
  if (!visible) return null

  return (
    <group>
      <mesh geometry={fillGeo} position={[0, 0, 0.04]}>
        <meshBasicMaterial color={IMAGE_COLOR} transparent opacity={opacity} />
      </mesh>
      {/* Use lineLoop (not <primitive object={new THREE.Line()}>) to avoid creating a new GPU object on every render */}
      <lineLoop geometry={outlineGeo} position={[0, 0, 0.05]}>
        <lineBasicMaterial color={IMAGE_COLOR} transparent opacity={0.7} />
      </lineLoop>
      {verts.map((v, i) => {
        const off = labelOffset(v, c2)
        return (
          <SpriteLabel
            key={PRIME_LABELS[i]}
            text={PRIME_LABELS[i]}
            position={off}
            zLayer={0.09}
            color={IMAGE_COLOR}
          />
        )
      })}
      {effectiveShowCoords && !suppressInlineCoords && verts.map((v, i) => {
        const label = coordinateLabels?.[i] ?? `(${v.x}, ${v.y})`
        const off = labelOffset(v, c2, 1.1)
        return (
          <SpriteLabel
            key={`img-coord-${i}`}
            text={label}
            position={off}
            zLayer={0.09}
            color={IMAGE_COLOR}
            planeWidth={1.5}
          />
        )
      })}
      {effectiveShowAngles && angleLabels && verts.map((v, i) => {
        const off = labelOffset(v, c2, 0.85)
        return (
          <SpriteLabel
            key={`img-angle-${i}`}
            text={`${angleLabels[i]}°`}
            position={off}
            zLayer={0.09}
            color="#f5a623"
          />
        )
      })}
    </group>
  )
}
