---
name: PhD Outreach Tool
description: Agentic PhD cold-email outreach web app — full build state, file locations, and known issues
type: project
originSessionId: 2c901603-9296-41d3-bd55-72df8e68f392
---
A fully working web app at `04-workspace/phd-outreach/` that takes a CV + universities + research domain, discovers professors via web search, scores alignment, and drafts personalized cold emails.

**How to run:**
```bash
cd 04-workspace/phd-outreach
source .venv/bin/activate
uvicorn web.app:app --host 0.0.0.0 --port 8000 --timeout-keep-alive 700
# open http://localhost:8000
```

**Key files:**
- `src/phd_outreach/claude_runner.py` — subprocess wrapper for `claude -p`; uses stdin for prompt, `--permission-mode bypassPermissions`, JSON extractor in `ask_json`
- `src/phd_outreach/cv_parser.py` — PDF/TXT parsing via pdfplumber + Claude
- `src/phd_outreach/discovery.py` — professor discovery via WebSearch+WebFetch, 600s timeout
- `src/phd_outreach/scorer.py` — alignment scoring
- `src/phd_outreach/drafter.py` — email drafting
- `src/phd_outreach/gmail.py` — IMAP App Password draft saving (no OAuth)
- `web/app.py` — FastAPI app, file-based sessions, parallel university discovery via ThreadPoolExecutor
- `web/templates/index.html` — TailwindCSS UI, multi-university tag input (paste comma-separated), slider 1–100 professors
- `web/templates/results.html` — collapsible email cards, Save to Gmail Drafts button

**Architecture decisions:**
- No Anthropic API key — all AI via `claude -p` CLI subprocess
- No OAuth — Gmail uses IMAP App Password modal
- Prompt passed via stdin (not CLI arg) so `--tools` variadic flag doesn't consume it
- `--permission-mode bypassPermissions` so WebSearch runs without asking
- `ask_json` uses brace-matching extractor to handle extra text after JSON
- Universities discovered in parallel (up to 5 workers), results merged and top-N scored

**Why:** Fahad is applying to PhD/MS programs and wanted to automate personalized cold outreach to professors.
