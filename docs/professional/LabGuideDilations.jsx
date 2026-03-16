import { useState } from "react";

// ── Design Tokens ─────────────────────────────────────────────
// Matches creative-lab design system: src/lib/colors.ts
const T = {
  bg: "#1e1d1c",
  surface: "#252422",
  surfaceHi: "#2e2c28",
  border: "#2e2c28",
  text: "#b8b0a4",
  textDim: "#7a746a",
  accent: "#7cc87c",
  accentDim: "rgba(124,200,124,0.22)",
  white: "#e8e2da",
  danger: "#c87c7c",
  info: "#7caac8",
};

// ── Progress Dots ─────────────────────────────────────────────
// Mirrors StatusStrip .sdot pattern from the module
function ProgressDots({ total, current, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 0 8px" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              width: i === current ? 14 : 8,
              height: i === current ? 14 : 8,
              borderRadius: "50%",
              background: i < current ? T.accent : i === current ? T.accent : "transparent",
              border: i === current ? `2px solid ${T.accent}` : i < current ? "none" : `1px solid ${T.textDim}`,
              boxShadow: i === current ? `0 0 8px ${T.accentDim}` : "none",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
      {label && (
        <span style={{ fontFamily: "monospace", fontSize: 9, color: T.surfaceHi, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          {label}
        </span>
      )}
    </div>
  );
}

// ── Shared Components ─────────────────────────────────────────
function ScoredLine() {
  return <div style={{ height: 1, background: T.border, margin: "8px 0" }} />;
}

function SectionLabel({ children, color }) {
  return (
    <span style={{ fontFamily: "monospace", fontSize: 9, color: color || T.textDim, letterSpacing: "0.2em", textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

function Badge({ children, color }) {
  return (
    <span style={{
      display: "inline-block", fontFamily: "monospace", fontSize: 11, color: color || T.accent,
      background: T.accentDim, padding: "3px 8px", borderRadius: 3,
    }}>
      {children}
    </span>
  );
}

function PromptBox({ children }) {
  return (
    <div style={{ background: T.surface, borderRadius: 4, padding: "8px 12px", margin: "8px 0" }}>
      <span style={{ fontFamily: "sans-serif", fontSize: 13, color: T.white }}>{children}</span>
    </div>
  );
}

function DotGrid({ height = 120 }) {
  const dots = [];
  const spacing = 16;
  const cols = 22;
  const rows = Math.floor(height / spacing);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <circle key={`${r}-${c}`} cx={10 + c * spacing} cy={10 + r * spacing} r={1} fill={T.textDim} opacity={0.5} />
      );
    }
  }
  return (
    <div style={{ background: T.surface, borderRadius: 4, padding: 4, margin: "6px 0" }}>
      <svg width="100%" height={height} viewBox={`0 0 ${10 + cols * spacing} ${10 + rows * spacing}`}>
        {dots}
      </svg>
      <div style={{ fontFamily: "sans-serif", fontSize: 9, color: T.surfaceHi, padding: "0 8px 4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        sketch your prediction
      </div>
    </div>
  );
}

function WriteLines({ count = 3 }) {
  return (
    <div style={{ padding: "4px 8px" }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${T.border}`, height: 22 }} />
      ))}
    </div>
  );
}

// ── Page Components ───────────────────────────────────────────

function Cover() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32, textAlign: "center" }}>
      <SectionLabel>Lab Guide</SectionLabel>
      <ScoredLine />
      <h1 style={{ fontFamily: "sans-serif", fontSize: 28, fontWeight: 700, color: T.white, margin: "24px 0 4px", lineHeight: 1.2 }}>
        Dilations, Similarity
      </h1>
      <h1 style={{ fontFamily: "sans-serif", fontSize: 28, fontWeight: 700, color: T.white, margin: "0 0 16px", lineHeight: 1.2 }}>
        & Right Triangles
      </h1>
      <p style={{ fontFamily: "sans-serif", fontSize: 14, color: T.text, margin: "0 0 4px" }}>Grade 8 Mathematics</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.textDim }}>IVLA STEM Club</p>
      <div style={{ display: "flex", gap: 8, margin: "24px 0", flexWrap: "wrap", justifyContent: "center" }}>
        <Badge>8.G.A.3</Badge>
        <Badge>8.G.A.4</Badge>
        <Badge color={T.info}>G-SRT bridge</Badge>
      </div>
      <ScoredLine />
      <p style={{ fontFamily: "sans-serif", fontSize: 15, color: T.accent, fontStyle: "italic", margin: "16px 0", maxWidth: 320 }}>
        "What changes when a shape grows? What stays the same?"
      </p>
      <ScoredLine />
      <p style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim, marginTop: 24 }}>creative-lab-five.vercel.app</p>
    </div>
  );
}

function StandardsPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel>Teacher Section</SectionLabel>
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>
        Standards Alignment
      </h2>
      <ScoredLine />

      {[
        { code: "8.G.A.3", desc: "Describe the effect of dilations, translations, rotations, and reflections on two-dimensional figures using coordinates. Dilations use the origin as center of dilation." },
        { code: "8.G.A.4", desc: "Explain that a two-dimensional figure is similar to another if the second can be obtained by a sequence of rotations, reflections, translations, and dilations. Describe the sequence that exhibits similarity." },
      ].map(({ code, desc }) => (
        <div key={code} style={{ margin: "12px 0" }}>
          <span style={{ fontFamily: "monospace", fontSize: 13, color: T.accent }}>{code}</span>
          <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.text, margin: "4px 0 0 8px", lineHeight: 1.5 }}>{desc}</p>
        </div>
      ))}

      <ScoredLine />
      <SectionLabel>Rigor Components</SectionLabel>
      <div style={{ margin: "10px 0" }}>
        <p style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 600, color: T.white, margin: "8px 0 2px" }}>Conceptual Understanding</p>
        <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 0 8px", lineHeight: 1.4 }}>
          Students understand that dilations produce similar (not congruent) figures — angles are preserved, side lengths are proportional.
        </p>
        <p style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 600, color: T.white, margin: "10px 0 2px" }}>Procedural Skill</p>
        <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 0 8px", lineHeight: 1.4 }}>
          Students apply coordinate rules for dilations centered at the origin after demonstrating spatial understanding of scale factor.
        </p>
      </div>

      <ScoredLine />
      <SectionLabel>Achievement Level Progression</SectionLabel>
      {[
        { level: "Level 3", label: "Basic", color: T.textDim, desc: "Identify dilated figures. Recognize that a shape grew or shrank. Distinguish similar from congruent by appearance." },
        { level: "Level 4", label: "Mastery", color: T.accent, desc: "Apply scale factor to coordinates. Describe dilation rules using (x, y) → (kx, ky). Determine scale factor from two similar figures." },
        { level: "Level 5", label: "Advanced", color: T.info, desc: "Describe sequences combining rigid motions and dilations to exhibit similarity. Explain why corresponding angles are congruent and sides are proportional." },
      ].map(({ level, label, color, desc }) => (
        <div key={level} style={{ margin: "10px 0" }}>
          <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color }}>{level}</span>
          <span style={{ fontFamily: "sans-serif", fontSize: 10, color: T.textDim, marginLeft: 6 }}>({label})</span>
          <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "3px 0 0 8px", lineHeight: 1.4 }}>{desc}</p>
        </div>
      ))}

      <ProgressDots total={4} current={0} label="Teacher" />
    </div>
  );
}

function PhasesPage() {
  const phases = [
    { num: "01", title: "Scale Factor Exploration", desc: "Students drag a slider to scale the familiar scalene triangle from Module 1. No coordinates — pure visual feedback. The triangle grows and shrinks from the origin. Building intuition for what 'scale factor' means spatially." },
    { num: "02", title: "Predict & Reveal: Dilations", desc: "The core loop adapted for dilations. Given a scale factor, predict where each vertex lands. The reveal animation shows the dilation path — rays from the origin through each vertex. Scoring tracks accuracy." },
    { num: "03", title: "Coordinate Layer", desc: "The earned reveal: (x, y) → (kx, ky). After spatial mastery, coordinate notation appears. Students see that multiplying both coordinates by the scale factor is just a description of what they already understand." },
    { num: "04", title: "Capstone: Similarity Sequences", desc: "Combine a rigid motion with a dilation. Given two similar figures, describe the sequence (translate + dilate, rotate + dilate). The inverse of Module 1's capstone — now with scale." },
  ];

  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel>Teacher Section</SectionLabel>
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>
        Module Phases
      </h2>
      <ScoredLine />

      {phases.map(({ num, title, desc }) => (
        <div key={num} style={{ margin: "14px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: "monospace", fontSize: 14, color: T.accent }}>{num}</span>
            <span style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, color: T.white }}>{title}</span>
          </div>
          <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "4px 0 0 24px", lineHeight: 1.5 }}>{desc}</p>
        </div>
      ))}

      <ScoredLine />
      <div style={{ background: T.surface, borderRadius: 4, padding: "12px 16px", textAlign: "center", margin: "8px 0" }}>
        <p style={{ fontFamily: "sans-serif", fontSize: 14, color: T.accent, margin: "0 0 4px" }}>The same triangle. A new property.</p>
        <p style={{ fontFamily: "sans-serif", fontSize: 14, color: T.accent, margin: "0 0 8px" }}>Scale changes size. It preserves shape.</p>
        <p style={{ fontFamily: "sans-serif", fontSize: 10, color: T.textDim, margin: 0 }}>— creative-lab design philosophy</p>
      </div>

      <ProgressDots total={4} current={1} label="Teacher" />
    </div>
  );
}

function ImplementationPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel>Teacher Section</SectionLabel>
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>
        Implementation Notes
      </h2>
      <ScoredLine />

      {[
        { label: "PREREQUISITE", value: "Rigid Motions module complete (or equivalent understanding of translations, reflections, rotations)" },
        { label: "DURATION", value: "2–3 class periods (45 min each)" },
        { label: "DEVICES", value: "Desktop or laptop recommended; tablet supported" },
        { label: "SETUP", value: "No account required. Navigate to URL. Module picks up where Rigid Motions left off." },
        { label: "SHAPE FAMILY", value: "Same scalene triangle from Module 1 — A(1,1) B(4,2) C(2,4). Students recognize it immediately." },
      ].map(({ label, value }) => (
        <div key={label} style={{ margin: "10px 0" }}>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: T.textDim }}>{label}</span>
          <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.text, margin: "3px 0 0 10px", lineHeight: 1.4 }}>{value}</p>
        </div>
      ))}

      <div style={{ background: T.surface, borderRadius: 4, padding: "8px 14px", margin: "12px 0" }}>
        <span style={{ fontFamily: "monospace", fontSize: 13, color: T.accent }}>creative-lab-five.vercel.app</span>
      </div>

      <ScoredLine />
      <SectionLabel>What to Watch For</SectionLabel>
      {[
        { title: "Confusing dilation with translation", desc: "Students may think 'bigger' means 'moved right and up.' The ray visualization in Phase 2 corrects this — growth happens along rays from the origin." },
        { title: "Scale factor < 1 surprises", desc: "Shrinking feels different than growing. Students who mastered k=2 may stumble on k=0.5. This is normal — let the predict/reveal loop do its work." },
        { title: "The similarity vs. congruence distinction", desc: "Students from Module 1 proved congruence. Now they need to understand that adding dilation means 'same shape, different size.' Watch for the moment this clicks." },
        { title: "Connecting to Module 1", desc: "The capstone explicitly bridges: 'rigid motion + dilation = similarity transformation.' Students who completed Module 1 will recognize the sequence-building pattern." },
      ].map(({ title, desc }) => (
        <div key={title} style={{ margin: "8px 0" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 600, color: T.white, margin: "0 0 2px" }}>{title}</p>
          <p style={{ fontFamily: "sans-serif", fontSize: 10, color: T.text, margin: "0 0 0 8px", lineHeight: 1.4 }}>{desc}</p>
        </div>
      ))}

      <ProgressDots total={4} current={2} label="Teacher" />
    </div>
  );
}

function ClassroomPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel>Teacher Section</SectionLabel>
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>
        Classroom Integration
      </h2>
      <ScoredLine />
      <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.text, margin: "8px 0", lineHeight: 1.5 }}>
        This module builds directly on Rigid Motions. The same triangle, the same predict/reveal loop, a new property to discover.
      </p>

      {[
        { when: "Before the module", move: "Ask: 'If I photocopy this triangle at 200%, what changes? What doesn't?' Let students generate hypotheses about size vs. shape. Do not define similar or scale factor yet." },
        { when: "During Phase 1", move: "Watch students discover that the triangle 'grows from a point.' They'll notice the origin matters. This is the spatial foundation for center of dilation." },
        { when: "During Phase 2", move: "The ray visualization is the key insight. When students see dilation paths as rays from the origin through each vertex, they understand WHY (kx, ky) works — it's scalar multiplication along those rays." },
        { when: "At the Phase 3 boundary", move: "Students who struggled with coordinate rules in Module 1 may find this easier — multiplication feels more natural than the sign-flipping of reflections. Celebrate that." },
        { when: "During the capstone", move: "Pairs should compare: 'I used translate then dilate. You used dilate then translate. Did we get the same result?' This surfaces commutativity questions from Module 1 in a new context." },
      ].map(({ when, move }) => (
        <div key={when} style={{ margin: "10px 0" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 600, color: T.accent, margin: "0 0 3px" }}>{when}</p>
          <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 0 8px", lineHeight: 1.4 }}>{move}</p>
        </div>
      ))}

      <ProgressDots total={4} current={3} label="Teacher" />
    </div>
  );
}

// ── Student Discovery Log Pages ───────────────────────────────

function DilationsPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.accent}>Discovery Log</SectionLabel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 0" }}>
        <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: 0 }}>DILATIONS</h2>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim }}>(x, y) → (kx, ky)</span>
      </div>
      <ScoredLine />

      <div style={{ background: T.surface, borderRadius: 3, padding: "6px 10px", margin: "8px 0", display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontFamily: "sans-serif", fontSize: 10, color: T.textDim }}>REFERENCE</span>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: T.white }}>A(1,1)  B(4,2)  C(2,4)</span>
      </div>

      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "14px 0 6px" }}>Scale factor k = 2</p>
      <PromptBox>PREDICT: Where will each vertex land after dilation?</PromptBox>
      <DotGrid height={110} />

      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "14px 0 6px" }}>Scale factor k = 0.5</p>
      <PromptBox>PREDICT: The triangle shrinks. Where do the vertices go?</PromptBox>
      <DotGrid height={110} />

      <PromptBox>REVEAL: What rule describes dilation from the origin?</PromptBox>
      <WriteLines count={2} />
      <div style={{ padding: "0 8px" }}>
        <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.textDim, margin: "4px 0" }}>What stayed the same about the triangle? What changed?</p>
      </div>
      <WriteLines count={2} />

      <ProgressDots total={5} current={0} label="Discovery Log" />
    </div>
  );
}

function SimilarityPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.accent}>Discovery Log</SectionLabel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 0" }}>
        <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: 0 }}>SIMILARITY</h2>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim }}>rigid motion + dilation</span>
      </div>
      <ScoredLine />

      <PromptBox>You've applied a rigid motion and a dilation to map one triangle onto another. What can you say about the two triangles now?</PromptBox>

      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "14px 0 6px" }}>Comparing angles</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 6px", lineHeight: 1.4 }}>
        Measure or observe the angles in the original and image triangle.
      </p>
      <div style={{ padding: "0 8px" }}>
        <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.textDim }}>Are corresponding angles equal? What does that tell you?</p>
      </div>
      <WriteLines count={2} />

      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "14px 0 6px" }}>Comparing side lengths</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 6px", lineHeight: 1.4 }}>
        Calculate the ratio of corresponding side lengths.
      </p>
      <div style={{ background: T.surface, borderRadius: 4, padding: "10px 12px", margin: "6px 0" }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim, display: "flex", flexDirection: "column", gap: 6 }}>
          <span>A'B' / AB = ___</span>
          <span>B'C' / BC = ___</span>
          <span>A'C' / AC = ___</span>
        </div>
      </div>
      <div style={{ padding: "4px 8px" }}>
        <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.textDim }}>What do you notice about these ratios?</p>
      </div>
      <WriteLines count={2} />

      <PromptBox>REVEAL: What makes two figures similar (not just congruent)?</PromptBox>
      <WriteLines count={3} />

      <ProgressDots total={5} current={1} label="Discovery Log" />
    </div>
  );
}

function RightTrianglesPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.accent}>Discovery Log</SectionLabel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 0" }}>
        <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: 0 }}>RIGHT TRIANGLES</h2>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim }}>bridge to G-SRT</span>
      </div>
      <ScoredLine />

      <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.text, margin: "8px 0", lineHeight: 1.5 }}>
        When similar triangles are right triangles, something powerful emerges: the ratio of sides depends only on the angle.
      </p>

      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "14px 0 6px" }}>Dilating a right triangle</p>
      <PromptBox>PREDICT: Scale a right triangle by k = 2. What happens to the acute angles?</PromptBox>
      <DotGrid height={120} />
      <WriteLines count={2} />

      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "14px 0 6px" }}>Side ratios in similar right triangles</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 8px", lineHeight: 1.4 }}>
        For two similar right triangles with the same acute angle, compare: opposite / hypotenuse.
      </p>
      <div style={{ background: T.surface, borderRadius: 4, padding: "10px 12px", margin: "6px 0" }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim, display: "flex", flexDirection: "column", gap: 6 }}>
          <span>Original:  opp / hyp = ___</span>
          <span>Dilated:   opp / hyp = ___</span>
        </div>
      </div>

      <PromptBox>REVEAL: Why is this ratio the same regardless of triangle size?</PromptBox>
      <WriteLines count={3} />

      <div style={{ background: T.surface, borderRadius: 4, padding: "10px 16px", textAlign: "center", margin: "12px 0" }}>
        <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.info, margin: 0, fontStyle: "italic" }}>
          This ratio depends only on the angle — not the size of the triangle. That's a remarkable property. It has a name.
        </p>
      </div>

      <ProgressDots total={5} current={2} label="Discovery Log" />
    </div>
  );
}

function CapstonePage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.info}>Discovery Log</SectionLabel>
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.info, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>
        Capstone: Similarity Sequences
      </h2>
      <ScoredLine />

      <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.text, margin: "8px 0", lineHeight: 1.5 }}>
        Describe a sequence of transformations (rigid motions + dilation) that maps one figure to a similar figure.
      </p>

      <div style={{ background: T.surface, borderRadius: 3, padding: "6px 10px", margin: "8px 0", display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontFamily: "sans-serif", fontSize: 10, color: T.textDim }}>REFERENCE</span>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: T.white }}>A(1,1)  B(4,2)  C(2,4)</span>
      </div>

      {["STEP 1", "STEP 2"].map((step) => (
        <div key={step} style={{ margin: "14px 0" }}>
          <p style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: T.accent, margin: "0 0 8px" }}>{step}</p>
          {["TRANSFORMATION TYPE", "PARAMETERS", step === "STEP 1" ? "INTERMEDIATE RESULT" : "FINAL POSITION"].map((field) => (
            <div key={field} style={{ margin: "4px 0 4px 10px" }}>
              <span style={{ fontFamily: "monospace", fontSize: 9, color: T.textDim, letterSpacing: "0.1em" }}>{field}</span>
              <div style={{ borderBottom: `1px solid ${T.border}`, height: 18 }} />
            </div>
          ))}
        </div>
      ))}

      <ScoredLine />
      <PromptBox>Are the original and final triangles similar? How do you know?</PromptBox>
      <WriteLines count={3} />
      <PromptBox>What is the scale factor between the two triangles?</PromptBox>
      <WriteLines count={2} />

      <ProgressDots total={5} current={3} label="Discovery Log" />
    </div>
  );
}

function NotesPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.accent}>Discovery Log</SectionLabel>
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>
        Notes & Observations
      </h2>
      <ScoredLine />
      <DotGrid height={440} />
      <ProgressDots total={5} current={4} label="Discovery Log" />
    </div>
  );
}

function BackCover() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32, textAlign: "center" }}>
      <SectionLabel>Laboratory Grade</SectionLabel>
      <ScoredLine />
      <p style={{ fontFamily: "sans-serif", fontSize: 14, color: T.text, margin: "16px 0 4px" }}>Designed by Randall LaPoint, Jr.</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.textDim, margin: "0 0 4px" }}>17 years in math classrooms.</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.textDim }}>Building the tools that let me serve students at scale.</p>
      <ScoredLine />
      <p style={{ fontFamily: "monospace", fontSize: 12, color: T.accent, margin: "16px 0" }}>creative-lab-five.vercel.app</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.textDim, margin: "0 0 4px" }}>Part of the Grade 8 Geometry Progression</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 10, color: T.textDim }}>Rigid Motions  ·  Dilations & Similarity  ·  Pythagorean Theorem</p>
      <p style={{ fontFamily: "monospace", fontSize: 9, color: T.surfaceHi, marginTop: 24 }}>ISTE LIVE 2026</p>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────

const PAGES = [
  { id: "cover", label: "Cover", Component: Cover },
  { id: "standards", label: "Standards", Component: StandardsPage },
  { id: "phases", label: "Phases", Component: PhasesPage },
  { id: "implementation", label: "Implementation", Component: ImplementationPage },
  { id: "classroom", label: "Classroom", Component: ClassroomPage },
  { id: "dilations", label: "Dilations", Component: DilationsPage },
  { id: "similarity", label: "Similarity", Component: SimilarityPage },
  { id: "right-triangles", label: "Right △", Component: RightTrianglesPage },
  { id: "capstone", label: "Capstone", Component: CapstonePage },
  { id: "notes", label: "Notes", Component: NotesPage },
  { id: "back", label: "Back", Component: BackCover },
];

export default function LabGuideDilations() {
  const [page, setPage] = useState(0);
  const current = PAGES[page];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "sans-serif" }}>
      {/* Navigation strip */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10, background: T.surface,
        borderBottom: `1px solid ${T.border}`, padding: "6px 12px",
        display: "flex", gap: 4, overflowX: "auto", alignItems: "center",
      }}>
        {PAGES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setPage(i)}
            style={{
              background: i === page ? T.accentDim : "transparent",
              border: "none", borderRadius: 3,
              padding: "4px 8px", cursor: "pointer",
              fontFamily: "monospace", fontSize: 9,
              color: i === page ? T.accent : T.textDim,
              whiteSpace: "nowrap", letterSpacing: "0.05em",
              transition: "all 0.2s",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <current.Component />
      </div>

      {/* Page turn controls */}
      <div style={{
        display: "flex", justifyContent: "space-between", padding: "12px 20px 24px",
        maxWidth: 420, margin: "0 auto",
      }}>
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          style={{
            background: "transparent", border: `1px solid ${T.border}`,
            borderRadius: 3, padding: "6px 16px", cursor: page === 0 ? "default" : "pointer",
            fontFamily: "monospace", fontSize: 10, color: page === 0 ? T.surfaceHi : T.textDim,
          }}
        >
          ← PREV
        </button>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: T.surfaceHi, alignSelf: "center" }}>
          {page + 1} / {PAGES.length}
        </span>
        <button
          onClick={() => setPage(Math.min(PAGES.length - 1, page + 1))}
          disabled={page === PAGES.length - 1}
          style={{
            background: "transparent", border: `1px solid ${T.border}`,
            borderRadius: 3, padding: "6px 16px", cursor: page === PAGES.length - 1 ? "default" : "pointer",
            fontFamily: "monospace", fontSize: 10, color: page === PAGES.length - 1 ? T.surfaceHi : T.textDim,
          }}
        >
          NEXT →
        </button>
      </div>
    </div>
  );
}