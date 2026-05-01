"""Main CLI for the PhD/MS cold-email outreach system."""

from __future__ import annotations

import sys
from datetime import datetime
from pathlib import Path

import click
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.prompt import Confirm, Prompt
from rich.table import Table

from .claude_runner import _find_claude
from .config import load_config
from .cv_parser import parse_cv
from .discovery import discover_professors
from .drafter import draft_all_emails
from .gmail import create_draft, verify_credentials
from .models import OutreachSession
from .scorer import score_professors

console = Console()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _abort(msg: str) -> None:
    console.print(f"[red]Error: {msg}[/red]")
    sys.exit(1)


def _step(n: int, total: int, label: str) -> str:
    return f"[[bold cyan]{n}/{total}[/bold cyan]] {label}"


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

@click.group()
def main() -> None:
    """PhD/MS Cold-Email Outreach — discover professors, score fit, draft & send."""


# ── setup ──────────────────────────────────────────────────────────────────

@main.command()
def setup() -> None:
    """Interactive setup wizard — creates the .env file."""
    console.print(Panel.fit("[bold blue]PhD/MS Outreach — Setup[/bold blue]", border_style="blue"))

    console.print("\n[green]No API keys required![/green] Uses your Claude Code session for all AI.\n")
    console.print("[bold]Gmail — App Password[/bold] (to save drafts to your inbox)")
    console.print("  1. myaccount.google.com/security → enable 2-Step Verification")
    console.print("  2. myaccount.google.com/apppasswords → create password for Mail")
    console.print("  3. Gmail Settings → Forwarding & POP/IMAP → Enable IMAP\n")

    gmail_address = Prompt.ask("  Your Gmail address", default="")
    app_password = Prompt.ask("  App Password (16 chars, no spaces)", default="")

    if gmail_address and app_password:
        try:
            verify_credentials(gmail_address, app_password)
            console.print("  [green]✓ Gmail credentials verified[/green]")
        except Exception as exc:
            console.print(f"  [yellow]Warning: could not verify ({exc})[/yellow]")

    env = Path(".env")
    env.write_text(f"GMAIL_ADDRESS={gmail_address}\nGMAIL_APP_PASSWORD={app_password}\n")
    console.print(f"\n[green]✓ Config saved to {env.resolve()}[/green]")
    console.print(
        "\nCLI:    [bold]phd-outreach run --cv your_cv.pdf --university MIT --domain 'ML'[/bold]\n"
        "Web UI: [bold]phd-outreach web[/bold]  (Gmail OAuth, runs at localhost:8000)"
    )


# ── run ────────────────────────────────────────────────────────────────────

@main.command()
@click.option("--cv", "cv_path", required=True, type=click.Path(exists=True),
              help="Path to your CV (PDF or TXT).")
@click.option("--university", required=True, help='Target university, e.g. "MIT".')
@click.option("--domain", required=True, help='Research domain, e.g. "natural language processing".')
@click.option("--max-professors", default=12, show_default=True,
              help="Max professors to discover.")
@click.option("--top-n", default=5, show_default=True,
              help="How many top-scoring professors to email.")
@click.option("--save", "save_path", type=click.Path(), default=None,
              help="Save full session to a JSON file.")
@click.option("--dry-run", is_flag=True,
              help="Draft emails but do not send.")
@click.option("--resume", "resume_path", type=click.Path(exists=True), default=None,
              help="Resume from a previously saved session JSON (skips discovery).")
