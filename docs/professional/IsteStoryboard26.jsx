import { useState } from "react";

const STRATEGY = {
  venue: "ISTE Live 2026 — Exhibit Hall",
  format: "No booth. No stage. One person, one card, walking the floor.",
  philosophy: "The interaction is the pitch. The card is the artifact that outlives the conversation.",
  
  projects: [
    {
      id: "creative-lab",
      name: "Creative Lab",
      tagline: "Formulas can wait.",
      audience: "Math teachers, curriculum coordinators, EdTech-curious educators",
      url: "creative-lab-five.vercel.app",
      hook: "Students discover geometry by doing — formulas appear only after they've shown understanding.",
      coldStart: "Scan → see a triangle on a grid → immediately understand you need to drag it somewhere. No account, no instructions, no friction.",
      whatTheyExperience: "The Rigid Motions module: predict where a transformation lands, drag the ghost, see the reveal. If they go deep, they reach the capstone — building a multi-step transformation sequence. Coordinates and formulas appear only after spatial intuition is established.",
      signalToCollect: "Where do they hesitate? Where do they accelerate? Do they reach the capstone? How long before the first drag? Do they try it on their own phone after you show them?",
      conversation: {
        opener: "You teach geometry? Can I show you something my students built their way through?",
        pivot: "Hand them your phone. Say nothing. Watch what they do.",
        ifTheyAsk: "It's aligned to 8.G.A.1 through 8.G.A.3. Every phase maps to a specific ALD level. The coordinates don't appear until students have already demonstrated spatial understanding.",
        closer: "Keep the card. Try it with your students. I want to hear what happens.",
      },
    },
    {
      id: "rat-the-cat",
      name: "The Coding Playground",
      tagline: "Students ship, not simulate.",
      audience: "CS teachers, STEM coordinators, anyone running a coding club",
      url: "github.com/Lokie-ree/rat-the-cat",
      hook: "A mentor-led curriculum where students progress from web fundamentals to contributing to a shared open-source repository. The card game is the vehicle — student ownership is the product.",
      coldStart: "Scan → see a real GitHub repo with student contributions. Not a sandbox. Not a simulation. A living codebase.",
      whatTheyExperience: "A community-built project: HTML, CSS, JavaScript — real files, real commits, real contribution workflow. Students don't practice coding in isolation; they build something together that exists in the world.",
      signalToCollect: "Do they ask about the contribution workflow? Do they ask about classroom management? Do they immediately think about their own students? Do they want to fork it?",
      conversation: {
        opener: "You run a coding program? Want to see what happens when students contribute to a real repo instead of completing exercises?",
        pivot: "Show them the repo. Show them student commits. The code is the evidence.",
        ifTheyAsk: "It's grassroots, mentor-led, open-source. No corporate framework. Students progress from basic web fundamentals to pull requests on a shared codebase. The game is just the fun part — the real curriculum is the contribution pipeline.",
        closer: "The repo is public. Fork it. Adapt it. That's the whole point.",
      },
    },
  ],

  card: {
    concept: "One card. Two QR codes. Two expressions of the same philosophy.",
    front: {
      headline: "Students learn by building.",
      subline: "Two projects. Same principle. Scan either one.",
      qr1Label: "Creative Lab — Interactive Math",
      qr2Label: "Coding Playground — Open Source",
    },
    back: {
      name: "Randall LaPoint, Jr.",
      title: "Math Educator · Developer · Learning Designer",
      contact: "rplapointjr@gmail.com",
      philosophy: "Active creation over passive consumption.",
    },
    designNotes: [
      "Business card size (3.5\" × 2\") — fits in a badge holder or pocket",
      "Laboratory aesthetic: dot grid background, monospace type, minimal confident copy",
      "QR codes sized for reliable scanning even in a crowded hall with variable lighting",
      "No logo, no institution name — the work is the brand",
      "Printed on heavyweight stock — feels like an instrument, not a flyer",
    ],
  },

  dayOf: {
    rules: [
      "Lead with the phone, not the card. Show the interaction first. Hand the card second.",
      "Never explain what the module does before they've tried it. The demo is the explanation.",
      "Watch their hands, not their face. Where they tap first is the signal.",
      "If someone gets stuck, don't rescue them. Narrate: 'That pause — that's what I study.'",
      "The card outlives the conversation. It's the thing they find in their bag on the flight home.",
      "Carry a backup battery. Your phone is your demo device. Dead phone = no pitch.",
      "Know when to let go. A 90-second interaction that ends with a card handoff beats a 10-minute explanation every time.",
    ],
    targetInteractions: "30–50 meaningful conversations across the conference",
    successMetric: "A teacher scans the QR code three days later and emails you about what their students did.",
  },
};

