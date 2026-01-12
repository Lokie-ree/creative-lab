# Landing Page Architecture

Design thinking and architectural decisions for the portfolio landing page. This document captures the shift from constellation-based navigation to a focused, single-page portfolio approach.

---

## Core Insight

"Build for portfolio reviewers, students can use it live" is a clear north star. It doesn't mean students are unimportant—it means when you have to make a tradeoff, you know which way to lean.

Now let's architect something that actually serves that goal.

**Reframing the Structure**

Here's what I'm hearing as your ideal flow for a portfolio reviewer:

The landing page should immediately communicate who you are and what you do. Within 10 seconds, they should understand: "This is a math educator who builds interactive learning experiences." Within 30 seconds, they should have a clear path to either explore your work OR get straight to your credentials.

The current Hero → Courses → Constellation → Module path is beautiful infrastructure, but it buries the lede. A Brilliant reviewer doesn't need to pick between "Advanced Math" and "CS" when there's only one module—that's cognitive overhead that doesn't serve them.

Here's an alternative mental model:

```
Landing Page (Portfolio Home)
├── Hero: Who you are, what you do, primary CTA
├── Featured Module: Sine Wave experience (prominent "Try It" button)
├── Design Philosophy: Brief hits on your pedagogical approach
├── About: Your journey narrative
├── Coming Soon: Tease Vector Transforms, Phase Portraits
└── Header/Footer: Resume, Contact, GitHub

Module Experience
├── The module itself (what you've built)
├── Contextual "About This Module" accessible without leaving
└── Easy return to Landing Page
```

The constellation becomes a secondary navigation—maybe accessible via "Browse All Modules" link, or it becomes the natural evolution once you have three modules worth browsing. Right now, it's solving a problem you don't yet have.

**The Landing Page Architecture**

Let me sketch what each section could do:

The **header** would carry the escape hatch functionality you mentioned. Name on the left, navigation on the right: Resume, Design Process, GitHub, Contact. Maybe a subtle "R" avatar like your current EscapeHatch component uses. This gives portfolio reviewers immediate access to credentials without having to enter any module.

The **hero section** would be a refined version of what you have, but with a sharper focus. Your current hero says "Math Educator → Full-Stack Developer → Learning Designer" and "15 years in math classrooms. 12 days learning R3F. This is what I built." That's compelling. The CTA should go directly to the Sinewave module—not to a course picker.

A **featured module section** would showcase the Sinewave module specifically. This is where you add the dual-audience framing you mentioned. For portfolio reviewers: "Built with Brilliant's challenge-first pedagogy: users discover the wave equation through manipulation, not explanation." For students: "Ever wondered where sine waves actually come from?" Both can coexist. A prominent "Try It" button, maybe with a visual preview or animated thumbnail.

A **design philosophy section** would be three to four quick cards or statements: "Challenge-first learning," "Formula as reward, not prerequisite," "Visual confirmation over multiple choice." This tells the reviewer you think deeply about pedagogy without requiring them to read a full essay.

An **about section** would be your narrative compressed. MS in Mathematics, 15 years teaching, returned to development, now building at the intersection. Brief but human.

A **coming soon section** would tease Vector Transformations and Phase Portraits. This signals ambition and trajectory. "What does a matrix do to space?" "How do systems evolve over time?" Even without the modules built, you're showing you know what's next.

**Addressing Your Third Point: Dual-Audience Module Framing**

This is a fascinating design challenge. You want the module to speak to both portfolio reviewers and students, but you've built something with a very intentional pedagogical structure—challenge-first, no explanation before exploration. How do you add context without breaking that?

Here's one approach: **contextual layers that don't interrupt the flow**.

Before entering the module, there could be a brief "About This Module" expandable or modal. Portfolio reviewers who want to understand your design choices can read it. Students who just want to dive in can skip it. This is where you'd put things like: "This module uses Brilliant's challenge-first pedagogy. You'll discover the wave equation by matching patterns, not by reading formulas first."

During the module, the existing EscapeHatch concept still works—but maybe it's more gracefully integrated. A subtle info icon that reveals "Why this approach?" for reviewers who are curious mid-experience.

After completion (in your celebration modal), you already have the "Behind This" tab. That's the natural place for deeper reflection on design choices. You could expand this to be more explicit about pedagogical decisions.

For the "why this matters to students" framing, that could live in the pre-module context. Something like: "Sine waves are everywhere—sound, light, electricity, even your heartbeat. But where do they actually come from? Let's find out."

**Technical Approach**

You mentioned shadcn registry components. Looking at your notes, you were exploring Animate UI, Eldora UI, Kokonut UI, and SvgL. Here's how I'd think about what actually helps:

For the landing page, you'd benefit from polished button components (your primary CTA needs to feel premium), smooth scroll animations (sections revealing as you scroll), and social/contact buttons in the header and footer. The AnimatedShinyText component you already have is great for the hero.

For overall polish, consistent spacing and typography systems matter more than flashy animations. The design tokens you have in `colors.ts` are solid—you just need to apply them consistently to a landing page.

One thing I'd caution against: don't let component shopping become a way to avoid the harder work of deciding what content goes on the landing page. The components are tools, not solutions.

**A Concrete Next Step**

Before we dive into implementation, I think it would help to sketch the landing page content. Not code—just words. What does each section actually say?

Here's a template you could fill out:

```
HEADER
- Logo/Name: ___
- Navigation items: ___

HERO
- Headline: ___
- Subheadline: ___
- Primary CTA text: ___
- Where does CTA go: ___

FEATURED MODULE
- Section headline: ___
- Module description (portfolio reviewer voice): ___
- Module description (student voice): ___
- CTA text: ___

DESIGN PHILOSOPHY
- Principle 1: ___
- Principle 2: ___
- Principle 3: ___

ABOUT
- Core narrative (2-3 sentences): ___

COMING SOON
- Module 2 teaser: ___
- Module 3 teaser: ___

FOOTER
- Contact info: ___
- Social links: ___
```

Would you want to work through this content first, before we talk about implementation? Or do you have a strong enough sense of the content that we should start thinking about the technical architecture?

Also—what's your timeline feeling like? You mentioned wanting students to use it soon. Is there a specific date or deadline driving this, or is it more "as soon as it feels ready"?