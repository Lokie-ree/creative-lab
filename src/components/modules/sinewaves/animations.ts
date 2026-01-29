// src/components/modules/sinewaves/animations.ts
import gsap from 'gsap'
import { duration, easing, stagger } from '@/lib/animation/tokens'

/**
 * Convert ms to seconds for GSAP
 */
const toSeconds = (ms: number) => ms / 1000

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Refs needed for console boot sequence
 */
export interface BootRefs {
  statusStrip: HTMLElement | null
  progressBar: HTMLElement | null
  prompt: HTMLElement | null
}

/**
 * Console boot sequence - "power on" entrance animation
 * Coordinates HTML elements; Scene handles its own boot via prop
 */
export function consoleBootSequence(
  refs: BootRefs,
  onReadyForScene: () => void
) {
  if (prefersReducedMotion()) {
    // Skip to ready state
    if (refs.statusStrip) gsap.set(refs.statusStrip, { opacity: 1 })
    if (refs.progressBar) gsap.set(refs.progressBar, { scaleX: 1 })
    if (refs.prompt) gsap.set(refs.prompt, { opacity: 1, x: 0 })
    onReadyForScene()
    return
  }

  const tl = gsap.timeline()

  // Status strip fades in
  if (refs.statusStrip) {
    tl.fromTo(
      refs.statusStrip,
      { opacity: 0 },
      { opacity: 1, duration: toSeconds(duration.fast) }
    )
  }

  // Progress bar draws left-to-right
  if (refs.progressBar) {
    tl.fromTo(
      refs.progressBar,
      { scaleX: 0, transformOrigin: 'left' },
      { scaleX: 1, duration: toSeconds(duration.normal), ease: easing.out },
      '-=0.1'
    )
  }

  // Prompt readout materializes
  if (refs.prompt) {
    tl.fromTo(
      refs.prompt,
      { opacity: 0, x: -8 },
      { opacity: 1, x: 0, duration: toSeconds(duration.normal), ease: easing.out },
      '+=0.1'
    )
  }

  // Signal Scene to start its boot animation
  tl.call(onReadyForScene, [], '+=0.2')

  return tl
}

/**
 * Refs needed for match success sequence
 */
export interface MatchSuccessRefs {
  visualization: HTMLElement | null
  feedback: HTMLElement | null
  continueButton: HTMLElement | null
}

/**
 * Match success sequence - staged reveal after hitting target
 * Timeline: hold → pulse → feedback → button
 */
export function matchSuccessSequence(
  refs: MatchSuccessRefs,
  onComplete: () => void
) {
  if (prefersReducedMotion()) {
    if (refs.feedback) gsap.set(refs.feedback, { opacity: 1, y: 0 })
    if (refs.continueButton) gsap.set(refs.continueButton, { opacity: 1, y: 0 })
    onComplete()
    return
  }

  const tl = gsap.timeline({ onComplete })

  // Hold - brief pause for visual confirmation (300ms)
  tl.addLabel('hold', 0)

  // Pulse visualization glow
  if (refs.visualization) {
    tl.to(
      refs.visualization,
      {
        filter: 'brightness(1.15)',
        duration: toSeconds(duration.normal),
        ease: easing.out,
      },
      'hold'
    ).to(refs.visualization, {
      filter: 'brightness(1)',
      duration: toSeconds(duration.normal),
      ease: easing.inOut,
    })
  }

  // Feedback text fades in
  if (refs.feedback) {
    tl.fromTo(
      refs.feedback,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: toSeconds(duration.normal), ease: easing.out },
      `-=${toSeconds(duration.fast)}`
    )
  }

  // Continue button appears
  if (refs.continueButton) {
    tl.fromTo(
      refs.continueButton,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: toSeconds(duration.normal), ease: easing.out },
      `+=${toSeconds(stagger.normal)}`
    )
  }

  return tl
}

/**
 * Stage transition sequence
 * Orchestrates exit of current readouts and entrance of new ones
 */
export function stageTransitionSequence(
  exitRefs: { prompt: HTMLElement | null; formula: HTMLElement | null },
  onMidpoint: () => void,
  enterRefs: { prompt: HTMLElement | null; formula: HTMLElement | null },
  onComplete?: () => void
) {
  if (prefersReducedMotion()) {
    if (exitRefs.prompt) gsap.set(exitRefs.prompt, { opacity: 0 })
    if (exitRefs.formula) gsap.set(exitRefs.formula, { opacity: 0 })
    onMidpoint()
    if (enterRefs.prompt) gsap.set(enterRefs.prompt, { opacity: 1, y: 0 })
    if (enterRefs.formula) gsap.set(enterRefs.formula, { opacity: 1, y: 0 })
    onComplete?.()
    return
  }

  const tl = gsap.timeline({ onComplete })

  // Exit current readouts
  const exitElements = [exitRefs.prompt, exitRefs.formula].filter(Boolean)
  exitElements.forEach((el) => {
    tl.to(el, { opacity: 0, duration: toSeconds(duration.fast), ease: easing.inOut }, 0)
  })

  // Midpoint - state update happens here
  tl.call(onMidpoint, [], `+=${toSeconds(stagger.tight)}`)

  // Enter new readouts with stagger
  tl.addLabel('enter')
  if (enterRefs.prompt) {
    tl.fromTo(
      enterRefs.prompt,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: toSeconds(duration.normal), ease: easing.out },
      'enter'
    )
  }
  if (enterRefs.formula) {
    tl.fromTo(
      enterRefs.formula,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: toSeconds(duration.normal), ease: easing.out },
      `enter+=${toSeconds(stagger.normal)}`
    )
  }

  return tl
}
