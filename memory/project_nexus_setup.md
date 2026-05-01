---
name: Nexus Setup State
description: Current setup status of Nexus on Fahad's machine — what's installed, what was fixed, and where things live
type: project
originSessionId: a6b7537d-6c39-4427-ab85-06c6da13c6b8
---
Nexus is running from: `/Users/fahadimdad/Downloads/Fahad Work/Fahad-Work-Documents/Fahad-Nexus-Openclaw`
GitHub repo: `github.com/FahadImdad/Fahad-Nexus-Openclaw`

**Fixed 2026-05-01:**
- Nexus CLI tools were not installed (nexus-session-start etc. were missing) — fixed by running `uv sync` + `uv tool install . --force` from project root
- All 16 CLI commands now installed at `~/.local/bin/`
- Memory files were saved to old project path (`~/.claude/projects/-Users-fahadimdad-Documents-Fahad-Nexus-Openclaw/memory/`) — migrated to current path
- Memory files also backed up to GitHub under `memory/` folder in the repo

**Why:** Project moved from `/Users/fahadimdad/Documents/` to `/Users/fahadimdad/Downloads/Fahad Work/Fahad-Work-Documents/` — Claude was loading from the wrong project key and Nexus CLI was never reinstalled at the new path.

**How to apply:** If Nexus loader stops working again, first check `which nexus-session-start`. If missing, run `uv tool install . --force` from the project root.
