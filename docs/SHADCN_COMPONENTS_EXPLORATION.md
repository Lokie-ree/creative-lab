# Shadcn Components Exploration

> Guide to available prebuilt components that can enhance accessibility, animations, and simplify architecture for future module development.

## Overview

We've set up access to multiple component registries:
- **@shadcn** - Core accessible UI components
- **@magicui** - Animated and interactive components
- **@react-bits** - Additional React components
- **@aceternity** - Premium animated components
- **@originui** - Modern UI components
- **@motion-primitives** - Motion/animation primitives

---

## ✅ Components Added

### Core Shadcn Components

#### 1. **Button** (`@shadcn/button`)
- **Location:** `src/components/ui/button.tsx`
- **Benefits:**
  - Built-in hover states and transitions
  - Multiple variants (default, outline, ghost, secondary, destructive, link)
  - Size variants (sm, default, lg, icon sizes)
  - Accessible focus states with ring indicators
  - Consistent button styling across modules
- **Use Cases:**
  - Primary action buttons in modules
  - Navigation buttons
  - Interactive controls

#### 2. **Tooltip** (`@shadcn/tooltip`)
- **Location:** `src/components/ui/tooltip.tsx`
- **Benefits:**
  - Accessible tooltip with keyboard support
  - Built-in animations (fade, zoom, slide)
  - Automatic positioning
  - ARIA attributes included
- **Use Cases:**
  - Slider value tooltips during drag
  - Help text for parameter controls
  - Contextual explanations on hover
  - Stage indicator tooltips

#### 3. **Badge** (`@shadcn/badge`)
- **Location:** `src/components/ui/badge.tsx`
- **Benefits:**
  - Consistent badge styling
  - Multiple variants (default, secondary, destructive, outline)
  - Accessible and semantic
- **Use Cases:**
  - Discovery indicators
  - Stage completion badges
  - Status indicators

#### 4. **Accordion** (`@shadcn/accordion`)
- **Location:** `src/components/ui/accordion.tsx`
- **Benefits:**
  - Expandable/collapsible content
  - Keyboard navigation
  - Smooth animations
  - ARIA attributes for accessibility
- **Use Cases:**
  - Expandable explanations
  - Progressive disclosure of information
  - FAQ-style help sections

---

## 🎨 Additional Components Available

### Modal & Dialog Components

#### **Dialog** (`@shadcn/dialog`)
- Accessible modal dialog with backdrop and focus management
- **Add Command:** `pnpm dlx shadcn@latest add @shadcn/dialog`

#### **Tabs** (`@shadcn/tabs`)
- Accessible tabbed interface component
- **Add Command:** `pnpm dlx shadcn@latest add @shadcn/tabs`

#### **Sheet** (`@shadcn/sheet`)
- Slide-in panel component (alternative to dialog)
- **Add Command:** `pnpm dlx shadcn@latest add @shadcn/sheet`

### Navigation & Layout

#### **Dropdown Menu** (`@shadcn/dropdown-menu`)
- Accessible dropdown menu component
- **Add Command:** `pnpm dlx shadcn@latest add @shadcn/dropdown-menu`

#### **Avatar** (`@shadcn/avatar`)
- User avatar component with fallback support
- **Add Command:** `pnpm dlx shadcn@latest add @shadcn/avatar`

#### **Card** (`@shadcn/card`)
- Base card component for content containers
- **Add Command:** `pnpm dlx shadcn@latest add @shadcn/card`

#### **Separator** (`@shadcn/separator`)
- Visual separator line component
- **Add Command:** `pnpm dlx shadcn@latest add @shadcn/separator`

#### **Progress** (`@shadcn/progress`)
- Progress bar component
- **Add Command:** `pnpm dlx shadcn@latest add @shadcn/progress`

---

## 🎨 Animated Components to Explore

### MagicUI Components

#### 1. **Shimmer Button** (`@magicui/shimmer-button`)
- **Description:** Button with a shimmering light that travels around the perimeter
- **Use Cases:**
  - Primary action buttons
  - Stage completion buttons
  - Celebration moments

#### 2. **Ripple** (`@magicui/ripple`)
- **Description:** Animated ripple effect behind elements to emphasize them
- **Use Cases:**
  - Behind modals
  - On stage transitions
  - When correct answer is selected

#### 3. **Magic Card** (`@magicui/magic-card`)
- **Description:** Spotlight effect that follows mouse cursor and highlights borders on hover
- **Use Cases:**
  - Question cards
  - Feedback banners
  - Interactive cards

#### 4. **Number Ticker** (`@magicui/number-ticker`)
- **Description:** Animate numbers to count up or down to a target number
- **Note:** Already exists in project (`src/components/ui/number-ticker.tsx`)
- **Use Cases:**
  - Match score display
  - Parameter values
  - Discovery values

#### 5. **Particles** (`@magicui/particles`)
- **Description:** Visual particles for depth, movement, and interactivity
- **Use Cases:**
  - Celebration effects
  - Background effects
  - Stage transitions

#### 6. **Animated Gradient Text** (`@magicui/animated-gradient-text`)
- **Description:** Text with animated gradient background that transitions between colors
- **Use Cases:**
  - Animated headings
  - Title text effects

#### 7. **Animated Shiny Text** (`@magicui/animated-shiny-text`)
- **Description:** Light glare effect that pans across text making it appear shimmering
- **Use Cases:**
  - Shimmer effect on key text elements
  - Professional polish

#### 8. **Sparkles Text** (`@magicui/sparkles-text`)
- **Description:** Dynamic text that generates continuous sparkles with smooth transitions
- **Use Cases:**
  - Success messages
  - Celebration headings

