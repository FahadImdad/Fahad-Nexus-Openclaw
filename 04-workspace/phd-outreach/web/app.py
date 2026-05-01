"""FastAPI web app — PhD outreach, email via App Password (no OAuth setup needed)."""
from __future__ import annotations

import json
import os
import secrets
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).parent.parent
load_dotenv(ROOT / ".env")

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

sys.path.insert(0, str(ROOT / "src"))
from phd_outreach.cv_parser import parse_cv
from phd_outreach.discovery import discover_professors
from phd_outreach.drafter import draft_all_emails
from phd_outreach.gmail import create_draft, verify_credentials
from phd_outreach.scorer import score_professors

# ── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(title="PhD Outreach")
templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))

SESSIONS_DIR = Path(__file__).parent / "sessions"
SESSIONS_DIR.mkdir(exist_ok=True)


# ── Sessions ─────────────────────────────────────────────────────────────────

def _load(sid: str) -> dict:
    f = SESSIONS_DIR / f"{sid}.json"
    try:
        return json.loads(f.read_text()) if f.exists() else {}
    except Exception:
        return {}


def _save(sid: str, data: dict) -> None:
    (SESSIONS_DIR / f"{sid}.json").write_text(json.dumps(data, default=str))


def _session(request: Request) -> tuple[str, dict]:
    sid = request.cookies.get("phd_sid") or secrets.token_urlsafe(16)
    return sid, _load(sid)


def _respond(response, sid: str, session: dict):
    _save(sid, session)
    response.set_cookie("phd_sid", sid, httponly=True, samesite="lax")
    return response


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    sid, session = _session(request)
    resp = templates.TemplateResponse(request, "index.html", {
        "gmail_connected": bool(session.get("gmail_address")),
        "gmail_email": session.get("gmail_address", ""),
    })
    return _respond(resp, sid, session)


# ── Gmail connect (simple App Password form) ─────────────────────────────────

@app.post("/auth/connect")
async def auth_connect(
    request: Request,
    gmail_address: str = Form(...),
    app_password: str = Form(...),
):
    sid, session = _session(request)
    app_password = app_password.replace(" ", "")  # strip spaces Google adds

    try:
        verify_credentials(gmail_address, app_password)
    except Exception as exc:
        resp = templates.TemplateResponse(request, "index.html", {
            "gmail_connected": False,
            "gmail_email": "",
            "connect_error": f"Login failed: {exc}. Check your address and App Password.",
        })
        return _respond(resp, sid, session)

    session["gmail_address"] = gmail_address
    session["gmail_app_password"] = app_password
    resp = RedirectResponse("/", status_code=303)
    return _respond(resp, sid, session)


@app.get("/auth/disconnect")
async def auth_disconnect(request: Request):
    sid, session = _session(request)
    session.pop("gmail_address", None)
    session.pop("gmail_app_password", None)
    resp = RedirectResponse("/", status_code=303)
    return _respond(resp, sid, session)


# ── Pipeline ─────────────────────────────────────────────────────────────────

@app.post("/run")
async def run_pipeline(
    request: Request,
    cv: UploadFile = File(...),
    universities: str = Form(...),
    domain: str = Form(...),
    top_n: int = Form(5),
):
    sid, session = _session(request)

    university_list = [u.strip() for u in universities.split(",") if u.strip()]
    if not university_list:
        return {"ok": False, "error": "Please select at least one university."}

    suffix = Path(cv.filename).suffix if cv.filename else ".pdf"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await cv.read())
        cv_path = tmp.name

    try:
        cv_profile = parse_cv(cv_path)
        per_uni = max(5, 20 // len(university_list))

        all_professors = []
        with ThreadPoolExecutor(max_workers=min(len(university_list), 5)) as pool:
            futures = {
                pool.submit(discover_professors, uni, domain, per_uni): uni
                for uni in university_list
            }
            for fut in as_completed(futures):
                try:
                    all_professors.extend(fut.result())
                except Exception:
                    pass  # skip universities that fail; others still count

        all_professors = score_professors(all_professors, cv_profile)[:top_n]
        drafts = draft_all_emails(all_professors, cv_profile)
    except Exception as exc:
        return {"ok": False, "error": str(exc)}
    finally:
        try:
            os.unlink(cv_path)
        except Exception:
            pass

    session["drafts"] = [d.model_dump(mode="json") for d in drafts]
    session["universities"] = university_list
    session["domain"] = domain
    _save(sid, session)

    return {"ok": True}


@app.get("/results", response_class=HTMLResponse)
async def results(request: Request):
    sid, session = _session(request)
    unis = session.get("universities", [])
    resp = templates.TemplateResponse(request, "results.html", {
        "drafts": session.get("drafts", []),
        "university": ", ".join(unis) if unis else session.get("university", ""),
        "domain": session.get("domain", ""),
        "gmail_connected": bool(session.get("gmail_address")),
        "gmail_email": session.get("gmail_address", ""),
    })
    return _respond(resp, sid, session)


# ── Save drafts ───────────────────────────────────────────────────────────────

@app.post("/save-drafts")
async def save_drafts(request: Request):
    _, session = _session(request)
    gmail_address = session.get("gmail_address")
    app_password = session.get("gmail_app_password")

    if not gmail_address or not app_password:
        raise HTTPException(status_code=401, detail="Gmail not connected")

    saved, errors = 0, []
    for d in session.get("drafts", []):
        try:
            create_draft(gmail_address, app_password, d["professor"]["email"], d["subject"], d["body"])
            saved += 1
        except Exception as exc:
            errors.append(str(exc))

    return {"saved": saved, "errors": errors}
