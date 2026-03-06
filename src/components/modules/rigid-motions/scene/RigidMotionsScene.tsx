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
import { centroidOf, applySequence } from '../transform-math'
import { vertexLabelOffset, clampOffset, computeGhostVertices } from './scene-math'
import { SpriteLabel, makeTriangleShape } from './scene-primitives'
import { useRigidMotionsLayout } from './scene-layout'
import { TranslationVector } from './TranslationVector'
import { ReflectionAxisTicks } from './ReflectionAxisTicks'
import { RotationArcs } from './RotationArcs'
import { ImageShape } from './ImageShape'
import { GapLines } from './GapLines'
import { PreviewGhost } from './PreviewGhost'
import type { GuideState, FeedbackState, Round, ReflectionParams } from '../types'
import type { TransformationParams } from '@/lib/types/transforms'

export interface RigidMotionsSceneProps {
  ghostOffset: [number, number]
  onGhostMove: (rawOffset: [number, number]) => void
  // Phase 2
  guideState: GuideState
  feedbackState: FeedbackState
  currentRound: Round
  flipped: boolean
  rotationDegrees: 90 | 180 | 270
  rotationDirection: 'cw' | 'ccw'
  coordinatesActive: boolean
  onAnimationComplete: () => void
  capstoneSequence?: TransformationParams[]
  capstoneTargetVertices?: [number, number][]
  // Error recovery callbacks (for HTML overlay in parent)
  onContextLost?: () => void
  onContextRestored?: () => void
}

// ─── GL context recovery ──────────────────────────────────────────────────────

function ContextRecovery() {
  const { gl } = useThree()
  useEffect(() => {
    const canvas = gl.domElement
    const onLost = (e: WebGLContextEvent) => { e.preventDefault() }
    const onRestored = () => { gl.setSize(canvas.clientWidth, canvas.clientHeight) }
    // Orientation change: browser delays the resize event, so force a re-measure
    // one rAF later to catch the settled dimensions after the layout reflow.
    const onOrientationChange = () => {
      requestAnimationFrame(() => {
        gl.setSize(canvas.clientWidth, canvas.clientHeight, false)
      })
    }
    canvas.addEventListener('webglcontextlost', onLost as EventListener)
    canvas.addEventListener('webglcontextrestored', onRestored)
    window.addEventListener('orientationchange', onOrientationChange)
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost as EventListener)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      window.removeEventListener('orientationchange', onOrientationChange)
    }
  }, [gl])
  return null
}

// ─── Camera setup ─────────────────────────────────────────────────────────────

function CameraSetup() {
  const { camera, size } = useThree()
  const { zoom } = useRigidMotionsLayout()
  useFrame(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return
    const halfW = size.width / 2
    const halfH = size.height / 2
    const zoomChanged = Math.abs(camera.zoom - zoom) > 0.001
    const frustumChanged =
      Math.abs(camera.left + halfW) > 0.5 ||
      Math.abs(camera.right - halfW) > 0.5 ||
      Math.abs(camera.top - halfH) > 0.5 ||
      Math.abs(camera.bottom + halfH) > 0.5
    if (zoomChanged || frustumChanged) {
      camera.zoom = zoom
      camera.left = -halfW
      camera.right = halfW
      camera.top = halfH
      camera.bottom = -halfH
      camera.updateProjectionMatrix()
    }
  })
  return null
}

// ─── Coordinate grid ──────────────────────────────────────────────────────────

