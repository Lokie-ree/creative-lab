import { useRef, useMemo, useImperativeHandle, forwardRef, useState, useCallback } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Line } from "@react-three/drei"
import * as THREE from "three"
import { generateCirclePoints } from "@/lib/utils"
import { colors } from "@/lib/colors"

interface UnitCircleProps {
  amplitude: number
  frequency: number
  phase: number
  color?: string
  opacity?: number
  isPaused?: boolean
  onPauseChange?: (paused: boolean) => void
  draggable?: boolean
  glowIntensity?: number  // 0-1, controls glow brightness
}

export interface UnitCircleRef {
  getCurrentPosition: () => { x: number; y: number }
}

export const UnitCircle = forwardRef<UnitCircleRef, UnitCircleProps>(
  function UnitCircle({
    frequency,
    phase,
    color = colors.accent.primary,
    opacity = 1,
    isPaused = false,
    onPauseChange,
    draggable = false,
    glowIntensity = 0,
  }, ref) {
    const groupRef = useRef<THREE.Group>(null)
    const pointRef = useRef<THREE.Mesh>(null)
    const currentPosRef = useRef({ x: 1, y: 0 })
    const currentAngleRef = useRef(phase)
    const pausedAtTimeRef = useRef<number | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const { camera, gl } = useThree()
    const raycaster = useMemo(() => new THREE.Raycaster(), [])
    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])

    const circlePoints = useMemo(() => generateCirclePoints(64), [])

    // Expose current position for connector
    useImperativeHandle(ref, () => ({
      getCurrentPosition: () => currentPosRef.current,
    }))

    const radiusLine = useMemo(() => {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array([0, 0, 0, 1, 0, 0])
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      const material = new THREE.LineBasicMaterial({
        color,
        transparent: opacity < 1,
        opacity,
      })
      return new THREE.Line(geometry, material)
    }, [color, opacity])

    // Update position based on angle
    const updatePosition = useCallback((angle: number) => {
      const x = Math.cos(angle)
      const y = Math.sin(angle)
      currentPosRef.current = { x, y }
      currentAngleRef.current = angle

      if (pointRef.current) {
        pointRef.current.position.x = x
        pointRef.current.position.y = y
      }

      const positions = radiusLine.geometry.attributes.position as THREE.BufferAttribute
      positions.setXYZ(1, x, y, 0)
      positions.needsUpdate = true
    }, [radiusLine])

    useFrame((state) => {
      // If paused or dragging, don't update from clock
      if (isPaused || isDragging) {
        // Store pause time if we just paused
        if (pausedAtTimeRef.current === null) {
          pausedAtTimeRef.current = state.clock.elapsedTime
        }
        return
      }

      // If we just resumed, adjust our phase to continue from where we paused
      if (pausedAtTimeRef.current !== null) {
        pausedAtTimeRef.current = null
      }

      const t = state.clock.elapsedTime
      const angle = frequency * t + phase
      updatePosition(angle)
    })

    // Convert screen coordinates to angle on circle
    const getAngleFromPointer = useCallback((clientX: number, clientY: number): number => {
      if (!groupRef.current) return 0

      // Get normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 2 - 1
      const y = -((clientY - rect.top) / rect.height) * 2 + 1

      // Raycast to the z=0 plane
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, intersection)

      // Get the group's world position to offset
      const groupWorldPos = new THREE.Vector3()
      groupRef.current.getWorldPosition(groupWorldPos)

      // Calculate angle relative to group center
      const localX = intersection.x - groupWorldPos.x
      const localY = intersection.y - groupWorldPos.y
      return Math.atan2(localY, localX)
    }, [camera, gl, raycaster, plane])

    // Drag handlers
    const handlePointerDown = useCallback(() => {
      if (!draggable) return
      setIsDragging(true)
      onPauseChange?.(true)

      // Add window-level listeners for smooth dragging
      const handleWindowMove = (e: PointerEvent) => {
        const angle = getAngleFromPointer(e.clientX, e.clientY)
        updatePosition(angle)
      }

      const handleWindowUp = () => {
        setIsDragging(false)
        onPauseChange?.(false)
        window.removeEventListener('pointermove', handleWindowMove)
        window.removeEventListener('pointerup', handleWindowUp)
      }

      window.addEventListener('pointermove', handleWindowMove)
      window.addEventListener('pointerup', handleWindowUp)
    }, [draggable, onPauseChange, getAngleFromPointer, updatePosition])

    return (
      <group ref={groupRef}>
        {/* Circle outline */}
        <Line points={circlePoints} color={colors.text.muted} lineWidth={1.5} />

        {/* Radius line from center to point */}
        <primitive object={radiusLine} />

        {/* Moving point on circle - draggable */}
        <mesh
          ref={pointRef}
          position={[1, 0, 0]}
          onPointerDown={handlePointerDown}
        >
          <circleGeometry args={[draggable ? 0.12 : 0.08, 32]} />
          <meshBasicMaterial
            color={isDragging ? colors.accent.primaryHover : color}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>

        {/* Invisible larger hit area for easier dragging */}
        {draggable && (
          <mesh
            position={[currentPosRef.current.x, currentPosRef.current.y, -0.01]}
            onPointerDown={handlePointerDown}
          >
            <circleGeometry args={[0.3, 32]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}

        {/* Center dot */}
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[0.03, 16]} />
          <meshBasicMaterial color={colors.text.muted} />
        </mesh>

        {/* Dynamic glow based on match proximity */}
        {glowIntensity > 0 && !isDragging && (
          <mesh position={[currentPosRef.current.x, currentPosRef.current.y, -0.02]}>
            <circleGeometry args={[0.12 + glowIntensity * 0.15, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.2 + glowIntensity * 0.4}
            />
          </mesh>
        )}

        {/* Outer glow ring for high intensity */}
        {glowIntensity > 0.7 && !isDragging && (
          <mesh position={[currentPosRef.current.x, currentPosRef.current.y, -0.03]}>
            <circleGeometry args={[0.25 + glowIntensity * 0.1, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={(glowIntensity - 0.7) * 0.5}
            />
          </mesh>
        )}

        {/* Draggable hint glow (separate from match glow) */}
        {draggable && !isDragging && glowIntensity === 0 && (
          <mesh position={[currentPosRef.current.x, currentPosRef.current.y, -0.02]}>
            <circleGeometry args={[0.18, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} />
          </mesh>
        )}
      </group>
    )
  }
)
