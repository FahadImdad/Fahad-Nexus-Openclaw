// Shared SMS sender. Texts the business owner their new lead the instant a
// call ends. Dormant until Twilio env vars are set (safe no-op otherwise):
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
// Returns { sent, status } and never throws — a failed text must never break
// the call-ingest write.

export function leadText(client, row) {
  const name = row.caller_name || "New caller";
  const phone = row.caller_phone || "no number given";
  const issue = row.issue || "wants a callback";
  const addr = row.caller_address ? ` · ${row.caller_address}` : "";
  const flag = row.urgency === "emergency" ? "🚨 EMERGENCY " : "";
  const biz = client?.business_name ? ` (${client.business_name})` : "";
  return `${flag}New lead${biz}: ${name}, ${issue}${addr}. Callback: ${phone}. — Answup`;
}

export async function sendLeadSMS(client, row) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = client?.lead_sms || client?.phone;

  if (!sid || !token || !from) return { sent: false, status: "twilio-not-configured" };
  if (!to) return { sent: false, status: "no-destination-number" };

  const body = leadText(client, row);
  try {
    const params = new URLSearchParams({ To: to, From: from, Body: body });
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const out = await r.json().catch(() => ({}));
    return { sent: r.ok, status: r.ok ? out.sid || "sent" : out.message || "twilio-error", body, to };
  } catch (e) {
    return { sent: false, status: String(e.message || e) };
  }
}
