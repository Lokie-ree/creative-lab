// src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree, useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import {
  PRE_IMAGE_VERTICES,
  VERTEX_LABELS,
  GHOST_VERTEX_LABELS,
  GRID_RANGE,
  CONTENT_RANGE,
} from '../constants'
import { vertexLabelOffset, clampOffset } from './scene-math'
import { useRigidMotionsLayout } from './scene-layout'

interface RigidMotionsSceneProps {
  ghostOffset: [number, number]
  onGhostMove: (rawOffset: [number, number]) => void
}

// ─── SpriteLabel ──────────────────────────────────────────────────────────────
//
// Renders text as a CanvasTexture on a PlaneGeometry mesh.
// Avoids @react-three/drei Text (which uses troika-three-text and creates its
// own offscreen WebGL context). Multiple troika contexts + StrictMode double-
// mount exhaust the browser's WebGL context limit (~8 in Chromium), causing
// the main scene context to be lost immediately on load.

interface SpriteLabelProps {
  text: string
  position: [number, number, number]
  color?: string
  anchorX?: 'left' | 'center' | 'right'
  anchorY?: 'top' | 'middle' | 'bottom'
  /** World-unit width of the rendered plane */
  planeWidth?: number
}

function SpriteLabel({
  text,
  position,
  color = '#ffffff',
  anchorX = 'center',
  anchorY = 'middle',
  planeWidth = 1.5,
}: SpriteLabelProps) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const scale = 4 // supersampling for crisp text
    const pxFontSize = 32 * scale
    const font = `${pxFontSize}px ui-monospace, "Cascadia Code", "Fira Mono", monospace`

    const ctx = canvas.getContext('2d')!
    ctx.font = font
    const textWidth = ctx.measureText(text).width
    canvas.width = textWidth + 16 * scale
    canvas.height = pxFontSize + 12 * scale

    ctx.font = font
    ctx.fillStyle = color
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [text, color])

  const aspect = texture.image
    ? (texture.image as HTMLCanvasElement).width / (texture.image as HTMLCanvasElement).height
    : 1
  const planeHeight = planeWidth / aspect

  // Offset the mesh so the anchor point aligns with `position`
  const offsetX =
    anchorX === 'left' ? planeWidth / 2
    : anchorX === 'right' ? -planeWidth / 2
    : 0
  const offsetY =
    anchorY === 'top' ? -planeHeight / 2
    : anchorY === 'bottom' ? planeHeight / 2
    : 0

  return (
    <mesh position={[position[0] + offsetX, position[1] + offsetY, position[2]]}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.01} depthWrite={false} />
    </mesh>
  )
}

// ─── GL context recovery ──────────────────────────────────────────────────────

/**
 * Handles WebGL context loss caused by GPU resource pressure or window resize.
 * Prevents the default browser behavior (which would permanently lose the context)
 * and lets Three.js restore it automatically via webglcontextrestored.
 */
function ContextRecovery() {
  const { gl } = useThree()
  useEffect(() => {
    const canvas = gl.domElement

    const onLost = (e: WebGLContextEvent) => {
      e.preventDefault()
      // Three.js will automatically re-initialize when the context is restored
    }

    const onRestored = () => {
      // Force R3F to re-render after context restore
      gl.setSize(canvas.clientWidth, canvas.clientHeight)
    }

    canvas.addEventListener('webglcontextlost', onLost as EventListener)
    canvas.addEventListener('webglcontextrestored', onRestored)
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost as EventListener)
      canvas.removeEventListener('webglcontextrestored', onRestored)
    }
  }, [gl])
  return null
}

// ─── Camera setup ────────────────────────────────────────────────────────────

