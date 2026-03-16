import { useState } from "react";

const T = {
  bg: "#1e1d1c", surface: "#252422", surfaceHi: "#2e2c28", border: "#2e2c28",
  text: "#b8b0a4", textDim: "#7a746a", accent: "#7cc87c", accentDim: "rgba(124,200,124,0.22)",
  white: "#e8e2da", danger: "#c87c7c", info: "#7caac8",
};

function ProgressDots({ total, current, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 0 8px" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{
            width: i === current ? 14 : 8, height: i === current ? 14 : 8, borderRadius: "50%",
            background: i < current ? T.accent : i === current ? T.accent : "transparent",
            border: i === current ? `2px solid ${T.accent}` : i < current ? "none" : `1px solid ${T.textDim}`,
            boxShadow: i === current ? `0 0 8px ${T.accentDim}` : "none", transition: "all 0.3s ease",
          }} />
        ))}
      </div>
      {label && <span style={{ fontFamily: "monospace", fontSize: 9, color: T.surfaceHi, letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</span>}
    </div>
  );
}

function ScoredLine() { return <div style={{ height: 1, background: T.border, margin: "8px 0" }} />; }
function SectionLabel({ children, color }) {
  return <span style={{ fontFamily: "monospace", fontSize: 9, color: color || T.textDim, letterSpacing: "0.2em", textTransform: "uppercase" }}>{children}</span>;
}
function Badge({ children, color }) {
  return <span style={{ display: "inline-block", fontFamily: "monospace", fontSize: 11, color: color || T.accent, background: T.accentDim, padding: "3px 8px", borderRadius: 3 }}>{children}</span>;
}
function PromptBox({ children }) {
  return <div style={{ background: T.surface, borderRadius: 4, padding: "8px 12px", margin: "8px 0" }}><span style={{ fontFamily: "sans-serif", fontSize: 13, color: T.white }}>{children}</span></div>;
}
function DotGrid({ height = 120 }) {
  const dots = [];
  const spacing = 16; const cols = 22; const rows = Math.floor(height / spacing);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
    dots.push(<circle key={`${r}-${c}`} cx={10 + c * spacing} cy={10 + r * spacing} r={1} fill={T.textDim} opacity={0.5} />);
  return (
    <div style={{ background: T.surface, borderRadius: 4, padding: 4, margin: "6px 0" }}>
      <svg width="100%" height={height} viewBox={`0 0 ${10 + cols * spacing} ${10 + rows * spacing}`}>{dots}</svg>
      <div style={{ fontFamily: "sans-serif", fontSize: 9, color: T.surfaceHi, padding: "0 8px 4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>sketch your work</div>
    </div>
  );
}
function WriteLines({ count = 3 }) {
  return <div style={{ padding: "4px 8px" }}>{Array.from({ length: count }, (_, i) => <div key={i} style={{ borderBottom: `1px solid ${T.border}`, height: 22 }} />)}</div>;
}

// ── PAGES ─────────────────────────────────────────────────────

function Cover() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32, textAlign: "center" }}>
      <SectionLabel>Lab Guide</SectionLabel>
      <ScoredLine />
      <h1 style={{ fontFamily: "sans-serif", fontSize: 28, fontWeight: 700, color: T.white, margin: "24px 0 4px", lineHeight: 1.2 }}>Pythagorean</h1>
      <h1 style={{ fontFamily: "sans-serif", fontSize: 28, fontWeight: 700, color: T.white, margin: "0 0 16px", lineHeight: 1.2 }}>Theorem</h1>
      <p style={{ fontFamily: "sans-serif", fontSize: 14, color: T.text, margin: "0 0 4px" }}>Grade 8 Mathematics</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.textDim }}>IVLA STEM Club</p>
      <div style={{ display: "flex", gap: 8, margin: "24px 0", flexWrap: "wrap", justifyContent: "center" }}>
        <Badge>8.G.B.6</Badge><Badge>8.G.B.7</Badge><Badge>8.G.B.8</Badge>
      </div>
      <ScoredLine />
      <p style={{ fontFamily: "sans-serif", fontSize: 15, color: T.accent, fontStyle: "italic", margin: "16px 0", maxWidth: 320 }}>
        "What's hiding inside every right triangle?"
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
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>Standards Alignment</h2>
      <ScoredLine />
      {[
        { code: "8.G.B.6", desc: "Explain a proof of the Pythagorean Theorem and its converse using the area of squares." },
        { code: "8.G.B.7", desc: "Apply the Pythagorean Theorem to determine unknown side lengths in right triangles in real-world and mathematical problems in two and three dimensions." },
        { code: "8.G.B.8", desc: "Apply the Pythagorean Theorem to find the distance between two points in a coordinate system." },
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
        <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 0 8px", lineHeight: 1.4 }}>Students explain why the sum of the squares of the legs equals the square of the hypotenuse — through area models, not memorization.</p>
        <p style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 600, color: T.white, margin: "10px 0 2px" }}>Procedural Skill</p>
        <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 0 8px", lineHeight: 1.4 }}>Students apply a² + b² = c² to find unknown side lengths and distance between coordinate points.</p>
        <p style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 600, color: T.white, margin: "10px 0 2px" }}>Application</p>
        <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 0 8px", lineHeight: 1.4 }}>Students apply the theorem in real-world and mathematical problems in two and three dimensions.</p>
      </div>
      <ScoredLine />
      <SectionLabel>Achievement Level Progression</SectionLabel>
      {[
        { level: "Level 3", label: "Basic", color: T.textDim, desc: "Apply the Pythagorean Theorem to find the hypotenuse in a simple planar case without coordinates." },
        { level: "Level 4", label: "Mastery", color: T.accent, desc: "Apply the theorem in simple planar cases and to find distance between two points in a coordinate system." },
        { level: "Level 5", label: "Advanced", color: T.info, desc: "Apply the theorem in real-world problems in two and three dimensions. Recognize situations requiring multi-step reasoning." },
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
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel>Teacher Section</SectionLabel>
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>Module Phases</h2>
      <ScoredLine />
      {[
        { num: "01", title: "Area Exploration", desc: "Students manipulate squares built on each side of a right triangle. Drag, resize, observe. The visual proof emerges: the two smaller squares tile perfectly into the larger one. No formula yet — just area." },
        { num: "02", title: "Predict & Reveal: Side Lengths", desc: "Given two sides, predict the third. The reveal shows the calculation alongside the visual proof. Students see that a² + b² = c² is a description of what the areas already showed them." },
        { num: "03", title: "Coordinate Distance", desc: "The earned reveal: connect the theorem to distance. Two points on a coordinate grid. Draw the right triangle. The hypotenuse IS the distance. Students discover the distance formula as a consequence of what they already know." },
        { num: "04", title: "Capstone: Real-World & 3D", desc: "Multi-step problems in context. Find the diagonal of a rectangular prism. Calculate the distance a drone travels. Level 5 — applying the theorem in situations that require constructing the right triangle first." },
      ].map(({ num, title, desc }) => (
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
        <p style={{ fontFamily: "sans-serif", fontSize: 14, color: T.accent, margin: "0 0 4px" }}>See the proof before you see the formula.</p>
        <p style={{ fontFamily: "sans-serif", fontSize: 14, color: T.accent, margin: "0 0 8px" }}>The equation names what the squares already showed.</p>
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
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>Implementation Notes</h2>
      <ScoredLine />
      {[
        { label: "PREREQUISITE", value: "Modules 1 & 2 complete (rigid motions, dilations). Students should be comfortable with coordinate rules." },
        { label: "DURATION", value: "2–3 class periods (45 min each)" },
        { label: "DEVICES", value: "Desktop or laptop recommended; tablet supported" },
        { label: "SHAPE FAMILY", value: "The scalene triangle evolves. Module 3 introduces a right-triangle variant of the familiar shape — same vertex labeling, new property to discover." },
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
        { title: "Confusing legs and hypotenuse", desc: "The area model in Phase 1 anchors this. If a student misidentifies the hypotenuse, redirect to the visual: 'Which is the longest side? Which square is biggest?'" },
        { title: "The non-right triangle test", desc: "Students should test the theorem on non-right triangles and see it fail. This is how the converse becomes meaningful — not by memorizing it, but by seeing the breakdown." },
        { title: "Distance formula as discovery", desc: "Phase 3 is where many students have an 'aha' moment. The distance formula isn't a new thing to memorize — it's the Pythagorean Theorem on a coordinate grid. Watch for that recognition." },
        { title: "3D extension in capstone", desc: "Some students will struggle to construct the right triangle in 3D problems. Encourage them to draw the 2D slice first, then extend. This is genuine Type III reasoning." },
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
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>Classroom Integration</h2>
      <ScoredLine />
      {[
        { when: "Before the module", move: "Draw a right triangle on the board. Build squares on each side. Ask: 'Is there a relationship between the areas of these squares?' Let students conjecture." },
        { when: "During Phase 1", move: "This is the proof phase. Students should spend real time here. Resist jumping to the formula. The visual proof IS the understanding — the formula is just shorthand." },
        { when: "During Phase 2", move: "Watch for students who can find the hypotenuse but struggle to find a leg. This reveals whether they understand the equation structurally or just procedurally." },
        { when: "At Phase 3", move: "Connect explicitly: 'You already know how to find the third side. What if the two points ARE two vertices of a right triangle?' Let them construct the third vertex themselves." },
        { when: "During the capstone", move: "3D problems require students to decompose the situation into right triangles. This is Type III reasoning — they must model before they calculate. Celebrate the modeling, not just the answer." },
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

// ── Student Discovery Log ─────────────────────────────────────

function AreaProofPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.accent}>Discovery Log</SectionLabel>
      <div style={{ display: "flex", gap: 16, margin: "12px 0 0" }}>
        <div style={{ flex: 1 }}><span style={{ fontFamily: "sans-serif", fontSize: 10, color: T.textDim }}>NAME</span><div style={{ borderBottom: `1px solid ${T.border}`, height: 16 }} /></div>
        <div style={{ flex: 1 }}><span style={{ fontFamily: "sans-serif", fontSize: 10, color: T.textDim }}>DATE</span><div style={{ borderBottom: `1px solid ${T.border}`, height: 16 }} /></div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "14px 0 0" }}>
        <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: 0 }}>THE AREA PROOF</h2>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim }}>a² + b² = ?</span>
      </div>
      <ScoredLine />
      <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.text, margin: "8px 0", lineHeight: 1.5 }}>
        Build squares on each side of a right triangle. Measure or calculate their areas.
      </p>
      <div style={{ background: T.surface, borderRadius: 4, padding: "10px 12px", margin: "8px 0" }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim, display: "flex", flexDirection: "column", gap: 8 }}>
          <span>Square on side a:  area = ___</span>
          <span>Square on side b:  area = ___</span>
          <span>Square on side c:  area = ___</span>
        </div>
      </div>
      <PromptBox>What relationship do you see between the three areas?</PromptBox>
      <WriteLines count={2} />
      <DotGrid height={130} />
      <PromptBox>PREDICT: Does this relationship hold for ALL right triangles?</PromptBox>
      <WriteLines count={2} />
      <PromptBox>Test with a non-right triangle. Does the relationship still hold?</PromptBox>
      <WriteLines count={2} />
      <ProgressDots total={5} current={0} label="Discovery Log" />
    </div>
  );
}

function SideLengthsPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.accent}>Discovery Log</SectionLabel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 0" }}>
        <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: 0 }}>FINDING SIDE LENGTHS</h2>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim }}>a² + b² = c²</span>
      </div>
      <ScoredLine />

      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "12px 0 6px" }}>Finding the hypotenuse</p>
      <div style={{ background: T.surface, borderRadius: 4, padding: "8px 12px", margin: "4px 0" }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: T.white }}>a = 3, b = 4, c = ?</span>
      </div>
      <PromptBox>PREDICT: What is c?</PromptBox>
      <WriteLines count={2} />

      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "14px 0 6px" }}>Finding a leg</p>
      <div style={{ background: T.surface, borderRadius: 4, padding: "8px 12px", margin: "4px 0" }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: T.white }}>a = ?, b = 5, c = 13</span>
      </div>
      <PromptBox>PREDICT: What is a? How is this different from finding c?</PromptBox>
      <WriteLines count={3} />

      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "14px 0 6px" }}>Non-integer result</p>
      <div style={{ background: T.surface, borderRadius: 4, padding: "8px 12px", margin: "4px 0" }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: T.white }}>a = 1, b = 1, c = ?</span>
      </div>
      <PromptBox>REVEAL: What is c? Express it exactly, then as a decimal.</PromptBox>
      <WriteLines count={2} />

      <ProgressDots total={5} current={1} label="Discovery Log" />
    </div>
  );
}

