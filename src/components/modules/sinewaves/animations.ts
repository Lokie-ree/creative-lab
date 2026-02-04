// src/components/modules/sinewaves/animations.ts
import gsap from 'gsap'
import { duration, easing } from '@/lib/animation/tokens'

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
  valueHighlight?: HTMLElement | null
  feedback: HTMLElement | null
  continueButton: HTMLElement | null
}

/**
 * Match success sequence - staged reveal after hitting target
 * Timeline: 0ms pulse → 100ms value highlight → 250ms message → 450ms button (~600ms total)
 */
export function matchSuccessSequence(
  refs: MatchSuccessRefs,
  onComplete: () => void
) {
  if (prefersReducedMotion()) {
    if (refs.valueHighlight) gsap.set(refs.valueHighlight, { opacity: 1 })
    if (refs.feedback) gsap.set(refs.feedback, { opacity: 1, y: 0 })
    if (refs.continueButton) gsap.set(refs.continueButton, { opacity: 1, y: 0 })
    onComplete()
    return
  }

  const tl = gsap.timeline({ onComplete })

  // 0ms: Pulse visualization (scale 1.0 → 1.05 → 1.0, back.out)
  if (refs.visualization) {
    tl.fromTo(
      refs.visualization,
      { scale: 1 },
      {
        scale: 1.05,
        duration: toSeconds(0.15),
        ease: 'back.out(1.7)',
      },
      0
    ).to(refs.visualization, {
      scale: 1,
      duration: toSeconds(0.15),
      ease: 'power2.out',
    })
  }

  // 100ms: Matched value highlights (glow cyan)
  if (refs.valueHighlight) {
    tl.fromTo(
      refs.valueHighlight,
      { opacity: 0.7 },
      {
        opacity: 1,
        duration: toSeconds(100),
        ease: easing.out,
      },
      0.1
    )
  }

  // 250ms: Contextual message slides up
  if (refs.feedback) {
    tl.fromTo(
      refs.feedback,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: toSeconds(duration.medium),
        ease: easing.out,
      },
      0.25
    )
  }

  // 450ms: Continue button fades in
  if (refs.continueButton) {
    tl.fromTo(
      refs.continueButton,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: toSeconds(duration.fast),
        ease: easing.out,
      },
      0.45
    )
  }

  return tl
}

/**
 * Refs and callbacks for stage transition sequence
 */
export interface StageTransitionRefs {
  controlStrip: HTMLElement | null
  hint: HTMLElement | null
}

export interface StageTransitionCallbacks {
  onFadeOutComplete: () => void
  onComplete: () => void
}

/**
 * Stage transition - controls fade out, state updates, then hint and controls fade in (~500ms)
 */
export function stageTransition(
  refs: StageTransitionRefs,
  callbacks: StageTransitionCallbacks
) {
  const { onFadeOutComplete, onComplete } = callbacks
  if (prefersReducedMotion()) {
    onFadeOutComplete()
    onComplete()
    return null
  }

  const tl = gsap.timeline()

  if (refs.controlStrip) {
    tl.to(refs.controlStrip, {
      opacity: 0,
      duration: toSeconds(100),
      ease: easing.out,
    })
  }
  tl.call(onFadeOutComplete)
  if (refs.hint) {
    tl.set(refs.hint, { opacity: 0 })
    tl.to(refs.hint, {
      opacity: 1,
      duration: toSeconds(duration.medium),
      ease: easing.out,
    })
  }
  if (refs.controlStrip) {
    tl.to(refs.controlStrip, {
      opacity: 1,
      duration: toSeconds(duration.fast),
      ease: easing.out,
    }, refs.hint ? '-=0.1' : 0)
  }
  tl.call(onComplete, [], '+=0.05')
  return tl
}
