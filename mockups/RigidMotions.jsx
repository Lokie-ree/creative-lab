import { useState, useEffect, useRef } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:        "#0f0e0d",
  surface:   "#1a1917",
  surfaceHi: "#232220",
  border:    "#2e2c29",
  text:      "#b8b0a4",
  textDim:   "#6b6460",
  accent:    "#7cc87c",
  accentDim: "rgba(124,200,124,0.22)",
  ghost:     "#7a746a",
  danger:    "#c87c7c",
  info:      "#7caac8",
  white:     "#e8e2da",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --lab-bg: ${T.bg};
    --lab-surface: ${T.surface};
    --lab-surface-hi: ${T.surfaceHi};
    --lab-border: ${T.border};
    --lab-text: ${T.text};
    --lab-text-dim: ${T.textDim};
    --lab-accent: ${T.accent};
    --lab-accent-dim: ${T.accentDim};
    --lab-ghost: ${T.ghost};
    --lab-danger: ${T.danger};
    --lab-info: ${T.info};
    --lab-white: ${T.white};
    --mono: 'JetBrains Mono', monospace;
    --sans: 'Inter Tight', sans-serif;
  }

  body {
    background: var(--lab-bg);
    color: var(--lab-text);
    font-family: var(--sans);
    min-height: 100vh;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--lab-bg); }
  ::-webkit-scrollbar-thumb { background: var(--lab-border); border-radius: 2px; }

  /* Journey wrapper */
  .journey {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 16px 60px;
  }

  /* Section label */
  .section-label {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--lab-text-dim);
    text-transform: uppercase;
    margin-bottom: 12px;
    padding-left: 2px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--lab-border);
  }

  /* Viewport switcher */
  .viewport-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 32px;
    background: var(--lab-surface);
    border: 1px solid var(--lab-border);
    border-radius: 6px;
    padding: 4px;
    width: fit-content;
  }
  .vp-tab {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 4px;
    border: none;
    background: transparent;
    color: var(--lab-text-dim);
    cursor: pointer;
    transition: all 0.15s;
  }
  .vp-tab.active {
    background: var(--lab-surface-hi);
    color: var(--lab-accent);
    border: 1px solid var(--lab-border);
  }

  /* State nav */
  .state-nav {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }
  .state-btn {
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 5px 10px;
    border-radius: 3px;
    border: 1px solid var(--lab-border);
    background: transparent;
    color: var(--lab-text-dim);
    cursor: pointer;
    transition: all 0.15s;
  }
  .state-btn.active {
    border-color: var(--lab-accent);
    color: var(--lab-accent);
    background: var(--lab-accent-dim);
  }
  .state-btn:hover:not(.active) {
    border-color: var(--lab-ghost);
    color: var(--lab-text);
  }

  /* ── Module Frame ──────────────────────────── */
  .module-frame {
    background: var(--lab-surface);
    border: 1px solid var(--lab-border);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    transition: all 0.3s ease;
  }
  .module-frame.mobile {
    width: 390px;
    margin: 0 auto;
  }
  .module-frame.tablet {
    width: 768px;
    margin: 0 auto;
  }
  .module-frame.desktop {
    width: 100%;
  }

  /* Device chrome */
  .device-chrome {
    background: var(--lab-bg);
    border: 1px solid var(--lab-border);
    border-radius: 24px;
    padding: 12px;
    overflow: hidden;
    position: relative;
  }
  .device-chrome.mobile {
    width: 414px;
    margin: 0 auto;
    border-radius: 40px;
    padding: 50px 12px 40px;
  }
  .device-chrome.mobile::before {
    content: '';
    position: absolute;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 6px;
    background: var(--lab-border);
    border-radius: 3px;
  }

  /* ── Status Strip ──────────────────────────── */
  .status-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 12px 7px 14px;
    background: var(--lab-bg);
    border-bottom: 1px solid var(--lab-border);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.14em;
    color: var(--lab-text-dim);
    text-transform: uppercase;
  }
  .status-left {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--lab-text);
    font-size: 9px;
  }
  .status-module-id {
    color: var(--lab-accent);
    font-weight: 700;
  }
  .status-dots {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .sdot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: 1px solid var(--lab-border);
    background: transparent;
    transition: all 0.3s;
  }
  .sdot.done { background: var(--lab-ghost); border-color: var(--lab-ghost); }
  .sdot.active { background: var(--lab-accent); border-color: var(--lab-accent); 
    box-shadow: 0 0 4px var(--lab-accent); }
  .status-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .sys-nom { color: var(--lab-accent); font-size: 8px; }
  .esc-btn {
    color: var(--lab-text-dim);
    font-size: 8px;
    border: 1px solid var(--lab-border);
    padding: 1px 6px;
    border-radius: 2px;
    cursor: pointer;
    letter-spacing: 0.1em;
  }

  /* ── Prompt Readout ────────────────────────── */
  .prompt-readout {
    padding: 10px 14px 9px;
    background: var(--lab-surface-hi);
    border-bottom: 1px solid var(--lab-border);
    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-height: 52px;
  }
  .prompt-type-badge {
    font-family: var(--mono);
    font-size: 8px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--lab-bg);
    background: var(--lab-accent);
    padding: 2px 6px;
    border-radius: 2px;
    margin-top: 2px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .prompt-type-badge.reflect { background: var(--lab-info); }
  .prompt-type-badge.rotate { background: var(--lab-danger); }
  .prompt-type-badge.capstone { background: var(--lab-text-dim); }
  .prompt-text {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--lab-white);
    line-height: 1.45;
    letter-spacing: 0.02em;
  }
  .prompt-sub {
    font-family: var(--sans);
    font-size: 11px;
    color: var(--lab-text-dim);
    margin-top: 2px;
    font-weight: 300;
  }

  /* ── R3F Canvas Area ───────────────────────── */
  .canvas-area {
    background: var(--lab-bg);
    position: relative;
    overflow: hidden;
  }
  .canvas-area.mobile { height: 320px; }
  .canvas-area.tablet { height: 380px; }
  .canvas-area.desktop { height: 440px; }

  /* SVG Grid */
  .grid-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  /* Canvas overlay labels */
  .canvas-hint {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--mono);
    font-size: 9px;
    color: var(--lab-text-dim);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: rgba(15,14,13,0.7);
    padding: 3px 10px;
    border-radius: 2px;
    border: 1px solid var(--lab-border);
    white-space: nowrap;
    pointer-events: none;
  }

  /* Feedback overlay */
  .feedback-banner {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 3px;
    white-space: nowrap;
    border: 1px solid;
    animation: bannerIn 0.25s ease;
  }
  @keyframes bannerIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .feedback-banner.match {
    color: var(--lab-accent);
    border-color: var(--lab-accent);
    background: rgba(124,200,124,0.08);
  }
  .feedback-banner.miss {
    color: var(--lab-danger);
    border-color: var(--lab-danger);
    background: rgba(200,124,124,0.08);
  }
  .feedback-banner.close {
    color: var(--lab-info);
    border-color: var(--lab-info);
    background: rgba(124,170,200,0.08);
  }

  /* Earned insight */
  .earned-insight {
    position: absolute;
    bottom: 36px;
    left: 12px;
    right: 12px;
    font-family: var(--sans);
    font-size: 12px;
    font-style: italic;
    color: var(--lab-accent);
    text-align: center;
    line-height: 1.4;
    background: rgba(15,14,13,0.85);
    border: 1px solid var(--lab-accent);
    border-radius: 4px;
    padding: 8px 14px;
    animation: insightIn 0.4s ease;
  }
  @keyframes insightIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Control Strip ─────────────────────────── */
  .control-strip {
    padding: 10px 12px;
    background: var(--lab-surface);
    border-top: 1px solid var(--lab-border);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-height: 56px;
  }
  .ctrl-group {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .ctrl-label {
    font-family: var(--mono);
    font-size: 8px;
    letter-spacing: 0.12em;
    color: var(--lab-text-dim);
    text-transform: uppercase;
    padding-right: 2px;
  }
  .ctrl-btn {
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 5px 10px;
    border-radius: 3px;
    border: 1px solid var(--lab-border);
    background: transparent;
    color: var(--lab-text);
    cursor: pointer;
    transition: all 0.12s;
    white-space: nowrap;
  }
  .ctrl-btn:hover { border-color: var(--lab-ghost); }
  .ctrl-btn.selected {
    border-color: var(--lab-accent);
    color: var(--lab-accent);
    background: var(--lab-accent-dim);
  }
  .ctrl-btn.check {
    background: var(--lab-accent);
    color: var(--lab-bg);
    border-color: var(--lab-accent);
    font-weight: 700;
    letter-spacing: 0.16em;
  }
  .ctrl-btn.check:hover { opacity: 0.85; }
  .ctrl-btn.reset {
    border-color: var(--lab-danger);
    color: var(--lab-danger);
  }
  .ctrl-btn.reset:hover { background: rgba(200,124,124,0.08); }
  .ctrl-spacer { flex: 1; }

  /* Sequence builder */
  .seq-builder {
    display: flex;
    gap: 8px;
    align-items: stretch;
    flex: 1;
    flex-wrap: wrap;
  }
  .seq-step {
    flex: 1;
    min-width: 120px;
    background: var(--lab-surface-hi);
    border: 1px solid var(--lab-border);
    border-radius: 4px;
    padding: 6px 8px;
  }
  .seq-step-label {
    font-family: var(--mono);
    font-size: 8px;
    color: var(--lab-text-dim);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .seq-step-val {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--lab-accent);
    letter-spacing: 0.08em;
  }
  .seq-step.empty .seq-step-val { color: var(--lab-text-dim); }

  /* ── Formula Readout ───────────────────────── */
  .formula-readout {
    padding: 8px 14px;
    background: var(--lab-bg);
    border-top: 1px solid var(--lab-border);
    font-family: var(--mono);
    font-size: 11px;
    color: var(--lab-text-dim);
    letter-spacing: 0.06em;
    min-height: 38px;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s;
  }
  .formula-readout.active {
    color: var(--lab-accent);
    border-top-color: var(--lab-accent);
  }
  .formula-readout.active::before {
    content: '▶';
    font-size: 8px;
    color: var(--lab-accent);
  }
  .formula-readout.dim::before {
    content: '○';
    font-size: 8px;
  }


  /* ── Side-by-side layout for desktop ──────── */
  .desktop-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    grid-template-rows: auto 1fr auto auto;
    height: 100%;
  }
  .desktop-canvas-col {
    grid-column: 1;
    grid-row: 1 / -1;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--lab-border);
  }
  .desktop-info-col {
    grid-column: 2;
    display: flex;
    flex-direction: column;
  }

  /* Desktop panel sections */
  .panel-section {
    padding: 14px;
    border-bottom: 1px solid var(--lab-border);
  }
  .panel-section-title {
    font-family: var(--mono);
    font-size: 8px;
    letter-spacing: 0.18em;
    color: var(--lab-text-dim);
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  /* Progress arc */
  .progress-arc-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 8px;
  }
  .progress-stage {
    flex: 1;
    height: 3px;
    background: var(--lab-border);
    border-radius: 2px;
    position: relative;
    overflow: hidden;
  }
  .progress-stage-fill {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    background: var(--lab-accent);
    border-radius: 2px;
    transition: width 0.5s ease;
  }
  .progress-stage.active .progress-stage-fill { background: var(--lab-accent); }
  .progress-stage.done .progress-stage-fill { width: 100% !important; background: var(--lab-ghost); }
  .progress-stage.locked .progress-stage-fill { width: 0; }

  /* Vertex coordinates panel */
  .vertex-table {
    width: 100%;
    border-collapse: collapse;
  }
  .vertex-table td {
    font-family: var(--mono);
    font-size: 10px;
    padding: 3px 6px;
    letter-spacing: 0.04em;
  }
  .vertex-table td:first-child { color: var(--lab-text-dim); }
  .vertex-table td:nth-child(2) { color: var(--lab-text); }
  .vertex-table td:nth-child(3) {
    color: var(--lab-accent);
    text-align: right;
  }
  .vertex-table.hidden td:nth-child(3) { color: transparent; }

  /* Notation card */
  .notation-card {
    background: var(--lab-bg);
    border: 1px solid var(--lab-border);
    border-radius: 4px;
    padding: 10px 12px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--lab-text-dim);
    min-height: 40px;
    transition: all 0.3s;
  }
  .notation-card.revealed {
    color: var(--lab-accent);
    border-color: rgba(124,200,124,0.35);
    background: rgba(124,200,124,0.04);
  }

  /* Insight list */
  .insight-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .insight-item {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-family: var(--sans);
    font-size: 11px;
    color: var(--lab-text-dim);
    font-weight: 300;
    line-height: 1.45;
  }
  .insight-item.earned {
    color: var(--lab-text);
  }
  .insight-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    border: 1px solid var(--lab-border);
    margin-top: 4px;
    flex-shrink: 0;
    transition: all 0.3s;
  }
  .insight-item.earned .insight-dot {
    background: var(--lab-accent);
    border-color: var(--lab-accent);
  }

  /* ── Journey overview ──────────────────────── */
  .journey-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 40px;
  }
  .overview-card {
    background: var(--lab-surface);
    border: 1px solid var(--lab-border);
    border-radius: 6px;
    padding: 14px;
    transition: border-color 0.15s;
  }
  .overview-card:hover { border-color: var(--lab-ghost); }
  .overview-card.active { border-color: var(--lab-accent); }
  .oc-state {
    font-family: var(--mono);
    font-size: 9px;
    color: var(--lab-text-dim);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .oc-title {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--lab-text);
    margin-bottom: 6px;
  }
  .oc-desc {
    font-family: var(--sans);
    font-size: 11px;
    color: var(--lab-text-dim);
    line-height: 1.5;
    font-weight: 300;
  }
  .oc-badge {
    display: inline-block;
    font-family: var(--mono);
    font-size: 8px;
    letter-spacing: 0.1em;
    padding: 2px 6px;
    border-radius: 2px;
    margin-top: 8px;
    text-transform: uppercase;
  }
  .oc-badge.l3 { background: rgba(124,200,124,0.12); color: var(--lab-accent); border: 1px solid rgba(124,200,124,0.3); }
  .oc-badge.l4 { background: rgba(124,170,200,0.12); color: var(--lab-info); border: 1px solid rgba(124,170,200,0.3); }
  .oc-badge.l5 { background: rgba(200,124,124,0.12); color: var(--lab-danger); border: 1px solid rgba(200,124,124,0.3); }
  .oc-badge.transition { background: rgba(122,116,106,0.2); color: var(--lab-ghost); border: 1px solid var(--lab-border); }

  /* ── Annotations ───────────────────────────── */
  .annotation {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    background: var(--lab-surface-hi);
    border-left: 2px solid var(--lab-accent);
    padding: 8px 12px;
    border-radius: 0 4px 4px 0;
    margin-top: 12px;
    font-family: var(--sans);
    font-size: 12px;
    color: var(--lab-text);
    line-height: 1.5;
    font-weight: 300;
  }
  .annotation-icon { flex-shrink: 0; font-size: 14px; margin-top: 1px; }

  /* ── Top bar ──────────────────────────────── */
  .top-bar {
    background: var(--lab-surface);
    border-bottom: 1px solid var(--lab-border);
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }
  .top-bar-title {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--lab-white);
    letter-spacing: 0.06em;
  }
  .top-bar-sub {
    font-family: var(--mono);
    font-size: 9px;
    color: var(--lab-text-dim);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 2px;
  }
  .top-bar-badge {
    font-family: var(--mono);
    font-size: 9px;
    color: var(--lab-accent);
    border: 1px solid rgba(124,200,124,0.4);
    padding: 4px 10px;
    border-radius: 3px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
`;

// ─── SVG Coordinate Grid ──────────────────────────────────────────────────────
function CoordGrid({ width, height, state, showCoords }) {
  const scale = Math.min(width, height) / 18;
  const ox = width / 2;
  const oy = height / 2;
  const toS = (p) => ({ x: ox + p.x * scale, y: oy - p.y * scale });

  // Shape vertices
  const A = { x: 1, y: 1 }, B = { x: 4, y: 2 }, C = { x: 2, y: 4 };
  
  // Transformed vertices by state
  const getImage = () => {
    if (state === 'translate')      return [{ x: 5, y: 3 }, { x: 8, y: 4 }, { x: 6, y: 6 }];
    if (state === 'feedback-match') return [{ x: 5, y: 3 }, { x: 8, y: 4 }, { x: 6, y: 6 }];
    if (state === 'feedback-miss')  return [{ x: 5, y: 3 }, { x: 8, y: 4 }, { x: 6, y: 6 }];
    if (state === 'reflect-x')      return [{ x: 1, y: -1 }, { x: 4, y: -2 }, { x: 2, y: -4 }];
    if (state === 'reflect-y')      return [{ x: -1, y: 1 }, { x: -4, y: 2 }, { x: -2, y: 4 }];
    if (state === 'rotate')         return [{ x: 1, y: -1 }, { x: 2, y: -4 }, { x: 4, y: -2 }];
    if (state === 'coords')         return [{ x: 5, y: 3 }, { x: 8, y: 4 }, { x: 6, y: 6 }];
    if (state === 'capstone')       return [{ x: 1, y: -1 }, { x: 2, y: -4 }, { x: 4, y: -2 }];
    if (state === 'predict')        return null; // ghost only
    return null;
  };

  const getGhost = () => {
    if (state === 'predict')        return [{ x: 5.5, y: 2.5 }, { x: 8.5, y: 3.5 }, { x: 6.5, y: 5.5 }];
    if (state === 'feedback-miss')  return [{ x: 6, y: 4 }, { x: 9, y: 5 }, { x: 7, y: 7 }];
    if (state === 'feedback-match') return [{ x: 5, y: 3 }, { x: 8, y: 4 }, { x: 6, y: 6 }];
    return null;
  };

  const img = getImage();
  const ghost = getGhost();
  const pts = [A, B, C];
  const labels = ['A', 'B', 'C'];

  const polyStr = (vs) => vs.map(v => `${toS(v).x},${toS(v).y}`).join(' ');

  // Grid lines
  const gridLines = [];
  for (let i = -8; i <= 8; i++) {
    const isMajor = i === 0;
    gridLines.push(
      <line key={`vl${i}`} x1={ox + i * scale} y1={0} x2={ox + i * scale} y2={height}
        stroke={isMajor ? T.text : T.border} strokeWidth={isMajor ? 1 : 0.5} opacity={isMajor ? 0.8 : 0.6} />,
      <line key={`hl${i}`} x1={0} y1={oy - i * scale} x2={width} y2={oy - i * scale}
        stroke={isMajor ? T.text : T.border} strokeWidth={isMajor ? 1 : 0.5} opacity={isMajor ? 0.8 : 0.6} />
    );
  }

  // Axis labels
  const axisNums = [-6, -4, -2, 2, 4, 6];
  const axisLabels = axisNums.map(n => [
    <text key={`xl${n}`} x={ox + n * scale} y={oy + 12} textAnchor="middle"
      fill={T.textDim} fontSize={8} fontFamily="'JetBrains Mono'" opacity={0.7}>{n}</text>,
    <text key={`yl${n}`} x={ox - 10} y={oy - n * scale + 3} textAnchor="end"
      fill={T.textDim} fontSize={8} fontFamily="'JetBrains Mono'" opacity={0.7}>{n}</text>
  ]);

  // Translation vector (arrow)
  const showVector = state === 'translate' || state === 'predict';
  const centroid = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
  const imageCentroid = img ? { x: (img[0].x + img[1].x + img[2].x) / 3, y: (img[0].y + img[1].y + img[2].y) / 3 } 
    : ghost ? { x: (ghost[0].x + ghost[1].x + ghost[2].x) / 3, y: (ghost[0].y + ghost[1].y + ghost[2].y) / 3 } : null;
  const cS = toS(centroid);
  const iCS = imageCentroid ? toS(imageCentroid) : null;

  // Reflection axis ticks
  const showAxisTicks = state === 'reflect-x' || state === 'reflect-y';
  const reflAxis = state === 'reflect-x' ? 'x' : 'y';

  // Rotation arcs — sweep CW (negative direction in math coords where y-up)
  const showArcs = state === 'rotate';
  const arcPts = pts.map(p => {
    const r = Math.sqrt(p.x * p.x + p.y * p.y);
    const startAngle = Math.atan2(p.y, p.x);
    const endAngle = startAngle - Math.PI / 2; // CW = subtract in math coords
    const steps = 32;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const a = startAngle + (endAngle - startAngle) * i / steps;
      return { x: r * Math.cos(a), y: r * Math.sin(a) };
    });
  });

  // Gap lines for miss
  const gapLines = state === 'feedback-miss' && ghost && img
    ? ghost.map((g, i) => ({ from: toS(g), to: toS(img[i]) }))
    : null;

  return (
    <svg width={width} height={height} className="grid-svg">
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={T.ghost} />
        </marker>
      </defs>

      {/* Grid */}
      {gridLines}
      {axisLabels}

      {/* Rotation arcs */}
      {showArcs && arcPts.map((arcArr, ai) => {
        const pathStr = arcArr.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toS(p).x} ${toS(p).y}`).join(' ');
        return (
          <g key={`arc${ai}`}>
            <path d={pathStr} fill="none" stroke={T.ghost} strokeWidth={1} strokeDasharray="3,3" opacity={0.7} />
          </g>
        );
      })}

      {/* Reflection axis ticks */}
      {showAxisTicks && pts.map((p, i) => {
        const axP = reflAxis === 'x' ? { x: p.x, y: 0 } : { x: 0, y: p.y };
        const s1 = toS(p), s2 = toS(axP);
        return (
          <g key={`tick${i}`}>
            <line x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y}
              stroke={T.ghost} strokeWidth={1} strokeDasharray="2,3" opacity={0.6} />
            <line x1={s2.x - 4} y1={s2.y - (reflAxis === 'x' ? 0 : 4)}
                  x2={s2.x + 4} y2={s2.y + (reflAxis === 'x' ? 0 : 4)}
              stroke={T.ghost} strokeWidth={1.5} opacity={0.7} />
          </g>
        );
      })}

      {/* Translation vector */}
      {showVector && iCS && (
        <line x1={cS.x} y1={cS.y} x2={iCS.x} y2={iCS.y}
          stroke={T.ghost} strokeWidth={1} strokeDasharray="4,3"
          markerEnd="url(#arrowhead)" opacity={0.6} />
      )}

      {/* Ghost shape */}
      {ghost && (
        <g opacity={0.55}>
          <polygon points={polyStr(ghost)}
            fill="none" stroke={T.accent} strokeWidth={1.5} strokeDasharray="4,3" />
          {ghost.map((v, i) => {
            const s = toS(v);
            return (
              <g key={`gv${i}`}>
                <circle cx={s.x} cy={s.y} r={3} fill={T.accent} opacity={0.7} />
                <text x={s.x + 6} y={s.y - 4} fill={T.accent} fontSize={9}
                  fontFamily="'JetBrains Mono'" opacity={0.8}>{labels[i]}′</text>
              </g>
            );
          })}
        </g>
      )}

      {/* Pre-image shape */}
      <g>
        <polygon points={polyStr(pts)}
          fill="rgba(184,176,164,0.05)" stroke={T.text} strokeWidth={1.5} />
        {pts.map((p, i) => {
          const s = toS(p);
          return (
            <g key={`pv${i}`}>
              <circle cx={s.x} cy={s.y} r={3} fill={T.text} />
              <text x={s.x - 14} y={s.y - 4} fill={T.text} fontSize={9}
                fontFamily="'JetBrains Mono'">{labels[i]}</text>
              {showCoords && (
                <text x={s.x - 14} y={s.y + 14} fill={T.textDim} fontSize={8}
                  fontFamily="'JetBrains Mono'">({p.x},{p.y})</text>
              )}
            </g>
          );
        })}
      </g>

      {/* Image shape (post-reveal or capstone) */}
      {img && (
        <g>
          <polygon points={polyStr(img)}
            fill="rgba(124,200,124,0.06)" stroke={T.accent} strokeWidth={1.5} />
          {img.map((v, i) => {
            const s = toS(v);
            return (
              <g key={`iv${i}`}>
                <circle cx={s.x} cy={s.y} r={3} fill={T.accent} />
                <text x={s.x + 6} y={s.y - 4} fill={T.accent} fontSize={9}
                  fontFamily="'JetBrains Mono'">{labels[i]}′</text>
                {showCoords && (
                  <text x={s.x + 6} y={s.y + 14} fill={T.accent} fontSize={8}
                    fontFamily="'JetBrains Mono'">({v.x},{v.y})</text>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* Gap lines for miss feedback */}
      {gapLines && gapLines.map((g, i) => (
        <line key={`gap${i}`} x1={g.from.x} y1={g.from.y} x2={g.to.x} y2={g.to.y}
          stroke={T.danger} strokeWidth={1} strokeDasharray="3,3" opacity={0.8} />
      ))}

      {/* Origin dot */}
      <circle cx={ox} cy={oy} r={2.5} fill={T.text} opacity={0.6} />
    </svg>
  );
}

// ─── Guide state index map ────────────────────────────────────────────────────
// Feedback substates belong to the same guide state as their parent predict state.
const GUIDE_STATE_MAP = {
  'predict':        0,
  'feedback-match': 0,
  'feedback-miss':  0,
  'feedback-close': 0,
  'reflect':        1,
  'rotate':         2,
  'coord-reveal':   3,
  'predict-coords': 4,
  'capstone':       5,
};

// ─── State config ─────────────────────────────────────────────────────────────
const STATES = [
  {
    id: 'predict',
    label: 'Predict · Translate',
    badge: 'translate',
    badgeClass: '',
    prompt: 'TRANSLATE · 4 RIGHT, 2 UP',
    promptSub: 'Drag the green triangle to where you think it will land.',
    canvasState: 'predict',
    formula: '─── FORMULA LOCKED ──────────────────',
    controls: ['reset', 'speed', 'check'],
    showCoords: false,
    feedback: null,
    ald: 'L3',
    insight: null,
  },
  {
    id: 'feedback-match',
    label: 'Feedback · Match',
    badge: 'translate',
    badgeClass: '',
    prompt: 'TRANSLATE · 4 RIGHT, 2 UP',
    promptSub: 'Correct. Every point moved the same direction and distance.',
    canvasState: 'feedback-match',
    formula: '─── FORMULA LOCKED ──────────────────',
    controls: ['reset', 'speed', 'check'],
    showCoords: false,
    feedback: 'match',
    ald: 'L3',
    insight: 'The shape doesn\'t change — only its position.',
  },
  {
    id: 'feedback-miss',
    label: 'Feedback · Miss',
    badge: 'translate',
    badgeClass: '',
    prompt: 'TRANSLATE · 4 RIGHT, 2 UP',
    promptSub: 'Not quite. Lines show the gap between your prediction and the correct position.',
    canvasState: 'feedback-miss',
    formula: '─── FORMULA LOCKED ──────────────────',
    controls: ['reset', 'speed', 'check'],
    showCoords: false,
    feedback: 'miss',
    ald: 'L3',
    insight: null,
  },
  {
    id: 'feedback-close',
    label: 'Feedback · Close',
    badge: 'translate',
    badgeClass: '',
    prompt: 'TRANSLATE · 4 RIGHT, 2 UP',
    promptSub: 'Position is right — check the orientation.',
    canvasState: 'predict',
    formula: '─── FORMULA LOCKED ──────────────────',
    controls: ['reset', 'speed', 'check'],
    showCoords: false,
    feedback: 'close',
    closeHint: 'orientation',
    ald: 'L3',
    insight: null,
  },
  {
    id: 'reflect',
    label: 'Predict · Reflect',
    badge: 'reflect',
    badgeClass: 'reflect',
    prompt: 'REFLECT · OVER Y-AXIS',
    promptSub: 'Flip the triangle. Use FLIP to mirror it, then drag to position.',
    canvasState: 'reflect-y',
    formula: '─── FORMULA LOCKED ──────────────────',
    controls: ['flip', 'reset', 'speed', 'check'],
    showCoords: false,
    feedback: null,
    ald: 'L3',
    insight: null,
  },
  {
    id: 'rotate',
    label: 'Predict · Rotate',
    badge: 'rotate',
    badgeClass: 'rotate',
    prompt: 'ROTATE · 90° CLOCKWISE · ABOUT ORIGIN',
    promptSub: 'Set the rotation and direction, then drag the triangle to your predicted position.',
    canvasState: 'rotate',
    formula: '─── FORMULA LOCKED ──────────────────',
    controls: ['rotation', 'reset', 'speed', 'check'],
    showCoords: false,
    feedback: null,
    ald: 'L3',
    insight: null,
  },
  {
    id: 'coord-reveal',
    label: 'Coordinate Reveal',
    badge: 'translate',
    badgeClass: '',
    prompt: 'WHAT YOU JUST DID — HERE\'S THE RULE',
    promptSub: 'Every point moved by the same amount. Now see it in coordinates.',
    canvasState: 'coords',
    formula: '(x, y)  →  (x + 4, y + 2)',
    controls: ['continue'],
    showCoords: true,
    feedback: null,
    ald: 'L4',
    insight: null,
  },
  {
    id: 'predict-coords',
    label: 'Predict with Coordinates',
    badge: 'reflect',
    badgeClass: 'reflect',
    prompt: 'REFLECT · OVER X-AXIS',
    promptSub: 'Same prediction. Now watch how the coordinates change.',
    canvasState: 'reflect-x',
    formula: '(x, y)  →  (x, −y)',
    controls: ['flip', 'reset', 'speed', 'check'],
    showCoords: true,
    feedback: null,
    ald: 'L4',
    insight: null,
  },
  {
    id: 'capstone',
    label: 'Capstone',
    badge: 'capstone',
    badgeClass: 'capstone',
    prompt: 'IDENTIFY THE SEQUENCE that maps △ABC onto △A′B′C′',
    promptSub: 'Both figures are shown. Build the sequence that proves they\'re congruent.',
    canvasState: 'capstone',
    formula: 'SEQUENCE ARTIFACT ─── PENDING SUBMISSION ─────────',
    controls: ['sequence'],
    showCoords: true,
    feedback: null,
    ald: 'L5',
    insight: null,
  },
];

// ─── Sequence label helper ────────────────────────────────────────────────────
function sequenceLabel(step) {
  if (!step?.type) return null;
  if (step.type === 'TRANSLATE') {
    const dx = step.params?.dx ?? 0;
    const dy = step.params?.dy ?? 0;
    const xPart = dx === 0 ? '' : dx > 0 ? `${dx} RIGHT` : `${Math.abs(dx)} LEFT`;
    const yPart = dy === 0 ? '' : dy > 0 ? `${dy} UP` : `${Math.abs(dy)} DOWN`;
    return `TRANSLATE · ${[xPart, yPart].filter(Boolean).join(', ') || '0'}`;
  }
  if (step.type === 'REFLECT') return `REFLECT · OVER ${step.params?.axis ?? 'X'}-AXIS`;
  if (step.type === 'ROTATE') return `ROTATE · ${step.params?.deg ?? '90°'} ${step.params?.dir ?? 'CW'}`;
  return null;
}

// ─── Module — Mobile Layout ───────────────────────────────────────────────────
function ModuleMobile({ cfg }) {
  const dots = [0, 1, 2, 3, 4, 5];
  const activeIdx = GUIDE_STATE_MAP[cfg.id] ?? 0;
  const [sequenceSteps, setSequenceSteps] = useState({ step1: null, step2: null });

  return (
    <div className="module-frame">
      {/* Status strip */}
      <div className="status-strip">
        <div className="status-left">
          <span className="status-module-id">8.G.A</span>
          <span>RIGID MOTIONS</span>
          <div className="status-dots">
            {dots.map(i => (
              <div key={i} className={`sdot ${i < activeIdx ? 'done' : i === activeIdx ? 'active' : ''}`} />
            ))}
          </div>
        </div>
        <div className="status-right">
          <span className="sys-nom">SYS:NOM</span>
          <span className="esc-btn">ESC</span>
        </div>
      </div>

      {/* Prompt */}
      <div className="prompt-readout">
        <div className={`prompt-type-badge ${cfg.badgeClass}`}>{cfg.badge}</div>
        <div>
          <div className="prompt-text">{cfg.prompt}</div>
          <div className="prompt-sub">{cfg.promptSub}</div>
        </div>
      </div>

      {/* Canvas */}
      <div className="canvas-area mobile" style={{ position: 'relative' }}>
        <CoordGridResponsive height={320} cfg={cfg} />
        {cfg.feedback && (
          <div className={`feedback-banner ${cfg.feedback}`}>
            {cfg.feedback === 'match' ? '✓ CORRECT PREDICTION' :
             cfg.feedback === 'miss'  ? '✗ OFF TARGET — SEE CORRECTION' :
             cfg.closeHint === 'position' ? '◈ CHECK THE POSITION' :
                                            '◈ CHECK THE ORIENTATION'}
          </div>
        )}
        {cfg.insight && <div className="earned-insight">"{cfg.insight}"</div>}
        {!cfg.feedback && cfg.id !== 'capstone' && cfg.id !== 'coord-reveal' && (
          <div className="canvas-hint">drag to predict</div>
        )}
      </div>

      {/* Controls */}
      <ControlStrip cfg={cfg} onSequenceChange={setSequenceSteps} />

      {/* Formula */}
      <div className={`formula-readout ${cfg.showCoords ? 'active' : 'dim'}`}>
        {cfg.id === 'capstone'
          ? (() => {
              const s1 = sequenceLabel(sequenceSteps.step1);
              const s2 = sequenceLabel(sequenceSteps.step2);
              if (!s1) return '─── SEQUENCE PENDING ────────────────────';
              return s2 ? `${s1}  ·  THEN  ·  ${s2}` : s1;
            })()
          : cfg.formula}
      </div>
    </div>
  );
}

// ─── Module — Desktop Layout ──────────────────────────────────────────────────
function ModuleDesktop({ cfg }) {
  const dots = [0, 1, 2, 3, 4, 5];
  const activeIdx = GUIDE_STATE_MAP[cfg.id] ?? 0;
  const [sequenceSteps, setSequenceSteps] = useState({ step1: null, step2: null });

  const allInsights = [
    'Every point moves the same direction and distance.',
    'Every point is equidistant from the axis as its image.',
    'Every point sweeps the same arc around the origin.',
  ];
  const earnedCount = activeIdx >= 3 ? 3 : activeIdx >= 2 ? 2 : activeIdx >= 1 ? 1 : 0;

  // activeIdx is now a guide state index (0–5): translate=0, reflect=1, rotate=2, coord-reveal=3, predict-coords=4, capstone=5
  const progressStages = [
    { label: 'TRANSLATE', pct: activeIdx >= 1 ? 100 : 60, state: activeIdx >= 1 ? 'done' : 'active' },
    { label: 'REFLECT',   pct: activeIdx >= 2 ? 100 : activeIdx >= 1 ? 60 : 0, state: activeIdx >= 2 ? 'done' : activeIdx >= 1 ? 'active' : 'locked' },
    { label: 'ROTATE',    pct: activeIdx >= 3 ? 100 : activeIdx >= 2 ? 60 : 0, state: activeIdx >= 3 ? 'done' : activeIdx >= 2 ? 'active' : 'locked' },
    { label: 'CAPSTONE',  pct: activeIdx >= 5 ? 100 : 0, state: activeIdx >= 5 ? 'active' : 'locked' },
  ];

  return (
    <div className="module-frame desktop" style={{ minHeight: 600 }}>
      {/* Status strip — full width */}
      <div className="status-strip">
        <div className="status-left">
          <span className="status-module-id">8.G.A</span>
          <span>RIGID MOTIONS · GRADE 8 MATHEMATICS</span>
          <div className="status-dots">
            {dots.map(i => (
              <div key={i} className={`sdot ${i < activeIdx ? 'done' : i === activeIdx ? 'active' : ''}`} />
            ))}
          </div>
        </div>
        <div className="status-right">
          <span className="sys-nom">SYS:NOM</span>
          <span className="esc-btn">ESC</span>
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 560 }}>
        {/* LEFT — canvas column */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: `1px solid ${T.border}` }}>
          <div className="prompt-readout">
            <div className={`prompt-type-badge ${cfg.badgeClass}`}>{cfg.badge}</div>
            <div>
              <div className="prompt-text">{cfg.prompt}</div>
              <div className="prompt-sub">{cfg.promptSub}</div>
            </div>
          </div>

          <div className="canvas-area desktop" style={{ flex: 1, position: 'relative' }}>
            <CoordGridResponsive height={440} cfg={cfg} desktop />
            {cfg.feedback && (
              <div className={`feedback-banner ${cfg.feedback}`}>
                {cfg.feedback === 'match' ? '✓ CORRECT PREDICTION' :
                 cfg.feedback === 'miss'  ? '✗ OFF TARGET — SEE CORRECTION' :
                 cfg.closeHint === 'position' ? '◈ CHECK THE POSITION' :
                                                '◈ CHECK THE ORIENTATION'}
              </div>
            )}
            {cfg.insight && <div className="earned-insight">"{cfg.insight}"</div>}
            {!cfg.feedback && cfg.id !== 'capstone' && cfg.id !== 'coord-reveal' && (
              <div className="canvas-hint">drag to predict</div>
            )}
          </div>

          <ControlStrip cfg={cfg} onSequenceChange={setSequenceSteps} />
          <div className={`formula-readout ${cfg.showCoords ? 'active' : 'dim'}`}>
            {cfg.id === 'capstone'
              ? (() => {
                  const s1 = sequenceLabel(sequenceSteps.step1);
                  const s2 = sequenceLabel(sequenceSteps.step2);
                  if (!s1) return '─── SEQUENCE PENDING ────────────────────';
                  return s2 ? `${s1}  ·  THEN  ·  ${s2}` : s1;
                })()
              : cfg.formula}
          </div>
        </div>

        {/* RIGHT — info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {/* Progress */}
          <div className="panel-section">
            <div className="panel-section-title">Progress</div>
            {progressStages.map((s, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: s.state === 'locked' ? T.border : s.state === 'done' ? T.textDim : T.text, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.label}</span>
                  {s.state !== 'locked' && <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: T.textDim }}>{s.pct}%</span>}
                </div>
                <div className={`progress-stage ${s.state}`} style={{ height: 3, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
                  <div className="progress-stage-fill" style={{ width: `${s.pct}%`, background: s.state === 'done' ? T.ghost : T.accent, height: '100%', borderRadius: 2, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Vertex coordinates */}
          <div className="panel-section">
            <div className="panel-section-title">Vertex Coordinates</div>
            <table className={`vertex-table ${cfg.showCoords ? '' : 'hidden'}`}>
              <tbody>
                <tr><td>A</td><td>(1, 1)</td><td style={{ textAlign: 'right', color: T.accent, fontFamily: 'var(--mono)', fontSize: 10 }}>{cfg.showCoords ? getImageCoord(cfg.id, 0) : '─ ─'}</td></tr>
                <tr><td>B</td><td>(4, 2)</td><td style={{ textAlign: 'right', color: T.accent, fontFamily: 'var(--mono)', fontSize: 10 }}>{cfg.showCoords ? getImageCoord(cfg.id, 1) : '─ ─'}</td></tr>
                <tr><td>C</td><td>(2, 4)</td><td style={{ textAlign: 'right', color: T.accent, fontFamily: 'var(--mono)', fontSize: 10 }}>{cfg.showCoords ? getImageCoord(cfg.id, 2) : '─ ─'}</td></tr>
              </tbody>
            </table>
            {!cfg.showCoords && <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: T.textDim, marginTop: 6, letterSpacing: '0.08em' }}>coordinates unlock at L4</div>}
          </div>

          {/* Formula/notation */}
          <div className="panel-section">
            <div className="panel-section-title">Coordinate Rule</div>
            <div className={`notation-card ${cfg.showCoords ? 'revealed' : ''}`}>
              {cfg.showCoords ? cfg.formula : '─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─'}
            </div>
          </div>

          {/* Earned insights */}
          <div className="panel-section" style={{ flex: 1 }}>
            <div className="panel-section-title">Discoveries</div>
            <div className="insight-list">
              {allInsights.map((ins, i) => (
                <div key={i} className={`insight-item ${i < earnedCount ? 'earned' : ''}`}>
                  <div className="insight-dot" />
                  <span>{ins}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getImageCoord(stateId, idx) {
  const coordMap = {
    'predict':       [null, null, null],
    'feedback-match':[[5,3],[8,4],[6,6]],
    'feedback-miss': [[5,3],[8,4],[6,6]],
    'reflect':       [[-1,1],[-4,2],[-2,4]],
    'rotate':        [[-1,1],[-2,4],[-4,2]],
    'coord-reveal':  [[5,3],[8,4],[6,6]],
    'predict-coords':[[ 1,-1],[4,-2],[2,-4]],
    'capstone':      [[-1,1],[-2,4],[-4,2]],
  };
  const coords = coordMap[stateId];
  if (!coords || !coords[idx]) return '─ ─';
  const [x, y] = coords[idx];
  return `(${x}, ${y})`;
}

// Responsive canvas wrapper
function CoordGridResponsive({ height, cfg, desktop }) {
  const ref = useRef();
  const [w, setW] = useState(desktop ? 800 : 390);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(entries => {
      setW(entries[0].contentRect.width);
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
      <CoordGrid width={w} height={height} state={cfg.canvasState} showCoords={cfg.showCoords} />
    </div>
  );
}


// ─── Sequence step component ──────────────────────────────────────────────────
function SequenceStep({ stepNum, value, onChange, disabled }) {
  const type = value?.type ?? null;
  const params = value?.params ?? {};

  const setType = (t) => onChange({ type: t, params: {} });
  const setParam = (key, val) => onChange({ type, params: { ...params, [key]: val } });

  return (
    <div className="seq-step" style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div className="seq-step-label">Step {stepNum}</div>
      <div className="seq-step-val" style={{ marginBottom: 6 }}>{sequenceLabel(value) ?? '─ SET TYPE ─'}</div>

      {/* Type selector */}
      <div className="ctrl-group" style={{ marginBottom: 4 }}>
        {['TRANSLATE', 'REFLECT', 'ROTATE'].map(t => (
          <button key={t} className={`ctrl-btn ${type === t ? 'selected' : ''}`}
            style={{ fontSize: 8, padding: '3px 7px' }}
            onClick={() => setType(t)}>{t}</button>
        ))}
      </div>

      {/* Conditional parameters */}
      {type === 'TRANSLATE' && (
        <div className="ctrl-group" style={{ flexWrap: 'wrap', gap: 3 }}>
          <span className="ctrl-label">dx</span>
          {[-3, -2, -1, 1, 2, 3].map(n => (
            <button key={`dx${n}`} className={`ctrl-btn ${params.dx === n ? 'selected' : ''}`}
              style={{ fontSize: 8, padding: '3px 6px', minWidth: 24 }}
              onClick={() => setParam('dx', n)}>{n > 0 ? `+${n}` : n}</button>
          ))}
          <span className="ctrl-label" style={{ marginLeft: 4 }}>dy</span>
          {[-3, -2, -1, 1, 2, 3].map(n => (
            <button key={`dy${n}`} className={`ctrl-btn ${params.dy === n ? 'selected' : ''}`}
              style={{ fontSize: 8, padding: '3px 6px', minWidth: 24 }}
              onClick={() => setParam('dy', n)}>{n > 0 ? `+${n}` : n}</button>
          ))}
        </div>
      )}
      {type === 'REFLECT' && (
        <div className="ctrl-group">
          {['X', 'Y'].map(ax => (
            <button key={ax} className={`ctrl-btn ${params.axis === ax ? 'selected' : ''}`}
              style={{ fontSize: 8, padding: '3px 8px' }}
              onClick={() => setParam('axis', ax)}>{ax}-AXIS</button>
          ))}
        </div>
      )}
      {type === 'ROTATE' && (
        <div className="ctrl-group" style={{ flexWrap: 'wrap', gap: 3 }}>
          {['90°', '180°', '270°'].map(d => (
            <button key={d} className={`ctrl-btn ${params.deg === d ? 'selected' : ''}`}
              style={{ fontSize: 8, padding: '3px 7px' }}
              onClick={() => setParam('deg', d)}>{d}</button>
          ))}
          {['CW', 'CCW'].map(dir => (
            <button key={dir} className={`ctrl-btn ${params.dir === dir ? 'selected' : ''}`}
              style={{ fontSize: 8, padding: '3px 7px' }}
              onClick={() => setParam('dir', dir)}>{dir}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function ControlStrip({ cfg, onSequenceChange }) {
  const [speed, setSpeed] = useState('1×');
  const [flipped, setFlipped] = useState(false);
  const [rotation, setRotation] = useState('90°');
  const [rotDir, setRotDir] = useState('CW');
  const [step1, setStep1] = useState(null);
  const [step2, setStep2] = useState(null);

  const handleStep1Change = (val) => {
    setStep1(val);
    setStep2(null);
    onSequenceChange?.({ step1: val, step2: null });
  };
  const handleStep2Change = (val) => {
    setStep2(val);
    onSequenceChange?.({ step1, step2: val });
  };

  if (cfg.controls.includes('continue')) {
    return (
      <div className="control-strip">
        <div className="ctrl-spacer" />
        <button className="ctrl-btn check">CONTINUE</button>
      </div>
    );
  }

  if (cfg.controls.includes('sequence')) {
    return (
      <div className="control-strip" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
        <div className="seq-builder">
          <SequenceStep stepNum={1} value={step1} onChange={handleStep1Change} disabled={false} />
          <SequenceStep stepNum={2} value={step2} onChange={handleStep2Change} disabled={step1 === null} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ctrl-btn reset" onClick={() => { setStep1(null); setStep2(null); onSequenceChange?.({ step1: null, step2: null }); }}>RESET</button>
          <div className="ctrl-spacer" />
          <button className="ctrl-btn check">CHECK SEQUENCE</button>
        </div>
      </div>
    );
  }

  return (
    <div className="control-strip">
      {cfg.controls.includes('flip') && (
        <div className="ctrl-group">
          <button className={`ctrl-btn ${flipped ? 'selected' : ''}`}
            onClick={() => setFlipped(f => !f)}>FLIP</button>
        </div>
      )}
      {cfg.controls.includes('rotation') && (
        <div className="ctrl-group">
          <span className="ctrl-label">°</span>
          {['90°', '180°', '270°'].map(r => (
            <button key={r} className={`ctrl-btn ${rotation === r ? 'selected' : ''}`}
              onClick={() => setRotation(r)}>{r}</button>
          ))}
          {['CW', 'CCW'].map(d => (
            <button key={d} className={`ctrl-btn ${rotDir === d ? 'selected' : ''}`}
              onClick={() => setRotDir(d)}>{d}</button>
          ))}
        </div>
      )}
      {cfg.controls.includes('reset') && (
        <button className="ctrl-btn reset">RESET</button>
      )}
      <div className="ctrl-spacer" />
      {cfg.controls.includes('speed') && (
        <div className="ctrl-group">
          <span className="ctrl-label">Speed</span>
          {['0.5×', '1×', '2×'].map(s => (
            <button key={s} className={`ctrl-btn ${speed === s ? 'selected' : ''}`}
              onClick={() => setSpeed(s)}>{s}</button>
          ))}
        </div>
      )}
      {cfg.controls.includes('check') && (
        <button className="ctrl-btn check">CHECK</button>
      )}
    </div>
  );
}

// ─── Journey Map ──────────────────────────────────────────────────────────────
const JOURNEY_CARDS = [
  { state: '01', title: 'predict-translate', desc: 'Entry point. Student drags ghost triangle to predicted translation. No coordinates, no orientation challenge.', badge: 'l3' },
  { state: '02', title: 'predict-reflect', desc: 'Orientation reversal introduced. FLIP control activates. Axis equidistance ticks visible during interaction.', badge: 'l3' },
  { state: '03', title: 'predict-rotate', desc: 'Rotation about origin. Degree selector appears. Arcs show each vertex sweeping the same angle.', badge: 'l3' },
  { state: '04', title: 'coordinate reveal', desc: 'Earned boundary moment. Coordinate rule surfaces as a label for already-understood spatial behavior.', badge: 'transition' },
  { state: '05', title: 'predict with coordinates', desc: 'Same loop continues. Vertex coordinates now visible. Student connects spatial prediction to coordinate change.', badge: 'l4' },
  { state: '06', title: 'capstone', desc: 'Inverse task. Both figures shown simultaneously. Student identifies and names the transformation sequence.', badge: 'l5' },
];

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [viewport, setViewport] = useState('mobile');
  const [stateIdx, setStateIdx] = useState(0);
  const cfg = STATES[stateIdx];

  return (
    <>
      <style>{css}</style>

      {/* Top bar */}
      <div className="top-bar">
        <div>
          <div className="top-bar-title">RIGID MOTIONS · Module Mockup</div>
          <div className="top-bar-sub">8.G.A.1 · 8.G.A.2 · 8.G.A.3 · Grade 8 Mathematics · Full User Journey</div>
        </div>
        <div className="top-bar-badge">Design Spec v2 · 2026</div>
      </div>

      <div className="journey">
        {/* Journey overview */}
        <div className="section-label">Module Journey</div>
        <div className="journey-overview">
          {JOURNEY_CARDS.map((c, i) => (
            <div key={i} className={`overview-card ${stateIdx === [0,3,4,5,6,7][i] ? 'active' : ''}`}
              onClick={() => setStateIdx([0,3,4,5,6,7][i])}
              style={{ cursor: 'pointer' }}>
              <div className="oc-state">State {c.state}</div>
              <div className="oc-title">{c.title}</div>
              <div className="oc-desc">{c.desc}</div>
              <div className={`oc-badge ${c.badge}`}>{c.badge === 'l3' ? 'Level 3' : c.badge === 'l4' ? 'Level 4' : c.badge === 'l5' ? 'Level 5' : 'Transition'}</div>
            </div>
          ))}
        </div>

        {/* Viewport switcher + state nav */}
        <div className="section-label">Interactive Mockup</div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap' }}>
          <div className="viewport-tabs">
            {['mobile', 'tablet', 'desktop'].map(v => (
              <button key={v} className={`vp-tab ${viewport === v ? 'active' : ''}`}
                onClick={() => setViewport(v)}>{v}</button>
            ))}
          </div>
          <div className="state-nav">
            {STATES.map((s, i) => (
              <button key={s.id} className={`state-btn ${stateIdx === i ? 'active' : ''}`}
                onClick={() => setStateIdx(i)}>{s.label}</button>
            ))}
          </div>
        </div>

        {/* Module render */}
        {viewport === 'mobile' && (
          <div className="device-chrome mobile">
            <ModuleMobile cfg={cfg} />
          </div>
        )}
        {viewport === 'tablet' && (
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, width: 808, margin: '0 auto', overflow: 'hidden' }}>
            <ModuleDesktop cfg={cfg} />
          </div>
        )}
        {viewport === 'desktop' && (
          <ModuleDesktop cfg={cfg} />
        )}

        {/* Annotation */}
        <div className="annotation">
          <span className="annotation-icon">⬡</span>
          <span>
            <strong style={{ fontWeight: 500 }}>Current state:</strong> <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: T.accent }}>{cfg.label}</span> — {cfg.id === 'predict' ? 'Ghost is visible, draggable. No coordinate overlay. Transformation vector renders as student drags.' : cfg.id === 'feedback-match' ? 'Image settles at correct position. Ghost stays visible for comparison. CHECK relabels to NEXT. Both pulse green. Earned insight fires.' : cfg.id === 'feedback-miss' ? 'Image animates to correct position. Dashed gap lines connect each misplaced ghost vertex to correct landing. Nudge offered.' : cfg.id === 'feedback-close' ? 'Ghost position is right but orientation is wrong (or vice versa). Specific hint shown. Ghost stays — student adjusts and resubmits.' : cfg.id === 'reflect' ? 'Single FLIP toggle mirrors the ghost. Axis equidistance ticks render dynamically as student drags. Orientation challenge introduced.' : cfg.id === 'rotate' ? 'Degree selector + CW/CCW toggle control ghost rotation. Rotation arcs sweep CW at each vertex radius from origin.' : cfg.id === 'coord-reveal' ? 'Coordinate rule surfaces in FormulaReadout after student has mastered all three transformation types spatially. Coordinates activate on both shapes.' : cfg.id === 'predict-coords' ? 'Same Predict & Reveal loop. Coordinate labels now live on both shapes. Student connects spatial reasoning to coordinate rule.' : 'Inverse task. Both pre-image and image shown simultaneously. Sequence builder replaces all prediction controls. Live preview ghost for Step 1.'}
          </span>
        </div>
      </div>
    </>
  );
}