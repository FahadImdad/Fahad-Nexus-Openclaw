#!/usr/bin/env python3
from weasyprint import HTML
import os

DIR = os.path.dirname(os.path.abspath(__file__))

INVOICE_NO   = "10245"
DATE         = "25 April 2026"
TIME         = "06:00 PM"
DOCTOR       = "Dr. Saim Siddiqui"
PATIENT_NAME = "Muhammad Fahad Imdad"
MR_NO        = "12276"
AGE_GENDER   = "22 Yrs / Male"
CONTACT      = "03147800991"
REF_DOCTOR   = "Dr. Saim Siddiqui"

PROCEDURES = [
    ("Orthodontic Realignment (Class III Correction)", "1", "80,000", "80,000/-"),
    ("Orthodontic Appliances & MBT Brackets",         "1", "38,450", "38,450/-"),
]

SUBTOTAL = "PKR 118,450/-"
DISCOUNT = "Nil"
TOTAL    = "PKR 118,450/-"

BLANK_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

sig_path = os.path.join(DIR, 'sig_b64.txt')
cam_path = os.path.join(DIR, 'camscan_b64.txt')
sig_src = open(sig_path).read().strip() if os.path.exists(sig_path) else BLANK_PNG
cam_src = open(cam_path).read().strip() if os.path.exists(cam_path) else BLANK_PNG

