// src/components/modules/pythagorean-theorem/scene/CameraSetup.tsx
//
// Orthographic camera frustum update via useFrame.
// Deadband prevents unnecessary updateProjectionMatrix calls each frame.
// Follows M1/M2 established pattern.

import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CameraSetupProps {
  worldSize: number
  centerX: number
  centerY: number
}

/* eslint-disable react-hooks/immutability -- Three.js camera is mutable by design */
export function CameraSetup({ worldSize, centerX, centerY }: CameraSetupProps) {
  const { camera, size } = useThree()

  useFrame(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return

    const scale = Math.min(size.width, size.height) / worldSize
    const worldW = size.width  / scale
    const worldH = size.height / scale
    const left   = centerX - worldW / 2
    const right  = centerX + worldW / 2
    const top    = centerY + worldH / 2
    const bottom = centerY - worldH / 2

    // Deadband: skip updateProjectionMatrix if nothing meaningful changed.
    // Threshold 0.01 world units avoids sub-pixel jitter.
    const changed =
      Math.abs(camera.left   - left)   > 0.01 ||
      Math.abs(camera.right  - right)  > 0.01 ||
      Math.abs(camera.top    - top)    > 0.01 ||
      Math.abs(camera.bottom - bottom) > 0.01

    if (changed) {
      camera.zoom   = 1
      camera.left   = left
      camera.right  = right
      camera.top    = top
      camera.bottom = bottom
      camera.updateProjectionMatrix()
    }
  })

  return null
}
/* eslint-enable react-hooks/immutability */