def run(
    cv_path: str,
    university: str,
    domain: str,
    max_professors: int,
    top_n: int,
    save_path: str | None,
    dry_run: bool,
    resume_path: str | None,
) -> None:
    """Run the full outreach pipeline."""

    config = load_config()
    # Verify claude CLI is available before doing any work
    try:
        _find_claude()
    except RuntimeError as e:
        _abort(str(e))

    TOTAL = 4

    console.print(
        Panel.fit(
            f"[bold blue]PhD/MS Outreach[/bold blue]\n"
            f"University: [cyan]{university}[/cyan]   Domain: [cyan]{domain}[/cyan]"
            + ("   [yellow](dry run)[/yellow]" if dry_run else ""),
            border_style="blue",
        )
    )

    # ── Step 1: Parse CV ──────────────────────────────────────────────────
    console.print()
    with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console, transient=True) as p:
        t = p.add_task(_step(1, TOTAL, "Parsing CV…"))
        cv_profile = parse_cv(cv_path, config)
        p.update(t, description=_step(1, TOTAL, f"[green]CV parsed — {cv_profile.name or 'name not found'}"))

    console.print(
        f"  {_step(1, TOTAL, '[green]CV parsed[/green]')}\n"
        f"  [dim]Interests: {', '.join(cv_profile.research_interests[:4])}[/dim]"
    )

    # ── Step 2: Discover professors ───────────────────────────────────────
    if resume_path:
        session = OutreachSession.model_validate_json(Path(resume_path).read_text())
        professors = session.professors
        console.print(f"  {_step(2, TOTAL, f'[green]Loaded {len(professors)} professors from saved session')}")
    else:
        console.print()
        with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console, transient=True) as p:
            t = p.add_task(_step(2, TOTAL, f"Discovering professors at {university}…"))
            professors = discover_professors(university, domain, max_professors, config)
            p.update(t, description="done")

        console.print(f"  {_step(2, TOTAL, f'[green]Found {len(professors)} professors')}")

    if not professors:
        _abort(
            "No professors found. Try adding a SERPER_API_KEY in .env, "
            "or check your university/domain spelling."
        )

    # ── Step 3: Score alignment ───────────────────────────────────────────
    console.print()
    with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console, transient=True) as p:
        t = p.add_task(_step(3, TOTAL, "Scoring alignment…"))
        professors = score_professors(professors, cv_profile, config)
        p.update(t, description="done")

    console.print(f"  {_step(3, TOTAL, '[green]Alignment scored')}")

    top_professors = professors[:top_n]

    # Display ranked table
    table = Table(title=f"\nTop {len(top_professors)} Matches at {university}", border_style="blue", show_lines=False)
    table.add_column("#", style="dim", width=3)
    table.add_column("Professor", style="bold")
    table.add_column("Dept / Title")
    table.add_column("Research Areas")
    table.add_column("Score", justify="right", width=7)
    table.add_column("Email", style="dim")

    for i, prof in enumerate(top_professors, 1):
        score_color = "green" if prof.alignment_score >= 7 else "yellow" if prof.alignment_score >= 5 else "red"
        table.add_row(
            str(i),
            prof.name,
            f"{prof.title or 'Professor'}, {prof.department}" if prof.department else prof.title or "—",
            ", ".join(prof.research_areas[:2]) or "—",
            f"[{score_color}]{prof.alignment_score:.1f}[/{score_color}]",
            prof.email or "[dim]unknown[/dim]",
        )

    console.print(table)
    console.print()

    if not Confirm.ask(f"Draft emails for these {len(top_professors)} professors?", default=True):
        console.print("[yellow]Stopped before drafting.[/yellow]")
        sys.exit(0)

    # ── Step 4: Draft emails ──────────────────────────────────────────────
    console.print()
    with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console, transient=True) as p:
        t = p.add_task(_step(4, TOTAL, f"Drafting {len(top_professors)} personalized emails…"))
        drafts = draft_all_emails(top_professors, cv_profile, config)
        p.update(t, description="done")

    console.print(f"  {_step(4, TOTAL, f'[green]{len(drafts)} emails drafted')}\n")

    # ── Review drafts then save to Gmail Drafts folder ────────────────────
    sender_email = cv_profile.email

    # Show each draft for review / optional editing before saving
    for idx, draft in enumerate(drafts, 1):
        prof = draft.professor
        to_line = f"{prof.name} <{prof.email}>" if prof.email else f"{prof.name} [dim](no email found)[/dim]"
        console.print(Panel(
            f"[bold]To:[/bold]      {to_line}\n"
            f"[bold]Subject:[/bold] {draft.subject}\n\n"
            f"{draft.body}",
            title=f"Draft {idx}/{len(drafts)}  ·  Score {prof.alignment_score:.1f}/10",
            border_style="cyan" if prof.email else "yellow",
        ))
        if not prof.email:
            console.print("[yellow]  ⚠ No email address found — draft will have empty To: field.[/yellow]")

        while True:
            action = Prompt.ask(
                "  [[bold]K[/bold]]eep / [[bold]E[/bold]]dit / [[bold]S[/bold]]kip / [[bold]Q[/bold]]uit",
                default="k",
            ).strip().lower()[:1]
            if action in ("k", "e", "s", "q"):
                break
            console.print("  [yellow]Enter K, E, S, or Q.[/yellow]")

        if action == "e":
            edited = click.edit(draft.body)
            if edited and edited.strip():
                draft.body = edited.strip()
                console.print("  [dim]Body updated.[/dim]")

        if action == "q":
            console.print("[yellow]  Stopped.[/yellow]\n")
            drafts = drafts[:idx]  # only process up to here
            if action != "k":
                drafts[-1].status = "skipped"
            break

        if action == "s":
            draft.status = "skipped"
        console.print()

    # ── Save kept drafts to Gmail via IMAP App Password ───────────────────
    to_save = [d for d in drafts if d.status != "skipped"]

    saved = 0
    if dry_run or not to_save:
        pass
    else:
        gmail_address = config.get("gmail_address", "")
        app_password = config.get("gmail_app_password", "")

        if not gmail_address or not app_password:
            console.print(
                "[yellow]Gmail not configured — skipping draft save.\n"
                "Run `phd-outreach setup` to add GMAIL_ADDRESS and GMAIL_APP_PASSWORD.[/yellow]\n"
            )
            to_save = []
        else:
            for draft in to_save:
                prof = draft.professor
                try:
                    create_draft(gmail_address, app_password, prof.email, draft.subject, draft.body)
                    draft.status = "draft_saved"
                    saved += 1
                    console.print(f"  [green]✓ Saved to Gmail Drafts:[/green] {prof.name}")
                except Exception as exc:
                    console.print(f"  [red]Failed for {prof.name}: {exc}[/red]")

    # ── Summary ────────────────────────────────────────────────────────────
    skipped_count = sum(1 for d in drafts if d.status == "skipped")
    console.print()
    console.print(
        Panel(
            (f"[green]Saved to Gmail Drafts: {saved}[/green]  ·  [yellow]Skipped: {skipped_count}[/yellow]"
             if not dry_run else
             f"[dim]Dry run — {len(drafts)} drafts generated, none saved to Gmail[/dim]"),
            title="Done",
            border_style="green",
        )
    )
    if saved:
        console.print("[dim]Open Gmail → Drafts to review and send whenever you're ready.[/dim]")

    # ── Persist session ─────────────────────────────────────────────────────
    if save_path:
        session = OutreachSession(
            university=university,
            domain=domain,
            cv_profile=cv_profile,
            professors=professors,
            email_drafts=drafts,
        )
        Path(save_path).write_text(session.model_dump_json(indent=2))
        console.print(f"[dim]Session saved → {save_path}[/dim]")


