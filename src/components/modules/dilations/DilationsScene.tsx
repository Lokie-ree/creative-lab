// src/components/modules/dilations/DilationsScene.tsx
import { useEffect, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SpriteLabel } from './components/SpriteLabel'
import { DilationsSceneCtx } from './DilationsSceneContext'

// Grid lines draw beyond visible range so portrait viewports have no blank margins.
// Three.js clips at the camera frustum — no extra draw cost beyond geometry setup (done once).
const GRID_DRAW_MIN = -20
const GRID_DRAW_MAX = 30

/* eslint-disable react-hooks/immutability -- Three.js camera is mutable by design */
function CameraSetup({ worldSize }: { worldSize: number }) {
  const { camera, size } = useThree()
  // center: (5,5) for worldSize=20 [-5,15], (6,6) for worldSize=16 [-2,14]
  const worldCenter = worldSize === 20 ? 5 : 6
  useFrame(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return
    const scale = Math.min(size.width, size.height) / worldSize
    const worldW = size.width / scale
    const worldH = size.height / scale
    const left   = worldCenter - worldW / 2
    const right  = worldCenter + worldW / 2
    const top    = worldCenter + worldH / 2
    const bottom = worldCenter - worldH / 2
    const changed =
      Math.abs(camera.left - left) > 0.01 ||
      Math.abs(camera.right - right) > 0.01 ||
      Math.abs(camera.top - top) > 0.01 ||
      Math.abs(camera.bottom - bottom) > 0.01
    if (changed) {
      camera.zoom = 1
      camera.left = left; camera.right = right
      camera.top = top; camera.bottom = bottom
      camera.updateProjectionMatrix()
    }
  })
  return null
}
/* eslint-enable react-hooks/immutability */

function CoordinateGrid() {
  const { gridGeometry, axisGeometry } = useMemo(() => {
    const gridPts: THREE.Vector3[] = []
    const axisPts: THREE.Vector3[] = []
    for (let i = GRID_DRAW_MIN; i <= GRID_DRAW_MAX; i++) {
      const isAxis = i === 0
      const target = isAxis ? axisPts : gridPts
      target.push(new THREE.Vector3(i, GRID_DRAW_MIN, 0), new THREE.Vector3(i, GRID_DRAW_MAX, 0))
      target.push(new THREE.Vector3(GRID_DRAW_MIN, i, 0), new THREE.Vector3(GRID_DRAW_MAX, i, 0))
    }
    return {
      gridGeometry: new THREE.BufferGeometry().setFromPoints(gridPts),
      axisGeometry: new THREE.BufferGeometry().setFromPoints(axisPts),
      // circleGeometry omitted — inline JSX <circleGeometry> on origin marker is managed by Three.js
    }
  }, [])

  useEffect(() => {
    return () => {
      gridGeometry.dispose()
      axisGeometry.dispose()
    }
  }, [gridGeometry, axisGeometry])

  return (
    <group>
      {/* Grid lines: slightly darker than --lab-bg (#1e1d1c), intentionally subtle */}
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial color="#28251f" transparent opacity={0.35} />
      </lineSegments>
      {/* Axis lines: matches --lab-border equivalent */}
      <lineSegments geometry={axisGeometry}>
        <lineBasicMaterial color="#3e3a34" transparent opacity={0.55} />
      </lineSegments>
      {/* Origin marker: --lab-accent (#7cc87c) */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#7cc87c" />
      </mesh>
    </group>
  )
}

function AxisLabels({ integers }: { integers: readonly number[] }) {
  return (
    <>
      {integers.map(n => (
        <SpriteLabel key={`x-${n}`} text={String(n)} position={{ x: n, y: -0.6 }} zLayer={0.05} color="#7a746a" planeWidth={n < 0 ? 0.7 : 0.55} />
      ))}
      {integers.map(n => (
        <SpriteLabel key={`y-${n}`} text={String(n)} position={{ x: -0.6, y: n }} zLayer={0.05} color="#7a746a" planeWidth={n < 0 ? 0.7 : 0.55} />
      ))}
      <SpriteLabel text="0" position={{ x: -0.5, y: -0.5 }} zLayer={0.05} color="#7a746a" planeWidth={0.45} />
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
  worldSize?: number    // defaults to 16
  children?: React.ReactNode
  onContextLost?: () => void
  onContextRestored?: () => void
}

export function DilationsScene({
  children,
  coordinatesVisible,
  angleLabelsVisible,
  worldSize,
  onContextLost,
  onContextRestored,
}: DilationsSceneProps) {
  const ws = worldSize ?? 16
  const axisIntegers: readonly number[] = ws === 20
    ? [-4, -2, 0, 2, 4, 6, 8, 10, 12, 14]
    : [2, 4, 6, 8, 10, 12]

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10] }}
      dpr={[1, 1.5]}
      gl={{ powerPreference: 'high-performance', antialias: true }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <DilationsSceneCtx.Provider value={{ coordinatesVisible, angleLabelsVisible }}>
        <ContextRecovery onContextLost={onContextLost} onContextRestored={onContextRestored} />
        <CameraSetup worldSize={ws} />
        <CoordinateGrid />
        <AxisLabels integers={axisIntegers} />
        {children}
      </DilationsSceneCtx.Provider>
    </Canvas>
  )
}
