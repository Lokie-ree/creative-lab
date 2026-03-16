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
      <div style={{ fontFamily: "sans-serif", fontSize: 9, color: T.surfaceHi, padding: "0 8px 4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>sketch your prediction</div>
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
      <h1 style={{ fontFamily: "sans-serif", fontSize: 28, fontWeight: 700, color: T.white, margin: "24px 0 4px", lineHeight: 1.2 }}>Rigid Motions</h1>
      <h1 style={{ fontFamily: "sans-serif", fontSize: 28, fontWeight: 700, color: T.white, margin: "0 0 16px", lineHeight: 1.2 }}>& Congruence</h1>
      <p style={{ fontFamily: "sans-serif", fontSize: 14, color: T.text, margin: "0 0 4px" }}>Grade 8 Mathematics</p>
      <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.textDim }}>IVLA STEM Club</p>
      <div style={{ display: "flex", gap: 8, margin: "24px 0", flexWrap: "wrap", justifyContent: "center" }}>
        <Badge>8.G.A.1</Badge><Badge>8.G.A.2</Badge><Badge>8.G.A.3</Badge>
      </div>
      <ScoredLine />
      <p style={{ fontFamily: "sans-serif", fontSize: 15, color: T.accent, fontStyle: "italic", margin: "16px 0", maxWidth: 320 }}>
        "What stays the same when a shape moves?"
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
        { code: "8.G.A.1", desc: "Verify experimentally the properties of rotations, reflections, and translations: lines are taken to lines, angle measures are preserved, parallel lines are taken to parallel lines." },
        { code: "8.G.A.2", desc: "Understand that a two-dimensional figure is congruent to another if the second can be obtained from the first by a sequence of rotations, reflections, and translations; given two congruent figures, describe a sequence that exhibits the congruence." },
        { code: "8.G.A.3", desc: "Describe the effect of dilations, translations, rotations, and reflections on two-dimensional figures using coordinates. Rotations are only about the origin; reflections are only over the x-axis and y-axis in Grade 8." },
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
        <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 0 8px", lineHeight: 1.4 }}>Students understand why distances and angles are preserved under rigid motions — not just that they are.</p>
        <p style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 600, color: T.white, margin: "10px 0 2px" }}>Procedural Skill</p>
        <p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.text, margin: "0 0 0 8px", lineHeight: 1.4 }}>Students apply coordinate rules for translations, reflections, and rotations after demonstrating spatial mastery.</p>
      </div>
      <ScoredLine />
      <SectionLabel>Achievement Level Progression</SectionLabel>
      {[
        { level: "Level 3", label: "Basic", color: T.textDim, desc: "Predict transformation outputs spatially. No coordinates visible. Building intuition through manipulation." },
        { level: "Level 4", label: "Mastery", color: T.accent, desc: "Coordinate rules revealed after spatial mastery. Connect spatial reasoning to algebraic representation." },
        { level: "Level 5", label: "Advanced", color: T.info, desc: "Build multi-step transformation sequences. Justify congruence by describing the sequence mapping one figure to another." },
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
        { num: "01", title: "Spatial Exploration", desc: "Drag a ghost shape to explore spatial relationships. No scoring, no coordinates — pure manipulation. Building the mental model that makes everything else possible." },
        { num: "02", title: "Predict & Reveal", desc: "The core loop. Commit a prediction by placing the ghost, then watch the animated reveal. Immediate visual feedback — no multiple choice. Scoring tracks accuracy across translations, reflections, and rotations." },
        { num: "03", title: "Coordinate Layer", desc: "The earned reveal. After demonstrating spatial mastery, coordinate notation appears. The formula is a label for a known idea — not an instruction to memorize." },
        { num: "04", title: "Capstone", desc: "Build two-step transformation sequences. The inverse task: given both figures, identify the sequence. Level 5 — describing sequences to justify congruence." },
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
        <p style={{ fontFamily: "sans-serif", fontSize: 14, color: T.accent, margin: "0 0 4px" }}>Discovery before formula.</p>
        <p style={{ fontFamily: "sans-serif", fontSize: 14, color: T.accent, margin: "0 0 8px" }}>Manipulation before explanation.</p>
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
        { label: "DURATION", value: "2–3 class periods (45 min each)" },
        { label: "DEVICES", value: "Desktop or laptop recommended; tablet supported" },
        { label: "SETUP", value: "No account required. Navigate to URL. Students begin immediately." },
        { label: "TEACHER ROLE", value: "Observer and facilitator — the module is self-guided." },
        { label: "SHAPE FAMILY", value: "Scalene triangle — A(1,1) B(4,2) C(2,4). This triangle carries through all three modules in the progression." },
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
        { title: "Skipping prediction", desc: "Encourage genuine commitment. The predict/reveal loop only builds understanding if the prediction is real." },
        { title: "Spatial mastery, notation struggle", desc: "Expected and by design. The L3→L4 boundary is where spatial understanding meets algebraic representation. Give it time." },
        { title: "Discovering non-commutativity", desc: "In the capstone, some notice that transformation order matters. This is a Level 5 insight — name it when you see it." },
        { title: "Engagement signals", desc: "\"That's sick.\" \"Wait, how did it know?\" \"Can I try another one?\" These mean the instrument is working." },
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
      <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.text, margin: "8px 0", lineHeight: 1.5 }}>
        The module is self-guided, but strategic teacher moves amplify the learning.
      </p>
      {[
        { when: "Before the module", move: "Ask: \"When you slide a book across a desk, what changes? What doesn't?\" Let students generate hypotheses. Do not define rigid motion yet." },
        { when: "During Phase 1–2", move: "Circulate and listen. Students will talk about predictions. Resist correcting — the reveal does that. Note which transformations produce the most surprise." },
        { when: "At the Phase 3 boundary", move: "This is the earned reveal. Students who struggled with coordinates in prior units may break through here because spatial understanding is already in place." },
        { when: "During the capstone", move: "Ask pairs to compare sequences. \"Did you both get the same result? Is there another sequence that works?\" This surfaces non-commutativity naturally." },
        { when: "After the module", move: "Debrief with the core question: \"What stays the same when a shape moves?\" Students should now answer with precision — distances, angles, parallelism." },
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

function TranslationsPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.accent}>Discovery Log</SectionLabel>
      <div style={{ display: "flex", gap: 16, margin: "12px 0 0" }}>
        <div style={{ flex: 1 }}><span style={{ fontFamily: "sans-serif", fontSize: 10, color: T.textDim }}>NAME</span><div style={{ borderBottom: `1px solid ${T.border}`, height: 16 }} /></div>
        <div style={{ flex: 1 }}><span style={{ fontFamily: "sans-serif", fontSize: 10, color: T.textDim }}>DATE</span><div style={{ borderBottom: `1px solid ${T.border}`, height: 16 }} /></div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "14px 0 0" }}>
        <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: 0 }}>TRANSLATIONS</h2>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim }}>(x, y) → ( ?, ? )</span>
      </div>
      <ScoredLine />
      <div style={{ background: T.surface, borderRadius: 3, padding: "6px 10px", margin: "8px 0", display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontFamily: "sans-serif", fontSize: 10, color: T.textDim }}>REFERENCE</span>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: T.white }}>A(1,1)  B(4,2)  C(2,4)</span>
      </div>
      <PromptBox>PREDICT: Where will the triangle land?</PromptBox>
      <DotGrid height={130} />
      <PromptBox>REVEAL: What rule did you discover?</PromptBox>
      <div style={{ padding: "0 8px" }}><p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.textDim, margin: "4px 0" }}>The coordinate rule for this translation:</p></div>
      <WriteLines count={2} />
      <div style={{ padding: "0 8px" }}><p style={{ fontFamily: "sans-serif", fontSize: 11, color: T.textDim, margin: "4px 0" }}>What stayed the same about the triangle?</p></div>
      <WriteLines count={2} />
      <ProgressDots total={5} current={0} label="Discovery Log" />
    </div>
  );
}

function ReflectionsPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.accent}>Discovery Log</SectionLabel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 0" }}>
        <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: 0 }}>REFLECTIONS</h2>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim }}>(x, y) → ( ?, ? )</span>
      </div>
      <ScoredLine />
      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "12px 0 6px" }}>Reflect over the x-axis</p>
      <PromptBox>PREDICT: Where will each vertex land?</PromptBox>
      <DotGrid height={100} />
      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "14px 0 6px" }}>Reflect over the y-axis</p>
      <PromptBox>PREDICT: Where will each vertex land?</PromptBox>
      <DotGrid height={100} />
      <PromptBox>REVEAL: What coordinates changed? What stayed the same?</PromptBox>
      <WriteLines count={3} />
      <ProgressDots total={5} current={1} label="Discovery Log" />
    </div>
  );
}

function RotationsPage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.accent}>Discovery Log</SectionLabel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "12px 0 0" }}>
        <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.white, margin: 0 }}>ROTATIONS</h2>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textDim }}>(x, y) → ( ?, ? )</span>
      </div>
      <ScoredLine />
      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "12px 0 6px" }}>90° counterclockwise about the origin</p>
      <PromptBox>PREDICT: Where will the triangle land?</PromptBox>
      <DotGrid height={110} />
      <p style={{ fontFamily: "sans-serif", fontWeight: 600, fontSize: 13, color: T.accent, margin: "14px 0 6px" }}>180° about the origin</p>
      <PromptBox>PREDICT: What happens to (x, y)?</PromptBox>
      <DotGrid height={100} />
      <PromptBox>REVEAL: Describe the pattern in the coordinates.</PromptBox>
      <WriteLines count={3} />
      <ProgressDots total={5} current={2} label="Discovery Log" />
    </div>
  );
}

