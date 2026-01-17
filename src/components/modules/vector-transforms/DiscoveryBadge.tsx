/* eslint-disable react-refresh/only-export-components */
/**
 * Vector Transformations Module - Discovery Badge Component
 *
 * Shows a badge when user discovers a transformation type through exploration.
 * Appears briefly then fades out.
 */

import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import type { TransformationType } from './utils'

/**
 * Badge display duration (ms)
 */
const BADGE_DURATION = 3000

/**
 * Label mapping for transformation types
 */
const BADGE_LABELS: Partial<Record<TransformationType, string>> = {
  scaling: 'Scaling',
  rotation: 'Rotation',
  reflection: 'Reflection',
}

interface DiscoveryBadgeProps {
  /** The transformation type discovered (null = no badge) */
  type: TransformationType | null
  /** Callback when badge is dismissed */
  onDismiss: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Discovery Badge Component
 *
 * Shows a pill-shaped badge with animation when user
 * creates a recognizable transformation type.
 *
 * Auto-dismisses after 3 seconds.
 */
export function DiscoveryBadge({
  type,
  onDismiss,
  className,
}: DiscoveryBadgeProps) {
  const badgeRef = useRef<HTMLDivElement>(null)

  // Auto-dismiss timer
  useEffect(() => {
    if (type) {
      const timer = setTimeout(onDismiss, BADGE_DURATION)
      return () => clearTimeout(timer)
    }
  }, [type, onDismiss])

  // Entrance animation
  useGSAP(
    () => {
      if (type && badgeRef.current) {
        gsap.fromTo(
          badgeRef.current,
          { opacity: 0, scale: 0.9, y: -10 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          }
        )
      }
    },
    { dependencies: [type], scope: badgeRef }
  )

  // Don't render if no type or type not in labels
  if (!type || !BADGE_LABELS[type]) return null

  return (
    <div
      ref={badgeRef}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-[var(--lab-accent)]/20 border border-[var(--lab-accent)]',
        'text-sm font-medium text-[var(--lab-accent)]',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden>✨</span>
      <span>You discovered: {BADGE_LABELS[type]}</span>
    </div>
  )
}

/**
 * Hook for managing discovery badge state
 */
export function useDiscoveryBadge() {
  const discoveredTypes = useRef<Set<TransformationType>>(new Set())
  const currentBadge = useRef<TransformationType | null>(null)

  /**
   * Check if a transformation type should trigger a badge
   * Returns the type to display, or null if already discovered
   */
  const checkDiscovery = (type: TransformationType): TransformationType | null => {
    // Skip identity and shearing (not pedagogically meaningful)
    if (type === 'identity' || type === 'shearing') {
      return null
    }

    // Skip if already discovered
    if (discoveredTypes.current.has(type)) {
      return null
    }

    // Mark as discovered and return type
    discoveredTypes.current.add(type)
    currentBadge.current = type
    return type
  }

  /**
   * Clear the current badge
   */
  const clearBadge = () => {
    currentBadge.current = null
  }

  /**
   * Get all discovered types
   */
  const getDiscovered = (): TransformationType[] => {
    return Array.from(discoveredTypes.current)
  }

  return {
    checkDiscovery,
    clearBadge,
    getDiscovered,
  }
}

export default DiscoveryBadge
