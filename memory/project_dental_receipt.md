---
name: Dental Receipt & Treatment Note Project
description: All context for The Dental Arts Studio receipt and treatment note PDF generation work
type: project
originSessionId: cc8233fc-cd3f-49d8-b0f6-3c588c9e3fbc
---
## Active Scripts

| Script | Output | Purpose |
|--------|--------|---------|
| `04-workspace/receipts/generate_receipt_10245.py` | `dental_invoice_10245.pdf` | Medical invoice PDF |
| `04-workspace/receipts/generate_treatment_note.py` | `treatment_note.pdf` | Clinical treatment note (A4) |

## How to Run

Always prefix with `DYLD_LIBRARY_PATH=/opt/homebrew/lib` — WeasyPrint needs Homebrew's Pango:

```bash
cd /Users/fahadimdad/Documents/Fahad-Nexus-Openclaw/04-workspace/receipts
DYLD_LIBRARY_PATH=/opt/homebrew/lib python3 generate_receipt_10245.py
DYLD_LIBRARY_PATH=/opt/homebrew/lib python3 generate_treatment_note.py
```

## Asset Files (all in `04-workspace/receipts/`)

| File | Contents |
|------|----------|
| `sig_b64.txt` | Dr. Saim Siddiqui cursive signature as base64 data URI (extracted from original repo HTML) |
| `camscan_b64.txt` | CamScanner logo as base64 data URI |
| `logo.png` | The Dental Arts Studio logo (camera + swirl design, saved from clipboard) |

## Current Invoice Details (Invoice 10245)

- **Invoice No:** 10245
- **Date:** 25 April 2026
- **Time:** 06:00 PM
- **Doctor / Issued By:** Dr. Saim Siddiqui
- **Patient:** Muhammad Fahad Imdad | MR #: 12276 | 22 Yrs / Male
- **Contact:** 03147800991
- **Procedures:**
  1. Orthodontic Realignment (Class III Correction) — Qty: 1, Unit: 80,000, Total: 80,000/-
  2. Orthodontic Appliances & MBT Brackets — Qty: 1, Unit: 38,450, Total: 38,450/-
- **Subtotal:** PKR 118,450/- | **Discount:** Nil | **Total:** PKR 118,450/-

## Clinic Details

- **Name:** The Dental Arts Studio
- **Tagline:** General & Cosmetic Dentistry
- **Address:** Sector 15A/1, Sadaf CHS, Gulzar-e-Hijri, Scheme 33, Karachi
- **Tel:** +92 321 2163691
- **Email:** saim.siddiqui1994@gmail.com

## Receipt PDF Design Decisions

- Page size: `400px wide × 820px tall` (receipt slip size, not A4)
- Gray background (`#d8d8d8`) with white receipt card + shadow
- Monospace font: Courier New
- Table uses `table-layout: fixed` with explicit col widths to prevent Unit/Total merging
- Signature + CamScanner embedded at bottom

## Treatment Note Design Decisions

- Page size: A4, margins 14mm
- Font: Arial
- Sections with dark tag labels: C/O, DX, TX, RX
- Patient info grid with bordered cells
- Financial summary with 3 columns + status checkboxes
- Logo embedded from `logo.png`, signature from `sig_b64.txt`
- No "BDS — General & Cosmetic Dentistry" under signature (user removed it)

## Original Script Source

https://github.com/FahadImdad/Openclaw-memory-1/blob/main/generate_receipt.py

**Why:** Contains the original HTML/CSS receipt template. Signature and CamScanner images were extracted from `dental_invoice.html` in the same repo (not stored as separate files in repo).
