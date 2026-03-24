// src/components/modules/dilations/DilationsCanvas.tsx
import { useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// World range: x ∈ [-2, 14], y ∈ [-2, 14] — accommodates k=3 dilation of canonical triangle
const WORLD_MIN = -2
const WORLD_MAX = 14
const WORLD_SIZE = WORLD_MAX - WORLD_MIN  // 16
const WORLD_CENTER_X = (WORLD_MIN + WORLD_MAX) / 2  // 6
const WORLD_CENTER_Y = (WORLD_MIN + WORLD_MAX) / 2  // 6

function CameraSetup() {
  const { camera, size } = useThree()
  useFrame(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return
    const zoom = Math.min(size.width, size.height) / WORLD_SIZE
    const halfW = size.width / 2 / zoom
    const halfH = size.height / 2 / zoom
    const changed =
      Math.abs(camera.zoom - zoom) > 0.001 ||
      Math.abs(camera.left - (WORLD_CENTER_X - halfW)) > 0.01
    if (changed) {
      camera.zoom = zoom
      camera.left = WORLD_CENTER_X - halfW
      camera.right = WORLD_CENTER_X + halfW
      camera.top = WORLD_CENTER_Y + halfH
      camera.bottom = WORLD_CENTER_Y - halfH
      camera.updateProjectionMatrix()
    }
  })
  return null
}

function CoordinateGrid() {
  const { gridGeometry, axisGeometry } = useMemo(() => {
    const gridPts: THREE.Vector3[] = []
    const axisPts: THREE.Vector3[] = []
    for (let i = WORLD_MIN; i <= WORLD_MAX; i++) {
      const isAxis = i === 0
      const target = isAxis ? axisPts : gridPts
      target.push(new THREE.Vector3(i, WORLD_MIN, 0), new THREE.Vector3(i, WORLD_MAX, 0))
      target.push(new THREE.Vector3(WORLD_MIN, i, 0), new THREE.Vector3(WORLD_MAX, i, 0))
    }
    return {
      gridGeometry: new THREE.BufferGeometry().setFromPoints(gridPts),
      axisGeometry: new THREE.BufferGeometry().setFromPoints(axisPts),
    }
  }, [])

  return (
    <group>
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial color="#28251f" transparent opacity={0.35} />
      </lineSegments>
      <lineSegments geometry={axisGeometry}>
        <lineBasicMaterial color="#3e3a34" transparent opacity={0.55} />
      </lineSegments>
      {/* Origin marker */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#7cc87c" />
      </mesh>
    </group>
  )
}


export interface DilationsCanvasProps {
  coordinatesVisible: boolean
  angleLabelsVisible: boolean
  children?: React.ReactNode
}

export function DilationsCanvas({ children, coordinatesVisible: _coordinatesVisible, angleLabelsVisible: _angleLabelsVisible }: DilationsCanvasProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10] }}
      dpr={[1, 1.5]}
      gl={{ powerPreference: 'high-performance', antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <CameraSetup />
      <CoordinateGrid />
      {children}
    </Canvas>
  )
}
