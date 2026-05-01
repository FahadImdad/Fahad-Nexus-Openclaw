---
name: Author Email Outreach Project
description: Scraping 1,609 Amazon KDP author emails + websites for publisher outreach client (Suleman Mughal)
type: project
originSessionId: 65bab4ba-1313-404c-8b0c-94ac2681801c
---
## What This Is
Client project for Suleman Mughal. A Google Sheet with 1,609 self-published Amazon KDP authors needs:
- Author website found and verified (book title must appear on site)
- Author email found from website OR social media
- Color coding: 🟢 Green=email+website, 🟡 Yellow=contact form+website, 🟠 Orange=website no email, 🔴 Red=nothing

## Google Sheet
- **Sheet ID:** `1VZbFJzvA2W7zoFciB4-IBVgq_Fny2NRwUUnayV9QdCE`
- **Service account:** `/tmp/service_account.json`
- **Columns:** A=Amazon URL, B=ASIN, C=Book Title (col 4), D=Author (col 5), E=Email (col 6), F=Website (col 7)

## Current Sheet State (as of this session)
| Color | Count | Meaning |
|-------|-------|---------|
| 🟢 Green | ~45 | Confirmed email + live website |
| 🟡 Yellow | ~29 | Contact form + website |
| 🟠 Orange | ~22 | Live website, no email found |
| 🔴 Red | ~1,513 | No website / dead site |

**Why:** 275 orange-row sites were already dead/expired, cleared to red. 15 more green/yellow dead sites cleared in full correction pass.

## Scripts Written (all in /tmp/)
- **`strict_verify.py`** — Curl-based verify all rows: author name + book phrase on site. Cleared 214 rows.
- **`fix_dedup_verify.py`** — Dedup by (normalized_book, author_last) + book verify. Removed 7 duplicate rows.
- **`repass_all.py`** — Curl scrape all orange/yellow rows for emails. Found ~few emails.
- **`full_search_pass.py`** — DDG search all rows without email. Found only 1 email.
- **`clear_dead_sites.py`** — Check all orange rows for dead sites. Cleared 275 dead sites → red.
- **`full_correct.py`** — Full sheet correction: check ALL websites (green/yellow/orange), clear dead ones + emails, fill blanks, recolor. KEY SCRIPT for cleanup.
- **`pw_worker2.py`** — Playwright worker (strict phrase book verification). Used in coordinator.
- **`fb_search2.py`** — **CURRENT ACTIVE SCRIPT** — Facebook/social search for all 1,563 rows without email.

## Currently Running: fb_search2.py
- **PID:** 46005 (coordinator) + workers 46014-46018
- **Status:** Running, ~65 min elapsed at save time
- **Emails found so far:** 2
  - Row 26: Chuck Waldron → chuck@chuckwaldron.com (facebook.com/chuckwaldronauthor)
  - Row 30: Tom Miller → tmillerauthor@gmail.com (facebook.com/tommillerauthor)
- **Output:** `/tmp/fb2_output.txt`, worker logs `/tmp/fb2_worker_{0-4}.log`
- **Results JSON:** `/tmp/fb2_out_{0-4}.json`
- **Chunk files:** `/tmp/fb2_chunk_{0-4}.json`

## How fb_search2.py Works
1. For each row without email: searches DDG for `site:facebook.com "[author]" "[book]"`
2. Also tries direct URL patterns: `facebook.com/firstnamelastname`, `facebook.com/authorfirstlast` etc.
3. Loads Facebook pages with Playwright (fresh page per URL, no nav interruption errors)
4. Checks author name is on the page
5. Extracts email if found (name must match local part)
6. Writes to sheet in batches when workers complete

## Key Rules for Email Verification
- Author name OR last name must appear on the website/social page
- Book title phrase (3+ consecutive words) must appear on the website
- Email tiers: t1=site domain+name match, t2=free email+name match, t3=generic site email
- NO tier4 (removed to prevent false positives like chriscanread@aol.com)
- Social media: ONLY if social link found on confirmed website (website has book title)
- Exception: for Facebook search, just need author name on the Facebook page

## What Was Tried That Didn't Work
- Playwright on orange rows with book_ok phrase check → 0 emails (sites were dead)
- Broad DDG web search → 0 emails in 262s/50 rows, too slow
- social_from_site.py → 0 emails (Instagram/LinkedIn block without login, most FB pages no email)
- Filelock across 5 workers → workers 1-4 all timed out immediately (filelock timeout=30 too short)

## BrightData Offer
User offered BrightData residential proxies if needed. Format to use:
```
BRDPROXY=http://user:pass@host:port python3 fb_search2.py
```
Or pass as 5th arg to worker subprocess.

## Client Context
- Client: Suleman Mughal
- Has Google CSE API with $25 credit (not used yet, save for if Facebook search doesn't find enough)
- User confirmed: Janine Roy's email janineroymomentum@gmail.com found on her Facebook business page

## Why: Email Finding is Hard
Self-published KDP authors typically:
- Don't build personal websites
- Don't list email publicly anywhere
- Only contactable via Amazon contact author button or social media DMs
- ~5-8% have publicly findable emails (industry norm)

**How to apply:** When continuing this work, check `/tmp/fb2_output.txt` first to see if the run completed. If done, collect results from `/tmp/fb2_out_*.json` and write to sheet. Then consider Google CSE API for remaining rows.
