// src/lib/animation/presets.ts
import gsap from 'gsap'
import { duration, easing, stagger } from './tokens'

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Convert ms to seconds for GSAP
 */
const toSeconds = (ms: number) => ms / 1000

/**
 * Fade in a readout panel (prompt or formula)
 */
export function fadeInReadout(
  element: gsap.TweenTarget,
  options?: { delay?: number; onComplete?: () => void }
) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 1, y: 0 })
    options?.onComplete?.()
    return
  }

  return gsap.fromTo(
    element,
    { opacity: 0, y: -8 },
    {
      opacity: 1,
      y: 0,
      duration: toSeconds(duration.normal),
      ease: easing.out,
      delay: options?.delay ? toSeconds(options.delay) : 0,
      onComplete: options?.onComplete,
    }
  )
}

/**
 * Fade out a readout panel
 */
export function fadeOutReadout(
  element: gsap.TweenTarget,
  options?: { onComplete?: () => void }
) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 0 })
    options?.onComplete?.()
    return
  }

  return gsap.to(element, {
    opacity: 0,
    y: -8,
    duration: toSeconds(duration.fast),
    ease: easing.inOut,
    onComplete: options?.onComplete,
  })
}

/**
 * Success pulse animation for match threshold
 */
export function pulseSuccess(
  element: gsap.TweenTarget,
  options?: { onComplete?: () => void }
) {
  if (prefersReducedMotion()) {
    options?.onComplete?.()
    return
  }

  const tl = gsap.timeline({ onComplete: options?.onComplete })
  tl.to(element, {
    scale: 1.02,
    filter: 'brightness(1.2)',
    duration: toSeconds(duration.normal),
    ease: easing.out,
  }).to(element, {
    scale: 1,
    filter: 'brightness(1)',
    duration: toSeconds(duration.normal),
    ease: easing.inOut,
  })

  return tl
}

/**
 * Staged reveal - sequential fade-in of multiple elements
 * Used for post-match celebration sequence
 */
export function stagedReveal(
  elements: gsap.TweenTarget[],
  options?: { onComplete?: () => void }
) {
  if (prefersReducedMotion()) {
    elements.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }))
    options?.onComplete?.()
    return
  }

  const tl = gsap.timeline({ onComplete: options?.onComplete })

  elements.forEach((element, index) => {
    tl.fromTo(
      element,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: toSeconds(duration.normal),
        ease: easing.out,
      },
      index * toSeconds(stagger.normal)
    )
  })

  return tl
}

/**
 * Stage transition - coordinated exit and entrance
 */
export function stageTransition(
  exitElements: gsap.TweenTarget[],
  enterElements: gsap.TweenTarget[],
  options?: { onComplete?: () => void }
) {
  if (prefersReducedMotion()) {
    exitElements.forEach((el) => gsap.set(el, { opacity: 0 }))
    enterElements.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }))
    options?.onComplete?.()
    return
  }

  const tl = gsap.timeline({ onComplete: options?.onComplete })

  // Exit all elements in parallel
  exitElements.forEach((element) => {
    tl.to(
      element,
      {
        opacity: 0,
        duration: toSeconds(duration.fast),
        ease: easing.inOut,
      },
      0
    )
  })

  // Brief hold
  tl.addLabel('enter', `+=${toSeconds(stagger.tight)}`)

  // Enter elements with stagger
  enterElements.forEach((element, index) => {
    tl.fromTo(
      element,
      { opacity: 0, y: -8 },
      {
        opacity: 1,
        y: 0,
        duration: toSeconds(duration.normal),
        ease: easing.out,
      },
      `enter+=${index * toSeconds(stagger.normal)}`
    )
  })

  return tl
}
