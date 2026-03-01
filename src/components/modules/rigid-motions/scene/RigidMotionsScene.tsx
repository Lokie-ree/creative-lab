// src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx
import { useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import {
  PRE_IMAGE_VERTICES,
  VERTEX_LABELS,
  GHOST_VERTEX_LABELS,
  GRID_RANGE,
  CONTENT_RANGE,
} from '../constants'

interface RigidMotionsSceneProps {
  ghostOffset: [number, number]
  onGhostMove: (rawOffset: [number, number]) => void
}

// ─── Camera setup ────────────────────────────────────────────────────────────

function CameraSetup() {
  const { camera, size } = useThree()
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = size.width / (GRID_RANGE * 2)
      camera.updateProjectionMatrix()
    }
  }, [camera, size.width])
  return null
}

// ─── Coordinate grid ─────────────────────────────────────────────────────────

function CoordinateGrid() {
  const { gridGeometry, axisGeometry } = useMemo(() => {
    const grid: THREE.Vector3[] = []
    const axes: THREE.Vector3[] = []

    for (let i = -GRID_RANGE; i <= GRID_RANGE; i++) {
      const isAxis = i === 0
      const target = isAxis ? axes : grid
      // Vertical line
      target.push(new THREE.Vector3(i, -GRID_RANGE, 0))
      target.push(new THREE.Vector3(i, GRID_RANGE, 0))
      // Horizontal line
      target.push(new THREE.Vector3(-GRID_RANGE, i, 0))
      target.push(new THREE.Vector3(GRID_RANGE, i, 0))
    }

    return {
      gridGeometry: new THREE.BufferGeometry().setFromPoints(grid),
      axisGeometry: new THREE.BufferGeometry().setFromPoints(axes),
    }
  }, [])

  const labelIntegers = useMemo(() => {
    const ints: number[] = []
    for (let i = -CONTENT_RANGE; i <= CONTENT_RANGE; i++) {
      if (i !== 0) ints.push(i)
    }
    return ints
  }, [])

  return (
    <group>
      {/* Minor grid lines */}
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial color="#28251f" transparent opacity={0.2} />
      </lineSegments>

      {/* Axis lines */}
      <lineSegments geometry={axisGeometry}>
        <lineBasicMaterial color="#3e3a34" transparent opacity={0.4} />
      </lineSegments>

      {/* Origin dot */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#7a746a" />
      </mesh>

      {/* Axis number labels */}
      {labelIntegers.map((i) => (
        <group key={i}>
          {/* X-axis label — below axis */}
          <Text
            position={[i, -0.4, 0.01]}
            fontSize={0.5}
            color="#7a746a"
            anchorX="center"
            anchorY="top"
          >
            {String(i)}
          </Text>
          {/* Y-axis label — left of axis */}
          <Text
            position={[-0.4, i, 0.01]}
            fontSize={0.5}
            color="#7a746a"
            anchorX="right"
            anchorY="middle"
          >
            {String(i)}
          </Text>
        </group>
      ))}
    </group>
  )
}

// ─── Visualization (inner component, runs inside Canvas) ──────────────────────

function Visualization({ ghostOffset, onGhostMove }: RigidMotionsSceneProps) {
  return (
    <>
      <CameraSetup />
      <CoordinateGrid />
    </>
  )
}

// ─── Scene shell ─────────────────────────────────────────────────────────────

export function RigidMotionsScene({ ghostOffset, onGhostMove }: RigidMotionsSceneProps) {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ touchAction: 'none' }}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10] }}
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%', background: '#1e1d1c' }}
      >
        <Visualization ghostOffset={ghostOffset} onGhostMove={onGhostMove} />
      </Canvas>
    </div>
  )
}
