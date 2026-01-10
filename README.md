# Creative Lab: Interactive Math Learning Portfolio

A portfolio of interactive learning experiences that demonstrate pedagogical design through direct experience. Each module teaches mathematical concepts through discovery, manipulation, and earned reveals—where formulas appear as confirmation of understanding, not prerequisites to learning.

## 🎯 Portfolio Vision

**"I build interactive experiences that help people understand things they thought were hard."**

This portfolio practices what it preaches. Visitors don't read about design philosophy—they experience it. Each module embodies the same pedagogical principles:

- **Discovery before formula** - Challenge comes first, explanation follows understanding
- **Manipulation before explanation** - Visual and kinesthetic understanding precedes notation
- **Earned reveals** - Mathematical notation becomes a label for intuition, not a barrier
- **Visual confirmation** - Understanding is demonstrated through pattern matching, not multiple choice

For the complete vision document, see [`PORTFOLIO_VISION.md`](./PORTFOLIO_VISION.md).

### Core Philosophy

- **Discovery over instruction**: The challenge comes first, not the explanation
- **Visual intuition before notation**: The formula appears after understanding is built
- **Celebrate progress**: "Getting closer" feedback encourages exploration
- **Earned reveals**: Mathematical notation becomes a label for intuition, not a barrier

## 📚 Module Architecture

```
                    ┌─── Trigonometry ───────→ Sinewaves (COMPLETE)
                    │
        HERO ───────┼─── Linear Algebra ─────→ Vector Transformations (DESIGN READY)
                    │
                    └─── Differential Eq. ───→ Phase Portraits (DESIGN READY)
```

### Current Module: Sinewaves

**Status:** ✅ Complete and deployed

An interactive visualization where users discover the wave equation by matching a target motion. The formula appears as a reward for understanding, not a prerequisite.

**Features:**
- **Unit Circle**: Real-time rotation with synchronized point tracking
- **Sine Wave Graph**: Animated wave tracing that updates as parameters change
- **Connector Line**: Visual link between the unit circle's y-value and the wave graph
- **Target Matching**: Ghost visualization of the target wave pattern to match
- **Parameter Controls**: Amplitude and frequency sliders with real-time feedback
- **Challenge System**: Pattern-matching with proximity scoring and earned formula reveal
- **Responsive Layout**: Adapts to portrait and landscape orientations

### Upcoming Modules

- **Vector Transformations** (Linear Algebra) - Design complete, ready to build
- **Phase Portraits** (Differential Equations) - Design complete, ready to build

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

## 🎯 Who This Is For

### Primary: Students

They encounter the modules as learning tools, not portfolio pieces. If a student visits and genuinely understands sine and cosine better because of five minutes on this site, the portfolio has succeeded.

### Secondary: EdTech Leaders

Hiring managers, product leaders, and decision-makers at companies like Brilliant, Duolingo, Khan Academy, and the growing universe of learning platforms. They see someone who doesn't just talk about interactive learning—they experience it firsthand.

### Tertiary: Myself

A portfolio that reflects who I'm becoming, not just who I've been. Something that energizes me to maintain, share, and discuss with enthusiasm.

## 📝 License

This project is private and created for demonstration purposes.

## 🙏 Acknowledgments

- Inspired by Brilliant.org's pedagogical approach to interactive math education
- Built with React Three Fiber and the Three.js ecosystem
- UI components from shadcn/ui and Radix UI

---

**Built with ❤️ for interactive math education**
