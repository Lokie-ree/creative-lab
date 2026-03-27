import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { Triangle, Vec2 } from '../utils/types'
import { SpriteLabel } from './SpriteLabel'
import { useDilationsSceneContext } from '../DilationsSceneContext'

const PRE_COLOR = '#b8b0a4'
const VERTEX_LABELS = ['A', 'B', 'C'] as const

function centroid(t: Triangle): Vec2 {
  return { x: (t.a.x + t.b.x + t.c.x) / 3, y: (t.a.y + t.b.y + t.c.y) / 3 }
}

function labelOffset(vertex: Vec2, c: Vec2, distance = 0.5): Vec2 {
  const dx = vertex.x - c.x
  const dy = vertex.y - c.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return { x: vertex.x + (dx / len) * distance, y: vertex.y + (dy / len) * distance }
}

export interface PreImageTriangleProps {
  vertices: Triangle
  showCoordinates?: boolean
  showAngles?: boolean
  coordinateLabels?: [string, string, string]  // override auto "(x, y)" format
  angleLabels?: [number, number, number]       // degrees at A, B, C
}

export function PreImageTriangle({
  vertices,
  showCoordinates,
  showAngles,
  coordinateLabels,
  angleLabels,
}: PreImageTriangleProps) {
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
    // 3 points only — <lineLoop> closes back to first point automatically
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

  const c2 = useMemo(() => centroid(vertices), [a, b, c])

  return (
    <group>
      <mesh geometry={fillGeo} position={[0, 0, 0.02]}>
        <meshBasicMaterial color={PRE_COLOR} transparent opacity={0.2} />
      </mesh>
      {/* Use lineLoop (not <primitive object={new THREE.Line()}>) to avoid creating a new GPU object on every render */}
      <lineLoop geometry={outlineGeo} position={[0, 0, 0.03]}>
        <lineBasicMaterial color={PRE_COLOR} transparent opacity={0.7} />
      </lineLoop>
      {verts.map((v, i) => {
        const off = labelOffset(v, c2)
        return (
          <SpriteLabel
            key={VERTEX_LABELS[i]}
            text={VERTEX_LABELS[i]}
            position={off}
            zLayer={0.08}
            color={PRE_COLOR}
          />
        )
      })}
      {effectiveShowCoords && verts.map((v, i) => {
        const label = coordinateLabels?.[i] ?? `(${v.x}, ${v.y})`
        const off = labelOffset(v, c2, 1.1)
        return (
          <SpriteLabel
            key={`coord-${i}`}
            text={label}
            position={off}
            zLayer={0.08}
            color={PRE_COLOR}
            planeWidth={1.5}
          />
        )
      })}
      {effectiveShowAngles && angleLabels && verts.map((v, i) => {
        const off = labelOffset(v, c2, 0.85)
        return (
          <SpriteLabel
            key={`angle-${i}`}
            text={`${angleLabels[i]}°`}
            position={off}
            zLayer={0.08}
            color="#f5a623"
          />
        )
      })}
    </group>
  )
}
