# Landing Page Component Reference

A curated collection of shadcn registry components for building the portfolio landing page, organized by section.

## Quick Install

```bash
# Install any component with:
pnpm dlx shadcn@latest add @registry/component-name

# Examples:
pnpm dlx shadcn@latest add @magicui/shimmer-button
pnpm dlx shadcn@latest add @aceternity/flip-words
pnpm dlx shadcn@latest add @tailark/hero-section-3
```

## Configured Registries

These registries are already configured in `components.json`:

| Registry | URL | Focus |
|----------|-----|-------|
| @magicui | magicui.design | Animated UI components |
| @aceternity | ui.aceternity.com | Interactive effects |
| @motion-primitives | motion-primitives.com | Motion animations |
| @react-bits | reactbits.dev | Text & cursor effects |
| @originui | originui.com | Clean UI components |
| @eldoraui | eldoraui.site | Device mockups, text effects |
| @kokonutui | kokonutui.com | Interactive components |
| @tailark | tailark.com | Complete landing page blocks |

---

## Section Components

### 🎯 HERO Section

#### FlipWords (@aceternity)
Rotating words animation — perfect for "Math Educator → Developer → Designer"

```bash
pnpm dlx shadcn@latest add @aceternity/flip-words
```

```tsx
import { FlipWords } from "@/components/ui/flip-words";

export function Hero() {
  const words = ["Math Educator", "Developer", "Learning Designer"];
  
  return (
    <div className="text-4xl font-bold">
      I'm a <FlipWords words={words} duration={3000} />
    </div>
  );
}
```

**Component Source:**
```tsx
"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const startAnimation = useCallback(() => {
    const word = words[words.indexOf(currentWord) + 1] || words[0];
    setCurrentWord(word);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isAnimating)
      setTimeout(() => {
        startAnimation();
      }, duration);
  }, [isAnimating, duration, startAnimation]);

  return (
    <AnimatePresence onExitComplete={() => setIsAnimating(false)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        exit={{
          opacity: 0,
          y: -40,
          x: 40,
          filter: "blur(8px)",
          scale: 2,
          position: "absolute",
        }}
        className={cn(
          "z-10 inline-block relative text-left text-neutral-900 dark:text-neutral-100 px-2",
          className
        )}
        key={currentWord}
      >
        {currentWord.split(" ").map((word, wordIndex) => (
          <motion.span
            key={word + wordIndex}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: wordIndex * 0.3, duration: 0.3 }}
            className="inline-block whitespace-nowrap"
          >
            {word.split("").map((letter, letterIndex) => (
              <motion.span
                key={word + letterIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: wordIndex * 0.3 + letterIndex * 0.05,
                  duration: 0.2,
                }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
            <span className="inline-block">&nbsp;</span>
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
```

---

### 🌌 HERO BACKGROUNDS

#### AuroraBackground (@aceternity) ⭐ Recommended
Flowing aurora gradient effect — elegant and content-agnostic

```bash
pnpm dlx shadcn@latest add @aceternity/aurora-background
```

```tsx
import { AuroraBackground } from "@/components/ui/aurora-background";

export function Hero() {
  return (
    <AuroraBackground>
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white">
          Building Interactive Learning
        </h1>
      </div>
    </AuroraBackground>
  );
}
```

---

#### Spotlight (@aceternity)
Dramatic spotlight beam effect

```bash
pnpm dlx shadcn@latest add @aceternity/spotlight
```

```tsx
import { Spotlight } from "@/components/ui/spotlight";

export function Hero() {
  return (
    <div className="relative h-screen bg-black">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="cyan" />
      <div className="relative z-10">
        {/* Your content */}
      </div>
    </div>
  );
}
```

---

#### DottedGlowBackground (@aceternity)
Shimmering dot grid with organic glow animation

```bash
pnpm dlx shadcn@latest add @aceternity/dotted-glow-background
```

```tsx
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export function Hero() {
  return (
    <div className="relative h-screen">
      <DottedGlowBackground 
        gap={12}
        glowColor="rgba(6, 182, 212, 0.85)" // cyan-500
        opacity={0.6}
      />
      <div className="relative z-10">
        {/* Your content */}
      </div>
    </div>
  );
}
```

---

#### BackgroundGradientAnimation (@aceternity)
Interactive multi-color gradient blobs that follow cursor

```bash
pnpm dlx shadcn@latest add @aceternity/background-gradient-animation
```

