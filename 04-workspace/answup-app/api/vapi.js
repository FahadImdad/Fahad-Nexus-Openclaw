// Vapi end-of-call webhook → writes REAL calls into Supabase.
// Point each Vapi assistant's "Server URL" at: https://answup.com/api/vapi
// Required Vercel env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Optional: VAPI_WEBHOOK_SECRET (set the same value in Vapi server settings),
//           DEFAULT_CLIENT_ID (fallback client for the demo assistant)
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  // Optional shared-secret check
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (secret && req.headers["x-vapi-secret"] !== secret) {
    return res.status(401).json({ error: "bad secret" });
  }

  const msg = req.body?.message;
  if (!msg || msg.type !== "end-of-call-report") {
    return res.status(200).json({ ok: true, ignored: msg?.type || "no message" });
  }

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Which client does this assistant belong to?
    const meta = msg.assistant?.metadata || msg.call?.assistantOverrides?.metadata || {};
    const clientId = meta.clientId || meta.client_id || process.env.DEFAULT_CLIENT_ID;
    if (!clientId) return res.status(200).json({ ok: false, reason: "no clientId metadata on assistant" });

    // Structured data captured by the agent's analysis plan
    const sd = msg.analysis?.structuredData || {};
    const summary = msg.analysis?.summary || msg.summary || null;

    // Transcript → [{who, t}]
    const rawMsgs = msg.artifact?.messages || msg.messages || [];
    const transcript = rawMsgs
      .filter((m) => ["assistant", "bot", "user", "customer"].includes(m.role) && (m.message || m.content))
      .map((m) => ({ who: ["user", "customer"].includes(m.role) ? "user" : "ai", t: m.message || m.content }));

    const isEmergency = /emergen|urgent|leak|no heat|no ac|flood|gas/i.test(
      `${sd.urgency || ""} ${sd.issue || ""} ${summary || ""}`
    );
    const phone = sd.phone || sd.phone_number || sd.callback_number || msg.call?.customer?.number || null;

    // Simple lead score
    let score = 40;
    if (phone) score += 30;
    if (sd.address || sd.service_address) score += 15;
    if (sd.name || sd.customer_name) score += 5;
    if (isEmergency) score += 9;

    const row = {
      client_id: clientId,
      caller_name: sd.name || sd.customer_name || null,
      caller_phone: phone,
      caller_address: sd.address || sd.service_address || null,
      issue: sd.issue || sd.problem || sd.reason || null,
      trade: sd.trade || null,
      urgency: isEmergency ? "emergency" : phone ? "new_lead" : "normal",
      summary,
      transcript,
      recording_url: msg.artifact?.recordingUrl || msg.recordingUrl || null,
      duration_seconds: Math.round(msg.durationSeconds || msg.call?.durationSeconds || 0),
      score: Math.min(99, score),
      vapi_call_id: msg.call?.id || null,
    };

    const { error } = await supabase.from("calls").upsert(row, { onConflict: "vapi_call_id" });
    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("vapi webhook error", e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}