#### 9. **Neon Gradient Card** (`@magicui/neon-gradient-card`)
- **Description:** Beautiful neon card effect with gradient borders
- **Use Cases:**
  - Eye-catching card styles
  - Modern aesthetic

---

---

## 📋 Component Usage Guidelines

### General Principles

- **Accessibility First:** All shadcn components include ARIA attributes, keyboard navigation, and focus management
- **Consistency:** Use components from the same design system for unified styling
- **Performance:** Components are optimized with proper React patterns
- **Customization:** Components can be customized via className props and design tokens

### When to Use Components

- **Buttons:** Use `@shadcn/button` for all interactive buttons to ensure consistent styling and accessibility
- **Tooltips:** Add tooltips to provide contextual help without cluttering the UI
- **Badges:** Use badges for status indicators, discovery markers, and labels
- **Modals/Dialogs:** Use `@shadcn/dialog` for modal content, `@shadcn/tabs` for tabbed interfaces
- **Cards:** Use cards for grouping related content, especially in navigation or information displays
- **Animated Components:** Use MagicUI components sparingly for celebration moments and key interactions

---

---

## 🚀 Quick Start Commands

### Add Core Shadcn Components
```bash
pnpm dlx shadcn@latest add @shadcn/button @shadcn/tooltip @shadcn/badge @shadcn/accordion
```

### Add Modal & Dialog Components
```bash
pnpm dlx shadcn@latest add @shadcn/dialog @shadcn/tabs @shadcn/sheet
```

### Add Navigation & Layout Components
```bash
pnpm dlx shadcn@latest add @shadcn/dropdown-menu @shadcn/avatar @shadcn/card @shadcn/separator @shadcn/progress
```

### Add MagicUI Animated Components
```bash
# Core animated components
pnpm dlx shadcn@latest add @magicui/shimmer-button @magicui/ripple @magicui/magic-card @magicui/particles

# Text effects
pnpm dlx shadcn@latest add @magicui/animated-gradient-text @magicui/animated-shiny-text @magicui/sparkles-text

# Card effects
pnpm dlx shadcn@latest add @magicui/neon-gradient-card
```

### Explore Available Components
```bash
# List all shadcn components
pnpm dlx shadcn@latest view @shadcn

# List all magicui components
pnpm dlx shadcn@latest view @magicui

# Search for specific components
pnpm dlx shadcn@latest search button
```

---

## 📚 Component Registry URLs

- **Shadcn:** https://ui.shadcn.com
- **MagicUI:** https://magicui.design
- **React Bits:** https://reactbits.dev
- **Aceternity:** https://ui.aceternity.com
- **Origin UI:** https://originui.com
- **Motion Primitives:** https://motion-primitives.com

---

## 💡 Recommendations

### High Priority
- Use `@shadcn/button` for all interactive buttons
- Add tooltips to provide contextual help
- Use badges for status indicators and discovery markers

### Medium Priority
- Add Accordion for expandable content sections
- Explore Shimmer Button for primary actions
- Add Ripple effects for celebration moments

### Future Exploration
- Experiment with Magic Card for interactive elements
- Add Particles for background effects
- Explore other registries for unique components

---

## 🎨 Component Examples

### Button Usage
```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg" onClick={handleContinue}>
  Continue
</Button>

<Button variant="ghost" onClick={handleWhy}>
  Why?
</Button>
```

### Tooltip Usage
```tsx
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

<Tooltip>
  <TooltipTrigger asChild>
    <Slider value={[value]} />
  </TooltipTrigger>
  <TooltipContent>
    <p>Current value: {value.toFixed(2)}</p>
  </TooltipContent>
</Tooltip>
```

### Badge Usage
```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="secondary" className="text-[#c8e44c]">
  ✓ You discovered
</Badge>
```

### Dialog Usage
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        {/* Tab content */}
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
```

### Card Usage
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

<Card className="cursor-pointer hover:bg-zinc-800/50 transition-colors">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

### Magic Card Usage (Enhanced Go Deeper Links)
```tsx
import { MagicCard } from "@/components/ui/magic-card"

<MagicCard className="cursor-pointer">
  <div className="p-6">
    <h3 className="text-lg font-semibold">Resume</h3>
    <p className="text-sm text-zinc-400">Education, experience, skills</p>
  </div>
</MagicCard>
```

### Animated Gradient Text Usage
```tsx
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"

<AnimatedGradientText>
  <span className="text-5xl font-semibold">
    Animated Text
  </span>
</AnimatedGradientText>
```

### Sparkles Text Usage
```tsx
import { SparklesText } from "@/components/ui/sparkles-text"

<SparklesText
  text="Success Message"
  className="text-3xl font-bold"
  colors={{ first: "#fb923c", second: "#fbbf24" }}
/>
```

---

## ✅ Benefits Summary

1. **Accessibility:** All components include ARIA attributes, keyboard navigation, and focus management
2. **Animations:** Built-in smooth transitions and animations
3. **Consistency:** Unified design system across all components
4. **Maintainability:** Centralized components, easier to update
5. **Performance:** Optimized components with proper React patterns
6. **Theming:** Easy to customize with design tokens
7. **Type Safety:** Full TypeScript support

---

## 📝 Notes

- All components are already installed and ready to use
- Components follow the project's design system (New York style)
- Components use Tailwind CSS for styling
- All components are accessible by default
- Components can be customized via className props
- Design tokens can be overridden in `src/index.css`

---

---

**Last Updated:** January 10, 2026
**Status:** Component reference guide for future module development