function CapstonePage() {
  return (
    <div style={{ padding: "24px 20px" }}>
      <SectionLabel color={T.info}>Discovery Log</SectionLabel>
      <h2 style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: T.info, textTransform: "uppercase", letterSpacing: "0.05em", margin: "12px 0 4px" }}>Capstone: Sequence Builder</h2>
      <ScoredLine />
      <p style={{ fontFamily: "sans-serif", fontSize: 12, color: T.text, margin: "8px 0", lineHeight: 1.5 }}>Build a two-step transformation sequence. Predict the final position after both transformations are applied in order.</p>
      <div style={{ background: T.surface, borderRadius: 3, padding: "6px 10px", margin: "8px 0", display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontFamily: "sans-serif", fontSize: 10, color: T.textDim }}>REFERENCE</span>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: T.white }}>A(1,1)  B(4,2)  C(2,4)</span>
      </div>
      {["STEP 1", "STEP 2"].map((step) => (
        <div key={step} style={{ margin: "14px 0" }}>
          <p style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: T.accent, margin: "0 0 8px" }}>{step}</p>
          {["TRANSFORMATION TYPE", "PARAMETERS", step === "STEP 1" ? "PREDICTED RESULT  A'( , )  B'( , )  C'( , )" : "FINAL POSITION  A''( , )  B''( , )  C''( , )"].map((field) => (
            <div key={field} style={{ margin: "4px 0 4px 10px" }}>
              <span style={{ fontFamily: "monospace", fontSize: 9, color: T.textDim, letterSpacing: "0.1em" }}>{field}</span>
              <div style={{ borderBottom: `1px solid ${T.border}`, height: 18 }} />
            </div>
          ))}
        </div>
      ))}
      <ScoredLine />
      <PromptBox>Are the original and final triangles congruent? What evidence supports your answer?</PromptBox>
      <WriteLines count={3} />
      <PromptBox>Does the order of your steps matter? How do you know?</PromptBox>
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
  { id: "translations", label: "Translate", Component: TranslationsPage },
  { id: "reflections", label: "Reflect", Component: ReflectionsPage },
  { id: "rotations", label: "Rotate", Component: RotationsPage },
  { id: "capstone", label: "Capstone", Component: CapstonePage },
  { id: "notes", label: "Notes", Component: NotesPage },
  { id: "back", label: "Back", Component: BackCover },
];

export default function LabGuideRigidMotions() {
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