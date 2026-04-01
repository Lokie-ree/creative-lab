// src/components/modules/dilations/components/SequencePreview.tsx
//
// R3F computed ghost triangle — shows the result of applying the student's
// sequence of steps to the pre-image. Updates live as steps change.

import { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { composeTriangle } from '../utils/math'
import type { Triangle, TransformStep } from '../utils/types'

const PREVIEW_COLOR = '#7cc87c'

function buildTriangleGeometries(t: Triangle) {
  const { a, b, c } = t
  const shape = new THREE.Shape()
  shape.moveTo(a.x, a.y)
  shape.lineTo(b.x, b.y)
  shape.lineTo(c.x, c.y)
  shape.closePath()

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

interface SequencePreviewProps {
  steps: TransformStep[]
  preImage: Triangle
  visible: boolean
}

export function SequencePreview({ steps, preImage, visible }: SequencePreviewProps) {
  const lineLoopRef = useRef<THREE.LineLoop>(null)

  const composed = useMemo(
    () => composeTriangle(steps, preImage),
    [steps, preImage]
  )

  const { fillGeo, outlineGeo } = useMemo(
    () => buildTriangleGeometries(composed),
    [composed]
  )

  useEffect(() => {
    return () => {
      fillGeo.dispose()
      outlineGeo.dispose()
    }
  }, [fillGeo, outlineGeo])

  useEffect(() => {
    lineLoopRef.current?.computeLineDistances()
  }, [outlineGeo])

  if (!visible) return null

  return (
    <>
      {/* Preview fill — lighter opacity since it's always-visible, not a drag target */}
      <mesh geometry={fillGeo} position={[0, 0, 0.04]}>
        <meshBasicMaterial color={PREVIEW_COLOR} transparent opacity={0.12} />
      </mesh>

      {/* Preview outline — dashed accent green */}
      <lineLoop ref={lineLoopRef} geometry={outlineGeo} position={[0, 0, 0.05]}>
        <lineDashedMaterial
          color={PREVIEW_COLOR}
          dashSize={0.3}
          gapSize={0.18}
          transparent
          opacity={0.6}
        />
      </lineLoop>
    </>
  )
}
