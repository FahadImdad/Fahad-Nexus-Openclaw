from __future__ import annotations

from .claude_runner import ask_json
from .models import CVProfile, EmailDraft, Professor


def draft_email(
    professor: Professor,
    cv: CVProfile,
    config: dict | None = None,
) -> EmailDraft:
    data = ask_json(
        f"""Write a personalized cold email from a prospective PhD/MS student to this professor.

Professor:
- Name: {professor.name}
- Title: {professor.title}
- University: {professor.university}
- Department: {professor.department}
- Research Areas: {', '.join(professor.research_areas)}
- Bio: {professor.bio}
- Recent Work: {'; '.join(professor.recent_papers[:3])}

Student:
- Name: {cv.name}
- Email: {cv.email}
- Background: {cv.summary}
- Research Interests: {', '.join(cv.research_interests)}
- Education: {'; '.join(cv.education)}
- Publications/Projects: {'; '.join(cv.publications[:3])}
- Skills: {', '.join(cv.skills[:8])}

Requirements:
- Address: "Dear Professor [Last Name],"
- Open with a specific, genuine reference to ONE aspect of their recent research
- Connect that research to the student's own background
- Highlight 1–2 concrete qualifications
- State intent to apply for PhD/MS clearly
- Close with "Best regards," and the student's name
- Tone: professional yet enthusiastic
- Length: 180–240 words

Return a JSON object with:
- subject: email subject line mentioning the research area
- body: full email text

Return ONLY the JSON object.""",
    )
    assert isinstance(data, dict)
    return EmailDraft(
        professor=professor,
        subject=data.get("subject", "Prospective PhD Student Inquiry"),
        body=data.get("body", ""),
    )


def draft_all_emails(
    professors: list[Professor],
    cv: CVProfile,
    config: dict | None = None,
) -> list[EmailDraft]:
    return [draft_email(prof, cv) for prof in professors]
