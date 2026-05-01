"""Thin wrapper around the `claude -p` CLI so no Anthropic API key is needed."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

_CANDIDATES = [
    str(Path.home() / ".local" / "bin" / "claude"),
    "claude",
    "/usr/local/bin/claude",
]


def _find_claude() -> str:
    for c in _CANDIDATES:
        if shutil.which(c):
            return c
    raise RuntimeError(
        "Claude Code CLI not found in PATH.\n"
        "Install it from https://claude.ai/code, then re-run."
    )


def ask(
    prompt: str,
    *,
    tools: list[str] | None = None,
    model: str = "sonnet",
    timeout: int = 180,
) -> str:
    """
    Run `claude -p` and return the plain-text response.

    tools=None   → don't pass --tools (use Claude Code defaults)
    tools=[]     → --tools "" (disable all tools, fastest)
    tools=[...]  → --tools "WebSearch,WebFetch" etc.
    """
    claude = _find_claude()
    cmd = [claude, "-p", "--output-format", "json", "--model", model,
           "--permission-mode", "bypassPermissions"]

    if tools:  # only pass --tools when list is non-empty; empty list = use defaults
        cmd += ["--tools", ",".join(tools)]

    # Pass prompt via stdin so --tools (variadic) doesn't consume it as a tool name
    proc = subprocess.run(cmd, input=prompt, capture_output=True, text=True, timeout=timeout)

    if proc.returncode != 0:
        raise RuntimeError(f"claude CLI exited {proc.returncode}: {proc.stderr[:400]}")

    try:
        data = json.loads(proc.stdout)
    except json.JSONDecodeError:
        # Fallback: treat raw stdout as the answer
        return proc.stdout.strip()

    if data.get("is_error"):
        raise RuntimeError(f"Claude error: {data.get('result', '')}")

    result = data.get("result", "")
    return result if isinstance(result, str) else json.dumps(result)


def ask_json(
    prompt: str,
    *,
    tools: list[str] | None = None,
    model: str = "sonnet",
    timeout: int = 180,
) -> list | dict:
    """Like ask(), but extracts and parses the first JSON object or array."""
    text = ask(prompt, tools=tools, model=model, timeout=timeout)
    text = text.strip()

    # Strip markdown fences if present
    if text.startswith("```"):
        text = re.sub(r"^```\w*\n?", "", text)
        text = re.sub(r"\n?```.*$", "", text, flags=re.DOTALL)
        text = text.strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Extract the first complete JSON array or object using brace/bracket matching
    for start_char, end_char in [("[", "]"), ("{", "}")]:
        start = text.find(start_char)
        if start == -1:
            continue
        depth = 0
        in_str = False
        escape = False
        for i, ch in enumerate(text[start:], start):
            if escape:
                escape = False
                continue
            if ch == "\\" and in_str:
                escape = True
                continue
            if ch == '"':
                in_str = not in_str
                continue
            if in_str:
                continue
            if ch == start_char:
                depth += 1
            elif ch == end_char:
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[start:i + 1])
                    except json.JSONDecodeError:
                        break

    raise ValueError(f"No valid JSON found in response: {text[:200]!r}")
