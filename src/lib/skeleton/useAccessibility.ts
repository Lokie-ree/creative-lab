import { useCallback, useEffect, useRef } from 'react'

interface UseAccessibilityReturn {
  // Announcements
  announce: (message: string, priority?: 'polite' | 'assertive') => void

  // Focus management
  focusElement: (selector: string) => void
  trapFocus: (containerRef: React.RefObject<HTMLElement | null>) => () => void

  // Preferences
  prefersReducedMotion: boolean
  prefersHighContrast: boolean

  // Keyboard helpers
  handleArrowKeys: (
    onLeft: () => void,
    onRight: () => void,
    onUp?: () => void,
    onDown?: () => void
  ) => (e: KeyboardEvent) => void
}

export function useAccessibility(): UseAccessibilityReturn {
  const announcerRef = useRef<HTMLDivElement | null>(null)

  // Create or get announcer element
  useEffect(() => {
    let announcer = document.getElementById('skeleton-announcer') as HTMLDivElement
    if (!announcer) {
      announcer = document.createElement('div')
      announcer.id = 'skeleton-announcer'
      announcer.setAttribute('role', 'status')
      announcer.setAttribute('aria-live', 'polite')
      announcer.setAttribute('aria-atomic', 'true')
      announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `
      document.body.appendChild(announcer)
    }
    announcerRef.current = announcer

    return () => {
      // Don't remove - might be used by other modules
    }
  }, [])

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return

    announcerRef.current.setAttribute('aria-live', priority)
    // Clear and set to trigger announcement
    announcerRef.current.textContent = ''
    requestAnimationFrame(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message
      }
    })
  }, [])

  const focusElement = useCallback((selector: string) => {
    // Delay to allow React to render
    requestAnimationFrame(() => {
      const element = document.querySelector(selector) as HTMLElement
      if (element) {
        element.focus()
      }
    })
  }, [])

  const trapFocus = useCallback((containerRef: React.RefObject<HTMLElement | null>) => {
    const container = containerRef.current
    if (!container) return () => {}

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Media query preferences
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  const prefersHighContrast = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-contrast: more)').matches
    : false

  const handleArrowKeys = useCallback((
    onLeft: () => void,
    onRight: () => void,
    onUp?: () => void,
    onDown?: () => void
  ) => {
    return (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          onLeft()
          break
        case 'ArrowRight':
          e.preventDefault()
          onRight()
          break
        case 'ArrowUp':
          if (onUp) {
            e.preventDefault()
            onUp()
          }
          break
        case 'ArrowDown':
          if (onDown) {
            e.preventDefault()
            onDown()
          }
          break
      }
    }
  }, [])

  return {
    announce,
    focusElement,
    trapFocus,
    prefersReducedMotion,
    prefersHighContrast,
    handleArrowKeys,
  }
}
