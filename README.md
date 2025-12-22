# Creative Lab: Interactive Math Learning Module

An interactive web application that teaches the sine wave equation through discovery-based learning. Users manipulate amplitude, frequency, and phase parameters to match a target wave pattern, with the mathematical formula revealed as a reward for understanding—not a prerequisite.

## 🎯 Project Vision

This module demonstrates a pedagogical approach inspired by Brilliant.org's philosophy: **teach through exploration, not explanation**. Instead of presenting formulas first, learners discover mathematical relationships by manipulating visual elements, building intuition before formal notation.

### Core Philosophy

- **Discovery over instruction**: The challenge (matching the wave) comes first
- **Visual intuition before notation**: The formula appears after understanding is built
- **Celebrate progress**: "Getting closer" feedback encourages exploration
- **Earned reveals**: Mathematical notation becomes a label for intuition, not a barrier

For the complete vision document, see [`docs/copy/brilliant-math-producer-vision.md`](./docs/copy/brilliant-math-producer-vision.md).

## ✨ Current Features

### Interactive Visualization

- **Unit Circle**: Real-time rotation showing the angle parameter, with synchronized point tracking
- **Sine Wave Graph**: Animated wave tracing that updates as parameters change
- **Connector Line**: Visual link between the unit circle's y-value and the wave graph
- **Target Matching**: Ghost visualization of the target wave pattern to match
- **Responsive Layout**: Adapts to portrait and landscape orientations

### Parameter Controls

- **Amplitude Slider**: Adjusts wave height (0.1 - 2.0)
- **Frequency Slider**: Controls wave speed/cycles (0.5 - 3.0)
- **Phase Slider**: Shifts wave position (0 - 2π), displayed in π multiples
- **Real-time Feedback**: All changes update the visualization instantly

### Challenge System

- **Random Targets**: Each challenge generates a unique target wave pattern
- **Match Scoring**: Real-time proximity calculation (0-100%)
- **Visual Feedback**: Color-coded match indicator (red → yellow → green → success)
- **Formula Reveal**: Upon matching (≥95%), the wave equation appears with your discovered values
- **New Challenge**: Reset and try again with a different target

## 🛠️ Tech Stack

- **React 19** + **TypeScript** - Modern UI framework with type safety
- **Vite** - Fast build tool and dev server
- **React Three Fiber** - 3D visualization library for WebGL
- **@react-three/drei** - Helpers for R3F components
- **GSAP** - Animation library for smooth transitions
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component primitives
- **Radix UI** - Unstyled, accessible component library

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── App.tsx                 # Main application logic and state
├── components/
│   ├── Scene.tsx           # 3D canvas container and layout
│   ├── UnitCircle.tsx      # Rotating unit circle visualization
│   ├── SineWave.tsx        # Animated sine wave graph
│   ├── Connector.tsx       # Visual link between circle and wave
│   ├── ControlPanel.tsx    # Parameter sliders and match indicator
│   ├── FormulaReveal.tsx   # Modal showing the earned formula
│   └── ui/                 # Reusable UI components (slider, number-ticker)
└── lib/
    └── utils.ts            # Utility functions (cn, etc.)
```

## 🎓 Pedagogical Design

### The Learning Journey

1. **Immediate State (0-5s)**: User sees synchronized animations—circle rotating, wave drawing, target pattern
2. **Exploration (5-60s)**: Discover that sliders control different aspects of the motion
3. **Matching (60-180s)**: Adjust parameters to align with the target, guided by proximity feedback
4. **Reveal**: Upon success, the formula `y = A × sin(ωt + φ)` appears with discovered values

### Why This Works

- **No cognitive load upfront**: No formulas or terminology to memorize first
- **Immediate cause-and-effect**: Every slider adjustment shows instant visual feedback
- **Pattern recognition**: Users naturally notice relationships (e.g., "this makes it faster")
- **Intrinsic motivation**: The challenge itself is engaging, not just the reward
- **Transferable understanding**: The formula describes what they've already experienced

## 🎨 Design Principles

- **Clean and focused**: Minimal UI that doesn't distract from the learning
- **Brilliant-aligned aesthetic**: Deep navy background (#0a0a0f) with pear accent (#c8e44c)
- **Smooth interactions**: Immediate response with subtle animations
- **Accessible**: Touch-friendly controls, responsive to all screen sizes
- **Performance-first**: Optimized rendering with React Three Fiber best practices

## 🔮 Future Enhancements

Potential directions for expansion:

- Multiple challenge types (cosine waves, combined waves, etc.)
- Difficulty progression (beginner → advanced)
- Save/share discovered patterns
- Educational annotations (optional hints)
- Multiplayer challenges
- Integration with learning management systems

## 📝 License

This project is private and created for demonstration purposes.

## 🙏 Acknowledgments

- Inspired by Brilliant.org's pedagogical approach to interactive math education
- Built with React Three Fiber and the Three.js ecosystem
- UI components from shadcn/ui and Radix UI

---

**Built with ❤️ for interactive math education**
