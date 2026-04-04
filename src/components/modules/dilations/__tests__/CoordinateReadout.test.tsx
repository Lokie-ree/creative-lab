import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CoordinateReadout } from '../components/CoordinateReadout'

const defaultProps = {
  scaleFactor: 2 as const,
  roundState: 'entry' as const,
  isGeneralized: false,
}

describe('CoordinateReadout', () => {
  it('shows scale factor before reveal', () => {
    render(<CoordinateReadout {...defaultProps} roundState="active" />)
    expect(screen.getByText(/k\s*=\s*2/)).toBeTruthy()
  })

  it('shows coordinate table after reveal (completion)', () => {
    render(<CoordinateReadout {...defaultProps} roundState="completion" />)
    expect(screen.getByText(/A\(1, 1\)/)).toBeTruthy()
    // A' uses unicode prime character from &prime;
    expect(screen.getByText(/A.\(2, 2\)/)).toBeTruthy()
  })

  it('shows coordinate rule after reveal', () => {
    render(<CoordinateReadout {...defaultProps} roundState="completion" />)
    expect(screen.getByText(/\(x, y\)\s*→\s*\(2x, 2y\)/)).toBeTruthy()
  })

  it('shows predicted coordinates in ghost color after ghost drop', () => {
    const predictedVertices = {
      a: { x: 2, y: 2 },
      b: { x: 4, y: 4 },
      c: { x: 4, y: 8 },
    }
    render(
      <CoordinateReadout
        {...defaultProps}
        roundState="prediction"
        predictedVertices={predictedVertices}
      />
    )
    // Should show pre-image coords
    expect(screen.getByText(/A\(1, 1\)/)).toBeTruthy()
    // Should show predicted image coords (ghost-colored prime notation)
    expect(screen.getByText(/A.\(2, 2\)/)).toBeTruthy()
  })

  it('shows generalized rule in amber for coord-k-third', () => {
    render(
      <CoordinateReadout
        scaleFactor={0.333}
        roundState="completion"
        isGeneralized={true}
      />
    )
    const rule = screen.getByText(/\(x, y\)\s*→\s*\(kx, ky\)/)
    expect(rule).toBeTruthy()
  })

  it('suppresses rule line when isFirstReveal is true', () => {
    render(
      <CoordinateReadout
        scaleFactor={2}
        roundState="completion"
        isGeneralized={false}
        isFirstReveal={true}
      />
    )
    // coordinate table still shows
    expect(screen.getByText(/A\(1, 1\)/)).toBeTruthy()
    // rule line is suppressed
    expect(screen.queryByText(/\(x, y\)\s*→\s*\(2x, 2y\)/)).toBeNull()
  })
})
