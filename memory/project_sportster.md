---
name: Sportster Project — Full Context
description: Complete state of the Sportster sports-venue/tournament vendor app prototype — what it is, file location, all screens built, tech architecture, and what's left to do
type: project
originSessionId: 467b34d0-4da4-49cd-9a11-1cdf508419ea
---
## What is Sportster

Sportster is a **sports venue & tournament management app** for Pakistan (Karachi). Two sides:
- **Vendor app** — arena owners manage bookings, schedules, arenas, and tournaments
- **Player/team app** — teams find arenas, register for tournaments (Android app started)

**Why:** Build a comprehensive prototype to demonstrate the full product vision to investors / stakeholders.

## File Locations

- **Vendor prototype (single-file HTML):** `/Users/fahadimdad/Documents/Fahad-Nexus-Openclaw/04-workspace/sportster-vendor/index.html`
- **Android app (Kotlin):** `/Users/fahadimdad/Documents/Fahad-Nexus-Openclaw/04-workspace/sportster-android/`
- **Git repo:** `Fahad-Nexus-Openclaw` — main branch, all pushed

## Vendor Prototype — Technical Architecture

Single HTML file (~8,600 lines). Key patterns:

- **`.col` + `.phone` + `.screen.active`** — each screen is its own phone column in a horizontal flow
- **`data-go="sXX"` navigation** — global click listener calls `go(id)` to switch screens
- **`data-back` pattern** — back buttons, handled globally
- **Bottom nav** — 5 items: Home / Schedule / Bookings / Arenas / Profile (Home active for tournament screens)
- **`.bs-bg` bottom sheets** — `position:absolute; inset:0; background:rgba(0,0,0,.5); z-index:10` — parent `.screen.active` needs `position:relative`
- **Script location** — `<script>` block is at ~line 4075, wrapped in `document.addEventListener('DOMContentLoaded', ...)`. All interactive JS goes inside that wrapper, before the closing `})();` + `</script>`
- **Screen IDs are sequential** — last screen is s49, next new screen would be s50

## Color System

| Use | Value |
|-----|-------|
| Dark primary | `#09210E` |
| Medium green | `#2A7A38` |
| Accent green | `#70D880` |
| Light BG | `#E8F5E0` / `#F4F7F2` |
| Surface white | `#fff` |
| Orange pending | `#E65100`, `#FFE0B2`, `#FFF3E0` |
| Header gradient | `linear-gradient(150deg,#09210E 0%,#0F2E14 55%,#163F1E 100%)` |

## All Screens Built (s1–s49)

**Core screens (s1–s16):** Home, Profile, Schedule (calendar), Bookings hub, individual booking screens, arena listing, arena detail.

**Tournament flow (s38–s49) — all fully built:**
| Screen | Name | Key Features |
|--------|------|-------------|
| s38 | Tournament Hub | All tournaments list, filter tabs (All/Active/Upcoming/Completed), 3-stat header |
| s39 | Tournament Dashboard | Hero banner with gradient, stats strip (Teams/Pending/Played/Days Left), quick actions grid, recent activity feed, key dates timeline |
| s40 | Bracket View | Mini visual bracket (dark scrollable strip, 8 teams), interactive round tabs QF/SF/Final |
| s41 | Registrations Hub | Filter tabs All/Pending/Approved/Rejected; pending cards with Reject/💬 Chat/Approve buttons |
| s42 | Registration Detail | Orange hero, captain card with chat icon, 6-player roster, payment screenshot card, action bar (Reject/Chat/Approve) |
| s43 | Match Center | 3-stat strip, round chips, match list all rounds (completed/needs-update/upcoming states) |
| s44 | Match Detail | Full VS layout (team emoji boxes), match info grid, team lineups, "Post Match Result" → s45 |
| s45 | Post Match Result | Winner select (radio animation), Man of Match input, Key Moments add/remove, Narrative textarea, submit confirmation |
| s46 | Announcements | Audience selector (All/Approved/Pending), quick templates, live-insert feed of past announcements |
| s47 | Tournament Settings | Name/dates/fees fields, status toggle (Active/Paused/Ended), visibility toggle, prize pool, danger zone (Cancel/Delete) |
| s48 | Chat with Captain | WhatsApp-style bubbles (dark sent / white received), quick-reply chips, send button + Enter key, context banner |
| s49 | Public Preview | Full banner (gradient + sport emoji + name), status strip, stats grid, About/Entry/Prize Pool/Teams grid/Schedule, sticky Register CTA |

**Navigation wiring from s39 dashboard:**
- Settings icon → s47
- Preview icon → s49
- Registrations card → s41
- Bracket card → s40
- Match Center card → s43
- Announce card → s46
- Public Preview card → s49
- Chat buttons (s41, s42) → s48
- s44 "Post Result" → s45

**Home screen (s1) has a full-width Tournaments card → s38**

## Interactive JS Already Working

- s40: bracket round tabs (QF/SF/Final)
- s41: registration filter tabs
- s45: winner radio selection, key moment add/remove, submit flash
- s46: audience toggle, template inject, live announcement post
- s47: status toggle, visibility toggle, save/cancel/delete confirmations
- s48: chat send (click + Enter key), quick replies

## What Is NOT Done Yet (Future Work)

1. **Score system per sport** — no score values yet; each sport needs its own scoring format (cricket overs, basketball quarters, football halves, etc.). Deferred intentionally.
2. **s42 approve/reject interactivity** — buttons exist but no JS to flip state
3. **s43 round chip filter** — round chips exist but not wired to filter match list
4. **Create Tournament flow** — s7 (create tournament form) exists but may need polish
5. **Android app** — basic screens built (activity_arena_detail, activity_arena_booking, fragment_arenas, item_arena_card); needs tournament screens added
6. **Player-side tournament screens** — registration form, team roster entry, payment upload

## How to Add a New Screen

```html
<!-- SCREEN XX — NAME -->
<div class="col" id="sXX">
  <div class="page-label">XX · Name</div>
  <div class="phone">
    <div class="status-bar"><span>9:41</span><span>●●● 100%</span></div>
    <div class="screen active" style="display:flex;flex-direction:column;background:#F4F7F2;">
      <!-- content -->
      <div class="bottom-nav">
        <div class="nav-item active"><i class="ri-home-5-line ni"></i>Home</div>
        <div class="nav-item"><i class="ri-calendar-2-line ni"></i>Schedule</div>
        <div class="nav-item"><i class="ri-inbox-line ni"></i>Bookings</div>
        <div class="nav-item"><i class="ri-building-4-line ni"></i>Arenas</div>
        <div class="nav-item"><i class="ri-user-3-line ni"></i>Profile</div>
      </div>
    </div>
  </div>
</div>
```
Insert before the `</div><!-- #flow-row -->` line near the end of the file.

For interactive JS: add an IIFE `(function() { var el = document.getElementById('sXX'); if (!el) return; ... })();` inside the DOMContentLoaded block, before the closing `})();` at line ~5343.