function CameraSetup() {
  const { camera } = useThree()
  const { zoom } = useRigidMotionsLayout()
  useFrame(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return
    if (Math.abs(camera.zoom - zoom) > 0.001) {
      camera.zoom = zoom
      camera.updateProjectionMatrix()
    }
  })
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
          <SpriteLabel
            text={String(i)}
            position={[i, -0.7, 0.01]}
            color="#7a746a"
            anchorX="center"
            anchorY="top"
            planeWidth={i < 0 ? 0.7 : 0.45}
          />
          {/* Y-axis label — left of axis */}
          <SpriteLabel
            text={String(i)}
            position={[-0.65, i, 0.01]}
            color="#7a746a"
            anchorX="right"
            anchorY="middle"
            planeWidth={i < 0 ? 0.7 : 0.45}
          />
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
  const { outlineGeometry, shape } = useMemo(() => {
    const pts = [...verts, verts[0]].map(([x, y]) => new THREE.Vector3(x, y, 0.02))
    return {
      outlineGeometry: new THREE.BufferGeometry().setFromPoints(pts),
      shape: makeTriangleShape(verts),
    }
  }, [])

  return (
    <group>
      {/* Fill */}
      <mesh position={[0, 0, 0.01]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#b8b0a4" transparent opacity={0.07} />
      </mesh>

      {/* Outline — lineLoop closes back to first point */}
      <lineLoop geometry={outlineGeometry}>
        <lineBasicMaterial color="#b8b0a4" />
      </lineLoop>

      {/* Vertex labels */}
      {verts.map((v, idx) => {
        const [lx, ly] = vertexLabelOffset(v, centroid, 0.5)
        return (
          <SpriteLabel
            key={VERTEX_LABELS[idx]}
            text={VERTEX_LABELS[idx]}
            position={[lx, ly, 0.03]}
            color="#b8b0a4"
            anchorX="center"
            anchorY="middle"
            planeWidth={0.55}
          />
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
  const lineLoopRef = useRef<THREE.LineLoop>(null)

  const { outlineGeometry, shape } = useMemo(() => {
    const pts = [...verts, verts[0]].map(([x, y]) => new THREE.Vector3(x, y, 0.02))
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    return { outlineGeometry: geo, shape: makeTriangleShape(verts) }
  }, [verts])

  // LineDashedMaterial requires line distances to be computed on the object
  useFrame(() => {
    if (lineLoopRef.current) lineLoopRef.current.computeLineDistances()
  })

  return (
    <group>
      {/* Fill */}
      <mesh position={[0, 0, 0.01]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#7cc87c" transparent opacity={0.12} />
      </mesh>

      {/* Dashed outline */}
      <lineLoop ref={lineLoopRef} geometry={outlineGeometry}>
        <lineDashedMaterial color="#7cc87c" dashSize={0.3} gapSize={0.18} />
      </lineLoop>

      {/* Vertex labels */}
      {verts.map((v, idx) => {
        const [lx, ly] = vertexLabelOffset(v, centroid, 0.5)
        return (
          <SpriteLabel
            key={GHOST_VERTEX_LABELS[idx]}
            text={GHOST_VERTEX_LABELS[idx]}
            position={[lx, ly, 0.03]}
            color="#7cc87c"
            anchorX="center"
            anchorY="middle"
            planeWidth={0.7}
          />
        )
      })}
    </group>
  )
}

// ─── Drag plane ───────────────────────────────────────────────────────────────

interface DragPlaneProps {
  ghostOffset: [number, number]
  onGhostMove: (rawOffset: [number, number]) => void
  onDragChange: (dragging: boolean) => void
}

function DragPlane({ ghostOffset, onGhostMove, onDragChange }: DragPlaneProps) {
  const { camera, gl } = useThree()
  const dragging = useRef(false)
  const dragStartWorld = useRef<[number, number]>([0, 0])
  const offsetAtDragStart = useRef<[number, number]>([0, 0])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])

  const getWorldPoint = useCallback(
    (clientX: number, clientY: number): [number, number] => {
      const rect = gl.domElement.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 2 - 1
      const y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
      const hit = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, hit)
      return [hit.x, hit.y]
    },
    [camera, gl, raycaster, plane]
  )

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      dragging.current = true
      dragStartWorld.current = getWorldPoint(e.nativeEvent.clientX, e.nativeEvent.clientY)
      offsetAtDragStart.current = ghostOffset
      onDragChange(true)

      const handleWindowMove = (ev: PointerEvent) => {
        if (!dragging.current) return
        const [wx, wy] = getWorldPoint(ev.clientX, ev.clientY)
        const rawOffset: [number, number] = [
          offsetAtDragStart.current[0] + wx - dragStartWorld.current[0],
          offsetAtDragStart.current[1] + wy - dragStartWorld.current[1],
        ]
        onGhostMove(clampOffset(rawOffset))
      }

      const handleWindowUp = () => {
        dragging.current = false
        onDragChange(false)
        window.removeEventListener('pointermove', handleWindowMove)
        window.removeEventListener('pointerup', handleWindowUp)
      }

      window.addEventListener('pointermove', handleWindowMove)
      window.addEventListener('pointerup', handleWindowUp)
    },
    [ghostOffset, getWorldPoint, onGhostMove, onDragChange]
  )

  return (
    <mesh position={[0, 0, -0.5]} onPointerDown={handlePointerDown}>
      <planeGeometry args={[GRID_RANGE * 2, GRID_RANGE * 2]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

// ─── Visualization (inner component, runs inside Canvas) ──────────────────────

interface VisualizationProps extends RigidMotionsSceneProps {
  onDragChange: (dragging: boolean) => void
}

function Visualization({ ghostOffset, onGhostMove, onDragChange }: VisualizationProps) {
  return (
    <>
      <ContextRecovery />
      <CameraSetup />
      <CoordinateGrid />
      <PreImageTriangle />
      <GhostTriangle ghostOffset={ghostOffset} />
      <DragPlane ghostOffset={ghostOffset} onGhostMove={onGhostMove} onDragChange={onDragChange} />
    </>
  )
}

// ─── Scene shell ─────────────────────────────────────────────────────────────

export function RigidMotionsScene({ ghostOffset, onGhostMove }: RigidMotionsSceneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [ready, setReady] = useState(false)

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 2, 10] }}
      dpr={[1, 1.5]}
      gl={{ powerPreference: 'high-performance', antialias: true }}
      style={{
        width: '100%',
        height: '100%',
        background: '#1e1d1c',
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        // Fade in after first render to eliminate flash-of-blank-canvas
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
      onCreated={() => {
        // Defer opacity reveal to next frame so the scene has painted once
        requestAnimationFrame(() => setReady(true))
      }}
    >
      <Visualization
        ghostOffset={ghostOffset}
        onGhostMove={onGhostMove}
        onDragChange={setIsDragging}
      />
    </Canvas>
  )
}