function ProjectPanel({ project, isActive, onToggle }) {
  return (
    <div
      style={{
        background: isActive ? "#1a1a2e" : "#12121f",
        border: `1px solid ${isActive ? "#334155" : "#1e293b"}`,
        borderRadius: "10px",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "20px 24px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "18px",
                fontWeight: 700,
                color: "#f0f0f5",
                marginBottom: "4px",
              }}
            >
              {project.name}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                color: project.id === "creative-lab" ? "#7dd3a8" : "#d4a574",
                fontStyle: "italic",
              }}
            >
              {project.tagline}
            </div>
          </div>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "18px",
              color: "#3a3a5c",
              transform: isActive ? "rotate(45deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              display: "inline-block",
            }}
          >
            +
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#8888aa", margin: "10px 0 0 0", lineHeight: 1.55 }}>{project.hook}</p>
      </button>

      {isActive && (
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Audience */}
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#5a5a7c", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "4px" }}>
                Who stops for this
              </div>
              <p style={{ fontSize: "13px", color: "#b0b0cc", margin: 0 }}>{project.audience}</p>
            </div>

            {/* Cold Start */}
            <div
              style={{
                background: "#0f0f1c",
                borderLeft: `2px solid ${project.id === "creative-lab" ? "#7dd3a8" : "#d4a574"}`,
                padding: "14px 18px",
                borderRadius: "0 8px 8px 0",
              }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: project.id === "creative-lab" ? "#7dd3a8" : "#d4a574", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
                Cold Start Experience
              </div>
              <p style={{ fontSize: "13px", color: "#d0d0e8", lineHeight: 1.6, margin: 0 }}>{project.coldStart}</p>
            </div>

            {/* What They Experience */}
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#5a5a7c", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
                What they experience
              </div>
              <p style={{ fontSize: "13px", color: "#b0b0cc", lineHeight: 1.6, margin: 0 }}>{project.whatTheyExperience}</p>
            </div>

            {/* Signal */}
            <div
              style={{
                background: "#16162a",
                border: "1px dashed #2a2a44",
                borderRadius: "8px",
                padding: "14px 18px",
              }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#6a6a8c", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
                Signal to collect
              </div>
              <p style={{ fontSize: "12px", color: "#9090ac", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{project.signalToCollect}</p>
            </div>

            {/* Conversation Script */}
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#5a5a7c", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>
                Conversation Script
              </div>
              {Object.entries(project.conversation).map(([key, val]) => {
                const labels = {
                  opener: "Open",
                  pivot: "Pivot",
                  ifTheyAsk: "If they ask",
                  closer: "Close",
                };
                const colors = {
                  opener: "#7dd3a8",
                  pivot: "#d4a574",
                  ifTheyAsk: "#8888cc",
                  closer: "#f0f0f5",
                };
                return (
                  <div key={key} style={{ marginBottom: "12px", display: "grid", gridTemplateColumns: "80px 1fr", gap: "12px" }}>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "10px",
                        color: colors[key],
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        paddingTop: "2px",
                      }}
                    >
                      {labels[key]}
                    </span>
                    <p style={{ fontSize: "13px", color: "#c8c8e0", lineHeight: 1.55, margin: 0 }}>{val}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CardPreview() {
  const [side, setSide] = useState("front");

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["front", "back"].map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            style={{
              padding: "6px 16px",
              background: side === s ? "#1a1a2e" : "transparent",
              color: side === s ? "#f0f0f5" : "#5a5a7c",
              border: side === s ? "1px solid #334155" : "1px solid transparent",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Card mockup at approximate 3.5:2 ratio */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          aspectRatio: "3.5 / 2",
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
          // Dot grid background
          background: `
            radial-gradient(circle, #2a2a44 0.5px, transparent 0.5px)
          `,
          backgroundSize: "12px 12px",
          backgroundColor: "#0e0e1a",
          border: "1px solid #2a2a44",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {side === "front" ? (
          <>
            <div>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "#f0f0f5",
                  margin: "0 0 4px 0",
                  letterSpacing: "-0.01em",
                }}
              >
                Students learn by building.
              </h3>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  color: "#6a6a8c",
                  margin: 0,
                  letterSpacing: "0.04em",
                }}
              >
                Two projects. Same principle. Scan either one.
              </p>
            </div>
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    background: "#1a1a2e",
                    border: "1px solid #334155",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "#5a5a7c" }}>QR</span>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#7dd3a8", letterSpacing: "0.04em" }}>
                  Creative Lab
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "#5a5a7c" }}>
                  Interactive Math
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    background: "#1a1a2e",
                    border: "1px solid #334155",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "#5a5a7c" }}>QR</span>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#d4a574", letterSpacing: "0.04em" }}>
                  Coding Playground
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "#5a5a7c" }}>
                  Open Source
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#f0f0f5",
                  margin: "0 0 2px 0",
                }}
              >
                Randall LaPoint, Jr.
              </h3>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  color: "#8888aa",
                  margin: "0 0 12px 0",
                  letterSpacing: "0.03em",
                }}
              >
                Math Educator · Developer · Learning Designer
              </p>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  color: "#5a5a7c",
                  margin: 0,
                }}
              >
                rplapointjr@gmail.com
              </p>
            </div>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "12px",
                color: "#6a6a8c",
                margin: 0,
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              Active creation over passive consumption.
            </p>
          </>
        )}
      </div>

      <div style={{ marginTop: "16px" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#5a5a7c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
          Print Specs
        </div>
        {STRATEGY.card.designNotes.map((note, i) => (
          <div key={i} style={{ fontSize: "11px", color: "#6a6a8c", lineHeight: 1.5, marginBottom: "4px", paddingLeft: "12px", position: "relative" }}>
            <span style={{ position: "absolute", left: 0, color: "#3a3a5c" }}>·</span>
            {note}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ISTE26Storyboard() {
  const [activeProject, setActiveProject] = useState("creative-lab");
  const [activeSection, setActiveSection] = useState("projects");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a16",
        color: "#d0d0e8",
        fontFamily: "'Nunito Sans', -apple-system, sans-serif",
        padding: "32px 20px",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&family=Nunito+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              color: "#5a5a7c",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: "12px",
            }}
          >
            ISTE Live 26 — Deployment Strategy
          </div>

          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "32px",
              fontWeight: 700,
              color: "#f0f0f5",
              margin: "0 0 8px 0",
              lineHeight: 1.2,
            }}
          >
            One Card. Two QR Codes.
          </h1>
          <p style={{ fontSize: "15px", color: "#8888aa", margin: "0 0 20px 0", lineHeight: 1.5, maxWidth: "560px" }}>
            No booth. No stage. One person walking the exhibit hall with a card and a phone.
            The interaction is the pitch. The card outlives the conversation.
          </p>

          <div
            style={{
              background: "#12121f",
              border: "1px solid #1e1e34",
              borderRadius: "8px",
              padding: "14px 18px",
              display: "flex",
              gap: "24px",
            }}
          >
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#5a5a7c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Format</div>
              <div style={{ fontSize: "13px", color: "#b0b0cc" }}>{STRATEGY.format}</div>
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
          {[
            { id: "projects", label: "Project Playbooks" },
            { id: "card", label: "Card Design" },
            { id: "dayof", label: "Day-Of Rules" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              style={{
                padding: "8px 18px",
                background: activeSection === tab.id ? "#1a1a2e" : "transparent",
                color: activeSection === tab.id ? "#f0f0f5" : "#5a5a7c",
                border: activeSection === tab.id ? "1px solid #2a2a44" : "1px solid transparent",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.06em",
                cursor: "pointer",
                borderRadius: "6px",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Projects */}
        {activeSection === "projects" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {STRATEGY.projects.map((project) => (
              <ProjectPanel
                key={project.id}
                project={project}
                isActive={activeProject === project.id}
                onToggle={() => setActiveProject(activeProject === project.id ? null : project.id)}
              />
            ))}

            {/* Shared philosophy */}
            <div
              style={{
                marginTop: "8px",
                padding: "18px 22px",
                background: "#12121f",
                border: "1px solid #1e1e34",
                borderRadius: "8px",
              }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#5a5a7c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                The Thread Between Them
              </div>
              <p style={{ fontSize: "14px", color: "#b0b0cc", lineHeight: 1.65, margin: 0 }}>
                Creative Lab and the Coding Playground are different instruments, but they share the same principle:
                students learn by constructing, not by selecting. In Creative Lab, a student drags a ghost triangle to
                demonstrate understanding of a reflection. In the Coding Playground, a student submits a pull request
                to demonstrate understanding of a function. Both are <em style={{ color: "#d4a574" }}>demonstrations of competence, not claims of competence</em>.
                The card gives someone both doorways into the same idea.
              </p>
            </div>
          </div>
        )}

        {/* Card Design */}
        {activeSection === "card" && <CardPreview />}

        {/* Day-Of */}
        {activeSection === "dayof" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#5a5a7c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                Engagement Rules
              </div>
              {STRATEGY.dayOf.rules.map((rule, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "28px 1fr",
                    gap: "8px",
                    marginBottom: "14px",
                    alignItems: "start",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "11px",
                      color: "#3a3a5c",
                      fontWeight: 600,
                      textAlign: "right",
                      paddingTop: "1px",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p style={{ fontSize: "13px", color: "#b0b0cc", lineHeight: 1.6, margin: 0 }}>{rule}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ background: "#12121f", borderRadius: "8px", padding: "16px 18px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#5a5a7c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                  Target
                </div>
                <div style={{ fontSize: "22px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#f0f0f5" }}>
                  30–50
                </div>
                <div style={{ fontSize: "12px", color: "#6a6a8c" }}>meaningful conversations</div>
              </div>
              <div style={{ background: "#12121f", borderRadius: "8px", padding: "16px 18px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#5a5a7c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                  Success Metric
                </div>
                <p style={{ fontSize: "13px", color: "#b0b0cc", lineHeight: 1.55, margin: 0 }}>
                  A teacher scans the QR three days later and emails you about what their students did.
                </p>
              </div>
            </div>

            {/* Packing list */}
            <div style={{ marginTop: "24px", background: "#12121f", borderRadius: "8px", padding: "18px 22px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#5a5a7c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                Packing List
              </div>
              {[
                "100 printed cards (heavyweight stock)",
                "Phone with Creative Lab bookmarked and full charge",
                "Backup battery pack",
                "Screen recording of full module walkthrough (WiFi backup)",
                "Small notebook for immediate post-conversation notes",
                "Comfortable shoes — you're walking 8 hours",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div style={{ width: "14px", height: "14px", borderRadius: "3px", border: "1px solid #3a3a5c", flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: "#8888aa" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #1e1e34", textAlign: "center" }}>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "14px", fontStyle: "italic", color: "#3a3a5c", margin: "0 0 12px 0" }}>
            Plant the flag. Collect the signal.
          </p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#2a2a44", letterSpacing: "0.06em" }}>
            ISTE LIVE 26 — DEPLOYMENT STORYBOARD — DRAFT {new Date().toISOString().split("T")[0]}
          </p>
        </div>
      </div>
    </div>
  );
}