rows = ""
for i, (proc, qty, unit, total) in enumerate(PROCEDURES, 1):
    bg = "background:#f9f9f9;" if i % 2 == 0 else ""
    rows += f'<tr style="{bg}"><td>{i:02d}</td><td>{proc}</td><td class="r">{qty}</td><td class="r">{unit}</td><td class="r">{total}</td></tr>'

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @page {{
    size: 400px 820px;
    margin: 0;
  }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: 'Courier New', Courier, monospace;
    background: #d8d8d8;
    padding: 20px 18px;
    color: #111;
    font-size: 12px;
  }}
  .receipt {{
    background: #ffffff;
    width: 100%;
    padding: 24px 22px 28px 22px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }}

  /* Header */
  .center {{ text-align: center; }}
  .clinic-name {{
    font-size: 14px; font-weight: bold;
    letter-spacing: 1px; text-transform: uppercase;
    margin-bottom: 3px;
  }}
  .clinic-sub {{ font-size: 9.5px; margin-bottom: 2px; color: #333; }}

  /* Dividers */
  .divider-solid {{ border: none; border-top: 1.5px solid #222; margin: 8px 0; }}
  .divider-dash  {{ border: none; border-top: 1px dashed #777; margin: 6px 0; }}

  /* Invoice title */
  .invoice-title {{
    text-align: center; font-weight: bold;
    font-size: 13px; letter-spacing: 2px;
    margin: 5px 0;
  }}

  /* Key-value rows */
  .kv {{
    display: flex; justify-content: space-between;
    margin: 3px 0; font-size: 11px;
  }}
  .kv .lbl {{ color: #777; }}
  .kv .val {{ text-align: right; }}

  /* Section heading */
  .section-head {{
    font-size: 11px; font-weight: bold;
    text-transform: uppercase; letter-spacing: 0.5px;
    margin: 7px 0 3px;
  }}

  /* Treatment table */
  table {{
    width: 100%; border-collapse: collapse;
    font-size: 11px; margin: 4px 0;
    table-layout: fixed;
  }}
  col.c-num  {{ width: 26px; }}
  col.c-proc {{ width: auto; }}
  col.c-qty  {{ width: 32px; }}
  col.c-unit {{ width: 62px; }}
  col.c-tot  {{ width: 68px; }}

  thead th {{
    border-bottom: 1.5px solid #222;
    padding: 4px 3px; font-size: 11px;
    font-weight: bold; text-align: left;
  }}
  thead th.r {{ text-align: right; }}

  tbody td {{
    padding: 6px 3px;
    border-bottom: 1px solid #ddd;
    vertical-align: middle;
  }}
  tbody td.r {{ text-align: right; white-space: nowrap; }}

  /* Totals */
  .totals {{ margin: 4px 0; }}
  .total-row {{
    display: flex; justify-content: space-between;
    font-size: 11px; padding: 3px 0; color: #666;
  }}
  .total-row.grand {{
    font-weight: bold; font-size: 13px;
    color: #000; padding-top: 5px;
  }}

  /* Signature */
  .sig-area {{
    margin-top: 20px;
    display: flex; justify-content: flex-end;
  }}
  .sig-block {{ text-align: center; }}
  .sig-img {{
    height: 38px; max-width: 160px;
    object-fit: contain; display: block;
    margin-bottom: 3px;
  }}
  .sig-name {{ font-size: 10.5px; }}

  /* CamScanner */
  .camscan {{
    display: flex; justify-content: flex-start;
    margin-top: 14px;
  }}
  .camscan img {{ height: 24px; width: auto; opacity: 0.75; }}
</style>
</head>
<body>
<div class="receipt">

  <div class="center">
    <div class="clinic-name">The Dental Arts Studio</div>
    <div class="clinic-sub">— General &amp; Cosmetic Dentistry —</div>
    <div class="clinic-sub">Sector 15A/1, Sadaf CHS, Gulzar-e-Hijri, Scheme 33, Karachi</div>
    <div class="clinic-sub">Tel: +92 321 2163691</div>
  </div>

  <hr class="divider-solid">
  <div class="invoice-title">MEDICAL INVOICE</div>
  <hr class="divider-dash">

  <div class="kv"><span class="lbl">Invoice No.</span><span class="val">{INVOICE_NO}</span></div>
  <div class="kv"><span class="lbl">Date</span><span class="val">{DATE}</span></div>
  <div class="kv"><span class="lbl">Time</span><span class="val">{TIME}</span></div>
  <div class="kv"><span class="lbl">Issued By</span><span class="val">{DOCTOR}</span></div>

  <hr class="divider-dash">
  <div class="section-head">Patient Details</div>

  <div class="kv"><span class="lbl">Name</span><span class="val">{PATIENT_NAME}</span></div>
  <div class="kv"><span class="lbl" style="color:#aaa">MR #</span><span class="val" style="color:#aaa">{MR_NO}</span></div>
  <div class="kv"><span class="lbl">Age / Gender</span><span class="val">{AGE_GENDER}</span></div>
  <div class="kv"><span class="lbl" style="color:#aaa">Contact</span><span class="val" style="color:#aaa">{CONTACT}</span></div>
  <div class="kv"><span class="lbl" style="color:#aaa">Ref. Doctor</span><span class="val" style="color:#aaa">{REF_DOCTOR}</span></div>

  <hr class="divider-dash">
  <div class="section-head">Treatment</div>

  <table>
    <colgroup>
      <col class="c-num"><col class="c-proc">
      <col class="c-qty"><col class="c-unit"><col class="c-tot">
    </colgroup>
    <thead>
      <tr>
        <th>#</th><th>Procedure</th>
        <th class="r">Qty</th><th class="r">Unit</th><th class="r">Total</th>
      </tr>
    </thead>
    <tbody>{rows}</tbody>
  </table>

  <hr class="divider-dash">

  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>{SUBTOTAL}</span></div>
    <div class="total-row"><span>Discount</span><span>{DISCOUNT}</span></div>
  </div>
  <hr class="divider-solid">
  <div class="total-row grand"><span>TOTAL PAYABLE</span><span>{TOTAL}</span></div>
  <hr class="divider-dash">

  <div class="sig-area">
    <div class="sig-block">
      <img class="sig-img" src="{sig_src}">
      <div class="sig-name">{DOCTOR}</div>
    </div>
  </div>

  <div class="camscan"><img src="{cam_src}"></div>

</div>
</body>
</html>"""

out_html = os.path.join(DIR, 'dental_invoice_10245.html')
out_pdf  = os.path.join(DIR, 'dental_invoice_10245.pdf')

with open(out_html, 'w') as f:
    f.write(html)

HTML(out_html).write_pdf(out_pdf)
print(f"Done! PDF saved to: {out_pdf}")
