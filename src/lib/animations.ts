import gsap from "gsap"

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Standard animation configuration
 * Duration: 0.4s (matches AnimatedPanel)
 * Easing: power2.out (consistent with existing code)
 */
const STANDARD_CONFIG = {
  duration: 0.4,
  ease: "power2.out" as const,
}

/**
 * Exit animation configuration
 * Duration: 0.3s (slightly faster than entrance)
 * Easing: power2.in (faster exit)
 */
const EXIT_CONFIG = {
  duration: 0.3,
  ease: "power2.in" as const,
}

/**
 * Stage transition configuration
 * Duration: 0.5s
 * Easing: power2.inOut (smooth both ways)
 */
const TRANSITION_CONFIG = {
  duration: 0.5,
  ease: "power2.inOut" as const,
}

/**
 * Micro-interaction configuration
 * Duration: 0.2s
 * Easing: power1.out (quick and snappy)
 */
const MICRO_CONFIG = {
  duration: 0.2,
  ease: "power1.out" as const,
}

/**
 * Fade in + slide up animation (standard entrance)
 * Used for: Bottom elements, panels, cards
 */
export function fadeInSlideUp(element: gsap.TweenTarget) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 1, y: 0 })
    return
  }

  return gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, ...STANDARD_CONFIG }
  )
}

/**
 * Fade in + slide down animation
 * Used for: Top elements like ExplorePrompt
 */
export function fadeInSlideDown(element: gsap.TweenTarget) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 1, y: 0 })
    return
  }

  return gsap.fromTo(
    element,
    { opacity: 0, y: -10 },
    { opacity: 1, y: 0, ...STANDARD_CONFIG }
  )
}

/**
 * Fade in + slide right animation
 * Used for: FormulaPreview (slides in from right)
 */
export function fadeInSlideRight(element: gsap.TweenTarget) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 1, x: 0 })
    return
  }

  return gsap.fromTo(
    element,
    { opacity: 0, x: 20 },
    { opacity: 1, x: 0, ...STANDARD_CONFIG }
  )
}

/**
 * Fade in + scale animation
 * Used for: QuestionCard, interactive elements
 */
export function fadeInScale(element: gsap.TweenTarget) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 1, scale: 1 })
    return
  }

  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, ...STANDARD_CONFIG }
  )
}

/**
 * Stage transition - fade out current stage
 * Used for: Stage transitions (observe → amplitude, etc.)
 */
export function stageTransitionOut(element: gsap.TweenTarget) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 0, scale: 0.98 })
    return
  }

  return gsap.to(element, {
    opacity: 0,
    scale: 0.98,
    ...TRANSITION_CONFIG,
  })
}

/**
 * Stage transition - fade in new stage
 * Used for: Stage transitions (observe → amplitude, etc.)
 */
export function stageTransitionIn(element: gsap.TweenTarget) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 1, scale: 1 })
    return
  }

  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.98 },
    {
      opacity: 1,
      scale: 1,
      ...TRANSITION_CONFIG,
    }
  )
}

/**
 * Fade out + slide down animation
 * Used for: Top elements like ExplorePrompt (exit)
 */
export function fadeOutSlideDown(element: gsap.TweenTarget) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 0, y: 0 })
    return
  }

  return gsap.to(element, {
    opacity: 0,
    y: -10,
    ...EXIT_CONFIG,
  })
}

/**
 * Fade out + slide up animation
 * Used for: Bottom elements, panels, cards (exit)
 */
export function fadeOutSlideUp(element: gsap.TweenTarget) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 0, y: 0 })
    return
  }

  return gsap.to(element, {
    opacity: 0,
    y: 20,
    ...EXIT_CONFIG,
  })
}

/**
 * Fade out + scale animation
 * Used for: QuestionCard, Match Celebration (exit)
 */
export function fadeOutScale(element: gsap.TweenTarget) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 0, scale: 1 })
    return
  }

  return gsap.to(element, {
    opacity: 0,
    scale: 0.95,
    ...EXIT_CONFIG,
  })
}

/**
 * Pulse animation
 * Used for: Micro-interactions, highlights
 */
export function pulse(element: gsap.TweenTarget) {
  if (prefersReducedMotion()) {
    return
  }

  return gsap.to(element, {
    scale: 1.05,
    ...MICRO_CONFIG,
    yoyo: true,
    repeat: 1,
  })
}

/**
 * Shake animation
 * Used for: Error states, attention-grabbing
 */
export function shake(element: gsap.TweenTarget) {
  if (prefersReducedMotion()) {
    return
  }

  // Use timeline for keyframe-style shake animation
  const tl = gsap.timeline()
  tl.to(element, { x: -5, duration: 0.06, ease: "power1.out" })
    .to(element, { x: 5, duration: 0.06, ease: "power1.out" })
    .to(element, { x: -5, duration: 0.06, ease: "power1.out" })
    .to(element, { x: 5, duration: 0.06, ease: "power1.out" })
    .to(element, { x: 0, duration: 0.06, ease: "power1.out" })
  
  return tl
}

/**
 * Animate value update (for sliders, progress bars)
 * Used for: Smooth value transitions
 */
export function slideValueUpdate(
  element: gsap.TweenTarget,
  from: number,
  to: number
) {
  if (prefersReducedMotion()) {
    gsap.set(element, { value: to })
    return
  }

  return gsap.fromTo(
    element,
    { value: from },
    {
      value: to,
      duration: 0.3,
      ease: "power2.out",
    }
  )
}