```tsx
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export function Hero() {
  return (
    <BackgroundGradientAnimation
      gradientBackgroundStart="rgb(0, 17, 82)"
      gradientBackgroundEnd="rgb(108, 0, 162)"
      firstColor="6, 182, 212"   // cyan
      secondColor="139, 92, 246" // violet
      thirdColor="59, 130, 246"  // blue
      interactive={true}
    >
      <div className="relative z-10">
        {/* Your content */}
      </div>
    </BackgroundGradientAnimation>
  );
}
```

---

#### Particles (@magicui)
Floating particle field with mouse interaction

```bash
pnpm dlx shadcn@latest add @magicui/particles
```

```tsx
import { Particles } from "@/components/ui/particles";

export function Hero() {
  return (
    <div className="relative h-screen bg-black">
      <Particles 
        className="absolute inset-0"
        quantity={80}
        color="#22d3ee" // cyan-400
        staticity={30}
      />
      <div className="relative z-10">
        {/* Your content */}
      </div>
    </div>
  );
}
```

---

#### Other Background Options

| Component | Registry | Description |
|-----------|----------|-------------|
| `background-beams` | @aceternity | Animated beam lines |
| `background-beams-with-collision` | @aceternity | Beams that collide and scatter |
| `background-lines` | @aceternity | Subtle animated lines |
| `background-boxes` | @aceternity | Animated grid boxes |
| `stars-background` | @aceternity | Starfield effect |
| `shooting-stars` | @aceternity | Animated shooting stars |
| `meteors` | @aceternity/@magicui | Meteor shower effect |
| `grid-pattern` | @magicui | SVG grid (you already have this) |
| `dot-pattern` | @magicui | SVG dots (you already have this) |
| `ripple` | @magicui | Ripple animation |
| `retro-grid` | @magicui | Animated retro grid |
| `noise-background` | @aceternity | Film grain/noise texture |

---

#### AnimatedShinyButton (@eldoraui) ⭐ Recommended
Premium CTA with cyan glow and rotating shine effect

```bash
pnpm dlx shadcn@latest add @eldoraui/animated-shiny-button
```

```tsx
import { AnimatedShinyButton } from "@/components/ui/animated-shiny-button";

export function HeroCTA() {
  return (
    <AnimatedShinyButton url="/sinewave">
      Try the Sinewave Module
    </AnimatedShinyButton>
  );
}
```

**Features:**
- Built-in cyan highlight color (`#67e8f9` / `#06b6d4`)
- Rotating gradient border animation
- Dot pattern overlay
- Hover glow effect
- Supports both button and link modes
- Light/dark mode support

**Component Source:**
```tsx
"use client"
import type React from "react"
import { ChevronRight } from "lucide-react"

interface AnimatedShinyButtonProps {
  children: React.ReactNode
  className?: string
  url?: string  // If provided, renders as <a>, otherwise <button>
}

export function AnimatedShinyButton({
  children,
  className = "",
  url,
}: AnimatedShinyButtonProps) {
  // Uses CSS custom properties for theming:
  // --shiny-cta-highlight: #67e8f9 (cyan-300)
  // --shiny-cta-highlight-subtle: #06b6d4 (cyan-500)
  
  return url ? (
    <a href={url} className={`shiny-cta-link group ${className}`}>
      <span className="flex items-center">
        {children}
        <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </a>
  ) : (
    <button className={`shiny-cta group ${className}`}>
      <span className="flex items-center">
        {children}
        <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}
```

---

#### FloatingNavbar (@aceternity)
Sleek navbar that appears on scroll

```bash
pnpm dlx shadcn@latest add @aceternity/floating-navbar
```

```tsx
import { FloatingNav } from "@/components/ui/floating-navbar";
import { Home, User, FileText, Github } from "lucide-react";

const navItems = [
  { name: "Home", link: "/", icon: <Home className="w-4 h-4" /> },
  { name: "About", link: "#about", icon: <User className="w-4 h-4" /> },
  { name: "Resume", link: "#resume", icon: <FileText className="w-4 h-4" /> },
];

export function Header() {
  return <FloatingNav navItems={navItems} />;
}
```

**Component Source:**
```tsx
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { cn } from "@/lib/utils";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: { name: string; link: string; icon?: JSX.Element }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      let direction = current - scrollYProgress.getPrevious()!;
      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        setVisible(direction < 0);
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-transparent dark:border-white/20 rounded-full dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-5000 pr-2 pl-8 py-2 items-center justify-center space-x-4",
          className
        )}
      >
        {navItems.map((navItem, idx) => (
          <a
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500"
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-sm">{navItem.name}</span>
          </a>
        ))}
        <button className="border text-sm font-medium relative border-neutral-200 dark:border-white/20 text-black dark:text-white px-4 py-2 rounded-full">
          <span>Resume</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
```

