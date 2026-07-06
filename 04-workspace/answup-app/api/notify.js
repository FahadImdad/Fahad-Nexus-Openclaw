// POST /api/notify — receives DB events (new signup, client message, new call)
// from Supabase triggers and emails the admin via Resend. Until RESEND_API_KEY
// is configured in Vercel, it acknowledges and does nothing (safe no-op).
// The shared secret is validated AGAINST the database (check_notify_secret RPC),
// so the minted value never leaves Supabase.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tfuszoexspoqcowawidm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_kA9yaJIzCtwRiE9YlkA65g_4TobJAqs";
const ADMIN_EMAIL = "fahadimdad966@gmail.com";
const FROM = "Answup <onboarding@resend.dev>"; // works out of the box; switch to alerts@answup.com after domain verify

const subjectFor = (event, row) => {
  if (event === "new_signup") return `🟢 New Answup signup: ${row.business_name || row.email || "unknown"}`;
  if (event === "client_message") return `💬 Client message on Answup`;
  if (event === "new_call") return `📞 New call captured${row.urgency === "emergency" ? " (EMERGENCY)" : ""}`;
  return `Answup event: ${event}`;
};

const bodyFor = (event, row) => {
  if (event === "new_signup")
    return `New client signed up and was auto-accepted.\n\nBusiness: ${row.business_name || "?"}\nTrade: ${row.trade || "?"}\nCity: ${row.city || "?"}, ${row.state || ""}\nPlan: ${row.plan || "?"}\nEmail: ${row.email || "?"}\n\nTheir AI is being auto-built. Open answup.com/admin to see the next step.`;
  if (event === "client_message")
    return `A client wrote in their dashboard chat:\n\n"${row.body}"\n\nReply in answup.com/admin → Inbox. Speed = service quality.`;
  if (event === "new_call")
    return `A call just landed.\n\nCaller: ${row.caller_name || "?"} · ${row.caller_phone || "no number"}\nIssue: ${row.issue || "?"}\nUrgency: ${row.urgency || "normal"}\nSummary: ${row.summary || "-"}\n\nFull transcript on answup.com/admin → All Calls.`;
  return JSON.stringify(row, null, 2);
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { secret, event, row } = req.body || {};
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: valid } = await supabase.rpc("check_notify_secret", { s: secret || "" });
  if (!valid) return res.status(401).json({ error: "bad secret" });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(200).json({ ok: true, skipped: "RESEND_API_KEY not set" });

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [ADMIN_EMAIL],
        subject: subjectFor(event, row || {}),
        text: bodyFor(event, row || {}),
      }),
    });
    const out = await r.json();
    return res.status(200).json({ ok: r.ok, id: out?.id || null });
  } catch (e) {
    console.error("notify error", e);
    return res.status(200).json({ ok: false, error: String(e.message || e) });
  }
}
