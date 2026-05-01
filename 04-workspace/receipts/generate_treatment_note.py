#!/usr/bin/env python3
from weasyprint import HTML
import os, base64

DIR = os.path.dirname(os.path.abspath(__file__))

logo_path = os.path.join(DIR, 'logo.png')
if os.path.exists(logo_path):
    with open(logo_path, 'rb') as f:
        logo_b64 = base64.b64encode(f.read()).decode()
    logo_html = f'<img src="data:image/png;base64,{logo_b64}" class="logo-img">'
else:
    logo_html = '<div class="logo-placeholder">LOGO</div>'

sig_path = os.path.join(DIR, 'sig_b64.txt')
sig_src = open(sig_path).read().strip() if os.path.exists(sig_path) else ''
sig_html = f'<img src="{sig_src}" class="sig-img">' if sig_src else ''

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @page {{
    size: A4;
    margin: 14mm 14mm 12mm 14mm;
  }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    color: #111;
    background: #fff;
  }}

  /* ── HEADER ── */
  .header {{
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 8px;
    margin-bottom: 0;
  }}
  .logo-img {{
    height: 72px;
    width: auto;
  }}
  .logo-placeholder {{
    width: 72px; height: 72px;
    border: 1.5px dashed #bbb;
    display: flex; align-items: center; justify-content: center;
    font-size: 8px; color: #bbb;
    flex-shrink: 0;
  }}
  .header-text {{ flex: 1; }}
  .clinic-name {{
    font-size: 17px;
    font-weight: 900;
    color: #1a1a1a;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    line-height: 1.1;
  }}
  .clinic-tagline {{
    font-size: 9.5px;
    color: #666;
    font-style: italic;
    margin: 2px 0 6px;
  }}
  .clinic-contact {{
    font-size: 8.5px;
    color: #444;
    line-height: 1.8;
    border-left: 2.5px solid #222;
    padding-left: 8px;
  }}

  /* ── TITLE BAR ── */
  .title-bar {{
    background: #1c1c1c;
    color: #fff;
    text-align: center;
    font-size: 11px;
    font-weight: bold;
    letter-spacing: 3px;
    padding: 5px 0 4px;
    margin: 7px 0 7px;
    text-transform: uppercase;
  }}

  /* ── PATIENT INFO ── */
  .patient-section {{
    border: 1px solid #bbb;
    margin-bottom: 6px;
  }}
  .patient-section-title {{
    background: #f0f0f0;
    border-bottom: 1px solid #bbb;
    padding: 3px 8px;
    font-size: 8px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #333;
  }}
  .patient-row {{
    display: flex;
    border-bottom: 1px solid #ddd;
  }}
  .patient-row:last-child {{ border-bottom: none; }}
  .pfield {{
    flex: 1;
    padding: 4px 8px 5px;
    border-right: 1px solid #ddd;
  }}
  .pfield:last-child {{ border-right: none; }}
  .pfield.wide {{ flex: 2; }}
  .pfield label {{
    display: block;
    font-size: 7.5px;
    color: #888;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 4px;
  }}
  .write-line {{
    border-bottom: 1px solid #444;
    height: 13px;
  }}

  /* ── CLINICAL SECTIONS ── */
  .section {{
    border: 1px solid #bbb;
    margin-bottom: 5px;
  }}
  .section-title {{
    background: #f0f0f0;
    border-bottom: 1px solid #bbb;
    padding: 3px 8px;
    font-size: 8px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 5px;
  }}
  .section-title .tag {{
    background: #1c1c1c;
    color: #fff;
    font-size: 7px;
    padding: 1px 5px;
    letter-spacing: 0.5px;
  }}
  .section-body {{
    padding: 5px 8px 4px;
  }}
  .wline {{
    border-bottom: 1px solid #ccc;
    height: 16px;
    margin-bottom: 4px;
  }}
  .wline:last-child {{ margin-bottom: 0; }}

  /* ── FINANCIAL ── */
  .fin-grid {{
    display: flex;
    gap: 0;
  }}
  .fin-cell {{
    flex: 1;
    padding: 5px 8px 6px;
    border-right: 1px solid #ddd;
  }}
  .fin-cell:last-child {{ border-right: none; }}
  .fin-cell label {{
    display: block;
    font-size: 7.5px;
    color: #888;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 4px;
  }}

  .status-row {{
    padding: 5px 8px 6px;
    border-top: 1px solid #ddd;
    display: flex;
    align-items: center;
    gap: 20px;
  }}
  .status-row label {{
    font-size: 8px;
    font-weight: bold;
    color: #333;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-right: 4px;
  }}
  .cb {{ display: flex; align-items: center; gap: 4px; font-size: 8.5px; color: #222; }}
  .cb-box {{
    width: 11px; height: 11px;
    border: 1.5px solid #444;
    flex-shrink: 0;
  }}

  /* ── FOOTER / SIGNATURE ── */
  .footer {{
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px dashed #aaa;
  }}
  .footer-note {{
    font-size: 7.5px;
    color: #999;
    line-height: 1.6;
  }}
  .sig-block {{ text-align: center; }}
  .sig-img {{
    height: 42px; max-width: 160px;
    object-fit: contain; display: block;
    margin: 0 auto 0px;
  }}
  .sig-line {{
    border-top: 1.5px solid #222;
    width: 160px;
    margin: 0 auto 3px;
  }}
  .sig-name {{ font-size: 9.5px; font-weight: bold; color: #111; }}
  .sig-title {{ font-size: 7.5px; color: #666; margin-top: 1px; }}
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  {logo_html}
  <div class="header-text">
    <div class="clinic-name">The Dental Arts Studio</div>
    <div class="clinic-tagline">General &amp; Cosmetic Dentistry</div>
    <div class="clinic-contact">
      <b>Address:</b> Sector 15A/1, Sadaf CHS, Gulzar-e-Hijri, Scheme 33, Karachi<br>
      <b>Doctor:</b> Dr. Saim Siddiqui &nbsp;|&nbsp; <b>Mob:</b> +92 321 2163691<br>
      <b>Email:</b> saim.siddiqui1994@gmail.com
    </div>
  </div>
</div>

<!-- TITLE -->
<div class="title-bar">Clinical Treatment Note</div>

<!-- PATIENT INFO -->
<div class="patient-section">
  <div class="patient-section-title">Patient Information</div>
  <div class="patient-row">
    <div class="pfield wide">
      <label>Patient Name</label>
      <div class="write-line"></div>
    </div>
    <div class="pfield">
      <label>MR #</label>
      <div class="write-line"></div>
    </div>
    <div class="pfield">
      <label>Date</label>
      <div class="write-line"></div>
    </div>
  </div>
  <div class="patient-row">
    <div class="pfield">
      <label>Age / Gender</label>
      <div class="write-line"></div>
    </div>
    <div class="pfield">
      <label>Contact No.</label>
      <div class="write-line"></div>
    </div>
    <div class="pfield wide">
      <label>Referred By</label>
      <div class="write-line"></div>
    </div>
  </div>
</div>

<!-- CHIEF COMPLAINT -->
<div class="section">
  <div class="section-title">
    <span class="tag">C/O</span> Chief Complaint
  </div>
  <div class="section-body">
    <div class="wline"></div>
    <div class="wline"></div>
    <div class="wline"></div>
  </div>
</div>

<!-- DIAGNOSIS -->
<div class="section">
  <div class="section-title">
    <span class="tag">DX</span> Diagnosis
  </div>
  <div class="section-body">
    <div class="wline"></div>
    <div class="wline"></div>
    <div class="wline"></div>
  </div>
</div>

<!-- TREATMENT RENDERED -->
<div class="section">
  <div class="section-title">
    <span class="tag">TX</span> Treatment Rendered
  </div>
  <div class="section-body">
    <div class="wline"></div>
    <div class="wline"></div>
    <div class="wline"></div>
    <div class="wline"></div>
    <div class="wline"></div>
  </div>
</div>

<!-- ADVICE / PLAN -->
<div class="section">
  <div class="section-title">
    <span class="tag">RX</span> Advice &amp; Next Visit Plan
  </div>
  <div class="section-body">
    <div class="wline"></div>
    <div class="wline"></div>
    <div class="wline"></div>
  </div>
</div>

<!-- FINANCIAL SUMMARY -->
<div class="section">
  <div class="section-title">Financial Summary</div>
  <div class="fin-grid">
    <div class="fin-cell">
      <label>Total Amount (PKR)</label>
      <div class="write-line"></div>
    </div>
    <div class="fin-cell">
      <label>Amount Paid (PKR)</label>
      <div class="write-line"></div>
    </div>
    <div class="fin-cell">
      <label>Balance Due (PKR)</label>
      <div class="write-line"></div>
    </div>
  </div>
  <div class="status-row">
    <label>Status:</label>
    <div class="cb"><div class="cb-box"></div> Paid in Full</div>
    <div class="cb"><div class="cb-box"></div> Partial Payment</div>
    <div class="cb"><div class="cb-box"></div> Balance Remaining</div>
    <div class="cb"><div class="cb-box"></div> Complimentary</div>
  </div>
</div>

<!-- FOOTER -->
<div class="footer">
  <div class="footer-note">
    The Dental Arts Studio &nbsp;|&nbsp; Confidential Medical Record<br>
    Sector 15A/1, Sadaf CHS, Gulzar-e-Hijri, Scheme 33, Karachi
  </div>
  <div class="sig-block">
    {sig_html}
    <div class="sig-line"></div>
    <div class="sig-name">Dr. Saim Siddiqui</div>
  </div>
</div>

</body>
</html>"""

out_html = os.path.join(DIR, 'treatment_note.html')
out_pdf  = os.path.join(DIR, 'treatment_note.pdf')

with open(out_html, 'w') as f:
    f.write(html)

HTML(out_html).write_pdf(out_pdf)
print(f"Done! PDF saved to: {out_pdf}")