function CoordinateGrid({ coordinatesActive: _coordinatesActive }: { coordinatesActive: boolean }) {
  const { gridGeometry, axisGeometry } = useMemo(() => {
    const grid: THREE.Vector3[] = []
    const axes: THREE.Vector3[] = []
    for (let i = -GRID_RANGE; i <= GRID_RANGE; i++) {
      const isAxis = i === 0
      const target = isAxis ? axes : grid
      target.push(new THREE.Vector3(i, -GRID_RANGE, 0))
      target.push(new THREE.Vector3(i, GRID_RANGE, 0))
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
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial color="#28251f" transparent opacity={0.2} />
      </lineSegments>
      <lineSegments geometry={axisGeometry}>
        <lineBasicMaterial color="#3e3a34" transparent opacity={0.4} />
      </lineSegments>
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#7a746a" />
      </mesh>
      {labelIntegers.map((i) => (
        <group key={i}>
          <SpriteLabel
            text={String(i)}
            position={[i, -0.7, 0.01]}
            color="#7a746a"
            anchorX="center"
            anchorY="top"
            planeWidth={i < 0 ? 0.7 : 0.45}
          />
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

// ─── Pre-image triangle ───────────────────────────────────────────────────────

function PreImageTriangle({ coordinatesActive }: { coordinatesActive: boolean }) {
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
      <mesh position={[0, 0, 0.01]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#b8b0a4" transparent opacity={0.07} />
      </mesh>
      <lineLoop geometry={outlineGeometry}>
        <lineBasicMaterial color="#b8b0a4" />
      </lineLoop>
      {verts.map((v, idx) => {
        const [lx, ly] = vertexLabelOffset(v, centroid, 0.5)
        return (
          <SpriteLabel
            key={VERTEX_LABELS[idx]}
            text={coordinatesActive ? `${VERTEX_LABELS[idx]}(${v[0]},${v[1]})` : VERTEX_LABELS[idx]}
            position={[lx, ly, 0.03]}
            color="#b8b0a4"
            anchorX="center"
            anchorY="middle"
            planeWidth={coordinatesActive ? 1.6 : 0.55}
          />
        )
      })}
    </group>
  )
}

// ─── Ghost triangle ───────────────────────────────────────────────────────────

interface GhostTriangleProps {
  ghostOffset: [number, number]
  guideState: GuideState
  flipped: boolean
  rotationDegrees: 90 | 180 | 270
  rotationDirection: 'cw' | 'ccw'
  reflectionAxis?: 'x' | 'y'
  coordinatesActive: boolean
}

function GhostTriangle({
  ghostOffset,
  guideState,
  flipped,
  rotationDegrees,
  rotationDirection,
  reflectionAxis,
  coordinatesActive,
}: GhostTriangleProps) {
  const verts = useMemo<[number, number][]>(
    () => computeGhostVertices(ghostOffset, guideState, flipped, rotationDegrees, rotationDirection, reflectionAxis),
    [ghostOffset, guideState, flipped, rotationDegrees, rotationDirection, reflectionAxis]
  )
  const centroid = centroidOf(verts)
  const lineLoopRef = useRef<THREE.LineLoop>(null)

  const { outlineGeometry, shape } = useMemo(() => {
    const pts = [...verts, verts[0]].map(([x, y]) => new THREE.Vector3(x, y, 0.02))
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    return { outlineGeometry: geo, shape: makeTriangleShape(verts) }
  }, [verts])

  useFrame(() => {
    if (lineLoopRef.current) lineLoopRef.current.computeLineDistances()
  })

  return (
    <group>
      <mesh position={[0, 0, 0.01]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#7cc87c" transparent opacity={0.12} />
      </mesh>
      <lineLoop ref={lineLoopRef} geometry={outlineGeometry}>
        <lineDashedMaterial color="#7cc87c" dashSize={0.3} gapSize={0.18} />
      </lineLoop>
      {verts.map((v, idx) => {
        const [lx, ly] = vertexLabelOffset(v, centroid, 0.5)
        return (
          <SpriteLabel
            key={GHOST_VERTEX_LABELS[idx]}
            text={coordinatesActive ? `${GHOST_VERTEX_LABELS[idx]}(${v[0]},${v[1]})` : GHOST_VERTEX_LABELS[idx]}
            position={[lx, ly, 0.03]}
            color="#7cc87c"
            anchorX="center"
            anchorY="middle"
            planeWidth={coordinatesActive ? 1.6 : 0.7}
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

// ─── Capstone target triangle ─────────────────────────────────────────────────

interface CapstoneTargetProps {
  vertices: [number, number][]
  coordinatesActive: boolean
}

function CapstoneTarget({ vertices, coordinatesActive }: CapstoneTargetProps) {
  const centroid = centroidOf(vertices as [number, number][])
  const { outlineGeometry, shape } = useMemo(() => {
    const pts = [...vertices, vertices[0]].map(([x, y]) => new THREE.Vector3(x, y, 0.02))
    return {
      outlineGeometry: new THREE.BufferGeometry().setFromPoints(pts),
      shape: makeTriangleShape(vertices as [number, number][]),
    }
  }, [vertices])

  return (
    <group>
      <mesh position={[0, 0, 0.01]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#7cc87c" transparent opacity={0.18} />
      </mesh>
      <lineLoop geometry={outlineGeometry}>
        <lineBasicMaterial color="#7cc87c" />
      </lineLoop>
      {(vertices as [number, number][]).map((v, idx) => {
        const [lx, ly] = vertexLabelOffset(v, centroid, 0.5)
        const primeLabels = ['A\u2032', 'B\u2032', 'C\u2032'] as const
        return (
          <SpriteLabel
            key={`capstone-target-${idx}`}
            text={coordinatesActive ? `${primeLabels[idx]}(${v[0]},${v[1]})` : primeLabels[idx]}
            position={[lx, ly, 0.03]}
            color="#7cc87c"
            anchorX="center"
            anchorY="middle"
            planeWidth={coordinatesActive ? 1.6 : 0.7}
          />
        )
      })}
    </group>
  )
}

// ─── Visualization (inner component, runs inside Canvas) ──────────────────────

interface VisualizationProps extends RigidMotionsSceneProps {
  onDragChange: (dragging: boolean) => void
}

function Visualization({
  ghostOffset,
  onGhostMove,
  onDragChange,
  guideState,
  feedbackState,
  currentRound,
  flipped,
  rotationDegrees,
  rotationDirection,
  coordinatesActive,
  onAnimationComplete,
  capstoneSequence,
  capstoneTargetVertices,
}: VisualizationProps) {
  const reflectionAxis =
    currentRound.params.type === 'reflect'
      ? (currentRound.params as ReflectionParams).axis
      : undefined

  const ghostVerts = computeGhostVertices(
    ghostOffset, guideState, flipped, rotationDegrees, rotationDirection, reflectionAxis
  )
  const preImageCentroid = centroidOf(PRE_IMAGE_VERTICES)
  const ghostCentroid = centroidOf(ghostVerts)

  const showGhost = feedbackState !== 'match' && guideState !== 'coordinate-reveal' && guideState !== 'capstone'
  const showImage = feedbackState === 'match'
  const showGapLines = feedbackState === 'miss' && guideState !== 'capstone'
  const showTranslationVector = guideState === 'predict-translate'
  const showPreviewGhost = guideState === 'capstone' && (capstoneSequence?.length ?? 0) > 0
  const showCapstoneTarget = guideState === 'capstone' && capstoneTargetVertices != null
  const showAxisTicks = guideState === 'predict-reflect' && reflectionAxis != null
  const showRotationArcs = guideState === 'predict-rotate' || guideState === 'predict-with-coordinates-rotate'

  return (
    <>
      <ContextRecovery />
      <CameraSetup />
      <CoordinateGrid coordinatesActive={coordinatesActive} />
      <PreImageTriangle coordinatesActive={coordinatesActive} />

      {showGhost && (
        <GhostTriangle
          ghostOffset={ghostOffset}
          guideState={guideState}
          flipped={flipped}
          rotationDegrees={rotationDegrees}
          rotationDirection={rotationDirection}
          reflectionAxis={reflectionAxis}
          coordinatesActive={coordinatesActive}
        />
      )}

      {showImage && (
        <ImageShape
          vertices={currentRound.targetVertices}
          coordinatesActive={coordinatesActive}
          animateFrom={PRE_IMAGE_VERTICES as [number, number][]}
          type={currentRound.params.type}
          params={currentRound.params}
          onAnimationComplete={onAnimationComplete}
        />
      )}

      {showCapstoneTarget && capstoneTargetVertices && (
        <CapstoneTarget vertices={capstoneTargetVertices} coordinatesActive={coordinatesActive} />
      )}

      {showPreviewGhost && capstoneSequence && (
        <PreviewGhost sequence={capstoneSequence} coordinatesActive={coordinatesActive} />
      )}

      {showGapLines && (
        <GapLines
          ghostVertices={ghostVerts}
          targetVertices={currentRound.targetVertices}
        />
      )}

      {guideState === 'capstone' && feedbackState === 'miss' && capstoneSequence && capstoneSequence.length > 0 && capstoneTargetVertices && (
        <GapLines
          ghostVertices={applySequence(PRE_IMAGE_VERTICES as [number, number][], capstoneSequence)}
          targetVertices={capstoneTargetVertices}
        />
      )}

      {showTranslationVector && (
        <TranslationVector
          preImageCentroid={preImageCentroid}
          ghostCentroid={ghostCentroid}
          visible
        />
      )}

      {showAxisTicks && reflectionAxis && (
        <ReflectionAxisTicks
          axis={reflectionAxis}
          preImageVertices={PRE_IMAGE_VERTICES as [number, number][]}
          ghostVertices={ghostVerts}
          visible
        />
      )}

      {showRotationArcs && (
        <RotationArcs
          preImageVertices={PRE_IMAGE_VERTICES as [number, number][]}
          degrees={rotationDegrees}
          direction={rotationDirection}
          visible
        />
      )}

      {guideState !== 'capstone' && guideState !== 'coordinate-reveal' && (
        <DragPlane
          ghostOffset={ghostOffset}
          onGhostMove={onGhostMove}
          onDragChange={onDragChange}
        />
      )}
    </>
  )
}

// ─── Scene shell ──────────────────────────────────────────────────────────────

export function RigidMotionsScene(props: RigidMotionsSceneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [ready, setReady] = useState(false)

  // Use refs so callbacks don't need to be in onCreated's dependency closure
  const onContextLostRef = useRef(props.onContextLost)
  const onContextRestoredRef = useRef(props.onContextRestored)
  useEffect(() => {
    onContextLostRef.current = props.onContextLost
    onContextRestoredRef.current = props.onContextRestored
  }, [props.onContextLost, props.onContextRestored])

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10] }}
      dpr={[1, 1.5]}
      gl={{ powerPreference: 'high-performance', antialias: true }}
      style={{
        width: '100%',
        height: '100%',
        background: '#1e1d1c',
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
      onCreated={({ gl }) => {
        requestAnimationFrame(() => setReady(true))
        // Notify parent HTML layer on context events so it can show a recovery overlay.
        // ContextRecovery (inside Visualization) handles the GL-level restore;
        // these callbacks update React state for the overlay UI.
        gl.domElement.addEventListener('webglcontextlost', () => {
          onContextLostRef.current?.()
        })
        gl.domElement.addEventListener('webglcontextrestored', () => {
          onContextRestoredRef.current?.()
        })
      }}
    >
      <Visualization
        {...props}
        onDragChange={setIsDragging}
      />
    </Canvas>
  )
}