---

#### BlurInText (@eldoraui)
Text that blurs in on load

```bash
pnpm dlx shadcn@latest add @eldoraui/blur-in-text
```

```tsx
import { BlurInText } from "@/components/ui/blur-in-text";

export function HeroHeadline() {
  return (
    <BlurInText 
      text="Interactive Math Education"
      className="text-6xl font-bold text-white"
    />
  );
}
```

**Component Source:**
```tsx
"use client"
import clsx from "clsx"
import { motion } from "motion/react"

interface BlurInTextProps {
  text?: string
  className?: string
}

export const BlurInText: React.FC<BlurInTextProps> = ({ text = "", className = "" }) => {
  const variants = {
    hidden: { filter: "blur(10px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 },
  }

  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      transition={{ duration: 1 }}
      variants={variants}
      className={clsx(
        "font-display text-center font-bold drop-shadow-sm",
        "text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
        "tracking-[-0.02em]",
        className
      )}
    >
      {text}
    </motion.h1>
  )
}
```

---

### 📊 STATS / ABOUT Section

#### NumberTicker (@magicui)
Animated counting numbers — perfect for "15 years in classrooms"

```bash
pnpm dlx shadcn@latest add @magicui/number-ticker
```

```tsx
import { NumberTicker } from "@/components/ui/number-ticker";

export function Stats() {
  return (
    <div className="flex gap-12">
      <div className="text-center">
        <NumberTicker value={15} className="text-6xl font-bold" />
        <p className="text-muted-foreground">Years Teaching</p>
      </div>
      <div className="text-center">
        <NumberTicker value={12} className="text-6xl font-bold" />
        <p className="text-muted-foreground">Days Learning R3F</p>
      </div>
    </div>
  );
}
```

---

#### TextEffect (@motion-primitives)
Flexible text animations with presets

```bash
pnpm dlx shadcn@latest add @motion-primitives/text-effect
```

```tsx
import { TextEffect } from "@/components/ui/text-effect";

export function AnimatedHeadline() {
  return (
    <TextEffect preset="fade-in-blur" per="word" delay={0.2}>
      Building interactive learning experiences
    </TextEffect>
  );
}
```

**Presets:** `blur`, `fade-in-blur`, `scale`, `fade`, `slide`

---

### 🖼️ FEATURED MODULE Section

#### Safari Browser (@eldoraui)
Browser mockup to showcase your module

```bash
pnpm dlx shadcn@latest add @eldoraui/safari-browser
```

```tsx
import { Safari } from "@/components/ui/safari-browser";

export function ModulePreview() {
  return (
    <Safari
      url="creative-lab.dev/sinewave"
      src="/screenshots/sinewave-module.png"
      className="w-full max-w-4xl"
    />
  );
}
```

---

#### DynamicText (@kokonutui)
Rapid text switcher animation

```bash
pnpm dlx shadcn@latest add @kokonutui/dynamic-text
```

```tsx
// Customize the greetings array for your use case
const roles = [
  { text: "Math Educator", language: "role" },
  { text: "Full-Stack Developer", language: "role" },
  { text: "Learning Designer", language: "role" },
];
```

**Component Source:**
```tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface Item {
  text: string;
  language: string;
}

const items: Item[] = [
  { text: "Hello", language: "English" },
  { text: "こんにちは", language: "Japanese" },
  { text: "Bonjour", language: "French" },
  // Add your items...
];

const DynamicText = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= items.length) {
          clearInterval(interval);
          setIsAnimating(false);
          return prevIndex;
        }
        return nextIndex;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const textVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 },
  };

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="relative flex h-16 w-60 items-center justify-center overflow-visible">
        {isAnimating ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              animate={textVariants.visible}
              className="absolute flex items-center gap-2 font-medium text-2xl"
              exit={textVariants.exit}
              initial={textVariants.hidden}
              key={currentIndex}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="h-2 w-2 rounded-full bg-black dark:bg-white" />
              {items[currentIndex].text}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex items-center gap-2 font-medium text-2xl">
            <div className="h-2 w-2 rounded-full bg-black dark:bg-white" />
            {items[currentIndex].text}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicText;
```

---

### 🔗 FOOTER Section

#### Dock (@magicui)
macOS-style dock for social links

```bash
pnpm dlx shadcn@latest add @magicui/dock
```

