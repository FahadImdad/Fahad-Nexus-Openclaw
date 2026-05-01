from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CVProfile(BaseModel):
    raw_text: str
    name: str = ""
    email: str = ""
    research_interests: list[str] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    publications: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    summary: str = ""


class Professor(BaseModel):
    name: str
    email: str = ""
    university: str
    department: str = ""
    title: str = ""
    research_areas: list[str] = Field(default_factory=list)
    bio: str = ""
    recent_papers: list[str] = Field(default_factory=list)
    homepage_url: str = ""
    alignment_score: float = 0.0
    alignment_reasoning: str = ""


class EmailDraft(BaseModel):
    professor: Professor
    subject: str
    body: str
    status: str = "pending"  # pending | approved | sent | skipped
    sent_at: Optional[datetime] = None


class OutreachSession(BaseModel):
    university: str
    domain: str
    cv_profile: CVProfile
    professors: list[Professor] = Field(default_factory=list)
    email_drafts: list[EmailDraft] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
