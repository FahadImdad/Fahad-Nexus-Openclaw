from __future__ import annotations

from pathlib import Path

import pdfplumber

from .claude_runner import ask_json
from .models import CVProfile


def _extract_pdf_text(path: str) -> str:
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\n"
    return text.strip()


def parse_cv(cv_path: str, config: dict | None = None) -> CVProfile:
    path = Path(cv_path)
    raw_text = _extract_pdf_text(cv_path) if path.suffix.lower() == ".pdf" else path.read_text(encoding="utf-8")

    data = ask_json(
        f"""Extract information from this CV. Return a JSON object with exactly these keys:
- name (string)
- email (string, empty if not found)
- research_interests (list of specific research topics)
- education (list like "PhD CS, MIT, 2024")
- publications (list of paper/project titles)
- skills (list of technical skills)
- summary (3-4 sentence research background summary)

CV:
{raw_text[:6000]}

Return ONLY the JSON object.""",
    )

    assert isinstance(data, dict)
    return CVProfile(
        raw_text=raw_text,
        name=data.get("name", ""),
        email=data.get("email", ""),
        research_interests=data.get("research_interests", []),
        education=data.get("education", []),
        publications=data.get("publications", []),
        skills=data.get("skills", []),
        summary=data.get("summary", ""),
    )
