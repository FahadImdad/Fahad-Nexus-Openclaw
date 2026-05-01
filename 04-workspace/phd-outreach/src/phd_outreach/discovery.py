"""Professor discovery using Claude Code's built-in WebSearch + WebFetch tools."""

from __future__ import annotations

from .claude_runner import ask_json
from .models import Professor

_UNI_DOMAINS: dict[str, str] = {
    "mit": "mit.edu",
    "massachusetts institute of technology": "mit.edu",
    "stanford": "stanford.edu",
    "stanford university": "stanford.edu",
    "cmu": "cmu.edu",
    "carnegie mellon": "cmu.edu",
    "carnegie mellon university": "cmu.edu",
    "harvard": "harvard.edu",
    "harvard university": "harvard.edu",
    "berkeley": "berkeley.edu",
    "uc berkeley": "berkeley.edu",
    "columbia": "columbia.edu",
    "columbia university": "columbia.edu",
    "princeton": "princeton.edu",
    "princeton university": "princeton.edu",
    "yale": "yale.edu",
    "yale university": "yale.edu",
    "cornell": "cornell.edu",
    "cornell university": "cornell.edu",
    "caltech": "caltech.edu",
    "georgia tech": "gatech.edu",
    "georgia institute of technology": "gatech.edu",
    "university of washington": "washington.edu",
    "usc": "usc.edu",
    "university of southern california": "usc.edu",
    "uiuc": "illinois.edu",
    "university of illinois": "illinois.edu",
    "ut austin": "utexas.edu",
    "university of texas": "utexas.edu",
    "nyu": "nyu.edu",
    "new york university": "nyu.edu",
    "ucsd": "ucsd.edu",
    "ucla": "ucla.edu",
    "upenn": "upenn.edu",
    "university of pennsylvania": "upenn.edu",
    "oxford": "ox.ac.uk",
    "university of oxford": "ox.ac.uk",
    "cambridge": "cam.ac.uk",
    "university of cambridge": "cam.ac.uk",
    "university of michigan": "umich.edu",
    "university of toronto": "utoronto.ca",
}


def _get_domain(university: str) -> str:
    key = university.lower().strip()
    return _UNI_DOMAINS.get(key, university.lower().split()[0] + ".edu")


def discover_professors(
    university: str,
    domain: str,
    max_professors: int = 12,
    config: dict | None = None,
) -> list[Professor]:
    """
    Use Claude Code's WebSearch + WebFetch to find and enrich professors.
    No API key required — uses the authenticated Claude Code session.
    """
    uni_domain = _get_domain(university)

    raw_list = ask_json(
        f"""Search the web and find {max_professors} professors at {university} who work in "{domain}".

Steps:
1. Search for "{university} {domain} faculty professors" and "{university} {domain} department faculty list"
2. Visit the faculty listing pages you find (especially site:{uni_domain})
3. For each professor found, try to visit their individual faculty/homepage to get details
4. Collect their research papers, specific research interests, and contact info

Return a JSON array of professor objects. Each object must have:
- name (string, full name)
- title (e.g. "Associate Professor")
- department (string)
- email (string — look carefully on their pages, often in Contact section)
- homepage_url (their faculty or personal page URL)
- research_areas (list of specific research topics)
- bio (2–3 sentence summary of their research)
- recent_papers (list of up to 4 recent paper titles)

Only include actual faculty members (professor, associate professor, assistant professor).
Return ONLY the JSON array — no other text.""",
        tools=["WebSearch", "WebFetch"],
        timeout=600,
    )

    if not isinstance(raw_list, list):
        raw_list = []

    professors: list[Professor] = []
    for item in raw_list[:max_professors]:
        if not isinstance(item, dict) or not item.get("name"):
            continue
        # Guess email if still missing
        if not item.get("email") and item.get("name"):
            parts = item["name"].lower().split()
            if len(parts) >= 2:
                item["email"] = f"{parts[0]}.{parts[-1]}@{uni_domain}"

        professors.append(
            Professor(
                name=item.get("name", "Unknown"),
                email=item.get("email", ""),
                university=university,
                department=item.get("department", ""),
                title=item.get("title", ""),
                research_areas=item.get("research_areas", []),
                bio=item.get("bio", ""),
                recent_papers=item.get("recent_papers", []),
                homepage_url=item.get("homepage_url", ""),
            )
        )

    return professors
