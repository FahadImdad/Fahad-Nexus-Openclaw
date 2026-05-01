"""Gmail integration via IMAP + App Password — no Google Cloud Console needed."""

from __future__ import annotations

import imaplib
import time
from email.mime.text import MIMEText


def _build_message(from_email: str, to_email: str, subject: str, body: str) -> MIMEText:
    msg = MIMEText(body, "plain", "utf-8")
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject
    return msg


def create_draft(
    gmail_address: str,
    app_password: str,
    to_email: str,
    subject: str,
    body: str,
) -> None:
    """Append email to Gmail Drafts folder via IMAP."""
    msg = _build_message(gmail_address, to_email, subject, body)
    with imaplib.IMAP4_SSL("imap.gmail.com") as imap:
        imap.login(gmail_address, app_password)
        imap.append(
            "[Gmail]/Drafts",
            "\\Draft",
            imaplib.Time2Internaldate(time.time()),
            msg.as_bytes(),
        )


def verify_credentials(gmail_address: str, app_password: str) -> None:
    """Raise if login fails — used by the auth command."""
    with imaplib.IMAP4_SSL("imap.gmail.com") as imap:
        imap.login(gmail_address, app_password)
