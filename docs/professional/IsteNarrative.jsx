import { useState } from "react";

const NARRATIVE = {
  title: "Formulas Can Wait",
  subtitle: "What Happened When We Let Students Discover Geometry Before We Named It",
  format: "ISTE Live 27 — Formal Presentation",
  premise:
    "Most EdTech presentations show something that was built for a conference. This one shows something that was built for students, tested with students, refined by what students actually did — and then brought to a conference to see what strangers would do with it. The findings from both audiences shape everything that follows.",

  acts: [
    {
      id: "hook",
      number: "00",
      title: "The Hook",
      duration: "90 seconds",
      color: "#f43f5e",
      intent:
        "Open with the moment, not the thesis. The audience needs to feel the problem before they hear the framework.",
      content: [
        {
          type: "moment",
          text: "Open with the capstone interaction. No slides. Project the live module. A triangle sits on a coordinate grid. A second triangle appears somewhere else. The task: build the sequence of transformations that maps one onto the other.",
        },
        {
          type: "beat",
          text: "Do it yourself, live, in front of the room. Drag. Reflect. Rotate. The ghost lands on the target. The coordinates update. The celebration fires.",
        },
        {
          type: "beat",
          text: "Then the line: \"Every student who reaches this screen built their way here. No one was told the formula first. The formula was the reward.\"",
        },
      ],
      notes:
        "This is the 'demonstration of competence, not a claim of competence' principle applied to the presentation itself. You don't tell the audience the module works. You show them it works. Same pedagogy, different room.",
    },
    {
      id: "problem",
      number: "01",
      title: "The Problem We All Recognize",
      duration: "3 minutes",
      color: "#f59e0b",
      intent:
        "Name the tension every math teacher in the room has felt. This is where you earn the right to propose a different approach.",
      content: [
        {
          type: "thesis",
          text: "The notation-first model: formulas and abstract symbols appear before students understand what they represent. Students memorize before they comprehend. They mimic mathematics rather than reason mathematically.",
        },
        {
          type: "evidence",
          text: "The ALD data tells the story. Level 3 (Basic) students can describe transformations spatially. Level 4 (Mastery) requires coordinates. The gap between L3 and L4 is exactly where notation-first instruction loses students — they can see what a reflection does, but the moment you write (x,y) → (-x,y) the understanding evaporates.",
        },
        {
          type: "pivot",
          text: "What if we reversed the sequence? What if students manipulated transformations until they understood the pattern — and then we showed them the notation as a label for something they already knew?",
        },
      ],
      notes:
        "This is philosophy.md distilled to its core argument. The audience of math teachers will recognize this immediately because they've watched it happen in their own classrooms. You're not lecturing them — you're naming their shared experience.",
    },
    {
      id: "framework",
      number: "02",
      title: "The Framework: Earned Reveals",
      duration: "4 minutes",
      color: "#2dd4bf",
      intent:
        "Introduce the pedagogical model with just enough structure to be useful, grounded in the three-phase design.",
      content: [
        {
          type: "framework",
          text: "Three phases: Manipulation → Pattern Recognition → Formalization. Students interact with mathematical properties directly. Through repeated interaction, they observe consistent behaviors. Notation appears as confirmation — 'what you just discovered, here's the rule.'",
        },
        {
          type: "distinction",
          text: "Visual confirmation vs. traditional assessment. Students don't select 'reflection over y-axis' from a multiple choice list. They drag the ghost shape to the predicted position. Success proves understanding; guessing is not viable. Demonstration of competence, not a claim of competence.",
        },
        {
          type: "standards",
          text: "This isn't pedagogy floating free of standards. Every phase maps to a specific ALD level. L3 entry: spatial reasoning without coordinates. L4 target: coordinates activate, notation emerges. L5 capstone: inverse task — build the transformation sequence. The module doesn't just teach the standard, it walks students across the achievement level boundaries the state has already defined.",
        },
      ],
      notes:
        "The ALD alignment is your credibility move with curriculum-minded audience members. Most interactive math demos are pedagogically interesting but standards-vague. Yours is the opposite — every design decision traces back to a specific descriptor in the Louisiana ALD document.",
    },
    {
      id: "demo",
      number: "03",
      title: "The Live Demo: One Student's Journey",
      duration: "6 minutes",
      color: "#818cf8",
      intent:
        "Walk the audience through the full module progression as if they were a student encountering it for the first time. This is the heart of the presentation.",
      content: [
        {
          type: "phase",
          label: "Phase 1 — Spatial Intuition",
          text: "No coordinates visible. A triangle. A translation vector. 'Where will it land?' Student drags the ghost. Reveal animation plays. The distance was right, the shape is identical. No formula needed — spatial reasoning is doing the work.",
        },
        {
          type: "phase",
          label: "Phase 2 — Predict & Reveal",
          text: "Reflections. Rotations. Each time: predict, then verify. The module never says 'wrong' — it says 'here's what happened' and lets the visual do the teaching. Progressive difficulty, same interaction pattern. Students build confidence through repetition with variation.",
        },
        {
          type: "phase",
          label: "Phase 3 — Coordinates Activate",
          text: "Now the coordinate labels appear. A(1,1) B(4,2) C(2,4). The student reflects over the y-axis and watches: A(1,1) → A'(-1,1). They do it three more times. The pattern writes itself. The FormulaReadout appears: (x,y) → (-x,y). That's not a formula they memorized. That's a formula they earned.",
        },
        {
          type: "phase",
          label: "Phase 4 — Capstone",
          text: "Two figures. No instructions beyond: 'Build the sequence.' The student selects transformations, orders them, previews the result. When the ghost lands on the target, they've demonstrated 8.G.A.2 at Level 5. The celebration modal isn't decoration — it's the system confirming mastery.",
        },
      ],
      notes:
        "Invite an audience member to try it live during this section. Hand them your phone or have them scan the QR. If they hesitate at any point, that's data — and it's the same kind of data you collected at ISTE 26. The presentation is itself a research session.",
    },
    {
      id: "evidence",
      number: "04",
      title: "What We Learned: Two Audiences, One Signal",
      duration: "5 minutes",
      color: "#34d399",
      intent:
        "Present findings from STEM Club sessions and ISTE 26 exhibit hall interactions. This is the 'formalize the findings' promise from last year.",
      content: [
        {
          type: "audience",
          label: "STEM Club Students (twice weekly, ongoing)",
          text: "What worked: the predict/reveal loop created genuine engagement — students argued about where the ghost would land before dragging. What surprised us: the coordinate reveal timing mattered enormously. Too early and students stopped reasoning spatially. Too late and they felt lost when notation appeared. The current phasing is the result of watching 8th graders interact with five iterations of the timing.",
        },
        {
          type: "audience",
          label: "ISTE 26 Conference Attendees (cold start, no instruction)",
          text: "The exhibit hall test: hand someone a phone, no context. Where do they hesitate? Where do they accelerate? How many reach the capstone? The cold-start data validated the onboarding design — or didn't, and we fixed what didn't work. Every person who completed the module at the conference was an unwitting research participant.",
        },
        {
          type: "synthesis",
          text: "The two audiences tested different things. Students tested whether the pedagogy works for learning over time. Conference attendees tested whether the interaction design communicates without explanation. Both signals shaped the same module. The version you're seeing today has been refined by both.",
        },
      ],
      notes:
        "This is the section that separates you from every other EdTech presenter. Most demos show a product. You're showing a product AND the research methodology that shaped it AND the findings. The 'plant flag, collect signal' strategy from ISTE 26 pays off here — you planted the flag, you collected the signal, and now you're presenting what the signal said.",
    },
    {
      id: "vision",
      number: "05",
      title: "The Full Arc: Where This Goes",
      duration: "4 minutes",
      color: "#a78bfa",
      intent:
        "Zoom out to the three-module vision. Show that this isn't a one-off — it's a designed curriculum arc with architectural coherence.",
      content: [
        {
          type: "arc",
          label: "Module 1 — Rigid Motions (deployed)",
          text: "'What stays the same when a shape moves?' Distances and angles preserved → congruence. The module you just experienced.",
        },
        {
          type: "arc",
          label: "Module 2 — Dilations & Similarity (designed)",
          text: "'What stays the same when a shape grows?' Same triangle, now with a scale factor. Angles preserved, sides scale proportionally → similarity. The SequenceBuilder returns: rigid motion + dilation = similarity transformation.",
        },
        {
          type: "arc",
          label: "Module 3 — Pythagorean Theorem (designed)",
          text: "'What's hiding inside every right triangle?' The triangle's right-angle variant becomes the instrument. Squares on sides, area relationships, the theorem emerges from observation. Capstone: distance in the coordinate plane, 3D extension.",
        },
        {
          type: "continuity",
          text: "One shape family — the scalene triangle — carries through the entire 8.G cluster. Students never learn a new geometric object. They discover new properties of a familiar one. The architecture reuses 70% of Module 1's component infrastructure. The pedagogy is identical: manipulate first, symbolize second, every time.",
        },
      ],
      notes:
        "The module planning artifact lives here. Show the ALD alignment table for all three modules. The audience should see that the vision isn't vague aspiration — it's standards-mapped, phase-designed, and architecturally scoped. The reuse matrix is a credibility signal for the technically-minded audience members.",
    },
    {
      id: "close",
      number: "06",
      title: "The Close: Your Turn",
      duration: "2 minutes",
      color: "#f8fafc",
      intent:
        "End with the QR code and the invitation. The presentation is the pitch; the module is the proof.",
      content: [
        {
          type: "callback",
          text: "Return to the capstone screen from the opening. The same triangle. The same task. 'This module is live. It runs on any device. It requires no account. Scan this and try it yourself — right now, or when you're back in your classroom with students.'",
        },
        {
          type: "invitation",
          text: "'Every person who uses this module teaches me something about how students learn geometry. If you try it with your students, I want to hear what happens. Here's how to reach me.'",
        },
        {
          type: "closer",
          text: "'Formulas can wait. Understanding can't.'",
        },
      ],
      notes:
        "The QR code is doing double duty: it's the call to action for the audience AND it's the next round of research data. ISTE 27 attendees who use the module with their students become collaborators. The 'collect signal' strategy extends beyond the conference.",
    },
  ],

  meta: {
    totalDuration: "~25 minutes (leaves 5 for Q&A in a 30-minute slot, 20 for Q&A in a 45-minute slot)",
    keyAssets: [
      "Live module (creative-lab-five.vercel.app)",
      "QR code (large format, visible from back of room)",
      "Module planning artifact (three-module arc with ALD alignment)",
      "ISTE 26 findings summary (behavioral data from exhibit hall)",
      "STEM Club session observations (anonymized student interaction patterns)",
    ],
    risks: [
      {
        risk: "WiFi fails during live demo",
        mitigation: "Screen recording of full module walkthrough as backup. Never project without a fallback.",
      },
      {
        risk: "Audience member gets stuck during live try",
        mitigation: "This is actually good data. Narrate it: 'See that hesitation? That's exactly what we're studying.'",
      },
      {
        risk: "Time runs short",
        mitigation: "Acts 04 and 05 can compress. The hook, demo, and close are non-negotiable.",
      },
    ],
  },
};