```tsx
import { Dock, DockIcon } from "@/components/ui/dock";
import { Github, Linkedin, Mail, FileText } from "lucide-react";

export function Footer() {
  return (
    <Dock direction="middle">
      <DockIcon>
        <a href="https://github.com/yourusername" aria-label="GitHub">
          <Github className="size-6" />
        </a>
      </DockIcon>
      <DockIcon>
        <a href="https://linkedin.com/in/yourusername" aria-label="LinkedIn">
          <Linkedin className="size-6" />
        </a>
      </DockIcon>
      <DockIcon>
        <a href="mailto:you@email.com" aria-label="Email">
          <Mail className="size-6" />
        </a>
      </DockIcon>
      <DockIcon>
        <a href="/resume.pdf" aria-label="Resume">
          <FileText className="size-6" />
        </a>
      </DockIcon>
    </Dock>
  );
}
```

---

#### SocialButton (@kokonutui)
Animated social icon reveal on hover

```bash
pnpm dlx shadcn@latest add @kokonutui/social-button
```

```tsx
import SocialButton from "@/components/ui/social-button";

export function ContactSection() {
  return (
    <div className="flex justify-center">
      <SocialButton />
    </div>
  );
}
```

---

## Complete Landing Page Blocks (@tailark)

For rapid prototyping, @tailark provides complete, production-ready sections:

```bash
# Hero sections (9 variants)
pnpm dlx shadcn@latest add @tailark/hero-section-1
pnpm dlx shadcn@latest add @tailark/hero-section-3  # Recommended

# Features sections (12 variants)
pnpm dlx shadcn@latest add @tailark/features-3      # Good for Design Philosophy

# Stats sections (4 variants)
pnpm dlx shadcn@latest add @tailark/stats-2         # Good for About

# Footer sections (5 variants)
pnpm dlx shadcn@latest add @tailark/footer-2

# Content sections (7 variants)
pnpm dlx shadcn@latest add @tailark/content-3       # Good for Featured Module
```

### Mist Kit Variants (Alternative Dark Theme)
```bash
pnpm dlx shadcn@latest add @tailark/mist-hero-section-1
pnpm dlx shadcn@latest add @tailark/mist-features-3
pnpm dlx shadcn@latest add @tailark/mist-footer-1
```

---

## Recommended Component Stack

Based on the landing page structure in `ARCHITECTURE.md`:

| Section | Primary Component | Backup Option |
|---------|------------------|---------------|
| **Header** | `@aceternity/floating-navbar` | `@tailark/header-*` |
| **Hero Headline** | `@eldoraui/blur-in-text` | `@motion-primitives/text-effect` |
| **Hero Subtitle** | `@aceternity/flip-words` | `@kokonutui/dynamic-text` |
| **Hero Background** | `@aceternity/aurora-background` | `@aceternity/dotted-glow-background` |
| **Hero CTA** | `@eldoraui/animated-shiny-button` | `@kokonutui/gradient-button` |
| **Featured Module** | `@eldoraui/safari-browser` | `@tailark/content-3` |
| **Design Philosophy** | `@tailark/features-3` | `@magicui/bento-grid` |
| **About/Stats** | `@magicui/number-ticker` | `@tailark/stats-2` |
| **Coming Soon** | `@magicui/animated-list` | Custom cards |
| **Footer** | `@magicui/dock` | `@tailark/footer-2` |

---

## Installation Checklist

```bash
# Core components for landing page
pnpm dlx shadcn@latest add @aceternity/flip-words
pnpm dlx shadcn@latest add @aceternity/aurora-background
pnpm dlx shadcn@latest add @eldoraui/animated-shiny-button
pnpm dlx shadcn@latest add @magicui/number-ticker
pnpm dlx shadcn@latest add @magicui/dock
pnpm dlx shadcn@latest add @eldoraui/blur-in-text
pnpm dlx shadcn@latest add @eldoraui/safari-browser

# Optional enhancements
pnpm dlx shadcn@latest add @aceternity/floating-navbar
pnpm dlx shadcn@latest add @motion-primitives/text-effect
pnpm dlx shadcn@latest add @kokonutui/social-button

# Alternative backgrounds (pick one)
pnpm dlx shadcn@latest add @aceternity/spotlight
pnpm dlx shadcn@latest add @aceternity/dotted-glow-background
pnpm dlx shadcn@latest add @aceternity/background-gradient-animation
pnpm dlx shadcn@latest add @magicui/particles
```

---

## Dependencies to Install

Some components require additional packages:

```bash
# For motion components (usually auto-installed)
pnpm add motion
```

---

## Notes

- All components are compatible with your existing Tailwind + React setup
- Most use `motion/react` (Framer Motion v12+) which you likely have
- Components follow the shadcn pattern — copy/paste and customize
- Dark mode supported via Tailwind's `dark:` classes
