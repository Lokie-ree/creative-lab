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
})