function ActCard({ act, isExpanded, onToggle }) {
  return (
    <div
      style={{
        background: "#0f172a",
        border: `1px solid ${isExpanded ? act.color + "60" : "#334155"}`,
        borderRadius: "8px",
        marginBottom: "12px",
        overflow: "hidden",
        transition: "border-color 0.3s",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "48px 1fr auto auto",
          alignItems: "center",
          gap: "16px",
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "22px",
            fontWeight: 700,
            color: act.color,
            opacity: 0.4,
          }}
        >
          {act.number}
        </span>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "#e2e8f0" }}>{act.title}</div>
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              marginTop: "2px",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {act.duration}
          </div>
        </div>
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: act.color,
            opacity: 0.6,
          }}
        />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "16px",
            color: "#475569",
            transition: "transform 0.2s",
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          →
        </span>
      </button>

      {isExpanded && (
        <div style={{ padding: "0 20px 20px 20px" }}>
          {/* Intent */}
          <div
            style={{
              background: act.color + "10",
              borderLeft: `2px solid ${act.color}`,
              padding: "12px 16px",
              borderRadius: "0 6px 6px 0",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px",
                color: act.color,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "4px",
              }}
            >
              Intent
            </div>
            <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>{act.intent}</p>
          </div>

          {/* Content blocks */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            {act.content.map((block, i) => (
              <div
                key={i}
                style={{
                  background: "#1e293b",
                  borderRadius: "6px",
                  padding: "14px 16px",
                }}
              >
                {block.label && (
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "10px",
                      color: act.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "6px",
                    }}
                  >
                    {block.label}
                  </div>
                )}
                {!block.label && (
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "9px",
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "4px",
                    }}
                  >
                    {block.type}
                  </div>
                )}
                <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.65, margin: 0 }}>{block.text}</p>
              </div>
            ))}
          </div>

          {/* Speaker notes */}
          <div
            style={{
              background: "#0b1120",
              border: "1px dashed #334155",
              borderRadius: "6px",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px",
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px",
              }}
            >
              Speaker Notes
            </div>
            <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
              {act.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ISTENarrative() {
  const [expandedAct, setExpandedAct] = useState("hook");
  const [showMeta, setShowMeta] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1120",
        color: "#e2e8f0",
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "32px 24px",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#f43f5e",
                boxShadow: "0 0 8px rgba(244,63,94,0.5)",
              }}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "10px",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              ISTE Live 27 — Presentation Narrative Storyboard
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "38px",
              fontWeight: 700,
              color: "#f8fafc",
              margin: "0 0 8px 0",
              lineHeight: 1.15,
              fontStyle: "italic",
            }}
          >
            {NARRATIVE.title}
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#94a3b8",
              margin: "0 0 24px 0",
              lineHeight: 1.5,
              maxWidth: "640px",
            }}
          >
            {NARRATIVE.subtitle}
          </p>

          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px",
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "8px",
              }}
            >
              Presentation Premise
            </div>
            <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.65, margin: 0 }}>{NARRATIVE.premise}</p>
          </div>
        </div>

        {/* Timeline overview */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", alignItems: "flex-end" }}>
          {NARRATIVE.acts.map((act) => {
            const minutes = parseFloat(act.duration) || 3;
            return (
              <button
                key={act.id}
                onClick={() => setExpandedAct(expandedAct === act.id ? null : act.id)}
                style={{
                  flex: minutes,
                  height: expandedAct === act.id ? "40px" : "28px",
                  background: act.color + (expandedAct === act.id ? "40" : "20"),
                  border: "none",
                  borderRadius: "4px 4px 0 0",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: "6px",
                }}
                title={`${act.title} (${act.duration})`}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "8px",
                    color: act.color,
                    letterSpacing: "0.06em",
                    opacity: expandedAct === act.id ? 1 : 0.6,
                  }}
                >
                  {act.number}
                </span>
              </button>
            );
          })}
        </div>

        {/* Act cards */}
        {NARRATIVE.acts.map((act) => (
          <ActCard
            key={act.id}
            act={act}
            isExpanded={expandedAct === act.id}
            onToggle={() => setExpandedAct(expandedAct === act.id ? null : act.id)}
          />
        ))}

        {/* Meta section */}
        <div style={{ marginTop: "32px" }}>
          <button
            onClick={() => setShowMeta(!showMeta)}
            style={{
              background: "transparent",
              border: "1px solid #334155",
              borderRadius: "6px",
              padding: "12px 20px",
              color: "#64748b",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Production Notes & Risk Mitigation</span>
            <span style={{ transform: showMeta ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>→</span>
          </button>

          {showMeta && (
            <div style={{ padding: "20px 0" }}>
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "10px",
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "8px",
                  }}
                >
                  Duration
                </div>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>{NARRATIVE.meta.totalDuration}</p>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "10px",
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "12px",
                  }}
                >
                  Required Assets
                </div>
                {NARRATIVE.meta.keyAssets.map((asset, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 12px",
                      background: i % 2 === 0 ? "#1e293b" : "transparent",
                      borderRadius: "4px",
                      fontSize: "12px",
                      color: "#cbd5e1",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    <span style={{ color: "#334155", marginRight: "10px" }}>{String(i + 1).padStart(2, "0")}</span>
                    {asset}
                  </div>
                ))}
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "10px",
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "12px",
                  }}
                >
                  Risk Mitigation
                </div>
                {NARRATIVE.meta.risks.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#1e293b",
                      borderRadius: "6px",
                      padding: "14px 16px",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ fontSize: "13px", color: "#f59e0b", marginBottom: "6px" }}>{r.risk}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>{r.mitigation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #1e293b", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "18px",
              fontStyle: "italic",
              color: "#475569",
              margin: "0 0 16px 0",
            }}
          >
            "Formulas can wait. Understanding can't."
          </p>
          <p
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              color: "#334155",
              letterSpacing: "0.05em",
            }}
          >
            CREATIVE LAB — ISTE LIVE 27 STORYBOARD — DRAFT {new Date().toISOString().split("T")[0]}
          </p>
        </div>
      </div>
    </div>
  );
}