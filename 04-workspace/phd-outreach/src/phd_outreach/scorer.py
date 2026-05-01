from __future__ import annotations

from .claude_runner import ask_json
from .models import CVProfile, Professor


def score_alignment(professor: Professor, cv: CVProfile) -> tuple[float, str]:
    data = ask_json(
        f"""Score research alignment between this professor and prospective student (0.0–10.0).

Professor: {professor.name}, {professor.university}
Research Areas: {', '.join(professor.research_areas)}
Bio: {professor.bio}
Recent Papers: {'; '.join(professor.recent_papers[:3])}

Student: {cv.name}
Summary: {cv.summary}
Research Interests: {', '.join(cv.research_interests)}
Education: {'; '.join(cv.education)}
Publications: {'; '.join(cv.publications[:3])}
Skills: {', '.join(cv.skills[:10])}

Return a JSON object with:
- score: float 0.0–10.0
- reasoning: one sentence explaining the score

Return ONLY the JSON object.""",
    )
    assert isinstance(data, dict)
    return float(data.get("score", 5.0)), data.get("reasoning", "")


def score_professors(
    professors: list[Professor],
    cv: CVProfile,
    config: dict | None = None,
) -> list[Professor]:
    for prof in professors:
        score, reason = score_alignment(prof, cv)
        prof.alignment_score = score
        prof.alignment_reasoning = reason
    return sorted(professors, key=lambda p: p.alignment_score, reverse=True)
