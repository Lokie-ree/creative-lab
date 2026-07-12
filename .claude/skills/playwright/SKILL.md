---
name: playwright-cli
description: Command reference for the playwright-cli binary — scripted, headless-capable browser automation. Use when the claude-in-chrome browser tools are unavailable or have failed 2-3 times, when the task needs scriptable automation (batch screenshots, PDF export, request mocking/routing, trace capture, test generation), or when the user names Playwright explicitly. For verifying a visual change in the running app, the visual-verify workflow leads — it prefers claude-in-chrome and falls back to this CLI.
---

# Browser Automation (playwright-cli)

## Workflow

1. **Navigate:** `playwright-cli open https://example.com`
2. **Snapshot:** `playwright-cli snapshot` — get element refs (e.g. `e15`).
3. **Interact:** `playwright-cli click e15`, `playwright-cli type "text"`, `playwright-cli fill e5 "value"`, `playwright-cli press Enter`.
4. Re-snapshot after significant changes.

## Core Commands

| Action | Command |
|--------|---------|
| Open/close | `open <url>`, `close` |
| Inspect | `snapshot` (optionally `--filename=out.yaml`) |
| Interact | `click`, `dblclick`, `type`, `fill`, `hover`, `check`/`uncheck`, `drag` |
| Keyboard | `press Enter` / `ArrowDown` etc. |
| Save | `screenshot`, `screenshot e5`, `pdf --filename=page.pdf` |
| Navigate | `go-back`, `go-forward`, `reload` |

**More:** Tabs (`tab-list`, `tab-new`, `tab-select`), storage (`state-save`, `cookie-*`, `localstorage-*`), network (`route`, `unroute`), DevTools (`console`, `tracing-start`). Run `playwright-cli --help` or see `references/` for request mocking, tracing, video, test generation, session management.

## Examples

**Form:** `open` → `snapshot` → `fill e1 "email"` `fill e2 "pass"` → `click e3` → `snapshot`.

**Debug:** `tracing-start` → reproduce steps → `tracing-stop`; or `console` / `network` to inspect.
