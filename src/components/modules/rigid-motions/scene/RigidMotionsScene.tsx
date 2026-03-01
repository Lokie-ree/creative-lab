// src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx
import { useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Text, Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  PRE_IMAGE_VERTICES,
  VERTEX_LABELS,
  GHOST_VERTEX_LABELS,
  GRID_RANGE,
  CONTENT_RANGE,
} from '../constants'
import { vertexLabelOffset } from './scene-math'

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

// ─── PreImageTriangle helpers ─────────────────────────────────────────────────

/** Build a THREE.Shape from an array of [x, y] vertices */
function makeTriangleShape(verts: readonly [number, number][]): THREE.Shape {
  const shape = new THREE.Shape()
  shape.moveTo(verts[0][0], verts[0][1])
  for (let i = 1; i < verts.length; i++) shape.lineTo(verts[i][0], verts[i][1])
  shape.closePath()
  return shape
}

/** Math centroid of an array of [x, y] vertices */
function centroidOf(verts: readonly [number, number][]): [number, number] {
  const cx = verts.reduce((s, [x]) => s + x, 0) / verts.length
  const cy = verts.reduce((s, [, y]) => s + y, 0) / verts.length
  return [cx, cy]
}

// ─── Pre-image triangle ───────────────────────────────────────────────────────

function PreImageTriangle() {
  const verts = PRE_IMAGE_VERTICES
  const centroid = centroidOf(verts)
  const linePoints = verts.map(([x, y]) => new THREE.Vector3(x, y, 0.02))
  const shape = useMemo(() => makeTriangleShape(verts), [])

  return (
    <group>
      {/* Fill */}
      <mesh position={[0, 0, 0.01]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#b8b0a4" transparent opacity={0.07} />
      </mesh>

      {/* Outline */}
      <Line
        points={linePoints}
        closed
        color="#b8b0a4"
        lineWidth={1.5}
      />

      {/* Vertex labels */}
      {verts.map((v, idx) => {
        const [lx, ly] = vertexLabelOffset(v, centroid, 0.5)
        return (
          <Text
            key={VERTEX_LABELS[idx]}
            position={[lx, ly, 0.03]}
            fontSize={0.55}
            color="#b8b0a4"
            anchorX="center"
            anchorY="middle"
          >
            {VERTEX_LABELS[idx]}
          </Text>
        )
      })}
    </group>
  )
}

// ─── Ghost triangle ───────────────────────────────────────────────────────────

interface GhostTriangleProps {
  ghostOffset: [number, number]
}

function GhostTriangle({ ghostOffset }: GhostTriangleProps) {
  const verts = useMemo<[number, number][]>(
    () => PRE_IMAGE_VERTICES.map(([x, y]) => [x + ghostOffset[0], y + ghostOffset[1]]),
    [ghostOffset]
  )
  const centroid = centroidOf(verts)
  const linePoints = verts.map(([x, y]) => new THREE.Vector3(x, y, 0.02))
  const shape = useMemo(() => makeTriangleShape(verts), [verts])

  return (
    <group>
      {/* Fill */}
      <mesh position={[0, 0, 0.01]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#7cc87c" transparent opacity={0.12} />
      </mesh>

      {/* Dashed outline */}
      <Line
        points={linePoints}
        closed
        color="#7cc87c"
        lineWidth={1.5}
        dashed
        dashSize={0.3}
        gapSize={0.18}
      />

      {/* Vertex labels */}
      {verts.map((v, idx) => {
        const [lx, ly] = vertexLabelOffset(v, centroid, 0.5)
        return (
          <Text
            key={GHOST_VERTEX_LABELS[idx]}
            position={[lx, ly, 0.03]}
            fontSize={0.55}
            color="#7cc87c"
            anchorX="center"
            anchorY="middle"
          >
            {GHOST_VERTEX_LABELS[idx]}
          </Text>
        )
      })}
    </group>
  )
}

// ─── Visualization (inner component, runs inside Canvas) ──────────────────────

function Visualization({ ghostOffset, onGhostMove }: RigidMotionsSceneProps) {
  return (
    <>
      <CameraSetup />
      <CoordinateGrid />
      <PreImageTriangle />
      <GhostTriangle ghostOffset={ghostOffset} />
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
