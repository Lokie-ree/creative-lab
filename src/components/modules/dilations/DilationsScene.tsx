// src/components/modules/dilations/DilationsScene.tsx
import { useEffect, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SpriteLabel } from './components/SpriteLabel'

// World range: x ∈ [-2, 14], y ∈ [-2, 14] — accommodates k=3 dilation of canonical triangle
const WORLD_MIN = -2
const WORLD_MAX = 14
const WORLD_SIZE = WORLD_MAX - WORLD_MIN  // 16
const WORLD_CENTER_X = 4
const WORLD_CENTER_Y = 4

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
  const { gridGeometry, axisGeometry, circleGeometry } = useMemo(() => {
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
      circleGeometry: new THREE.CircleGeometry(0.12, 16),
    }
  }, [])

  useEffect(() => {
    return () => {
      gridGeometry.dispose()
      axisGeometry.dispose()
      circleGeometry.dispose()
    }
  }, [gridGeometry, axisGeometry, circleGeometry])

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

const AXIS_LABEL_INTEGERS = [2, 4, 6, 8, 10, 12]

function AxisLabels() {
  return (
    <>
      {AXIS_LABEL_INTEGERS.map(n => (
        <SpriteLabel
          key={`x-${n}`}
          text={String(n)}
          position={{ x: n, y: -0.6 }}
          zLayer={0.05}
          color="#7a746a"
          planeWidth={0.55}
        />
      ))}
      {AXIS_LABEL_INTEGERS.map(n => (
        <SpriteLabel
          key={`y-${n}`}
          text={String(n)}
          position={{ x: -0.6, y: n }}
          zLayer={0.05}
          color="#7a746a"
          planeWidth={0.55}
        />
      ))}
      <SpriteLabel
        text="0"
        position={{ x: -0.5, y: -0.5 }}
        zLayer={0.05}
        color="#7a746a"
        planeWidth={0.45}
      />
    </>
  )
}

function ContextRecovery({
  onContextLost,
  onContextRestored,
}: {
  onContextLost?: () => void
  onContextRestored?: () => void
}) {
  const { gl } = useThree()
  useEffect(() => {
    const canvas = gl.domElement
    const onLost = (e: Event) => {
      ;(e as WebGLContextEvent).preventDefault()
      onContextLost?.()
    }
    const onRestored = () => {
      gl.setSize(canvas.clientWidth, canvas.clientHeight)
      onContextRestored?.()
    }
    const onOrientationChange = () => {
      requestAnimationFrame(() => {
        gl.setSize(canvas.clientWidth, canvas.clientHeight, false)
      })
    }
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    window.addEventListener('orientationchange', onOrientationChange)
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      window.removeEventListener('orientationchange', onOrientationChange)
    }
  }, [gl, onContextLost, onContextRestored])
  return null
}

export interface DilationsSceneProps {
  coordinatesVisible: boolean
  angleLabelsVisible: boolean
  children?: React.ReactNode
  onContextLost?: () => void
  onContextRestored?: () => void
}

export function DilationsScene({
  children,
  coordinatesVisible: _coordinatesVisible,
  angleLabelsVisible: _angleLabelsVisible,
  onContextLost,
  onContextRestored,
}: DilationsSceneProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10] }}
      dpr={[1, 1.5]}
      gl={{ powerPreference: 'high-performance', antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ContextRecovery onContextLost={onContextLost} onContextRestored={onContextRestored} />
      <CameraSetup />
      <CoordinateGrid />
      <AxisLabels />
      {children}
    </Canvas>
  )
}