function CoordinateDistancePage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.accent}>Discovery Log</SectionLabel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 0" }}>
        <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: 0 }}>COORDINATE DISTANCE</h2>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim }}>d = ?</span>
      </div>
      <ScoredLine />

      <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.text, margin: "8px 0", lineHeight: 1.5 }}>
        Plot two points. Draw a right triangle using horizontal and vertical segments. The hypotenuse is the distance.
      </p>

      <div style={{ background: T.surface, borderRadius: 3, padding: "6px 10px", margin: "8px 0" }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: T.white }}>Point 1: (1, 2)    Point 2: (4, 6)</span>
      </div>

      <PromptBox>PREDICT: What are the horizontal and vertical distances?</PromptBox>
      <DotGrid height={140} />

      <div style={{ background: T.surface, borderRadius: 4, padding: "10px 12px", margin: "8px 0" }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim, display: "flex", flexDirection: "column", gap: 6 }}>
          <span>Horizontal distance (Δx): ___</span>
          <span>Vertical distance (Δy):   ___</span>
          <span>Distance (hypotenuse):    ___</span>
        </div>
      </div>

      <PromptBox>REVEAL: How is finding distance the same as finding a hypotenuse?</PromptBox>
      <WriteLines count={3} />

      <div style={{ background: T.surface, borderRadius: 4, padding: "10px 16px", textAlign: "center", margin: "12px 0" }}>
        <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.info, margin: 0, fontStyle: "italic" }}>
          The distance formula isn't new. It's the Pythagorean Theorem on a coordinate grid.
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
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.info, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>Capstone: Real-World & 3D</h2>
      <ScoredLine />

      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "12px 0 6px" }}>Problem 1: The Ladder</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 6px", lineHeight: 1.4 }}>
        A 10-foot ladder leans against a wall. The base is 6 feet from the wall. How high does the ladder reach?
      </p>
      <PromptBox>Draw the right triangle. Label the sides. Solve.</PromptBox>
      <DotGrid height={100} />
      <WriteLines count={2} />

      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "14px 0 6px" }}>Problem 2: Coordinate Distance</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 6px", lineHeight: 1.4 }}>
        Find the distance between (−3, −1) and (5, 3).
      </p>
      <PromptBox>Construct the right triangle on the coordinate grid. Calculate.</PromptBox>
      <DotGrid height={100} />
      <WriteLines count={2} />

      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.info, margin: "14px 0 6px" }}>Problem 3: 3D Extension</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 6px", lineHeight: 1.4 }}>
        A rectangular box is 3 ft × 4 ft × 12 ft. Find the length of the longest diagonal (corner to opposite corner).
      </p>
      <WriteLines count={3} />

      <ScoredLine />
      <PromptBox>Why does the Pythagorean Theorem only work for right triangles?</PromptBox>
      <WriteLines count={3} />

      <ProgressDots total={5} current={3} label="Discovery Log" />
    </div>
  );
}

function NotesPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.accent}>Discovery Log</SectionLabel>
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>Notes & Observations</h2>
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

const PAGES = [
  { id: "cover", label: "Cover", Component: Cover },
  { id: "standards", label: "Standards", Component: StandardsPage },
  { id: "phases", label: "Phases", Component: PhasesPage },
  { id: "implementation", label: "Implement", Component: ImplementationPage },
  { id: "classroom", label: "Classroom", Component: ClassroomPage },
  { id: "area-proof", label: "Area Proof", Component: AreaProofPage },
  { id: "side-lengths", label: "Side Lengths", Component: SideLengthsPage },
  { id: "distance", label: "Distance", Component: CoordinateDistancePage },
  { id: "capstone", label: "Capstone", Component: CapstonePage },
  { id: "notes", label: "Notes", Component: NotesPage },
  { id: "back", label: "Back", Component: BackCover },
];

export default function LabGuidePythagorean() {
  const [page, setPage] = useState(0);
  const current = PAGES[page];
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "sans-serif" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "6px 12px", display: "flex", gap: 4, overflowX: "auto", alignItems: "center" }}>
        {PAGES.map((p, i) => (
          <button key={p.id} onClick={() => setPage(i)} style={{
            background: i === page ? T.accentDim : "transparent", border: "none", borderRadius: 3,
            padding: "4px 8px", cursor: "pointer", fontFamily: "monospace", fontSize: 9,
            color: i === page ? T.accent : T.textDim, whiteSpace: "nowrap", letterSpacing: "0.05em", transition: "all 0.2s",
          }}>{p.label}</button>
        ))}
      </div>
      <div style={{ maxWidth: 420, margin: "0 auto" }}><current.Component /></div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px 24px", maxWidth: 420, margin: "0 auto" }}>
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 3, padding: "6px 16px", cursor: page === 0 ? "default" : "pointer", fontFamily: "monospace", fontSize: 10, color: page === 0 ? T.surfaceHi : T.textDim }}>← PREV</button>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: T.surfaceHi, alignSelf: "center" }}>{page + 1} / {PAGES.length}</span>
        <button onClick={() => setPage(Math.min(PAGES.length - 1, page + 1))} disabled={page === PAGES.length - 1} style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 3, padding: "6px 16px", cursor: page === PAGES.length - 1 ? "default" : "pointer", fontFamily: "monospace", fontSize: 10, color: page === PAGES.length - 1 ? T.surfaceHi : T.textDim }}>NEXT →</button>
      </div>
    </div>
  );
}