@main.command()
@click.option("--host", default="0.0.0.0", show_default=True,
              help="Bind address. Use 0.0.0.0 to accept connections from other devices on the network.")
@click.option("--port", default=8000, show_default=True)
def web(host: str, port: int) -> None:
    """Start the web interface (Gmail OAuth, browser-based, multi-user)."""
    try:
        import socket
        import uvicorn
    except ImportError:
        _abort("uvicorn not installed. Run: pip install uvicorn fastapi jinja2 python-multipart")

    web_app_path = Path(__file__).parent.parent.parent.parent / "web" / "app.py"
    if not web_app_path.exists():
        _abort(f"Web app not found at {web_app_path}")

    # Show local + network URLs
    local_url = f"http://localhost:{port}"
    try:
        lan_ip = socket.gethostbyname(socket.gethostname())
        network_url = f"http://{lan_ip}:{port}"
    except Exception:
        network_url = local_url

    console.print(Panel(
        f"[bold]Local:[/bold]   [link={local_url}]{local_url}[/link]\n"
        f"[bold]Network:[/bold] [link={network_url}]{network_url}[/link]  "
        f"[dim]← share this with others[/dim]\n\n"
        f"[dim]Set APP_BASE_URL={network_url} in .env so OAuth redirects work for network users.[/dim]",
        title="[bold blue]PhD Outreach Web UI[/bold blue]",
        border_style="blue",
    ))

    import sys
    sys.path.insert(0, str(web_app_path.parent))
    uvicorn.run("app:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
