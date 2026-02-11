// src/components/modules/sinewaves/GridLines.tsx
import { useMemo } from 'react'
import * as THREE from 'three'
import { colors } from '@/lib/colors'

interface GridLinesProps {
  width?: number
  height?: number
  majorSpacing?: number
  minorSpacing?: number
  majorOpacity?: number
  minorOpacity?: number
  axisOpacity?: number
}

/**
 * Subtle coordinate grid for the wave visualization area
 * Major lines every 1 unit, minor lines every 0.5 unit
 */
export function GridLines({
  width = 5,
  height = 3,
  majorSpacing = 1,
  minorSpacing = 0.5,
  majorOpacity = 0.22,
  minorOpacity = 0.12,
  axisOpacity = 0.35,
}: GridLinesProps) {
  const { minorLines, majorLines, axes } = useMemo(() => {
    const minorPoints: THREE.Vector3[] = []
    const majorPoints: THREE.Vector3[] = []
    const axisPoints: THREE.Vector3[] = []

    const halfWidth = width / 2
    const halfHeight = height / 2

    // Vertical lines
    for (let x = -halfWidth; x <= halfWidth + width; x += minorSpacing) {
      const isMajor = Math.abs(x % majorSpacing) < 0.01
      const isAxis = Math.abs(x) < 0.01
      const points = isAxis ? axisPoints : isMajor ? majorPoints : minorPoints
      points.push(new THREE.Vector3(x, -halfHeight, -0.1))
      points.push(new THREE.Vector3(x, halfHeight, -0.1))
    }

    // Horizontal lines
    for (let y = -halfHeight; y <= halfHeight; y += minorSpacing) {
      const isMajor = Math.abs(y % majorSpacing) < 0.01
      const isAxis = Math.abs(y) < 0.01
      const points = isAxis ? axisPoints : isMajor ? majorPoints : minorPoints
      points.push(new THREE.Vector3(-halfWidth, y, -0.1))
      points.push(new THREE.Vector3(halfWidth + width, y, -0.1))
    }

    return {
      minorLines: new THREE.BufferGeometry().setFromPoints(minorPoints),
      majorLines: new THREE.BufferGeometry().setFromPoints(majorPoints),
      axes: new THREE.BufferGeometry().setFromPoints(axisPoints),
    }
  }, [width, height, majorSpacing, minorSpacing])

  return (
    <group>
      {/* Minor grid lines */}
      <lineSegments geometry={minorLines}>
        <lineBasicMaterial
          color={colors.background.tertiary}
          transparent
          opacity={minorOpacity}
        />
      </lineSegments>

      {/* Major grid lines */}
      <lineSegments geometry={majorLines}>
        <lineBasicMaterial
          color={colors.background.tertiary}
          transparent
          opacity={majorOpacity}
        />
      </lineSegments>

      {/* Axes */}
      <lineSegments geometry={axes}>
        <lineBasicMaterial
          color={colors.background.tertiary}
          transparent
          opacity={axisOpacity}
        />
      </lineSegments>
    </group>
  )
}
